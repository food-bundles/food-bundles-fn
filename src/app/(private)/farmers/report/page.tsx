"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Banknote, Clock, Download, Printer, Search, Smartphone, Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { farmerDashboardService, type FarmerReport } from "@/app/services/farmerDashboardService";

const rwf = (n: number) => `RWF ${Math.round(n).toLocaleString("en-RW")}`;

type Period = "month" | "season" | "year" | "all";

/** Which harvests the statement lists */
type Show = "all" | "paid" | "coming" | "review";

/** Same period starts as the mobile app's Report: seasons are Sep–Jan (A), Feb–Jun (B), Jul–Aug (C) */
function periodStart(period: Period, now = new Date()): Date | undefined {
  if (period === "all") return undefined;
  const y = now.getFullYear();
  const m = now.getMonth();
  if (period === "month") return new Date(y, m, 1);
  if (period === "year") return new Date(y, 0, 1);
  if (m >= 8) return new Date(y, 8, 1);
  if (m === 0) return new Date(y - 1, 8, 1);
  if (m <= 5) return new Date(y, 1, 1);
  return new Date(y, 6, 1);
}

const PERIODS: { key: Period; label: string }[] = [
  { key: "month", label: "This month" },
  { key: "season", label: "This season" },
  { key: "year", label: "This year" },
  { key: "all", label: "All time" },
];

/** Paid; agreed and waiting for payment; or still being checked (price not agreed yet) */
const SHOWS: { key: Show; label: string; match: (status: string) => boolean }[] = [
  { key: "all", label: "All", match: (st) => st !== "" },
  { key: "paid", label: "Paid", match: (st) => st === "PAID" },
  { key: "coming", label: "Money coming", match: (st) => st === "APPROVED" || st === "VERIFIED" },
  { key: "review", label: "Being reviewed", match: (st) => st === "PENDING" },
];

const STATUS_STYLE: Record<string, string> = {
  PAID: "bg-green-100 text-green-800",
  APPROVED: "bg-blue-100 text-blue-800",
  VERIFIED: "bg-blue-100 text-blue-800",
  PENDING: "bg-amber-100 text-amber-800",
  REJECTED: "bg-red-100 text-red-800",
};

/** Plain words for each status, as farmers read them */
const STATUS_LABEL: Record<string, string> = {
  PAID: "Paid",
  APPROVED: "Money coming",
  VERIFIED: "Money coming",
  PENDING: "Being reviewed",
  REJECTED: "Not bought",
};

const methodLabel = (r: FarmerReport["records"][number]) =>
  r.status !== "PAID" ? "—" : r.paymentMethod === "CASH" ? "Cash" : "MoMo";

/** Money received and coming: the web version of the mobile app's Report screen, with a statement to download or print */
export default function FarmerReportPage() {
  const [period, setPeriod] = useState<Period>("month");
  const [report, setReport] = useState<FarmerReport | null>(null);
  const [error, setError] = useState(false);
  const [show, setShow] = useState<Show>("all");
  const [search, setSearch] = useState("");

  const from = useMemo(() => periodStart(period), [period]);

  const load = useCallback(() => {
    setError(false);
    setReport(null);
    farmerDashboardService
      .getReport(from)
      .then(setReport)
      .catch(() => setError(true));
  }, [from]);

  useEffect(load, [load]);

  const records = useMemo(() => {
    const needle = search.trim().toLowerCase();
    const match = SHOWS.find((x) => x.key === show)!.match;
    return (report?.records ?? []).filter(
      (r) => match(r.status) && (!needle || r.productName.toLowerCase().includes(needle))
    );
  }, [report, show, search]);

  const countOf = (key: Show) => (report?.records ?? []).filter((r) => SHOWS.find((x) => x.key === key)!.match(r.status)).length;
  const periodLabel = PERIODS.find((p) => p.key === period)!.label;

  const downloadCsv = () => {
    if (!report) return;
    const rows = [
      ["Date", "Crop", "Quantity (kg)", "Status", "Amount (RWF)", "Paid by", "Paid to", "Aggregation site"],
      ...records.map((r) => [
        new Date(r.date).toLocaleDateString(),
        r.productName,
        String(r.quantity),
        STATUS_LABEL[r.status] ?? r.status,
        String(Math.round(r.amount)),
        methodLabel(r),
        r.paidTo ? `••${r.paidTo.slice(-3)}` : "",
        r.aggregationSite ?? "",
      ]),
    ];
    const csv = rows.map((row) => row.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `food-bundles-statement-${from ? from.toISOString().slice(0, 10) : "all-time"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const stats = report
    ? [
        { label: "Received on MoMo", value: report.wallet.momoReceived, note: `${report.wallet.momoPayments} payment${report.wallet.momoPayments === 1 ? "" : "s"}, all time`, icon: Wallet, tone: "text-green-700 bg-green-50" },
        { label: "Money coming", value: report.pending.amount, note: `${report.pending.count} harvest${report.pending.count === 1 ? "" : "s"} not paid yet`, icon: Clock, tone: "text-amber-700 bg-amber-50" },
        { label: "Paid by MoMo", value: report.period.paidMomo, note: periodLabel, icon: Smartphone, tone: "text-blue-700 bg-blue-50" },
        { label: "Paid in cash", value: report.period.paidCash, note: periodLabel, icon: Banknote, tone: "text-gray-700 bg-gray-100" },
      ]
    : [];

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white">
      <main className="container mx-auto space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Sales report</h1>
            <p className="mt-0.5 text-sm text-gray-500">
              Money you received, money coming, and how each harvest was paid.{" "}
              {from
                ? `Since ${from.toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })}.`
                : "All time."}
            </p>
          </div>
          <div className="flex gap-2 print:hidden">
            <Button variant="outline" onClick={downloadCsv} disabled={records.length === 0}>
              <Download className="mr-2 h-4 w-4" /> Download statement
            </Button>
            <Button variant="outline" onClick={() => window.print()} disabled={!report}>
              <Printer className="mr-2 h-4 w-4" /> Print
            </Button>
          </div>
        </div>

        <div className="flex w-full gap-1 rounded-xl bg-white p-1 shadow-sm sm:w-fit print:hidden" role="tablist">
          {PERIODS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={period === key}
              onClick={() => setPeriod(key)}
              className={cn(
                "flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors sm:flex-none",
                period === key ? "bg-green-600 text-white" : "text-gray-600 hover:bg-gray-50"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Could not load your report.{" "}
            <button className="font-medium underline" onClick={load}>
              Try again
            </button>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {!report && !error
            ? Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
            : stats.map(({ label, value, note, icon: Icon, tone }) => (
                <Card key={label}>
                  <CardContent className="flex items-start gap-3 p-5">
                    <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full", tone)}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm text-gray-500">{label}</p>
                      <p className="text-xl font-bold text-gray-900">{rwf(value)}</p>
                      <p className="text-xs text-gray-500">{note}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="flex flex-col gap-3 border-b px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
              <h2 className="font-semibold text-gray-900">Statement</h2>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center print:hidden">
                <div className="flex flex-wrap gap-1" role="tablist" aria-label="Which harvests">
                  {SHOWS.map(({ key, label }) => (
                    <button
                      key={key}
                      type="button"
                      role="tab"
                      aria-selected={show === key}
                      onClick={() => setShow(key)}
                      className={cn(
                        "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                        show === key
                          ? "border-green-600 bg-green-600 text-white"
                          : "border-gray-200 text-gray-600 hover:bg-gray-50"
                      )}
                    >
                      {label}
                      {report && <span className="ml-1 opacity-75">{countOf(key)}</span>}
                    </button>
                  ))}
                </div>
                <div className="relative sm:w-52">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search crops"
                    className="h-9 pl-9"
                  />
                </div>
              </div>
            </div>
            {!report ? (
              <div className="space-y-2 p-4">
                {!error && Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-10 rounded-lg" />)}
              </div>
            ) : records.length === 0 ? (
              <p className="py-12 text-center text-sm text-gray-500">
                {report.records.length === 0 ? "No harvest in this period yet." : "No harvest matches."}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="px-4 py-2 font-medium sm:px-6">Date</th>
                      <th className="px-4 py-2 font-medium">Crop</th>
                      <th className="px-4 py-2 text-right font-medium">Quantity</th>
                      <th className="px-4 py-2 font-medium">Status</th>
                      <th className="px-4 py-2 text-right font-medium">Amount</th>
                      <th className="px-4 py-2 font-medium sm:px-6">Paid by</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {records.map((r) => (
                      <tr key={r.id}>
                        <td className="whitespace-nowrap px-4 py-3 text-gray-600 sm:px-6">
                          {new Date(r.date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{r.productName}</p>
                          {r.aggregationSite && <p className="text-xs text-gray-500">{r.aggregationSite}</p>}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right text-gray-700">
                          {r.quantity.toLocaleString()} kg
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={cn("border-0 text-[10px]", STATUS_STYLE[r.status] ?? "bg-gray-100 text-gray-700")}>
                            {STATUS_LABEL[r.status] ?? r.status}
                          </Badge>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-gray-900">
                          {r.status === "REJECTED" ? "—" : rwf(r.amount)}
                          {r.status === "PENDING" && (
                            <span className="block text-[10px] font-normal text-gray-500">at your price, not agreed yet</span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-gray-700 sm:px-6">
                          {methodLabel(r)}
                          {r.status === "PAID" && r.paidTo && (
                            <span className="ml-1 text-xs text-gray-500">••{r.paidTo.slice(-3)}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
