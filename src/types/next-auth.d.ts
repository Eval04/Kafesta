// =====================================================
// Kafesta — NextAuth Type Extensions
// Description: Extends NextAuth's default types to
// include cafe owner ID in session and token.
// =====================================================

import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface User {
    id: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
  }
}