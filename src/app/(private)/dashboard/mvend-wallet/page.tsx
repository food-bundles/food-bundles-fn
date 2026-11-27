"use client";

import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { ArrowDownLeft, ArrowUpRight, Check, Circle, Loader2, RefreshCw, Wallet, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAdminAccess } from "@/app/hooks/useAdminAccess";
import { mvendService, type MvendOverview, type MvendTransaction } from "@/app/services/mvendService";
import RegisterMerchantModal from "./_components/RegisterMerchantModal";
import RegisterAgainDialog from "./_components/RegisterAgainDialog";
import SetPinDialog from "./_components/SetPinDialog";
import MvendStatement from "./_components/MvendStatement";

const rwf = (n: number) => `${Math.round(n).toLocaleString()} RWF`;

const apiMessage = (e: unknown, fallback: string) =>
  (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? fallback;

const TYPE_LABEL: Record<MvendTransaction["type"], string> = { TOPUP: "Top-up", PAYOUT: "Farmer payment", COLLECTION: "Order payment" };
const STATUS_STYLE: Record<MvendTransaction["status"], string> = {
  SUCCESS: "bg-green-100 text-green-800",
  PROCESSING: "bg-blue-100 text-blue-800",
  PENDING: "bg-amber-100 text-amber-800",
  FAILED: "bg-red-100 text-red-700",
};
// STATEMENT: MVend's own record, the only place money paid into the wallet shows
const STATEMENT = "STATEMENT";
const TABS = [
  ["", "All"],
  ["PAYOUT", "Farmer payments"],
  [STATEMENT, "MVend statement"],
] as const;

/**
 * Food Bundles' MVend merchant wallet: connection, balance, the farmer payments
 * made from it (with who did each one) and MVend's statement. MVend doesn't let
 * us top it up: it fills with what people pay into it.
 */
export default function MvendWalletPage() {
  const { can } = useAdminAccess();
  const [overview, setOverview] = useState<MvendOverview | null>(null);
  const [rows, setRows] = useState<MvendTransaction[]>([]);
  const [tab, setTab] = useState<string>("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [againOpen, setAgainOpen] = useState(false);
  const [pinOpen, setPinOpen] = useState(false);
  // Bumped by Refresh so the statement reloads too
  const [reloadKey, setReloadKey] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const onStatement = tab === STATEMENT;
      const [o, t] = await Promise.all([
        mvendService.overview(),
        onStatement ? null : mvendService.transactions({ page, limit: 20, type: tab || undefined }),
      ]);
      setOverview(o);
      if (t) {
        setRows(t.transactions);
        setPages(t.pagination.totalPages);
      }
    } catch (e) {
      toast.error(apiMessage(e, "Couldn't load the MVend wallet"));
    } finally {
      setLoading(false);
    }
  }, [page, tab]);

  useEffect(() => {
    load();
  }, [load]);

  const connected = !!overview?.status.connected;
  // Registered here, or set up on the server (MVEND_MEMBER_ID) for a member registered elsewhere
  const registered = !!overview?.merchant?.memberId || !!overview?.status.steps.find((s) => s.key === "registered")?.ok;
  const walletReady = !!overview?.status.steps.find((s) => s.key === "wallet")?.ok;
  const pinSet = !!overview?.status.steps.find((s) => s.key === "pin")?.ok;

  return (
    <div className="flex flex-col gap-5 p-4 sm:p-6">
      <section className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-[#DCE6DF] bg-white p-5 sm:p-7">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E3F3E8] text-[#007A35]">
            <Wallet className="h-5 w-5" />
          </span>
          <div>
            <h2 className="m-0 text-[22px] font-bold text-[#0B2E1F]">MVend wallet</h2>
            <p className="m-0 mt-1 text-[14px] text-[#4A6358]">
              Food Bundles&apos; merchant wallet: it receives what people pay into it, and pays farmers from it.
              {overview?.wallet.walletId && ` Wallet ${overview.wallet.walletId}`}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="text-[12px] font-semibold uppercase tracking-wide text-[#4A6358]">Available</span>
          <span className="text-[28px] font-bold leading-none text-[#007A35]">
            {overview?.balance ? rwf(overview.balance.available) : "—"}
          </span>
          {overview?.balanceError && <span className="max-w-[280px] text-right text-[12px] text-red-600">{overview.balanceError}</span>}
          <div className="mt-1 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                load();
                setReloadKey((k) => k + 1);
              }}
              disabled={loading}
            >
              <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
            </Button>
          </div>
        </div>
      </section>

      {overview && !connected && (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5" aria-label="Connection">
          <p className="m-0 text-sm font-semibold text-gray-900">Connecting to MVend</p>
          <p className="m-0 mt-1 text-[13px] text-gray-600">The wallet works once every step below is done.</p>
          {!registered && can("mvend_wallet", "settings") && (
            <Button size="sm" className="mt-3 bg-[#007A35] hover:bg-[#0F5C36]" onClick={() => setRegisterOpen(true)}>
              Register merchant wallet
            </Button>
          )}
          {registered && (
            <p className="m-0 mt-2 text-[13px] text-gray-700">
              Registered at MVend as member{" "}
              <b>{overview?.merchant?.memberId ?? overview?.status.steps.find((s) => s.key === "registered")?.detail?.replace(/^Member /, "")}</b>
              {overview?.merchant?.walletStatus ? ` · wallet ${overview.merchant.walletStatus.toLowerCase()}` : " · waiting for MVend to create the wallet"}
            </p>
          )}
          {/* Wallet created by MVend, PIN not set yet: the last step */}
          {walletReady && !pinSet && can("mvend_wallet", "settings") && (
            <Button size="sm" className="mr-2 mt-3 bg-[#007A35] hover:bg-[#0F5C36]" onClick={() => setPinOpen(true)}>
              Set wallet PIN
            </Button>
          )}
          {registered && can("mvend_wallet", "settings") && (
            <Button size="sm" variant="outline" className="mt-3" onClick={() => setAgainOpen(true)}>
              Register again
            </Button>
          )}
          <ul className="m-0 mt-3 list-none space-y-2 p-0">
            {overview.status.steps.map((s) => (
              <li key={s.key} className="flex items-start gap-2 text-[13px]">
                {s.ok ? (
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-700" aria-label="Done" />
                ) : ["registered", "wallet", "pin"].includes(s.key) ? (
                  <Circle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-label="To do" />
                ) : (
                  <X className="mt-0.5 h-4 w-4 shrink-0 text-red-600" aria-label="Missing" />
                )}
                <span>
                  <span className="font-medium text-gray-900">{s.label}</span>
                  {s.detail && <span className="block text-gray-600">{s.detail}</span>}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="overflow-hidden rounded-2xl border border-[#DCE6DF] bg-white">
        <div className="flex flex-wrap gap-1.5 border-b border-[#EEF3EF] p-3" role="tablist">
          {TABS.map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              onClick={() => {
                setTab(key);
                setPage(1);
              }}
              className={`cursor-pointer rounded-full border px-3.5 py-1.5 text-[13px] font-semibold ${
                tab === key ? "border-[#007A35] bg-[#007A35] text-white" : "border-[#DCE6DF] text-[#0B2E1F] hover:border-[#00A43A]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {tab === STATEMENT ? (
          <MvendStatement reloadKey={reloadKey} />
        ) : loading && !rows.length ? (
          <div className="flex items-center justify-center gap-2 p-10 text-[#4A6358]">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading…
          </div>
        ) : !rows.length ? (
          <p className="m-0 p-10 text-center text-sm text-[#4A6358]">No wallet operations yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-[14px]">
              <thead className="bg-[#F6F9F7] text-[12px] uppercase tracking-wide text-[#4A6358]">
                <tr>
                  <th className="px-4 py-3 font-semibold">What</th>
                  <th className="px-4 py-3 font-semibold">Amount</th>
                  <th className="px-4 py-3 font-semibold">To / from</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">By</th>
                  <th className="px-4 py-3 font-semibold">When</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t border-[#EEF3EF] align-top">
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2 font-medium text-[#0B2E1F]">
                        {r.type === "PAYOUT" ? <ArrowUpRight className="h-4 w-4 text-red-600" /> : <ArrowDownLeft className="h-4 w-4 text-green-700" />}
                        {TYPE_LABEL[r.type]}
                      </span>
                      {r.narration && <span className="block text-[12px] text-[#4A6358]">{r.narration}</span>}
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      {r.type === "PAYOUT" ? "−" : "+"}
                      {rwf(r.amount)}
                      {r.fee ? <span className="block text-[12px] font-normal text-[#4A6358]">fee {rwf(r.fee)}</span> : null}
                    </td>
                    <td className="px-4 py-3">
                      {r.counterpartyName && <span className="block">{r.counterpartyName}</span>}
                      <span className="text-[13px] text-[#4A6358]">{r.counterpartyMsisdn ?? "—"}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[12px] font-semibold ${STATUS_STYLE[r.status]}`}>{r.status.toLowerCase()}</span>
                    </td>
                    <td className="px-4 py-3 text-[13px]">{r.initiatedByName ?? "—"}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-[13px] text-[#4A6358]">{format(new Date(r.createdAt), "dd MMM yyyy, HH:mm")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {tab !== STATEMENT && pages > 1 && (
          <div className="flex items-center justify-between border-t border-[#EEF3EF] px-4 py-3 text-[13px] text-[#4A6358]">
            <span>
              Page {page} of {pages}
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => setPage(page + 1)}>
                Next
              </Button>
            </div>
          </div>
        )}
      </section>

      <RegisterMerchantModal open={registerOpen} onClose={() => setRegisterOpen(false)} onDone={load} />
      <SetPinDialog open={pinOpen} onClose={() => setPinOpen(false)} onDone={load} />
      <RegisterAgainDialog
        open={againOpen}
        memberId={overview?.merchant?.memberId ?? overview?.status.steps.find((s) => s.key === "registered")?.detail?.replace(/^Member /, "") ?? ""}
        onClose={() => setAgainOpen(false)}
        onCleared={(canRegister) => {
          void load();
          if (canRegister) setRegisterOpen(true);
        }}
      />
    </div>
  );
}
