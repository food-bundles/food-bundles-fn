"use client";

import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { ArrowDownLeft, ArrowUpRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { mvendService, type MvendStatementEntry } from "@/app/services/mvendService";

const rwf = (n: number) => `${Math.round(n).toLocaleString()} RWF`;

const apiMessage = (e: unknown, fallback: string) =>
  (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? fallback;

const statusStyle = (s: string | null) =>
  s === "completed" || s === "success"
    ? "bg-green-100 text-green-800"
    : s === "failed"
      ? "bg-red-100 text-red-700"
      : "bg-blue-100 text-blue-800";

/**
 * The wallet's statement as MVend keeps it: money people paid into the wallet
 * and money sent from it, including what wasn't started from this dashboard.
 */
export default function MvendStatement({ reloadKey }: { reloadKey: number }) {
  const [rows, setRows] = useState<MvendStatementEntry[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await mvendService.statement({ page, limit: 20 });
      setRows(res.entries);
      setHasMore(res.hasMore);
    } catch (e) {
      setRows([]);
      setError(apiMessage(e, "Couldn't load MVend's statement"));
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    load();
  }, [load, reloadKey]);

  if (loading && !rows.length) {
    return (
      <div className="flex items-center justify-center gap-2 p-10 text-[#4A6358]">
        <Loader2 className="h-5 w-5 animate-spin" /> Loading…
      </div>
    );
  }
  if (error) return <p className="m-0 p-10 text-center text-sm text-red-600">{error}</p>;
  if (!rows.length) {
    return <p className="m-0 p-10 text-center text-sm text-[#4A6358]">Nothing at MVend yet: money paid into the wallet shows here.</p>;
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-[14px]">
          <thead className="bg-[#F6F9F7] text-[12px] uppercase tracking-wide text-[#4A6358]">
            <tr>
              <th className="px-4 py-3 font-semibold">What</th>
              <th className="px-4 py-3 font-semibold">Amount</th>
              <th className="px-4 py-3 font-semibold">To / from</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">When</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-[#EEF3EF] align-top">
                <td className="px-4 py-3">
                  <span className="flex items-center gap-2 font-medium text-[#0B2E1F]">
                    {r.direction === "IN" ? <ArrowDownLeft className="h-4 w-4 text-green-700" /> : <ArrowUpRight className="h-4 w-4 text-red-600" />}
                    {r.direction === "IN" ? "Received" : "Sent"}
                  </span>
                  {r.narration && <span className="block text-[12px] text-[#4A6358]">{r.narration}</span>}
                  <span className="block text-[12px] text-[#4A6358]">MVend #{r.id}</span>
                </td>
                <td className="px-4 py-3 font-semibold">
                  {r.direction === "IN" ? "+" : "−"}
                  {rwf(r.amount)}
                  {r.fee ? <span className="block text-[12px] font-normal text-[#4A6358]">fee {rwf(r.fee)}</span> : null}
                </td>
                <td className="px-4 py-3">
                  {r.counterpartyName && <span className="block">{r.counterpartyName}</span>}
                  <span className="text-[13px] text-[#4A6358]">{r.counterpartyMsisdn ?? (r.counterpartyName ? "" : "—")}</span>
                </td>
                <td className="px-4 py-3">
                  {r.status ? <span className={`rounded-full px-2 py-0.5 text-[12px] font-semibold ${statusStyle(r.status)}`}>{r.status}</span> : "—"}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-[13px] text-[#4A6358]">
                  {r.date ? format(new Date(r.date), "dd MMM yyyy, HH:mm") : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {(page > 1 || hasMore) && (
        <div className="flex items-center justify-between border-t border-[#EEF3EF] px-4 py-3 text-[13px] text-[#4A6358]">
          <span>Page {page}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1 || loading} onClick={() => setPage(page - 1)}>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled={!hasMore || loading} onClick={() => setPage(page + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
