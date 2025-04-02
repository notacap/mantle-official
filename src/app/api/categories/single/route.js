import { NextResponse } from 'next/server';

/**
 * GET handler for a single category
 * @param {Request} request - The incoming request
 * @returns {Promise<NextResponse>} - JSON response with the category details
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('id');
    
    if (!categoryId) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }
    
    // WooCommerce API URL for a single category
    const apiUrl = new URL(`https://mantle-clothing.com/wp-json/wc/v3/products/categories/${categoryId}`);
    
    // Add authentication
    apiUrl.searchParams.append('consumer_key', process.env.WOOCOMMERCE_CONSUMER_KEY);
    apiUrl.searchParams.append('consumer_secret', process.env.WOOCOMMERCE_CONSUMER_SECRET);
    
    // Fetch category from WooCommerce
    const response = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch category: ${response.status}`);
    }
    
    const category = await response.json();
    
    // Return the category
    return NextResponse.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    );
  }
} 