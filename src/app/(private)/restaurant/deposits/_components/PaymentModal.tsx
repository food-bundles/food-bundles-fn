import { Loader2 } from "lucide-react";
import { useState } from "react";

interface PaymentModalProps {
  isOpen: boolean;
  onContinue: () => void;
  onCancel: () => void;
}

export function PaymentModal({ isOpen, onContinue, onCancel }: PaymentModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = () => {
    setIsLoading(true);
    onContinue();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-sm w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">Complete Payment</h3>
        <p className="text-gray-600 mb-6 text-sm">
          Click Continue to complete your payment on Flutterwave.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleContinue}
            disabled={isLoading}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded disabled:opacity-50 flex items-center justify-center"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}