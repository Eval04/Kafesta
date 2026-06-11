-- =====================================================
-- Kafesta — Row Level Security Migration
-- Description: Enables RLS on all tables and creates
-- policies for multi-tenant data isolation.
-- Each cafe can only see its own data.
-- Public menu is accessible anonymously.
-- =====================================================

-- ---------------------------
-- Enable RLS on all tables
-- ---------------------------
ALTER TABLE cafes ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- ---------------------------
-- cafes policies
-- ---------------------------
-- Cafe owners can read their own profile
CREATE POLICY cafes_select_own ON cafes
  FOR SELECT
  USING (id = auth.uid());

-- Cafe owners can update their own profile
CREATE POLICY cafes_update_own ON cafes
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Allow insert during registration (no auth yet)
CREATE POLICY cafes_insert_public ON cafes
  FOR INSERT
  WITH CHECK (true);

-- ---------------------------
-- menu_items policies
-- ---------------------------
-- Cafe owners can CRUD their own menu items
CREATE POLICY menu_items_select_own ON menu_items
  FOR SELECT
  USING (cafe_id = auth.uid());

CREATE POLICY menu_items_insert_own ON menu_items
  FOR INSERT
  WITH CHECK (cafe_id = auth.uid());

CREATE POLICY menu_items_update_own ON menu_items
  FOR UPDATE
  USING (cafe_id = auth.uid())
  WITH CHECK (cafe_id = auth.uid());

CREATE POLICY menu_items_delete_own ON menu_items
  FOR DELETE
  USING (cafe_id = auth.uid());

-- Public can read menu items for ANY cafe (for customer-facing menu)
CREATE POLICY menu_items_select_public ON menu_items
  FOR SELECT
  USING (is_available = true);

-- ---------------------------
-- orders policies
-- ---------------------------
-- Cafe owners can read their own orders
CREATE POLICY orders_select_own ON orders
  FOR SELECT
  USING (cafe_id = auth.uid());

-- Cafe owners can update their own orders
CREATE POLICY orders_update_own ON orders
  FOR UPDATE
  USING (cafe_id = auth.uid())
  WITH CHECK (cafe_id = auth.uid());

-- Public can insert orders (customer placing order)
CREATE POLICY orders_insert_public ON orders
  FOR INSERT
  WITH CHECK (true);

-- ---------------------------
-- order_items policies
-- ---------------------------
-- Cafe owners can read order items through their orders
CREATE POLICY order_items_select_own ON order_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.cafe_id = auth.uid()
    )
  );

-- Public can insert order items (customer placing order)
CREATE POLICY order_items_insert_public ON order_items
  FOR INSERT
  WITH CHECK (true);