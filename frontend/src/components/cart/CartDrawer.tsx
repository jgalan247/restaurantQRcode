import { useEffect } from 'react';
import { X, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { CartItem } from './CartItem';
import { CartSummary } from './CartSummary';
import { Button } from '../common/Button';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { state, updateQuantity, removeItem, getCartSubtotal, getGSTAmount, getCartTotal } =
    useCart();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop with blur */}
      <div className="modal-overlay fixed inset-0" onClick={onClose} />

      {/* Drawer */}
      <div className="glass-panel fixed right-0 top-0 h-full w-full max-w-md shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">{t('cart.title')}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto">
          {state.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <ShoppingBag size={64} className="mb-4" />
              <p className="text-lg">{t('cart.empty')}</p>
              <p className="text-sm mt-1">{t('cart.continueShopping')}</p>
            </div>
          ) : (
            <div>
              {state.items.map((item, index) => (
                <CartItem
                  key={index}
                  item={item}
                  index={index}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeItem}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {state.items.length > 0 && (
          <div className="border-t border-gray-200 p-4 space-y-3">
            <CartSummary
              subtotal={getCartSubtotal()}
              gst={getGSTAmount()}
              total={getCartTotal()}
            />
            <Button fullWidth onClick={handleCheckout}>
              {t('cart.proceedToCheckout')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
