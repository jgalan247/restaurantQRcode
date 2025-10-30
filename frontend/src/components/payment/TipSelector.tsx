import { useState } from 'react';
import { Input } from '../common/Input';
import { formatCurrency } from '../../utils/formatters';
import { useTranslation } from 'react-i18next';

interface TipSelectorProps {
  subtotal: number;
  onTipChange: (tipPercentage: number, tipAmount: number) => void;
}

export function TipSelector({ subtotal, onTipChange }: TipSelectorProps) {
  const { t } = useTranslation();
  const [selectedPercentage, setSelectedPercentage] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');

  const presetPercentages = [10, 15, 20];

  const handlePresetClick = (percentage: number) => {
    setSelectedPercentage(percentage);
    setCustomAmount('');
    const tipAmount = subtotal * (percentage / 100);
    onTipChange(percentage, tipAmount);
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    setSelectedPercentage(null);

    const amount = parseFloat(value);
    if (!isNaN(amount) && amount >= 0) {
      const percentage = subtotal > 0 ? (amount / subtotal) * 100 : 0;
      onTipChange(percentage, amount);
    } else {
      onTipChange(0, 0);
    }
  };

  const handleNoTip = () => {
    setSelectedPercentage(null);
    setCustomAmount('');
    onTipChange(0, 0);
  };

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-gray-900">{t('payment.addTip')}</h3>

      <div className="grid grid-cols-4 gap-2">
        {presetPercentages.map((percentage) => {
          const tipAmount = subtotal * (percentage / 100);
          return (
            <button
              key={percentage}
              onClick={() => handlePresetClick(percentage)}
              className={`p-3 border-2 rounded-lg text-center transition-colors ${
                selectedPercentage === percentage
                  ? 'border-primary bg-primary-light text-white'
                  : 'border-gray-300 hover:border-primary'
              }`}
            >
              <div className="font-semibold">{percentage}%</div>
              <div className="text-xs mt-1">{formatCurrency(tipAmount)}</div>
            </button>
          );
        })}
        <button
          onClick={handleNoTip}
          className={`p-3 border-2 rounded-lg text-center transition-colors ${
            selectedPercentage === null && !customAmount
              ? 'border-primary bg-primary-light text-white'
              : 'border-gray-300 hover:border-primary'
          }`}
        >
          <div className="font-semibold">{t('payment.noTip')}</div>
          <div className="text-xs mt-1">£0.00</div>
        </button>
      </div>

      <div>
        <Input
          type="number"
          placeholder={t('payment.customTipPlaceholder')}
          value={customAmount}
          onChange={(e) => handleCustomAmountChange(e.target.value)}
          min="0"
          step="0.01"
        />
      </div>
    </div>
  );
}
