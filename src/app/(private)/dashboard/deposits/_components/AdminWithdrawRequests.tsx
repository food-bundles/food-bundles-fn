"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { traderService, type WithdrawalRequest } from "@/app/services/traderService";
import { formatDateTime } from "@/lib/reusableFunctions";
import { Loader2, Check, X } from "lucide-react";
import toast from "react-hot-toast";

interface AdminWithdrawRequestsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminWithdrawRequests({ isOpen, onClose }: AdminWithdrawRequestsProps) {
  const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [otpModal, setOtpModal] = useState<{ sessionId: string; withdrawId: string } | null>(null);
  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await traderService.getAllWithdrawRequests({ limit: 50 });
      setRequests(response.data);
    } catch (error) {
      console.error("Failed to fetch withdrawal requests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchRequests();
    }
  }, [isOpen]);

  const handleApprove = async (withdrawId: string) => {
    setActionLoading(withdrawId);
    try {
      const response = await traderService.approveWithdrawal(withdrawId);
      toast.success(response.message || "OTP sent to trader");
      setOtpModal({ sessionId: response.sessionId, withdrawId });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to approve withdrawal");
    } finally {
      setActionLoading(null);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || !otpModal) return;
    setVerifying(true);
    try {
      const response = await traderService.verifyWithdrawalOTP({
        sessionId: otpModal.sessionId,
        otp,
      });
      toast.success(response.message || "Withdrawal completed successfully");
      setOtpModal(null);
      setOtp("");
      fetchRequests();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Invalid OTP");
    } finally {
      setVerifying(false);
    }
  };

  const handleCancel = async (withdrawId: string) => {
    setActionLoading(withdrawId);
    try {
      const response = await traderService.cancelWithdrawal(withdrawId);
      toast.success(response.message || "Withdrawal cancelled");
      fetchRequests();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to cancel withdrawal");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED": return "text-green-600 bg-green-50";
      case "PENDING": return "text-yellow-600 bg-yellow-50";
      case "FAILED": return "text-red-600 bg-red-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Withdrawal Requests</DialogTitle>
          </DialogHeader>
          
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="p-4 border rounded-lg animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : requests.length > 0 ? (
            <div className="space-y-3">
              {requests.map((req) => (
                <div key={req.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold">{req.wallet?.trader?.username || "Unknown Trader"}</p>
                      <p className="text-sm text-gray-600">{req.wallet?.trader?.email}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(req.status)}`}>
                      {req.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                    <div><span className="text-gray-600">Amount:</span> {Math.abs(req.amount).toLocaleString()} RWF</div>
                    <div><span className="text-gray-600">Type:</span> {req.withdrawType}</div>
                    <div><span className="text-gray-600">Method:</span> {req.paymentMethod}</div>
                    <div><span className="text-gray-600">Account:</span> {req.accountNumber}</div>
                    <div><span className="text-gray-600">Name:</span> {req.accountName}</div>
                    <div><span className="text-gray-600">Date:</span> {formatDateTime(req.createdAt)}</div>
                  </div>

                  {req.status === "PENDING" && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(req.id)}
                        disabled={actionLoading === req.id}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {actionLoading === req.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 mr-1" />}
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleCancel(req.id)}
                        disabled={actionLoading === req.id}
                      >
                        {actionLoading === req.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4 mr-1" />}
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No withdrawal requests found</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!otpModal} onOpenChange={() => { setOtpModal(null); setOtp(""); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Verify OTP</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Enter the OTP sent to the trader to complete the withdrawal</p>
            <div>
              <Label htmlFor="otp">OTP Code</Label>
              <Input
                id="otp"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => { setOtpModal(null); setOtp(""); }} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleVerifyOTP} disabled={verifying || otp.length !== 6} className="flex-1 bg-green-600 hover:bg-green-700">
                {verifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
