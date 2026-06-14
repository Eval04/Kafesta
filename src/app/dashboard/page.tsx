"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { 
  ShoppingBag, 
  DollarSign, 
  Users, 
  ArrowRight,
  TrendingUp,
  Clock,
  Plus
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ApiResponse, OrderWithItems, MenuItem } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"

export default function DashboardPage() {
  const [orders, setOrders] = useState<OrderWithItems[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, menuRes] = await Promise.all([
          fetch("/api/orders"),
          fetch("/api/menu")
        ])
        const ordersData: ApiResponse<OrderWithItems[]> = await ordersRes.json()
        const menuData: ApiResponse<MenuItem[]> = await menuRes.json()
        
        if (ordersData.success) setOrders(ordersData.data || [])
        if (menuData.success) setMenuItems(menuData.data || [])
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const today = new Date().toISOString().split("T")[0]
  const todayOrders = orders.filter(o => o.created_at.startsWith(today))
  const todayRevenue = todayOrders
    .filter(o => o.status !== "cancelled")
    .reduce((acc, o) => acc + o.total_amount, 0)

  const pendingOrders = orders.filter(o => o.status === "pending")

  if (loading) {
    return <div className="flex h-full items-center justify-center">Memuat ringkasan...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Halo, Admin Kafesta!</h1>
          <p className="text-muted-foreground">
            Berikut ringkasan kafe Anda hari ini, {new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(new Date())}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/dashboard/menu">
              <Plus className="mr-2 h-4 w-4" /> Tambah Menu
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/orders">
              Lihat Pesanan
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendapatan Hari Ini</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(todayRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              {todayOrders.length} pesanan berhasil
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pesanan Baru</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingOrders.length}</div>
            <p className="text-xs text-muted-foreground">
              Menunggu diproses di dapur
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Menu</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{menuItems.length}</div>
            <p className="text-xs text-muted-foreground">
              Item menu terdaftar
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status Kafe</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Aktif</div>
            <p className="text-xs text-muted-foreground">
              Menerima pesanan digital
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Pesanan Terbaru</CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard/orders" className="flex items-center">
                  Lihat Semua <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-muted rounded-full p-2">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium leading-none">Meja {order.table_number} — {order.customer_name}</p>
                      <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleTimeString("id-ID")}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{formatCurrency(order.total_amount)}</p>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">{order.status}</p>
                  </div>
                </div>
              ))}
              {orders.length === 0 && (
                <div className="text-center py-10 text-muted-foreground">
                  Belum ada pesanan masuk.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Menu Populer</CardTitle>
            <CardDescription>
              Paling sering dipesan (simulasi)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {menuItems.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-muted flex items-center justify-center text-xs font-bold">
                      {item.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium leading-none">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.category}</p>
                    </div>
                  </div>
                  <p className="text-sm font-bold">{formatCurrency(item.price)}</p>
                </div>
              ))}
               {menuItems.length === 0 && (
                <div className="text-center py-10 text-muted-foreground">
                  Belum ada menu.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
