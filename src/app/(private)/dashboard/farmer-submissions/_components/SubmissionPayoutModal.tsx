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

type Step = "phone" | "otp";

interface SubmissionPayoutModalProps {
  isOpen: boolean;
  defaultPhone: string;
  onClose: () => void;
  onRequestOTP: (phoneNumber: string) => Promise<string>;
  onVerifyOTP: (otp: string, sessionId: string) => Promise<void>;
}

export function SubmissionPayoutModal({
  isOpen,
  defaultPhone,
  onClose,
  onRequestOTP,
  onVerifyOTP,
}: SubmissionPayoutModalProps) {
  const [step, setStep] = useState<Step>("phone");
  const [phoneNumber, setPhoneNumber] = useState(defaultPhone);
  const [otp, setOtp] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setStep("phone");
      setPhoneNumber(defaultPhone);
      setOtp("");
      setSessionId("");
      setError("");
    }
  }, [isOpen, defaultPhone]);

  const handleSendOTP = async () => {
    setError("");
    setIsProcessing(true);
    try {
      const newSessionId = await onRequestOTP(phoneNumber);
      setSessionId(newSessionId);
      setStep("otp");
    } catch (err: any) {
      setError(err?.message || "Failed to send OTP");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerify = async () => {
    setError("");
    setIsProcessing(true);
    try {
      await onVerifyOTP(otp, sessionId);
    } catch (err: any) {
      setError(err?.message || "Failed to initiate payout");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pay via PayPack</DialogTitle>
          <DialogDescription>
            {step === "phone"
              ? "An OTP will be sent for verification before the PayPack cashout is initiated."
              : "Enter the OTP sent to the verification contact to confirm this payout."}
          </DialogDescription>
        </DialogHeader>

        {step === "phone" ? (
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
        ) : (
          <div className="space-y-2">
            <Label htmlFor="payout-otp">OTP code</Label>
            <Input
              id="payout-otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              disabled={isProcessing}
              placeholder="6-digit code"
            />
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
          {step === "phone" ? (
            <Button
              onClick={handleSendOTP}
              disabled={isProcessing || !phoneNumber.trim()}
            >
              {isProcessing ? "Sending OTP..." : "Send OTP"}
            </Button>
          ) : (
            <Button
              onClick={handleVerify}
              disabled={isProcessing || !otp.trim()}
            >
              {isProcessing ? "Confirming..." : "Confirm Payout"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
