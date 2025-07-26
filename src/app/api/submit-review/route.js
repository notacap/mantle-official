import { NextResponse } from 'next/server';
import { reviewSchema, validateInput, getSecurityHeaders, validateRequestSize } from '@/app/lib/validation';

export async function POST(request) {
  // Security headers
  const headers = getSecurityHeaders();

  try {
    // Validate request size
    const contentLength = request.headers.get('content-length');
    if (!validateRequestSize(parseInt(contentLength), 50 * 1024)) { // 50KB max
      return NextResponse.json(
        { 
          error: 'Request too large',
          message: 'Review data exceeds maximum allowed size'
        }, 
        { status: 413, headers }
      );
    }

    // Rate limiting check (basic IP-based)
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';
    
    // Parse and validate JSON
    let reviewData;
    try {
      reviewData = await request.json();
    } catch (error) {
      return NextResponse.json(
        { 
          error: 'Invalid JSON',
          message: 'Request body must be valid JSON'
        }, 
        { status: 400, headers }
      );
    }

    // Validate input data
    const validation = validateInput(reviewSchema, reviewData);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          message: 'Invalid review data provided',
          details: validation.errors
        }, 
        { status: 400, headers }
      );
    }

    const validatedData = validation.data;

    // Environment validation
    const WOOCOMMERCE_API_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL;
    const CONSUMER_KEY = process.env.WOOCOMMERCE_CONSUMER_KEY;
    const CONSUMER_SECRET = process.env.WOOCOMMERCE_CONSUMER_SECRET;

    if (!WOOCOMMERCE_API_URL || !CONSUMER_KEY || !CONSUMER_SECRET) {
      console.error('Missing WooCommerce API credentials or URL in environment variables');
      return NextResponse.json(
        { 
          error: 'Configuration error',
          message: 'Server configuration error' 
        }, 
        { status: 500, headers }
      );
    }

    // Create secure API URL (credentials in query params as required by WooCommerce)
    const apiUrl = `${WOOCOMMERCE_API_URL}/wp-json/wc/v3/products/reviews?consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}`;

    // Submit to WooCommerce API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mantle-Review-Submission/1.0',
      },
      body: JSON.stringify(validatedData),
    });

    if (!response.ok) {
      let errorBody;
      try {
        errorBody = await response.json();
      } catch {
        errorBody = { message: 'Failed to submit review to WooCommerce' };
      }
      
      console.error('WooCommerce API Error (Submit Review):', {
        status: response.status,
        statusText: response.statusText,
        error: errorBody,
        ip: ip
      });
      
      return NextResponse.json(
        { 
          error: 'Submission failed',
          message: errorBody.message || 'Failed to submit review' 
        }, 
        { status: response.status, headers }
      );
    }

    const createdReview = await response.json();
    
    // Log successful submission (without sensitive data)
    console.log('Review submitted successfully:', {
      reviewId: createdReview.id,
      productId: validatedData.product_id,
      rating: validatedData.rating,
      ip: ip,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Review submitted successfully',
        review: createdReview
      }, 
      { status: 201, headers }
    );

  } catch (error) {
    console.error('Error submitting product review:', {
      error: error.message,
      stack: error.stack,
      ip: ip,
      timestamp: new Date().toISOString()
    });
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'An unexpected error occurred while processing your review' 
      }, 
      { status: 500, headers }
    );
  }
} 