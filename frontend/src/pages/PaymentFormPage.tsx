import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Info } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { CartSummary } from '../components/cart/CartSummary';
import { Button } from '../components/common/Button';
import { LoadingSpinner } from '../components/layout/LoadingSpinner';
import { orderService } from '../services/orderService';
import {
  formatCardNumber,
  formatExpiryDate,
  formatCVV,
  validateCard,
  hasValidationErrors,
  CardValidationErrors,
  TEST_CARDS,
} from '../utils/cardValidation';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export function PaymentFormPage() {
  const navigate = useNavigate();
  const { state, getCartSubtotal, getGSTAmount, getCartTotal, clearCart } = useCart();
  const { t } = useTranslation();

  // Card form state
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');

  // UI state
  const [errors, setErrors] = useState<CardValidationErrors>({});
  const [processing, setProcessing] = useState(false);

  const subtotal = getCartSubtotal();
  const gst = getGSTAmount();
  const total = getCartTotal();

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setCardNumber(formatted);
    // Clear error when user types
    if (errors.cardNumber) {
      setErrors((prev) => ({ ...prev, cardNumber: undefined }));
    }
  };

  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiryDate(e.target.value);
    setExpiryDate(formatted);
    if (errors.expiryDate) {
      setErrors((prev) => ({ ...prev, expiryDate: undefined }));
    }
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCVV(e.target.value);
    setCvv(formatted);
    if (errors.cvv) {
      setErrors((prev) => ({ ...prev, cvv: undefined }));
    }
  };

  const handleCardholderNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardholderName(e.target.value);
    if (errors.cardholderName) {
      setErrors((prev) => ({ ...prev, cardholderName: undefined }));
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    // MOCK VALIDATION (for testing only)
    // TODO: Replace with actual CityPay API call in production
    const validationErrors = validateCard(cardNumber, expiryDate, cvv, cardholderName);

    if (hasValidationErrors(validationErrors)) {
      setErrors(validationErrors);
      toast.error(t('notifications.formErrors'));
      return;
    }

    try {
      setProcessing(true);

      // Create order in database
      const orderData = {
        table_number: state.tableNumber, // Will be "11" for testing
        session_token: state.sessionToken,
        items: state.items.map((item) => ({
          menu_item_id: item.menuItem.id,
          quantity: item.quantity,
          modifiers: item.modifiers.map((m) => m.id),
          special_instructions: item.specialInstructions,
        })),
        customer_name: cardholderName || undefined,
        customer_email: 'test@example.com', // For testing
        special_requests: undefined,
      };

      const order = await orderService.createOrder(orderData);

      // TODO: In production, integrate with CityPay API here
      // const paymentResponse = await cityPayService.processPayment({
      //   amount: total,
      //   currency: 'GBP',
      //   card_number: cardNumber.replace(/\s/g, ''),
      //   expiry_date: expiryDate,
      //   cvv: cvv,
      //   cardholder_name: cardholderName,
      //   order_id: order.id,
      // });

      // MOCK: Simulate successful payment
      // In production, check paymentResponse.status
      const paymentSuccessful = true;

      if (paymentSuccessful) {
        // Clear cart
        clearCart();

        // Show success message
        toast.success(t('notifications.paymentSuccess'));

        // Redirect to invoice page
        navigate(`/invoice?order=${order.id}`);
      } else {
        throw new Error(t('notifications.paymentFailed'));
      }
    } catch (err: any) {
      console.error('Payment failed:', err);
      toast.error(err.message || t('notifications.paymentFailed'));
    } finally {
      setProcessing(false);
    }
  };

  // Prevent access if cart is empty
  if (state.items.length === 0) {
    return (
      <div className="page-container flex items-center justify-center">
        <div className="content-container text-center">
          <p className="text-gray-600 mb-4">{t('cart.empty')}</p>
          <Button onClick={() => navigate('/')}>{t('menu.backToMenu')}</Button>
        </div>
      </div>
    );
  }

  if (processing) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="page-container">
      <header className="on-gradient-bg shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/checkout')}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold">{t('payment.title')}</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment Form */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="text-primary" size={24} />
              <h2 className="text-xl font-bold">{t('payment.cardDetails')}</h2>
            </div>

            {/* Test Mode Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <div className="flex items-start gap-2">
                <Info className="text-blue-600 mt-0.5" size={18} />
                <div className="text-sm text-blue-900">
                  <p className="font-semibold mb-1">{t('payment.testMode')}</p>
                  <p className="text-blue-700">
                    Use any 16-digit number (e.g., {TEST_CARDS.visa})
                  </p>
                  <p className="text-blue-700">Any future expiry date and any 3-digit CVV</p>
                </div>
              </div>
            </div>

            <form onSubmit={handlePayment} className="space-y-4">
              {/* Card Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('payment.cardNumber')} *
                </label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  placeholder={t('payment.cardNumberPlaceholder')}
                  className={`input-field ${errors.cardNumber ? 'border-red-500' : ''}`}
                  maxLength={19} // 16 digits + 3 spaces
                  autoComplete="cc-number"
                />
                {errors.cardNumber && (
                  <p className="text-sm text-red-600 mt-1">{errors.cardNumber}</p>
                )}
              </div>

              {/* Expiry Date and CVV */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('payment.expiryDate')} *
                  </label>
                  <input
                    type="text"
                    value={expiryDate}
                    onChange={handleExpiryDateChange}
                    placeholder={t('payment.expiryPlaceholder')}
                    className={`input-field ${errors.expiryDate ? 'border-red-500' : ''}`}
                    maxLength={5} // MM/YY
                    autoComplete="cc-exp"
                  />
                  {errors.expiryDate && (
                    <p className="text-sm text-red-600 mt-1">{errors.expiryDate}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('payment.cvv')} *</label>
                  <input
                    type="text"
                    value={cvv}
                    onChange={handleCvvChange}
                    placeholder={t('payment.cvvPlaceholder')}
                    className={`input-field ${errors.cvv ? 'border-red-500' : ''}`}
                    maxLength={3}
                    autoComplete="cc-csc"
                  />
                  {errors.cvv && <p className="text-sm text-red-600 mt-1">{errors.cvv}</p>}
                </div>
              </div>

              {/* Cardholder Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('payment.cardholderName')}
                </label>
                <input
                  type="text"
                  value={cardholderName}
                  onChange={handleCardholderNameChange}
                  placeholder={t('payment.namePlaceholder')}
                  className={`input-field ${errors.cardholderName ? 'border-red-500' : ''}`}
                  autoComplete="cc-name"
                />
                {errors.cardholderName && (
                  <p className="text-sm text-red-600 mt-1">{errors.cardholderName}</p>
                )}
              </div>

              <Button type="submit" fullWidth disabled={processing}>
                {processing ? t('common.processing') : t('payment.payAmount', { amount: total.toFixed(2) })}
              </Button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">{t('payment.orderSummary')}</h2>

            {/* Table Number */}
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <p className="text-sm text-gray-600">{t('checkout.title')}</p>
              <p className="text-lg font-semibold text-gray-900">{t('invoice.table', { number: state.tableNumber })}</p>
            </div>

            {/* Items */}
            <div className="space-y-3 mb-4">
              {state.items.map((item, index) => {
                const itemPrice =
                  typeof item.menuItem.price === 'string'
                    ? parseFloat(item.menuItem.price)
                    : item.menuItem.price;
                const modifiersPrice = item.modifiers.reduce(
                  (sum, mod) =>
                    sum + (typeof mod.price === 'string' ? parseFloat(mod.price) : mod.price),
                  0
                );
                const lineTotal = (itemPrice + modifiersPrice) * item.quantity;

                return (
                  <div key={index} className="flex justify-between text-sm">
                    <div className="flex-1">
                      <p className="font-medium">
                        {item.quantity}x {item.menuItem.name}
                      </p>
                      {item.modifiers.length > 0 && (
                        <p className="text-xs text-gray-600">
                          + {item.modifiers.map((m) => m.name).join(', ')}
                        </p>
                      )}
                    </div>
                    <p className="font-medium">£{lineTotal.toFixed(2)}</p>
                  </div>
                );
              })}
            </div>

            {/* Totals */}
            <CartSummary subtotal={subtotal} gst={gst} total={total} />
          </div>
        </div>
      </main>
    </div>
  );
}
