import { NextResponse } from 'next/server';

/**
 * GET handler for all product categories
 * @param {Request} request - The incoming request
 * @returns {Promise<NextResponse>} - JSON response with categories
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || 100;
    const page = searchParams.get('page') || 1;
    const orderby = searchParams.get('orderby') || 'name';
    const order = searchParams.get('order') || 'asc';
    
    // WooCommerce API URL for product categories
    const apiUrl = new URL('https://mantle-clothing.com/wp-json/wc/v3/products/categories');
    
    // Add query parameters
    apiUrl.searchParams.append('per_page', limit.toString());
    apiUrl.searchParams.append('page', page.toString());
    apiUrl.searchParams.append('orderby', orderby);
    apiUrl.searchParams.append('order', order);
    
    // Add authentication
    apiUrl.searchParams.append('consumer_key', process.env.WOOCOMMERCE_CONSUMER_KEY);
    apiUrl.searchParams.append('consumer_secret', process.env.WOOCOMMERCE_CONSUMER_SECRET);
    
    // Fetch categories from WooCommerce
    const response = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.status}`);
    }
    
    // Get total categories from headers for pagination
    const totalCategories = response.headers.get('X-WP-Total');
    const totalPages = response.headers.get('X-WP-TotalPages');
    
    const categories = await response.json();
    
    // Return categories with pagination info
    return NextResponse.json({
      categories,
      pagination: {
        total: totalCategories,
        totalPages,
        currentPage: page,
        perPage: limit
      }
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
} 