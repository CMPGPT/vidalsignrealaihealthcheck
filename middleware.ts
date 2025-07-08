// middleware.ts
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

const protectedRoutes: string[] = ['/partners'];
const authRoutes: string[] = ['/login', '/signup'];
const publicApiRoutes = ['/api/stripe/webhook'];

export async function middleware(req: NextRequest) {
  console.log('🔍 MIDDLEWARE DEBUG: ========== Middleware Called ==========');
  console.log('🔍 MIDDLEWARE DEBUG: Path:', req.nextUrl.pathname);
  console.log('🔍 MIDDLEWARE DEBUG: Method:', req.method);
  
  // Skip middleware for Stripe webhook routes
  if (publicApiRoutes.some(route => req.nextUrl.pathname.startsWith(route))) {
    console.log('🔍 MIDDLEWARE DEBUG: Skipping for public API route');
    return NextResponse.next();
  }

  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET,
    cookieName: process.env.NODE_ENV === 'production' ? 'next-auth.session-token' : 'next-auth.session-token'
  });
  console.log('🔍 MIDDLEWARE DEBUG: Token exists:', !!token);
  console.log('🔍 MIDDLEWARE DEBUG: Token details:', token ? { email: token.email, unique_id: token.unique_id } : 'No token');
  console.log('🔍 MIDDLEWARE DEBUG: Request cookies:', req.cookies.getAll().map(c => c.name));
  console.log('🔍 MIDDLEWARE DEBUG: NextAuth secret exists:', !!process.env.NEXTAUTH_SECRET);

  const isProtected = protectedRoutes.some((route) =>
    req.nextUrl.pathname.startsWith(route)
  );
  
  const isAuthRoute = authRoutes.some((route) =>
    req.nextUrl.pathname.startsWith(route)
  );
  
  console.log('🔍 MIDDLEWARE DEBUG: Is protected route:', isProtected);
  console.log('🔍 MIDDLEWARE DEBUG: Is auth route:', isAuthRoute);

  // If user is authenticated and trying to access login/signup, redirect to partners
  if (token && isAuthRoute) {
    console.log('✅ MIDDLEWARE DEBUG: Authenticated user trying to access auth route, redirecting to partners');
    return NextResponse.redirect(new URL('/partners', req.url));
  }

  // If user is not authenticated and trying to access protected route, redirect to login
  if (isProtected && !token) {
    console.log('❌ MIDDLEWARE DEBUG: No token for protected route, redirecting to login');
    return NextResponse.redirect(new URL('/login', req.url));
  }

  console.log('✅ MIDDLEWARE DEBUG: Access granted, continuing');
  return NextResponse.next();
}

// Add this export to define the matcher
export const config = {
  matcher: ['/chat/:path*', '/partners', '/partners/:path*', '/login', '/signup', '/api/stripe/webhook'],
};