import { useState } from 'react';
import { User, Users, Receipt } from 'lucide-react';
import { PaymentMethod } from '../../types/payment';
import { useTranslation } from 'react-i18next';

interface PaymentOptionsProps {
  onMethodSelect: (method: PaymentMethod) => void;
}

export function PaymentOptions({ onMethodSelect }: PaymentOptionsProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const { t } = useTranslation();

  const handleSelect = (method: PaymentMethod) => {
    setSelectedMethod(method);
    onMethodSelect(method);
  };

  const options = [
    {
      method: PaymentMethod.SINGLE,
      icon: User,
      title: t('checkout.payFull'),
      description: t('checkout.payFullDesc'),
    },
    {
      method: PaymentMethod.SPLIT_EQUAL,
      icon: Users,
      title: t('checkout.splitEqually'),
      description: t('checkout.splitEquallyDesc'),
    },
    {
      method: PaymentMethod.SPLIT_BY_ITEMS,
      icon: Receipt,
      title: t('checkout.splitByItems'),
      description: t('checkout.splitByItemsDesc'),
    },
  ];

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-gray-900 text-lg">{t('checkout.choosePaymentMethod')}</h3>

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
