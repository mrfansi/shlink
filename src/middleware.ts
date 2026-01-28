import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';

// Public routes that don't require authentication
const publicRoutes = ['/sign-in', '/sign-up', '/api/auth'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get("host");
  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
  
  // Rate Limiting for Writes (POST/PUT/DELETE) and API
  if (request.method !== 'GET' || pathname.startsWith('/api')) {
      const isAllowed = await rateLimit(ip, 10, 1);
      if (!isAllowed) {
          return new NextResponse("Too Many Requests", { status: 429 });
      }
  }

  // Remove port if present for local dev
  const domain = hostname?.split(":")[0];
  const shortDomain = process.env.NEXT_PUBLIC_SHORT_DOMAIN || "short.link";

  // Host-based routing
  if (domain === shortDomain) {
    // If we are on the short domain, every path is potentially a short link
    // We let the Route Handler ([slug]) take care of it
    return NextResponse.next();
  }

  // Dashboard / Admin App Logic
  const protectedRoutes = ['/dashboard', '/admin', '/settings'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  const sessionToken = request.cookies.get('better-auth.session_token');
  
  // If no session token and trying to access protected route, redirect to sign-in
  if (isProtectedRoute && !sessionToken) {
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(signInUrl);
  }
  
  // If has session token
  if (sessionToken) {
      if (pathname === '/sign-in' || pathname === '/sign-up' || pathname === '/') {
           return NextResponse.redirect(new URL('/dashboard', request.url));
      }
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
