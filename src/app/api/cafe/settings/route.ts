// =====================================================
// Kafesta — Cafe Settings API Route
// Description: Protected endpoint for cafe owners
// to view and update their cafe profile settings.
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { CafeSettingsInput } from '@/lib/types';

export const dynamic = 'force-dynamic';

// GET /api/cafe/settings — Get cafe profile
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Silakan login terlebih dahulu' },
        { status: 401 }
      );
    }

    const supabase = createAdminClient();
    const cafeId = session.user.id;

    const { data: cafe, error } = await supabase
      .from('cafes')
      .select('id, email, name, slug, logo_url, address, table_count, created_at')
      .eq('id', cafeId)
      .single();

    if (error || !cafe) {
      return NextResponse.json(
        { success: false, error: 'Profil kafe tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: cafe });
  } catch (error) {
    console.error('Settings fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}

// PUT /api/cafe/settings — Update cafe profile
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Silakan login terlebih dahulu' },
        { status: 401 }
      );
    }

    const body: CafeSettingsInput = await request.json();
    const updateData: Record<string, unknown> = {};

    if (body.name !== undefined) updateData.name = body.name;
    if (body.logo_url !== undefined) updateData.logo_url = body.logo_url;
    if (body.address !== undefined) updateData.address = body.address;
    if (body.table_count !== undefined) {
      if (body.table_count < 1 || body.table_count > 100) {
        return NextResponse.json(
          { success: false, error: 'Jumlah meja harus antara 1-100' },
          { status: 400 }
        );
      }
      updateData.table_count = body.table_count;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: 'Tidak ada data yang diubah' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const cafeId = session.user.id;

    const { data: cafe, error } = await supabase
      .from('cafes')
      .update(updateData)
      .eq('id', cafeId)
      .select('id, email, name, slug, logo_url, address, table_count, created_at')
      .single();

    if (error) {
      console.error('Settings update error:', error);
      return NextResponse.json(
        { success: false, error: 'Gagal memperbarui profil kafe' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: cafe,
      message: 'Profil kafe berhasil diperbarui',
    });
  } catch (error) {
    console.error('Settings update error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}