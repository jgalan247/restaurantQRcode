import { useState } from 'react';
import { MenuItem, CartItemModifier } from '../../types/menu';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { DietaryBadge } from './DietaryBadge';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';
import { parsePrice, formatCurrency } from '../../utils/formatters';
import { useTranslation } from 'react-i18next';
import { translateItemName, translateItemDescription } from '../../utils/menuTranslation';

interface MenuItemModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function MenuItemModal({ item, isOpen, onClose }: MenuItemModalProps) {
  const { addItem } = useCart();
  const { t } = useTranslation();
  const [selectedModifiers, setSelectedModifiers] = useState<CartItemModifier[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Wine variant selection state
  const [selectedVariant, setSelectedVariant] = useState<string>('small_glass');
  const [selectedVariantDisplay, setSelectedVariantDisplay] = useState<string>('Small Glass (125ml)');
  const [selectedPrice, setSelectedPrice] = useState<number>(0);

  if (!item) return null;

  // Initialize variant price when modal opens
  if (item.has_variants && selectedPrice === 0) {
    const initialPrice = parsePrice(item.price_small_glass || item.price);
    setSelectedPrice(initialPrice);
  }

  // Convert dietary_tags array to boolean flags
  const isVegetarian = item.dietary_tags?.includes('vegetarian') || false;
  const isVegan = item.dietary_tags?.includes('vegan') || false;
  const isGlutenFree = item.dietary_tags?.includes('gluten_free') || false;
  const isSpicy = item.dietary_tags?.includes('spicy') || false;

  const handleModifierToggle = (modifier: CartItemModifier) => {
    setSelectedModifiers((prev) => {
      const exists = prev.find((m) => m.id === modifier.id);
      if (exists) {
        return prev.filter((m) => m.id !== modifier.id);
      } else {
        return [...prev, modifier];
      }
    });
  };

  const handleVariantChange = (variant: string, price: string | number | undefined, display: string) => {
    setSelectedVariant(variant);
    setSelectedVariantDisplay(display);
    setSelectedPrice(parsePrice(price || item.price));
  };

  const calculateTotal = () => {
    // Use selected variant price if item has variants, otherwise use base price
    const basePrice = item.has_variants ? selectedPrice : parsePrice(item.price);
    const modifiersPrice = selectedModifiers.reduce((sum, mod) => sum + parsePrice(mod.price), 0);
    return (basePrice + modifiersPrice) * quantity;
  };

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      // Pass variant info for items with variants
      if (item.has_variants) {
        addItem(item, selectedModifiers, specialInstructions || undefined, {
          variant: selectedVariant,
          variantDisplay: selectedVariantDisplay,
          selectedPrice: selectedPrice
        });
      } else {
        addItem(item, selectedModifiers, specialInstructions || undefined);
      }
    }
    toast.success(t('cart.addedToCart', { quantity, name: item.name }));
    handleClose();
  };

  const handleClose = () => {
    setSelectedModifiers([]);
    setSpecialInstructions('');
    setQuantity(1);
    setSelectedVariant('small_glass');
    setSelectedVariantDisplay('Small Glass (125ml)');
    setSelectedPrice(0);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} maxWidth="lg">
      <div className="space-y-4">
        {item.image_url && (
          <div className="w-full h-48 overflow-hidden rounded-lg">
            <img
              src={item.image_url}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div>
          <h2 className="text-2xl font-bold text-gray-900">{translateItemName(item.name)}</h2>
          <p className="text-xl text-primary font-bold mt-1">{formatCurrency(item.price)}</p>
        </div>

        <DietaryBadge
          isVegetarian={isVegetarian}
          isVegan={isVegan}
          isGlutenFree={isGlutenFree}
          isSpicy={isSpicy}
        />

        {item.description && <p className="text-gray-700">{translateItemDescription(item.name, item.description)}</p>}

        {/* Wine/Drink Variant Selection */}
        {item.has_variants && (
          <div className="border-t border-b border-gray-200 py-4">
            <h3 className="font-semibold text-gray-900 mb-3">{t('menu.customize')}</h3>
            <div className="space-y-2">
              {item.price_small_glass && (
                <label
                  className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedVariant === 'small_glass'
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center flex-1">
                    <input
                      type="radio"
                      name="variant"
                      value="small_glass"
                      checked={selectedVariant === 'small_glass'}
                      onChange={() => handleVariantChange('small_glass', item.price_small_glass, 'Small Glass (125ml)')}
                      className="mr-3 h-5 w-5 text-primary focus:ring-primary"
                    />
                    <span className="text-gray-900 font-medium">{t('variants.smallGlass')}</span>
                  </div>
                  <span className="text-primary font-bold text-lg">
                    {formatCurrency(item.price_small_glass)}
                  </span>
                </label>
              )}

              {item.price_large_glass && (
                <label
                  className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedVariant === 'large_glass'
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center flex-1">
                    <input
                      type="radio"
                      name="variant"
                      value="large_glass"
                      checked={selectedVariant === 'large_glass'}
                      onChange={() => handleVariantChange('large_glass', item.price_large_glass, t('variants.largeGlass'))}
                      className="mr-3 h-5 w-5 text-primary focus:ring-primary"
                    />
                    <span className="text-gray-900 font-medium">{t('variants.largeGlass')}</span>
                  </div>
                  <span className="text-primary font-bold text-lg">
                    {formatCurrency(item.price_large_glass)}
                  </span>
                </label>
              )}

              {item.price_bottle && (
                <label
                  className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedVariant === 'bottle'
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center flex-1">
                    <input
                      type="radio"
                      name="variant"
                      value="bottle"
                      checked={selectedVariant === 'bottle'}
                      onChange={() => handleVariantChange('bottle', item.price_bottle, t('variants.bottle'))}
                      className="mr-3 h-5 w-5 text-primary focus:ring-primary"
                    />
                    <span className="text-gray-900 font-medium">{t('variants.bottle')}</span>
                  </div>
                  <span className="text-primary font-bold text-lg">
                    {formatCurrency(item.price_bottle)}
                  </span>
                </label>
              )}
            </div>
          </div>
        )}

        {item.modifiers && item.modifiers.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">{t('menu.addExtras')}</h3>
            <div className="space-y-2">
              {item.modifiers.map((modifier) => (
                <label
                  key={modifier.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedModifiers.some((m) => m.id === modifier.id)}
                      onChange={() => handleModifierToggle(modifier)}
                      className="mr-3 h-4 w-4 text-primary focus:ring-primary"
                    />
                    <span className="text-gray-900">{modifier.name}</span>
                  </div>
                  <span className="text-primary font-medium">
                    +{formatCurrency(modifier.price)}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('payment.specialInstructions')}
          </label>
          <textarea
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
            placeholder={t('payment.instructionsPlaceholder')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('menu.quantity')}</label>
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
            >
              -
            </Button>
            <span className="text-lg font-semibold w-8 text-center">{quantity}</span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setQuantity(Math.min(10, quantity + 1))}
            >
              +
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <span className="text-lg font-semibold text-gray-900">Total:</span>
          <span className="text-2xl font-bold text-primary">
            {formatCurrency(calculateTotal())}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            fullWidth
            variant="secondary"
            onClick={handleClose}
          >
            {t('common.close')}
          </Button>
          <Button
            fullWidth
            onClick={handleAddToCart}
            disabled={!item.is_available}
          >
            {item.is_available ? t('menu.addToCart') : t('menu.unavailable')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
