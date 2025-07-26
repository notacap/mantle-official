import { NextResponse } from 'next/server';

/**
 * Build WooCommerce API URL with authentication
 * @param {string} endpoint - API endpoint path (e.g., 'products', 'categories')
 * @param {Object} params - Query parameters
 * @returns {URL} - Complete API URL with authentication
 */
export function buildWooCommerceUrl(endpoint, params = {}) {
  const baseUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL;
  const apiUrl = new URL(`${baseUrl}/wp-json/wc/v3/${endpoint}`);
  
  // Add query parameters
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      apiUrl.searchParams.append(key, value);
    }
  });
  
  // Add authentication
  apiUrl.searchParams.append('consumer_key', process.env.WOOCOMMERCE_CONSUMER_KEY);
  apiUrl.searchParams.append('consumer_secret', process.env.WOOCOMMERCE_CONSUMER_SECRET);
  
  return apiUrl;
}

/**
 * Fetch data from WooCommerce API with standard error handling
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>} - Fetch response
 */
export async function fetchFromWooCommerce(endpoint, options = {}) {
  const { params = {}, ...fetchOptions } = options;
  const url = buildWooCommerceUrl(endpoint, params);
  
  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    },
    ...fetchOptions,
  });
  
  if (!response.ok) {
    throw new Error(`WooCommerce API error: ${response.status} ${response.statusText}`);
  }
  
  return response;
}

/**
 * Standard error response handler
 * @param {Error} error - Error object
 * @param {string} message - Custom error message
 * @returns {NextResponse} - Error response
 */
export function handleApiError(error, message = 'An error occurred') {
  console.error(message, error);
  
  const status = error.status || 500;
  const errorMessage = error.message || message;
  
  return NextResponse.json(
    { error: errorMessage },
    { status }
  );
}

/**
 * Extract pagination info from response headers
 * @param {Response} response - Fetch response
 * @param {number} perPage - Items per page
 * @returns {Object} - Pagination metadata
 */
export function extractPaginationData(response, perPage = 100) {
  const total = response.headers.get('X-WP-Total') || 0;
  const totalPages = response.headers.get('X-WP-TotalPages') || 0;
  
  return {
    total: parseInt(total),
    totalPages: parseInt(totalPages),
    currentPage: 1,
    perPage
  };
}

/**
 * Validate required parameters
 * @param {Object} params - Parameters to validate
 * @param {string[]} required - Required parameter names
 * @returns {Object|null} - Error response or null if valid
 */
export function validateRequiredParams(params, required) {
  for (const param of required) {
    if (!params[param]) {
      return NextResponse.json(
        { error: `${param} is required` },
        { status: 400 }
      );
    }
  }
  return null;
}