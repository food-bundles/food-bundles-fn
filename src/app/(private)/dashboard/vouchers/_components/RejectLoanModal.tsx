/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RejectReasonPicker } from "./RejectReasonPicker";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ILoanApplication } from "@/lib/types";
import { AlertTriangle } from "lucide-react";

interface RejectLoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedApp: ILoanApplication | null;
  onReject: (reason: string) => Promise<void>;
}

export default function RejectLoanModal({ isOpen, onClose, selectedApp, onReject }: RejectLoanModalProps) {
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleReject = async () => {
    if (!reason.trim()) return;

    setIsLoading(true);
    try {
      await onReject(reason.trim());
      setReason("");
      onClose();
    } catch (error) {
      console.error("Failed to reject loan:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setReason("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Reject Loan Application
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to reject this loan application? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {selectedApp && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700">Restaurant:</p>
              <p className="text-sm text-gray-600">{(selectedApp as any).restaurant?.name || selectedApp.restaurantName || "N/A"}</p>
              <p className="text-sm font-medium text-gray-700 mt-2">Amount:</p>
              <p className="text-sm text-gray-600">{selectedApp.requestedAmount.toLocaleString()} RWF</p>
            </div>
          )}

          <RejectReasonPicker
            key={`${selectedApp?.id}-${isOpen}`}
            onChange={setReason}
            disabled={isLoading}
          />

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReject} 
              disabled={!reason.trim() || isLoading}
            >
              {isLoading ? "Rejecting..." : "Reject Application"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}