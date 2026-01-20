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
import { SubscriptionPlan } from "@/app/services/subscriptionService";
import { useSubscriptions } from "@/app/contexts/subscriptionContext";
import { toast } from "sonner";
import { useAuth } from "@/app/contexts/auth-context";

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
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showRedirectInfo, setShowRedirectInfo] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState("");
  const { user } = useAuth();
  const { paymentMethods, createRestaurantSubscription, getPaymentMethodById } = useSubscriptions();

  useEffect(() => {
    if (user?.phone) {
      setPhoneNumber(user.phone);
    }
    // Set default payment method to MOBILE_MONEY if available
    const momoMethod = paymentMethods.find(method => method.name === "MOBILE_MONEY");
    if (momoMethod && !selectedPaymentMethodId) {
      setSelectedPaymentMethodId(momoMethod.id);
    }
  }, [user?.phone, paymentMethods, selectedPaymentMethodId]);

  const handlePayment = async () => {
    if (!plan || !selectedPaymentMethodId) return;
    
    try {
      setLoading(true);
      
      const selectedMethod = getPaymentMethodById(selectedPaymentMethodId);
      if (!selectedMethod) {
        toast.error("Please select a payment method");
        return;
      }

      const subscriptionData: any = {
        planId: plan.id,
        paymentMethodId: selectedPaymentMethodId,
        autoRenew: true,
      };

      // Add phone number for mobile money payment
      if (selectedMethod.name === "MOBILE_MONEY" && phoneNumber) {
        subscriptionData.phoneNumber = phoneNumber;
      }

      const response = await createRestaurantSubscription(subscriptionData);
      
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
    const selectedMethod = getPaymentMethodById(selectedPaymentMethodId);
    
    if (!selectedMethod) return null;
    
    switch (selectedMethod.name) {
      case "CASH":
        return (
          <div className="space-y-3">
            <p className="text-gray-900 text-[13px] text-center">
              Pay using prepaid payment.
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
      case "MOBILE_MONEY":
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
      case "CARD":
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
      // case "BANK_TRANSFER":
      //   return (
      //     <div className="space-y-3">
      //       <p className="text-gray-900 text-[13px] text-center">
      //         Pay using bank transfer.
      //       </p>
      //       <Button 
      //         onClick={handlePayment}
      //         disabled={loading}
      //         className="w-full bg-green-600 text-white hover:bg-green-700 rounded-none text-[13px] font-normal"
      //       >
      //         {loading ? "Processing..." : `Pay ${price}`}
      //       </Button>
      //     </div>
      //   );

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

  // Filter payment methods to only show MOBILE_MONEY, CARD, and CASH
  const allowedPaymentMethods = paymentMethods.filter(method => 
    ['MOBILE_MONEY', 'CARD', 'CASH'].includes(method.name)
  );

  const getDisplayName = (method: any) => {
    if (method.name === 'CASH') return 'Prepaid';
    if (method.name === 'MOBILE_MONEY') return 'MoMo';
    if (method.name === 'CARD') return 'Card';
    return method.description;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-2 border-green-500">
        <DialogHeader>
          <DialogTitle className="text-[14px] font-normal">
            Pay for {plan?.name || ""}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {allowedPaymentMethods.map((method) => (
            <Button
              key={method.id}
              variant={selectedPaymentMethodId === method.id ? "default" : "outline"}
              onClick={() => setSelectedPaymentMethodId(method.id)}
              className="rounded flex-1 sm:flex-initial h-8 text-[14px] font-normal"
            >
              {getDisplayName(method)}
            </Button>
          ))}
        </div>
        {/* Bank Transfer and Voucher are still in development */}
        {renderForm()}
      </DialogContent>
    </Dialog>
  );
}
