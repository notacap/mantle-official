import { NextResponse } from 'next/server';

/**
 * GET handler for products by tag
 * @param {Request} request - The incoming request
 * @returns {Promise<NextResponse>} - JSON response with products
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const tag = searchParams.get('tag');
    const limit = searchParams.get('limit') || 8;
    
    if (!tag) {
      return NextResponse.json(
        { error: 'Tag parameter is required' },
        { status: 400 }
      );
    }
    
    // WooCommerce API URL
    const apiUrl = new URL('https://mantle-clothing.com/wp-json/wc/v3/products');
    
    // Add query parameters
    apiUrl.searchParams.append('tag', tag);
    apiUrl.searchParams.append('status', 'publish');
    apiUrl.searchParams.append('per_page', limit.toString());
    
    // Add authentication
    apiUrl.searchParams.append('consumer_key', process.env.WOOCOMMERCE_CONSUMER_KEY);
    apiUrl.searchParams.append('consumer_secret', process.env.WOOCOMMERCE_CONSUMER_SECRET);
    
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
    
    const products = await response.json();
    
    // Return the products
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products by tag:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products by tag' },
      { status: 500 }
    );
  }
} 