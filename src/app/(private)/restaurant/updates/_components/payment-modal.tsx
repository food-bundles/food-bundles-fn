"use client";

import { X, Info, ExternalLink, Loader2 } from "lucide-react";

type PaymentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  paymentMethod: "momo" | "paypack" | "flutterwave";
  onConfirm: () => void;
  isProcessing?: boolean;
};

export function PaymentModal({
  isOpen,
  onClose,
  paymentMethod,
  onConfirm,
  isProcessing = false,
}: PaymentModalProps) {
  if (!isOpen) return null;

  const getModalContent = () => {
    switch (paymentMethod) {
      case "momo":
        return {
          title: "Mobile Money Payment",
          icon: <Info className="h-4 w-4 text-green-500" />,
          instructions: [
            "Dial *182*7*1# on your phone",
            "Follow the prompts to complete payment",
            "You will receive a confirmation SMS",
          ],
          buttonText: "I've Completed Payment",
        };
      
      case "paypack":
        return {
          title: "PayPack USSD Payment",
          icon: <Info className="h-4 w-4 text-blue-500" />,
          instructions: [
            "Check your phone for USSD prompt",
            "Enter your PayPack PIN to confirm",
            "Wait for confirmation message",
          ],
          buttonText: "Payment Confirmed",
        };
      
      case "flutterwave":
        return {
          title: "Complete Payment",
          icon: <Info className="h-4 w-4 text-orange-500" />,
          instructions: [
            "Click Continue to redirect to Flutterwave",
            "Enter the OTP sent to your WhatsApp",
            "Complete the payment process",
          ],
          buttonText: "Continue to Payment",
          isRedirect: true,
        };
      
      default:
        return {
          title: "Payment",
          icon: <Info className="h-4 w-4" />,
          instructions: ["Complete your payment"],
          buttonText: "Continue",
        };
    }
  };

  const content = getModalContent();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            {content.icon}
            {content.title}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isProcessing}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-3">
            {content.instructions.map((instruction, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </div>
                <p className="text-sm text-gray-700">{instruction}</p>
              </div>
            ))}
          </div>

          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className="w-full h-12 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                {content.isRedirect && <ExternalLink className="h-4 w-4" />}
                {content.buttonText}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}