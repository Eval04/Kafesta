"use client"

import { useState, useEffect, useCallback } from "react"
import { 
  CheckCircle2, 
  Clock, 
  ChefHat, 
  XCircle, 
  RefreshCcw,
  User
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ApiResponse, OrderWithItems, MenuItem } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderWithItems[]>([])
  const [menuItems, setMenuItems] = useState<Record<string, MenuItem>>({})
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const supabase = createClient()

  const fetchMenu = useCallback(async () => {
    try {
      const res = await fetch("/api/menu")
      const data: ApiResponse<MenuItem[]> = await res.json()
      if (data.success && data.data) {
        const menuMap = data.data.reduce((acc, item) => {
          acc[item.id] = item
          return acc
        }, {} as Record<string, MenuItem>)
        setMenuItems(menuMap)
      }
    } catch (error) {
      console.error("Failed to fetch menu:", error)
    }
  }, [])

  const fetchOrders = useCallback(async () => {
    setRefreshing(true)
    try {
      const res = await fetch("/api/orders")
      const data: ApiResponse<OrderWithItems[]> = await res.json()
      if (data.success && data.data) {
        setOrders(data.data)
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error)
    } finally {
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true)
      await Promise.all([fetchOrders(), fetchMenu()])
      setLoading(false)
    }

    fetchInitialData()

    // Realtime subscription
    const channel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          fetchOrders()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchOrders, fetchMenu, supabase])

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      const data: ApiResponse = await res.json()
      if (data.success) {
        fetchOrders()
      } else {
        alert(data.error || "Gagal memperbarui status")
      }
    } catch (error) {
      console.error("Failed to update status:", error)
      alert("Terjadi kesalahan koneksi")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Menunggu</Badge>
      case "preparing":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Diproses</Badge>
      case "completed":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Selesai</Badge>
      case "cancelled":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Dibatalkan</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const OrderCard = ({ order }: { order: OrderWithItems }) => (
    <Card key={order.id} className="overflow-hidden border-2">
      <CardHeader className="bg-muted/30 pb-3">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="font-bold">Meja {order.table_number}</Badge>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" /> {new Date(order.created_at).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <CardTitle className="text-sm font-medium flex items-center gap-1">
              <User className="h-3 w-3" /> {order.customer_name}
            </CardTitle>
          </div>
          {getStatusBadge(order.status)}
        </div>
      </CardHeader>
      <CardContent className="pt-4 pb-2">
        <ul className="space-y-2">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between text-sm">
              <span className="flex gap-2">
                <span className="font-bold text-primary">{item.quantity}x</span>
                <span>{menuItems[item.menu_item_id]?.name || "Memuat..."}</span>
              </span>
              <span className="text-muted-foreground">{formatCurrency(item.price_at_order * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 pt-2 border-t flex justify-between items-center font-bold">
          <span className="text-xs text-muted-foreground">Total</span>
          <span className="text-primary">{formatCurrency(order.total_amount)}</span>
        </div>
      </CardContent>
      <CardFooter className="bg-muted/10 pt-2 gap-2">
        {order.status === "pending" && (
          <Button 
            className="w-full bg-blue-600 hover:bg-blue-700" 
            size="sm"
            onClick={() => updateStatus(order.id, "preparing")}
          >
            <ChefHat className="h-4 w-4 mr-1" /> Proses
          </Button>
        )}
        {order.status === "preparing" && (
          <Button 
            className="w-full bg-green-600 hover:bg-green-700" 
            size="sm"
            onClick={() => updateStatus(order.id, "completed")}
          >
            <CheckCircle2 className="h-4 w-4 mr-1" /> Selesai
          </Button>
        )}
        {(order.status === "pending" || order.status === "preparing") && (
          <Button 
            variant="outline" 
            className="text-red-600 hover:text-red-700 border-red-200" 
            size="sm"
            onClick={() => updateStatus(order.id, "cancelled")}
          >
            <XCircle className="h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  )

  if (loading) {
    return <div className="flex h-full items-center justify-center">Memuat pesanan...</div>
  }

  const pendingOrders = orders.filter(o => o.status === "pending")
  const preparingOrders = orders.filter(o => o.status === "preparing")
  const completedOrders = orders.filter(o => o.status === "completed")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dapur / Pesanan</h1>
          <p className="text-muted-foreground">
            Pantau dan kelola pesanan pelanggan secara real-time
          </p>
        </div>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={fetchOrders} 
          disabled={refreshing}
          className={refreshing ? "animate-spin" : ""}
        >
          <RefreshCcw className="h-4 w-4" />
        </Button>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active" className="relative">
            Aktif
            {(pendingOrders.length + preparingOrders.length) > 0 && (
              <span className="ml-2 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-full">
                {pendingOrders.length + preparingOrders.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed">Selesai</TabsTrigger>
          <TabsTrigger value="all">Semua</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="space-y-8">
          {pendingOrders.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-yellow-600">
                <Clock className="h-5 w-5" /> Menunggu ({pendingOrders.length})
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {pendingOrders.map(order => <OrderCard key={order.id} order={order} />)}
              </div>
            </div>
          )}

          {preparingOrders.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-blue-600">
                <ChefHat className="h-5 w-5" /> Sedang Disiapkan ({preparingOrders.length})
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {preparingOrders.map(order => <OrderCard key={order.id} order={order} />)}
              </div>
            </div>
          )}

          {pendingOrders.length === 0 && preparingOrders.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <CheckCircle2 className="h-12 w-12 mb-4 opacity-20" />
              <p>Belum ada pesanan aktif saat ini.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {completedOrders.length > 0 ? (
              completedOrders.map(order => <OrderCard key={order.id} order={order} />)
            ) : (
              <div className="col-span-full text-center py-20 text-muted-foreground">
                Belum ada pesanan selesai.
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="all">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {orders.length > 0 ? (
              orders.map(order => <OrderCard key={order.id} order={order} />)
            ) : (
              <div className="col-span-full text-center py-20 text-muted-foreground">
                Belum ada data pesanan.
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
