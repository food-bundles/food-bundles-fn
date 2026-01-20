"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { traderService, LoanApplication } from "@/app/services/traderService";
import toast from "react-hot-toast";

interface ApproveLoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  loan: LoanApplication;
  onSuccess: () => void;
}

export function ApproveLoanModal({ isOpen, onClose, loan, onSuccess }: ApproveLoanModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    approvedAmount: loan.requestedAmount?.toString() || "",
    repaymentDays: loan.repaymentDays?.toString() || "",
    voucherType: "DISCOUNT_100",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.approvedAmount || !formData.repaymentDays || !formData.voucherType) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (Number(formData.approvedAmount) <= 0) {
      toast.error("Approved amount must be greater than 0");
      return;
    }

    if (Number(formData.repaymentDays) <= 0) {
      toast.error("Repayment days must be greater than 0");
      return;
    }

    setLoading(true);
    try {
      const response = await traderService.approveLoan(loan.id, {
        approvedAmount: Number(formData.approvedAmount),
        repaymentDays: Number(formData.repaymentDays),
        voucherType: formData.voucherType,
        notes: formData.notes,
      });

      if (response.success) {
        toast.success("Loan approved successfully");
        onSuccess();
      } else {
        toast.error("Failed to approve loan");
      }
    } catch (error: any) {
      console.error("Loan approval error:", error);
      toast.error(error.response?.data?.message || "Failed to approve loan");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Approve Loan Application</DialogTitle>
        </DialogHeader>
        
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">Loan Details</h4>
          <div className="space-y-1 text-sm">
            <div><span className="font-medium">Restaurant:</span> {loan.restaurant.name}</div>
            <div><span className="font-medium">Requested Amount:</span> {loan.requestedAmount?.toLocaleString() || 'N/A'} RWF</div>
            <div><span className="font-medium">Purpose:</span> {loan.purpose}</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="approvedAmount">Approved Amount (RWF) *</Label>
            <Input
              id="approvedAmount"
              type="number"
              value={formData.approvedAmount}
              onChange={(e) => setFormData({ ...formData, approvedAmount: e.target.value })}
              min="1"
              max={loan.requestedAmount || undefined}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="repaymentDays">Repayment Days *</Label>
            <Input
              id="repaymentDays"
              type="number"
              value={formData.repaymentDays}
              onChange={(e) => setFormData({ ...formData, repaymentDays: e.target.value })}
              min="1"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="voucherType">Voucher Type *</Label>
            <Select
              value={formData.voucherType}
              onValueChange={(value) => setFormData({ ...formData, voucherType: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DISCOUNT_100">100% Discount</SelectItem>
                <SelectItem value="DISCOUNT_50">50% Discount</SelectItem>
                <SelectItem value="DISCOUNT_25">25% Discount</SelectItem>
                <SelectItem value="CREDIT_ONLY">Credit Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about this approval"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {loading ? "Approving..." : "Approve Loan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}