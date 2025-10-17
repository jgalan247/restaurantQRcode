import api from './api';

export interface InvoiceItemDetail {
  name: string;
  quantity: number;
  unit_price: string | number;
  modifiers: string[];
  special_notes?: string;
  line_total: string | number;
}

export interface InvoiceRestaurantDetails {
  name: string;
  address: string;
  phone: string;
  email: string;
  vat_number?: string;
}

export interface Invoice {
  restaurant: InvoiceRestaurantDetails;
  order_number: string;
  invoice_number: string;
  order_date: string;
  table_number?: string;
  customer_name?: string | null;
  customer_email?: string | null;
  items: InvoiceItemDetail[];
  subtotal: string | number;
  vat_rate: number;
  vat_amount: string | number;
  tip_amount: string | number;
  total_amount: string | number;
  payment_method?: string | null;
  payment_status: string;
}

export const invoiceService = {
  /**
   * Get invoice data for an order
   */
  async getInvoice(orderId: number): Promise<Invoice> {
    const response = await api.get(`/orders/${orderId}/invoice`);
    return response.data;
  },

  /**
   * Get PDF download URL for an order invoice
   */
  getPdfDownloadUrl(orderId: number): string {
    // Use the configured baseURL from the api instance
    const baseUrl = api.defaults.baseURL;
    return `${baseUrl}/orders/${orderId}/invoice/pdf`;
  },

  /**
   * Download invoice PDF
   */
  async downloadPdf(orderId: number): Promise<void> {
    const url = this.getPdfDownloadUrl(orderId);

    // Create a temporary link and click it to trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice_${orderId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
};
