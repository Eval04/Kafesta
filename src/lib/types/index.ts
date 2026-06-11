// =====================================================
// Kafesta — TypeScript Type Definitions
// Description: Shared types for the Kafesta platform.
// =====================================================

// --- Cafe/Cafe Owner ---
export interface Cafe {
  id: string;
  email: string;
  name: string;
  slug: string;
  logo_url: string;
  address: string;
  table_count: number;
  created_at: string;
}

// --- Menu Item ---
export interface MenuItem {
  id: string;
  cafe_id: string;
  name: string;
  category: string;
  price: number; // in Rupiah
  image_url: string;
  is_available: boolean;
  created_at: string;
}

// --- Menu Item Input (for create/update) ---
export interface MenuItemInput {
  name: string;
  category: string;
  price: number;
  image_url?: string;
  is_available?: boolean;
}

// --- Order ---
export interface Order {
  id: string;
  cafe_id: string;
  table_number: number;
  customer_name: string;
  status: 'pending' | 'preparing' | 'completed' | 'cancelled';
  total_amount: number;
  created_at: string;
}

// --- Order Item ---
export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  quantity: number;
  price_at_order: number;
}

// --- Order with Items (nested) ---
export interface OrderWithItems extends Order {
  items: OrderItem[];
}

// --- Create Order Input ---
export interface CreateOrderInput {
  cafe_id: string;
  table_number: number;
  customer_name?: string;
  items: { menu_item_id: string; quantity: number }[];
}

// --- Auth Input ---
export interface RegisterInput {
  email: string;
  password: string;
  name: string;
  slug: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

// --- Auth Response ---
export interface AuthResponse {
  user: Cafe;
  token?: string;
}

// --- Cafe Settings Input ---
export interface CafeSettingsInput {
  name?: string;
  logo_url?: string;
  address?: string;
  table_count?: number;
}

// --- API Response Wrapper ---
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}