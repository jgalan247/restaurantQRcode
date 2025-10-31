import { Plus, AlertTriangle } from 'lucide-react';
import { MenuItem as MenuItemType } from '../../types/menu';
import { formatCurrency } from '../../utils/formatters';
import AllergenList from './AllergenList';
import { CalorieBadge } from './CalorieBadge';

interface MenuItemProps {
  item: MenuItemType;
  onClick: (item: MenuItemType) => void;
}

export function MenuItem({ item, onClick }: MenuItemProps) {
  // Convert dietary_tags array to boolean flags
  const isVegetarian = item.dietary_tags?.includes('v') || false;
  const isVegan = item.dietary_tags?.includes('vg') || false;
  const isGlutenFree = item.dietary_tags?.includes('gluten_free') || item.is_gluten_free;
  // const isSpicy = item.dietary_tags?.includes('spicy') || !!item.spice_level;  // Unused

  const getChiliCount = (level?: string): number => {
    switch (level) {
      case 'mild': return 1;
      case 'medium': return 2;
      case 'hot': return 3;
      case 'extra-hot': return 4;
      default: return 0;
    }
  };

  return (
    <div
      className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 border-l-4 border-orange-500 p-3 md:p-4 cursor-pointer"
      onClick={() => onClick(item)}
    >
      {item.image_url && (
        <div className="w-full h-32 sm:h-36 md:h-40 mb-3 overflow-hidden rounded-lg">
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="space-y-2">
        {/* Spice level indicator */}
        {item.spice_level && (
          <div className="flex gap-1 mb-2">
            {Array.from({ length: getChiliCount(item.spice_level) }).map((_, i) => (
              <span key={i} className="text-red-500 text-sm">🌶️</span>
            ))}
          </div>
        )}

        <div className="flex justify-between items-start gap-2">
          <div className="flex items-start gap-1 sm:gap-2 flex-1 min-w-0">
            <h3 className="font-semibold text-base md:text-lg text-gray-900 break-words">{item.name}</h3>
            {item.allergens && item.allergens.length > 0 && (
              <span
                className="text-orange-600 mt-0.5 flex-shrink-0"
                title="Contains allergens - see below for details"
              >
                <AlertTriangle size={14} className="sm:w-4 sm:h-4" />
              </span>
            )}
          </div>
          <span className="text-orange-600 font-bold text-base md:text-lg whitespace-nowrap flex-shrink-0">
            {formatCurrency(item.price)}
          </span>
        </div>

        {item.description && (
          <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">{item.description}</p>
        )}

        {/* Dietary badges */}
        <div className="flex gap-2 flex-wrap">
          {isVegetarian && (
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
              🥬 Vegetarian
            </span>
          )}
          {isVegan && (
            <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full font-medium">
              🌱 Vegan
            </span>
          )}
          {isGlutenFree && (
            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">
              GF
            </span>
          )}
          {item.is_lite_bite && (
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
              Lite Bite
            </span>
          )}
          {item.is_child_friendly && (
            <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full font-medium">
              👶 Kids
            </span>
          )}
          {item.calories && item.calories > 0 && (
            <CalorieBadge calories={item.calories} size="sm" />
          )}
        </div>

        {/* Allergen information */}
        {item.allergens && item.allergens.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <AllergenList allergens={item.allergens} compact />
          </div>
        )}

        {!item.is_available && (
          <div className="text-sm text-red-600 font-medium">Currently unavailable</div>
        )}

        {item.is_available && (
          <button
            className="w-full mt-2 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-3 md:px-4 rounded-lg transition-colors text-sm md:text-base"
            onClick={(e) => {
              e.stopPropagation();
              onClick(item);
            }}
          >
            <Plus size={18} className="md:w-5 md:h-5" />
            <span>Add to Cart</span>
          </button>
        )}
      </div>
    </div>
  );
}
