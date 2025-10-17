import axios from 'axios';
import { API_URL } from '../config/api.config';
import type {
  AdminLoginRequest,
  AdminToken,
  DashboardOverview,
  MenuItem,
  Special,
  SpecialCreate,
  Offer,
  OfferCreate,
  OrderHistoryResponse,
  SalesReport,
} from '../types/admin';
import type {
  AllSettings,
  RestaurantInfoSettings,
  TaxCurrencySettings,
  SettingsUpdateRequest,
  BusinessHours,
  BusinessHoursCreate,
  BusinessHoursUpdate,
  Holiday,
  HolidayCreate,
  HolidayUpdate,
  Table,
  TableUpdate,
} from '../types/settings';

const API_BASE = API_URL;

// Get auth headers with JWT token
const getAuthHeaders = () => {
  const token = localStorage.getItem('adminToken');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
};

export const adminApi = {
  // ============================================================================
  // AUTHENTICATION
  // ============================================================================
  login: async (credentials: AdminLoginRequest): Promise<AdminToken> => {
    const response = await axios.post(`${API_BASE}/admin/auth/login`, credentials);
    return response.data;
  },

  logout: async () => {
    const response = await axios.post(`${API_BASE}/admin/auth/logout`, {}, getAuthHeaders());
    return response.data;
  },

  getMe: async () => {
    const response = await axios.get(`${API_BASE}/admin/auth/me`, getAuthHeaders());
    return response.data;
  },

  // ============================================================================
  // DASHBOARD & ANALYTICS
  // ============================================================================
  getDashboard: async (): Promise<DashboardOverview> => {
    const response = await axios.get(`${API_BASE}/admin/dashboard`, getAuthHeaders());
    return response.data;
  },

  getSalesReport: async (startDate: string, endDate: string): Promise<SalesReport> => {
    const response = await axios.get(
      `${API_BASE}/admin/reports/sales?start_date=${startDate}&end_date=${endDate}`,
      getAuthHeaders()
    );
    return response.data;
  },

  getOrderHistory: async (
    page: number = 1,
    pageSize: number = 20,
    filters?: {
      start_date?: string;
      end_date?: string;
      status?: string;
      table_number?: number;
    }
  ): Promise<OrderHistoryResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
      ...filters,
    });
    const response = await axios.get(
      `${API_BASE}/admin/orders/history?${params}`,
      getAuthHeaders()
    );
    return response.data;
  },

  // ============================================================================
  // MENU MANAGEMENT
  // ============================================================================
  getMenuItems: async (params?: {
    page?: number;
    page_size?: number;
    search?: string;
    category_id?: number;
    sort_by?: string;
    sort_order?: string;
  }): Promise<any> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.page_size) queryParams.append('page_size', params.page_size.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.category_id) queryParams.append('category_id', params.category_id.toString());
    if (params?.sort_by) queryParams.append('sort_by', params.sort_by);
    if (params?.sort_order) queryParams.append('sort_order', params.sort_order);

    const response = await axios.get(
      `${API_BASE}/admin/menu/items?${queryParams}`,
      getAuthHeaders()
    );
    return response.data;
  },

  getMenuItem: async (id: number): Promise<MenuItem> => {
    const response = await axios.get(
      `${API_BASE}/admin/menu/items/${id}`,
      getAuthHeaders()
    );
    return response.data;
  },

  createMenuItem: async (itemData: any): Promise<MenuItem> => {
    const response = await axios.post(
      `${API_BASE}/admin/menu/items`,
      itemData,
      getAuthHeaders()
    );
    return response.data;
  },

  updateMenuItem: async (id: number, itemData: any): Promise<MenuItem> => {
    const response = await axios.put(
      `${API_BASE}/admin/menu/items/${id}`,
      itemData,
      getAuthHeaders()
    );
    return response.data;
  },

  deleteMenuItem: async (id: number): Promise<void> => {
    await axios.delete(`${API_BASE}/admin/menu/items/${id}`, getAuthHeaders());
  },

  toggleItemAvailability: async (id: number, isAvailable: boolean): Promise<MenuItem> => {
    const response = await axios.patch(
      `${API_BASE}/admin/menu/items/${id}/availability`,
      { is_available: isAvailable },
      getAuthHeaders()
    );
    return response.data;
  },

  getCategories: async (): Promise<any[]> => {
    const response = await axios.get(
      `${API_BASE}/admin/menu/categories`,
      getAuthHeaders()
    );
    return response.data;
  },

  uploadMenuCSV: async (file: File, updateExisting: boolean = false): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('adminToken');
    const response = await axios.post(
      `${API_BASE}/admin/menu/upload-csv?update_existing=${updateExisting}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  downloadCSVTemplate: async (): Promise<any> => {
    const response = await axios.get(
      `${API_BASE}/admin/menu/csv-template`,
      getAuthHeaders()
    );
    return response.data;
  },

  // ============================================================================
  // SPECIALS MANAGEMENT
  // ============================================================================
  getSpecials: async (isActive?: boolean): Promise<Special[]> => {
    const params = isActive !== undefined ? `?is_active=${isActive}` : '';
    const response = await axios.get(
      `${API_BASE}/admin/specials${params}`,
      getAuthHeaders()
    );
    return response.data.specials;
  },

  getSpecial: async (id: number): Promise<Special> => {
    const response = await axios.get(
      `${API_BASE}/admin/specials/${id}`,
      getAuthHeaders()
    );
    return response.data;
  },

  createSpecial: async (specialData: SpecialCreate): Promise<Special> => {
    const response = await axios.post(
      `${API_BASE}/admin/specials`,
      specialData,
      getAuthHeaders()
    );
    return response.data;
  },

  updateSpecial: async (id: number, specialData: Partial<SpecialCreate>): Promise<Special> => {
    const response = await axios.put(
      `${API_BASE}/admin/specials/${id}`,
      specialData,
      getAuthHeaders()
    );
    return response.data;
  },

  deleteSpecial: async (id: number): Promise<void> => {
    await axios.delete(`${API_BASE}/admin/specials/${id}`, getAuthHeaders());
  },

  toggleSpecialActive: async (id: number, isActive: boolean): Promise<any> => {
    const response = await axios.patch(
      `${API_BASE}/admin/specials/${id}/active`,
      { is_active: isActive },
      getAuthHeaders()
    );
    return response.data;
  },

  // ============================================================================
  // OFFERS MANAGEMENT
  // ============================================================================
  getOffers: async (isActive?: boolean): Promise<Offer[]> => {
    const params = isActive !== undefined ? `?is_active=${isActive}` : '';
    const response = await axios.get(
      `${API_BASE}/admin/offers${params}`,
      getAuthHeaders()
    );
    return response.data.offers;
  },

  getOffer: async (id: number): Promise<Offer> => {
    const response = await axios.get(
      `${API_BASE}/admin/offers/${id}`,
      getAuthHeaders()
    );
    return response.data;
  },

  createOffer: async (offerData: OfferCreate): Promise<Offer> => {
    const response = await axios.post(
      `${API_BASE}/admin/offers`,
      offerData,
      getAuthHeaders()
    );
    return response.data;
  },

  updateOffer: async (id: number, offerData: Partial<OfferCreate>): Promise<Offer> => {
    const response = await axios.put(
      `${API_BASE}/admin/offers/${id}`,
      offerData,
      getAuthHeaders()
    );
    return response.data;
  },

  deleteOffer: async (id: number): Promise<void> => {
    await axios.delete(`${API_BASE}/admin/offers/${id}`, getAuthHeaders());
  },

  toggleOfferActive: async (id: number, isActive: boolean): Promise<any> => {
    const response = await axios.patch(
      `${API_BASE}/admin/offers/${id}/active`,
      { is_active: isActive },
      getAuthHeaders()
    );
    return response.data;
  },

  // ============================================================================
  // ORDER MANAGEMENT
  // ============================================================================
  getRealtimeOrders: async (): Promise<any[]> => {
    const response = await axios.get(
      `${API_BASE}/admin/orders/realtime`,
      getAuthHeaders()
    );
    return response.data;
  },

  updateOrderStatus: async (id: number, status: string): Promise<any> => {
    const response = await axios.patch(
      `${API_BASE}/admin/orders/${id}/status`,
      { new_status: status },
      getAuthHeaders()
    );
    return response.data;
  },

  // ============================================================================
  // ENHANCED ORDER MANAGEMENT
  // ============================================================================
  getOrders: async (params?: {
    status?: string;
    date_from?: string;
    date_to?: string;
    table_number?: string;
    search?: string;
    page?: number;
    page_size?: number;
  }): Promise<any> => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.date_from) queryParams.append('date_from', params.date_from);
    if (params?.date_to) queryParams.append('date_to', params.date_to);
    if (params?.table_number) queryParams.append('table_number', params.table_number);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.page_size) queryParams.append('page_size', params.page_size.toString());

    const response = await axios.get(
      `${API_BASE}/admin/orders?${queryParams}`,
      getAuthHeaders()
    );
    return response.data;
  },

  getOrderById: async (id: number): Promise<any> => {
    const response = await axios.get(
      `${API_BASE}/admin/orders/${id}`,
      getAuthHeaders()
    );
    return response.data;
  },

  getOrderStats: async (): Promise<any> => {
    const response = await axios.get(
      `${API_BASE}/admin/orders/stats`,
      getAuthHeaders()
    );
    return response.data;
  },

  getStatusCounts: async (): Promise<any> => {
    const response = await axios.get(
      `${API_BASE}/admin/orders/status-counts`,
      getAuthHeaders()
    );
    return response.data;
  },

  getActiveOrders: async (): Promise<any> => {
    const response = await axios.get(
      `${API_BASE}/admin/orders/realtime/active`,
      getAuthHeaders()
    );
    return response.data;
  },

  updateOrderStatusNew: async (orderId: number, status: string): Promise<any> => {
    const response = await axios.patch(
      `${API_BASE}/admin/orders/${orderId}/status`,
      { status },
      getAuthHeaders()
    );
    return response.data;
  },

  bulkUpdateOrderStatus: async (orderIds: number[], status: string): Promise<any> => {
    const response = await axios.post(
      `${API_BASE}/admin/orders/bulk-status`,
      { order_ids: orderIds, status },
      getAuthHeaders()
    );
    return response.data;
  },

  // ============================================================================
  // REPORTS & ANALYTICS
  // ============================================================================
  getKeyMetrics: async (startDate: string, endDate: string): Promise<any> => {
    const response = await axios.get(
      `${API_BASE}/admin/reports/metrics?start_date=${startDate}&end_date=${endDate}`,
      getAuthHeaders()
    );
    return response.data;
  },

  getRevenueOverTime: async (startDate: string, endDate: string, granularity: string = 'day'): Promise<any> => {
    const response = await axios.get(
      `${API_BASE}/admin/reports/revenue-over-time?start_date=${startDate}&end_date=${endDate}&granularity=${granularity}`,
      getAuthHeaders()
    );
    return response.data;
  },

  getOrdersByTime: async (startDate: string, endDate: string): Promise<any> => {
    const response = await axios.get(
      `${API_BASE}/admin/reports/orders-by-time?start_date=${startDate}&end_date=${endDate}`,
      getAuthHeaders()
    );
    return response.data;
  },

  getRevenueByCategory: async (startDate: string, endDate: string): Promise<any> => {
    const response = await axios.get(
      `${API_BASE}/admin/reports/revenue-by-category?start_date=${startDate}&end_date=${endDate}`,
      getAuthHeaders()
    );
    return response.data;
  },

  getTopItems: async (startDate: string, endDate: string, limit: number = 20): Promise<any> => {
    const response = await axios.get(
      `${API_BASE}/admin/reports/top-items?start_date=${startDate}&end_date=${endDate}&limit=${limit}`,
      getAuthHeaders()
    );
    return response.data;
  },

  getBottomItems: async (startDate: string, endDate: string, limit: number = 10): Promise<any> => {
    const response = await axios.get(
      `${API_BASE}/admin/reports/bottom-items?start_date=${startDate}&end_date=${endDate}&limit=${limit}`,
      getAuthHeaders()
    );
    return response.data;
  },

  getSalesByTable: async (startDate: string, endDate: string): Promise<any> => {
    const response = await axios.get(
      `${API_BASE}/admin/reports/sales-by-table?start_date=${startDate}&end_date=${endDate}`,
      getAuthHeaders()
    );
    return response.data;
  },

  getPaymentMethods: async (startDate: string, endDate: string): Promise<any> => {
    const response = await axios.get(
      `${API_BASE}/admin/reports/payment-methods?start_date=${startDate}&end_date=${endDate}`,
      getAuthHeaders()
    );
    return response.data;
  },

  getDailySummary: async (startDate: string, endDate: string): Promise<any> => {
    const response = await axios.get(
      `${API_BASE}/admin/reports/daily-summary?start_date=${startDate}&end_date=${endDate}`,
      getAuthHeaders()
    );
    return response.data;
  },

  getComprehensiveReport: async (startDate: string, endDate: string): Promise<any> => {
    const response = await axios.get(
      `${API_BASE}/admin/reports/comprehensive?start_date=${startDate}&end_date=${endDate}`,
      getAuthHeaders()
    );
    return response.data;
  },

  exportReportCSV: async (startDate: string, endDate: string, reportType: string = 'comprehensive'): Promise<Blob> => {
    const token = localStorage.getItem('adminToken');
    const response = await axios.get(
      `${API_BASE}/admin/reports/export/csv?start_date=${startDate}&end_date=${endDate}&report_type=${reportType}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: 'blob',
      }
    );
    return response.data;
  },

  exportReportJSON: async (startDate: string, endDate: string): Promise<Blob> => {
    const token = localStorage.getItem('adminToken');
    const response = await axios.get(
      `${API_BASE}/admin/reports/export/json?start_date=${startDate}&end_date=${endDate}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: 'blob',
      }
    );
    return response.data;
  },

  // ============================================================================
  // SETTINGS MANAGEMENT
  // ============================================================================
  getAllSettings: async (): Promise<AllSettings> => {
    const response = await axios.get(
      `${API_BASE}/admin/settings`,
      getAuthHeaders()
    );
    return response.data;
  },

  getRestaurantInfo: async (): Promise<RestaurantInfoSettings> => {
    const response = await axios.get(
      `${API_BASE}/admin/settings/restaurant-info`,
      getAuthHeaders()
    );
    return response.data;
  },

  getTaxCurrencySettings: async (): Promise<TaxCurrencySettings> => {
    const response = await axios.get(
      `${API_BASE}/admin/settings/tax-currency`,
      getAuthHeaders()
    );
    return response.data;
  },

  updateSettings: async (request: SettingsUpdateRequest): Promise<any> => {
    const response = await axios.put(
      `${API_BASE}/admin/settings/update`,
      request,
      getAuthHeaders()
    );
    return response.data;
  },

  getSettingsBySection: async (section: string): Promise<any> => {
    const response = await axios.get(
      `${API_BASE}/admin/settings/section/${section}`,
      getAuthHeaders()
    );
    return response.data;
  },

  // Business Hours
  getBusinessHours: async (): Promise<BusinessHours[]> => {
    const response = await axios.get(
      `${API_BASE}/admin/settings/business-hours`,
      getAuthHeaders()
    );
    return response.data;
  },

  createBusinessHours: async (hours: BusinessHoursCreate): Promise<BusinessHours> => {
    const response = await axios.post(
      `${API_BASE}/admin/settings/business-hours`,
      hours,
      getAuthHeaders()
    );
    return response.data;
  },

  updateBusinessHours: async (id: number, hours: BusinessHoursUpdate): Promise<BusinessHours> => {
    const response = await axios.put(
      `${API_BASE}/admin/settings/business-hours/${id}`,
      hours,
      getAuthHeaders()
    );
    return response.data;
  },

  deleteBusinessHours: async (id: number): Promise<void> => {
    await axios.delete(
      `${API_BASE}/admin/settings/business-hours/${id}`,
      getAuthHeaders()
    );
  },

  // Holidays
  getHolidays: async (): Promise<Holiday[]> => {
    const response = await axios.get(
      `${API_BASE}/admin/settings/holidays`,
      getAuthHeaders()
    );
    return response.data;
  },

  createHoliday: async (holiday: HolidayCreate): Promise<Holiday> => {
    const response = await axios.post(
      `${API_BASE}/admin/settings/holidays`,
      holiday,
      getAuthHeaders()
    );
    return response.data;
  },

  updateHoliday: async (id: number, holiday: HolidayUpdate): Promise<Holiday> => {
    const response = await axios.put(
      `${API_BASE}/admin/settings/holidays/${id}`,
      holiday,
      getAuthHeaders()
    );
    return response.data;
  },

  deleteHoliday: async (id: number): Promise<void> => {
    await axios.delete(
      `${API_BASE}/admin/settings/holidays/${id}`,
      getAuthHeaders()
    );
  },

  // Tables
  getTables: async (): Promise<Table[]> => {
    const response = await axios.get(
      `${API_BASE}/admin/settings/tables`,
      getAuthHeaders()
    );
    return response.data;
  },

  updateTable: async (id: number, table: TableUpdate): Promise<Table> => {
    const response = await axios.put(
      `${API_BASE}/admin/settings/tables/${id}`,
      table,
      getAuthHeaders()
    );
    return response.data;
  },

  getTableQRCode: async (id: number): Promise<any> => {
    const response = await axios.get(
      `${API_BASE}/admin/settings/tables/${id}/qr-code`,
      getAuthHeaders()
    );
    return response.data;
  },

  testPaymentConnection: async (): Promise<any> => {
    const response = await axios.post(
      `${API_BASE}/admin/settings/test-payment`,
      {},
      getAuthHeaders()
    );
    return response.data;
  },

  sendTestEmail: async (): Promise<any> => {
    const response = await axios.post(
      `${API_BASE}/admin/settings/test-email`,
      {},
      getAuthHeaders()
    );
    return response.data;
  },

  exportSettings: async (): Promise<any> => {
    const response = await axios.get(
      `${API_BASE}/admin/settings/export`,
      getAuthHeaders()
    );
    return response.data;
  },
};

export default adminApi;
