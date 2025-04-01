import { NextResponse } from 'next/server';

/**
 * GET handler for all products
 * @param {Request} request - The incoming request
 * @returns {Promise<NextResponse>} - JSON response with products
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || 12;
    const page = searchParams.get('page') || 1;
    
    // WooCommerce API URL
    const apiUrl = new URL('https://mantle-clothing.com/wp-json/wc/v3/products');
    
    // Add query parameters
    apiUrl.searchParams.append('status', 'publish');
    apiUrl.searchParams.append('per_page', limit.toString());
    apiUrl.searchParams.append('page', page.toString());
    
    // Add sorting (newest first)
    apiUrl.searchParams.append('orderby', 'date');
    apiUrl.searchParams.append('order', 'desc');
    
    // Add authentication
    apiUrl.searchParams.append('consumer_key', process.env.WOOCOMMERCE_CONSUMER_KEY);
    apiUrl.searchParams.append('consumer_secret', process.env.WOOCOMMERCE_CONSUMER_SECRET);
    
    console.log(`Fetching products with URL: ${apiUrl.toString()}`);
    
    // Fetch products from WooCommerce
    const response = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status}`);
    }
    
    // Get total products from headers for pagination
    const totalProducts = response.headers.get('X-WP-Total');
    const totalPages = response.headers.get('X-WP-TotalPages');
    
    const products = await response.json();
    
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