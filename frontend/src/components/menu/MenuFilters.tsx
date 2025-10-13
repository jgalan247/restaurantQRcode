import React, { useState } from 'react';
import { MenuFilters as MenuFiltersType, DEFAULT_FILTERS } from '../../types/filters';
import { X, Search, Filter, AlertTriangle } from 'lucide-react';
import { ALLERGEN_INFO, AllergenType } from '../../types/allergens';

interface MenuFiltersProps {
  filters: MenuFiltersType;
  onFilterChange: (filters: MenuFiltersType) => void;
}

const MenuFilters: React.FC<MenuFiltersProps> = ({ filters, onFilterChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilter = <K extends keyof MenuFiltersType>(
    key: K,
    value: MenuFiltersType[K]
  ) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const toggleDietary = (option: 'vegetarian' | 'vegan' | 'all') => {
    if (option === 'all') {
      updateFilter('dietary', ['all']);
    } else {
      const current = filters.dietary.filter((d) => d !== 'all');
      if (current.includes(option)) {
        const newDietary = current.filter((d) => d !== option);
        updateFilter('dietary', newDietary.length === 0 ? ['all'] : newDietary);
      } else {
        updateFilter('dietary', [...current, option]);
      }
    }
  };

  const toggleCategory = (option: 'children' | 'salads' | 'deals' | 'gluten-free' | 'all') => {
    if (option === 'all') {
      updateFilter('category', ['all']);
    } else {
      const current = filters.category.filter((c) => c !== 'all');
      if (current.includes(option)) {
        const newCategory = current.filter((c) => c !== option);
        updateFilter('category', newCategory.length === 0 ? ['all'] : newCategory);
      } else {
        updateFilter('category', [...current, option]);
      }
    }
  };

  const toggleAllergen = (allergen: string) => {
    if (filters.allergens.includes(allergen)) {
      updateFilter('allergens', filters.allergens.filter((a) => a !== allergen));
    } else {
      updateFilter('allergens', [...filters.allergens, allergen]);
    }
  };

  const clearAllFilters = () => {
    onFilterChange(DEFAULT_FILTERS);
  };

  const activeFilterCount =
    (filters.dietary.includes('all') ? 0 : filters.dietary.length) +
    (filters.spiceLevel !== 'all' ? 1 : 0) +
    (filters.category.includes('all') ? 0 : filters.category.length) +
    (filters.priceRange !== 'all' ? 1 : 0) +
    (filters.searchQuery ? 1 : 0) +
    (filters.allergens.length > 0 ? 1 : 0);

  const getChiliEmoji = (level: string) => {
    switch (level) {
      case 'mild':
        return '🌶️';
      case 'medium':
        return '🌶️🌶️';
      case 'hot':
        return '🌶️🌶️🌶️';
      case 'extra-hot':
        return '🌶️🌶️🌶️🌶️';
      default:
        return '';
    }
  };

  return (
    <div className="sticky top-16 z-20 bg-white shadow-md border-b-4 border-orange-500">
      {/* Header with toggle */}
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              <Filter size={20} />
              <span className="font-semibold">Filters</span>
              {activeFilterCount > 0 && (
                <span className="bg-white text-orange-500 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Search bar */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search menu..."
                value={filters.searchQuery}
                onChange={(e) => updateFilter('searchQuery', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
              />
            </div>
          </div>

          {activeFilterCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-red-600 hover:text-red-800 font-medium underline self-center sm:self-auto"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Expanded filter panel */}
        {isExpanded && (
          <div className="mt-4 p-4 bg-orange-50 rounded-lg space-y-4">
            {/* Dietary Filters */}
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Dietary Preferences</h3>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => toggleDietary('all')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    filters.dietary.includes('all')
                      ? 'bg-green-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-green-100'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => toggleDietary('vegetarian')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    filters.dietary.includes('vegetarian')
                      ? 'bg-green-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-green-100'
                  }`}
                >
                  🥬 Vegetarian
                </button>
                <button
                  onClick={() => toggleDietary('vegan')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    filters.dietary.includes('vegan')
                      ? 'bg-green-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-green-100'
                  }`}
                >
                  🌱 Vegan
                </button>
              </div>
            </div>

            {/* Spice Level */}
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Spice Level</h3>
              <div className="flex gap-2 flex-wrap">
                {(['all', 'mild', 'medium', 'hot', 'extra-hot'] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => updateFilter('spiceLevel', level)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      filters.spiceLevel === level
                        ? 'bg-red-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-red-100'
                    }`}
                  >
                    {level === 'all' ? 'All' : `${getChiliEmoji(level)} ${level.charAt(0).toUpperCase() + level.slice(1).replace('-', ' ')}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Special Categories */}
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Special Categories</h3>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => toggleCategory('all')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    filters.category.includes('all')
                      ? 'bg-purple-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-purple-100'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => toggleCategory('children')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    filters.category.includes('children')
                      ? 'bg-purple-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-purple-100'
                  }`}
                >
                  👶 Kids Menu
                </button>
                <button
                  onClick={() => toggleCategory('salads')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    filters.category.includes('salads')
                      ? 'bg-purple-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-purple-100'
                  }`}
                >
                  🥗 Salads
                </button>
                <button
                  onClick={() => toggleCategory('deals')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    filters.category.includes('deals')
                      ? 'bg-purple-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-purple-100'
                  }`}
                >
                  💰 Deals
                </button>
                <button
                  onClick={() => toggleCategory('gluten-free')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    filters.category.includes('gluten-free')
                      ? 'bg-purple-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-purple-100'
                  }`}
                >
                  🌾 Gluten-Free
                </button>
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Price Range</h3>
              <div className="flex gap-2 flex-wrap">
                {(['all', 'under-10', '10-15', '15-20', 'over-20'] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => updateFilter('priceRange', range)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      filters.priceRange === range
                        ? 'bg-yellow-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-yellow-100'
                    }`}
                  >
                    {range === 'all' && 'All Prices'}
                    {range === 'under-10' && 'Under £10'}
                    {range === '10-15' && '£10-£15'}
                    {range === '15-20' && '£15-£20'}
                    {range === 'over-20' && 'Over £20'}
                  </button>
                ))}
              </div>
            </div>

            {/* Allergen Filters */}
            <div>
              <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <AlertTriangle size={18} />
                Allergen Filters
              </h3>

              <div className="mb-3 space-y-1">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    checked={filters.allergenMode === 'exclude'}
                    onChange={() => updateFilter('allergenMode', 'exclude')}
                  />
                  <span>Exclude these allergens (show items WITHOUT)</span>
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    checked={filters.allergenMode === 'include'}
                    onChange={() => updateFilter('allergenMode', 'include')}
                  />
                  <span>Show only items with these allergens</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {Object.values(ALLERGEN_INFO).map((allergen) => (
                  <label
                    key={allergen.id}
                    className="flex items-center gap-2 text-sm cursor-pointer hover:bg-white bg-orange-100 p-2 rounded transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={filters.allergens.includes(allergen.id)}
                      onChange={() => toggleAllergen(allergen.id)}
                    />
                    <span>{allergen.icon}</span>
                    <span className="truncate">{allergen.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Active filters display */}
        {activeFilterCount > 0 && !isExpanded && (
          <div className="mt-3 flex gap-2 flex-wrap">
            {!filters.dietary.includes('all') && filters.dietary.map((diet) => (
              <span
                key={diet}
                className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
              >
                {diet === 'vegetarian' ? '🥬 Vegetarian' : '🌱 Vegan'}
                <button
                  onClick={() => toggleDietary(diet as any)}
                  className="hover:bg-green-200 rounded-full p-0.5"
                >
                  <X size={14} />
                </button>
              </span>
            ))}

            {filters.spiceLevel !== 'all' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                {getChiliEmoji(filters.spiceLevel)} {filters.spiceLevel}
                <button
                  onClick={() => updateFilter('spiceLevel', 'all')}
                  className="hover:bg-red-200 rounded-full p-0.5"
                >
                  <X size={14} />
                </button>
              </span>
            )}

            {!filters.category.includes('all') && filters.category.map((cat) => (
              <span
                key={cat}
                className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
              >
                {cat}
                <button
                  onClick={() => toggleCategory(cat as any)}
                  className="hover:bg-purple-200 rounded-full p-0.5"
                >
                  <X size={14} />
                </button>
              </span>
            ))}

            {filters.priceRange !== 'all' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                {filters.priceRange === 'under-10' && 'Under £10'}
                {filters.priceRange === '10-15' && '£10-£15'}
                {filters.priceRange === '15-20' && '£15-£20'}
                {filters.priceRange === 'over-20' && 'Over £20'}
                <button
                  onClick={() => updateFilter('priceRange', 'all')}
                  className="hover:bg-yellow-200 rounded-full p-0.5"
                >
                  <X size={14} />
                </button>
              </span>
            )}

            {filters.allergens.length > 0 && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                <AlertTriangle size={14} />
                {filters.allergenMode === 'exclude' ? 'Excluding' : 'Including'}: {filters.allergens.length} allergen{filters.allergens.length > 1 ? 's' : ''}
                <button
                  onClick={() => updateFilter('allergens', [])}
                  className="hover:bg-orange-200 rounded-full p-0.5"
                >
                  <X size={14} />
                </button>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuFilters;
