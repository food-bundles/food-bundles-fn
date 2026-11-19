"use client";

import { useCallback, useEffect, useState } from "react";
import { FileSignature, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { voucherService } from "@/app/services/voucherService";

interface WaitingSession {
  id: string;
  rrn: string;
  requestedAmount: number;
  approvedAmount?: number | null;
  repaymentDays?: number | null;
  status: string;
  loanProviderType?: string | null;
  termsSignedAt?: string | null;
  fundingTrader?: { username: string } | null;
}

const errorMessage = (err: unknown, fallback: string) =>
  (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? fallback;

/**
 * Loans a provider (a trader, or Food Bundles) took: the customer reads and
 * signs their terms here. Only then can the provider approve and disburse.
 */
export default function LoanTermsToSign({ onChanged }: { onChanged: () => void }) {
  const [sessions, setSessions] = useState<WaitingSession[]>([]);
  const [open, setOpen] = useState<WaitingSession | null>(null);
  const [terms, setTerms] = useState<{ providerName: string; terms: string } | null>(null);
  const [busy, setBusy] = useState<"load" | "sign" | "decline" | null>(null);

  const load = useCallback(() => {
    voucherService
      .getMyLoanSessions()
      .then((res) => {
        const list: WaitingSession[] = res?.data ?? [];
        setSessions(
          list.filter(
            (s) => s.status === "ACCEPTED" && !s.termsSignedAt && (s.fundingTrader || s.loanProviderType === "FOOD_BUNDLES"),
          ),
        );
      })
      .catch(() => setSessions([]));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openTerms = async (s: WaitingSession) => {
    setOpen(s);
    setTerms(null);
    setBusy("load");
    try {
      const res = await voucherService.getSessionTerms(s.id);
      setTerms({ providerName: res.data.providerName, terms: res.data.terms || "This provider has no written terms." });
    } catch (err) {
      toast.error(errorMessage(err, "Couldn't load the terms"));
      setOpen(null);
    } finally {
      setBusy(null);
    }
  };

  const act = async (kind: "sign" | "decline") => {
    if (!open) return;
    setBusy(kind);
    try {
      if (kind === "sign") {
        await voucherService.signSessionTerms(open.id);
        toast.success("Terms signed. Your provider can now approve and disburse the loan.");
      } else {
        await voucherService.declineSessionProvider(open.id);
        toast.success("Declined. Your loan is offered to other traders.");
      }
      setOpen(null);
      load();
      onChanged();
    } catch (err) {
      toast.error(errorMessage(err, "Something went wrong"));
    } finally {
      setBusy(null);
    }
  };

  if (!sessions.length) return null;

  return (
    <section className="rounded-xl border border-amber-200 bg-amber-50 p-4" aria-label="Terms to sign">
      <div className="flex items-start gap-3">
        <FileSignature className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900">Sign your loan provider&apos;s terms</p>
          <p className="text-xs text-gray-600">A provider took your loan. Sign their terms so they can approve it and put the credit on your card.</p>
          <ul className="mt-3 space-y-2">
            {sessions.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white px-3 py-2 text-sm">
                <span>
                  <span className="font-medium">{s.fundingTrader?.username ?? "Food Bundles"}</span>
                  <span className="text-gray-500">
                    {" "}
                    · {(s.approvedAmount ?? s.requestedAmount).toLocaleString()} RWF
                    {s.repaymentDays ? ` · repay in ${s.repaymentDays} days` : ""} · RRN {s.rrn}
                  </span>
                </span>
                <Button size="sm" className="h-8 bg-green-600 hover:bg-green-700" onClick={() => openTerms(s)}>
                  Read &amp; sign
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <Dialog open={!!open} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>Terms &amp; Conditions{terms ? ` — ${terms.providerName}` : ""}</DialogTitle>
            <DialogDescription>
              {open &&
                `${(open.approvedAmount ?? open.requestedAmount).toLocaleString()} RWF${open.repaymentDays ? `, repaid within ${open.repaymentDays} days` : ""}. Signing lets the provider approve and disburse your loan.`}
            </DialogDescription>
          </DialogHeader>
          {busy === "load" || !terms ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="max-h-60 overflow-y-auto whitespace-pre-wrap rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
                {terms.terms}
              </div>
              <div className="flex gap-2">
                <Button onClick={() => act("sign")} disabled={!!busy} className="flex-1 bg-green-600 hover:bg-green-700">
                  {busy === "sign" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  I accept &amp; sign
                </Button>
                <Button variant="outline" onClick={() => act("decline")} disabled={!!busy}>
                  {busy === "decline" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Decline
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
