import { NextResponse } from 'next/server';

/**
 * GET handler for featured products
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
    apiUrl.searchParams.append('featured', 'true');
    apiUrl.searchParams.append('status', 'publish');
    apiUrl.searchParams.append('per_page', limit.toString());
    
    // Add authentication
    apiUrl.searchParams.append('consumer_key', process.env.WOOCOMMERCE_CONSUMER_KEY);
    apiUrl.searchParams.append('consumer_secret', process.env.WOOCOMMERCE_CONSUMER_SECRET);
    
    console.log('Fetching featured products with URL:', apiUrl.toString());
    
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
    
    // If no featured products, try to get regular products
    if (products.length === 0) {
      console.log('No featured products found, fetching regular products');
      
      // Create a new URL for regular products
      const regularProductsUrl = new URL('https://mantle-clothing.com/wp-json/wc/v3/products');
      regularProductsUrl.searchParams.append('status', 'publish');
      regularProductsUrl.searchParams.append('per_page', limit.toString());
      regularProductsUrl.searchParams.append('consumer_key', process.env.WOOCOMMERCE_CONSUMER_KEY);
      regularProductsUrl.searchParams.append('consumer_secret', process.env.WOOCOMMERCE_CONSUMER_SECRET);
      
      const regularResponse = await fetch(regularProductsUrl.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (regularResponse.ok) {
        const regularProducts = await regularResponse.json();
        console.log(`Found ${regularProducts.length} regular products`);
        
        // Return regular products with a flag indicating they're not featured
        return NextResponse.json({
          products: regularProducts,
          isFeatured: false
        });
      }
    }
    
    // Return the featured products
    return NextResponse.json({
      products: products,
      isFeatured: true
    });
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch featured products' },
      { status: 500 }
    );
  }
} 