/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { traderService, type DelegationStatus } from "@/app/services/traderService";
import { Loader2, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export function DelegationSettings() {
  const [status, setStatus] = useState<DelegationStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [showReverseModal, setShowReverseModal] = useState(false);
  const [reverseOtp, setReverseOtp] = useState("");
  const [showAgreementModal, setShowAgreementModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [commission, setCommission] = useState(5);
  const [sessionId, setSessionId] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      setIsLoading(true);
      const response = await traderService.getDelegationStatus();
      setStatus(response.data);
      setCommission(response.data.commission);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch delegation status");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleDelegation = async (enabled: boolean) => {
    if (enabled) {
      setShowAgreementModal(true);
    } else {
      handleRevoke();
    }
  };

  const handleRequestDelegation = async () => {
    if (!agreedToTerms) {
      toast.error("Please read and agree to the authorization terms");
      return;
    }

    try {
      setIsProcessing(true);
      const response = await traderService.requestDelegation();
      
      if (response.success) {
        toast.success(response.message || "Delegation request submitted successfully");
        setShowAgreementModal(false);
        setAgreedToTerms(false);
        fetchStatus();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to request delegation");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    try {
      setIsProcessing(true);
      await traderService.verifyDelegationOTP({
        sessionId,
        otp,
        commission,
      });
      toast.success("Delegation approved successfully!");
      setShowOTPModal(false);
      setOtp("");
      setSessionId("");
      fetchStatus();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to verify OTP");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRevoke = async () => {
    if (!status?.canTradeOnBehalf) return;
    setShowReverseModal(true);
  };

  const handleReverseDelegation = async () => {
    if (!reverseOtp || reverseOtp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    try {
      setIsProcessing(true);
      await traderService.reverseDelegation(reverseOtp);
      toast.success("Delegation reversed successfully");
      setShowReverseModal(false);
      setReverseOtp("");
      fetchStatus();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to reverse delegation");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-green-600" />
        </div>
      </Card>
    );
  }

  const getStatusBadge = () => {
    switch (status?.status) {
      case "APPROVED":
        return (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-medium">Active</span>
          </div>
        );
      case "PENDING":
        return (
          <div className="flex items-center gap-2 text-yellow-600">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">Pending Approval</span>
          </div>
        );
      case "REJECTED":
        return (
          <div className="flex items-center gap-2 text-red-600">
            <XCircle className="h-5 w-5" />
            <span className="font-medium">Rejected</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 text-gray-600">
            <XCircle className="h-5 w-5" />
            <span className="font-medium">Not Requested</span>
          </div>
        );
    }
  };

  return (
    <>
      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Delegation Settings</h2>
            <p className="text-sm text-gray-600 mt-1">
              Manage your authorization to trade on behalf of Food Bundles
            </p>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-semibold text-gray-900">Delegation Status</h3>
                {getStatusBadge()}
              </div>
              <p className="text-sm text-gray-600">
                {status?.canTradeOnBehalf
                  ? "You are authorized to trade on behalf of Food Bundles"
                  : "Enable delegation to trade on behalf of Food Bundles"}
              </p>
            </div>
            <Switch
              checked={status?.canTradeOnBehalf || false}
              onCheckedChange={handleToggleDelegation}
              disabled={isProcessing || status?.status === "PENDING"}
            />
          </div>

          {status?.canTradeOnBehalf && (
            <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Commission Rate</p>
                  <p className="text-xs text-gray-600">Your commission on delegated trades</p>
                </div>
                <span className="text-2xl font-bold text-green-600">{status.commission}%</span>
              </div>
              {status.delegationApprovedAt && (
                <div className="text-xs text-gray-600">
                  Approved on: {new Date(status.delegationApprovedAt).toLocaleDateString()}
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Agreement Modal */}
      <Dialog open={showAgreementModal} onOpenChange={setShowAgreementModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Delegation Authorization Agreement</DialogTitle>
            <DialogDescription>
              Please read and agree to the terms before proceeding
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-gray-50 rounded-lg space-y-3">
              <h3 className="font-bold text-base">8.2 Authorization</h3>
              <p className="text-sm text-gray-700">
                By submitting and confirming such a request, you grant Food Bundles a limited,
                revocable authorization to act on your behalf solely for the specified tasks. You
                may revoke authorization via the Platform, effective upon confirmation.
              </p>
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-sm text-yellow-800">
                  <strong>Important:</strong> This authorization allows Food Bundles to process
                  trades and transactions on your behalf. You will earn a commission of {commission}%
                  on all delegated trades.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-white border rounded">
              <input
                type="checkbox"
                id="agree-terms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1"
              />
              <label htmlFor="agree-terms" className="text-sm text-gray-700 cursor-pointer">
                I have read and agree to the delegation authorization terms. I understand that I can
                revoke this authorization at any time through the platform.
              </label>
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAgreementModal(false);
                  setAgreedToTerms(false);
                }}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                onClick={handleRequestDelegation}
                disabled={!agreedToTerms || isProcessing}
                className="bg-green-600 hover:bg-green-700"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Continue"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* OTP Verification Modal */}
      <Dialog open={showOTPModal} onOpenChange={setShowOTPModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify OTP</DialogTitle>
            <DialogDescription>
              Enter the OTP sent to your registered phone number
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-gray-700">OTP Code</label>
              <Input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                maxLength={6}
                className="mt-1"
              />
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowOTPModal(false);
                  setOtp("");
                }}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                onClick={handleVerifyOTP}
                disabled={isProcessing || otp.length !== 6}
                className="bg-green-600 hover:bg-green-700"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reverse Delegation Modal */}
      <Dialog open={showReverseModal} onOpenChange={setShowReverseModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reverse Delegation</DialogTitle>
            <DialogDescription>
              Enter OTP to reverse your delegation status and continue approving vouchers/loans directly
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Reversing delegation will allow you to approve vouchers and loans directly again.
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">OTP Code</label>
              <Input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={reverseOtp}
                onChange={(e) => setReverseOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                maxLength={6}
                className="mt-1"
              />
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowReverseModal(false);
                  setReverseOtp("");
                }}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                onClick={handleReverseDelegation}
                disabled={isProcessing || reverseOtp.length !== 6}
                className="bg-red-600 hover:bg-red-700"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Reverse Delegation"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
