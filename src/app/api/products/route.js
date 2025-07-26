import { NextResponse } from 'next/server';
import { fetchFromWooCommerce, handleApiError } from '@/app/lib/woocommerce-api';

/**
 * GET handler for a single product
 * @param {Request} request - The incoming request
 * @returns {Promise<NextResponse>} - JSON response with the product
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('id');
    const productSlug = searchParams.get('slug');

    if (!productId && !productSlug) {
      return NextResponse.json(
        { error: 'Product ID or slug is required' },
        { status: 400 }
      );
    }

    let endpoint, params = {};
    if (productSlug) {
      endpoint = 'products';
      params.slug = productSlug;
    } else {
      endpoint = `products/${productId}`;
    }

    // Fetch product from WooCommerce
    const response = await fetchFromWooCommerce(endpoint, { params });
    
    let product;
    if (productSlug) {
      const products = await response.json();
      if (products.length === 0) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        );
      }
      product = products[0];
    } else {
      product = await response.json();
    }

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
    return handleApiError(error, 'Failed to fetch product');
  }
} 