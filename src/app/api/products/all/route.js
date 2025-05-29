import { NextResponse } from 'next/server';
import { fetchWithCache } from '@/app/lib/cache';

export const revalidate = 300; // Revalidate this route at most every 5 minutes (300 seconds)

/**
 * GET handler for all products
 * @param {Request} request - The incoming request
 * @returns {Promise<NextResponse>} - JSON response with products
 */
export async function GET(request) {
  try {
    // const { searchParams } = new URL(request.url); // Removed to avoid dynamic server usage
    // const limit = searchParams.get('limit') || 12; // Removed
    // const page = searchParams.get('page') || 1; // Removed
    const limit = 20; // Using a fixed limit
    const page = 1; // Defaulting to page 1
    
    // WooCommerce API URL
    const apiUrl = new URL('https://mantle-clothing.com/wp-json/wc/v3/products');
    
    // Add query parameters
    apiUrl.searchParams.append('status', 'publish');
    apiUrl.searchParams.append('per_page', limit.toString());
    apiUrl.searchParams.append('page', page.toString());
    apiUrl.searchParams.append('stock_status', 'instock'); // Only get in-stock items
    
    // Add sorting (newest first)
    apiUrl.searchParams.append('orderby', 'date');
    apiUrl.searchParams.append('order', 'desc');
    
    // Add authentication
    apiUrl.searchParams.append('consumer_key', process.env.WOOCOMMERCE_CONSUMER_KEY);
    apiUrl.searchParams.append('consumer_secret', process.env.WOOCOMMERCE_CONSUMER_SECRET);
    
    // Cache TTL (5 minutes)
    const CACHE_TTL = 5 * 60 * 1000;
    
    // Fetch products with caching
    const products = await fetchWithCache(
      apiUrl.toString(),
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        next: { revalidate: 300 } // Use Next.js Cache for 5 minutes
      },
      CACHE_TTL
    );
    
    // Get pagination info from a separate headers request
    // This could be fetched only when needed or cached separately
    const headersResponse = await fetch(apiUrl.toString(), { 
      method: 'HEAD',
      headers: { 'Content-Type': 'application/json' },
    });
    
    const totalProducts = headersResponse.headers.get('X-WP-Total') || 0;
    const totalPages = headersResponse.headers.get('X-WP-TotalPages') || 0;
    
    // Return products with pagination info
    return NextResponse.json({
      products,
      pagination: {
        total: totalProducts,
        totalPages,
        currentPage: page,
        perPage: limit
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
} 