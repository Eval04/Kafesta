// =====================================================
// Kafesta — NextAuth Configuration
// Description: NextAuth v4 setup with credentials
// provider for cafe owner authentication.
// =====================================================

import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { createAdminClient } from '@/lib/supabase/admin';

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email dan password wajib diisi');
        }

        const supabase = createAdminClient();

        const { data: cafe, error } = await supabase
          .from('cafes')
          .select('*')
          .eq('email', credentials.email)
          .single();

        if (error || !cafe) {
          throw new Error('Email tidak terdaftar');
        }

        const isValidPassword = await bcrypt.compare(
          credentials.password,
          cafe.password
        );

        if (!isValidPassword) {
          throw new Error('Password salah');
        }

        return {
          id: cafe.id,
          email: cafe.email,
          name: cafe.name,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/dashboard/login',
    newUser: '/dashboard/register',
  },
  secret: process.env.NEXTAUTH_SECRET,
};