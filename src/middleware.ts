// =====================================================
// Kafesta — Next.js Middleware
// Description: Protects dashboard routes using NextAuth
// session validation. Redirects unauthenticated users
// to the login page.
// =====================================================

import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware() {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

// Protect all /dashboard routes
export const config = {
  matcher: ['/dashboard/:path*'],
};