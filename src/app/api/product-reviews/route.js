import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('product_id');

  if (!productId) {
    return NextResponse.json({ message: 'Product ID is required' }, { status: 400 });
  }

  const WOOCOMMERCE_API_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL;
  const CONSUMER_KEY = process.env.WOOCOMMERCE_CONSUMER_KEY;
  const CONSUMER_SECRET = process.env.WOOCOMMERCE_CONSUMER_SECRET;

  if (!WOOCOMMERCE_API_URL || !CONSUMER_KEY || !CONSUMER_SECRET) {
    console.error('Missing WooCommerce API credentials or URL in environment variables');
    return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });
  }

  const apiUrl = `${WOOCOMMERCE_API_URL}/wp-json/wc/v3/products/reviews?product=${productId}&status=approved&consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to fetch reviews from WooCommerce' }));
      console.error('WooCommerce API Error:', errorData, 'URL:', apiUrl);
      return NextResponse.json({ message: errorData.message || 'Failed to fetch reviews' }, { status: response.status });
    }
    const reviews = await response.json();
    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Error fetching product reviews:', error, 'URL:', apiUrl);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
} 