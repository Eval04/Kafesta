"use client"

import { useState, useEffect } from "react"
import { 
  BarChart3, 
  TrendingUp, 
  ShoppingBag, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ApiResponse, OrderWithItems } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"

export default function AnalyticsPage() {
  const [orders, setOrders] = useState<OrderWithItems[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders")
      const data: ApiResponse<OrderWithItems[]> = await res.json()
      if (data.success && data.data) {
        setOrders(data.data)
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate stats
  const totalRevenue = orders
    .filter(o => o.status !== "cancelled")
    .reduce((acc, o) => acc + o.total_amount, 0)
  
  const totalOrders = orders.length
  const completedOrders = orders.filter(o => o.status === "completed").length
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

  // Daily trend (last 7 days)
  const dailyTrend = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split("T")[0]
    
    const dayOrders = orders.filter(o => o.created_at.startsWith(dateStr))
    const dayRevenue = dayOrders
      .filter(o => o.status !== "cancelled")
      .reduce((acc, o) => acc + o.total_amount, 0)
    
    return {
      date: dateStr,
      label: new Intl.DateTimeFormat("id-ID", { weekday: "short" }).format(date),
      revenue: dayRevenue,
      count: dayOrders.length
    }
  }).reverse()

  const maxRevenue = Math.max(...dailyTrend.map(d => d.revenue), 1)

  if (loading) {
    return <div className="flex h-full items-center justify-center">Memuat data analitik...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analitik Penjualan</h1>
        <p className="text-muted-foreground">
          Pantau performa kafe Anda dalam 7 hari terakhir
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pendapatan</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500 font-medium flex items-center">
                <ArrowUpRight className="h-3 w-3 mr-1" /> +12.5%
              </span>
              dari bulan lalu
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pesanan</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500 font-medium flex items-center">
                <ArrowUpRight className="h-3 w-3 mr-1" /> +4.3%
              </span>
              dari bulan lalu
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rata-rata Pesanan</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(avgOrderValue)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-500 font-medium flex items-center">
                <ArrowDownRight className="h-3 w-3 mr-1" /> -2.1%
              </span>
              dari bulan lalu
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pesanan Selesai</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedOrders}</div>
            <p className="text-xs text-muted-foreground">
              {((completedOrders / (totalOrders || 1)) * 100).toFixed(1)}% tingkat keberhasilan
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Tren Pendapatan Harian</CardTitle>
            <CardDescription>
              Pendapatan dalam 7 hari terakhir
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-end gap-2 pt-4">
              {dailyTrend.map((day) => (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-2 group relative">
                  <div 
                    className="w-full bg-primary/20 hover:bg-primary/40 rounded-t transition-all"
                    style={{ height: `${(day.revenue / maxRevenue) * 100}%` }}
                  >
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-10 pointer-events-none">
                      {formatCurrency(day.revenue)}
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-medium">{day.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Status Pesanan</CardTitle>
            <CardDescription>
              Distribusi status pesanan saat ini
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: "Selesai", status: "completed", color: "bg-green-500" },
                { label: "Menunggu", status: "pending", color: "bg-yellow-500" },
                { label: "Diproses", status: "preparing", color: "bg-blue-500" },
                { label: "Dibatalkan", status: "cancelled", color: "bg-red-500" },
              ].map((item) => {
                const count = orders.filter(o => o.status === item.status).length
                const percentage = (count / (totalOrders || 1)) * 100
                return (
                  <div key={item.status} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium">{item.label}</span>
                      <span className="text-muted-foreground">{count} pesanan ({percentage.toFixed(0)}%)</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${item.color}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
