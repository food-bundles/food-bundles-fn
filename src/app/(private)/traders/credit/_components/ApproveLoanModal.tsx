/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { traderService, LoanApplication } from "@/app/services/traderService";
import {toast } from "sonner";

interface ApproveLoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  loan: LoanApplication;
  onSuccess: () => void;
}

export function ApproveLoanModal({ isOpen, onClose, loan, onSuccess }: ApproveLoanModalProps) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await traderService.approveLoan(loan.id, {
        approvedAmount: loan.requestedAmount,
        repaymentDays: loan.repaymentDays,
        voucherType: "DISCOUNT_100",
        notes: "",
      });

      if (response.success) {
        toast.success("Loan approved successfully");
        onSuccess();
      } else {
        toast.error("Failed to approve loan");
      }
    } catch (error: any) {
      console.error("Loan approval error:", error);
      const errorMessage = error.response?.data?.message || "Failed to approve loan";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Approve Loan</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-sm text-gray-700">
            You are going to approve loan of {loan.requestedAmount?.toLocaleString()} RWF and your balance will be decreased.
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            {loading ? "Approving..." : "Approve"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}