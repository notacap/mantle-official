import { NextResponse } from 'next/server';
import { sanitizeSlug, sanitizeNumericId, sanitizeLimit } from '@/app/lib/sanitization';

/**
 * Mapping of collection slugs to their WooCommerce tag IDs
 * In a production app, you'd fetch this from the WooCommerce API
 */
const tagMappings = {
  'rain-collection': 21,
  'range-collection': 25
};

/**
 * Get a tag ID from a slug with sanitization
 * @param {string} slug - The tag slug
 * @returns {number|null} - The tag ID or null if not found/invalid
 */
function getTagIdFromSlug(slug) {
  // First sanitize the slug
  const sanitizedSlug = sanitizeSlug(slug);
  if (!sanitizedSlug) return null;
  
  // If slug is already numeric, validate it as ID
  const numericId = sanitizeNumericId(sanitizedSlug);
  if (numericId) {
    return numericId;
  }
  
  // Check our mapping
  if (tagMappings[sanitizedSlug]) {
    return tagMappings[sanitizedSlug];
  }
  
  // Log that we don't have a mapping for this slug
  console.warn(`No tag ID mapping found for slug: ${sanitizedSlug}`);
  return null;
}

/**
 * GET handler for products by tag
 * @param {Request} request - The incoming request
 * @returns {Promise<NextResponse>} - JSON response with products
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawTagSlug = searchParams.get('tag');
    const rawLimit = searchParams.get('limit');
    
    // Sanitize inputs
    const limit = sanitizeLimit(rawLimit, 8, 100);
    
    if (!rawTagSlug) {
      return NextResponse.json(
        { error: 'Tag parameter is required' },
        { status: 400 }
      );
    }
    
    // Convert the slug to an ID for WooCommerce API with sanitization
    const tagId = getTagIdFromSlug(rawTagSlug);
    
    if (!tagId) {
      return NextResponse.json(
        { error: 'Valid tag parameter is required' },
        { status: 400 }
      );
    }
    
    // WooCommerce API URL
    const apiUrl = new URL(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wc/v3/products`);
    
    // First add authentication
    apiUrl.searchParams.append('consumer_key', process.env.WOOCOMMERCE_CONSUMER_KEY);
    apiUrl.searchParams.append('consumer_secret', process.env.WOOCOMMERCE_CONSUMER_SECRET);
    
    // Then add query parameters for the products - now sanitized
    apiUrl.searchParams.append('tag', tagId.toString());
    apiUrl.searchParams.append('status', 'publish');
    apiUrl.searchParams.append('per_page', limit.toString());
    apiUrl.searchParams.append('stock_status', 'instock'); // Only get in-stock items
    
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