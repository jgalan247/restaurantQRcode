import { useMemo } from 'react';
import { MenuItem } from '../types/menu';
import { MenuFilters } from '../types/filters';
import { parsePrice } from '../utils/formatters';

export function useMenuFilters(items: MenuItem[], filters: MenuFilters): MenuItem[] {
  return useMemo(() => {
    return items.filter((item) => {
      // Dietary filter
      if (!filters.dietary.includes('all')) {
        if (filters.dietary.includes('vegetarian') && !item.dietary_tags.includes('v')) {
          return false;
        }
        if (filters.dietary.includes('vegan') && !item.dietary_tags.includes('vg')) {
          return false;
        }
      }

      // Spice level filter
      if (filters.spiceLevel !== 'all') {
        if (item.spice_level !== filters.spiceLevel) {
          return false;
        }
      }

      // Price range filter
      const price = parsePrice(item.price);
      switch (filters.priceRange) {
        case 'under-10':
          if (price >= 10) return false;
          break;
        case '10-15':
          if (price < 10 || price > 15) return false;
          break;
        case '15-20':
          if (price < 15 || price > 20) return false;
          break;
        case 'over-20':
          if (price < 20) return false;
          break;
      }

      // Category filters
      if (!filters.category.includes('all')) {
        let categoryMatch = false;
        if (filters.category.includes('children') && item.is_child_friendly) {
          categoryMatch = true;
        }
        if (filters.category.includes('salads') && item.is_salad) {
          categoryMatch = true;
        }
        if (filters.category.includes('deals') && item.is_deal) {
          categoryMatch = true;
        }
        if (filters.category.includes('gluten-free') && item.is_gluten_free) {
          categoryMatch = true;
        }
        if (!categoryMatch) {
          return false;
        }
      }

      // Meal type filters
      if (!filters.mealType.includes('all')) {
        let mealTypeMatch = false;
        if (filters.mealType.includes('lite-bite') && item.is_lite_bite) {
          mealTypeMatch = true;
        }
        // Note: We'll consider all items that aren't specifically categorized as other meal types
        if (filters.mealType.includes('main') && !item.is_lite_bite && price >= 10) {
          mealTypeMatch = true;
        }
        if (!mealTypeMatch) {
          return false;
        }
      }

      // Search query
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesDescription = item.description?.toLowerCase().includes(query);
        if (!matchesName && !matchesDescription) {
          return false;
        }
      }

      // Allergen filters
      if (filters.allergens.length > 0) {
        const itemAllergens = item.allergens || [];

        if (filters.allergenMode === 'exclude') {
          // Exclude items that contain ANY of the selected allergens
          const hasExcludedAllergen = filters.allergens.some((allergen) =>
            itemAllergens.includes(allergen)
          );
          if (hasExcludedAllergen) {
            return false;
          }
        } else {
          // Include mode: Show ONLY items that contain ALL selected allergens
          const hasAllAllergens = filters.allergens.every((allergen) =>
            itemAllergens.includes(allergen)
          );
          if (!hasAllAllergens) {
            return false;
          }
        }
      }

      return true;
    });
  }, [items, filters]);
}
