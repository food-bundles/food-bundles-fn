/* eslint-disable react-hooks/exhaustive-deps */
import { Loader2, ExternalLink, Smartphone, RefreshCcw, CheckCircle2 } from "lucide-react";

interface CardPaymentModalProps {
  isOpen: boolean;
  redirectUrl: string;
  mode: "redirect" | "pending";
  notice?: string;
  verifying?: boolean;
  onContinue: () => void;
  onReturnToPayment: () => void;
  onCheckStatus: () => void;
  onCancel: () => void;
}

export function CardPaymentModal({
  isOpen,
  redirectUrl,
  mode,
  notice,
  verifying = false,
  onContinue,
  onReturnToPayment,
  onCheckStatus,
  onCancel,
}: CardPaymentModalProps) {
  if (!isOpen) return null;

  if (mode === "redirect") {
    return (
      <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg max-w-sm w-full mx-4">
          <h3 className="text-lg font-semibold mb-4">Card Payment</h3>
          <p className="text-gray-600 mb-4 text-sm">
            Here is how the card payment works:
          </p>
          <ol className="text-sm text-gray-700 space-y-2 mb-4 list-decimal list-inside">
            <li>Click <span className="font-medium">Continue</span> below.</li>
            <li>
              You'll be taken to <span className="font-medium">Flutterwave's secure page</span>{" "}
              to enter your card details and complete the payment.
            </li>
            <li>
              As soon as Flutterwave confirms the payment, your wallet is topped
              up automatically.
            </li>
          </ol>

          {redirectUrl && (
            <div className="mb-4 rounded bg-gray-50 border border-gray-200 p-2">
              <p className="text-[11px] uppercase tracking-wide text-gray-500 mb-1">
                Payment page link
              </p>
              <p className="text-xs text-gray-700 break-all font-mono">{redirectUrl}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={onContinue}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded flex items-center justify-center"
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              Continue
            </button>
          </div>

          {redirectUrl && (
            <a
              href={redirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center text-xs text-blue-600 hover:underline mt-3"
            >
              If the payment page didn't open automatically, tap here
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-sm w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">Confirming Card Payment</h3>
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
        <div className="flex gap-3 mb-3">
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
        {redirectUrl && (
          <a
            href={redirectUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onReturnToPayment}
            className="w-full flex items-center justify-center gap-1.5 text-xs text-blue-600 hover:underline"
          >
            <ExternalLink className="h-3 w-3" />
            Reopen Flutterwave payment page
          </a>
        )}
      </div>
    </div>
  );
}