import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Middleware for route protection
// Currently using client-side protection via AuthProvider
// This can be enhanced for server-side checks in the future

export function middleware(request: NextRequest) {
  // For now, just pass through all requests
  // Client-side ProtectedRoute component handles auth
  return NextResponse.next();
}

// Optional: Configure which routes the middleware runs on
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
