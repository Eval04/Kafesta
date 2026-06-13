// =====================================================
// Kafesta — Menu API Route (list & create)
// Description: Protected API for cafe owners to
// list and create menu items.
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { MenuItemInput } from '@/lib/types';

// GET /api/menu — Fetch all menu items for the logged-in cafe
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

    const { data: items, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('cafe_id', cafeId)
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      console.error('Menu fetch error:', error);
      return NextResponse.json(
        { success: false, error: 'Gagal mengambil menu' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    console.error('Menu fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}

// POST /api/menu — Create a new menu item
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Silakan login terlebih dahulu' },
        { status: 401 }
      );
    }

    const body: MenuItemInput = await request.json();
    const { name, category, price, image_url, is_available } = body;

    if (!name || !price) {
      return NextResponse.json(
        { success: false, error: 'Nama dan harga menu wajib diisi' },
        { status: 400 }
      );
    }

    if (price < 0) {
      return NextResponse.json(
        { success: false, error: 'Harga tidak boleh negatif' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const cafeId = session.user.id;

    const { data: item, error } = await supabase
      .from('menu_items')
      .insert({
        cafe_id: cafeId,
        name,
        category: category || 'Minuman',
        price,
        image_url: image_url || '',
        is_available: is_available ?? true,
      })
      .select('*')
      .single();

    if (error) {
      console.error('Menu create error:', error);
      return NextResponse.json(
        { success: false, error: 'Gagal menambahkan menu' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, data: item, message: 'Menu berhasil ditambahkan' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Menu create error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}