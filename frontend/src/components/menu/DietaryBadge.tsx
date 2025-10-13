import { Leaf, Wheat, Flame } from 'lucide-react';

interface DietaryBadgeProps {
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  isSpicy?: boolean;
  size?: 'sm' | 'md';
}

export function DietaryBadge({
  isVegetarian,
  isVegan,
  isGlutenFree,
  isSpicy,
  size = 'md',
}: DietaryBadgeProps) {
  const iconSize = size === 'sm' ? 14 : 16;

  return (
    <div className="flex gap-1">
      {isVegan && (
        <div className="flex items-center gap-0.5 bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs">
          <Leaf size={iconSize} />
          <span>Vegan</span>
        </div>
      )}
      {isVegetarian && !isVegan && (
        <div className="flex items-center gap-0.5 bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs">
          <Leaf size={iconSize} />
          <span>Vegetarian</span>
        </div>
      )}
      {isGlutenFree && (
        <div className="flex items-center gap-0.5 bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-xs">
          <Wheat size={iconSize} />
          <span>GF</span>
        </div>
      )}
      {isSpicy && (
        <div className="flex items-center gap-0.5 bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs">
          <Flame size={iconSize} />
          <span>Spicy</span>
        </div>
      )}
    </div>
  );
}
