// =====================================================
// Kafesta — Menu Item By ID API Route
// Description: Protected API for cafe owners to
// update or delete individual menu items.
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { MenuItemInput } from '@/lib/types';

// Helper: Verify ownership of a menu item
async function verifyMenuItemOwnership(cafeId: string, itemId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('menu_items')
    .select('id, cafe_id')
    .eq('id', itemId)
    .single();

  if (error || !data) {
    return { valid: false, error: 'Menu tidak ditemukan', status: 404 };
  }

  if (data.cafe_id !== cafeId) {
    return { valid: false, error: 'Anda tidak memiliki akses ke menu ini', status: 403 };
  }

  return { valid: true };
}

// PUT /api/menu/[id] — Update a menu item
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Silakan login terlebih dahulu' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const ownership = await verifyMenuItemOwnership(session.user.id, id);

    if (!ownership.valid) {
      return NextResponse.json(
        { success: false, error: ownership.error },
        { status: ownership.status }
      );
    }

    const body: Partial<MenuItemInput> = await request.json();
    const updateData: Record<string, unknown> = {};

    if (body.name !== undefined) updateData.name = body.name;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.price !== undefined) {
      if (body.price < 0) {
        return NextResponse.json(
          { success: false, error: 'Harga tidak boleh negatif' },
          { status: 400 }
        );
      }
      updateData.price = body.price;
    }
    if (body.image_url !== undefined) updateData.image_url = body.image_url;
    if (body.is_available !== undefined) updateData.is_available = body.is_available;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: 'Tidak ada data yang diubah' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data: item, error } = await supabase
      .from('menu_items')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Menu update error:', error);
      return NextResponse.json(
        { success: false, error: 'Gagal memperbarui menu' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: item,
      message: 'Menu berhasil diperbarui',
    });
  } catch (error) {
    console.error('Menu update error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}

// DELETE /api/menu/[id] — Delete a menu item
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Silakan login terlebih dahulu' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const ownership = await verifyMenuItemOwnership(session.user.id, id);

    if (!ownership.valid) {
      return NextResponse.json(
        { success: false, error: ownership.error },
        { status: ownership.status }
      );
    }

    const supabase = createAdminClient();

    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Menu delete error:', error);
      return NextResponse.json(
        { success: false, error: 'Gagal menghapus menu' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Menu berhasil dihapus',
    });
  } catch (error) {
    console.error('Menu delete error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}