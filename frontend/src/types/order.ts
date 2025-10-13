export interface OrderItemModifier {
  id: number;
  name: string;
  price: number;
}

export interface OrderItem {
  id: number;
  order_id: number;
  menu_item_id: number;
  menu_item_name: string;
  quantity: number;
  unit_price: number;
  modifiers: OrderItemModifier[];
  special_instructions?: string;
  item_total: number;
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  READY = 'ready',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  PARTIALLY_PAID = 'partially_paid'
}

export interface Order {
  id: number;
  order_number: string;
  table_number: string;
  session_token: string;
  items: OrderItem[];
  subtotal: number;
  gst_amount: number;
  tip_amount: number;
  total_amount: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  customer_name?: string;
  customer_email?: string;
  special_requests?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateOrderRequest {
  table_number: string;
  session_token: string;
  items: {
    menu_item_id: number;
    quantity: number;
    modifiers?: number[];
    special_instructions?: string;
  }[];
  customer_name?: string;
  customer_email?: string;
  special_requests?: string;
}
