import React from 'react';
import { X, Clock, Calendar, Tag } from 'lucide-react';
import type { Special } from '../../types/admin';

interface SpecialDetailModalProps {
  special: Special;
  onClose: () => void;
  onAddToCart?: () => void;
}

const SpecialDetailModal: React.FC<SpecialDetailModalProps> = ({
  special,
  onClose,
  onAddToCart,
}) => {
  const formatPrice = (price: number | string) => {
    const priceNum = typeof price === 'number' ? price : parseFloat(price);
    return `£${priceNum.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const groupItemsByCategory = () => {
    const grouped: Record<string, typeof special.items> = {};

    special.items.forEach((item) => {
      const category = item.custom_item_category || 'Items';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(item);
    });

    return grouped;
  };

  const groupedItems = groupItemsByCategory();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{special.name}</h2>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-3xl font-bold text-orange-600">
                {formatPrice(special.price)}
              </span>
              {special.is_active && (
                <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                  Active Now
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Description */}
          {special.description && (
            <div>
              <p className="text-gray-700 text-lg">{special.description}</p>
            </div>
          )}

          {/* Image */}
          {special.image_url && (
            <div className="rounded-lg overflow-hidden">
              <img
                src={special.image_url}
                alt={special.name}
                className="w-full h-64 object-cover"
              />
            </div>
          )}

          {/* Items Included */}
          {special.items && special.items.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Tag className="w-5 h-5 text-orange-600" />
                What's Included
              </h3>

              <div className="space-y-4">
                {Object.entries(groupedItems).map(([category, items]) => (
                  <div key={category} className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-2">{category}:</h4>
                    <ul className="space-y-2">
                      {items.map((item) => (
                        <li key={item.id} className="flex items-start gap-2 text-gray-700">
                          <span className="text-orange-500 mt-1">•</span>
                          <div className="flex-1">
                            <span className="font-medium">
                              {item.is_custom ? item.custom_item_name : item.menu_item_name}
                            </span>
                            {item.custom_item_description && (
                              <p className="text-sm text-gray-600 mt-1">
                                {item.custom_item_description}
                              </p>
                            )}
                            {item.quantity > 1 && (
                              <span className="text-sm text-gray-500 ml-2">
                                (x{item.quantity})
                              </span>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Availability */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Availability
            </h3>
            <div className="space-y-2 text-gray-700">
              {special.start_date && special.end_date && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span>
                    Valid from {formatDate(special.start_date)} to {formatDate(special.end_date)}
                  </span>
                </div>
              )}
              {special.start_date && !special.end_date && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span>Available from {formatDate(special.start_date)}</span>
                </div>
              )}
              {!special.start_date && special.end_date && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span>Available until {formatDate(special.end_date)}</span>
                </div>
              )}
              {!special.start_date && !special.end_date && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span>Available anytime</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            {onAddToCart && (
              <button
                onClick={onAddToCart}
                className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors"
              >
                Add Special to Cart
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpecialDetailModal;
