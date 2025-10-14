export interface Setting {
  id: number;
  key: string;
  value: string | null;
  value_type: string;
  section: string | null;
  updated_at: string;
  updated_by: number | null;
}

export interface Table {
  id: number;
  table_number: string;
  is_active: boolean | null;
  capacity: number | null;
  qr_code_url: string | null;
  qr_code_token: string | null;
  seating_capacity: number | null;
  status: string | null;
  location: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface TableUpdate {
  table_number?: string;
  is_active?: boolean;
  capacity?: number;
  location?: string;
  notes?: string;
}

export interface BusinessHours {
  id: number;
  day_of_week: string;
  is_open: boolean;
  open_time: string | null;
  close_time: string | null;
  slot_type: string;
  created_at: string;
  updated_at: string;
}

export interface BusinessHoursCreate {
  day_of_week: string;
  is_open: boolean;
  open_time?: string;
  close_time?: string;
  slot_type?: string;
}

export interface BusinessHoursUpdate {
  is_open?: boolean;
  open_time?: string;
  close_time?: string;
  slot_type?: string;
}

export interface Holiday {
  id: number;
  date: string;
  name: string;
  is_closed: boolean;
  special_hours_start: string | null;
  special_hours_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface HolidayCreate {
  date: string;
  name: string;
  is_closed: boolean;
  special_hours_start?: string;
  special_hours_end?: string;
}

export interface HolidayUpdate {
  name?: string;
  is_closed?: boolean;
  special_hours_start?: string;
  special_hours_end?: string;
}

export interface RestaurantInfoSettings {
  restaurant_name: string;
  legal_business_name?: string;
  logo_url?: string;
  address?: string;
  city?: string;
  postcode?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  description?: string;
  cuisine_type?: string;
}

export interface TaxCurrencySettings {
  tax_name: string;
  tax_rate: number;
  tax_id?: string;
  tax_included: boolean;
  currency: string;
  currency_symbol: string;
  currency_position: string;
  decimal_places: number;
}

export interface PaymentSettings {
  provider: string;
  test_mode: boolean;
  merchant_id?: string;
  api_key?: string;
  webhook_url?: string;
  accept_cards: boolean;
  accept_apple_pay: boolean;
  accept_google_pay: boolean;
  accept_paypal: boolean;
  require_payment: string;
  service_charge_enabled: boolean;
  service_charge_percentage: number;
  tipping_enabled: boolean;
  tip_suggestions: number[];
}

export interface NotificationSettings {
  email_notifications: boolean;
  email_address?: string;
  notify_new_order: boolean;
  notify_payment_success: boolean;
  notify_payment_failed: boolean;
  daily_summary: boolean;
  weekly_report: boolean;
  sms_enabled: boolean;
  sms_phone?: string;
  sms_new_order: boolean;
  sound_enabled: boolean;
  sound_type: string;
  sound_volume: number;
}

export interface AdvancedSettings {
  accept_orders_when_closed: boolean;
  order_prep_time: number;
  max_orders_per_hour?: number;
  require_customer_phone: boolean;
  show_prices: boolean;
  show_calories: boolean;
  show_allergens: boolean;
  allow_special_instructions: boolean;
  max_instruction_length: number;
  maintenance_mode: boolean;
  maintenance_message?: string;
}

export interface AllSettings {
  restaurant_info: RestaurantInfoSettings;
  tax_currency: TaxCurrencySettings;
  payment: PaymentSettings;
  notifications: NotificationSettings;
  advanced: AdvancedSettings;
  business_hours: BusinessHours[];
  holidays: Holiday[];
  tables: Table[];
}

export interface SettingsUpdateRequest {
  settings: Record<string, any>;
  section?: string;
}

export type SettingsSection =
  | 'restaurant_info'
  | 'business_hours'
  | 'tables'
  | 'tax_currency'
  | 'payment'
  | 'notifications'
  | 'users'
  | 'receipt'
  | 'integrations'
  | 'advanced';
