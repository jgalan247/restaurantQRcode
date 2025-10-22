import { useState, useEffect, useMemo } from 'react';
import { Header } from '../components/layout/Header';
import { LoadingSpinner } from '../components/layout/LoadingSpinner';
import { MenuCategory } from '../components/menu/MenuCategory';
import { MenuItemModal } from '../components/menu/MenuItemModal';
import { CartDrawer } from '../components/cart/CartDrawer';
import MenuFilters from '../components/menu/MenuFilters';
import AllergenWarningModal from '../components/menu/AllergenWarningModal';
import { MenuNavigation } from '../components/menu/MenuNavigation';
import { BudgetBuilderButton } from '../components/budget/BudgetBuilderButton';
import { SimpleBudgetBuilderModal } from '../components/budget/SimpleBudgetBuilderModal';
import FeaturedOffersCarousel from '../components/promotions/FeaturedOffersCarousel';
import DailySpecialsSection from '../components/promotions/DailySpecialsSection';
import ActiveOffersBanner from '../components/promotions/ActiveOffersBanner';
import SpecialDetailModal from '../components/promotions/SpecialDetailModal';
import OfferDetailModal from '../components/promotions/OfferDetailModal';
import { Category, MenuItem } from '../types/menu';
import { MenuFilters as MenuFiltersType, DEFAULT_FILTERS } from '../types/filters';
import { menuService } from '../services/menuService';
import { promotionsApi } from '../services/promotionsApi';
import { useCart } from '../context/CartContext';
import { useSearchParams } from 'react-router-dom';
import { useMenuFilters } from '../hooks/useMenuFilters';
import { AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Special, Offer } from '../types/admin';

export function MenuPage() {
  const [searchParams] = useSearchParams();
  const { setTableInfo } = useCart();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [filters, setFilters] = useState<MenuFiltersType>(DEFAULT_FILTERS);
  const [showAllergenModal, setShowAllergenModal] = useState(false);
  const [showBudgetBuilder, setShowBudgetBuilder] = useState(false);

  // Promotions state
  const [featuredOffers, setFeaturedOffers] = useState<Offer[]>([]);
  const [activeOffers, setActiveOffers] = useState<Offer[]>([]);
  const [activeSpecials, setActiveSpecials] = useState<Special[]>([]);
  const [selectedSpecial, setSelectedSpecial] = useState<Special | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);

  // Get all menu items from all categories
  const allItems = useMemo(() => {
    return categories.flatMap(cat => cat.items);
  }, [categories]);

  // Apply filters to get filtered items
  const filteredItems = useMenuFilters(allItems, filters, {
    specials: activeSpecials,
    offers: activeOffers,
  });

  // Reorganize filtered items back into categories
  const filteredCategories = useMemo(() => {
    return categories.map(cat => ({
      ...cat,
      items: cat.items.filter(item => filteredItems.includes(item))
    })).filter(cat => cat.items.length > 0);
  }, [categories, filteredItems]);

  useEffect(() => {
    // Extract table info from URL params
    const tableNumber = searchParams.get('table');
    const sessionToken = searchParams.get('session');

    // Check for payment success redirect
    const paymentStatus = searchParams.get('payment');
    if (paymentStatus === 'success') {
      toast.success('Payment successful! Thank you for your order.', {
        duration: 5000,
        icon: '✅',
      });
      // Clear the payment parameter from URL after showing message
      window.history.replaceState({}, '', '/');
    } else if (paymentStatus === 'failure') {
      toast.error('Payment failed. Please try again.', {
        duration: 5000,
        icon: '❌',
      });
      window.history.replaceState({}, '', '/');
    }

    if (tableNumber && sessionToken) {
      setTableInfo(tableNumber, sessionToken);
    } else {
      // TODO: In production, extract table number from QR code parameter
      // For testing without QR code - hardcoded to table 11
      setTableInfo('11', 'test-session-token');
    }

    loadMenu();
    loadPromotions();
  }, [searchParams, setTableInfo]);

  // Show allergen warning on first visit
  useEffect(() => {
    const hasSeenWarning = localStorage.getItem('allergen_warning_seen');
    if (!hasSeenWarning) {
      setShowAllergenModal(true);
      localStorage.setItem('allergen_warning_seen', 'true');
    }
  }, []);

  const loadMenu = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await menuService.getMenu();
      setCategories(data);
    } catch (err) {
      console.error('Failed to load menu:', err);
      setError('Failed to load menu. Please try again.');
      toast.error('Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  const loadPromotions = async () => {
    try {
      const tableNumber = searchParams.get('table');
      const table = tableNumber ? parseInt(tableNumber) : undefined;

      // Load all promotions in parallel
      const [featured, offers, specials] = await Promise.all([
        promotionsApi.getFeaturedOffers(),
        promotionsApi.getActiveOffers(table),
        promotionsApi.getActiveSpecials(table),
      ]);

      setFeaturedOffers(featured);
      setActiveOffers(offers);
      setActiveSpecials(specials);
    } catch (err) {
      console.error('Failed to load promotions:', err);
      // Don't show error to user, just silently fail - menu still works
    }
  };

  const handleItemClick = (item: MenuItem) => {
    setSelectedItem(item);
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={loadMenu} className="btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <Header onCartClick={() => setIsCartOpen(true)} />

      {/* Featured Offers Carousel */}
      {featuredOffers.length > 0 && (
        <FeaturedOffersCarousel
          offers={featuredOffers}
          onViewDetails={(offer) => setSelectedOffer(offer)}
        />
      )}

      {/* Daily Specials Section */}
      {activeSpecials.length > 0 && (
        <DailySpecialsSection
          specials={activeSpecials}
          onViewDetails={(special) => setSelectedSpecial(special)}
        />
      )}

      {/* Active Offers Banner */}
      {activeOffers.length > 0 && (
        <ActiveOffersBanner
          offers={activeOffers}
          onViewDetails={(offer) => setSelectedOffer(offer)}
        />
      )}

      <MenuFilters
        filters={filters}
        onFilterChange={setFilters}
        hasActiveSpecials={activeSpecials.length > 0}
        hasActiveOffers={activeOffers.length > 0}
      />

      <MenuNavigation
        categories={filteredCategories}
        onNavigate={(categoryId) => console.log('Navigating to category:', categoryId)}
      />

      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 md:py-6">
        <div className="mb-4 md:mb-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-2">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Our Menu</h1>
              <p className="text-sm md:text-base text-gray-600 mt-1">
                Authentic Mexican cuisine made with fresh ingredients
              </p>
            </div>
            <button
              onClick={() => setShowAllergenModal(true)}
              className="flex items-center justify-center gap-2 bg-yellow-500 text-yellow-900 px-3 py-2 rounded-lg hover:bg-yellow-600 transition text-xs md:text-sm font-medium self-start sm:self-auto"
            >
              <AlertTriangle size={16} />
              <span>Allergen Info</span>
            </button>
          </div>
          {filteredItems.length !== allItems.length && (
            <p className="text-xs md:text-sm text-orange-600 mt-2">
              Showing {filteredItems.length} of {allItems.length} items
            </p>
          )}
        </div>

        {filteredCategories.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No menu items match your filters.</p>
            <button
              onClick={() => setFilters(DEFAULT_FILTERS)}
              className="mt-4 text-orange-600 hover:text-orange-700 underline"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredCategories
              .sort((a, b) => a.display_order - b.display_order)
              .map((category) => (
                <MenuCategory
                  key={category.id}
                  category={category}
                  onItemClick={handleItemClick}
                />
              ))}
          </div>
        )}
      </main>

      <MenuItemModal
        item={selectedItem}
        isOpen={selectedItem !== null}
        onClose={() => setSelectedItem(null)}
      />

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      <AllergenWarningModal
        isOpen={showAllergenModal}
        onClose={() => setShowAllergenModal(false)}
      />

      <SimpleBudgetBuilderModal
        isOpen={showBudgetBuilder}
        onClose={() => setShowBudgetBuilder(false)}
      />

      {/* Promotions Modals */}
      {selectedSpecial && (
        <SpecialDetailModal
          special={selectedSpecial}
          onClose={() => setSelectedSpecial(null)}
          onAddToCart={() => {
            // TODO: Implement add special to cart logic
            toast.success('Special added to cart!');
            setSelectedSpecial(null);
          }}
        />
      )}

      {selectedOffer && (
        <OfferDetailModal
          offer={selectedOffer}
          onClose={() => setSelectedOffer(null)}
        />
      )}

      <BudgetBuilderButton onClick={() => setShowBudgetBuilder(true)} />
    </div>
  );
}
