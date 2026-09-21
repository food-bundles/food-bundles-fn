"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  Wallet,
  Loader2,
  AlertCircle,
  Smartphone,
  ExternalLink,
  CheckCircle2,
  RefreshCcw,
} from "lucide-react";

interface RepayVoucherModalProps {
  open: boolean;
  onClose: () => void;
  session: ILoanSession;
  onSuccess: () => void;
}

const PAYMENT_METHODS = [
  { value: "CASH", label: "Prepaid Wallet" },
  { value: "MOBILE_MONEY", label: "Mobile Money (MoMo)" },
  { value: "CARD", label: "Card" },
];

const fmtDate = (d?: Date | string | null) =>
  d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "";

export default function RepayVoucherModal({
  open,
  onClose,
  session,
  onSuccess,
}: RepayVoucherModalProps) {
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stage, setStage] = useState<"form" | "redirect" | "pending">("form");
  const [redirectUrl, setRedirectUrl] = useState("");
  const [notice, setNotice] = useState("");

  const verifyInFlight = useRef(false);
  const recoveredRef = useRef<Set<string>>(new Set());

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

  const performVerify = useCallback(
    async (options?: { silent?: boolean }) => {
      if (verifyInFlight.current) return;
      verifyInFlight.current = true;
      const { silent = false } = options || {};
      if (!silent) {
        setError(null);
        setVerifying(true);
      }
      try {
        const response = await voucherService.verifyLoanRepayment(session.id);
        const data = response?.data || {};
        if (data.verified || data.alreadySettled) {
          setStage("form");
          setNotice("");
          setError(null);
          onSuccess();
          return;
        }
        if (!silent) {
          setNotice(
            data.message ||
              "Payment not confirmed yet. Please complete it on your phone."
          );
        }
      } catch (err: unknown) {
        if (!silent) {
          const msg =
            (err as { response?: { data?: { message?: string } } })?.response
              ?.data?.message ?? "Could not check payment status. Please try again.";
          setError(msg);
        }
      } finally {
        verifyInFlight.current = false;
        if (!silent) setVerifying(false);
      }
    },
    [session.id, onSuccess]
  );

  // Auto-poll the payment status while the user completes the payment.
  useEffect(() => {
    if (!open || stage !== "pending" || paymentMethod === "CASH") return;

    let attempts = 0;
    const intervalId = setInterval(() => {
      attempts += 1;
      if (attempts > 36) {
        clearInterval(intervalId);
        return;
      }
      performVerify({ silent: true });
    }, 5000);

    return () => clearInterval(intervalId);
  }, [open, stage, paymentMethod, performVerify]);

  // Recovery: if this session already has a pending repayment (e.g. the user
  // paid earlier or just returned from the Flutterwave redirect), verify it
  // immediately so they never pay twice.
  useEffect(() => {
    if (!open) return;
    if (session.outstandingAmount <= 0) return;
    if (recoveredRef.current.has(session.id)) return;

    voucherService
      .verifyLoanRepayment(session.id)
      .then((response) => {
        const data = response?.data || {};
        if (data.verified || data.alreadySettled) {
          onSuccess();
          return;
        }
        // A real pending repayment — surface it and keep polling.
        recoveredRef.current.add(session.id);
        setNotice(
          data.message ||
            "Payment detected. We are checking its status automatically..."
        );
        setStage("pending");
      })
      .catch(() => {
        // no pending payment — keep the form so the restaurant can pay
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, session.id, session.outstandingAmount, onSuccess]);

  const handlePay = async () => {
    setError(null);
    setLoading(true);
    try {
      const response = await voucherService.repayLoanSession(session.id, {
        paymentMethod,
        paymentReference: undefined,
        phoneNumber: paymentMethod === "MOBILE_MONEY" ? phoneNumber : undefined,
      });

      const data = response?.data || {};

      // Prepaid wallet — completed immediately on the server.
      if (data.status === "completed") {
        setStage("form");
        onSuccess();
        return;
      }

      // Flutterwave hosted checkout — redirect the user to complete payment.
      if (data.requiresRedirect && data.redirectUrl) {
        setRedirectUrl(data.redirectUrl);
        setStage("redirect");
        return;
      }

      // PayPack pushed a request to the customer's phone.
      setNotice(data.message || "Payment initiated. Please complete it to pay this voucher.");
      setStage("pending");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Payment failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = () => performVerify({ silent: false });

  const handleContinueToPayment = () => {
    if (redirectUrl) window.location.href = redirectUrl;
  };

  const outstanding = session.outstandingAmount ?? 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-blue-600" />
            Pay Voucher
          </DialogTitle>
          <DialogDescription>
            Repay the credit you used on this voucher before it comes due.
          </DialogDescription>
        </DialogHeader>

        {/* Outstanding summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Amount Used</span>
            <span className="font-semibold">
              {(session.amountUsed ?? 0).toLocaleString()} RWF
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Repaid</span>
            <span className="font-semibold text-green-600">
              {(session.amountRepaid ?? 0).toLocaleString()} RWF
            </span>
          </div>
          <div className="flex justify-between text-sm pt-1 border-t border-blue-200">
            <span className="text-gray-600">Outstanding to Pay</span>
            <span className="font-bold text-blue-700">
              {outstanding.toLocaleString()} RWF
            </span>
          </div>
          {session.dueDate && (
            <div className="flex justify-between text-xs text-gray-500 pt-1">
              <span>Due Date</span>
              <span>{fmtDate(session.dueDate)}</span>
            </div>
          )}
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

            {paymentMethod === "CASH" && (
              <p className="text-xs text-gray-500">
                The outstanding amount will be deducted from your prepaid wallet
                balance. This confirms instantly.
              </p>
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
                disabled={loading || (paymentMethod === "MOBILE_MONEY" && !phoneNumber)}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                {loading ? "Processing..." : `Pay ${outstanding.toLocaleString()} RWF`}
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
                Your payment page is ready. You'll be redirected to a secure payment
                page to pay{" "}
                <strong>{outstanding.toLocaleString()} RWF</strong>.
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
                className="flex-1 bg-blue-600 hover:bg-blue-700"
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
                <span className="flex items-center gap-1.5 mt-2 text-xs text-green-700">
                  <RefreshCcw className="w-3 h-3 animate-spin" />
                  Checking automatically every 5 seconds. Your voucher is repaid the
                  moment payment is confirmed.
                </span>
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
                className="flex-1 bg-blue-600 hover:bg-blue-700"
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