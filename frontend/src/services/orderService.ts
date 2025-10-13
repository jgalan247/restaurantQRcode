import api from './api';
import { Order, CreateOrderRequest } from '../types/order';

export const orderService = {
  /**
   * Create a new order
   */
  async createOrder(orderData: CreateOrderRequest): Promise<Order> {
    const response = await api.post<Order>('/orders', orderData);
    return response.data;
  },

  /**
   * Get order by ID
   */
  async getOrder(orderId: number): Promise<Order> {
    const response = await api.get<Order>(`/orders/${orderId}`);
    return response.data;
  },

  /**
   * Get order by order number
   */
  async getOrderByNumber(orderNumber: string): Promise<Order> {
    const response = await api.get<Order>(`/orders/number/${orderNumber}`);
    return response.data;
  },

  /**
   * Get all orders for a table session
   */
  async getTableOrders(tableNumber: string, sessionToken: string): Promise<Order[]> {
    const response = await api.get<Order[]>('/orders/table', {
      params: {
        table_number: tableNumber,
        session_token: sessionToken,
      },
    });
    return response.data;
  },

  /**
   * Update order status
   */
  async updateOrderStatus(orderId: number, status: string): Promise<Order> {
    const response = await api.patch<Order>(`/orders/${orderId}/status`, {
      status,
    });
    return response.data;
  },
};
