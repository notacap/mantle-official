import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();

    const baseUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL;
    if (!baseUrl) {
      return NextResponse.json(
        { error: 'WordPress URL not configured' },
        { status: 500 }
      );
    }

    const response = await fetch(
      `${baseUrl}/wp-json/mantle/v1/validate-cart`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      }
    );

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('BOGO validation error:', error);
    return NextResponse.json(
      { error: 'Failed to validate cart', success: false },
      { status: 500 }
    );
  }
}
