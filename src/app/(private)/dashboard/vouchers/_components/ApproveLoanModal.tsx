/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { ILoanApplication, VoucherType } from "@/lib/types";
import { SelectTraderModal } from "./SelectTraderModal";
import { traderService } from "@/app/services/traderService";
import toast from "react-hot-toast";

interface ApproveLoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedApp: ILoanApplication | null;
  onApprove: (approvalData: any) => Promise<void>;
}

export default function ApproveLoanModal({ isOpen, onClose, selectedApp, onApprove }: ApproveLoanModalProps) {
  const [approvalData, setApprovalData] = useState({
    approvedAmount: "",
    repaymentDays: "30",
    voucherType: "",
    notes: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showTraderModal, setShowTraderModal] = useState(false);
  const [selectedTraderId, setSelectedTraderId] = useState<string>("");

  // Update form when selectedApp changes
  useEffect(() => {
    if (selectedApp) {
      setApprovalData({
        approvedAmount: selectedApp.requestedAmount.toString(),
        repaymentDays: selectedApp.repaymentDays.toString(),
        voucherType: VoucherType.DISCOUNT_100,
        notes: ""
      });
    }
  }, [selectedApp]);

  const isFormValid = () => {
    return (
      approvalData.approvedAmount.trim() !== "" &&
      approvalData.voucherType !== "" &&
      approvalData.repaymentDays.trim() !== ""
    );
  };

  const handleApproveClick = async () => {
    if (!selectedApp || !isFormValid()) return;

    // First, check if there are traders with accepted delegations
    setIsLoading(true);
    try {
      const response = await traderService.getAcceptedDelegations();
      if (response.data && response.data.length > 0) {
        // Show trader selection modal
        setShowTraderModal(true);
      } else {
        // No traders available, proceed with regular approval
        toast.error("No traders with accepted delegations found. Cannot approve loan.");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to check traders");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTraderSelected = async (traderId: string) => {
    setSelectedTraderId(traderId);
    await handleApproveOnBehalf(traderId);
  };

  const handleApproveOnBehalf = async (traderId: string) => {
    if (!selectedApp) return;

    setIsLoading(true);
    try {
      await traderService.adminApproveLoanOnBehalf(traderId, {
        loanId: selectedApp.id,
        approvedAmount: parseFloat(approvalData.approvedAmount),
        repaymentDays: parseInt(approvalData.repaymentDays),
      });
      toast.success("Loan approved successfully on behalf of trader");
      setApprovalData({ approvedAmount: "", repaymentDays: "30", voucherType: "", notes: "" });
      setSelectedTraderId("");
      onClose();
      // Refresh the list
      await onApprove({});
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to approve loan");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Voucher Application</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Approved Amount (RWF)
              </label>
              <Input
                type="number"
                value={approvalData.approvedAmount}
                onChange={(e) =>
                  setApprovalData((prev) => ({
                    ...prev,
                    approvedAmount: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Voucher Type
              </label>
              <Select
                value={approvalData.voucherType}
                onValueChange={(value) =>
                  setApprovalData((prev) => ({ ...prev, voucherType: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select voucher type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={VoucherType.DISCOUNT_10}>
                    10% Discount
                  </SelectItem>
                  <SelectItem value={VoucherType.DISCOUNT_20}>
                    20% Discount
                  </SelectItem>
                  <SelectItem value={VoucherType.DISCOUNT_50}>
                    50% Discount
                  </SelectItem>
                  <SelectItem value={VoucherType.DISCOUNT_80}>
                    80% Discount
                  </SelectItem>
                  <SelectItem value={VoucherType.DISCOUNT_100}>
                    100% Discount
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Requested repayment days
              </label>
              <Input
                type="number"
                value={approvalData.repaymentDays}
                onChange={(e) =>
                  setApprovalData((prev) => ({
                    ...prev,
                    repaymentDays: e.target.value,
                  }))
                }
                placeholder={`Requested: ${selectedApp?.repaymentDays || 30} days`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Notes</label>
              <Input
                value={approvalData.notes}
                onChange={(e) =>
                  setApprovalData((prev) => ({ ...prev, notes: e.target.value }))
                }
                placeholder="Optional notes"
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleApproveClick}
                className="bg-green-600 hover:bg-green-700"
                disabled={!isFormValid() || isLoading}
              >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {isLoading ? "Processing..." : "Approve Voucher"}
              </Button>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <SelectTraderModal
        isOpen={showTraderModal}
        onClose={() => setShowTraderModal(false)}
        onSelectTrader={handleTraderSelected}
      />
    </>
  );
}