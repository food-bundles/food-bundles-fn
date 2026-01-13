/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { subscriptionService, SubscriptionPlan } from "@/app/services/subscriptionService";
import { toast } from "sonner";
import { useAuth } from "@/app/contexts/auth-context";

type PaymentMethod = "wallet" | "momo" | "card";

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  plan: SubscriptionPlan | null;
}

export default function PaymentModal({
  open,
  onClose,
  plan,
}: PaymentModalProps) {
  const [method, setMethod] = useState<PaymentMethod>("momo");
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showRedirectInfo, setShowRedirectInfo] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    if (user?.phone && method === "momo") {
      setPhoneNumber(user.phone);
    }
  }, [user?.phone, method]);

  const handlePayment = async () => {
    if (!plan) return;
    
    try {
      setLoading(true);
      
      const paymentMethodMap = {
        wallet: "CASH" as const,
        momo: "MOBILE_MONEY" as const,
        card: "CARD" as const,
      };

      const subscriptionData: any = {
        planId: plan.id,
        autoRenew: true,
        paymentMethod: paymentMethodMap[method],
      };

      // Add phone number for mobile money payment
      if (method === "momo" && phoneNumber) {
        subscriptionData.phoneNumber = phoneNumber;
      }

      const response = await subscriptionService.createRestaurantSubscription(subscriptionData);
      
      if (response.success || response.data) {
        // Check if redirect is required (for Flutterwave)
        if ((response as any).data?.requiresRedirect && (response as any).data?.redirectUrl) {
          setRedirectUrl((response as any).data.redirectUrl);
          setShowRedirectInfo(true);
        } else {
          toast.success("Subscription created successfully!");
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
    const price = plan ? `${plan.price.toLocaleString()} Rwf` : "";
    
    switch (method) {
      case "wallet":
        return (
          <div className="space-y-3">
            <p className="text-gray-900 text-[13px] text-center">
              Pay using your wallet balance.
            </p>
            <Button 
              onClick={handlePayment}
              disabled={loading}
              className="w-full bg-green-600 text-white hover:bg-green-700 rounded-none text-[13px] font-normal"
            >
              {loading ? "Processing..." : `Pay ${price}`}
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
              {loading ? "Processing..." : `Pay ${price}`}
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
              className="w-full h-10 bg-green-600 text-white hover:bg-green-700 rounded text-[14px] font-normal"
            >
              {loading ? "Processing..." : `Pay ${price}`}
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
            <p className="text-[14px] text-gray-700">
              Click Continue to complete your payment on Flutterwave.
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 h-10 text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={handleRedirect}
                className="flex-1 h-10 bg-green-600 hover:bg-green-700 text-white"
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
            Pay for {plan?.name || ""}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-wrap justify-center gap-2 mb-4">
          <Button
            variant={method === "wallet" ? "default" : "outline"}
            onClick={() => setMethod("wallet")}
            className="hidden rounded flex-1 sm:flex-initial h-7 text-[13px] font-normal"
          >
            Wallet
          </Button>
          <Button
            variant={method === "momo" ? "default" : "outline"}
            onClick={() => setMethod("momo")}
            className="rounded flex-1 sm:flex-initial h-8 w-20 text-[14px] font-normal"
          >
            MoMo
          </Button>
          <Button
            variant={method === "card" ? "default" : "outline"}
            onClick={() => setMethod("card")}
            className="rounded flex-1 sm:flex-initial h-8 w-20 text-[14px] font-normal"
          >
            Card
          </Button>
        </div>

        {renderForm()}
      </DialogContent>
    </Dialog>
  );
}
