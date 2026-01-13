/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSubscriptions } from "@/app/contexts/subscriptionContext";
import { useAuth } from "@/app/contexts/auth-context";
import { toast } from "sonner";
import { SubscriptionPlan, RestaurantSubscription,  } from "@/app/services/subscriptionService";

type PaymentMethod = "wallet" | "momo" | "card";

interface UpgradeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentSubscription?: RestaurantSubscription;
  selectedPlan: SubscriptionPlan;
  onSuccess: () => void;
  isNewSubscription?: boolean;
}

export default function UpgradeDrawer({ 
  isOpen, 
  onClose, 
  currentSubscription, 
  selectedPlan,
  onSuccess,
  isNewSubscription = false
}: UpgradeDrawerProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("momo");
  const [phoneNumber, setPhoneNumber] = useState("");
  const { upgradeSubscription, downgradeSubscription } = useSubscriptions();
  const { user } = useAuth();

  useEffect(() => {
    if (user?.phone && paymentMethod === "momo") {
      setPhoneNumber(user.phone);
    }
  }, [user?.phone, paymentMethod]);

  const handleUpgrade = async () => {
    try {
      setIsProcessing(true);
      
      await upgradeSubscription(currentSubscription.id, {
        newPlanId: selectedPlan.id,
      });
      
      toast.success("Subscription upgraded successfully!");
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to upgrade subscription");
    } finally {
      setIsProcessing(false);
    }
  };

  const isUpgrade = selectedPlan.price > currentSubscription.plan.price;
  const priceDifference = selectedPlan.price - currentSubscription.plan.price;
  const remainingDays = currentSubscription.daysRemaining || 0;
  const halfDuration = Math.floor(currentSubscription.plan.duration / 2);
  const hasDiscount = remainingDays >= halfDuration;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full bg-white text-gray-900 z-50 transform transition-all duration-300 ease-in-out overflow-y-auto shadow-2xl border-l border-gray-200 scrollbar-hide
          w-[90vw] sm:w-[400px] md:w-[500px]
          ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-green-700 border-b border-gray-200 flex justify-between items-center px-6 py-3">
          <div className="flex items-center gap-2">
            <span className="text-[15px] text-white font-bold">
              {isUpgrade ? "Upgrade" : "Downgrade"} Subscription
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors hover:rotate-90 transform duration-200"
          >
            <X className="w-5 h-5 text-white cursor-pointer" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 bg-gray-100 space-y-6">
          {/* Current Subscription */}
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Current Subscription
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-800">Plan:</span>
                <Badge className="bg-yellow-100 text-yellow-800">
                  {currentSubscription.plan.name}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-800">Price:</span>
                <span className="text-sm ">{currentSubscription.plan.price.toLocaleString()} RWF</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-800">Duration:</span>
                <span className="text-sm">{currentSubscription.plan.duration} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-800">Remaining:</span>
                <span className="text-sm text-green-600">{remainingDays} days</span>
              </div>
            </div>
          </div>

          {/* Selected Plan */}
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Selected Plan
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-800">Plan:</span>
                <Badge className="text-sm bg-green-100 text-green-800">
                  {selectedPlan.name}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-800">Price:</span>
                <span className="text-sm ">{selectedPlan.price.toLocaleString()} RWF</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-800">Duration:</span>
                <span className="text-sm ">{selectedPlan.duration} days</span>
              </div>
            </div>
          </div>

          {/* Price Difference */}
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-900">
                {isUpgrade ? "Additional Cost:" : "Savings:"}
              </span>
              <span className={`text-lg font-bold ${isUpgrade ? "text-orange-600" : "text-green-600"}`}>
               {/* {Math.abs(priceDifference).toLocaleString()} RWF */}
              </span>
            </div>
          </div>

          {/* Discount Info */}
          {isUpgrade && hasDiscount && (
            <div className="bg-blue-50 px-4 p-2 rounded-lg border border-blue-200">
              <h3 className="text-sm font-semibold text-green-800 mb-2">
                Discount Available!
              </h3>
              <p className="text-xs text-green-700">
                You have more than half of your subscription remaining. This upgrade will include a discount.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 hover:bg-gray-50"
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpgrade}
              disabled={isProcessing}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {isProcessing && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {isProcessing ? "Processing..." : `Confirm ${isUpgrade ? "Upgrade" : "Downgrade"}`}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}