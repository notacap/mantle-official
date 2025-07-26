import { NextResponse } from 'next/server';
import { fetchFromWooCommerce, handleApiError, extractPaginationData } from '@/app/lib/woocommerce-api';

export const revalidate = 300; // Revalidate this route every 5 minutes

/**
 * GET handler for all product collections (tags)
 * @param {Request} request - The incoming request
 * @returns {Promise<NextResponse>} - JSON response with collections (tags)
 */
export async function GET(request) {
  try {
    const params = {
      per_page: '100'
    };
    
    // Fetch collections from WooCommerce
    const response = await fetchFromWooCommerce('products/tags', {
      params,
      next: { revalidate: 300 } // Use Next.js built-in cache
    });
    
    const collections = await response.json();
    const pagination = extractPaginationData(response, 100);
    
    // Return collections with pagination info
    return NextResponse.json({
      collections,
      pagination
    });
  } catch (error) {
    return handleApiError(error, 'Failed to fetch collections');
  }
} 