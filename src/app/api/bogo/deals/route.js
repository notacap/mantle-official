import { NextResponse } from 'next/server';

export const revalidate = 300; // Cache for 5 minutes

export async function GET() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL;
    if (!baseUrl) {
      return NextResponse.json(
        { error: 'WordPress URL not configured' },
        { status: 500 }
      );
    }

    const response = await fetch(
      `${baseUrl}/wp-json/mantle/v1/active-deals`
    );

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching deals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch deals', success: false, deals: [] },
      { status: 500 }
    );
  }
}
