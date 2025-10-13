import { Trash2, Plus, Minus } from 'lucide-react';
import { CartItem as CartItemType } from '../../types/menu';
import { parsePrice, formatCurrency } from '../../utils/formatters';
import AllergenList from '../menu/AllergenList';

interface CartItemProps {
  item: CartItemType;
  index: number;
  onUpdateQuantity: (index: number, quantity: number) => void;
  onRemove: (index: number) => void;
}

export function CartItem({ item, index, onUpdateQuantity, onRemove }: CartItemProps) {
  const itemPrice = parsePrice(item.menuItem.price);
  const modifiersPrice = item.modifiers.reduce((sum, mod) => sum + parsePrice(mod.price), 0);
  const totalPrice = (itemPrice + modifiersPrice) * item.quantity;

  return (
    <div className="flex gap-3 p-3 border-b border-gray-200 last:border-b-0">
      <div className="flex-1">
        <h4 className="font-semibold text-gray-900">{item.menuItem.name}</h4>
        <p className="text-sm text-gray-600">{formatCurrency(itemPrice)}</p>

        {item.modifiers.length > 0 && (
          <div className="mt-1 text-sm text-gray-600">
            {item.modifiers.map((mod) => (
              <div key={mod.id}>
                + {mod.name} ({formatCurrency(mod.price)})
              </div>
            ))}
          </div>
        )}

        {item.specialInstructions && (
          <p className="mt-1 text-xs text-gray-500 italic">
            Note: {item.specialInstructions}
          </p>
        )}

        {item.menuItem.allergens && item.menuItem.allergens.length > 0 && (
          <div className="mt-2">
            <AllergenList allergens={item.menuItem.allergens} compact />
          </div>
        )}

        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => onUpdateQuantity(index, item.quantity - 1)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <Minus size={16} />
          </button>
          <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
          <button
            onClick={() => onUpdateQuantity(index, item.quantity + 1)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      <div className="flex flex-col items-end justify-between">
        <button
          onClick={() => onRemove(index)}
          className="text-red-600 hover:text-red-700 p-1"
        >
          <Trash2 size={18} />
        </button>
        <p className="font-semibold text-primary">{formatCurrency(totalPrice)}</p>
      </div>
    </div>
  );
}
