'use client';

import { useEffect, useState } from 'react';

export default function HomePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">Kafesta</h1>
          <nav className="flex gap-4">
            <a
              href="/dashboard/login"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Masuk
            </a>
            <a
              href="/dashboard/register"
              className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90"
            >
              Daftar Gratis
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex items-center justify-center py-20">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Digitalisasi Menu Kafe Anda
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Ganti menu kertas dan POS tradisional dengan sistem pemesanan digital
            berbasis QR Code. Pelanggan scan QR, pesan dari HP, pesanan langsung
            muncul di dashboard dapur. Tanpa hardware, tanpa install aplikasi.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/dashboard/register"
              className="bg-primary text-primary-foreground px-8 py-3 rounded-md font-medium hover:opacity-90 transition-opacity"
            >
              Mulai Gratis 14 Hari
            </a>
            <a
              href="#cara-kerja"
              className="border border-border px-8 py-3 rounded-md font-medium hover:bg-secondary transition-colors"
            >
              Cara Kerja
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="cara-kerja" className="py-20 bg-secondary/50">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12">
            Cara Kerja Kafesta
          </h3>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-card border rounded-lg p-6 text-center">
              <div className="text-4xl mb-4">📱</div>
              <h4 className="font-semibold mb-2">1. Scan QR Code</h4>
              <p className="text-sm text-muted-foreground">
                Pelanggan scan QR code di meja menggunakan HP mereka
              </p>
            </div>
            <div className="bg-card border rounded-lg p-6 text-center">
              <div className="text-4xl mb-4">📋</div>
              <h4 className="font-semibold mb-2">2. Pesan dari HP</h4>
              <p className="text-sm text-muted-foreground">
                Lihat menu digital, pilih item, dan pesan langsung dari HP
              </p>
            </div>
            <div className="bg-card border rounded-lg p-6 text-center">
              <div className="text-4xl mb-4">👨‍🍳</div>
              <h4 className="font-semibold mb-2">3. Masuk ke Dapur</h4>
              <p className="text-sm text-muted-foreground">
                Pesanan langsung muncul di dashboard dapur secara real-time
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Kafesta. Semua hak dilindungi.
        </div>
      </footer>
    </div>
  );
}