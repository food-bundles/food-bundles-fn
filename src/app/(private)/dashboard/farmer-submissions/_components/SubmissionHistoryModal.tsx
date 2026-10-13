"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { formatDateTime } from "@/lib/reusableFunctions";
import {
  SubmissionPayout,
  SubmissionStatusHistoryEntry,
} from "@/app/contexts/submission-context";
import { submissionService } from "@/app/services/submissionServices";
import { toast } from "sonner";

interface SubmissionHistoryModalProps {
  isOpen: boolean;
  submissionId: string | null;
  onClose: () => void;
  onChanged?: () => void;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-RW", {
    style: "currency",
    currency: "RWF",
  }).format(amount);
};

const payoutStatusColor = (status: string) => {
  switch (status) {
    case "COMPLETED":
      return "bg-green-100 text-green-800 hover:bg-green-100";
    case "FAILED":
    case "CANCELLED":
      return "bg-red-100 text-red-800 hover:bg-red-100";
    case "PROCESSING":
      return "bg-blue-100 text-blue-800 hover:bg-blue-100";
    default:
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
  }
};

export function SubmissionHistoryModal({
  isOpen,
  submissionId,
  onClose,
  onChanged,
}: SubmissionHistoryModalProps) {
  const [loading, setLoading] = useState(false);
  const [payouts, setPayouts] = useState<SubmissionPayout[]>([]);
  const [history, setHistory] = useState<SubmissionStatusHistoryEntry[]>([]);
  const [resolvingPayoutId, setResolvingPayoutId] = useState<string | null>(
    null
  );

  const load = async () => {
    if (!submissionId) return;
    try {
      setLoading(true);
      const [payoutsRes, historyRes] = await Promise.all([
        submissionService.getSubmissionPayouts(submissionId),
        submissionService.getSubmissionStatusHistory(submissionId),
      ]);

      setPayouts(payoutsRes.success ? payoutsRes.data : []);
      setHistory(historyRes.success ? historyRes.data : []);
    } catch (error) {
      console.error("Failed to load submission history:", error);
      toast.error("Failed to load submission history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, submissionId]);

  const handleResolvePayout = async (
    payoutId: string,
    outcome: "COMPLETED" | "FAILED"
  ) => {
    if (!submissionId) return;
    try {
      setResolvingPayoutId(payoutId);
      const response = await submissionService.confirmSubmissionPayout(
        submissionId,
        payoutId,
        outcome
      );

      if (!response.success) {
        toast.error(response.message || "Failed to update payout");
        return;
      }

      toast.success(
        outcome === "COMPLETED"
          ? "Payout marked as completed"
          : "Payout marked as failed"
      );
      await load();
      onChanged?.();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to update payout"
      );
    } finally {
      setResolvingPayoutId(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Submission History</DialogTitle>
          <DialogDescription>
            Payout attempts and status change audit trail for this
            submission.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <p className="text-sm text-gray-500 py-4">Loading...</p>
        ) : (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold mb-2">Payouts</h3>
              {payouts.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No payout attempts yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {payouts.map((payout) => (
                    <div
                      key={payout.id}
                      className="border rounded-md p-3 flex items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge className={payoutStatusColor(payout.status)}>
                            {payout.status}
                          </Badge>
                          <span className="font-medium text-sm">
                            {formatCurrency(payout.amount)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          Phone: {payout.phoneNumber}
                          {payout.paypackRef &&
                            ` · Ref: ${payout.paypackRef}`}
                        </p>
                        <p className="text-xs text-gray-400">
                          Initiated {formatDateTime(payout.createdAt)}
                          {payout.confirmedAt &&
                            ` · Confirmed ${formatDateTime(payout.confirmedAt)}`}
                        </p>
                      </div>

                      {payout.status === "PROCESSING" && (
                        <div className="flex gap-2 shrink-0">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={resolvingPayoutId === payout.id}
                            onClick={() =>
                              handleResolvePayout(payout.id, "COMPLETED")
                            }
                          >
                            Mark Completed
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={resolvingPayoutId === payout.id}
                            onClick={() =>
                              handleResolvePayout(payout.id, "FAILED")
                            }
                          >
                            Mark Failed
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-semibold mb-2">Status History</h3>
              {history.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No status changes recorded yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {history.map((entry) => (
                    <div key={entry.id} className="border rounded-md p-3">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">
                          {entry.fromStatus}
                        </span>
                        <span className="text-gray-400">&rarr;</span>
                        <span className="font-medium">{entry.toStatus}</span>
                      </div>
                      {entry.reason && (
                        <p className="text-xs text-gray-600 mt-1">
                          Reason: {entry.reason}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDateTime(entry.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
