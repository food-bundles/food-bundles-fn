/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { traderService } from "@/app/services/traderService";

interface DelegationApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  traderId: string;
  currentCommission: number;
  onSuccess: () => void;
}

export function DelegationApprovalModal({
  isOpen,
  onClose,
  traderId,
  currentCommission,
  onSuccess,
}: DelegationApprovalModalProps) {
  const [commission, setCommission] = useState(currentCommission.toString());
  const [isProcessing, setIsProcessing] = useState(false);

  const handleApprove = async () => {
    const commissionValue = parseFloat(commission);
    
    if (isNaN(commissionValue) || commissionValue < 0 || commissionValue > 100) {
      toast.error("Commission must be between 0 and 100");
      return;
    }

    try {
      setIsProcessing(true);
      const response = await traderService.approveDelegation(traderId, commissionValue);
      
      if (response.success) {
        toast.success(response.message || "Delegation approved. OTP sent to trader.");
        onSuccess();
        onClose();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to approve delegation");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Approve Delegation</DialogTitle>
          <DialogDescription>
            Set commission percentage and approve delegation for this trader
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="commission">Commission Percentage (%)</Label>
            <Input
              id="commission"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={commission}
              onChange={(e) => setCommission(e.target.value)}
              placeholder="Enter commission (0-100)"
            />
            <p className="text-xs text-gray-600">
              Trader will receive this percentage as commission on delegated trades
            </p>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> A 24-hour OTP will be sent to the trader's email.
              Trader must accept with OTP to activate delegation.
            </p>
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleApprove}
              disabled={isProcessing}
              className="bg-green-600 hover:bg-green-700"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Approving...
                </>
              ) : (
                "Approve & Send OTP"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
