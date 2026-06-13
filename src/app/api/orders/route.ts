// =====================================================
// Kafesta — Orders API Route
// Description: 
//   POST /api/orders — Public endpoint for customers
//     to place orders (no auth required).
//   GET /api/orders — Protected endpoint for cafe
//     owners to view their orders.
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { CreateOrderInput } from '@/lib/types';

// GET /api/orders — Get orders for cafe (protected, kitchen display)
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

    // Fetch orders with their items
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(*)
      `)
      .eq('cafe_id', cafeId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Orders fetch error:', error);
      return NextResponse.json(
        { success: false, error: 'Gagal mengambil pesanan' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: orders || [] });
  } catch (error) {
    console.error('Orders fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}

// POST /api/orders — Customer places order (public)
export async function POST(request: NextRequest) {
  try {
    const body: CreateOrderInput = await request.json();
    const { cafe_id, table_number, customer_name, items } = body;

    // Validation
    if (!cafe_id) {
      return NextResponse.json(
        { success: false, error: 'ID kafe wajib diisi' },
        { status: 400 }
      );
    }

    if (!table_number || table_number < 1) {
      return NextResponse.json(
        { success: false, error: 'Nomor meja tidak valid' },
        { status: 400 }
      );
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Pesanan harus memiliki minimal 1 item' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Verify cafe exists
    const { data: cafe, error: cafeError } = await supabase
      .from('cafes')
      .select('id')
      .eq('id', cafe_id)
      .single();

    if (cafeError || !cafe) {
      return NextResponse.json(
        { success: false, error: 'Kafe tidak ditemukan' },
        { status: 404 }
      );
    }

    // Get prices for ordered items
    const menuItemIds = items.map((item) => item.menu_item_id);
    const { data: menuItems, error: menuError } = await supabase
      .from('menu_items')
      .select('id, price, is_available')
      .in('id', menuItemIds);

    if (menuError || !menuItems) {
      return NextResponse.json(
        { success: false, error: 'Gagal memvalidasi menu' },
        { status: 500 }
      );
    }

    // Check all items exist, are available, and calculate total
    let totalAmount = 0;
    const orderItemsData: { menu_item_id: string; quantity: number; price_at_order: number }[] = [];

    for (const orderedItem of items) {
      const menuItem = menuItems.find((m) => m.id === orderedItem.menu_item_id);

      if (!menuItem) {
        return NextResponse.json(
          { success: false, error: `Menu dengan ID ${orderedItem.menu_item_id} tidak ditemukan` },
          { status: 400 }
        );
      }

      if (!menuItem.is_available) {
        return NextResponse.json(
          { success: false, error: 'Beberapa menu sedang tidak tersedia' },
          { status: 400 }
        );
      }

      const subtotal = menuItem.price * orderedItem.quantity;
      totalAmount += subtotal;

      orderItemsData.push({
        menu_item_id: orderedItem.menu_item_id,
        quantity: orderedItem.quantity,
        price_at_order: menuItem.price,
      });
    }

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        cafe_id,
        table_number,
        customer_name: customer_name || 'Pelanggan',
        status: 'pending',
        total_amount: totalAmount,
      })
      .select('*')
      .single();

    if (orderError || !order) {
      console.error('Order create error:', orderError);
      return NextResponse.json(
        { success: false, error: 'Gagal membuat pesanan' },
        { status: 500 }
      );
    }

    // Create order items
    const orderItemsWithOrderId = orderItemsData.map((item) => ({
      ...item,
      order_id: order.id,
    }));

    const { data: createdItems, error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsWithOrderId)
      .select('*');

    if (itemsError) {
      console.error('Order items create error:', itemsError);
      // Rollback: delete the order if items fail
      await supabase.from('orders').delete().eq('id', order.id);
      return NextResponse.json(
        { success: false, error: 'Gagal menyimpan item pesanan' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          ...order,
          items: createdItems || [],
        },
        message: 'Pesanan berhasil dibuat',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Order create error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}