/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ILoanApplication, VoucherType } from "@/lib/types";

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

  // Update form when selectedApp changes
  useEffect(() => {
    if (selectedApp) {
      setApprovalData({
        approvedAmount: selectedApp.requestedAmount.toString(),
        repaymentDays: (selectedApp.voucherDays || 30).toString(),
        voucherType: "",
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

  const handleApprove = async () => {
    if (!selectedApp || !isFormValid()) return;

    try {
      await onApprove({
        approvedAmount: parseFloat(approvalData.approvedAmount),
        repaymentDays: parseInt(approvalData.repaymentDays),
        voucherType: approvalData.voucherType,
        notes: approvalData.notes
      });
      setApprovalData({ approvedAmount: "", repaymentDays: "30", voucherType: "", notes: "" });
      onClose();
    } catch (error) {
      console.error("Failed to approve Voucher:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Approve Voucher Application</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Approved Amount (RWF)</label>
            <Input
              type="number"
              value={approvalData.approvedAmount}
              onChange={(e) => setApprovalData(prev => ({ ...prev, approvedAmount: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Voucher Type</label>
            <Select value={approvalData.voucherType} onValueChange={(value) => setApprovalData(prev => ({ ...prev, voucherType: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select voucher type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={VoucherType.DISCOUNT_10}>10% Discount</SelectItem>
                <SelectItem value={VoucherType.DISCOUNT_20}>20% Discount</SelectItem>
                <SelectItem value={VoucherType.DISCOUNT_50}>50% Discount</SelectItem>
                <SelectItem value={VoucherType.DISCOUNT_80}>80% Discount</SelectItem>
                <SelectItem value={VoucherType.DISCOUNT_100}>100% Discount</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Repayment Days</label>
            <Input
              type="number"
              value={approvalData.repaymentDays}
              onChange={(e) => setApprovalData(prev => ({ ...prev, repaymentDays: e.target.value }))}
              placeholder={`Default: ${selectedApp?.voucherDays || 30} days`}
            />
            {selectedApp?.voucherDays && (
              <p className="text-xs text-gray-500 mt-1">
                Requested voucher days: {selectedApp.voucherDays} days
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Notes</label>
            <Input
              value={approvalData.notes}
              onChange={(e) => setApprovalData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Optional notes"
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button 
              onClick={handleApprove} 
              className="bg-green-600 hover:bg-green-700"
              disabled={!isFormValid()}
            >
              Approve Voucher
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}