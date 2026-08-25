"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { voucherService } from "@/app/services/voucherService";
import { ILoanSession, LoanSessionStatus } from "@/lib/types";
import {
  Clock,
  CheckCircle,
  XCircle,
  Lock,
  Unlock,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import UnlockFeeModal from "./UnlockFeeModal";

const STATUS_CONFIG: Record<
  LoanSessionStatus,
  { label: string; color: string; bg: string; icon: React.ReactNode }
> = {
  [LoanSessionStatus.REQUESTED]: {
    label: "Pending Review",
    color: "text-yellow-700",
    bg: "bg-gradient-to-tr from-yellow-500 to-orange-500",
    icon: <Clock className="w-3 h-3" />,
  },
  [LoanSessionStatus.APPROVED_LOCKED]: {
    label: "Approved — Locked",
    color: "text-blue-700",
    bg: "bg-gradient-to-tr from-blue-500 to-indigo-500",
    icon: <Lock className="w-3 h-3" />,
  },
  [LoanSessionStatus.UNLOCK_FEE_PENDING]: {
    label: "Pay Unlock Fee",
    color: "text-orange-700",
    bg: "bg-gradient-to-tr from-orange-500 to-red-400",
    icon: <Lock className="w-3 h-3" />,
  },
  [LoanSessionStatus.ACTIVE]: {
    label: "Active",
    color: "text-green-700",
    bg: "bg-gradient-to-tr from-green-500 to-lime-500",
    icon: <Unlock className="w-3 h-3" />,
  },
  [LoanSessionStatus.PARTIALLY_USED]: {
    label: "Partially Used",
    color: "text-teal-700",
    bg: "bg-gradient-to-tr from-teal-500 to-cyan-500",
    icon: <CheckCircle className="w-3 h-3" />,
  },
  [LoanSessionStatus.FULLY_USED]: {
    label: "Fully Used",
    color: "text-indigo-700",
    bg: "bg-gradient-to-tr from-indigo-500 to-purple-500",
    icon: <CheckCircle className="w-3 h-3" />,
  },
  [LoanSessionStatus.CLOSED]: {
    label: "Closed",
    color: "text-gray-600",
    bg: "bg-gradient-to-tr from-gray-500 to-gray-600",
    icon: <CheckCircle className="w-3 h-3" />,
  },
  [LoanSessionStatus.SETTLED]: {
    label: "Settled",
    color: "text-green-700",
    bg: "bg-gradient-to-tr from-green-600 to-emerald-600",
    icon: <CheckCircle className="w-3 h-3" />,
  },
  [LoanSessionStatus.REJECTED]: {
    label: "Rejected",
    color: "text-red-700",
    bg: "bg-gradient-to-tr from-red-500 to-rose-500",
    icon: <XCircle className="w-3 h-3" />,
  },
  [LoanSessionStatus.OVERDUE]: {
    label: "Overdue",
    color: "text-red-700",
    bg: "bg-gradient-to-tr from-red-600 to-red-700",
    icon: <AlertCircle className="w-3 h-3" />,
  },
};

export default function LoanSessionCard() {
  const [session, setSession] = useState<ILoanSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [unlockModalOpen, setUnlockModalOpen] = useState(false);

  const load = () => {
    setLoading(true);
    voucherService
      .getMyLoanSessions()
      .then((res) => {
        const sessions: ILoanSession[] = res?.data ?? [];
        // Show the most recent non-closed/settled session
        const active = sessions.find(
          (s) =>
            s.status !== LoanSessionStatus.CLOSED &&
            s.status !== LoanSessionStatus.SETTLED &&
            s.status !== LoanSessionStatus.REJECTED
        );
        setSession(active ?? sessions[0] ?? null);
      })
      .catch(() => setSession(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <div className="mb-2">
        <h2 className="text-[16px] text-center font-medium mb-4">Current Loan Session</h2>
        <div className="flex justify-center">
          <div className="w-75 h-86 flex flex-col p-6 border rounded relative bg-white">
            <Skeleton className="h-6 w-28 mx-auto mb-4" />
            <Skeleton className="h-8 w-36 mx-auto mb-2" />
            <div className="space-y-3 mt-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4 mx-auto" />
              <Skeleton className="h-4 w-1/2 mx-auto" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="mb-2">
        <h2 className="text-[16px] text-center font-medium mb-4">Current Loan Session</h2>
        <div className="flex justify-center">
          <Card className="w-75 h-86 flex flex-col items-center justify-center p-6 border-dashed border-gray-300 shadow-none rounded">
            <Lock className="w-10 h-10 text-gray-300 mb-3" />
            <p className="text-gray-500 text-sm text-center">No active loan session</p>
            <p className="text-gray-400 text-xs text-center mt-1">
              Submit a loan request to get started
            </p>
          </Card>
        </div>
      </div>
    );
  }

  const cfg = STATUS_CONFIG[session.status] ?? STATUS_CONFIG[LoanSessionStatus.REQUESTED];
  const needsUnlock =
    session.status === LoanSessionStatus.APPROVED_LOCKED ||
    session.status === LoanSessionStatus.UNLOCK_FEE_PENDING;

  return (
    <div className="mb-2">
      <h2 className="text-[16px] text-center font-medium mb-4">Current Loan Session</h2>
      <div className="flex justify-center">
        <Card className="w-75 h-86 flex flex-col p-5 border-gray-200 shadow-none rounded relative">
          {/* Status badge */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span
              className={`flex items-center gap-1 px-3 h-6 text-white text-[12px] rounded ${cfg.bg}`}
            >
              {cfg.icon}
              {cfg.label}
            </span>
          </div>

          <div className="mt-3 text-center mb-2">
            <Badge className="bg-green-100 text-green-800 rounded text-xs mb-1">
              RRN: {session.rrn}
            </Badge>
            <p className="text-xl font-bold text-gray-900">
              {(session.approvedAmount ?? session.requestedAmount).toLocaleString()}{" "}
              <span className="text-sm font-normal text-gray-500">RWF</span>
            </p>
            {session.approvalPercentage && session.approvalPercentage < 100 && (
              <p className="text-xs text-gray-400">
                {session.approvalPercentage}% of {session.requestedAmount.toLocaleString()} RWF requested
              </p>
            )}
          </div>

          <div className="space-y-2 text-xs flex-1">
            {/* Unlock fee */}
            {session.unlockFee != null && (
              <div className="flex justify-between items-center bg-orange-50 rounded px-2 py-1.5">
                <span className="text-orange-700 font-medium">Unlock Fee</span>
                <span className="font-semibold text-orange-800">
                  {session.unlockFee.toLocaleString()} RWF
                  {session.unlockFeePercentage && (
                    <span className="text-orange-500 ml-1">({session.unlockFeePercentage}%)</span>
                  )}
                </span>
              </div>
            )}

            {/* Amounts */}
            <div className="grid grid-cols-2 gap-2 text-center">
              <div>
                <p className="text-gray-400">Used</p>
                <p className="font-semibold text-orange-600">
                  {session.amountUsed.toLocaleString()} RWF
                </p>
              </div>
              <div>
                <p className="text-gray-400">Outstanding</p>
                <p className={`font-semibold ${session.outstandingAmount > 0 ? "text-red-600" : "text-gray-600"}`}>
                  {session.outstandingAmount.toLocaleString()} RWF
                </p>
              </div>
            </div>

            {/* Dates */}
            <div className="space-y-1 text-center text-gray-500">
              <p>Requested: {new Date(session.requestedAt).toLocaleDateString()}</p>
              {session.dueDate && (
                <p className={new Date(session.dueDate) < new Date() ? "text-red-600 font-medium" : ""}>
                  Due: {new Date(session.dueDate).toLocaleDateString()}
                </p>
              )}
              {session.notes && (
                <p className="text-blue-600 text-xs">{session.notes}</p>
              )}
            </div>
          </div>

          {/* Unlock fee CTA */}
          {needsUnlock && session.unlockFee != null && (
            <Button
              onClick={() => setUnlockModalOpen(true)}
              className="w-full mt-3 bg-orange-500 hover:bg-orange-600 h-9 text-sm"
            >
              <Unlock className="w-3.5 h-3.5 mr-1.5" />
              Pay Unlock Fee — {session.unlockFee.toLocaleString()} RWF
            </Button>
          )}
        </Card>
      </div>

      {session && (
        <UnlockFeeModal
          open={unlockModalOpen}
          onClose={() => setUnlockModalOpen(false)}
          session={session}
          onSuccess={() => {
            setUnlockModalOpen(false);
            load();
            toast.success("Unlock fee paid — your loan is now active!");
          }}
        />
      )}
    </div>
  );
}
