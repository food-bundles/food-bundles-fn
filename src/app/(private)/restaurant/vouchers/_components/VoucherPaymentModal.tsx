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

type PaymentMethod = "prepaid" | "momo" | "card" | "bank";

interface VoucherPaymentModalProps {
  open: boolean;
  onClose: () => void;
  voucher: {
    id: string;
    voucherCode: string;
    usedCredit: number;
  } | null;
  onPaymentSuccess?: () => void;
}

export default function VoucherPaymentModal({
  open,
  onClose,
  voucher,
  onPaymentSuccess,
}: VoucherPaymentModalProps) {
  const [method, setMethod] = useState<PaymentMethod>("momo");
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showRedirectInfo, setShowRedirectInfo] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState("");

  const handlePayment = async () => {
    if (!voucher) return;
    
    try {
      setLoading(true);
      
      const paymentData: any = {
        amount: voucher.usedCredit,
        paymentMethod: method === "prepaid" ? "CASH" : method === "momo" ? "MOBILE_MONEY" : method === "card" ? "CARD" : "BANK_TRANSFER",
      };

      // Add phone number for mobile money payment (format it properly)
      if (method === "momo" && phoneNumber) {
        // Clean and format phone number for Rwanda
        let cleanedPhone = phoneNumber.replace(/\D/g, "");
        if (cleanedPhone.startsWith("2507")) {
          cleanedPhone = "07" + cleanedPhone.slice(4);
        } else if (!cleanedPhone.startsWith("07")) {
          cleanedPhone = "07" + cleanedPhone;
        }
        paymentData.phoneNumber = cleanedPhone;
      }

      const response = await voucherService.repayVoucherCredit(voucher.id, paymentData);
      
      if (response.success || response.data) {
        // Check if redirect is required (for Flutterwave)
        if (response.data?.requiresRedirect && response.data?.redirectUrl) {
          setRedirectUrl(response.data.redirectUrl);
          setShowRedirectInfo(true);
        } else {
          toast.success("Payment processed successfully!");
          onPaymentSuccess?.();
          onClose();
        }
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      toast.error(error.response?.data?.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  const renderForm = () => {
    const amount = voucher ? `${voucher.usedCredit.toLocaleString()} RWF` : "";
    
    switch (method) {
      case "prepaid":
        return (
          <div className="space-y-3">
            <p className="text-gray-900 text-[13px] text-center">
              Pay using your prepaid wallet balance.
            </p>
            <Button 
              onClick={handlePayment}
              disabled={loading}
              className="w-full bg-green-600 text-white hover:bg-green-700 rounded-none text-[13px] font-normal"
            >
              {loading ? "Processing..." : `Pay ${amount}`}
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
              disabled={loading || !phoneNumber}
              className="w-full bg-green-600 text-white hover:bg-green-700 rounded-none text-[13px] font-normal"
            >
              {loading ? "Processing..." : `Pay ${amount}`}
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
              disabled={loading}
              className="w-full bg-green-600 text-white hover:bg-green-700 rounded-none text-[13px] font-normal"
            >
              {loading ? "Processing..." : `Pay ${amount}`}
            </Button>
          </div>
        );
      case "bank":
        return (
          <div className="space-y-3">
            <p className="text-gray-900 text-[13px] text-center">
              Pay using bank transfer.
            </p>
            <Button 
              onClick={handlePayment}
              disabled={loading}
              className="w-full bg-green-600 text-white hover:bg-green-700 rounded-none text-[13px] font-normal"
            >
              {loading ? "Processing..." : `Pay ${amount}`}
            </Button>
          </div>
        );
      default:
        return null;
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-2 border-green-500">
        <DialogHeader>
          <DialogTitle className="text-[14px] font-normal">
            Pay Voucher Credit - {voucher?.voucherCode || ""}
          </DialogTitle>
        </DialogHeader>

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