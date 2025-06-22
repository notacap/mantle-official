import { NextResponse } from 'next/server';

const ALLOWED_COUNTRIES = [
  // North America
  'US', // United States
  'CA', // Canada

  // Western Europe
  'AT', // Austria
  'BE', // Belgium
  'FR', // France
  'DE', // Germany
  'IE', // Ireland
  'LI', // Liechtenstein
  'LU', // Luxembourg
  'MC', // Monaco
  'NL', // Netherlands
  'CH', // Switzerland
  'GB', // United Kingdom
];

export function middleware(request) {
  // Get country from header instead of geo object
  const country = request.headers.get('x-vercel-ip-country');
  
  console.log('Country detected:', country);
  
  // Block if country is detected and not in allowed list
  if (country && !ALLOWED_COUNTRIES.includes(country)) {
    return new NextResponse(`Access Denied - Country: ${country}`, { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};