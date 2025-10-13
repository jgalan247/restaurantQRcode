import React from 'react';
import { AllergenType } from '../../types/allergens';
import AllergenBadge from './AllergenBadge';
import { AlertTriangle } from 'lucide-react';

interface AllergenListProps {
  allergens: string[];
  compact?: boolean;
}

const AllergenList: React.FC<AllergenListProps> = ({ allergens, compact = false }) => {
  if (!allergens || allergens.length === 0) {
    return null;
  }

  return (
    <div className={`${compact ? 'space-y-1' : 'space-y-2'}`}>
      {!compact && (
        <div className="flex items-center gap-2 text-sm font-semibold text-orange-700">
          <AlertTriangle size={16} />
          <span>Contains Allergens:</span>
        </div>
      )}

      <div className="flex flex-wrap gap-1.5">
        {allergens.map((allergen) => (
          <AllergenBadge
            key={allergen}
            allergen={allergen as AllergenType}
            size={compact ? 'sm' : 'md'}
            showLabel={!compact}
          />
        ))}
      </div>
    </div>
  );
};

export default AllergenList;
