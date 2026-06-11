-- =====================================================
-- Kafesta — Initial Schema Migration
-- Database: PostgreSQL (Supabase)
-- Description: Creates the core multi-tenant tables
-- for cafe management, menu, orders, and order items.
-- RLS policies are created in a separate migration.
-- =====================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------
-- cafes — also acts as auth/profiles for cafe owners
-- ---------------------------
CREATE TABLE IF NOT EXISTS cafes (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email       TEXT UNIQUE NOT NULL,
  password    TEXT NOT NULL,
  name        TEXT NOT NULL DEFAULT '',
  slug        TEXT UNIQUE NOT NULL,
  logo_url    TEXT DEFAULT '',
  address     TEXT DEFAULT '',
  table_count INT NOT NULL DEFAULT 5,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------
-- menu_items — items belonging to a cafe
-- ---------------------------
CREATE TABLE IF NOT EXISTS menu_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cafe_id     UUID NOT NULL REFERENCES cafes(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  category    TEXT NOT NULL DEFAULT 'Minuman',
  price       INT NOT NULL DEFAULT 0,
  image_url   TEXT DEFAULT '',
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast lookups by cafe
CREATE INDEX IF NOT EXISTS idx_menu_items_cafe_id ON menu_items(cafe_id);

-- ---------------------------
-- orders — customer orders
-- ---------------------------
CREATE TABLE IF NOT EXISTS orders (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cafe_id       UUID NOT NULL REFERENCES cafes(id) ON DELETE CASCADE,
  table_number  INT NOT NULL DEFAULT 1,
  customer_name TEXT NOT NULL DEFAULT 'Pelanggan',
  status        TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'preparing', 'completed', 'cancelled')),
  total_amount  INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast lookups by cafe
CREATE INDEX IF NOT EXISTS idx_orders_cafe_id ON orders(cafe_id);

-- ---------------------------
-- order_items — line items within an order
-- ---------------------------
CREATE TABLE IF NOT EXISTS order_items (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id      UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id  UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  quantity      INT NOT NULL DEFAULT 1,
  price_at_order INT NOT NULL DEFAULT 0
);

-- Index for fast lookups by order
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);