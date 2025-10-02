import { NextResponse } from 'next/server';

const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL;
const CONSUMER_KEY = process.env.WOOCOMMERCE_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.WOOCOMMERCE_CONSUMER_SECRET;

/**
 * Fetches all countries and their states from WooCommerce Data API
 * GET /api/countries
 * Returns array of country objects with states/provinces
 * Cached for 24 hours since country data rarely changes
 */
export async function GET() {
  try {
    // Validate credentials
    if (!CONSUMER_KEY || !CONSUMER_SECRET) {
      console.error('WooCommerce credentials not configured');
      return NextResponse.json(
        { error: 'WooCommerce credentials not configured' },
        { status: 500 }
      );
    }

    // Create Basic Auth header
    const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');

    const response = await fetch(
      `${WORDPRESS_URL}/wp-json/wc/v3/data/countries`,
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
        // Cache for 24 hours (86400 seconds) - country data changes infrequently
        next: { revalidate: 86400, tags: ['countries'] }
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('WooCommerce API error:', response.status, errorData);
      throw new Error(
        `WooCommerce API error: ${response.status} - ${errorData.message || response.statusText}`
      );
    }

    const countries = await response.json();

    // Filter to only allowed countries: US, Canada, Mexico, Guam
    const allowedCountryCodes = ['US', 'CA', 'MX', 'GU'];
    const filteredCountries = countries.filter(country =>
      allowedCountryCodes.includes(country.code)
    );

    // Transform data for cleaner frontend consumption
    const transformedCountries = filteredCountries.map(country => ({
      code: country.code,
      name: country.name,
      states: country.states || []
    }));

    return NextResponse.json(transformedCountries, {
      headers: {
        // Allow browsers to cache for 1 hour, CDN for 24 hours
        'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800'
      }
    });

  } catch (error) {
    console.error('Error fetching countries:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch countries',
        message: error.message
      },
      { status: 500 }
    );
  }
}
