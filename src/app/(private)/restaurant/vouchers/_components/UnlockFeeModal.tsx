"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { voucherService } from "@/app/services/voucherService";
import { ILoanSession } from "@/lib/types";
import { Unlock, Loader2, AlertCircle } from "lucide-react";

interface UnlockFeeModalProps {
  open: boolean;
  onClose: () => void;
  session: ILoanSession;
  onSuccess: () => void;
}

const PAYMENT_METHODS = [
  { value: "MOBILE_MONEY", label: "Mobile Money (MoMo)" },
  { value: "CARD", label: "Card" },
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
];

export default function UnlockFeeModal({
  open,
  onClose,
  session,
  onSuccess,
}: UnlockFeeModalProps) {
  const [paymentMethod, setPaymentMethod] = useState("MOBILE_MONEY");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [paymentReference, setPaymentReference] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePay = async () => {
    setError(null);
    setLoading(true);
    try {
      await voucherService.payUnlockFee(session.id, {
        paymentMethod,
        paymentReference: paymentReference || undefined,
        phoneNumber: paymentMethod === "MOBILE_MONEY" ? phoneNumber : undefined,
      });
      onSuccess();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Payment failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Unlock className="w-5 h-5 text-orange-500" />
            Pay Unlock Fee
          </DialogTitle>
          <DialogDescription>
            Pay the unlock fee to activate your approved loan of{" "}
            <strong>{(session.approvedAmount ?? 0).toLocaleString()} RWF</strong>
          </DialogDescription>
        </DialogHeader>

        {/* Fee summary */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Approved Loan</span>
            <span className="font-semibold">{(session.approvedAmount ?? 0).toLocaleString()} RWF</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">
              Unlock Fee ({session.unlockFeePercentage ?? 4.5}%)
            </span>
            <span className="font-bold text-orange-700">
              {(session.unlockFee ?? 0).toLocaleString()} RWF
            </span>
          </div>
          <div className="border-t border-orange-200 pt-2 flex justify-between text-xs text-gray-500">
            <span>After payment, your loan becomes active immediately</span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-2 block">Payment Method</Label>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-2">
              {PAYMENT_METHODS.map((m) => (
                <div key={m.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={m.value} id={m.value} />
                  <Label htmlFor={m.value} className="text-sm font-normal cursor-pointer">
                    {m.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {paymentMethod === "MOBILE_MONEY" && (
            <div>
              <Label htmlFor="phone" className="text-sm font-medium mb-1 block">
                Phone Number
              </Label>
              <Input
                id="phone"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="e.g. 0788000000"
                className="h-10 text-sm"
              />
            </div>
          )}

          <div>
            <Label htmlFor="ref" className="text-sm font-medium mb-1 block">
              Payment Reference <span className="text-gray-400 font-normal">(optional)</span>
            </Label>
            <Input
              id="ref"
              value={paymentReference}
              onChange={(e) => setPaymentReference(e.target.value)}
              placeholder="Transaction reference"
              className="h-10 text-sm"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 text-red-600 text-sm bg-red-50 rounded p-3">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            onClick={handlePay}
            disabled={loading || (paymentMethod === "MOBILE_MONEY" && !phoneNumber)}
            className="flex-1 bg-orange-500 hover:bg-orange-600"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            {loading ? "Processing..." : `Pay ${(session.unlockFee ?? 0).toLocaleString()} RWF`}
          </Button>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
