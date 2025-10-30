import { useNavigate } from 'react-router-dom';
import { XCircle } from 'lucide-react';
import { Button } from '../components/common/Button';
import { useTranslation } from 'react-i18next';

export function PaymentFailurePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="page-container flex items-center justify-center px-4">
      <div className="max-w-md w-full content-container text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-red-100 rounded-full p-4">
            <XCircle size={64} className="text-red-600" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('paymentFailure.title')}</h1>

        <p className="text-gray-600 mb-6">
          {t('paymentFailure.message')}
        </p>

        <div className="space-y-3">
          <Button fullWidth onClick={() => navigate('/')}>
            {t('paymentSuccess.returnToMenu')}
          </Button>

          <button
            onClick={() => window.location.reload()}
            className="w-full text-primary hover:text-primary-dark font-medium"
          >
            {t('paymentFailure.tryAgain')}
          </button>
        </div>
      </div>
    </div>
  );
}
