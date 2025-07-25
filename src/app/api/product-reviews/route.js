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

  try {
    // Special handling for product 5403: fetch reviews from both 140 and 5403
    if (productId === '5403') {
      const apiUrl140 = `${WOOCOMMERCE_API_URL}/wp-json/wc/v3/products/reviews?product=140&status=approved&consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}`;
      const apiUrl5403 = `${WOOCOMMERCE_API_URL}/wp-json/wc/v3/products/reviews?product=5403&status=approved&consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}`;

      const [response140, response5403] = await Promise.all([
        fetch(apiUrl140),
        fetch(apiUrl5403)
      ]);

      let reviews140 = [];
      let reviews5403 = [];

      // Fetch reviews from product 140
      if (response140.ok) {
        reviews140 = await response140.json();
      } else {
        console.warn('Failed to fetch reviews from product 140:', response140.status);
      }

      // Fetch reviews from product 5403
      if (response5403.ok) {
        reviews5403 = await response5403.json();
      } else {
        console.warn('Failed to fetch reviews from product 5403:', response5403.status);
      }

      // Combine reviews and remove duplicates based on review ID
      const combinedReviews = [...reviews140, ...reviews5403];
      const uniqueReviews = combinedReviews.filter((review, index, self) => 
        index === self.findIndex(r => r.id === review.id)
      );

      return NextResponse.json(uniqueReviews);
    }

    // For all other products, fetch reviews normally
    const apiUrl = `${WOOCOMMERCE_API_URL}/wp-json/wc/v3/products/reviews?product=${productId}&status=approved&consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}`;
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to fetch reviews from WooCommerce' }));
      console.error('WooCommerce API Error:', errorData, 'URL:', apiUrl);
      return NextResponse.json({ message: errorData.message || 'Failed to fetch reviews' }, { status: response.status });
    }
    
    const reviews = await response.json();
    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Error fetching product reviews:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
} 