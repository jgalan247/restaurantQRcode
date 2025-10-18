import api from './api';
import {
  PaymentResponse,
  SinglePaymentRequest,
  SplitEqualRequest,
  SplitByItemsRequest,
} from '../types/payment';

export const paymentService = {
  /**
   * Create single payment for entire order using real CityPay integration
   * Returns a payment URL to redirect the customer to CityPay's payment page
   */
  async createSinglePayment(
    orderId: number,
    paymentData: SinglePaymentRequest
  ): Promise<PaymentResponse> {
    const response = await api.post<PaymentResponse>(
      `/payment/process-single/${orderId}`,
      paymentData
    );
    return response.data;
  },

  /**
   * Create mock single payment for testing (bypasses CityPay)
   * Only use this for frontend testing - payments are auto-approved
   */
  async createMockSinglePayment(
    orderId: number,
    paymentData: SinglePaymentRequest
  ): Promise<PaymentResponse> {
    const response = await api.post<PaymentResponse>(
      `/payment/mock-single/${orderId}`,
      paymentData
    );
    return response.data;
  },

  /**
   * Split payment equally among multiple people
   */
  async splitPaymentEqually(
    orderId: number,
    splitData: SplitEqualRequest
  ): Promise<PaymentResponse> {
    const response = await api.post<PaymentResponse>(
      `/payment/split-equal/${orderId}`,
      splitData
    );
    return response.data;
  },

  /**
   * Split payment by specific items
   */
  async splitPaymentByItems(
    orderId: number,
    splitData: SplitByItemsRequest
  ): Promise<PaymentResponse> {
    const response = await api.post<PaymentResponse>(
      `/payment/split-by-items/${orderId}`,
      splitData
    );
    return response.data;
  },

  /**
   * Verify payment status by split token
   */
  async verifyPayment(splitToken: string): Promise<{
    is_paid: boolean;
    amount_due: number;
    customer_email: string;
    paid_at?: string;
  }> {
    const response = await api.get(`/payment/verify/${splitToken}`);
    return response.data;
  },
};
