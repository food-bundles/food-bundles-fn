"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

type SubmissionStatus = "PENDING" | "VERIFIED" | "APPROVED" | "PAID";

interface ReasonConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  isDestructive?: boolean;
  isProcessing?: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export function ReasonConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel = "Confirm",
  isDestructive = false,
  isProcessing = false,
  onClose,
  onConfirm,
}: ReasonConfirmDialogProps) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!isOpen) setReason("");
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="reason-textarea">Reason (optional)</Label>
          <Textarea
            id="reason-textarea"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={isProcessing}
            placeholder="Add a reason for the audit trail..."
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button
            variant={isDestructive ? "destructive" : "default"}
            onClick={() => onConfirm(reason.trim() || "")}
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface ReverseStatusDialogProps {
  isOpen: boolean;
  currentStatus: SubmissionStatus;
  isProcessing?: boolean;
  onClose: () => void;
  onConfirm: (toStatus: SubmissionStatus, reason: string) => void;
}

const STATUS_OPTIONS: SubmissionStatus[] = [
  "PENDING",
  "VERIFIED",
  "APPROVED",
  "PAID",
];

export function ReverseStatusDialog({
  isOpen,
  currentStatus,
  isProcessing = false,
  onClose,
  onConfirm,
}: ReverseStatusDialogProps) {
  const [toStatus, setToStatus] = useState<SubmissionStatus>(currentStatus);
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (isOpen) {
      setToStatus(currentStatus);
      setReason("");
    }
  }, [isOpen, currentStatus]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reverse Submission Status</DialogTitle>
          <DialogDescription>
            Admin override. This change is recorded in the status history.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reverse-status-select">Target status</Label>
            <select
              id="reverse-status-select"
              className="border-input w-full rounded border bg-transparent px-3 py-2 text-sm"
              value={toStatus}
              disabled={isProcessing}
              onChange={(e) =>
                setToStatus(e.target.value as SubmissionStatus)
              }
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reverse-status-reason">Reason (optional)</Label>
            <Textarea
              id="reverse-status-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={isProcessing}
              placeholder="Why is this status being reversed?"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button
            onClick={() => onConfirm(toStatus, reason.trim() || "")}
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : "Reverse Status"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
