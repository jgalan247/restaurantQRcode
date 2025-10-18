import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { CartSummary } from '../components/cart/CartSummary';
import { PaymentOptions } from '../components/payment/PaymentOptions';
import { TipSelector } from '../components/payment/TipSelector';
import { SplitEqualForm } from '../components/payment/SplitEqualForm';
import { SplitByItemsForm } from '../components/payment/SplitByItemsForm';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { orderService } from '../services/orderService';
import { paymentService } from '../services/paymentService';
import { PaymentMethod } from '../types/payment';
import { LoadingSpinner } from '../components/layout/LoadingSpinner';
import toast from 'react-hot-toast';

type Step = 'customer-info' | 'payment-method' | 'payment-details' | 'tip' | 'processing';

export function CheckoutPage() {
  const navigate = useNavigate();
  const { state, getCartSubtotal, getGSTAmount, clearCart } = useCart();

  const [step, setStep] = useState<Step>('customer-info');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [tipPercentage, setTipPercentage] = useState(0);
  const [tipAmount, setTipAmount] = useState(0);
  const [splitEmails, setSplitEmails] = useState<string[]>([]);
  const [splitByItemsData, setSplitByItemsData] = useState<
    { email: string; item_ids: number[] }[]
  >([]);
  const [loading, setLoading] = useState(false);

  const subtotal = getCartSubtotal();
  const gst = getGSTAmount();
  const total = subtotal + gst + tipAmount;

  const handleCustomerInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerEmail) {
      toast.error('Email is required');
      return;
    }
    setStep('payment-method');
  };

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    setPaymentMethod(method);
    if (method === PaymentMethod.SINGLE) {
      setStep('tip');
    } else {
      setStep('payment-details');
    }
  };

  const handleSplitEqualSubmit = (emails: string[]) => {
    setSplitEmails(emails);
    setStep('tip');
  };

  const handleSplitByItemsSubmit = (splits: { email: string; item_ids: number[] }[]) => {
    setSplitByItemsData(splits);
    setStep('tip');
  };

  const handleFinalSubmit = async () => {
    try {
      setLoading(true);
      setStep('processing');

      // Create order
      const orderData = {
        table_number: state.tableNumber,
        session_token: state.sessionToken,
        items: state.items.map((item) => ({
          menu_item_id: item.menuItem.id,
          quantity: item.quantity,
          modifiers: item.modifiers.map((m) => m.id),
          special_instructions: item.specialInstructions,
        })),
        customer_name: customerName || undefined,
        customer_email: customerEmail,
        special_requests: specialRequests || undefined,
      };

      const order = await orderService.createOrder(orderData);

      console.log('Order created:', order);
      console.log('Payment method selected:', paymentMethod);

      // Create payment based on method
      if (paymentMethod === PaymentMethod.SINGLE) {
        console.log('Creating single payment for order:', order.id);
        // For single payment, create payment intent and redirect to CityPay
        const paymentResponse = await paymentService.createSinglePayment(order.id, {
          card_number: '4111111111111111', // Placeholder - will be entered on CityPay page
          expiry_date: '12/25',
          cvv: '123',
          cardholder_name: customerName || customerEmail,
          tip_percentage: tipPercentage,
        });

        // Clear cart
        clearCart();

        // Redirect to CityPay payment page
        if (paymentResponse.payment_url) {
          toast.success('Redirecting to secure payment page...');
          window.location.href = paymentResponse.payment_url;
          return;
        } else {
          toast.error('Payment URL not received from payment processor');
          setStep('tip');
          return;
        }
      } else if (paymentMethod === PaymentMethod.SPLIT_EQUAL) {
        await paymentService.splitPaymentEqually(order.id, {
          people_count: splitEmails.length,
          emails: splitEmails,
          tip_percentage: tipPercentage,
        });
      } else if (paymentMethod === PaymentMethod.SPLIT_BY_ITEMS) {
        // Map cart item indexes to order item IDs
        const splitsWithOrderItemIds = splitByItemsData.map((split) => ({
          email: split.email,
          item_ids: split.item_ids.map((index) => order.items[index].id),
        }));

        await paymentService.splitPaymentByItems(order.id, {
          splits: splitsWithOrderItemIds,
          tip_percentage: tipPercentage,
        });
      }

      // Clear cart and show success
      clearCart();
      toast.success('Order placed successfully! Check your email for payment details.');
      navigate(`/payment-success?order=${order.order_number}&id=${order.id}`);
    } catch (err: any) {
      console.error('Checkout failed:', err);
      toast.error(err.message || 'Failed to process order. Please try again.');
      setStep('tip');
    } finally {
      setLoading(false);
    }
  };

  if (state.items.length === 0) {
    return (
      <div className="page-container flex items-center justify-center">
        <div className="content-container text-center">
          <p className="text-gray-600 mb-4">Your cart is empty</p>
          <Button onClick={() => navigate('/')}>Back to Menu</Button>
        </div>
      </div>
    );
  }

  if (loading || step === 'processing') {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="page-container">
      <header className="on-gradient-bg shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => {
              if (step === 'customer-info') {
                navigate('/');
              } else if (step === 'payment-method') {
                setStep('customer-info');
              } else if (step === 'payment-details') {
                setStep('payment-method');
              } else if (step === 'tip') {
                if (paymentMethod === PaymentMethod.SINGLE) {
                  setStep('payment-method');
                } else {
                  setStep('payment-details');
                }
              }
            }}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold">Checkout</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* Customer Info Step */}
        {step === 'customer-info' && (
          <div className="card space-y-4">
            <h2 className="text-xl font-bold">Your Information</h2>
            <form onSubmit={handleCustomerInfoSubmit} className="space-y-4">
              <Input
                label="Name (optional)"
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="John Doe"
              />
              <Input
                label="Email *"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="john@example.com"
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Special Requests (optional)
                </label>
                <textarea
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="Any special requests or dietary requirements..."
                  className="input-field resize-none"
                  rows={3}
                />
              </div>
              <CartSummary subtotal={subtotal} gst={gst} total={subtotal + gst} />
              <Button type="submit" fullWidth>
                Continue
              </Button>
            </form>
          </div>
        )}

        {/* Payment Method Step */}
        {step === 'payment-method' && (
          <div className="card">
            <PaymentOptions onMethodSelect={handlePaymentMethodSelect} />
          </div>
        )}

        {/* Payment Details Step */}
        {step === 'payment-details' && (
          <div className="card">
            {paymentMethod === PaymentMethod.SPLIT_EQUAL && (
              <SplitEqualForm
                onSubmit={handleSplitEqualSubmit}
                onBack={() => setStep('payment-method')}
              />
            )}
            {paymentMethod === PaymentMethod.SPLIT_BY_ITEMS && (
              <SplitByItemsForm
                onSubmit={handleSplitByItemsSubmit}
                onBack={() => setStep('payment-method')}
              />
            )}
          </div>
        )}

        {/* Tip Step */}
        {step === 'tip' && (
          <div className="card space-y-6">
            <TipSelector subtotal={subtotal} onTipChange={(pct, amt) => {
              setTipPercentage(pct);
              setTipAmount(amt);
            }} />

            <CartSummary subtotal={subtotal} gst={gst} tip={tipAmount} total={total} />

            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  if (paymentMethod === PaymentMethod.SINGLE) {
                    setStep('payment-method');
                  } else {
                    setStep('payment-details');
                  }
                }}
                fullWidth
              >
                Back
              </Button>
              <Button onClick={handleFinalSubmit} fullWidth>
                Place Order
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
