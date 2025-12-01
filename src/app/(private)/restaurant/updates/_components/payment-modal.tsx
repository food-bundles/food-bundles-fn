"use client";

import { X, Info, ExternalLink, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type PaymentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  paymentMethod: "momo" | "card" | "flutterwave";
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

  const getModalContent = () => {
    switch (paymentMethod) {
      case "momo":
        return {
          title: "Mobile Money Payment",
          instructions: [
            "Check your phone for payment prompt",
            "Enter your mobile money PIN",
            "Confirm the payment",
          ],
          buttonText: "I've Completed Payment",
        };
      
      case "card":
        return {
          title: "Card Payment",
          instructions: [
            "Click Continue to redirect to payment page",
            "Enter your card details",
            "Complete the payment process",
          ],
          buttonText: "Continue to Payment",
          isRedirect: true,
        };
      
      case "flutterwave":
        return {
          title: "Complete Payment",
          instructions: [
            "Click Continue to redirect to Flutterwave",
            "Complete the payment process",
            "You will be redirected back after payment",
          ],
          buttonText: "Continue to Payment",
          isRedirect: true,
        };
      
      default:
        return {
          title: "Payment",
          instructions: ["Complete your payment"],
          buttonText: "Continue",
        };
    }
  };

  const content = getModalContent();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-none">
        <DialogHeader>
          <DialogTitle className="text-[14px] font-normal flex items-center gap-2">
            <Info className="h-4 w-4 text-green-500" />
            {content.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-3">
            {content.instructions.map((instruction, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </div>
                <p className="text-[13px] text-gray-700">{instruction}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1 text-[13px]"
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              disabled={isProcessing}
              className="flex-1 bg-green-600 hover:bg-green-700 text-[13px]"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  {content.isRedirect && <ExternalLink className="h-4 w-4 mr-2" />}
                  {content.buttonText}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}