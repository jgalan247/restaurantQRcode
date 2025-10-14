import React from 'react';
import { Star, Clock, ChevronRight } from 'lucide-react';
import type { Special } from '../../types/admin';

interface DailySpecialsSectionProps {
  specials: Special[];
  onViewDetails: (special: Special) => void;
}

const DailySpecialsSection: React.FC<DailySpecialsSectionProps> = ({
  specials,
  onViewDetails,
}) => {
  if (!specials || specials.length === 0) {
    return null;
  }

  const formatPrice = (price: number | string) => {
    const priceNum = typeof price === 'number' ? price : parseFloat(price);
    return `£${priceNum.toFixed(2)}`;
  };

  const getAvailabilityText = (special: Special) => {
    if (special.start_date && special.end_date) {
      const start = new Date(special.start_date);
      const end = new Date(special.end_date);
      const today = new Date();

      if (end.toDateString() === today.toDateString()) {
        return 'Last Day!';
      }
    }
    return 'Available Now';
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
            Today's Specials
          </h2>
        </div>

        {/* Horizontal Scroll Container */}
        <div className="relative">
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
            {specials.map((special) => (
              <div
                key={special.id}
                className="flex-shrink-0 w-80 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow snap-start"
              >
                {/* Image */}
                {special.image_url ? (
                  <div className="h-48 overflow-hidden rounded-t-xl bg-gray-200">
                    <img
                      src={special.image_url}
                      alt={special.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-48 bg-gradient-to-br from-orange-400 to-red-500 rounded-t-xl flex items-center justify-center">
                    <Star className="w-16 h-16 text-white opacity-50" />
                  </div>
                )}

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-bold text-gray-900 flex-1">
                      {special.name}
                    </h3>
                    <span className="text-2xl font-bold text-orange-600 ml-2">
                      {formatPrice(special.price)}
                    </span>
                  </div>

                  {special.description && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {special.description}
                    </p>
                  )}

                  {/* Availability Badge */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                      <Clock className="w-3 h-3" />
                      {getAvailabilityText(special)}
                    </span>
                    {special.is_active && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                        Active
                      </span>
                    )}
                  </div>

                  {/* Items Preview */}
                  {special.items && special.items.length > 0 && (
                    <div className="mb-4 text-sm text-gray-600">
                      <p className="font-medium text-gray-700 mb-1">Includes:</p>
                      <ul className="space-y-1">
                        {special.items.slice(0, 3).map((item, idx) => (
                          <li key={idx} className="flex items-start gap-1">
                            <span className="text-orange-500">•</span>
                            <span className="line-clamp-1">
                              {item.is_custom ? item.custom_item_name : item.menu_item_name}
                            </span>
                          </li>
                        ))}
                        {special.items.length > 3 && (
                          <li className="text-blue-600 text-xs">
                            +{special.items.length - 3} more items
                          </li>
                        )}
                      </ul>
                    </div>
                  )}

                  {/* View Details Button */}
                  <button
                    onClick={() => onViewDetails(special)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    View Details
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Scroll Indicator (optional, for visual hint) */}
          {specials.length > 1 && (
            <div className="text-center mt-2 text-sm text-gray-500">
              Swipe to see more →
            </div>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
};

export default DailySpecialsSection;
