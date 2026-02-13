"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { traderService } from "@/app/services/traderService";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function WithdrawModal({ isOpen, onClose, onSuccess }: WithdrawModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    withdrawType: "BALANCE" as "BALANCE" | "COMMISSION",
    paymentMethod: "",
    accountNumber: "",
    accountName: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!formData.paymentMethod || !formData.accountNumber || !formData.accountName) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      const response = await traderService.requestWithdrawal({
        amount: parseFloat(formData.amount),
        withdrawType: formData.withdrawType,
        paymentMethod: formData.paymentMethod,
        accountNumber: formData.accountNumber,
        accountName: formData.accountName,
      });

      console.log("Withdrawal response:", response);
      toast.success(response.message || "Withdrawal request submitted successfully");
      setFormData({
        amount: "",
        withdrawType: "BALANCE",
        paymentMethod: "",
        accountNumber: "",
        accountName: "",
      });
      onClose();
      onSuccess();
    } catch (error: any) {
      console.error("Withdrawal error:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to submit withdrawal request";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Withdraw Funds</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="withdrawType">Withdraw From</Label>
            <Select
              value={formData.withdrawType}
              onValueChange={(value: "BALANCE" | "COMMISSION") =>
                setFormData({ ...formData, withdrawType: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BALANCE">Balance</SelectItem>
                <SelectItem value="COMMISSION">Commission</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="amount">Amount (RWF)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="paymentMethod">Payment Method</Label>
            <Input
              id="paymentMethod"
              placeholder="e.g., MOMO PAY, Mobile Money"
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="accountNumber">Account Number</Label>
            <Input
              id="accountNumber"
              placeholder="e.g., 0781632401"
              value={formData.accountNumber}
              onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="accountName">Account Name</Label>
            <Input
              id="accountName"
              placeholder="Enter account holder name"
              value={formData.accountName}
              onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1 bg-green-600 hover:bg-green-700">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Request
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
