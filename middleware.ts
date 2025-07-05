// middleware.ts
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

const protectedRoutes = ['/partners'];
const publicApiRoutes = ['/api/stripe/webhook'];

export async function middleware(req: NextRequest) {
  // Skip middleware for Stripe webhook routes
  if (publicApiRoutes.some(route => req.nextUrl.pathname.startsWith(route))) {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  const isProtected = protectedRoutes.some((route) =>
    req.nextUrl.pathname.startsWith(route)
  );

  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

// Add this export to define the matcher
export const config = {
  matcher: ['/chat/:path*', '/partners', '/partners/:path*', '/api/stripe/webhook'],
};