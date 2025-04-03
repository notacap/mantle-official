import { NextResponse } from 'next/server';

/**
 * GET handler for all product collections (tags)
 * @param {Request} request - The incoming request
 * @returns {Promise<NextResponse>} - JSON response with collections (tags)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || 100;
    const page = searchParams.get('page') || 1;
    
    // WooCommerce API URL for product tags
    const apiUrl = new URL('https://mantle-clothing.com/wp-json/wc/v3/products/tags');
    
    // Add query parameters
    apiUrl.searchParams.append('per_page', limit.toString());
    apiUrl.searchParams.append('page', page.toString());
    
    // Add authentication
    apiUrl.searchParams.append('consumer_key', process.env.WOOCOMMERCE_CONSUMER_KEY);
    apiUrl.searchParams.append('consumer_secret', process.env.WOOCOMMERCE_CONSUMER_SECRET);
    
    // Fetch tags from WooCommerce
    const response = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch collections: ${response.status}`);
    }
    
    // Get total collections from headers for pagination
    const totalCollections = response.headers.get('X-WP-Total');
    const totalPages = response.headers.get('X-WP-TotalPages');
    
    const collections = await response.json();
    
    // Fetch product counts for each collection
    const collectionsWithCounts = await Promise.all(
      collections.map(async (collection) => {
        // Create URL for products in this collection
        const productsUrl = new URL('https://mantle-clothing.com/wp-json/wc/v3/products');
        productsUrl.searchParams.append('tag', collection.id);
        productsUrl.searchParams.append('status', 'publish');
        productsUrl.searchParams.append('stock_status', 'instock');
        productsUrl.searchParams.append('per_page', '1'); // We only need the total count
        productsUrl.searchParams.append('consumer_key', process.env.WOOCOMMERCE_CONSUMER_KEY);
        productsUrl.searchParams.append('consumer_secret', process.env.WOOCOMMERCE_CONSUMER_SECRET);
        
        // Fetch products to get the count
        const productsResponse = await fetch(productsUrl.toString());
        if (!productsResponse.ok) {
          console.error(`Failed to fetch products for collection ${collection.id}`);
          return { ...collection, count: 0 };
        }
        
        const totalProducts = productsResponse.headers.get('X-WP-Total');
        return { ...collection, count: parseInt(totalProducts) || 0 };
      })
    );
    
    // Return collections with pagination info
    return NextResponse.json({
      collections: collectionsWithCounts,
      pagination: {
        total: totalCollections,
        totalPages,
        currentPage: page,
        perPage: limit
      }
    });
  } catch (error) {
    console.error('Error fetching collections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch collections' },
      { status: 500 }
    );
  }
} 