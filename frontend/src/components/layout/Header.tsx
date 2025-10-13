import { ShoppingCart } from 'lucide-react';
import { useCart } from '../../context/CartContext';

interface HeaderProps {
  onCartClick: () => void;
}

export function Header({ onCartClick }: HeaderProps) {
  const { getItemCount } = useCart();
  const itemCount = getItemCount();

  return (
    <header className="bg-gradient-to-r from-orange-600 via-red-600 to-orange-600 text-white sticky top-0 z-40 shadow-lg border-b-4 border-yellow-500">
      {/* Festive top border pattern */}
      <div className="h-2 bg-gradient-to-r from-green-500 via-white via-red-500 to-green-500"></div>

      <div className="max-w-7xl mx-auto px-4 py-3 md:py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            🌮 <span className="hidden xs:inline">La Hacienda</span><span className="xs:hidden">La Hacienda</span>
            <span className="text-yellow-300 text-lg md:text-xl">✨</span>
          </h1>
          <p className="text-xs md:text-sm text-orange-100">Authentic Mexican Cuisine</p>
        </div>

        <button
          onClick={onCartClick}
          className="relative p-2 md:p-3 hover:bg-orange-700 rounded-lg transition-colors bg-orange-500"
        >
          <ShoppingCart size={24} className="text-white" />
          {itemCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-yellow-400 text-orange-900 text-xs font-bold rounded-full h-5 w-5 md:h-6 md:w-6 flex items-center justify-center shadow-md">
              {itemCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
