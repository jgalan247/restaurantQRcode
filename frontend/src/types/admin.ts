export interface AdminUser {
  id: number;
  username: string;
  email: string;
  full_name?: string;
  role: 'admin' | 'manager' | 'staff';
  is_active: boolean;
  created_at: string;
  last_login?: string;
}

export interface AdminLoginRequest {
  username: string;
  password: string;
}

export interface AdminToken {
  access_token: string;
  token_type: string;
  admin_id: number;
  username: string;
  role: string;
}

export interface DashboardOverview {
  today_sales: number;
  today_orders: number;
  average_order_value: number;
  most_popular_item: string | null;
  most_popular_item_count: number;
  pending_orders: number;
  preparing_orders: number;
}

export interface MenuItem {
  id: number;
  name: string;
  description?: string;
  price: number;
  category_id: number;
  category_name?: string;
  is_available: boolean;
  image_url?: string;
  has_variants?: boolean;
  price_small_glass?: number;
  price_large_glass?: number;
  price_bottle?: number;
  calories?: number;
  allergens?: string[];
  dietary_tags?: string[];
  spice_level?: string;
  display_order?: number;
}

export interface Special {
  id: number;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  is_active: boolean;
  start_date?: string;
  end_date?: string;
  display_order: number;
  created_at: string;
  updated_at: string;
  items: SpecialItem[];
}

export interface SpecialItem {
  id: number;
  special_id: number;
  menu_item_id?: number;
  quantity: number;
  display_order: number;
  menu_item_name?: string;

  // Custom item fields
  is_custom: boolean;
  custom_item_name?: string;
  custom_item_description?: string;
  custom_item_category?: string;
}

export interface SpecialCreate {
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  is_active: boolean;
  start_date?: string;
  end_date?: string;
  display_order: number;
  items: Array<{
    menu_item_id?: number;
    quantity: number;
    display_order: number;
    is_custom?: boolean;
    custom_item_name?: string;
    custom_item_description?: string;
    custom_item_category?: string;
  }>;
}

export interface Offer {
  id: number;
  name: string;
  description?: string;
  customer_description?: string;
  offer_type: string;
  discount_type?: 'fixed' | 'percentage' | 'bogo' | 'free_item';
  // Allow both string and number types from API (we'll parse safely)
  discount_value: number | string | null;
  discount_percentage?: number | string | null;
  minimum_spend?: number | string | null;
  min_spend?: number | string | null;
  max_discount_cap?: number | string | null;
  // BOGO fields
  bogo_buy_quantity?: number;
  bogo_get_quantity?: number;
  // Free item fields
  free_item_name?: string;
  applicable_days?: string[];
  applicable_times_start?: string;
  applicable_times_end?: string;
  start_date?: string;
  end_date?: string;
  is_active: boolean;
  is_featured: boolean;
  usage_count: number;
  max_usage?: number;
  promo_code?: string;
  created_at: string;
  updated_at: string;
}

export interface OfferCreate {
  name: string;
  description?: string;
  discount_type: 'fixed' | 'percentage' | 'bogo' | 'free_item';
  discount_value: number;
  minimum_spend: number;
  applicable_days?: string[];
  applicable_times_start?: string;
  applicable_times_end?: string;
  start_date?: string;
  end_date?: string;
  is_active: boolean;
  is_featured?: boolean;
  max_usage?: number;
}

export interface OrderHistoryItem {
  id: number;
  order_number: string;
  table_number: number;
  status: string;
  total_amount: number;
  items_count: number;
  created_at: string;
  completed_at?: string;
}

export interface OrderHistoryResponse {
  orders: OrderHistoryItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface SalesReport {
  start_date: string;
  end_date: string;
  total_revenue: number;
  total_orders: number;
  average_order_value: number;
  revenue_by_category: CategoryRevenue[];
  revenue_by_payment_method: Record<string, number>;
  top_items: PopularItem[];
  daily_breakdown: any[];
}

export interface CategoryRevenue {
  category_id: number;
  category_name: string;
  revenue: number;
  order_count: number;
  percentage_of_total: number;
}

export interface PopularItem {
  item_id: number;
  item_name: string;
  category_name: string;
  quantity_sold: number;
  revenue: number;
  percentage_of_orders: number;
  average_price: number;
}
