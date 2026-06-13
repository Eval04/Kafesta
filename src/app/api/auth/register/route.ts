// =====================================================
// Kafesta — Register API Route
// Description: Registers a new cafe owner account.
// Creates a new row in the cafes table with
// hashed password.
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createAdminClient } from '@/lib/supabase/admin';
import { RegisterInput } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body: RegisterInput = await request.json();
    const { email, password, name, slug } = body;

    // --- Validation ---
    if (!email || !password || !name || !slug) {
      return NextResponse.json(
        { success: false, error: 'Semua field wajib diisi' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password minimal 6 karakter' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Format email tidak valid' },
        { status: 400 }
      );
    }

    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(slug)) {
      return NextResponse.json(
        { success: false, error: 'Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Check if email already exists
    const { data: existingEmail } = await supabase
      .from('cafes')
      .select('id')
      .eq('email', email)
      .single();

    if (existingEmail) {
      return NextResponse.json(
        { success: false, error: 'Email sudah terdaftar' },
        { status: 409 }
      );
    }

    // Check if slug already exists
    const { data: existingSlug } = await supabase
      .from('cafes')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existingSlug) {
      return NextResponse.json(
        { success: false, error: 'Slug sudah digunakan, pilih slug lain' },
        { status: 409 }
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create cafe
    const { data: cafe, error } = await supabase
      .from('cafes')
      .insert({
        email,
        password: hashedPassword,
        name,
        slug,
        table_count: 5,
      })
      .select('id, email, name, slug, logo_url, address, table_count, created_at')
      .single();

    if (error) {
      console.error('Register error:', error);
      return NextResponse.json(
        { success: false, error: 'Gagal mendaftarkan akun' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, data: cafe, message: 'Registrasi berhasil' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}