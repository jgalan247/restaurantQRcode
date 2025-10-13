import React from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { ALLERGEN_INFO } from '../../types/allergens';

interface AllergenWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AllergenWarningModal: React.FC<AllergenWarningModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const allergensList = Object.values(ALLERGEN_INFO);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-orange-600 text-white px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <AlertTriangle size={24} />
            <h2 className="text-xl font-bold">Allergen Information</h2>
          </div>
          <button onClick={onClose} className="hover:bg-orange-700 p-1 rounded">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <p className="text-sm text-yellow-800">
              <strong>Important:</strong> If you have a food allergy or intolerance, please speak to a member
              of staff before ordering. We cannot guarantee that any dishes are completely allergen-free.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-lg">14 Major Allergens (UK Law):</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {allergensList.map((allergen) => (
                <div
                  key={allergen.id}
                  className="border rounded-lg p-3 hover:bg-gray-50 transition"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{allergen.icon}</span>
                    <div>
                      <h4 className="font-semibold">{allergen.name}</h4>
                      <p className="text-sm text-gray-600">{allergen.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <p className="text-sm text-red-800">
              <strong>Cross-contamination:</strong> Our kitchen handles all 14 allergens. While we take
              every precaution, we cannot guarantee any dish is completely free from allergens.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};

export default AllergenWarningModal;
