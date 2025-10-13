import React from 'react';
import { Flame } from 'lucide-react';

interface CalorieBadgeProps {
  calories: number;
  size?: 'sm' | 'md';
}

export const CalorieBadge: React.FC<CalorieBadgeProps> = ({ calories, size = 'md' }) => {
  const getColor = () => {
    if (calories < 300) return 'bg-green-100 text-green-800';
    if (calories < 600) return 'bg-yellow-100 text-yellow-800';
    if (calories < 900) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const sizeClasses = size === 'sm' ? 'text-xs px-1.5 py-0.5' : 'text-sm px-2 py-1';
  const iconSize = size === 'sm' ? 12 : 14;

  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium ${sizeClasses} ${getColor()}`}>
      <Flame size={iconSize} />
      {calories} cal
    </span>
  );
};
