"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  agreedPriceOf,
  askedPriceOf,
  farmerDisplayName,
  type FarmerSubmission as SubmissionType,
  type SubmissionStage,
} from "@/app/contexts/submission-context";
import { submissionService } from "@/app/services/submissionServices";
import { toast } from "sonner";
import FarmerManagement from "./FarmerManagement";
import { useAdminAccess } from "@/app/hooks/useAdminAccess";
import {
  ApproveSubmissionModal,
  PaySubmissionModal,
  StageProgress,
} from "../../farmer-submissions/_components/SubmissionStageModals";
import { ReasonConfirmDialog } from "../../farmer-submissions/_components/SubmissionActionDialogs";

interface FarmerSubmissionProps {
  initialSubmissions?: SubmissionType[];
}

// One tab per stage of the farmer journey: submit → approve → verify → pay
const STAGE_TABS: Array<{ key: SubmissionStage; label: string; empty: string }> = [
  { key: "PENDING", label: "To approve", empty: "No submissions waiting for approval." },
  { key: "NEGOTIATING", label: "Counter-offer", empty: "No counter-offers sent." },
  { key: "APPROVED", label: "To verify", empty: "Nothing to weigh right now." },
  { key: "VERIFIED", label: "To pay", empty: "No farmers waiting for payment." },
  { key: "PAID", label: "Paid", empty: "No paid submissions yet." },
];

type TabKey = SubmissionStage | "farmers";

const rwf = (value: number | null | undefined) => `${Math.round(value ?? 0).toLocaleString()} Rwf`;

const errorMessage = (error: unknown, fallback: string) =>
  (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
  (error as Error)?.message ||
  fallback;

const timeAgo = (date: string) => {
  const minutes = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
  if (days < 30) return `${Math.floor(days / 7)} week${days >= 14 ? "s" : ""} ago`;
  if (days < 365) return `${Math.floor(days / 30)} month${days >= 60 ? "s" : ""} ago`;
  return `${Math.floor(days / 365)} year${days >= 730 ? "s" : ""} ago`;
};

export default function FarmerSubmission({ initialSubmissions = [] }: FarmerSubmissionProps) {
  const [submissions, setSubmissions] = useState<SubmissionType[]>(initialSubmissions);
  const [activeTab, setActiveTab] = useState<TabKey | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [quantities, setQuantities] = useState<Record<string, string>>({});
  const [prices, setPrices] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  // Stage popups (same ones as Submission Management)
  const [approveTarget, setApproveTarget] = useState<SubmissionType | null>(null);
  const [payTarget, setPayTarget] = useState<SubmissionType | null>(null);
  const [rejectTarget, setRejectTarget] = useState<SubmissionType | null>(null);
  const [rejecting, setRejecting] = useState(false);

  // Each stage's action follows its own permission
  const { can } = useAdminAccess();
  const canApprove = can("farmer_submissions", "approve");
  const canVerify = can("farmer_submissions", "verify");
  const canPay = can("farmer_submissions", "request_payout");
  const canReject = can("farmer_submissions", "reject");
  const canSetPrice = can("farmer_submissions", "set_price");
  const canSeeFarmers = can("farmers");

  const fetchSubmissions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await submissionService.getAllSubmissions({ page: 1, limit: 200 });
      if (response.success) setSubmissions(response.data);
      else toast.error("Failed to fetch submissions");
    } catch (error) {
      console.error("Error fetching submissions:", error);
      toast.error("Error fetching submissions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialSubmissions.length === 0) fetchSubmissions();
  }, [fetchSubmissions, initialSubmissions.length]);

  const byStage = useMemo(() => {
    const groups = Object.fromEntries(STAGE_TABS.map((t) => [t.key, [] as SubmissionType[]])) as Record<
      SubmissionStage,
      SubmissionType[]
    >;
    for (const submission of submissions) {
      groups[submission.status]?.push(submission);
    }
    return groups;
  }, [submissions]);

  // Open on the first stage that has work, once data has loaded
  const tab: TabKey =
    activeTab ?? STAGE_TABS.find((t) => (byStage[t.key]?.length ?? 0) > 0)?.key ?? "PENDING";

  const visible = useMemo(() => {
    if (tab === "farmers") return [];
    const term = searchTerm.trim().toLowerCase();
    return (byStage[tab] || []).filter(
      (s) =>
        !term ||
        farmerDisplayName(s.farmer).toLowerCase().includes(term) ||
        (s.farmer?.phone || "").includes(term) ||
        s.productName.toLowerCase().includes(term),
    );
  }, [byStage, tab, searchTerm]);

  const toggleVerifyForm = (submission: SubmissionType) => {
    setQuantities((prev) => ({ ...prev, [submission.id]: prev[submission.id] ?? String(submission.submittedQty ?? "") }));
    setPrices((prev) => ({
      ...prev,
      [submission.id]: prev[submission.id] ?? String(agreedPriceOf(submission) || ""),
    }));
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(submission.id)) next.delete(submission.id);
      else next.add(submission.id);
      return next;
    });
  };

  const handleVerify = async (submission: SubmissionType) => {
    const acceptedQty = parseFloat(quantities[submission.id]);
    const unitPrice = parseFloat(prices[submission.id]);
    if (!acceptedQty || !unitPrice) {
      toast.error("Please enter the quantity received");
      return;
    }
    try {
      setBusyId(submission.id);
      await submissionService.purchaseSubmission(submission.id, { acceptedQty, unitPrice });
      toast.success("Submission verified. It is now ready to pay.");
      setExpandedCards((prev) => {
        const next = new Set(prev);
        next.delete(submission.id);
        return next;
      });
      await fetchSubmissions();
    } catch (error) {
      toast.error(errorMessage(error, "Failed to verify submission"));
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (reason: string) => {
    if (!rejectTarget) return;
    try {
      setRejecting(true);
      await submissionService.rejectSubmission(rejectTarget.id, reason || undefined);
      toast.success("Submission rejected");
      setRejectTarget(null);
      await fetchSubmissions();
    } catch (error) {
      toast.error(errorMessage(error, "Failed to reject submission"));
    } finally {
      setRejecting(false);
    }
  };

  const tabs: Array<{ key: TabKey; label: string; count?: number }> = [
    ...STAGE_TABS.map((t) => ({ key: t.key as TabKey, label: t.label, count: byStage[t.key]?.length ?? 0 })),
    ...(canSeeFarmers ? [{ key: "farmers" as TabKey, label: "Farmers" }] : []),
  ];
  const emptyText = STAGE_TABS.find((t) => t.key === tab)?.empty ?? "Nothing here.";

  return (
    <div className="max-w-4xl mx-auto p-3 sm:p-6">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-base sm:text-lg font-medium text-gray-900 mb-1">Farmer journey</h2>
        <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
          Submitted → Approved → Verified (weighed) → Paid. Each card shows only its next step.
        </p>

        {/* Search Bar */}
        <div className="relative mb-4 sm:mb-6">
          <input
            type="text"
            placeholder="Search farmer, phone or product"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:max-w-sm pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Stage tabs */}
        <div className="flex items-center gap-3 sm:gap-6 border-b border-gray-200 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`pb-3 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                tab === t.key ? "text-gray-900 border-b-2 border-gray-900" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t.label}
              {t.count !== undefined && (
                <span
                  className={`rounded-full px-1.5 text-[11px] ${
                    t.count > 0 ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {tab === "farmers" && canSeeFarmers ? (
        <FarmerManagement />
      ) : (
        <>
          <div className="space-y-3 sm:space-y-4">
            {visible.map((s) => {
              const name = farmerDisplayName(s.farmer);
              const submitted = new Date(s.submittedAt);
              const expanded = expandedCards.has(s.id);
              const agreed = agreedPriceOf(s);
              const qty = Number(quantities[s.id]) || 0;
              const unitPrice = Number(prices[s.id]) || 0;
              return (
                <div key={s.id} className="bg-[#F0FDF4] rounded-lg p-3 sm:p-4 border border-gray-200 relative">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex items-start space-x-3 sm:space-x-4 flex-1">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold text-base sm:text-lg shrink-0">
                        {name.charAt(0).toUpperCase()}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="mb-2">
                          <div className="font-semibold text-gray-900 text-base sm:text-lg wrap-break-word">
                            {name}
                          </div>
                          {s.farmer?.phone && <div className="text-gray-600 text-sm">{s.farmer.phone}</div>}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-2 text-xs sm:text-sm text-gray-600">
                          <span>{submitted.toLocaleDateString()}</span>
                          <span>{submitted.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                        </div>

                        <div className="mb-2">
                          <div className="font-medium text-gray-700 text-sm wrap-break-word">
                            {s.productName}: {s.submittedQty} kg
                          </div>
                          <div className="text-gray-700 text-sm">
                            Farmer asks: <span className="font-medium">{rwf(askedPriceOf(s))} / unit</span>
                          </div>
                        </div>

                        <div className="mb-2">
                          <span className="text-xs sm:text-sm text-gray-600">Location:</span>
                          <div className="text-xs sm:text-sm text-gray-600 wrap-break-word">
                            {[s.village, s.cell, s.sector, s.district, s.province].filter(Boolean).join(", ")}
                          </div>
                        </div>

                        {/* What this stage needs to know */}
                        {s.status === "NEGOTIATING" && (
                          <div className="mt-2 rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-xs sm:text-sm text-amber-900">
                            Counter-offer of <strong>{rwf(s.counterOfferPrice)}</strong> sent. The farmer accepts,
                            declines or proposes a price.
                          </div>
                        )}
                        {s.status === "APPROVED" && (
                          <div className="mt-2 text-xs sm:text-sm text-gray-700">
                            Agreed price:{" "}
                            <span className="font-semibold text-green-700">{rwf(agreed)} / unit</span>
                          </div>
                        )}
                        {(s.status === "VERIFIED" || s.status === "PAID") && (
                          <div className="mt-2 text-sm text-gray-700">
                            Received <span className="font-bold text-green-700">{s.acceptedQty} kg</span> at{" "}
                            <span className="font-bold text-green-700">{rwf(s.acceptedPrice)}</span>
                            <div className="mt-0.5">
                              Total: <span className="font-bold text-gray-900">{rwf(s.totalAmount)}</span>
                              {s.status === "PAID" && <span className="ml-2 text-green-700">· Paid</span>}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-start sm:items-end gap-2 self-start">
                      <StageProgress status={s.status} />
                      <span className="text-xs sm:text-sm text-green-600 font-medium">{timeAgo(s.submittedAt)}</span>
                    </div>
                  </div>

                  {/* The one next step for this stage */}
                  <div className="mt-3 pt-3 border-t border-gray-200 flex flex-wrap items-center justify-end gap-2">
                    {s.status === "PENDING" && canApprove && (
                      <button
                        onClick={() => setApproveTarget(s)}
                        className="px-4 py-1.5 bg-green-600 text-white text-xs sm:text-sm rounded hover:bg-green-700 transition-colors"
                      >
                        Approve / set price
                      </button>
                    )}
                    {s.status === "APPROVED" && canVerify && !expanded && (
                      <button
                        onClick={() => toggleVerifyForm(s)}
                        className="px-4 py-1.5 bg-green-600 text-white text-xs sm:text-sm rounded hover:bg-green-700 transition-colors"
                      >
                        Verify (weigh)
                      </button>
                    )}
                    {s.status === "VERIFIED" && canPay && !(s.payouts || []).some((p) => ["PENDING", "PROCESSING"].includes(p.status)) && (
                      <button
                        onClick={() => setPayTarget(s)}
                        className="px-4 py-1.5 bg-green-600 text-white text-xs sm:text-sm rounded hover:bg-green-700 transition-colors"
                      >
                        Pay farmer
                      </button>
                    )}
                    {["PENDING", "NEGOTIATING", "APPROVED"].includes(s.status) && canReject && (
                      <button
                        onClick={() => setRejectTarget(s)}
                        className="px-3 py-1.5 border border-red-200 text-red-600 text-xs sm:text-sm rounded hover:bg-red-50 transition-colors"
                      >
                        Reject
                      </button>
                    )}
                  </div>

                  {/* Verify form (face to face): quantity received, agreed price */}
                  {s.status === "APPROVED" && expanded && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-3 sm:gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm text-gray-600">Quantity:</span>
                          <input
                            type="number"
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-xs sm:text-sm"
                            placeholder="kg"
                            value={quantities[s.id] || ""}
                            onChange={(e) => setQuantities((prev) => ({ ...prev, [s.id]: e.target.value }))}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm text-gray-600">Price:</span>
                          <input
                            type="number"
                            className="w-24 px-2 py-1 border border-gray-300 rounded text-xs sm:text-sm disabled:bg-gray-100"
                            placeholder="Rwf"
                            disabled={!canSetPrice}
                            title={canSetPrice ? undefined : "The agreed price is used"}
                            value={prices[s.id] || ""}
                            onChange={(e) => setPrices((prev) => ({ ...prev, [s.id]: e.target.value }))}
                          />
                          <span className="text-xs sm:text-sm text-gray-600">Rwf</span>
                        </div>
                        <div className="text-xs sm:text-sm text-gray-700">
                          Total: <span className="font-bold">{rwf(qty * unitPrice)}</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleVerify(s)}
                            disabled={busyId === s.id || qty <= 0 || qty > (s.submittedQty ?? Infinity)}
                            className="px-4 py-1.5 bg-green-600 text-white text-xs sm:text-sm rounded hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {busyId === s.id ? "Verifying..." : "Verify"}
                          </button>
                          <button
                            onClick={() => toggleVerifyForm(s)}
                            className="px-3 py-1.5 text-gray-600 text-xs sm:text-sm rounded hover:bg-gray-100"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                      {qty > (s.submittedQty ?? Infinity) && (
                        <p className="mt-2 text-center text-xs text-red-600">
                          Can&apos;t be more than the {s.submittedQty} kg submitted.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {visible.length === 0 && !loading && (
            <div className="text-center py-8">
              <p className="text-gray-500">{searchTerm ? "No submissions match your search." : emptyText}</p>
            </div>
          )}
        </>
      )}

      <ApproveSubmissionModal
        submission={approveTarget}
        onClose={() => setApproveTarget(null)}
        onDone={fetchSubmissions}
      />
      <PaySubmissionModal submission={payTarget} onClose={() => setPayTarget(null)} onDone={fetchSubmissions} />
      <ReasonConfirmDialog
        isOpen={!!rejectTarget}
        title="Reject submission"
        description={`Reject ${rejectTarget?.productName ?? "this submission"} from ${
          rejectTarget ? farmerDisplayName(rejectTarget.farmer) : "the farmer"
        }? The farmer gets an SMS with the reason.`}
        confirmLabel="Reject"
        isDestructive
        isProcessing={rejecting}
        onClose={() => setRejectTarget(null)}
        onConfirm={handleReject}
      />
    </div>
  );
}
