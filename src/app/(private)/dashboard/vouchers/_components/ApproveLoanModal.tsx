/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Lock, Info } from "lucide-react";
import { ILoanApplication } from "@/lib/types";
import { SelectTraderModal } from "./SelectTraderModal";
import { voucherService } from "@/app/services/voucherService";
import { traderService } from "@/app/services/traderService";
import toast from "react-hot-toast";

const DEFAULT_UNLOCK_FEE_PCT = 4.5;

interface ApproveLoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedApp: ILoanApplication | null;
  onApprove: () => Promise<void>;
}

export default function ApproveLoanModal({
  isOpen,
  onClose,
  selectedApp,
  onApprove,
}: ApproveLoanModalProps) {
  const [approvedAmount, setApprovedAmount] = useState("");
  const [approvalPercentage, setApprovalPercentage] = useState("100");
  const [repaymentDays, setRepaymentDays] = useState("30");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showTraderModal, setShowTraderModal] = useState(false);
  const [hasAcceptedTraders, setHasAcceptedTraders] = useState(false);
  const [checkingTraders, setCheckingTraders] = useState(false);

  // Derived: unlock fee preview
  const parsedApproved = parseFloat(approvedAmount) || 0;
  const unlockFee = parsedApproved * (DEFAULT_UNLOCK_FEE_PCT / 100);

  useEffect(() => {
    if (isOpen) {
      checkAcceptedTraders();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedApp) {
      const pct = parseFloat(approvalPercentage) || 100;
      const computed = (selectedApp.requestedAmount * pct) / 100;
      setApprovedAmount(computed.toFixed(0));
      setRepaymentDays(selectedApp.repaymentDays?.toString() ?? "30");
      setNotes("");
    }
  }, [selectedApp, approvalPercentage]);

  // When percentage changes, recompute amount
  const handlePercentageChange = (val: string) => {
    setApprovalPercentage(val);
    if (selectedApp) {
      const pct = parseFloat(val) || 0;
      setApprovedAmount(((selectedApp.requestedAmount * pct) / 100).toFixed(0));
    }
  };

  // When amount changes directly, recompute percentage
  const handleAmountChange = (val: string) => {
    setApprovedAmount(val);
    if (selectedApp && parseFloat(val) > 0) {
      const pct = (parseFloat(val) / selectedApp.requestedAmount) * 100;
      setApprovalPercentage(pct.toFixed(1));
    }
  };

  const checkAcceptedTraders = async () => {
    setCheckingTraders(true);
    try {
      const response = await traderService.getAcceptedDelegations();
      setHasAcceptedTraders(response.data && response.data.length > 0);
    } catch {
      setHasAcceptedTraders(false);
    } finally {
      setCheckingTraders(false);
    }
  };

  const isFormValid = () =>
    approvedAmount.trim() !== "" &&
    parseFloat(approvedAmount) > 0 &&
    repaymentDays.trim() !== "";

  const handleAdminApprove = async () => {
    if (!selectedApp || !isFormValid()) return;
    setIsLoading(true);
    try {
      await voucherService.approveLoanSession(selectedApp.id, {
        approvedAmount: parseFloat(approvedAmount),
        approvalPercentage: parseFloat(approvalPercentage),
        repaymentDays: parseInt(repaymentDays),
        notes,
      });
      toast.success("Loan approved — status set to Approved (Locked)");
      onClose();
      await onApprove();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to approve loan");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveOnBehalfClick = () => {
    if (!selectedApp || !isFormValid()) return;
    setShowTraderModal(true);
  };

  const handleTraderSelected = async (traderId: string) => {
    setShowTraderModal(false);
    if (!selectedApp) return;
    setIsLoading(true);
    try {
      await traderService.adminApproveLoanOnBehalf(traderId, {
        loanId: selectedApp.id,
        approvedAmount: parseFloat(approvedAmount),
        repaymentDays: parseInt(repaymentDays),
      });
      toast.success("Loan approved on behalf of trader");
      onClose();
      await onApprove();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to approve loan");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-500" />
              Approve Loan Application
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Requested amount info */}
            {selectedApp && (
              <div className="bg-gray-50 rounded-lg p-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Requested</span>
                  <span className="font-semibold">
                    {selectedApp.requestedAmount.toLocaleString()} RWF
                  </span>
                </div>
                {selectedApp.purpose && (
                  <div className="flex justify-between mt-1">
                    <span className="text-gray-500">Purpose</span>
                    <span className="text-gray-700">{selectedApp.purpose}</span>
                  </div>
                )}
              </div>
            )}

            {/* Approval percentage */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Approval Percentage (%)
              </label>
              <Input
                type="number"
                min="1"
                max="100"
                value={approvalPercentage}
                onChange={(e) => handlePercentageChange(e.target.value)}
                placeholder="100"
                className="h-10 text-sm"
              />
            </div>

            {/* Approved amount */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Approved Amount (RWF)
              </label>
              <Input
                type="number"
                value={approvedAmount}
                onChange={(e) => handleAmountChange(e.target.value)}
                className="h-10 text-sm"
              />
            </div>

            {/* Unlock fee preview */}
            {parsedApproved > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-orange-800">Unlock Fee Preview</p>
                    <p className="text-orange-700 mt-0.5">
                      {parsedApproved.toLocaleString()} × {DEFAULT_UNLOCK_FEE_PCT}% ={" "}
                      <strong>{unlockFee.toLocaleString()} RWF</strong>
                    </p>
                    <p className="text-orange-600 text-xs mt-1">
                      Restaurant must pay this fee before the loan becomes active.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Repayment days */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Repayment Days
              </label>
              <Input
                type="number"
                value={repaymentDays}
                onChange={(e) => setRepaymentDays(e.target.value)}
                placeholder={`Requested: ${selectedApp?.repaymentDays ?? 30} days`}
                className="h-10 text-sm"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium mb-1">Notes (optional)</label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes for the restaurant"
                className="h-10 text-sm"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleAdminApprove}
                className="bg-green-600 hover:bg-green-700 flex-1"
                disabled={!isFormValid() || isLoading || checkingTraders}
              >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {isLoading ? "Processing..." : "Approve (Admin)"}
              </Button>
              <Button
                onClick={handleApproveOnBehalfClick}
                className="bg-blue-600 hover:bg-blue-700 flex-1"
                disabled={!isFormValid() || isLoading || !hasAcceptedTraders || checkingTraders}
              >
                {checkingTraders && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                On Behalf
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
