import React from 'react';
import { X, Tag, Clock, Calendar, Info, ShoppingBag } from 'lucide-react';
import type { Offer } from '../../types/admin';
import { formatPrice, formatCurrency, safeParseNumber } from '../../utils/format';

interface OfferDetailModalProps {
  offer: Offer;
  onClose: () => void;
}

const OfferDetailModal: React.FC<OfferDetailModalProps> = ({ offer, onClose }) => {
  // Log offer data for debugging
  console.log('Offer data:', offer);
  console.log('Discount value type:', typeof offer.discount_value);
  console.log('Discount value:', offer.discount_value);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getDiscountDisplay = (): string => {
    try {
      // Safely parse numeric values
      const discountValue = safeParseNumber(offer.discount_value);
      const discountPercentage = safeParseNumber(offer.discount_percentage);
      const offerType = offer.offer_type || offer.discount_type;

      switch (offerType) {
        case 'percentage':
          return `${discountPercentage.toFixed(0)}% Off`;

        case 'fixed_amount':
        case 'fixed':
          return `£${formatPrice(discountValue)} Off`;

        case 'bogo':
          return `Buy ${offer.bogo_buy_quantity || 1} Get ${offer.bogo_get_quantity || 1} Free`;

        case 'free_item':
          return `Free ${offer.free_item_name || 'Item'}`;

        case 'bundle':
          return `Bundle Deal - £${formatPrice(discountValue)}`;

        case 'kids_free':
          return 'Kids Eat Free';

        default:
          return 'Special Offer';
      }
    } catch (error) {
      console.error('Error displaying offer discount:', error);
      return 'Special Offer';
    }
  };

  const getOfferTypeColor = () => {
    const offerType = offer.offer_type || offer.discount_type;

    switch (offerType) {
      case 'percentage':
        return 'bg-purple-100 text-purple-700';
      case 'fixed':
      case 'fixed_amount':
        return 'bg-green-100 text-green-700';
      case 'bogo':
        return 'bg-blue-100 text-blue-700';
      case 'free_item':
        return 'bg-pink-100 text-pink-700';
      case 'bundle':
        return 'bg-yellow-100 text-yellow-700';
      case 'kids_free':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Safely get minimum spend value
  const minSpend = safeParseNumber(offer.min_spend || offer.minimum_spend);
  const maxDiscountCap = safeParseNumber(offer.max_discount_cap);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-red-500 text-white p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getOfferTypeColor()} bg-white`}>
                  {getDiscountDisplay()}
                </span>
                {offer.is_active && (
                  <span className="px-3 py-1 bg-green-500 text-white text-sm font-medium rounded-full">
                    Active Now
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-bold">{offer.name}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Description */}
          {(offer.customer_description || offer.description) && (
            <div>
              <p className="text-gray-700 text-lg leading-relaxed">
                {offer.customer_description || offer.description}
              </p>
            </div>
          )}

          {/* Details Section */}
          <div className="bg-orange-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Info className="w-5 h-5 text-orange-600" />
              Offer Details
            </h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-1">•</span>
                <span>
                  <strong>{getDiscountDisplay()}</strong>{' '}
                  {(offer.offer_type === 'percentage' || offer.discount_type === 'percentage') && 'on eligible items'}
                  {(offer.offer_type === 'fixed_amount' || offer.discount_type === 'fixed') && 'on your order'}
                  {offer.offer_type === 'bogo' && '- Buy one item, get another free or discounted'}
                  {offer.offer_type === 'free_item' && 'with qualifying purchase'}
                  {offer.offer_type === 'bundle' && 'on selected items'}
                </span>
              </li>

              {minSpend > 0 && (
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <span>Minimum spend: {formatCurrency(minSpend)}</span>
                </li>
              )}

              {maxDiscountCap > 0 && (
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <span>Maximum discount: {formatCurrency(maxDiscountCap)}</span>
                </li>
              )}

              {offer.applicable_days && offer.applicable_days.length > 0 && (
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <span>
                    Available: {offer.applicable_days.map((day) => day.charAt(0).toUpperCase() + day.slice(1)).join(', ')}
                  </span>
                </li>
              )}

              {offer.applicable_times_start && offer.applicable_times_end && (
                <li className="flex items-start gap-2">
                  <Clock className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  <span>
                    Time: {formatTime(offer.applicable_times_start)} - {formatTime(offer.applicable_times_end)}
                  </span>
                </li>
              )}

              {offer.start_date && offer.end_date && (
                <li className="flex items-start gap-2">
                  <Calendar className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  <span>
                    Valid: {formatDate(offer.start_date)} - {formatDate(offer.end_date)}
                  </span>
                </li>
              )}

              {!offer.applicable_times_start && !offer.start_date && (
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <span>Available anytime</span>
                </li>
              )}

              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-1">•</span>
                <span className="font-medium text-green-600">
                  Automatically applied at checkout
                </span>
              </li>
            </ul>
          </div>

          {/* Promo Code */}
          {offer.promo_code && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border-2 border-dashed border-purple-300">
              <div className="flex items-center gap-3">
                <Tag className="w-6 h-6 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Promo Code</p>
                  <p className="text-lg font-bold text-purple-700">{offer.promo_code}</p>
                </div>
              </div>
            </div>
          )}

          {!offer.promo_code && (offer.offer_type === 'percentage' || offer.discount_type === 'percentage') && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border-2 border-dashed border-purple-300">
              <div className="flex items-center gap-3">
                <Tag className="w-6 h-6 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">No code needed</p>
                  <p className="text-lg font-bold text-purple-700">Auto-applied at checkout</p>
                </div>
              </div>
            </div>
          )}

          {/* Terms & Conditions */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Terms & Conditions:</h3>
            <ul className="space-y-1 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-gray-400 mt-0.5">•</span>
                <span>Cannot be combined with other offers unless specified</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400 mt-0.5">•</span>
                <span>Offer valid for dine-in orders only</span>
              </li>
              {offer.max_usage && offer.max_usage > 0 && (
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-0.5">•</span>
                  <span>Limited to {offer.max_usage} total redemptions</span>
                </li>
              )}
              <li className="flex items-start gap-2">
                <span className="text-gray-400 mt-0.5">•</span>
                <span>Management reserves the right to modify or cancel this offer</span>
              </li>
            </ul>
          </div>

          {/* Usage Stats (if available) */}
          {offer.usage_count > 0 && (
            <div className="text-center py-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                <span className="font-semibold text-orange-600">{offer.usage_count}</span> customers have used this offer
              </p>
            </div>
          )}
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
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-5 h-5" />
              Browse Menu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferDetailModal;
