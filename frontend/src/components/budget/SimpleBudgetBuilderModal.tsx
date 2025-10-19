import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { budgetBuilderService, MealCombo, ChefCombo } from '../../services/budgetBuilderService';
import { formatCurrency } from '../../utils/formatters';
import { Loader2, Plus } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';

interface SimpleBudgetBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SimpleBudgetBuilderModal: React.FC<SimpleBudgetBuilderModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { addItem } = useCart();
  const [budget, setBudget] = useState(30);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ meal_combos: MealCombo[]; chef_combos: ChefCombo[] } | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const response = await budgetBuilderService.generateCombos({
        budget,
        dietary_preferences: [],
        meal_preferences: ['main', 'drink'],
        allergen_exclusions: [],
      });
      setResults(response);
    } catch (error) {
      console.error('Failed to generate combos:', error);
      toast.error('Failed to generate meal combos');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComboToCart = (combo: MealCombo) => {
    try {
      combo.items.forEach((item) => {
        // Convert ComboItem to MenuItem format expected by cart
        const menuItem = {
          id: item.id,
          name: item.name,
          description: item.description || '',
          price: item.price,
          dietary_tags: item.dietary_tags || [],
          is_available: true,
          allergens: item.allergens || [],
          category_id: undefined,
          image_url: item.image_url,
        };

        // Add item to cart with no modifiers
        addItem(menuItem, [], undefined, undefined);
      });
      toast.success(`Added ${combo.name} combo to cart!`);
      onClose(); // Close the modal after adding
    } catch (error) {
      console.error('Failed to add combo to cart:', error);
      toast.error('Failed to add combo to cart');
    }
  };

  const handleAddChefComboToCart = (combo: ChefCombo) => {
    try {
      combo.items.forEach((comboItem) => {
        const { menu_item, quantity } = comboItem;

        // Convert to MenuItem format
        const menuItem = {
          id: menu_item.id,
          name: menu_item.name,
          description: menu_item.description || '',
          price: menu_item.price,
          dietary_tags: menu_item.dietary_tags || [],
          is_available: true,
          allergens: menu_item.allergens || [],
          category_id: menu_item.category_id,
          image_url: menu_item.image_url,
        };

        // Add item to cart multiple times based on quantity
        for (let i = 0; i < quantity; i++) {
          addItem(menuItem, [], undefined, undefined);
        }
      });
      toast.success(`Added ${combo.name} to cart!`);
      onClose(); // Close the modal after adding
    } catch (error) {
      console.error('Failed to add chef combo to cart:', error);
      toast.error('Failed to add combo to cart');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="4xl">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Budget Builder</h2>
          <p className="text-sm md:text-base text-gray-600 mt-1">
            Let us help you build the perfect meal within your budget!
          </p>
        </div>

        {!results && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Budget: £{budget}
              </label>
              <input
                type="range"
                min="15"
                max="100"
                step="5"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>£15</span>
                <span>£100</span>
              </div>
            </div>

            <Button fullWidth onClick={handleGenerate} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={20} />
                  Generating Combos...
                </>
              ) : (
                'Build My Meal'
              )}
            </Button>
          </div>
        )}

        {results && (
          <div className="space-y-6 max-h-[60vh] overflow-y-auto">
            {/* Custom Combos */}
            {results.meal_combos.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Custom Combinations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.meal_combos.map((combo, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-orange-500 transition">
                      <h4 className="font-semibold text-gray-900 mb-2">{combo.name}</h4>
                      <p className="text-xs text-gray-600 mb-3">{combo.description}</p>

                      <div className="space-y-1 mb-3">
                        {combo.items.map((item) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span className="text-gray-700">{item.name}</span>
                            <span className="text-gray-500">{formatCurrency(item.price)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="border-t pt-3 mt-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold">Total:</span>
                          <span className="text-lg font-bold text-orange-600">
                            {formatCurrency(combo.total_price)}
                          </span>
                        </div>
                        <div className="text-xs text-green-600 mb-3">
                          £{combo.budget_remaining} under budget!
                        </div>

                        <Button fullWidth size="sm" onClick={() => handleAddComboToCart(combo)}>
                          <Plus size={16} className="mr-1" />
                          Add Combo to Cart
                        </Button>
                      </div>

                      {combo.upgrade_suggestions.length > 0 && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-xs font-medium text-gray-700 mb-2">Upgrades:</p>
                          {combo.upgrade_suggestions.slice(0, 2).map((upgrade, idx) => (
                            <div key={idx} className="text-xs text-blue-600 mb-1">
                              {upgrade.description}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Chef Combos */}
            {results.chef_combos.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Chef's Recommendations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.chef_combos.map((combo) => (
                    <div key={combo.id} className="border-2 border-purple-300 bg-purple-50 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{combo.name}</h4>
                        <span className="text-purple-600 text-xs font-medium px-2 py-1 bg-purple-200 rounded">
                          Chef's Pick
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-3">{combo.description}</p>

                      <div className="space-y-1 mb-3">
                        {combo.items.map((item, idx) => (
                          <div key={idx} className="text-sm text-gray-700">
                            {item.quantity}x {item.menu_item.name}
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-purple-700">
                          {formatCurrency(combo.price)}
                        </span>
                        <Button size="sm" variant="secondary" onClick={() => handleAddChefComboToCart(combo)}>
                          <Plus size={16} className="mr-1" />
                          Add
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                fullWidth
                variant="secondary"
                onClick={() => setResults(null)}
              >
                Try Different Budget
              </Button>
              <Button fullWidth variant="secondary" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
