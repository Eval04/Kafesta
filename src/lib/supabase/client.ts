// =====================================================
// Kafesta — Supabase Browser Client
// Description: Client-side Supabase instance for
// use in React components (browser context).
// =====================================================

import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const createClient = () =>
  createBrowserClient(supabaseUrl, supabaseAnonKey);