"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ApiResponse, Cafe } from "@/lib/types"

export default function SettingsPage() {
  const [cafe, setCafe] = useState<Cafe | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/cafe/settings")
        const data: ApiResponse<Cafe> = await res.json()
        if (data.success && data.data) {
          setCafe(data.data)
        }
      } catch (error) {
        console.error("Failed to fetch settings:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!cafe) return

    setSaving(true)
    setMessage(null)

    try {
      const res = await fetch("/api/cafe/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: cafe.name,
          logo_url: cafe.logo_url,
          address: cafe.address,
          table_count: cafe.table_count,
        }),
      })

      const data: ApiResponse<Cafe> = await res.json()
      if (data.success) {
        setMessage({ type: "success", text: "Pengaturan berhasil disimpan" })
      } else {
        setMessage({ type: "error", text: data.error || "Gagal menyimpan pengaturan" })
      }
    } catch {
      setMessage({ type: "error", text: "Terjadi kesalahan koneksi" })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="flex h-full items-center justify-center">Memuat...</div>
  }

  if (!cafe) {
    return <div className="flex h-full items-center justify-center">Gagal memuat data kafe.</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pengaturan Kafe</h1>
        <p className="text-muted-foreground">
          Kelola profil dan konfigurasi kafe Anda
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Profil Kafe</CardTitle>
            <CardDescription>
              Informasi ini akan ditampilkan kepada pelanggan saat mereka memindai QR Code.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {message && (
              <div
                className={`rounded-md p-3 text-sm ${
                  message.type === "success"
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                }`}
              >
                {message.text}
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="name">Nama Kafe</Label>
              <Input
                id="name"
                value={cafe.name}
                onChange={(e) => setCafe({ ...cafe, name: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="logo_url">URL Logo</Label>
              <Input
                id="logo_url"
                value={cafe.logo_url || ""}
                onChange={(e) => setCafe({ ...cafe, logo_url: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address">Alamat</Label>
              <Textarea
                id="address"
                value={cafe.address || ""}
                onChange={(e) => setCafe({ ...cafe, address: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="table_count">Jumlah Meja</Label>
              <Input
                id="table_count"
                type="number"
                min={1}
                max={100}
                value={cafe.table_count}
                onChange={(e) => setCafe({ ...cafe, table_count: parseInt(e.target.value) || 0 })}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label>Slug Kafe (Read-only)</Label>
              <Input value={cafe.slug} disabled />
              <p className="text-xs text-muted-foreground">
                URL publik Anda: /cafe/{cafe.slug}
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={saving}>
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
