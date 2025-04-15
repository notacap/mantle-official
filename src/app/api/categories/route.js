import { NextResponse } from 'next/server';
import { fetchWithCache } from '@/app/lib/cache';

export const revalidate = 300; // Revalidate this route every 5 minutes

/**
 * GET handler for all product categories
 * @param {Request} request - The incoming request
 * @returns {Promise<NextResponse>} - JSON response with categories
 */
export async function GET(request) {
  try {
    // WooCommerce API URL for product categories
    const apiUrl = new URL('https://mantle-clothing.com/wp-json/wc/v3/products/categories');
    
    // Add parameters
    apiUrl.searchParams.append('per_page', '100');
    apiUrl.searchParams.append('orderby', 'name');
    apiUrl.searchParams.append('order', 'asc');
    
    // Add authentication
    apiUrl.searchParams.append('consumer_key', process.env.WOOCOMMERCE_CONSUMER_KEY);
    apiUrl.searchParams.append('consumer_secret', process.env.WOOCOMMERCE_CONSUMER_SECRET);
    
    // Cache TTL (5 minutes)
    const CACHE_TTL = 5 * 60 * 1000;
    
    // Simplified approach: Just fetch categories with counts from WooCommerce
    const response = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 300 } // Use Next.js built-in cache
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.status}`);
    }
    
    const categories = await response.json();
    
    // Get total categories from headers
    const totalCategories = response.headers.get('X-WP-Total') || 0;
    const totalPages = response.headers.get('X-WP-TotalPages') || 0;
    
    // Return categories with pagination info
    return NextResponse.json({
      categories,
      pagination: {
        total: totalCategories,
        totalPages,
        currentPage: 1,
        perPage: 100
      }
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories', message: error.message },
      { status: 500 }
    );
  }
}

// Simple in-memory cache for category counts
const countCache = new Map();

function getCachedValue(key) {
  if (!countCache.has(key)) return null;
  
  const { value, expiry } = countCache.get(key);
  
  if (expiry < Date.now()) {
    countCache.delete(key);
    return null;
  }
  
  return value;
}

function setCachedValue(key, value, ttl) {
  const expiry = Date.now() + ttl;
  countCache.set(key, { value, expiry });
} 