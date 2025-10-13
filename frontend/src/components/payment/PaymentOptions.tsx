import { useState } from 'react';
import { User, Users, Receipt } from 'lucide-react';
import { PaymentMethod } from '../../types/payment';

interface PaymentOptionsProps {
  onMethodSelect: (method: PaymentMethod) => void;
}

export function PaymentOptions({ onMethodSelect }: PaymentOptionsProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);

  const handleSelect = (method: PaymentMethod) => {
    setSelectedMethod(method);
    onMethodSelect(method);
  };

  const options = [
    {
      method: PaymentMethod.SINGLE,
      icon: User,
      title: 'Pay Full Amount',
      description: 'One person pays the entire bill',
    },
    {
      method: PaymentMethod.SPLIT_EQUAL,
      icon: Users,
      title: 'Split Equally',
      description: 'Divide the bill equally among people',
    },
    {
      method: PaymentMethod.SPLIT_BY_ITEMS,
      icon: Receipt,
      title: 'Split by Items',
      description: 'Each person pays for their own items',
    },
  ];

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-gray-900 text-lg">Choose Payment Method</h3>

      <div className="grid gap-3">
        {options.map(({ method, icon: Icon, title, description }) => (
          <button
            key={method}
            onClick={() => handleSelect(method)}
            className={`p-4 border-2 rounded-lg text-left transition-all hover:shadow-md ${
              selectedMethod === method
                ? 'border-primary bg-primary-light bg-opacity-10'
                : 'border-gray-300 hover:border-primary'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`p-2 rounded-lg ${
                  selectedMethod === method ? 'bg-primary text-white' : 'bg-gray-100'
                }`}
              >
                <Icon size={24} />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{title}</h4>
                <p className="text-sm text-gray-600 mt-1">{description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
