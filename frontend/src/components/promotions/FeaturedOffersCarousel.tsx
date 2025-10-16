import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import type { Offer } from '../../types/admin';

interface FeaturedOffersCarouselProps {
  offers: Offer[];
  onViewDetails: (offer: Offer) => void;
}

const FeaturedOffersCarousel: React.FC<FeaturedOffersCarouselProps> = ({
  offers,
  onViewDetails,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying || offers.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % offers.length);
    }, 5000); // Auto-rotate every 5 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying, offers.length]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % offers.length);
    setIsAutoPlaying(false);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + offers.length) % offers.length);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  if (!offers || offers.length === 0) {
    return null;
  }

  const currentOffer = offers[currentIndex];

  const getDiscountDisplay = (offer: Offer) => {
    switch (offer.discount_type) {
      case 'percentage':
        return `${offer.discount_value}% OFF`;
      case 'fixed':
        return `£${offer.discount_value} OFF`;
      case 'bogo':
        return 'BOGO';
      case 'free_item':
        return 'FREE ITEM';
      default:
        return 'SPECIAL OFFER';
    }
  };

  const getTimeDisplay = (offer: Offer) => {
    if (offer.applicable_times_start && offer.applicable_times_end) {
      const formatTime = (timeString: string) => {
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes}${ampm}`;
      };
      return `${formatTime(offer.applicable_times_start)} - ${formatTime(offer.applicable_times_end)}`;
    }
    if (offer.applicable_days && offer.applicable_days.length > 0) {
      return offer.applicable_days.map((day) => day.slice(0, 3)).join(', ');
    }
    return 'Available Now';
  };

  return (
    <div className="relative w-full bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }} />
      </div>

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between gap-4">
          {/* Previous Button */}
          {offers.length > 1 && (
            <button
              onClick={goToPrevious}
              className="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white transition-all"
              aria-label="Previous offer"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Offer Content */}
          <div className="flex-1 text-center text-white">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-5 h-5" />
              <span className="text-sm font-medium uppercase tracking-wide">Featured Offer</span>
              <Sparkles className="w-5 h-5" />
            </div>

            <div className="flex items-center justify-center gap-3 flex-wrap mb-2">
              <h2 className="text-2xl md:text-4xl font-bold">
                {currentOffer.name}
              </h2>
              <span className="px-4 py-2 bg-yellow-400 text-gray-900 text-xl font-bold rounded-full shadow-lg">
                {getDiscountDisplay(currentOffer)}
              </span>
            </div>

            {currentOffer.description && (
              <p className="text-white text-opacity-90 text-lg mb-3 max-w-2xl mx-auto">
                {currentOffer.description}
              </p>
            )}

            <div className="flex items-center justify-center gap-4 text-sm mb-4">
              <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full">
                {getTimeDisplay(currentOffer)}
              </span>
              {currentOffer.minimum_spend && Number(currentOffer.minimum_spend) > 0 && (
                <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full">
                  Min spend: £{typeof currentOffer.minimum_spend === 'number' ? currentOffer.minimum_spend.toFixed(2) : parseFloat(String(currentOffer.minimum_spend)).toFixed(2)}
                </span>
              )}
            </div>

            <button
              onClick={() => onViewDetails(currentOffer)}
              className="px-8 py-3 bg-white text-orange-600 font-semibold rounded-full hover:bg-gray-100 transition-colors shadow-lg"
            >
              View Details
            </button>
          </div>

          {/* Next Button */}
          {offers.length > 1 && (
            <button
              onClick={goToNext}
              className="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white transition-all"
              aria-label="Next offer"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Dots Indicator */}
        {offers.length > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            {offers.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? 'bg-white w-8'
                    : 'bg-white bg-opacity-40 hover:bg-opacity-60'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Mobile Navigation Buttons */}
      {offers.length > 1 && (
        <div className="md:hidden absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-between px-2 pointer-events-none">
          <button
            onClick={goToPrevious}
            className="w-8 h-8 rounded-full bg-white bg-opacity-30 hover:bg-opacity-50 text-white transition-all pointer-events-auto flex items-center justify-center"
            aria-label="Previous offer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={goToNext}
            className="w-8 h-8 rounded-full bg-white bg-opacity-30 hover:bg-opacity-50 text-white transition-all pointer-events-auto flex items-center justify-center"
            aria-label="Next offer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default FeaturedOffersCarousel;
