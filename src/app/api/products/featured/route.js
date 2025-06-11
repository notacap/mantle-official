import { NextResponse } from 'next/server';
import { fetchWithCache } from '@/app/lib/cache';

export const revalidate = 300; // Revalidate this route every 5 minutes

/**
 * GET handler for featured products
 * @param {Request} request - The incoming request
 * @returns {Promise<NextResponse>} - JSON response with products
 */
export async function GET(request) {
  try {
    // const { searchParams } = new URL(request.url); // Removed to avoid dynamic server usage
    // const limit = searchParams.get('limit') || 8; // Removed
    const limit = 8; // Using a fixed limit
    
    // WooCommerce API URL
    const apiUrl = new URL(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wc/v3/products`);
    
    // Add query parameters
    apiUrl.searchParams.append('featured', 'true');
    apiUrl.searchParams.append('status', 'publish');
    apiUrl.searchParams.append('per_page', limit.toString());
    apiUrl.searchParams.append('stock_status', 'instock');
    
    // Add authentication
    apiUrl.searchParams.append('consumer_key', process.env.WOOCOMMERCE_CONSUMER_KEY);
    apiUrl.searchParams.append('consumer_secret', process.env.WOOCOMMERCE_CONSUMER_SECRET);
    
    // Cache TTL (5 minutes)
    const CACHE_TTL = 5 * 60 * 1000;
    
    // Fetch products from WooCommerce with caching
    const products = await fetchWithCache(
      apiUrl.toString(),
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        next: { revalidate: 300 }
      },
      CACHE_TTL
    );
    
    // If no featured products, try to get regular products
    if (products.length === 0) {
      // Create a new URL for regular products
      const regularProductsUrl = new URL(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wc/v3/products`);
      regularProductsUrl.searchParams.append('status', 'publish');
      regularProductsUrl.searchParams.append('per_page', limit.toString());
      regularProductsUrl.searchParams.append('stock_status', 'instock');
      regularProductsUrl.searchParams.append('consumer_key', process.env.WOOCOMMERCE_CONSUMER_KEY);
      regularProductsUrl.searchParams.append('consumer_secret', process.env.WOOCOMMERCE_CONSUMER_SECRET);
      
      // Fetch regular products with caching
      const regularProducts = await fetchWithCache(
        regularProductsUrl.toString(),
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          next: { revalidate: 300 }
        },
        CACHE_TTL
      );
      
      // Return regular products with a flag indicating they're not featured
      return NextResponse.json({
        products: regularProducts,
        isFeatured: false
      });
    }
    
    // Return the featured products
    return NextResponse.json({
      products: products,
      isFeatured: true
    });
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch featured products', message: error.message },
      { status: 500 }
    );
  }
} 