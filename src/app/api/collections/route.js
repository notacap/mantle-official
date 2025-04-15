import { NextResponse } from 'next/server';

export const revalidate = 300; // Revalidate this route every 5 minutes

/**
 * GET handler for all product collections (tags)
 * @param {Request} request - The incoming request
 * @returns {Promise<NextResponse>} - JSON response with collections (tags)
 */
export async function GET(request) {
  try {
    // WooCommerce API URL for product tags
    const apiUrl = new URL('https://mantle-clothing.com/wp-json/wc/v3/products/tags');
    
    // Add parameters
    apiUrl.searchParams.append('per_page', '100');
    
    // Add authentication
    apiUrl.searchParams.append('consumer_key', process.env.WOOCOMMERCE_CONSUMER_KEY);
    apiUrl.searchParams.append('consumer_secret', process.env.WOOCOMMERCE_CONSUMER_SECRET);
    
    // Simplified approach: Just fetch collections from WooCommerce
    const response = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 300 } // Use Next.js built-in cache
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch collections: ${response.status}`);
    }
    
    const collections = await response.json();
    
    // Get total collections from headers
    const totalCollections = response.headers.get('X-WP-Total') || 0;
    const totalPages = response.headers.get('X-WP-TotalPages') || 0;
    
    // Return collections with pagination info
    return NextResponse.json({
      collections,
      pagination: {
        total: totalCollections,
        totalPages,
        currentPage: 1,
        perPage: 100
      }
    });
  } catch (error) {
    console.error('Error fetching collections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch collections', message: error.message },
      { status: 500 }
    );
  }
} 