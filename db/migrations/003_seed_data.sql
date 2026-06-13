-- =====================================================
-- Kafesta — Seed Data for Testing
-- Description: Inserts sample data for development
-- and testing. Creates a demo cafe with menu items
-- and sample orders.
-- =====================================================

-- Note: Password is 'password123' (hashed with bcrypt)
-- Run this SQL directly in Supabase SQL Editor after migrations.

-- Insert demo cafe
INSERT INTO public.cafes (id, email, password, name, slug, logo_url, address, table_count)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'demo@kafesta.id',
  '$2a$12$LJ3m4ys3Lk4QpG.zS5wQOO.nQm0pI3rF0KjHG0S0YN0S0YN0S0YN0S',
  'Kopi Nusantara',
  'kopi-nusantara',
  '',
  'Jl. Merdeka No. 123, Jakarta Pusat',
  8
);

-- Insert menu items (Minuman)
INSERT INTO public.menu_items (cafe_id, name, category, price, image_url, is_available)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Es Kopi Susu', 'Minuman', 25000, '', true),
  ('00000000-0000-0000-0000-000000000001', 'Kopi Hitam', 'Minuman', 15000, '', true),
  ('00000000-0000-0000-0000-000000000001', 'Cappuccino', 'Minuman', 30000, '', true),
  ('00000000-0000-0000-0000-000000000001', 'Matcha Latte', 'Minuman', 35000, '', true),
  ('00000000-0000-0000-0000-000000000001', 'Jus Jeruk', 'Minuman', 20000, '', true);

-- Insert menu items (Makanan)
INSERT INTO public.menu_items (cafe_id, name, category, price, image_url, is_available)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Nasi Goreng', 'Makanan', 35000, '', true),
  ('00000000-0000-0000-0000-000000000001', 'Mie Goreng', 'Makanan', 30000, '', true),
  ('00000000-0000-0000-0000-000000000001', 'Roti Bakar', 'Makanan', 20000, '', true),
  ('00000000-0000-0000-0000-000000000001', 'French Fries', 'Makanan', 25000, '', true);

-- Insert menu items (Dessert)
INSERT INTO public.menu_items (cafe_id, name, category, price, image_url, is_available)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Pisang Goreng', 'Dessert', 15000, '', true),
  ('00000000-0000-0000-0000-000000000001', 'Ice Cream', 'Dessert', 18000, '', true);

-- Insert sample orders
INSERT INTO public.orders (id, cafe_id, table_number, customer_name, status, total_amount)
VALUES
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 3, 'Budi', 'pending', 55000),
  ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', 1, 'Siti', 'preparing', 60000),
  ('00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000001', 5, 'Ahmad', 'completed', 45000),
  ('00000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000001', 2, 'Dewi', 'cancelled', 35000);

-- Insert sample order items
INSERT INTO public.order_items (order_id, menu_item_id, quantity, price_at_order)
VALUES
  ('00000000-0000-0000-0000-000000000010', (SELECT id FROM public.menu_items WHERE name = 'Es Kopi Susu' AND cafe_id = '00000000-0000-0000-0000-000000000001'), 1, 25000),
  ('00000000-0000-0000-0000-000000000010', (SELECT id FROM public.menu_items WHERE name = 'Roti Bakar' AND cafe_id = '00000000-0000-0000-0000-000000000001'), 1, 20000),
  ('00000000-0000-0000-0000-000000000010', (SELECT id FROM public.menu_items WHERE name = 'Pisang Goreng' AND cafe_id = '00000000-0000-0000-0000-000000000001'), 1, 10000),
  ('00000000-0000-0000-0000-000000000011', (SELECT id FROM public.menu_items WHERE name = 'Cappuccino' AND cafe_id = '00000000-0000-0000-0000-000000000001'), 2, 30000),
  ('00000000-0000-0000-0000-000000000012', (SELECT id FROM public.menu_items WHERE name = 'Nasi Goreng' AND cafe_id = '00000000-0000-0000-0000-000000000001'), 1, 35000),
  ('00000000-0000-0000-0000-000000000012', (SELECT id FROM public.menu_items WHERE name = 'Jus Jeruk' AND cafe_id = '00000000-0000-0000-0000-000000000001'), 1, 10000),
  ('00000000-0000-0000-0000-000000000013', (SELECT id FROM public.menu_items WHERE name = 'Mie Goreng' AND cafe_id = '00000000-0000-0000-0000-000000000001'), 1, 30000),
  ('00000000-0000-0000-0000-000000000013', (SELECT id FROM public.menu_items WHERE name = 'Es Kopi Susu' AND cafe_id = '00000000-0000-0000-0000-000000000001'), 1, 5000);