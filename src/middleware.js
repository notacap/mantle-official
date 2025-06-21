import { NextResponse } from 'next/server';

const BLOCKED_COUNTRIES = ['LB', 'TR', 'UA', 'IL', 'TW', 'RU', 'EG', 'EE', 'SA', 'SC', 'UZ'];

export function middleware(request) {
  const { geo } = request;
  const country = geo?.country;

  if (country && BLOCKED_COUNTRIES.includes(country)) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 