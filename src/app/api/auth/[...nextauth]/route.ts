// =====================================================
// Kafesta — NextAuth Catch-All Route
// Description: Handles all NextAuth API requests
// (sign in, sign out, session fetch, etc.)
// =====================================================

import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };