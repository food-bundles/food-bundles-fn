"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface SubmissionPayoutModalProps {
  isOpen: boolean;
  defaultPhone: string;
  isProcessing?: boolean;
  onClose: () => void;
  onConfirm: (phoneNumber: string) => void;
}

export function SubmissionPayoutModal({
  isOpen,
  defaultPhone,
  isProcessing = false,
  onClose,
  onConfirm,
}: SubmissionPayoutModalProps) {
  const [phoneNumber, setPhoneNumber] = useState(defaultPhone);

  useEffect(() => {
    if (isOpen) setPhoneNumber(defaultPhone);
  }, [isOpen, defaultPhone]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pay via PayPack</DialogTitle>
          <DialogDescription>
            This initiates an async PayPack cashout. You&apos;ll need to
            confirm the outcome later once PayPack&apos;s dashboard shows the
            result.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="payout-phone">Phone number</Label>
          <Input
            id="payout-phone"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            disabled={isProcessing}
            placeholder="07XXXXXXXX"
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button
            onClick={() => onConfirm(phoneNumber)}
            disabled={isProcessing || !phoneNumber.trim()}
          >
            {isProcessing ? "Initiating..." : "Initiate Payout"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
