import React from 'react';
import { Calculator } from 'lucide-react';

interface BudgetBuilderButtonProps {
  onClick: () => void;
}

export const BudgetBuilderButton: React.FC<BudgetBuilderButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-30 flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 md:px-6 py-3 md:py-4 rounded-full shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 font-semibold text-sm md:text-base animate-pulse"
    >
      <Calculator size={20} className="md:w-6 md:h-6" />
      <span className="hidden sm:inline">Budget Builder</span>
      <span className="sm:hidden">£ Builder</span>
    </button>
  );
};
