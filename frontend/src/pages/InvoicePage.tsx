import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Download, ArrowLeft, CheckCircle, Clock } from 'lucide-react';
import { Button } from '../components/common/Button';
import { LoadingSpinner } from '../components/layout/LoadingSpinner';
import { invoiceService, Invoice } from '../services/invoiceService';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export function InvoicePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order');
  const { t } = useTranslation();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  // Helper function to safely convert string or number to number
  const toNumber = (value: string | number): number => {
    return typeof value === 'string' ? parseFloat(value) : value;
  };

  useEffect(() => {
    if (!orderId) {
      toast.error(t('errors.badRequest'));
      navigate('/');
      return;
    }

    loadInvoice(parseInt(orderId));
  }, [orderId, navigate]);

  const loadInvoice = async (id: number) => {
    try {
      setLoading(true);
      const data = await invoiceService.getInvoice(id);
      setInvoice(data);
    } catch (error: any) {
      console.error('Failed to load invoice:', error);
      toast.error(t('notifications.invoiceLoadError'));
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!orderId) return;

    try {
      setDownloading(true);
      await invoiceService.downloadPdf(parseInt(orderId));
      toast.success(t('notifications.invoiceDownloaded'));
    } catch (error) {
      console.error('Failed to download PDF:', error);
      toast.error(t('notifications.invoiceDownloadError'));
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!invoice) {
    return (
      <div className="page-container flex items-center justify-center">
        <div className="content-container text-center">
          <p className="text-gray-600 mb-4">Invoice not found</p>
          <Button onClick={() => navigate('/')}>Back to Menu</Button>
        </div>
      </div>
    );
  }

  const isPaid = invoice.payment_status === 'paid';
  const vatPercentage = Math.round(invoice.vat_rate * 100);
  const orderDate = new Date(invoice.order_date);

  return (
    <div className="page-container">
      <header className="on-gradient-bg shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-xl font-bold">Invoice</h1>
          </div>
          <Button
            onClick={handleDownloadPdf}
            disabled={downloading}
            className="flex items-center gap-2"
          >
            <Download size={18} />
            {downloading ? 'Downloading...' : 'Download PDF'}
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="content-container">
          {/* Status Badge */}
          <div className="flex justify-end mb-6">
            <span
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold ${
                isPaid
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {isPaid ? (
                <>
                  <CheckCircle size={20} />
                  PAID
                </>
              ) : (
                <>
                  <Clock size={20} />
                  PENDING PAYMENT
                </>
              )}
            </span>
          </div>

          {/* Restaurant Header */}
          <div className="border-b-4 border-primary pb-6 mb-6">
            <h1 className="text-3xl font-bold text-primary mb-2">
              {invoice.restaurant.name}
            </h1>
            <p className="text-gray-600 text-sm">
              {invoice.restaurant.address}
              <br />
              Tel: {invoice.restaurant.phone} | Email: {invoice.restaurant.email}
              {invoice.restaurant.vat_number && (
                <>
                  <br />
                  VAT No: {invoice.restaurant.vat_number}
                </>
              )}
            </p>
          </div>

          {/* Invoice Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-3">INVOICE</h2>
              <div className="space-y-1 text-sm">
                <p>
                  <strong>Invoice #:</strong> {invoice.invoice_number}
                </p>
                <p>
                  <strong>Order #:</strong> {invoice.order_number}
                </p>
                <p>
                  <strong>Date:</strong>{' '}
                  {orderDate.toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
                {invoice.table_number && (
                  <p>
                    <strong>Table:</strong> {invoice.table_number}
                  </p>
                )}
              </div>
            </div>

            {/* Customer Info */}
            {(invoice.customer_name || invoice.customer_email) && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-sm text-gray-700 mb-2">Customer</h3>
                <p className="text-sm text-gray-900">
                  {invoice.customer_name || 'Guest'}
                  {invoice.customer_email && (
                    <>
                      <br />
                      {invoice.customer_email}
                    </>
                  )}
                </p>
              </div>
            )}
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto mb-6">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b-2 border-gray-300">
                  <th className="text-left p-3 text-sm font-semibold">Item</th>
                  <th className="text-center p-3 text-sm font-semibold w-20">Qty</th>
                  <th className="text-right p-3 text-sm font-semibold w-24">Price</th>
                  <th className="text-right p-3 text-sm font-semibold w-24">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, index) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="p-3">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        {item.modifiers.length > 0 && (
                          <p className="text-xs text-gray-600 mt-1">
                            + {item.modifiers.join(', ')}
                          </p>
                        )}
                        {item.special_notes && (
                          <p className="text-xs text-gray-500 italic mt-1">
                            Note: {item.special_notes}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-center">{item.quantity}</td>
                    <td className="p-3 text-right">£{toNumber(item.unit_price).toFixed(2)}</td>
                    <td className="p-3 text-right font-semibold">
                      £{toNumber(item.line_total).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-6">
            <div className="w-full md:w-80">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>£{toNumber(invoice.subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>VAT ({vatPercentage}%):</span>
                  <span>£{toNumber(invoice.vat_amount).toFixed(2)}</span>
                </div>
                {toNumber(invoice.tip_amount) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Tip:</span>
                    <span>£{toNumber(invoice.tip_amount).toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t-2 border-gray-300 pt-2 mt-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span>TOTAL:</span>
                    <span>£{toNumber(invoice.total_amount).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {invoice.payment_method && (
                <p className="text-right text-sm text-gray-600 mt-2">
                  Payment Method: {invoice.payment_method.replace('_', ' ')}
                </p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 pt-6 text-center text-gray-600">
            <p className="mb-2 font-medium">Thank you for dining with us!</p>
            <p className="text-sm">We hope to see you again soon.</p>
            <p className="text-sm italic mt-2">Authentic Mexican Cuisine Made Fresh Daily</p>
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Button variant="secondary" onClick={() => navigate('/')} fullWidth>
              <ArrowLeft size={18} className="mr-2" />
              Back to Menu
            </Button>
            <Button onClick={handleDownloadPdf} disabled={downloading} fullWidth>
              <Download size={18} className="mr-2" />
              {downloading ? 'Downloading...' : 'Download PDF'}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
