export enum PaymentMethod {
  SINGLE = 'single',
  SPLIT_EQUAL = 'split_equal',
  SPLIT_BY_ITEMS = 'split_by_items'
}

export interface PaymentSplit {
  id: number;
  order_id: number;
  split_token: string;
  customer_email: string;
  amount_due: number;
  payment_url?: string;
  is_paid: boolean;
  paid_at?: string;
  payment_intent_id?: string;
  items?: number[];
}

export interface SplitEqualRequest {
  people_count: number;
  emails: string[];
  tip_percentage?: number;
}

export interface SplitByItemsRequest {
  splits: {
    email: string;
    item_ids: number[];
  }[];
  tip_percentage?: number;
}

export interface SinglePaymentRequest {
  email: string;
  tip_percentage?: number;
}

export interface PaymentResponse {
  order_id: number;
  payment_method: PaymentMethod;
  splits: PaymentSplit[];
  message: string;
}
