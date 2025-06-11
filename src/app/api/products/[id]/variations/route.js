import { NextResponse } from 'next/server';

/**
 * GET handler for product variations
 * @param {Request} request - The incoming request
 * @param {Object} context - The route context, containing params
 * @param {Object} context.params - The route parameters
 * @param {string} context.params.id - The product ID
 * @returns {Promise<NextResponse>} - JSON response with the product variations
 */
export async function GET(request, { params }) {
  try {
    const { id: productId } = params;

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // WooCommerce API URL for product variations
    const apiUrl = new URL(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wc/v3/products/${productId}/variations`);

    // Add authentication
    apiUrl.searchParams.append('consumer_key', process.env.WOOCOMMERCE_CONSUMER_KEY);
    apiUrl.searchParams.append('consumer_secret', process.env.WOOCOMMERCE_CONSUMER_SECRET);
    apiUrl.searchParams.append('per_page', '100'); // Assuming max 100 variations per product

    // Fetch variations from WooCommerce
    const response = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // You might want to configure caching
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
        const errorData = await response.json();
        // WooCommerce returns a specific code when a product has no variations
        if (errorData.code === 'woocommerce_product_has_no_variations') {
            return NextResponse.json([], { status: 200 }); // Return empty array, it's not an error.
        }
      throw new Error(`Failed to fetch product variations: ${response.status} ${response.statusText}`);
    }

    const variations = await response.json();

    // Return the variations
    return NextResponse.json(variations);
  } catch (error) {
    console.error('Error fetching product variations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product variations' },
      { status: 500 }
    );
  }
} 