import { NextResponse } from 'next/server';

/**
 * GET handler for a single collection (tag)
 * @param {Request} request - The incoming request
 * @returns {Promise<NextResponse>} - JSON response with the collection details
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const tagId = searchParams.get('id');
    
    if (!tagId) {
      return NextResponse.json(
        { error: 'Collection ID is required' },
        { status: 400 }
      );
    }
    
    // WooCommerce API URL for a single tag
    const apiUrl = new URL(`https://mantle-clothing.com/wp-json/wc/v3/products/tags/${tagId}`);
    
    // Add authentication
    apiUrl.searchParams.append('consumer_key', process.env.WOOCOMMERCE_CONSUMER_KEY);
    apiUrl.searchParams.append('consumer_secret', process.env.WOOCOMMERCE_CONSUMER_SECRET);
    
    // Fetch tag from WooCommerce
    const response = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch collection: ${response.status}`);
    }
    
    const collection = await response.json();
    
    // Return the collection
    return NextResponse.json(collection);
  } catch (error) {
    console.error('Error fetching collection:', error);
    return NextResponse.json(
      { error: 'Failed to fetch collection' },
      { status: 500 }
    );
  }
} 