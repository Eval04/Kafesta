# 🚀 Kafesta — Deployment Guide (Bahasa Indonesia)

## Langkah 1: Setup Supabase Database
1. Buka https://supabase.com → buat project baru
2. Di SQL Editor, jalankan migrasi dari folder `db/migrations/`:
   - `001_initial_schema.sql` — tabel-tabel
   - `002_rls_policies.sql` — Row Level Security
   - `003_seed_data.sql` — data demo (opsional)
3. Copy Project URL, anon key, dan service_role key dari Settings → API

## Langkah 2: Deploy ke Vercel
1. Buka https://vercel.com → Import repository `Eval04/Kafesta`
2. Framework: Next.js (biarkan default)
3. Environment Variables (isi):
   - `NEXT_PUBLIC_SUPABASE_URL` = URL dari Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon key dari Supabase
   - `SUPABASE_SERVICE_ROLE_KEY` = service_role key dari Supabase
   - `NEXTAUTH_SECRET` = generate random string (pakai `openssl rand -base64 32`)
   - `NEXTAUTH_URL` = URL Vercel app (contoh: https://kafesta.vercel.app)
4. Deploy! 🎉

## Langkah 3: Setup Akun Owner
1. Buka URL Vercel yang sudah jadi
2. Register akun di `/dashboard/register`
3. Login di `/dashboard/login`
4. Atur kafe di `/dashboard/settings` (nama, logo, alamat, jumlah meja)
5. Tambah menu di `/dashboard/menu`

## Langkah 4: Generate QR Code
Untuk setiap meja, QR code URL-nya:
```
https://[domain-vercel]/cafe/[cafe-slug]/table/[nomor-meja]
```
Contoh: `https://kafesta.vercel.app/cafe/kafe-santai/table/1`

Gunakan https://www.qr-code-generator.com/ atau API qr-code untuk generate QR Code.

## Testing
- Buka customer menu: `/cafe/[cafeId]/table/1`
- Dashboard admin: `/dashboard`

## Struktur Routes
| URL | Untuk |
|-----|-------|
| `/dashboard/login` | Login admin kafe |
| `/dashboard/register` | Daftar akun baru |
| `/dashboard/settings` | Pengaturan kafe |
| `/dashboard/menu` | Manajemen menu |
| `/dashboard/orders` | Kitchen Display (realtime) |
| `/dashboard/analytics` | Analitik penjualan |
| `/cafe/[cafeId]/table/[meja]` | Menu digital pelanggan |