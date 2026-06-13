"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  CheckCircle2, 
  Search,
  Clock,
  Info,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn, formatCurrency } from "@/lib/utils";
import { MenuItem, Cafe, CreateOrderInput } from "@/lib/types";

// --- Categories from API helper ---
function getCategories(menu: MenuItem[]) {
  const cats = Array.from(new Set(menu.map(item => item.category)));
  return ["Semua", ...cats];
}

interface CartItem {
  menu_item: MenuItem;
  quantity: number;
}

export default function CustomerMenuPage({ params }: { params: { cafeId: string, tableNumber: string } }) {
  const [cafe, setCafe] = useState<Cafe | null>(null);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [orderStatus, setOrderStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  const { cafeId, tableNumber } = params;

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/cafe/${cafeId}/menu`);
        const result = await response.json();

        if (result.success) {
          setCafe(result.data.cafe);
          setMenu(result.data.items);
        } else {
          setError(result.error || "Gagal memuat menu");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Terjadi kesalahan koneksi");
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, [cafeId]);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(menu.map(item => item.category)));
    return ["Semua", ...cats];
  }, [menu]);

  const filteredMenu = useMemo(() => {
    return menu.filter(item => {
      const matchesCategory = selectedCategory === "Semua" || item.category === selectedCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [menu, selectedCategory, searchQuery]);

  const addToCart = (item: MenuItem) => {
    if (!item.is_available) return;
    setCart(prev => {
      const existing = prev.find(i => i.menu_item.id === item.id);
      if (existing) {
        return prev.map(i => i.menu_item.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { menu_item: item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(i => i.menu_item.id !== itemId));
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.menu_item.id === itemId) {
        const newQty = Math.max(1, i.quantity + delta);
        return { ...i, quantity: newQty };
      }
      return i;
    }));
  };

  const cartTotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + (item.menu_item.price * item.quantity), 0);
  }, [cart]);

  const totalItems = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.quantity, 0);
  }, [cart]);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      alert("Silakan masukkan nama Anda");
      return;
    }
    if (cart.length === 0) return;

    setOrderStatus('submitting');

    try {
      const orderData: CreateOrderInput = {
        cafe_id: cafeId,
        table_number: parseInt(tableNumber),
        customer_name: customerName,
        items: cart.map(item => ({
          menu_item_id: item.menu_item.id,
          quantity: item.quantity
        }))
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (result.success) {
        setOrderStatus('success');
        setCart([]);
        setIsCartOpen(false);
      } else {
        alert(result.error || "Gagal membuat pesanan");
        setOrderStatus('idle');
      }
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Terjadi kesalahan koneksi");
      setOrderStatus('idle');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-muted-foreground font-medium">Memuat Menu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <X className="w-8 h-8 text-red-600" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Oops!</h1>
        <p className="text-gray-600 mb-6">{error}</p>
        <Button onClick={() => window.location.reload()}>Coba Lagi</Button>
      </div>
    );
  }

  if (orderStatus === 'success') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-12 h-12 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Pesanan Terkirim!</h1>
        <p className="text-gray-600 mb-8">
          Pesanan Anda sedang disiapkan oleh tim dapur. Mohon tunggu sebentar ya!
        </p>
        <Button onClick={() => setOrderStatus('idle')} className="w-full max-w-xs">
          Kembali ke Menu
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-0 md:flex">
      {/* Main Content */}
      <div className="flex-1 max-w-3xl mx-auto md:mx-0 lg:max-w-4xl xl:max-w-5xl">
        {/* Header */}
        <header className="bg-white sticky top-0 z-10 shadow-sm">
          <div className="px-4 py-4 flex items-center gap-4">
            {cafe?.logo_url ? (
              <div className="relative w-12 h-12 rounded-full overflow-hidden border border-gray-100">
                <Image src={cafe.logo_url} alt={cafe.name} fill className="object-cover" />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                {cafe?.name.charAt(0)}
              </div>
            )}
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">{cafe?.name}</h1>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="outline" className="font-normal border-primary/20 text-primary bg-primary/5">Meja {tableNumber}</Badge>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 10-20 min</span>
              </div>
            </div>
          </div>

          {/* Search & Categories */}
          <div className="px-4 pb-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                placeholder="Cari makanan atau minuman..." 
                className="pl-10 bg-gray-100 border-none rounded-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
                    selectedCategory === cat 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-white text-muted-foreground border border-input hover:bg-accent"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Menu Grid */}
        <main className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMenu.length > 0 ? (
              filteredMenu.map((item) => (
                <Card key={item.id} className={cn("overflow-hidden border-none shadow-sm", !item.is_available && "opacity-60")}>
                  <div className="flex">
                    <div className="relative w-32 h-32 flex-shrink-0">
                      <Image 
                        src={item.image_url || "/placeholder-food.jpg"} 
                        alt={item.name} 
                        fill 
                        className="object-cover" 
                      />
                      {!item.is_available && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="text-white text-xs font-bold px-2 py-1 bg-black/60 rounded">Habis</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 p-3 flex flex-col justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground text-sm mb-1">{item.name}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{item.category}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-primary text-sm">{formatCurrency(item.price)}</span>
                        <Button 
                          size="icon" 
                          variant={cart.find(i => i.menu_item.id === item.id) ? "default" : "outline"}
                          className="h-8 w-8 rounded-full"
                          onClick={() => addToCart(item)}
                          disabled={!item.is_available}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="col-span-full py-20 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Menu tidak ditemukan</h3>
                <p className="text-gray-500">Coba cari dengan kata kunci lain</p>
              </div>
            )}
          </div>
        </main>

        {/* Footer Info */}
        <footer className="p-8 text-center text-gray-400 text-xs">
          <p>© 2024 Kafesta. All rights reserved.</p>
          <div className="flex justify-center gap-4 mt-2">
            <span className="flex items-center gap-1"><Info className="w-3 h-3" /> Syarat & Ketentuan</span>
          </div>
        </footer>
      </div>

      {/* Desktop Cart Sidebar */}
      <div className="hidden md:block w-80 lg:w-96 bg-white border-l border-gray-200 h-screen sticky top-0 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <ShoppingCart className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold">Keranjang Saya</h2>
          </div>

          {cart.length > 0 ? (
            <>
              <div className="space-y-4 mb-8">
                {cart.map((item) => (
                  <div key={item.menu_item.id} className="flex gap-3">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <Image src={item.menu_item.image_url} alt={item.menu_item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-foreground leading-tight mb-1">{item.menu_item.name}</h4>
                      <p className="text-xs text-primary font-bold mb-2">{formatCurrency(item.menu_item.price)}</p>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center border border-gray-200 rounded-lg">
                          <button 
                            onClick={() => updateQuantity(item.menu_item.id, -1)}
                            className="p-1 hover:bg-gray-50"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.menu_item.id, 1)}
                            className="p-1 hover:bg-gray-50"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button 
                          onClick={() => removeFromCart(item.menu_item.id)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-6">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium">{formatCurrency(cartTotal)}</span>
                </div>
                <div className="flex justify-between mb-6">
                  <span className="text-gray-500">Biaya Layanan</span>
                  <span className="font-medium">{formatCurrency(0)}</span>
                </div>
                <div className="flex justify-between mb-8 pt-4 border-t border-border">
                  <span className="text-lg font-bold">Total</span>
                  <span className="text-lg font-bold text-primary">{formatCurrency(cartTotal)}</span>
                </div>

                <form onSubmit={handleCheckout}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Pemesan</label>
                    <Input 
                      placeholder="Masukkan nama Anda" 
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full py-6 text-lg font-bold" disabled={orderStatus === 'submitting'}>
                    {orderStatus === 'submitting' ? 'Memproses...' : 'Pesan Sekarang'}
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-500">Keranjang masih kosong</p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Sticky Cart Bar */}
      {cart.length > 0 && !isCartOpen && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-border shadow-[0_-4px_10px_rgba(0,0,0,0.05)] md:hidden z-20">
          <Button 
            className="w-full py-6 rounded-xl flex items-center justify-between px-6 shadow-lg shadow-primary/20"
            onClick={() => setIsCartOpen(true)}
          >
            <div className="flex items-center gap-3">
              <div className="bg-white/20 w-8 h-8 rounded-lg flex items-center justify-center font-bold">
                {totalItems}
              </div>
              <span className="font-bold">Lihat Keranjang</span>
            </div>
            <span className="font-bold">{formatCurrency(cartTotal)}</span>
          </Button>
        </div>
      )}

      {/* Mobile Cart Drawer/Overlay */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsCartOpen(false)}></div>
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[90vh] overflow-y-auto flex flex-col">
            <div className="p-4 border-b border-border flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-primary" />
                Keranjang
              </h2>
              <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-4 flex-1">
              <div className="space-y-4 mb-8">
                {cart.map((item) => (
                  <div key={item.menu_item.id} className="flex gap-4">
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                      <Image src={item.menu_item.image_url} alt={item.menu_item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-gray-900 leading-tight">{item.menu_item.name}</h4>
                        <button onClick={() => removeFromCart(item.menu_item.id)}>
                          <Trash2 className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                      <p className="text-sm text-orange-600 font-bold mb-3">{formatCurrency(item.menu_item.price)}</p>
                      <div className="flex items-center border border-gray-200 rounded-lg w-fit">
                        <button 
                          onClick={() => updateQuantity(item.menu_item.id, -1)}
                          className="p-1.5 px-3 hover:bg-gray-50"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-10 text-center font-bold">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.menu_item.id, 1)}
                          className="p-1.5 px-3 hover:bg-gray-50"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium">{formatCurrency(cartTotal)}</span>
                </div>
                <div className="flex justify-between mb-4 pt-4 border-t border-gray-200">
                  <span className="text-lg font-bold">Total</span>
                  <span className="text-lg font-bold text-orange-600">{formatCurrency(cartTotal)}</span>
                </div>

                <form onSubmit={handleCheckout}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Pemesan</label>
                    <Input 
                      placeholder="Masukkan nama Anda" 
                      required
                      className="bg-white"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full py-6 text-lg font-bold" disabled={orderStatus === 'submitting'}>
                    {orderStatus === 'submitting' ? 'Memproses...' : 'Pesan Sekarang'}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
