// =====================================================
// Kafesta — Login API Route
// Description: Authenticates a cafe owner and returns
// a session token. Uses NextAuth under the hood.
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email dan password wajib diisi' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data: cafe, error } = await supabase
      .from('cafes')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !cafe) {
      return NextResponse.json(
        { success: false, error: 'Email tidak terdaftar' },
        { status: 401 }
      );
    }

    const isValidPassword = await bcrypt.compare(password, cafe.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: 'Password salah' },
        { status: 401 }
      );
    }

    // Return user data (without password)
    const { password: cafePassword, ...userData } = cafe;
    void cafePassword;

    return NextResponse.json({
      success: true,
      data: userData,
      message: 'Login berhasil',
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}