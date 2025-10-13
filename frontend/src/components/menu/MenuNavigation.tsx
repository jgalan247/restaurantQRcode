import React from 'react';
import { Category } from '../../types/menu';

interface MenuNavigationProps {
  categories: Category[];
  onNavigate: (categoryId: number) => void;
}

export const MenuNavigation: React.FC<MenuNavigationProps> = ({ categories, onNavigate }) => {
  const scrollToCategory = (categoryId: number) => {
    const element = document.getElementById(`category-${categoryId}`);
    if (element) {
      const offset = 120; // Account for fixed header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      onNavigate(categoryId);
    }
  };

  return (
    <div className="sticky top-16 z-10 bg-white border-b border-gray-200 shadow-sm mb-4 md:mb-6">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex overflow-x-auto gap-2 py-2 md:py-3 scrollbar-hide">
          {categories
            .filter(cat => cat.is_active)
            .sort((a, b) => a.display_order - b.display_order)
            .map((category) => (
              <button
                key={category.id}
                onClick={() => scrollToCategory(category.id)}
                className="flex-shrink-0 px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-orange-50 hover:border-orange-500 hover:text-orange-700 transition-colors duration-200 whitespace-nowrap"
              >
                {category.name}
              </button>
            ))}
        </div>
      </div>
    </div>
  );
};
