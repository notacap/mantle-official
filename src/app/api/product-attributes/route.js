import { NextResponse } from 'next/server';

/**
 * GET handler for product attribute terms
 * @param {Request} request - The incoming request
 * @returns {Promise<NextResponse>} - JSON response with attribute terms
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const attributeId = searchParams.get('attribute_id');
    
    if (!attributeId) {
      return NextResponse.json(
        { error: 'Attribute ID is required' },
        { status: 400 }
      );
    }
    
    // WooCommerce API URL for product attribute terms
    const apiUrl = new URL(`https://mantle-clothing.com/wp-json/wc/v3/products/attributes/${attributeId}/terms`);
    
    // Add parameters
    apiUrl.searchParams.append('per_page', '100');
    
    // Add authentication
    apiUrl.searchParams.append('consumer_key', process.env.WOOCOMMERCE_CONSUMER_KEY);
    apiUrl.searchParams.append('consumer_secret', process.env.WOOCOMMERCE_CONSUMER_SECRET);
    
    // Fetch attribute terms from WooCommerce
    const response = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch attribute terms: ${response.status}`);
    }
    
    const terms = await response.json();
    
    // Return the attribute terms
    return NextResponse.json({ terms });
  } catch (error) {
    console.error('Error fetching attribute terms:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attribute terms', message: error.message },
      { status: 500 }
    );
  }
} 