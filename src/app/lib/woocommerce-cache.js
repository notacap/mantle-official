import { NextResponse } from 'next/server';
import { fetchWithCache, getResponseHeaders } from '@/app/lib/cache';
import { sanitizePage, sanitizeLimit, sanitizeOrder, sanitizeOrderBy } from '@/app/lib/sanitization';

const DEFAULT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const DEFAULT_REVALIDATE = 300; // 5 minutes in seconds

/**
 * Creates a WooCommerce API URL with authentication and common parameters
 * @param {string} endpoint - The WooCommerce endpoint path
 * @param {Object} params - Additional query parameters
 * @returns {URL} - Configured API URL
 */
function createWooCommerceUrl(endpoint = 'products', params = {}) {
  const apiUrl = new URL(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wc/v3/${endpoint}`);
  
  // Add authentication
  apiUrl.searchParams.append('consumer_key', process.env.WOOCOMMERCE_CONSUMER_KEY);
  apiUrl.searchParams.append('consumer_secret', process.env.WOOCOMMERCE_CONSUMER_SECRET);
  
  // Add common defaults
  apiUrl.searchParams.append('status', 'publish');
  apiUrl.searchParams.append('stock_status', 'instock');
  
  // Add additional parameters
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      apiUrl.searchParams.append(key, value.toString());
    }
  });
  
  return apiUrl;
}

/**
 * Higher-order function for cached WooCommerce API routes
 * @param {Object} config - Configuration object
 * @param {string} config.endpoint - WooCommerce API endpoint (default: 'products')
 * @param {Object} config.defaultParams - Default query parameters
 * @param {number} config.cacheTtl - Cache TTL in milliseconds
 * @param {number} config.revalidate - Next.js revalidation time in seconds
 * @param {boolean} config.includePagination - Whether to include pagination headers
 * @param {Function} config.transform - Optional data transformation function
 * @param {Function} config.fallback - Optional fallback function if no data found
 * @returns {Function} - API route handler function
 */
export function withWooCommerceCache(config = {}) {
  const {
    endpoint = 'products',
    defaultParams = {},
    cacheTtl = DEFAULT_CACHE_TTL,
    revalidate = DEFAULT_REVALIDATE,
    includePagination = false,
    transform = null,
    fallback = null
  } = config;

  return async function cachedApiHandler(request) {
    try {
      // Extract and sanitize query parameters from request
      const { searchParams } = new URL(request.url);
      const requestParams = { ...defaultParams };
      
      // Sanitize common parameters if they exist in the request
      if (searchParams.has('page')) {
        requestParams.page = sanitizePage(searchParams.get('page'));
      }
      if (searchParams.has('per_page')) {
        requestParams.per_page = sanitizeLimit(searchParams.get('per_page'), defaultParams.per_page || 20, 100);
      }
      if (searchParams.has('order')) {
        requestParams.order = sanitizeOrder(searchParams.get('order'));
      }
      if (searchParams.has('orderby')) {
        requestParams.orderby = sanitizeOrderBy(searchParams.get('orderby'));
      }
      
      // Create API URL with sanitized parameters
      const apiUrl = createWooCommerceUrl(endpoint, requestParams);
      
      // Fetch options
      const fetchOptions = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        next: { revalidate }
      };
      
      // Fetch data with caching
      let data = await fetchWithCache(
        apiUrl.toString(),
        fetchOptions,
        cacheTtl
      );
      
      // Apply transformation if provided
      if (transform && typeof transform === 'function') {
        data = transform(data);
      }
      
      // Handle fallback if no data and fallback function provided
      if ((!data || data.length === 0) && fallback && typeof fallback === 'function') {
        const fallbackData = await fallback(apiUrl, fetchOptions, cacheTtl);
        return NextResponse.json(fallbackData);
      }
      
      // Prepare response data - if data is already transformed, use it directly
      let responseData;
      if (data && typeof data === 'object' && ('products' in data || 'isFeatured' in data)) {
        // Data is already in expected format (from transform function)
        responseData = data;
      } else {
        // Data needs to be wrapped in products key
        responseData = { products: data };
      }
      
      // Add pagination if requested
      if (includePagination) {
        try {
          const headers = await getResponseHeaders(apiUrl.toString());
          responseData.pagination = {
            total: parseInt(headers['x-wp-total']) || 0,
            totalPages: parseInt(headers['x-wp-totalpages']) || 0,
            currentPage: parseInt(requestParams.page) || 1,
            perPage: parseInt(requestParams.per_page) || 10
          };
        } catch (headerError) {
          console.warn('Failed to fetch pagination headers:', headerError);
        }
      }
      
      return NextResponse.json(responseData);
      
    } catch (error) {
      console.error(`Error in WooCommerce API (${endpoint}):`, error);
      return NextResponse.json(
        { 
          error: `Failed to fetch ${endpoint}`,
          message: error.message 
        },
        { status: 500 }
      );
    }
  };
}

/**
 * Creates a fallback function for fetching regular products when featured products are empty
 * @param {Object} config - Configuration for fallback
 * @param {Object} config.params - Parameters for fallback request
 * @param {Function} config.transform - Optional transformation function
 * @returns {Function} - Fallback function
 */
export function createProductFallback(config = {}) {
  const { params = {}, transform = null } = config;
  
  return async function productFallback(originalUrl, fetchOptions, cacheTtl) {
    const fallbackUrl = createWooCommerceUrl('products', params);
    
    let fallbackData = await fetchWithCache(
      fallbackUrl.toString(),
      fetchOptions,
      cacheTtl
    );
    
    // Apply transformation if provided
    if (transform && typeof transform === 'function') {
      fallbackData = transform(fallbackData);
    }
    
    return fallbackData;
  };
}