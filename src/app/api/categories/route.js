import { NextResponse } from 'next/server';
import { fetchWithCache } from '@/app/lib/cache';
import { fetchFromWooCommerce, handleApiError, extractPaginationData } from '@/app/lib/woocommerce-api';

export const revalidate = 300; // Revalidate this route every 5 minutes

/**
 * GET handler for all product categories
 * @param {Request} request - The incoming request
 * @returns {Promise<NextResponse>} - JSON response with categories
 */
export async function GET(request) {
  try {
    const params = {
      per_page: '100',
      orderby: 'name',
      order: 'asc'
    };
    
    // Fetch categories from WooCommerce
    const response = await fetchFromWooCommerce('products/categories', {
      params,
      next: { revalidate: 300 } // Use Next.js built-in cache
    });
    
    const categories = await response.json();
    const pagination = extractPaginationData(response, 100);
    
    // Return categories with pagination info
    return NextResponse.json({
      categories,
      pagination
    });
  } catch (error) {
    return handleApiError(error, 'Failed to fetch categories');
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