import React from 'react';
import { AllergenType, ALLERGEN_INFO } from '../../types/allergens';

interface AllergenBadgeProps {
  allergen: AllergenType;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const AllergenBadge: React.FC<AllergenBadgeProps> = ({
  allergen,
  size = 'md',
  showLabel = true
}) => {
  const info = ALLERGEN_INFO[allergen];

  if (!info) return null;

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  const colorClasses: Record<string, string> = {
    amber: 'bg-amber-100 text-amber-800 border-amber-300',
    orange: 'bg-orange-100 text-orange-800 border-orange-300',
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    blue: 'bg-blue-100 text-blue-800 border-blue-300',
    green: 'bg-green-100 text-green-800 border-green-300',
    gray: 'bg-gray-100 text-gray-800 border-gray-300',
    purple: 'bg-purple-100 text-purple-800 border-purple-300',
    pink: 'bg-pink-100 text-pink-800 border-pink-300',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border ${sizeClasses[size]} ${colorClasses[info.color]} font-medium`}
      title={info.description}
    >
      <span>{info.icon}</span>
      {showLabel && <span>{info.name}</span>}
    </span>
  );
};

export default AllergenBadge;
