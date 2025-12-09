import { NextResponse } from 'next/server';

const ALLOWED_COUNTRIES = [
  // North America
  'US', // United States
  'CA', // Canada

  // Western Europe
  'AT', // Austria
  'AR', // Argentina
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
  const country = request.headers.get('x-vercel-ip-country');
  
  if (country && !ALLOWED_COUNTRIES.includes(country)) {
    // Return minimal HTML with no GA tracking
    return new Response(
      `<!DOCTYPE html>
      <html>
        <head>
          <title>Access Denied</title>
        </head>
        <body>
          <h1>Access Denied</h1>
          <p>This website is not available in your region.</p>
        </body>
      </html>`,
      {
        status: 403,
        headers: {
          'Content-Type': 'text/html',
        },
      }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};