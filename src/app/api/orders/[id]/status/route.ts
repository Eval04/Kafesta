// =====================================================
// Kafesta — Order Status Update API Route
// Description: Protected endpoint for cafe owners
// to update the status of an order
// (pending → preparing → completed / cancelled).
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

const VALID_STATUSES = ['pending', 'preparing', 'completed', 'cancelled'] as const;

// PUT /api/orders/[id]/status — Update order status
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
    const { status: newStatus } = await request.json();

    if (!newStatus || !VALID_STATUSES.includes(newStatus)) {
      return NextResponse.json(
        {
          success: false,
          error: `Status tidak valid. Status yang valid: ${VALID_STATUSES.join(', ')}`,
        },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const cafeId = session.user.id;

    // Verify order belongs to this cafe
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('id, cafe_id, status')
      .eq('id', id)
      .single();

    if (fetchError || !order) {
      return NextResponse.json(
        { success: false, error: 'Pesanan tidak ditemukan' },
        { status: 404 }
      );
    }

    if (order.cafe_id !== cafeId) {
      return NextResponse.json(
        { success: false, error: 'Anda tidak memiliki akses ke pesanan ini' },
        { status: 403 }
      );
    }

    // Validate status transition
    if (order.status === 'completed' || order.status === 'cancelled') {
      return NextResponse.json(
        { success: false, error: 'Tidak dapat mengubah status pesanan yang sudah selesai atau dibatalkan' },
        { status: 400 }
      );
    }

    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', id)
      .select('*')
      .single();

    if (updateError) {
      console.error('Order status update error:', updateError);
      return NextResponse.json(
        { success: false, error: 'Gagal memperbarui status pesanan' },
        { status: 500 }
      );
    }

    const statusMessages: Record<string, string> = {
      preparing: 'Pesanan sedang disiapkan',
      completed: 'Pesanan selesai',
      cancelled: 'Pesanan dibatalkan',
    };

    return NextResponse.json({
      success: true,
      data: updatedOrder,
      message: statusMessages[newStatus] || 'Status pesanan berhasil diperbarui',
    });
  } catch (error) {
    console.error('Order status update error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}