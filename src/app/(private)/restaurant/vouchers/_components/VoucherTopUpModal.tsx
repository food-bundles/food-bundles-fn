/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { voucherService } from "@/app/services/voucherService";
import { toast } from "sonner";

type PaymentMethod = "prepaid" | "momo" | "card";

interface VoucherTopUpModalProps {
  open: boolean;
  onClose: () => void;
  voucher: {
    id: string;
    voucherCode: string;
    remainingCredit: number;
  } | null;
  defaultAmount?: number;
  onSuccess?: () => void;
}

export default function VoucherTopUpModal({
  open,
  onClose,
  voucher,
  defaultAmount,
  onSuccess,
}: VoucherTopUpModalProps) {
  const [method, setMethod] = useState<PaymentMethod>("momo");
  const [amount, setAmount] = useState<string>(
    defaultAmount && defaultAmount > 0 ? String(defaultAmount) : "",
  );
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [pendingTopUpId, setPendingTopUpId] = useState<string | null>(null);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [showRedirectInfo, setShowRedirectInfo] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState("");

  const numericAmount = Number(amount) || 0;

  const handlePayment = async () => {
    if (!voucher || numericAmount <= 0) return;

    try {
      setLoading(true);

      const paymentData: any = {
        amount: numericAmount,
        paymentMethod:
          method === "prepaid"
            ? "CASH"
            : method === "momo"
              ? "MOBILE_MONEY"
              : "CARD",
      };

      if (method === "momo" && phoneNumber) {
        let cleanedPhone = phoneNumber.replace(/\D/g, "");
        if (cleanedPhone.startsWith("2507")) {
          cleanedPhone = "07" + cleanedPhone.slice(4);
        } else if (!cleanedPhone.startsWith("07")) {
          cleanedPhone = "07" + cleanedPhone;
        }
        paymentData.phoneNumber = cleanedPhone;
      }

      const response = await voucherService.topUpVoucherCredit(
        voucher.id,
        paymentData,
      );

      const data = response.data || response;

      if (data.success || response.success) {
        if (data.redirectUrl) {
          setRedirectUrl(data.redirectUrl);
          setShowRedirectInfo(true);
        } else if (data.topUpId) {
          setPendingTopUpId(data.topUpId);
          toast.info(
            data.message ||
              "Payment request sent. Please confirm it and check status.",
          );
        } else if (data.status === "completed" || response.status === "completed") {
          toast.success("Voucher credit topped up successfully!");
          onSuccess?.();
          onClose();
        } else {
          toast.success("Voucher credit topped up successfully!");
          onSuccess?.();
          onClose();
        }
      }
    } catch (error: any) {
      console.error("Top-up error:", error);
      toast.error(error.response?.data?.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!pendingTopUpId) return;
    try {
      setVerifyLoading(true);
      const result = await voucherService.verifyVoucherTopUp(pendingTopUpId);
      if (result.success && result.verified) {
        toast.success("Voucher credited! Your top-up is complete.");
        setPendingTopUpId(null);
        onSuccess?.();
        onClose();
      } else if (result.status === "failed") {
        toast.error("Payment was not completed. Please try again.");
        setPendingTopUpId(null);
      } else {
        toast.info(result.message || "Payment is still pending. Please confirm it on your phone.");
      }
    } catch (error: any) {
      console.error("Verify error:", error);
      toast.error(error.response?.data?.message || "Could not verify payment status");
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleRedirect = () => {
    if (redirectUrl) {
      window.location.href = redirectUrl;
    }
  };

  if (showRedirectInfo) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md rounded-none">
          <DialogHeader>
            <DialogTitle className="text-[14px] font-normal">
              Complete Payment
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-[13px] text-gray-700">
              Click Continue to complete your payment on Flutterwave.
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 text-[13px]"
              >
                Cancel
              </Button>
              <Button
                onClick={handleRedirect}
                className="flex-1 bg-green-600 hover:bg-green-700 text-[13px]"
              >
                Continue
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (pendingTopUpId) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md border-2 border-green-500">
          <DialogHeader>
            <DialogTitle className="text-[14px] font-normal">
              Top-up Payment Pending
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-[13px] text-gray-700">
              A payment request of {numericAmount.toLocaleString()} RWF was sent
              to your phone. Confirm it and then check the status below.
            </p>
            <Button
              onClick={handleVerify}
              disabled={verifyLoading}
              className="w-full bg-green-600 text-white hover:bg-green-700 rounded-none text-[13px] font-normal"
            >
              {verifyLoading ? "Checking..." : "Check Payment Status"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const renderForm = () => {
    switch (method) {
      case "prepaid":
        return (
          <div className="space-y-3">
            <p className="text-gray-900 text-[13px] text-center">
              Pay using your prepaid wallet balance.
            </p>
            <Button
              onClick={handlePayment}
              disabled={loading || numericAmount <= 0}
              className="w-full bg-green-600 text-white hover:bg-green-700 rounded-none text-[13px] font-normal"
            >
              {loading ? "Processing..." : "Top Up Voucher Credit"}
            </Button>
          </div>
        );
      case "momo":
        return (
          <div className="space-y-3">
            <Input
              placeholder="Enter MoMo Phone Number"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="text-[13px] text-gray-900 rounded"
            />
            <Button
              onClick={handlePayment}
              disabled={loading || numericAmount <= 0 || !phoneNumber}
              className="w-full bg-green-600 text-white hover:bg-green-700 rounded-none text-[13px] font-normal"
            >
              {loading ? "Processing..." : "Top Up Voucher Credit"}
            </Button>
          </div>
        );
      case "card":
        return (
          <div className="space-y-3">
            <p className="text-gray-900 text-[13px] text-center">
              Pay using your card.
            </p>
            <Button
              onClick={handlePayment}
              disabled={loading || numericAmount <= 0}
              className="w-full bg-green-600 text-white hover:bg-green-700 rounded-none text-[13px] font-normal"
            >
              {loading ? "Processing..." : "Top Up Voucher Credit"}
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-2 border-green-500">
        <DialogHeader>
          <DialogTitle className="text-[14px] font-normal">
            Top Up Voucher Credit - {voucher?.voucherCode || ""}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 mb-4">
          <p className="text-[12px] text-gray-500">
            Current available credit:{" "}
            <span className="font-semibold text-gray-900">
              {(voucher?.remainingCredit || 0).toLocaleString()} RWF
            </span>
          </p>
          <Input
            placeholder="Amount to top up (RWF)"
            type="number"
            min="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="text-[13px] text-gray-900 rounded"
          />
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-4">
          <Button
            variant={method === "prepaid" ? "default" : "outline"}
            onClick={() => setMethod("prepaid")}
            className="rounded flex-1 sm:flex-initial h-8 w-30 text-[14px] font-normal"
          >
            Prepaid
          </Button>
          <Button
            variant={method === "momo" ? "default" : "outline"}
            onClick={() => setMethod("momo")}
            className="rounded flex-1 sm:flex-initial h-8 w-30 text-[14px] font-normal"
          >
            MoMo
          </Button>
          <Button
            variant={method === "card" ? "default" : "outline"}
            onClick={() => setMethod("card")}
            className="rounded flex-1 sm:flex-initial h-8 w-30 text-[14px] font-normal"
          >
            Card
          </Button>
        </div>

        {renderForm()}
      </DialogContent>
    </Dialog>
  );
}