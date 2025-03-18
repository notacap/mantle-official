import { NextResponse } from 'next/server';

/**
 * GET handler for all products
 * @param {Request} request - The incoming request
 * @returns {Promise<NextResponse>} - JSON response with products
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || 8;
    
    // WooCommerce API URL
    const apiUrl = new URL('https://mantle-clothing.com/wp-json/wc/v3/products');
    
    // Add query parameters
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
    console.error('Error fetching all products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
} 