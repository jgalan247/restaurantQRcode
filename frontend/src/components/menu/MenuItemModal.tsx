import { useState } from 'react';
import { MenuItem, CartItemModifier } from '../../types/menu';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { DietaryBadge } from './DietaryBadge';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';
import { parsePrice, formatCurrency } from '../../utils/formatters';

interface MenuItemModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function MenuItemModal({ item, isOpen, onClose }: MenuItemModalProps) {
  const { addItem } = useCart();
  const [selectedModifiers, setSelectedModifiers] = useState<CartItemModifier[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [quantity, setQuantity] = useState(1);

  if (!item) return null;

  // Convert dietary_tags array to boolean flags
  const isVegetarian = item.dietary_tags.includes('vegetarian');
  const isVegan = item.dietary_tags.includes('vegan');
  const isGlutenFree = item.dietary_tags.includes('gluten_free');
  const isSpicy = item.dietary_tags.includes('spicy');

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

  const calculateTotal = () => {
    const basePrice = parsePrice(item.price);
    const modifiersPrice = selectedModifiers.reduce((sum, mod) => sum + parsePrice(mod.price), 0);
    return (basePrice + modifiersPrice) * quantity;
  };

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem(item, selectedModifiers, specialInstructions || undefined);
    }
    toast.success(`Added ${quantity}x ${item.name} to cart`);
    handleClose();
  };

  const handleClose = () => {
    setSelectedModifiers([]);
    setSpecialInstructions('');
    setQuantity(1);
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
          <h2 className="text-2xl font-bold text-gray-900">{item.name}</h2>
          <p className="text-xl text-primary font-bold mt-1">{formatCurrency(item.price)}</p>
        </div>

        <DietaryBadge
          isVegetarian={isVegetarian}
          isVegan={isVegan}
          isGlutenFree={isGlutenFree}
          isSpicy={isSpicy}
        />

        {item.description && <p className="text-gray-700">{item.description}</p>}

        {item.modifiers && item.modifiers.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Customize your order</h3>
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
            Special Instructions (optional)
          </label>
          <textarea
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
            placeholder="e.g., No onions, extra sauce..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
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
            Close
          </Button>
          <Button
            fullWidth
            onClick={handleAddToCart}
            disabled={!item.is_available}
          >
            {item.is_available ? 'Add to Cart' : 'Unavailable'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
