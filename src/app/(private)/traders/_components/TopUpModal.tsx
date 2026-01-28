/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { traderService } from "@/app/services/traderService";
import { paymentMethodService } from "@/app/services/paymentMethodService";
import {toast} from "sonner";
import { Loader2 } from "lucide-react";

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
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [showPaymentContinue, setShowPaymentContinue] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState("");
  const [formData, setFormData] = useState({
    amount: "",
    paymentMethodId: "",
    phoneNumber: "",
    description: "",
  });

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
    try {
      const response = await traderService.topUpWallet({
        amount: Number(formData.amount),
        paymentMethodId: formData.paymentMethodId,
        phoneNumber: selectedMethod?.name === "MOBILE_MONEY" ? formData.phoneNumber : undefined,
        description: formData.description || "Wallet top-up",
      });

      if (response.success || response.data) {
        if (selectedMethod?.name === "CARD") {
          const redirectUrl = response.data?.redirectUrl;
          if (redirectUrl) {
            setRedirectUrl(redirectUrl);
            setShowPaymentContinue(true);
          } else {
            toast.error("Payment redirect URL not received");
          }
        } else {
          toast.success("Top-up initiated successfully!");
          onSuccess();
          handleClose();
        }
      }
    } catch (error: any) {
      console.error("Top-up error:", error);
      toast.error(error.response?.data?.message || "Failed to initiate top-up");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      setShowPaymentContinue(false);
      setRedirectUrl("");
      setFormData({
        amount: "",
        paymentMethodId: "",
        phoneNumber: "",
        description: "",
      });
    }
  };

  const handleContinuePayment = () => {
    setLoading(true);
    window.location.href = redirectUrl;
  };

  const handleCancelPayment = () => {
    setShowPaymentContinue(false);
    setRedirectUrl("");
    toast.info("Payment cancelled");
  };

  const selectedMethod = paymentMethods.find(method => method.id === formData.paymentMethodId);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {showPaymentContinue ? "Complete Payment" : "Top Up Digital Food Store Wallet"}
          </DialogTitle>
        </DialogHeader>
        
        {showPaymentContinue ? (
          <div className="space-y-4">
            <p className="text-gray-600 text-sm">
              Click Continue to complete your payment on Flutterwave.
            </p>
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
                Continue
              </Button>
            </div>
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (RWF) *</Label>
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
            <Label htmlFor="paymentMethod">Payment Method *</Label>
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
                       method.name === 'CARD' ? 'Card & MoMo' : method.description}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedMethod?.name === "MOBILE_MONEY" && (
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number *</Label>
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

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Enter description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

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