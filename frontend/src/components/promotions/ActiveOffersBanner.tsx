import React, { useState } from 'react';
import { Gift, ChevronDown, ChevronUp, Clock, Calendar } from 'lucide-react';
import type { Offer } from '../../types/admin';

interface ActiveOffersBannerProps {
  offers: Offer[];
  onViewDetails: (offer: Offer) => void;
}

const ActiveOffersBanner: React.FC<ActiveOffersBannerProps> = ({
  offers,
  onViewDetails,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!offers || offers.length === 0) {
    return null;
  }

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes}${ampm}`;
  };

  const getDiscountText = (offer: Offer) => {
    switch (offer.discount_type) {
      case 'percentage':
        return `${offer.discount_value}% OFF`;
      case 'fixed':
        return `£${offer.discount_value} OFF`;
      case 'bogo':
        return 'Buy 1 Get 1';
      case 'free_item':
        return 'Free Item';
      default:
        return 'Special Offer';
    }
  };

  const getOfferBadgeColor = (offer: Offer) => {
    switch (offer.discount_type) {
      case 'percentage':
        return 'bg-purple-100 text-purple-700';
      case 'fixed':
        return 'bg-green-100 text-green-700';
      case 'bogo':
        return 'bg-blue-100 text-blue-700';
      case 'free_item':
        return 'bg-pink-100 text-pink-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const displayedOffers = isExpanded ? offers : offers.slice(0, 2);

  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-t border-b border-purple-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between mb-3 group"
        >
          <h3 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
            <Gift className="w-5 h-5 text-purple-600" />
            Active Offers & Promotions
            <span className="px-2 py-0.5 bg-purple-600 text-white text-xs font-bold rounded-full">
              {offers.length}
            </span>
          </h3>
          <div className="flex items-center gap-2 text-purple-600 group-hover:text-purple-700">
            <span className="text-sm font-medium">
              {isExpanded ? 'Show Less' : 'View All'}
            </span>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </div>
        </button>

        {/* Offers List */}
        <div className="space-y-3">
          {displayedOffers.map((offer) => (
            <div
              key={offer.id}
              className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onViewDetails(offer)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getOfferBadgeColor(offer)}`}>
                      {getDiscountText(offer)}
                    </span>
                    {offer.is_featured && (
                      <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                        Featured
                      </span>
                    )}
                  </div>

                  <h4 className="text-lg font-semibold text-gray-900 mb-1">
                    {offer.name}
                  </h4>

                  {offer.description && (
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                      {offer.description}
                    </p>
                  )}

                  {/* Availability Info */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                    {offer.applicable_days && offer.applicable_days.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {offer.applicable_days.slice(0, 3).map(day =>
                          day.charAt(0).toUpperCase() + day.slice(1, 3)
                        ).join(', ')}
                        {offer.applicable_days.length > 3 && '...'}
                      </span>
                    )}
                    {offer.applicable_times_start && offer.applicable_times_end && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(offer.applicable_times_start)} - {formatTime(offer.applicable_times_end)}
                      </span>
                    )}
                    {offer.minimum_spend && Number(offer.minimum_spend) > 0 && (
                      <span className="font-medium text-purple-600">
                        Min spend: £{typeof offer.minimum_spend === 'number' ? offer.minimum_spend.toFixed(2) : parseFloat(String(offer.minimum_spend)).toFixed(2)}
                      </span>
                    )}
                  </div>

                  {/* Auto-apply indicator */}
                  <div className="mt-2">
                    <span className="inline-flex items-center text-xs text-green-600 font-medium">
                      ✓ Automatically applied at checkout
                    </span>
                  </div>
                </div>

                {/* View Details Arrow */}
                <div className="text-purple-600">
                  <ChevronDown className="w-5 h-5 transform -rotate-90" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Collapsed State - Show More Button */}
        {!isExpanded && offers.length > 2 && (
          <button
            onClick={() => setIsExpanded(true)}
            className="w-full mt-3 py-2 text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center justify-center gap-1"
          >
            +{offers.length - 2} more offers
            <ChevronDown className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ActiveOffersBanner;
