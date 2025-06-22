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

// export function middleware(request) {
//   const { geo } = request;
//   const country = geo?.country;

//   if (country && !ALLOWED_COUNTRIES.includes(country)) {
//     return new NextResponse('Forbidden', { status: 403 });
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: [
//     /*
//      * Match all request paths except for the ones starting with:
//      * - api (API routes)
//      * - _next/static (static files)
//      * - _next/image (image optimization files)
//      * - favicon.ico (favicon file)
//      */
//     '/((?!api|_next/static|_next/image|favicon.ico).*)',
//   ],
// }; 

export function middleware(request) {
  const { geo } = request;
  const country = geo?.country;
  
  // Debug logging
  console.log('Geo data:', geo);
  console.log('Country:', country);
  
  // Also check headers that might contain geo info
  console.log('X-Vercel-IP-Country:', request.headers.get('x-vercel-ip-country'));
  console.log('X-Real-IP:', request.headers.get('x-real-ip'));
  
  if (country && !ALLOWED_COUNTRIES.includes(country)) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  return NextResponse.next();
}