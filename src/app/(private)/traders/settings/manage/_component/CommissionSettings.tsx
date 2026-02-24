/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { traderService } from "@/app/services/traderService";
import { toast } from "sonner";
import { Percent, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export function CommissionSettings({ 
  commissionMode, 
  onUpdate 
}: { 
  commissionMode: string; 
  commission: number;
  onUpdate: () => void;
}) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingMode, setPendingMode] = useState<"NORMAL" | "FIXED" | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleToggleMode = (checked: boolean) => {
    const newMode = checked ? "FIXED" : "NORMAL";
    setPendingMode(newMode);
    setShowConfirmModal(true);
  };

  const confirmToggle = async () => {
    if (!pendingMode) return;

    try {
      setIsProcessing(true);
      const response = await traderService.toggleCommissionMode(pendingMode);
      toast.success(response.message);
      setShowConfirmModal(false);
      onUpdate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to toggle commission mode");
    } finally {
      setIsProcessing(false);
      setPendingMode(null);
    }
  };

  const isFixed = commissionMode === "FIXED";

  return (
    <>
      <Card className="p-4 h-35 w-full sm:w-64">
        <div className="flex flex-col items-start text-center space-y-3">
          <div className="flex items-center w-full gap-2 pb-2 border-b border-gray-200">
            <div className="p-3 bg-yellow-50 rounded-full">
              <Percent className="h-4 w-4 text-yellow-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Commission Mode</h3>
          </div>
          <div className="flex items-center justify-between w-full">
            <p className="text-xs text-gray-600">
              {isFixed ? "Fixed monthly on balance" : "Per voucher approval"}
            </p>
            <Switch checked={isFixed} onCheckedChange={handleToggleMode} />
          </div>
        </div>
      </Card>

      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Commission Mode</DialogTitle>
            <DialogDescription>
              Are you sure you want to switch to {pendingMode} mode?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-1">
            <div className="p-3 bg-green-50 border border-green-200 rounded">
              <p className="text-sm text-gray-700">
                {pendingMode === "FIXED"
                  ? "By submitting and confirming such a request, you grant Food Bundles a limited, revocable authorization to act on your behalf solely for the specified tasks. You may revoke authorization via the Platform, effective upon confirmation."
                  : "Commission will be charged per voucher approval and you will approve yourself."}
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowConfirmModal(false);
                  setPendingMode(null);
                }}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                onClick={confirmToggle}
                disabled={isProcessing}
                className="bg-green-600 hover:bg-green-700"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Confirm"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
