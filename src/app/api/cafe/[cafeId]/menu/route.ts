// =====================================================
// Kafesta — Public Menu API Route
// Description: Unauthenticated endpoint for customers
// to view a cafe's menu by cafe ID.
// Only returns available items.
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// GET /api/cafe/[cafeId]/menu — Public menu for customers
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ cafeId: string }> }
) {
  try {
    const { cafeId } = await params;

    if (!cafeId) {
      return NextResponse.json(
        { success: false, error: 'ID kafe tidak valid' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Get cafe info
    const { data: cafe, error: cafeError } = await supabase
      .from('cafes')
      .select('id, name, slug, logo_url, address')
      .eq('id', cafeId)
      .single();

    if (cafeError || !cafe) {
      return NextResponse.json(
        { success: false, error: 'Kafe tidak ditemukan' },
        { status: 404 }
      );
    }

    // Get available menu items
    const { data: items, error: menuError } = await supabase
      .from('menu_items')
      .select('*')
      .eq('cafe_id', cafeId)
      .eq('is_available', true)
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (menuError) {
      console.error('Public menu fetch error:', menuError);
      return NextResponse.json(
        { success: false, error: 'Gagal mengambil menu' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        cafe,
        items: items || [],
      },
    });
  } catch (error) {
    console.error('Public menu error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}