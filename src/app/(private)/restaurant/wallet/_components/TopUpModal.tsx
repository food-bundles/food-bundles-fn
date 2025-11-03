"use client";

import { useState } from "react";
import { useWallet } from "@/app/contexts/WalletContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard, Smartphone, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TopUpModal({ isOpen, onClose }: TopUpModalProps) {
  const { topUpWallet, loading } = useWallet();
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"MOBILE_MONEY" | "CARD">("MOBILE_MONEY");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    cvv: "",
    expiryMonth: "",
    expiryYear: "",
    pin: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (paymentMethod === "MOBILE_MONEY" && !phoneNumber) {
      toast.error("Please enter your phone number");
      return;
    }

    if (paymentMethod === "CARD") {
      const { cardNumber, cvv, expiryMonth, expiryYear, pin } = cardDetails;
      if (!cardNumber || !cvv || !expiryMonth || !expiryYear || !pin) {
        toast.error("Please fill in all card details");
        return;
      }
    }

    try {
      const topUpData = {
        amount: parseFloat(amount),
        paymentMethod,
        description: "Wallet top-up",
        ...(paymentMethod === "MOBILE_MONEY" && { phoneNumber }),
        ...(paymentMethod === "CARD" && { cardDetails })
      };

      const response = await topUpWallet(topUpData);
      
      if (response.data?.requiresRedirect && response.data?.redirectUrl) {
        toast.success("Redirecting to payment gateway...");
        window.open(response.data.redirectUrl, '_blank');
      } else {
        toast.success("Top-up initiated successfully!");
      }
      
      onClose();
      resetForm();
    } catch (error) {
      console.error("Top-up error:", error);
    }
  };

  const resetForm = () => {
    setAmount("");
    setPhoneNumber("");
    setCardDetails({
      cardNumber: "",
      cvv: "",
      expiryMonth: "",
      expiryYear: "",
      pin: ""
    });
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Top Up Wallet</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="amount">Amount (RWF)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="100"
              step="100"
            />
          </div>

          <div>
            <Label>Payment Method</Label>
            <RadioGroup value={paymentMethod} onValueChange={(value: "MOBILE_MONEY" | "CARD") => setPaymentMethod(value)}>
              <Card className="cursor-pointer hover:bg-gray-50">
                <CardContent className="p-3">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="MOBILE_MONEY" id="mobile" />
                    <Label htmlFor="mobile" className="flex items-center gap-2 cursor-pointer">
                      <Smartphone className="h-4 w-4" />
                      Mobile Money
                    </Label>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="cursor-pointer hover:bg-gray-50">
                <CardContent className="p-3">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="CARD" id="card" />
                    <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer">
                      <CreditCard className="h-4 w-4" />
                      Credit/Debit Card
                    </Label>
                  </div>
                </CardContent>
              </Card>
            </RadioGroup>
          </div>

          {paymentMethod === "MOBILE_MONEY" && (
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="250788123456"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
          )}

          {paymentMethod === "CARD" && (
            <div className="space-y-3">
              <div>
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={cardDetails.cardNumber}
                  onChange={(e) => setCardDetails(prev => ({ ...prev, cardNumber: e.target.value }))}
                />
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label htmlFor="expiryMonth">Month</Label>
                  <Input
                    id="expiryMonth"
                    placeholder="MM"
                    maxLength={2}
                    value={cardDetails.expiryMonth}
                    onChange={(e) => setCardDetails(prev => ({ ...prev, expiryMonth: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="expiryYear">Year</Label>
                  <Input
                    id="expiryYear"
                    placeholder="YY"
                    maxLength={2}
                    value={cardDetails.expiryYear}
                    onChange={(e) => setCardDetails(prev => ({ ...prev, expiryYear: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    placeholder="123"
                    maxLength={3}
                    value={cardDetails.cvv}
                    onChange={(e) => setCardDetails(prev => ({ ...prev, cvv: e.target.value }))}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="pin">PIN</Label>
                <Input
                  id="pin"
                  type="password"
                  placeholder="Enter PIN"
                  maxLength={4}
                  value={cardDetails.pin}
                  onChange={(e) => setCardDetails(prev => ({ ...prev, pin: e.target.value }))}
                />
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Top Up"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}