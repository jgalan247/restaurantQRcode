import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Mail, FileText } from 'lucide-react';
import { Button } from '../components/common/Button';

export function PaymentSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get('order');
  const orderId = searchParams.get('id'); // Order ID for invoice link

  return (
    <div className="page-container flex items-center justify-center px-4">
      <div className="max-w-md w-full content-container text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-green-100 rounded-full p-4">
            <CheckCircle size={64} className="text-green-600" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>

        {orderNumber && (
          <p className="text-gray-600 mb-6">
            Order Number: <span className="font-semibold text-primary">{orderNumber}</span>
          </p>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <Mail className="text-blue-600 mt-1" size={24} />
            <div className="text-left">
              <p className="font-medium text-blue-900 mb-1">Payment Details Sent</p>
              <p className="text-sm text-blue-700">
                We've sent payment instructions to the email address(es) you provided. Please check
                your inbox and complete the payment to confirm your order.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Your order will be prepared once payment is confirmed. Thank you for dining with us!
          </p>

          {orderId && (
            <Button
              fullWidth
              onClick={() => navigate(`/invoice?order=${orderId}`)}
              className="flex items-center justify-center gap-2"
            >
              <FileText size={18} />
              View Invoice
            </Button>
          )}

          <Button fullWidth onClick={() => navigate('/')} variant="secondary">
            Return to Menu
          </Button>
        </div>
      </div>
    </div>
  );
}
