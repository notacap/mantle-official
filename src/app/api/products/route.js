import { NextResponse } from 'next/server';

/**
 * GET handler for a single product
 * @param {Request} request - The incoming request
 * @returns {Promise<NextResponse>} - JSON response with the product
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('id');
    
    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }
    
    // WooCommerce API URL for a single product
    const apiUrl = new URL(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wc/v3/products/${productId}`);
    
    // Add authentication
    apiUrl.searchParams.append('consumer_key', process.env.WOOCOMMERCE_CONSUMER_KEY);
    apiUrl.searchParams.append('consumer_secret', process.env.WOOCOMMERCE_CONSUMER_SECRET);
    
    
    // Fetch product from WooCommerce
    const response = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch product: ${response.status}`);
    }
    
    const product = await response.json();
    
    // Check if product is out of stock and return 404 if so
    if (product.stock_status === 'outofstock') {
      return NextResponse.json(
        { error: 'Product is currently out of stock' },
        { status: 404 }
      );
    }
    
    // Return the product
    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
} 