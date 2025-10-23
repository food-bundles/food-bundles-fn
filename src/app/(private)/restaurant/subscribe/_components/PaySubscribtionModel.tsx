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
import { subscriptionService, SubscriptionPlan } from "@/app/services/subscriptionService";
import { toast } from "sonner";

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
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");

  const handlePayment = async () => {
    if (!plan) return;
    
    try {
      setLoading(true);
      
      const paymentMethodMap = {
        wallet: "CASH" as const,
        momo: "MOBILE_MONEY" as const,
        card: "CARD" as const,
      };

      const subscriptionData = {
        planId: plan.id,
        autoRenew: true,
        paymentMethod: paymentMethodMap[method],
      };

      const response = await subscriptionService.createRestaurantSubscription(subscriptionData);
      
      if (response.success) {
        toast.success("Subscription created successfully!");
        onClose();
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
            <Input 
              placeholder="Card Number" 
              type="text" 
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              className="text-[13px] text-gray-900 rounded"
            />
            <Input 
              placeholder="Expiry Date (MM/YY)" 
              type="text" 
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="text-[13px] text-gray-900 rounded" 
            />
            <Input 
              placeholder="CVV" 
              type="password" 
              value={cvv}
              onChange={(e) => setCvv(e.target.value)}
              className="text-[13px] text-gray-900 rounded"
            />
            <Button 
              onClick={handlePayment}
              disabled={loading || !cardNumber || !expiryDate || !cvv}
              className="w-full bg-green-600 text-white hover:bg-green-700 rounded-none text-[13px] font-normal"
            >
              {loading ? "Processing..." : `Pay ${price}`}
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-none">
        <DialogHeader>
          <DialogTitle className="text-[14px] font-normal">
            Pay for {plan?.name || ""}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-wrap justify-center gap-2 mb-4">
          <Button
            variant={method === "wallet" ? "default" : "outline"}
            onClick={() => setMethod("wallet")}
            className="rounded flex-1 sm:flex-initial h-7 text-[13px] font-normal"
          >
            Wallet
          </Button>
          <Button
            variant={method === "momo" ? "default" : "outline"}
            onClick={() => setMethod("momo")}
            className="rounded flex-1 sm:flex-initial h-7 text-[13px] font-normal"
          >
            MoMo
          </Button>
          <Button
            variant={method === "card" ? "default" : "outline"}
            onClick={() => setMethod("card")}
            className="rounded flex-1 sm:flex-initial h-7 text-[13px] font-normal"
          >
            Card
          </Button>
        </div>

        {renderForm()}
      </DialogContent>
    </Dialog>
  );
}
