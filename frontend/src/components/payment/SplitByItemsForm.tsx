import { useState } from 'react';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { X, Plus, Check } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { parsePrice, formatCurrency } from '../../utils/formatters';

interface PersonSplit {
  email: string;
  itemIndexes: number[];
}

interface SplitByItemsFormProps {
  onSubmit: (splits: { email: string; item_ids: number[] }[]) => void;
  onBack: () => void;
}

export function SplitByItemsForm({ onSubmit, onBack }: SplitByItemsFormProps) {
  const { state } = useCart();
  const [people, setPeople] = useState<PersonSplit[]>([
    { email: '', itemIndexes: [] },
    { email: '', itemIndexes: [] },
  ]);
  const [errors, setErrors] = useState<string[]>([]);

  const handleAddPerson = () => {
    if (people.length < 10) {
      setPeople([...people, { email: '', itemIndexes: [] }]);
    }
  };

  const handleRemovePerson = (index: number) => {
    if (people.length > 2) {
      setPeople(people.filter((_, i) => i !== index));
    }
  };

  const handleEmailChange = (personIndex: number, email: string) => {
    const newPeople = [...people];
    newPeople[personIndex].email = email;
    setPeople(newPeople);
  };

  const handleItemToggle = (personIndex: number, itemIndex: number) => {
    const newPeople = [...people];
    const person = newPeople[personIndex];

    if (person.itemIndexes.includes(itemIndex)) {
      person.itemIndexes = person.itemIndexes.filter((i) => i !== itemIndex);
    } else {
      person.itemIndexes = [...person.itemIndexes, itemIndex];
    }

    setPeople(newPeople);
  };

  const isItemAssigned = (itemIndex: number, currentPersonIndex: number): boolean => {
    return people.some(
      (person, idx) => idx !== currentPersonIndex && person.itemIndexes.includes(itemIndex)
    );
  };

  const validateForm = (): boolean => {
    const newErrors: string[] = [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    people.forEach((person, index) => {
      if (!person.email.trim()) {
        newErrors[index] = 'Email is required';
      } else if (!emailRegex.test(person.email)) {
        newErrors[index] = 'Invalid email format';
      } else if (person.itemIndexes.length === 0) {
        newErrors[index] = 'Please select at least one item';
      }
    });

    // Check if all items are assigned
    const allItemsAssigned = state.items.every((_, itemIndex) =>
      people.some((person) => person.itemIndexes.includes(itemIndex))
    );

    if (!allItemsAssigned) {
      alert('Please assign all items to someone');
      return false;
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      // Convert item indexes to order item IDs (we'll need the order to be created first)
      // For now, we'll pass the indexes and handle the conversion in the parent component
      const splits = people.map((person) => ({
        email: person.email,
        item_ids: person.itemIndexes, // These will be converted to actual order item IDs after order creation
      }));
      onSubmit(splits);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
        <p>
          Assign each item to a person. Each item must be assigned to exactly one person. Items
          can be split by adjusting quantities before checkout.
        </p>
      </div>

      {people.map((person, personIndex) => (
        <div key={personIndex} className="border border-gray-300 rounded-lg p-4 space-y-3">
          <div className="flex items-start gap-2">
            <div className="flex-1">
              <Input
                type="email"
                placeholder={`Person ${personIndex + 1} email`}
                value={person.email}
                onChange={(e) => handleEmailChange(personIndex, e.target.value)}
                error={errors[personIndex]}
              />
            </div>
            {people.length > 2 && (
              <button
                type="button"
                onClick={() => handleRemovePerson(personIndex)}
                className="p-2 text-red-600 hover:bg-red-50 rounded"
              >
                <X size={20} />
              </button>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Select items:</p>
            {state.items.map((item, itemIndex) => {
              const assigned = isItemAssigned(itemIndex, personIndex);
              const selected = person.itemIndexes.includes(itemIndex);

              return (
                <button
                  key={itemIndex}
                  type="button"
                  onClick={() => !assigned && handleItemToggle(personIndex, itemIndex)}
                  disabled={assigned}
                  className={`w-full p-3 border-2 rounded-lg text-left transition-colors ${
                    selected
                      ? 'border-primary bg-primary-light bg-opacity-10'
                      : assigned
                      ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                      : 'border-gray-300 hover:border-primary'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {item.quantity}x {item.menuItem.name}
                      </div>
                      {item.modifiers.length > 0 && (
                        <div className="text-xs text-gray-600 mt-1">
                          {item.modifiers.map((m) => m.name).join(', ')}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-primary font-semibold">
                        {formatCurrency(
                          (parsePrice(item.menuItem.price) +
                            item.modifiers.reduce((sum, m) => sum + parsePrice(m.price), 0)) *
                          item.quantity
                        )}
                      </span>
                      {selected && (
                        <div className="bg-primary text-white rounded-full p-1">
                          <Check size={16} />
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {people.length < 10 && (
        <button
          type="button"
          onClick={handleAddPerson}
          className="flex items-center gap-2 text-primary hover:text-primary-dark"
        >
          <Plus size={20} />
          <span>Add another person</span>
        </button>
      )}

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={onBack} fullWidth>
          Back
        </Button>
        <Button type="submit" fullWidth>
          Continue
        </Button>
      </div>
    </form>
  );
}
