/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { traderService } from "@/app/services/traderService";
import { paymentMethodService } from "@/app/services/paymentMethodService";
import { walletService } from "@/app/services/walletService";
import {toast} from "sonner";
import { Loader2, ExternalLink, Smartphone, RefreshCcw, CheckCircle2, AlertCircle } from "lucide-react";

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
}

interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (redirectUrl?: string) => void;
}

export function TopUpModal({ isOpen, onClose, onSuccess }: TopUpModalProps) {
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [stage, setStage] = useState<"form" | "redirect" | "pending">("form");
  const [transactionId, setTransactionId] = useState("");
  const [redirectUrl, setRedirectUrl] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    amount: "",
    paymentMethodId: "",
    phoneNumber: "",
    description: "",
  });

  const verifyInFlight = useRef(false);

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const response = await paymentMethodService.getActivePaymentMethods();
        if (response.data) {
          const filteredMethods = response.data.filter((method: PaymentMethod) => 
            ['MOBILE_MONEY', 'CARD'].includes(method.name)
          );
          setPaymentMethods(filteredMethods);
        }
      } catch (error) {
        console.error('Failed to fetch payment methods:', error);
      }
    };

    if (isOpen) {
      fetchPaymentMethods();
    }
  }, [isOpen]);

  const resetState = () => {
    setStage("form");
    setRedirectUrl("");
    setTransactionId("");
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
      if (!transactionId) return;
      if (verifyInFlight.current) return;
      verifyInFlight.current = true;
      const { silent = false } = options || {};
      if (!silent) {
        setError(null);
        setVerifying(true);
      }
      try {
        const response: any = await walletService.verifyTopUp(transactionId);
        const data = response?.data || {};
        if (data.verified) {
          setStage("form");
          setTransactionId("");
          setNotice("");
          setError(null);
          toast.success("Top-up confirmed! Your wallet has been funded.");
          onClose();
          onSuccess();
          return;
        }
        if (!silent) {
          setNotice(
            data.message ||
              "Payment not confirmed yet. Please complete it on your phone or in the payment tab."
          );
        }
      } catch (err: any) {
        if (!silent) {
          const msg =
            err?.response?.data?.message ??
            "Could not check payment status. Please try again.";
          setError(msg);
        }
      } finally {
        verifyInFlight.current = false;
        if (!silent) setVerifying(false);
      }
    },
    [transactionId, onClose, onSuccess]
  );

  // Auto-poll the payment status while the user completes payment.
  useEffect(() => {
    if (!isOpen || stage !== "pending" || !transactionId) return;

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
  }, [isOpen, stage, transactionId, performVerify]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!formData.paymentMethodId) {
      toast.error("Please select a payment method");
      return;
    }

    const selectedMethod = paymentMethods.find(method => method.id === formData.paymentMethodId);
    if (selectedMethod?.name === "MOBILE_MONEY" && !formData.phoneNumber) {
      toast.error("Phone number is required for mobile money");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await traderService.topUpWallet({
        amount: Number(formData.amount),
        paymentMethodId: formData.paymentMethodId,
        phoneNumber: selectedMethod?.name === "MOBILE_MONEY" ? formData.phoneNumber : undefined,
        description: formData.description || "Wallet top-up",
      });

      if (response.success || response.data) {
        const data = response.data || {};
        const txId = data?.transaction?.id || "";

        if (selectedMethod?.name === "CARD") {
          const url = data?.redirectUrl;
          if (url) {
            setTransactionId(txId);
            setRedirectUrl(url);
            setStage("redirect");
          } else {
            toast.error("Payment redirect URL not received");
            if (txId) {
              // Still track the payment even without a redirect link.
              setTransactionId(txId);
              setNotice("Payment initiated. We are checking its status automatically...");
              setStage("pending");
            }
          }
        } else {
          if (txId) {
            setTransactionId(txId);
            setNotice(
              `Payment initiated to ${formData.phoneNumber}. Please approve it on your phone. Your wallet is funded automatically once confirmed.`
            );
            setStage("pending");
          } else {
            toast.success("Top-up initiated successfully!");
            onSuccess();
            handleClose();
          }
        }
      }
    } catch (error: any) {
      console.error("Top-up error:", error);
      setError(error.response?.data?.message || "Failed to initiate top-up");
      toast.error(error.response?.data?.message || "Failed to initiate top-up");
    } finally {
      setLoading(false);
    }
  };

  const handleContinuePayment = () => {
    if (!redirectUrl) return;
    setLoading(true);
    // Open the secure payment page in a new tab so we can keep tracking here.
    window.open(redirectUrl, "_blank", "noopener,noreferrer");
    setStage("pending");
    setNotice(
      "Complete the payment in the new tab. Your wallet is funded automatically once payment is confirmed."
    );
    setLoading(false);
  };

  const handleCancelPayment = () => {
    resetState();
    toast.info("Payment cancelled");
  };

  const selectedMethod = paymentMethods.find(method => method.id === formData.paymentMethodId);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {stage === "form"
              ? "Top Up Digital Food Store Wallet"
              : stage === "redirect"
              ? "Complete Payment"
              : "Confirming Payment"}
          </DialogTitle>
        </DialogHeader>
        
        {stage === "redirect" && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 bg-purple-50 border border-purple-200 rounded-lg p-4">
              <ExternalLink className="w-5 h-5 text-purple-600 mt-0.5 shrink-0" />
              <p className="text-sm text-purple-900">
                Your payment page is ready. We'll open it in a new tab so you can
                complete your card payment securely.
              </p>
            </div>

            {error && (
              <div className="flex items-start gap-2 text-red-600 text-sm bg-red-50 rounded p-3">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelPayment}
                disabled={loading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleContinuePayment}
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                <ExternalLink className="w-4 h-4 mr-2" />
                Continue
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
                <span className="flex items-center gap-1.5 mt-2 text-xs text-green-700">
                  <RefreshCcw className="w-3 h-3 animate-spin" />
                  Checking automatically every 5 seconds. Your wallet is funded the
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
                onClick={() => performVerify({ silent: false })}
                disabled={verifying}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {verifying && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
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

        {stage === "form" && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (RWF)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              min="1"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Payment Method</Label>
            <Select
              value={formData.paymentMethodId}
              onValueChange={(value) => setFormData({ ...formData, paymentMethodId: value })}
            >
              <SelectTrigger className={`w-full ${
                paymentMethods.find(m => m.id === formData.paymentMethodId)?.name === "MOBILE_MONEY" ? "text-green-600" :
                paymentMethods.find(m => m.id === formData.paymentMethodId)?.name === "CARD" ? "text-purple-600" : ""
              }`}>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => (
                  <SelectItem key={method.id} value={method.id}>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      method.name === 'MOBILE_MONEY' ? 'bg-green-100 text-green-800' :
                      method.name === 'CARD' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {method.name === 'MOBILE_MONEY' ? 'MoMo' : 
                       method.name === 'CARD' ? 'Card' : method.description}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedMethod?.name === "MOBILE_MONEY" && (
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="250788123456"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                required
              />
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 text-red-600 text-sm bg-red-50 rounded p-3">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {loading ? "Processing..." : "Top Up"}
            </Button>
          </div>
        </form>
        )}
      </DialogContent>
    </Dialog>
  );
}