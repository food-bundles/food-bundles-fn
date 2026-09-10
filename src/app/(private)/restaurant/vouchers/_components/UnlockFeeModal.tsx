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
import {
  Unlock,
  Loader2,
  AlertCircle,
  Smartphone,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";

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
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stage, setStage] = useState<"form" | "redirect" | "pending">("form");
  const [redirectUrl, setRedirectUrl] = useState("");
  const [notice, setNotice] = useState("");

  const resetState = () => {
    setStage("form");
    setRedirectUrl("");
    setNotice("");
    setError(null);
  };

  const handleClose = () => {
    if (loading) return;
    resetState();
    onClose();
  };

  const handlePay = async () => {
    setError(null);
    setLoading(true);
    try {
      const response = await voucherService.payUnlockFee(session.id, {
        paymentMethod,
        paymentReference: paymentReference || undefined,
        phoneNumber: paymentMethod === "MOBILE_MONEY" ? phoneNumber : undefined,
      });

      const data = response?.data || {};

      // Flutterwave hosted checkout — redirect the user to complete payment
      if (data.requiresRedirect && data.redirectUrl) {
        setRedirectUrl(data.redirectUrl);
        setStage("redirect");
        return;
      }

      // PayPack pushes a request to the customer's phone (or bank transfer pending)
      setNotice(data.message || "Payment initiated. Please complete it to activate your loan.");
      setStage("pending");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Payment failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setError(null);
    setVerifying(true);
    try {
      const response = await voucherService.verifyUnlockFeePayment(session.id);
      const data = response?.data || {};
      if (data.verified) {
        resetState();
        onSuccess();
      } else if (data.alreadyUnlocked) {
        resetState();
        onSuccess();
      } else {
        setNotice(data.message || "Payment not confirmed yet. Please complete it on your phone.");
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Could not check payment status. Please try again.";
      setError(msg);
    } finally {
      setVerifying(false);
    }
  };

  const handleContinueToPayment = () => {
    if (redirectUrl) window.location.href = redirectUrl;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
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
              Unlock Fee ({session.unlockFeePercentage ?? 0}%)
            </span>
            <span className="font-bold text-orange-700">
              {(session.unlockFee ?? 0).toLocaleString()} RWF
            </span>
          </div>
        </div>

        {stage === "form" && (
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

            {paymentMethod === "BANK_TRANSFER" && (
              <div>
                <Label htmlFor="ref" className="text-sm font-medium mb-1 block">
                  Payment Reference
                </Label>
                <Input
                  id="ref"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  placeholder="Transaction reference from your bank transfer"
                  className="h-10 text-sm"
                />
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2 text-red-600 text-sm bg-red-50 rounded p-3">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button
                onClick={handlePay}
                disabled={loading || (paymentMethod === "MOBILE_MONEY" && !phoneNumber) || (paymentMethod === "BANK_TRANSFER" && !paymentReference)}
                className="flex-1 bg-orange-500 hover:bg-orange-600"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                {loading ? "Processing..." : `Pay ${(session.unlockFee ?? 0).toLocaleString()} RWF`}
              </Button>
              <Button variant="outline" onClick={handleClose} disabled={loading}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {stage === "redirect" && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <ExternalLink className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
              <div className="text-sm text-blue-800">
                Your payment page is ready. You'll be redirected to a secure payment page
                to complete the unlock fee payment of{" "}
                <strong>{(session.unlockFee ?? 0).toLocaleString()} RWF</strong>.
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 text-red-600 text-sm bg-red-50 rounded p-3">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleContinueToPayment}
                className="flex-1 bg-orange-500 hover:bg-orange-600"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Continue to Payment
              </Button>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {stage === "pending" && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-lg p-4">
              <Smartphone className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
              <div className="text-sm text-green-800">
                {notice}
                {paymentMethod === "MOBILE_MONEY" && phoneNumber && (
                  <span className="block mt-1 text-xs text-green-600">
                    Phone: {phoneNumber}
                  </span>
                )}
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 text-red-600 text-sm bg-red-50 rounded p-3">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleVerify}
                disabled={verifying}
                className="flex-1 bg-orange-500 hover:bg-orange-600"
              >
                {verifying && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                {verifying ? "Checking..." : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    I've Paid — Check Status
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={handleClose} disabled={verifying}>
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}