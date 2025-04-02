import { NextResponse } from 'next/server';

/**
 * Mapping of collection slugs to their WooCommerce tag IDs
 * In a production app, you'd fetch this from the WooCommerce API
 */
const tagMappings = {
  'rain-collection': 21,
  'range-collection': 25
};

/**
 * Get a tag ID from a slug
 * @param {string} slug - The tag slug
 * @returns {number|string} - The tag ID or the original slug if not found
 */
function getTagIdFromSlug(slug) {
  // If slug is already numeric, it might be an ID
  if (!isNaN(Number(slug))) {
    return slug;
  }
  
  // Check our mapping
  if (tagMappings[slug]) {
    return tagMappings[slug];
  }
  
  // Log that we don't have a mapping for this slug
  console.warn(`No tag ID mapping found for slug: ${slug}`);
  return slug;
}

/**
 * GET handler for products by tag
 * @param {Request} request - The incoming request
 * @returns {Promise<NextResponse>} - JSON response with products
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const tagSlug = searchParams.get('tag');
    const limit = searchParams.get('limit') || 8;
    
    if (!tagSlug) {
      return NextResponse.json(
        { error: 'Tag parameter is required' },
        { status: 400 }
      );
    }
    
    // Convert the slug to an ID for WooCommerce API
    const tagId = getTagIdFromSlug(tagSlug);
    
    // WooCommerce API URL
    const apiUrl = new URL('https://mantle-clothing.com/wp-json/wc/v3/products');
    
    // First add authentication
    apiUrl.searchParams.append('consumer_key', process.env.WOOCOMMERCE_CONSUMER_KEY);
    apiUrl.searchParams.append('consumer_secret', process.env.WOOCOMMERCE_CONSUMER_SECRET);
    
    // Then add query parameters for the products
    apiUrl.searchParams.append('tag', tagId); // Use tag for querying by ID
    apiUrl.searchParams.append('status', 'publish');
    apiUrl.searchParams.append('per_page', limit.toString());
    
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