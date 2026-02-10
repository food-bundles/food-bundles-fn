/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { traderService, type DelegationStatus } from "@/app/services/traderService";
import { Loader2, AlertCircle, CheckCircle2, XCircle, Clock } from "lucide-react";
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
      } else if (delegationStatus === "NORMAL" || !delegationStatus) {
        setShowAgreementModal(true);
      }
    } else {
      if (delegationStatus === "ACCEPTED") {
        setShowReverseModal(true);
      }
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
    const delegationStatus = status?.status || status?.delegationStatus;
    switch (delegationStatus) {
      case "NORMAL":
        return (
          <div className="flex items-center gap-2 text-gray-600">
            <span className="font-medium">Not Requested</span>
          </div>
        );
      case "ACCEPTED":
        return (
          <div className="flex items-center gap-2 text-green-600">
            <span className="font-medium">Active</span>
          </div>
        );
      case "APPROVED":
        return (
          <div className="flex items-center gap-2 text-green-600">
            <span className="font-medium">Approved</span>
          </div>
        );
      case "PENDING":
        return (
          <div className="flex items-center gap-2 text-yellow-600">
            <span className="font-medium">Pending</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 text-gray-600">
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
            <h2 className="text-xl font-bold text-gray-900">
              Delegation Settings
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Manage your authorization to trade on behalf of Food Bundles
            </p>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-semibold text-gray-900">
                  Delegation Status:
                </h3>
                {getStatusBadge()}
              </div>
              <p className="text-sm text-gray-600">
                {(status?.status || status?.delegationStatus) === "ACCEPTED"
                  ? "Food Bundles is now authorized to trade on your behalf with the specified commission. You can reverse this at any time."
                  : (status?.status || status?.delegationStatus) === "APPROVED"
                  ? "Admin approved your request. Accept to activate delegation."
                  : (status?.status || status?.delegationStatus) === "PENDING"
                  ? "Your delegation request is pending admin approval"
                  : "Enable delegation to trade on behalf of Food Bundles"}
              </p>
            </div>
            {(status?.status || status?.delegationStatus) === "NORMAL" && (
              <Switch
                checked={false}
                onCheckedChange={handleToggleDelegation}
                disabled={isProcessing}
              />
            )}
            {(status?.status || status?.delegationStatus) === "APPROVED" && (
              <Button
                onClick={() => setShowAcceptModal(true)}
                disabled={isProcessing}
                className="bg-green-600 hover:bg-green-700"
              >
                Accept
              </Button>
            )}
            {(status?.status || status?.delegationStatus) === "ACCEPTED" && (
              <Button
                onClick={() => setShowReverseModal(true)}
                disabled={isProcessing}
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                Reverse
              </Button>
            )}
          </div>

          {(status?.status || status?.delegationStatus) === "ACCEPTED" && status && (
            <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Commission Rate
                  </p>
                  <p className="text-xs text-gray-600">
                    Your commission on delegated trades
                  </p>
                </div>
                <span className="text-2xl font-bold text-green-600">
                  {status.commission}%
                </span>
              </div>
              {status.delegationAcceptedAt && (
                <div className="text-xs text-gray-600">
                  Accepted on:{" "}
                  {new Date(status.delegationAcceptedAt).toLocaleDateString()}
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
          <div className="space-y-4 pb-4">
            <div className="p-4 bg-gray-50 rounded-lg space-y-3">
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

      {/* Accept Delegation Modal */}
      <Dialog open={showAcceptModal} onOpenChange={setShowAcceptModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Accept Delegation</DialogTitle>
            <DialogDescription>
              Enter the OTP sent to your email to accept delegation
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 bg-green-50 border border-blue-200 rounded">
              <p className="text-sm text-green-800">
                <strong>Commission:</strong> {status?.commission}% on delegated trades
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

      {/* Reverse Delegation Modal */}
      <Dialog open={showReverseModal} onOpenChange={setShowReverseModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reverse Delegation</DialogTitle>
            <DialogDescription>
              Are you sure you want to reverse your delegation status?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Reversing delegation will allow you to
                approve vouchers and loans directly again. Food Bundles will no longer
                have control of your wallet.
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
