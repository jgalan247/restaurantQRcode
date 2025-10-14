export type DietaryFilter = 'vegetarian' | 'vegan' | 'all';
export type SpiceLevel = 'all' | 'mild' | 'medium' | 'hot' | 'extra-hot';
export type MealType = 'lite-bite' | 'main' | 'sharing' | 'dessert' | 'drink' | 'all';
export type SpecialCategory = 'children' | 'salads' | 'deals' | 'gluten-free' | 'all';
export type PriceRange = 'all' | 'under-10' | '10-15' | '15-20' | 'over-20';
export type AllergenFilterMode = 'exclude' | 'include';

export interface MenuFilters {
  dietary: DietaryFilter[];
  spiceLevel: SpiceLevel;
  mealType: MealType[];
  category: SpecialCategory[];
  priceRange: PriceRange;
  searchQuery: string;
  allergens: string[];
  allergenMode: AllergenFilterMode;
  showSpecialsOnly: boolean;
  showOffersOnly: boolean;
}

export const DEFAULT_FILTERS: MenuFilters = {
  dietary: ['all'],
  spiceLevel: 'all',
  mealType: ['all'],
  category: ['all'],
  priceRange: 'all',
  searchQuery: '',
  allergens: [],
  allergenMode: 'exclude',
  showSpecialsOnly: false,
  showOffersOnly: false,
};
