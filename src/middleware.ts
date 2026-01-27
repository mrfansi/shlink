import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public routes that don't require authentication
const publicRoutes = ['/sign-in', '/sign-up', '/api/auth'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get("host");
  
  // Remove port if present for local dev
  const domain = hostname?.split(":")[0];
  const shortDomain = process.env.NEXT_PUBLIC_SHORT_DOMAIN || "short.link";

  // Host-based routing
  if (domain === shortDomain) {
    // URL Shortener Logic
    // For now, simply allow the request to proceed (T020 will implement redirection)
    return NextResponse.next();
  }

  // Dashboard / Admin App Logic
  // Check for auth session cookie
  const sessionToken = request.cookies.get('better-auth.session_token');
  
  // Allow public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }
  
  // If no session token and not on public route, redirect to sign-in
  if (!sessionToken) {
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(signInUrl);
  }
  
  // If has session token and on auth pages, redirect to home
  if (sessionToken && (pathname === '/sign-in' || pathname === '/sign-up')) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
