/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { ILoanApplication } from "@/lib/types";

interface AcceptLoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedApp: ILoanApplication | null;
  onAccept: (data: {
    acceptedAmount: number;
    paymentDays: number;
  }) => Promise<void>;
}

export default function AcceptLoanModal({
  isOpen,
  onClose,
  selectedApp,
  onAccept,
}: AcceptLoanModalProps) {
  const [formData, setFormData] = useState({
    acceptedAmount: "",
    paymentDays: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  // Prefill values when modal opens
  useEffect(() => {
    if (selectedApp) {
      setFormData({
        acceptedAmount: selectedApp.requestedAmount.toString(),
        paymentDays: selectedApp.repaymentDays?.toString() || "30",
      });
    }
  }, [selectedApp]);

  const isFormValid =
    formData.acceptedAmount.trim() !== "" && formData.paymentDays.trim() !== "";

  const handleAccept = async () => {
    if (!selectedApp || !isFormValid) return;

    setIsLoading(true);
    try {
      await onAccept({
        acceptedAmount: Number(formData.acceptedAmount),
        paymentDays: Number(formData.paymentDays),
      });
      onClose();
    } catch (error) {
      console.error("Failed to accept loan:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Accept Loan Application</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Accepted Amount (RWF)
            </label>
            <Input
              type="number"
              value={formData.acceptedAmount}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  acceptedAmount: e.target.value,
                }))
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Payment Days
            </label>
            <Input
              type="number"
              value={formData.paymentDays}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  paymentDays: e.target.value,
                }))
              }
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleAccept}
              disabled={!isFormValid || isLoading}
              className="bg-teal-600 hover:bg-teal-700"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {isLoading ? "Accepting..." : "Accept Loan"}
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
