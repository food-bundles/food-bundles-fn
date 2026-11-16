/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Check, Loader2, MapPin, Phone, Mail, Warehouse, X, QrCode } from "lucide-react";
import { toast } from "sonner";
import { useAdminAccess } from "@/app/hooks/useAdminAccess";
import {
  aggregatorApplicationService,
  type AggregatorApplication,
  type AggregatorApplicationStatus,
} from "@/app/services/aggregatorApplicationService";

const TABS: { key: AggregatorApplicationStatus; label: string }[] = [
  { key: "PENDING", label: "Waiting" },
  { key: "APPROVED", label: "Approved" },
  { key: "REJECTED", label: "Rejected" },
];

const day = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";

function ApplicationCard({
  a,
  canReview,
  onDone,
}: {
  a: AggregatorApplication;
  canReview: boolean;
  onDone: () => void;
}) {
  const [busy, setBusy] = useState<"approve" | "reject" | null>(null);
  const [rejecting, setRejecting] = useState(false);
  const [note, setNote] = useState("");
  const place = [a.village, a.cell, a.sector, a.district, a.province].filter(Boolean).join(", ");

  const approve = async () => {
    setBusy("approve");
    try {
      const res = await aggregatorApplicationService.approve(a.id);
      toast.success(res.message);
      onDone();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Could not approve");
    } finally {
      setBusy(null);
    }
  };
  const reject = async () => {
    setBusy("reject");
    try {
      const res = await aggregatorApplicationService.reject(a.id, note);
      toast.success(res.message);
      onDone();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Could not reject");
    } finally {
      setBusy(null);
    }
  };

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-[#DCE6DF] bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="m-0 text-[18px] font-bold text-[#0B2E1F]">{a.fullName}</h3>
          <p className="m-0 mt-0.5 text-[13px] text-[#4A6358]">
            Applied {day(a.createdAt)} · accepted agreement {a.agreementVersion}
            {a.reviewedAt ? ` · reviewed ${day(a.reviewedAt)}` : ""}
          </p>
        </div>
        {a.status === "APPROVED" && (
          <span className="rounded-full bg-[#E3F3E8] px-3 py-1 text-[12px] font-bold text-[#007A35]">
            {a.adminId ? "Account created" : "Invitation sent"}
          </span>
        )}
        {a.status === "REJECTED" && <span className="rounded-full bg-red-50 px-3 py-1 text-[12px] font-bold text-red-700">Rejected</span>}
      </div>

      <dl className="m-0 grid gap-x-6 gap-y-2.5 text-[14px] sm:grid-cols-2">
        <div className="flex items-start gap-2"><Phone className="mt-0.5 h-4 w-4 shrink-0 text-[#00A43A]" /><dd className="m-0">{a.phone}{a.momoNumber && a.momoNumber !== a.phone ? ` · MoMo ${a.momoNumber}` : ""}</dd></div>
        <div className="flex items-start gap-2"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#00A43A]" /><dd className="m-0 break-all">{a.email}</dd></div>
        <div className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#00A43A]" /><dd className="m-0">{place || "—"}</dd></div>
        {a.collectionPoint && <div className="flex items-start gap-2"><Warehouse className="mt-0.5 h-4 w-4 shrink-0 text-[#00A43A]" /><dd className="m-0">{a.collectionPoint}</dd></div>}
        <div><dt className="text-[12px] font-bold uppercase tracking-[0.6px] text-[#4A6358]">Main produce</dt><dd className="m-0">{a.mainProduce || "—"}</dd></div>
        <div><dt className="text-[12px] font-bold uppercase tracking-[0.6px] text-[#4A6358]">Farmers they can reach</dt><dd className="m-0">{a.farmersEstimate ?? "—"}</dd></div>
        {a.nationalId && <div><dt className="text-[12px] font-bold uppercase tracking-[0.6px] text-[#4A6358]">National ID</dt><dd className="m-0">{a.nationalId}</dd></div>}
        {a.experience && <div className="sm:col-span-2"><dt className="text-[12px] font-bold uppercase tracking-[0.6px] text-[#4A6358]">Experience</dt><dd className="m-0">{a.experience}</dd></div>}
        {a.reviewNote && <div className="sm:col-span-2"><dt className="text-[12px] font-bold uppercase tracking-[0.6px] text-[#4A6358]">Review note</dt><dd className="m-0">{a.reviewNote}</dd></div>}
      </dl>

      {a.status === "PENDING" && canReview && (
        <div className="flex flex-col gap-3 border-t border-[#EEF3EF] pt-4">
          {rejecting && (
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="Reason (optional, kept for your team)"
              className="w-full rounded-xl border border-[#DCE6DF] px-3 py-2 text-[14px] focus:border-[#00A43A] focus:outline-none"
            />
          )}
          <div className="flex flex-wrap gap-2">
            {!rejecting ? (
              <>
                <button
                  type="button"
                  onClick={approve}
                  disabled={!!busy}
                  className="inline-flex h-10 items-center gap-1.5 rounded-full bg-[#0B2E1F] px-4 text-[14px] font-bold text-white hover:bg-[#0F5C36] disabled:opacity-60 cursor-pointer"
                >
                  {busy === "approve" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Approve and invite
                </button>
                <button
                  type="button"
                  onClick={() => setRejecting(true)}
                  disabled={!!busy}
                  className="inline-flex h-10 items-center gap-1.5 rounded-full border border-[#DCE6DF] px-4 text-[14px] font-bold text-red-600 hover:bg-red-50 cursor-pointer"
                >
                  <X className="h-4 w-4" /> Reject
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={reject}
                  disabled={!!busy}
                  className="inline-flex h-10 items-center gap-1.5 rounded-full bg-red-600 px-4 text-[14px] font-bold text-white hover:bg-red-700 disabled:opacity-60 cursor-pointer"
                >
                  {busy === "reject" && <Loader2 className="h-4 w-4 animate-spin" />} Confirm rejection
                </button>
                <button type="button" onClick={() => setRejecting(false)} className="h-10 rounded-full px-4 text-[14px] font-bold text-[#4A6358] cursor-pointer">
                  Cancel
                </button>
              </>
            )}
          </div>
          <p className="m-0 text-[12px] text-[#4A6358]">
            Approving emails an invitation (Aggregator role). They create their account from it; their location is copied in.
          </p>
        </div>
      )}
    </article>
  );
}

// Shown on its own page and as the "Aggregator applications" tab of Invitations
export function AggregatorApplicationsPanel({ onChanged }: { onChanged?: () => void }) {
  const { can } = useAdminAccess();
  const canReview = can("aggregator_applications", "review");
  const [tab, setTab] = useState<AggregatorApplicationStatus>("PENDING");
  const [rows, setRows] = useState<AggregatorApplication[]>([]);
  const [counts, setCounts] = useState<Partial<Record<AggregatorApplicationStatus, number>>>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await aggregatorApplicationService.list(tab);
      setRows(res.data);
      setCounts(res.counts ?? {});
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Could not load applications");
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    load();
  }, [load]);

  const afterReview = () => {
    load();
    onChanged?.();
  };

  return (
    <div className="flex flex-col gap-5">
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#DCE6DF] bg-white p-5">
        <div>
          <h2 className="m-0 text-[20px] font-bold text-[#0B2E1F] [font-family:var(--font-inter-tight),sans-serif]">People who want to become aggregators</h2>
          <p className="m-0 mt-1 text-[14px] text-[#4A6358]">
            They scanned the aggregator QR code, accepted the preliminary agreement (Amasezerano y&apos;Ibanze) and applied.
          </p>
        </div>
        <Link
          href="/#aggregator"
          target="_blank"
          className="inline-flex h-10 items-center gap-2 rounded-full border border-[#DCE6DF] px-4 text-[14px] font-bold text-[#0B2E1F] hover:border-[#00A43A]"
        >
          <QrCode className="h-4 w-4" /> See the QR code
        </Link>
      </section>

      <div className="flex flex-wrap gap-1.5" role="tablist">
        {TABS.map((t) => {
          const on = t.key === tab;
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setTab(t.key)}
              className={`min-h-10 rounded-full px-4 text-[14px] font-bold transition-colors cursor-pointer ${
                on ? "bg-[#0B2E1F] text-white" : "border border-[#DCE6DF] bg-white text-[#0B2E1F] hover:border-[#00A43A]"
              }`}
            >
              {t.label} <span className={on ? "text-[#7CF2A6]" : "text-[#4A6358]"}>{counts[t.key] ?? 0}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center gap-2 text-[#4A6358]">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading…
        </div>
      ) : rows.length === 0 ? (
        <p className="m-0 rounded-2xl border border-dashed border-[#C5D1C6] bg-white p-10 text-center text-[15px] text-[#4A6358]">
          {tab === "PENDING" ? "No applications waiting. New ones appear here as soon as someone applies." : "Nothing here yet."}
        </p>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {rows.map((a) => (
            <ApplicationCard key={a.id} a={a} canReview={canReview} onDone={afterReview} />
          ))}
        </div>
      )}
    </div>
  );
}
