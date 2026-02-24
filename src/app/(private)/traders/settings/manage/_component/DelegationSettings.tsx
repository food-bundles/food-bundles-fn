/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { traderService, type DelegationStatus } from "@/app/services/traderService";
import { Loader2, UserCheck } from "lucide-react";
import { toast } from "react-hot-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export function DelegationSettings({ commission }: { commission: number }) {
  const [status, setStatus] = useState<DelegationStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showReverseModal, setShowReverseModal] = useState(false);
  const [acceptOtp, setAcceptOtp] = useState("");
  const [showAgreementModal, setShowAgreementModal] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      setIsLoading(true);
      const response = await traderService.getDelegationStatus();
      setStatus(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch delegation status");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleDelegation = async (enabled: boolean) => {
    const delegationStatus = status?.status || status?.delegationStatus;
    if (enabled) {
      if (delegationStatus === "APPROVED") {
        setShowAcceptModal(true);
      } else {
        setShowAgreementModal(true);
      }
    } else {
      setShowReverseModal(true);
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
      toast.success(response.message || "Delegation request submitted successfully");
      setShowAgreementModal(false);
      setAgreedToTerms(false);
      fetchStatus();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to request delegation");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAcceptDelegation = async () => {
    if (!acceptOtp || acceptOtp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    try {
      setIsProcessing(true);
      const response = await traderService.acceptDelegation(acceptOtp);
      toast.success(response.message || "Delegation accepted successfully!");
      setShowAcceptModal(false);
      setAcceptOtp("");
      fetchStatus();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to accept delegation");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReverseDelegation = async () => {
    try {
      setIsProcessing(true);
      const response = await traderService.reverseDelegation();
      toast.success(response.message || "Delegation reversed successfully");
      setShowReverseModal(false);
      fetchStatus();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to reverse delegation");
    } finally {
      setIsProcessing(false);
    }
  };

  const delegationStatus = status?.status || status?.delegationStatus;
  const isActive = delegationStatus === "ACCEPTED";
  const isPending = delegationStatus === "PENDING";

  return (
    <>
      <Card className="p-4 h-35 w-full sm:w-64">
        <div className="flex flex-col items-start space-y-3">
          <div className="flex items-center w-full  gap-2 pb-2 border-b border-gray-200">
            <div className="p-3 bg-green-50 rounded-full">
              <UserCheck className="h-4 w-4 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Delegation</h3>
          </div>
          <div className="flex items-center justify-between w-full">
            <p className="text-xs text-gray-600">
              {isActive
                ? "FB trading on your behalf"
                : "Allow FB to approve loans"}
            </p>
            <Switch
              checked={isActive}
              onCheckedChange={handleToggleDelegation}
              disabled={isProcessing || isPending || isLoading}
            />
          </div>
          {delegationStatus === "APPROVED" && (
            <Button
              onClick={() => setShowAcceptModal(true)}
              size="sm"
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Accept Now
            </Button>
          )}
        </div>
      </Card>

      <Dialog open={showAgreementModal} onOpenChange={setShowAgreementModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Delegation Authorization Agreement</DialogTitle>
            <DialogDescription>
              Please read and agree to the terms before proceeding
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pb-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700">
                By submitting and confirming such a request, you grant Food
                Bundles a limited, revocable authorization to act on your behalf
                solely for the specified tasks. You may revoke authorization via
                the Platform, effective upon confirmation.
              </p>
            </div>
            <div className="flex bg-yellow-50 items-start gap-3 p-3 border border-yellow-200 rounded">
              <input
                type="checkbox"
                id="agree-terms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1"
              />
              <label
                htmlFor="agree-terms"
                className="text-sm text-yellow-800 cursor-pointer"
              >
                I have read and agree to the delegation authorization terms. I
                understand that I can revoke this authorization at any time
                through the platform.
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
                  "Submit Request"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAcceptModal} onOpenChange={setShowAcceptModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Accept Delegation</DialogTitle>
            <DialogDescription>
              Enter the OTP sent to your email
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 bg-green-50 border border-green-200 rounded">
              <p className="text-sm text-green-800">
                <strong>Commission:</strong> {commission}% on delegated trades
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                OTP Code (valid for 24 hours)
              </label>
              <Input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={acceptOtp}
                onChange={(e) =>
                  setAcceptOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                maxLength={6}
                className="mt-1"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAcceptModal(false);
                  setAcceptOtp("");
                }}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAcceptDelegation}
                disabled={isProcessing || acceptOtp.length !== 6}
                className="bg-green-600 hover:bg-green-700"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Accepting...
                  </>
                ) : (
                  "Accept Delegation"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showReverseModal} onOpenChange={setShowReverseModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reverse Delegation</DialogTitle>
            <DialogDescription>
              Are you sure you want to reverse your delegation?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm text-yellow-800">
                You will regain control and approve loans directly. Food Bundles
                will no longer trade on your behalf.
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowReverseModal(false)}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                onClick={handleReverseDelegation}
                disabled={isProcessing}
                className="bg-red-600 hover:bg-red-700"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Yes, Reverse"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
