/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useCallback, useEffect, useState } from "react";
import { ExternalLink, FileText, Loader2, MapPin, Upload } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { voucherService } from "@/app/services/voucherService";

export interface CardApplication {
  restaurantId: string;
  status: string;
  nationalId?: string | null;
  nidVerificationStatus?: string | null;
  nidVerificationNote?: string | null;
  province?: string | null;
  district?: string | null;
  sector?: string | null;
  cell?: string | null;
  village?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  momoPhone?: string | null;
  momoPhoneOwnerName?: string | null;
  momoStatementSentAt?: string | null;
  rdbCertificateUrl?: string | null;
  momoStatementUrl?: string | null;
  momoStatementUploadedAt?: string | null;
  momoDeductionsCount?: number | null;
}

/** Ready to issue: MTN statement uploaded, deductions counted, National ID not rejected */
export const applicationReady = (a: CardApplication | null) =>
  !!a && !!a.momoStatementUrl && a.momoDeductionsCount !== null && a.momoDeductionsCount !== undefined && a.nidVerificationStatus !== "FAILED";

const NID_STATUS: Record<string, { label: string; cls: string }> = {
  VERIFIED: { label: "Verified", cls: "bg-green-100 text-green-800" },
  FAILED: { label: "Not confirmed", cls: "bg-red-100 text-red-700" },
  NOT_VERIFIED: { label: "Not verified yet", cls: "bg-amber-100 text-amber-800" },
};

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex justify-between gap-3 py-1">
    <span className="text-gray-500 shrink-0">{label}</span>
    <span className="text-right text-gray-800 min-w-0 break-words">{children}</span>
  </div>
);

const errorMessage = (err: any, fallback: string) => err?.response?.data?.message ?? fallback;

/**
 * What the customer sent with their card application, and the admin's part:
 * the MTN statement received by email and its number of deductions.
 */
export default function CardApplicationReview({
  restaurantId,
  onChange,
}: {
  restaurantId: string;
  onChange: (application: CardApplication | null) => void;
}) {
  const [app, setApp] = useState<CardApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [statement, setStatement] = useState<File | null>(null);
  const [deductions, setDeductions] = useState("");
  const [saving, setSaving] = useState<"statement" | "nid" | null>(null);

  const update = useCallback(
    (next: CardApplication | null) => {
      setApp(next);
      onChange(next);
    },
    [onChange],
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    voucherService
      .getCardEnrollmentRequests()
      .then((res: any) => {
        if (cancelled) return;
        const found = (res?.data ?? []).find((r: CardApplication) => r.restaurantId === restaurantId) ?? null;
        update(found);
        setDeductions(found?.momoDeductionsCount != null ? String(found.momoDeductionsCount) : "");
      })
      .catch(() => !cancelled && update(null))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [restaurantId, update]);

  const saveStatement = async () => {
    const count = Number(deductions);
    if (!Number.isInteger(count) || count < 0) return toast.error("Enter the number of deductions (0 or more)");
    if (!statement && !app?.momoStatementUrl) return toast.error("Upload the MTN statement received by email");
    setSaving("statement");
    try {
      const res = await voucherService.recordMomoStatement(restaurantId, { deductionsCount: count, statement });
      update({ ...(app as CardApplication), ...res.data });
      setStatement(null);
      toast.success("MoMo statement saved");
    } catch (err) {
      toast.error(errorMessage(err, "Couldn't save the statement"));
    } finally {
      setSaving(null);
    }
  };

  const markNid = async (verified: boolean) => {
    setSaving("nid");
    try {
      const res = await voucherService.setNationalIdVerified(restaurantId, verified);
      update({ ...(app as CardApplication), ...res.data });
    } catch (err) {
      toast.error(errorMessage(err, "Couldn't update the National ID"));
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-500 py-2">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading the application…
      </div>
    );
  }
  if (!app) {
    return (
      <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2">
        This customer hasn&apos;t applied for a card. They apply from their Voucher page; you can issue it once their MoMo statement is reviewed.
      </p>
    );
  }

  const nid = NID_STATUS[app.nidVerificationStatus ?? "NOT_VERIFIED"] ?? NID_STATUS.NOT_VERIFIED;
  const place = [app.village, app.cell, app.sector, app.district, app.province].filter(Boolean).join(", ");

  return (
    <div className="space-y-3 text-sm">
      <div className="rounded-lg border border-gray-200 p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">Application</p>
        <Row label="National ID">
          <span className="font-mono">{app.nationalId ?? "—"}</span>{" "}
          <span className={`ml-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${nid.cls}`}>{nid.label}</span>
        </Row>
        {app.nationalId && app.nidVerificationStatus !== "VERIFIED" && (
          <div className="flex items-center justify-end gap-2 pb-1">
            <span className="text-[11px] text-gray-400">MVend check not connected: confirm by hand</span>
            <Button size="sm" variant="outline" className="h-7 text-xs" disabled={!!saving} onClick={() => markNid(true)}>
              ID is valid
            </Button>
            <Button size="sm" variant="outline" className="h-7 text-xs text-red-600" disabled={!!saving} onClick={() => markNid(false)}>
              Not valid
            </Button>
          </div>
        )}
        <Row label="Location">
          {place || "—"}
          {app.latitude != null && app.longitude != null && (
            <a
              href={`https://www.google.com/maps?q=${app.latitude},${app.longitude}`}
              target="_blank"
              rel="noreferrer"
              className="ml-2 inline-flex items-center gap-0.5 text-blue-600 hover:underline"
            >
              <MapPin className="w-3 h-3" /> Map
            </a>
          )}
        </Row>
        <Row label="MoMo number">{app.momoPhone ?? "—"}</Row>
        <Row label="Registered to">{app.momoPhoneOwnerName ?? "—"}</Row>
        <Row label="Statement sent">{app.momoStatementSentAt ? new Date(app.momoStatementSentAt).toLocaleDateString() : "Not confirmed"}</Row>
        <Row label="RDB certificate">
          {app.rdbCertificateUrl ? (
            <a href={app.rdbCertificateUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-blue-600 hover:underline">
              <FileText className="w-3.5 h-3.5" /> Open <ExternalLink className="w-3 h-3" />
            </a>
          ) : (
            "—"
          )}
        </Row>
      </div>

      <div className={`rounded-lg border p-3 ${applicationReady(app) ? "border-green-300 bg-green-50" : "border-amber-300 bg-amber-50"}`}>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-600 mb-1">MTN statement (received by email)</p>
        {app.momoStatementUrl && (
          <p className="text-xs mb-2">
            <a href={app.momoStatementUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-blue-600 hover:underline">
              <FileText className="w-3.5 h-3.5" /> Uploaded statement <ExternalLink className="w-3 h-3" />
            </a>
            {app.momoDeductionsCount != null && <span className="text-gray-600"> · {app.momoDeductionsCount} deductions</span>}
          </p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_140px] gap-2">
          <label className="flex items-center gap-2 rounded-lg border border-dashed border-gray-300 bg-white px-3 py-2 text-xs cursor-pointer hover:border-green-400">
            <Upload className="w-4 h-4 text-green-600 shrink-0" />
            <span className="truncate">{statement ? statement.name : app.momoStatementUrl ? "Replace the statement (PDF or photo)" : "Upload the statement (PDF or photo)"}</span>
            <input type="file" accept="application/pdf,image/*" className="sr-only" onChange={(e) => setStatement(e.target.files?.[0] ?? null)} />
          </label>
          <Input
            type="number"
            min="0"
            value={deductions}
            onChange={(e) => setDeductions(e.target.value)}
            placeholder="Deductions"
            aria-label="Number of deductions in the statement"
            className="h-9 text-sm bg-white"
          />
        </div>
        <Button size="sm" onClick={saveStatement} disabled={!!saving} className="mt-2 h-8 bg-green-600 hover:bg-green-700">
          {saving === "statement" && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
          Save statement
        </Button>
      </div>
    </div>
  );
}
