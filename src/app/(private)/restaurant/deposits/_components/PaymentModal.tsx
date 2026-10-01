import { Loader2, ExternalLink, Smartphone, RefreshCcw, CheckCircle2 } from "lucide-react";
import { useState } from "react";

interface PaymentModalProps {
  isOpen: boolean;
  onContinue: () => void;
  onCancel: () => void;
  mode?: "redirect" | "pending";
  notice?: string;
  verifying?: boolean;
  onCheckStatus?: () => void;
}

export function PaymentModal({
  isOpen,
  onContinue,
  onCancel,
  mode = "redirect",
  notice,
  verifying = false,
  onCheckStatus,
}: PaymentModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = () => {
    setIsLoading(true);
    onContinue();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-sm w-full mx-4">
        {mode === "redirect" ? (
          <>
            <h3 className="text-lg font-semibold mb-4">Complete Payment</h3>
            <p className="text-gray-600 mb-6 text-sm">
              Click Continue to complete your payment on Flutterwave. We'll open
              the payment page in a new tab.
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
                <ExternalLink className="h-4 w-4 mr-1" />
                Continue
              </button>
            </div>
          </>
        ) : (
          <>
            <h3 className="text-lg font-semibold mb-4">Confirming Payment</h3>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <Smartphone className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                <p className="text-sm text-green-800">{notice}</p>
              </div>
              <p className="flex items-center gap-1.5 mt-2 text-xs text-green-700">
                <RefreshCcw className="h-3 w-3 animate-spin" />
                Checking automatically every 5 seconds. Your wallet is funded the
                moment payment is confirmed.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                disabled={verifying}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Close
              </button>
              <button
                onClick={onCheckStatus}
                disabled={verifying}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded disabled:opacity-50 flex items-center justify-center"
              >
                {verifying && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                <CheckCircle2 className="h-4 w-4 mr-1" />
                I've Paid — Check Status
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}