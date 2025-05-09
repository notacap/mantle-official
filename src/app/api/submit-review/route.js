import { NextResponse } from 'next/server';

export async function POST(request) {
  const reviewData = await request.json();

  // Basic validation (you might want to add more robust validation, e.g., with Zod)
  const { product_id, review, reviewer, reviewer_email, rating } = reviewData;
  if (!product_id || !review || !reviewer || !reviewer_email || rating === undefined) {
    return NextResponse.json({ message: 'Missing required review fields' }, { status: 400 });
  }
  if (typeof rating !== 'number' || rating < 0 || rating > 5) {
    return NextResponse.json({ message: 'Invalid rating value' }, { status: 400 });
  }

  const WOOCOMMERCE_API_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL;
  const CONSUMER_KEY = process.env.WOOCOMMERCE_CONSUMER_KEY;
  const CONSUMER_SECRET = process.env.WOOCOMMERCE_CONSUMER_SECRET;

  if (!WOOCOMMERCE_API_URL || !CONSUMER_KEY || !CONSUMER_SECRET) {
    console.error('Missing WooCommerce API credentials or URL in environment variables');
    return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });
  }

  // Note: Depending on your WooCommerce setup, review submissions might require authentication (e.g., user context)
  // or might be open if guest reviews are allowed. Adjust auth (consumer_key/secret) as needed.
  const apiUrl = `${WOOCOMMERCE_API_URL}/wp-json/wc/v3/products/reviews?consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}`;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reviewData),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({ message: 'Failed to submit review to WooCommerce' }));
      console.error('WooCommerce API Error (Submit Review):', errorBody, 'URL:', apiUrl);
      return NextResponse.json({ message: errorBody.message || 'Failed to submit review' }, { status: response.status });
    }

    const createdReview = await response.json();
    return NextResponse.json(createdReview, { status: 201 }); // 201 Created
  } catch (error) {
    console.error('Error submitting product review:', error, 'URL:', apiUrl);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
} 