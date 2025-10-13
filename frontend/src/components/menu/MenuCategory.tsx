import { Category, MenuItem as MenuItemType } from '../../types/menu';
import { MenuItem } from './MenuItem';

interface MenuCategoryProps {
  category: Category;
  onItemClick: (item: MenuItemType) => void;
}

export function MenuCategory({ category, onItemClick }: MenuCategoryProps) {
  if (!category.is_active || category.items.length === 0) {
    return null;
  }

  return (
    <div id={`category-${category.id}`} className="mb-6 md:mb-8 scroll-mt-32">
      <div className="mb-3 md:mb-4">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900">{category.name}</h2>
        {category.description && (
          <p className="text-sm md:text-base text-gray-600 mt-1">{category.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {category.items
          .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
          .map((item) => (
            <MenuItem key={item.id} item={item} onClick={onItemClick} />
          ))}
      </div>
    </div>
  );
}
