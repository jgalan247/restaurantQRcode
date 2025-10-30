import { formatCurrency } from '../../utils/formatters';
import { useTranslation } from 'react-i18next';

interface CartSummaryProps {
  subtotal: number;
  gst: number;
  tip?: number;
  total: number;
}

export function CartSummary({ subtotal, gst, tip = 0, total }: CartSummaryProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">{t('cart.subtotal')}</span>
        <span className="text-gray-900">{formatCurrency(subtotal)}</span>
      </div>

      <div className="flex justify-between text-sm">
        <span className="text-gray-600">{t('cart.gst')}</span>
        <span className="text-gray-900">{formatCurrency(gst)}</span>
      </div>

      {tip > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">{t('payment.addTip')}</span>
          <span className="text-gray-900">{formatCurrency(tip)}</span>
        </div>
      )}

      <div className="border-t border-gray-300 pt-2 mt-2">
        <div className="flex justify-between">
          <span className="font-semibold text-gray-900">{t('cart.total')}</span>
          <span className="font-bold text-primary text-lg">{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );
}
