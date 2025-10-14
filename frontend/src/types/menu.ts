export interface Modifier {
  id: number;
  name: string;
  price: number;
}

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: string | number; // Backend returns string, convert to number for display
  category_id?: number;
  image_url?: string;
  dietary_tags: string[]; // Backend returns array of tags: 'vegetarian', 'vegan', 'gluten_free', 'spicy'
  is_available: boolean;
  display_order?: number;
  modifiers?: Modifier[];

  // Variant pricing (for wines, drinks with multiple sizes)
  has_variants?: boolean;
  price_small_glass?: string | number;
  price_large_glass?: string | number;
  price_bottle?: string | number;

  // Filter-related fields
  spice_level?: 'mild' | 'medium' | 'hot' | 'extra-hot';
  is_lite_bite?: boolean;
  is_child_friendly?: boolean;
  is_salad?: boolean;
  is_deal?: boolean;
  is_gluten_free?: boolean;
  calories?: number;
  allergens?: string[];
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  display_order: number;
  is_active: boolean;
  items: MenuItem[];
}

export interface CartItemModifier {
  id: number;
  name: string;
  price: number;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  modifiers: CartItemModifier[];
  variant?: string; // 'small_glass', 'large_glass', 'bottle'
  variantDisplay?: string; // 'Small Glass (125ml)', etc.
  selectedPrice?: number; // Price of the selected variant
  specialInstructions?: string;
}

export interface CartState {
  items: CartItem[];
  tableNumber: string;
  sessionToken: string;
}
