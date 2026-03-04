"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { marketPricingService } from "@/app/services/marketPricingService";

// ─── TypeScript Interfaces ─────────────────────────────────────────────────

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface Market {
  id: string;
  name: string;
  location?: string | null;
  province?: string | null;
  district?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PriceRecord {
  id: string;
  product: { id: string; name: string };
  market: {
    id: string;
    name: string;
    province?: string | null;
    district?: string | null;
  };
  ourPrice: number;
  marketPrice: number;
  difference: number;
  recordedDate: string;
}

interface ProductGroup {
  productId: string;
  productName: string;
  ourPrice: number;
  records: PriceRecord[];
}

interface PriceAnalysis {
  product: { id: string; name: string; currentPrice: number };
  analysis: {
    totalRecords: number;
    avgOurPrice: number;
    avgMarketPrice: number;
    minMarketPrice: number;
    maxMarketPrice: number;
    profitLoss: "PROFIT" | "LOSS" | "BREAK_EVEN";
    percentageDifference: number;
    message?: string;
  };
  marketBreakdown?: Array<{
    market: { id: string; name: string; district?: string };
    recordCount: number;
    avgMarketPrice: number;
    profitLoss: "PROFIT" | "LOSS" | "BREAK_EVEN";
  }>;
}

// ─── Utilities ─────────────────────────────────────────────────────────────

const fmt = (n: number) => `${Math.round(n).toLocaleString()} RWF`;
const fmtDate = (d: string) =>
  new Intl.DateTimeFormat("en-RW", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(d));

const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
};

const groupByProduct = (records: PriceRecord[]): ProductGroup[] => {
  const map = new Map<string, ProductGroup>();
  for (const r of records) {
    if (!map.has(r.product.id))
      map.set(r.product.id, {
        productId: r.product.id,
        productName: r.product.name,
        ourPrice: r.ourPrice,
        records: [],
      });
    map.get(r.product.id)!.records.push(r);
  }
  return Array.from(map.values());
};

const splitByAge = (records: PriceRecord[]) => {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  return {
    active: records.filter((r) => new Date(r.recordedDate) >= cutoff),
    recent: records.filter((r) => new Date(r.recordedDate) < cutoff),
  };
};

// ─── Atoms ─────────────────────────────────────────────────────────────────

const Skel = ({ cls }: { cls: string }) => (
  <div className={`bg-stone-200 animate-pulse rounded-lg ${cls}`} />
);

const PricePill = ({ diff, pct }: { diff: number; pct: number }) => {
  if (Math.abs(pct) < 1)
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-stone-100 text-stone-500 border border-stone-200">
        ≈ Equal
      </span>
    );
  const cheaper = diff < 0;
  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${cheaper ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-amber-50 text-amber-800 border-amber-200"}`}
    >
      {cheaper ? "▼" : "▲"} {Math.abs(pct)}%
    </span>
  );
};

const PnLBadge = ({ status }: { status: "PROFIT" | "LOSS" | "BREAK_EVEN" }) => {
  const cfg = {
    PROFIT: {
      l: "Profit",
      c: "bg-emerald-100 text-emerald-800 border-emerald-200",
    },
    LOSS: { l: "Loss", c: "bg-red-50 text-red-700 border-red-200" },
    BREAK_EVEN: {
      l: "Break Even",
      c: "bg-stone-100 text-stone-600 border-stone-200",
    },
  }[status];
  return (
    <span
      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.c}`}
    >
      {cfg.l}
    </span>
  );
};

const EmptyState = ({ title, message }: { title: string; message: string }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex flex-col items-center justify-center py-14 text-center"
  >
    <div className="w-12 h-12 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center mb-3">
      <svg
        className="w-6 h-6 text-stone-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    </div>
    <p className="text-sm font-bold text-stone-600 mb-1">{title}</p>
    <p className="text-xs text-stone-400 max-w-xs leading-relaxed">{message}</p>
  </motion.div>
);

const ErrorBanner = ({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) => (
  <motion.div
    initial={{ opacity: 0, y: -8 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex items-center justify-between bg-red-50 border border-red-200 rounded-2xl px-5 py-3.5 mb-6"
  >
    <p className="text-sm text-red-700 font-medium">{message}</p>
    <button
      onClick={onRetry}
      className="text-xs font-bold text-red-700 underline"
    >
      Retry
    </button>
  </motion.div>
);

// ─── Analysis Panel ─────────────────────────────────────────────────────────

const AnalysisPanel = ({
  productId,
  productName,
  onClose,
}: {
  productId: string;
  productName: string;
  onClose: () => void;
}) => {
  const [data, setData] = useState<PriceAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await marketPricingService.analyzePrice({
        productId,
        startDate: daysAgo(30),
        endDate: new Date().toISOString(),
      });
      if (res.success) setData(res.data);
      else setError(res.message ?? "Analysis failed.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error.");
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      className="bg-white border border-stone-200 rounded-2xl shadow-lg overflow-hidden"
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 bg-gradient-to-r from-amber-50 to-stone-50">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-700 mb-0.5">
            Price Analysis
          </p>
          <h3 className="text-sm font-bold text-stone-800 truncate max-w-[220px]">
            {productName}
          </h3>
          <p className="text-[11px] text-stone-400 mt-0.5">Last 30 days</p>
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          className="w-8 h-8 rounded-xl border border-stone-200 flex items-center justify-center text-stone-400 hover:bg-stone-100 transition-all"
        >
          ✕
        </button>
      </div>
      <div className="px-5 py-4">
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skel key={i} cls="h-12 w-full" />
            ))}
          </div>
        )}
        {!loading && error && <ErrorBanner message={error} onRetry={load} />}
        {!loading &&
          !error &&
          data &&
          (data.analysis.totalRecords === 0 ? (
            <EmptyState
              title="No data"
              message="No price records for this period."
            />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {[
                  {
                    label: "Our Avg",
                    val: fmt(data.analysis.avgOurPrice),
                    c: "text-blue-700",
                    bg: "bg-blue-50 border-blue-100",
                  },
                  {
                    label: "Avg Market",
                    val: fmt(data.analysis.avgMarketPrice),
                    c: "text-stone-700",
                    bg: "bg-stone-50 border-stone-100",
                  },
                  {
                    label: "Min Market",
                    val: fmt(data.analysis.minMarketPrice),
                    c: "text-emerald-700",
                    bg: "bg-emerald-50 border-emerald-100",
                  },
                  {
                    label: "Max Market",
                    val: fmt(data.analysis.maxMarketPrice),
                    c: "text-red-600",
                    bg: "bg-red-50 border-red-100",
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className={`rounded-xl px-3 py-2.5 border ${s.bg}`}
                  >
                    <p className="text-[10px] text-stone-500 mb-0.5">
                      {s.label}
                    </p>
                    <p className={`text-sm font-bold ${s.c}`}>{s.val}</p>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 mb-4">
                <div>
                  <p className="text-[10px] text-stone-500 mb-1">
                    Overall Status
                  </p>
                  <div className="flex items-center gap-2">
                    <PnLBadge status={data.analysis.profitLoss} />
                    <span className="text-xs text-stone-500">
                      {Math.abs(data.analysis.percentageDifference)}% diff
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-stone-500 mb-0.5">Records</p>
                  <p className="text-xl font-black text-stone-800">
                    {data.analysis.totalRecords}
                  </p>
                </div>
              </div>
              {data.marketBreakdown && data.marketBreakdown.length > 0 && (
                <>
                  <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2">
                    Per Market
                  </p>
                  <div className="space-y-1.5">
                    {data.marketBreakdown.map((mb) => (
                      <div
                        key={mb.market.id}
                        className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-stone-50 border border-stone-100"
                      >
                        <div>
                          <p className="text-xs font-semibold text-stone-700 truncate">
                            {mb.market.name}
                          </p>
                          <p className="text-[10px] text-stone-400">
                            {mb.market.district} · {mb.recordCount} records
                          </p>
                        </div>
                        <div className="text-right ml-3 space-y-0.5">
                          <p className="text-xs font-bold">
                            {fmt(mb.avgMarketPrice)}
                          </p>
                          <PnLBadge status={mb.profitLoss} />
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          ))}
      </div>
    </motion.div>
  );
};

// ─── Product Card ───────────────────────────────────────────────────────────

const ProductPriceCard = ({
  group,
  onAnalyze,
  isAnalyzing,
}: {
  group: ProductGroup;
  onAnalyze: (id: string, name: string) => void;
  isAnalyzing: boolean;
}) => {
  const [tab, setTab] = useState<"active" | "recent">("active");
  const [expanded, setExpanded] = useState(true);
  const { active, recent } = useMemo(
    () => splitByAge(group.records),
    [group.records],
  );
  const shown = tab === "active" ? active : recent;
  const avg = group.records.length
    ? group.records.reduce((s, r) => s + r.marketPrice, 0) /
      group.records.length
    : 0;
  const diff = group.ourPrice - avg;
  const pct = avg > 0 ? Math.round((diff / avg) * 100) : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden"
    >
      <div
        className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-stone-50 transition-colors"
        onClick={() => setExpanded((e) => !e)}
        role="button"
        aria-expanded={expanded}
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
            {group.productName.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-stone-800 truncate">
              {group.productName}
            </h3>
            <p className="text-[11px] text-stone-400">
              Our price:{" "}
              <span className="font-semibold text-stone-600">
                {fmt(group.ourPrice)}
              </span>{" "}
              · {group.records.length} records
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {group.records.length > 0 && <PricePill diff={diff} pct={pct} />}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAnalyze(group.productId, group.productName);
            }}
            disabled={group.records.length === 0}
            className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all disabled:opacity-30 ${isAnalyzing ? "border-amber-500 bg-amber-100 text-amber-900" : "border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100"}`}
          >
            {isAnalyzing ? "Open ▸" : "Analyze"}
          </button>
          <motion.div
            animate={{ rotate: expanded ? 0 : -90 }}
            className="text-stone-400"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </motion.div>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="b"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 pt-3 pb-2 border-t border-stone-50">
              <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">
                Market Prices
              </p>
              <div className="flex gap-0.5 bg-stone-100 rounded-xl p-0.5">
                {(["active", "recent"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={(e) => {
                      e.stopPropagation();
                      setTab(t);
                    }}
                    aria-pressed={tab === t}
                    className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${tab === t ? "bg-white shadow-sm text-stone-800" : "text-stone-500"}`}
                  >
                    <span className="capitalize">{t}</span>
                    <span
                      className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full ${tab === t ? "bg-amber-100 text-amber-700" : "bg-stone-200 text-stone-500"}`}
                    >
                      {t === "active" ? active.length : recent.length}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <div className="px-3 pb-3">
              {shown.length === 0 ? (
                <EmptyState
                  title="No records"
                  message={
                    tab === "active"
                      ? "No prices in the last 30 days. Check Recent for older data."
                      : "No historical data."
                  }
                />
              ) : (
                <div className="space-y-0.5">
                  {shown.map((r) => (
                    <motion.div
                      key={r.id}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-stone-50 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-stone-700 truncate">
                            {r.market.name}
                          </p>
                          <p className="text-[10px] text-stone-400">
                            {[r.market.district, r.market.province]
                              .filter(Boolean)
                              .join(" · ")}{" "}
                            · {fmtDate(r.recordedDate)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-right hidden sm:block">
                          <p className="text-[10px] text-stone-400">Ours</p>
                          <p className="text-xs font-bold text-stone-600">
                            {fmt(r.ourPrice)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-stone-400">Market</p>
                          <p className="text-xs font-bold text-stone-900">
                            {fmt(r.marketPrice)}
                          </p>
                        </div>
                        <PricePill
                          diff={r.difference}
                          pct={
                            r.marketPrice > 0
                              ? Math.round((r.difference / r.marketPrice) * 100)
                              : 0
                          }
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function MarketPricingManagement() {
  const [groups, setGroups] = useState<ProductGroup[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analyzeTarget, setAnalyzeTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [search, setSearch] = useState("");
  const [dataFilter, setDataFilter] = useState<"ALL" | "WITH_DATA" | "NO_DATA">(
    "ALL",
  );
  const [dateRange, setDateRange] = useState<"30d" | "60d" | "90d" | "all">(
    "30d",
  );

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const days =
        dateRange === "30d"
          ? 30
          : dateRange === "60d"
            ? 60
            : dateRange === "90d"
              ? 90
              : null;
      const params = days
        ? {
            startDate: daysAgo(days),
            endDate: new Date().toISOString(),
            limit: 200,
          }
        : { limit: 200 };
      const [pr, mr] = await Promise.all([
        marketPricingService.getPricesByProduct(params),
        marketPricingService.getAllMarkets({ limit: 100 }),
      ]);

      console.log("Received pr:--", pr);
      console.log("Received mr:--", mr);

      if (pr.success) setGroups(groupByProduct(pr.data));
      else setError(pr.message ?? "Failed to load market prices.");
      if (mr.success) setMarkets(mr.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error.");
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(
    () =>
      groups.filter((g) => {
        const ms = g.productName.toLowerCase().includes(search.toLowerCase());
        const md =
          dataFilter === "ALL" ||
          (dataFilter === "WITH_DATA"
            ? g.records.length > 0
            : g.records.length === 0);
        return ms && md;
      }),
    [groups, search, dataFilter],
  );

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  const activeRecs = groups
    .flatMap((g) => g.records)
    .filter((r) => new Date(r.recordedDate) >= cutoff).length;

  return (
    <div
      className="min-h-screen"
      style={{ background: "linear-gradient(135deg,#fafaf8 0%,#f5f0e8 100%)" }}
    >
      <div className="h-1 w-full bg-gradient-to-r from-amber-400 via-orange-400 to-amber-600" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 text-xs text-stone-400 mb-7"
        >
          {[
            { l: "Dashboard", h: "/dashboard" },
            { l: "Products", h: "/dashboard/stock/products" },
            { l: "Market Pricing" },
          ].map((item, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-stone-300">›</span>}
              {item.h ? (
                <a
                  href={item.h}
                  className="hover:text-amber-700 transition-colors font-medium"
                >
                  {item.l}
                </a>
              ) : (
                <span className="text-stone-700 font-semibold">{item.l}</span>
              )}
            </span>
          ))}
        </nav>

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-sm">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-black text-stone-900">
                Market Pricing
              </h1>
            </div>
            <p className="text-sm text-stone-500 ml-10">
              Compare product prices across all registered markets
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!loading && (
              <div className="flex items-center gap-1.5 text-xs text-stone-400 bg-white border border-stone-200 px-3 py-1.5 rounded-xl">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live · {groups.length} products
              </div>
            )}
            <button
              onClick={load}
              disabled={loading}
              aria-label="Refresh"
              className="w-8 h-8 rounded-xl border border-stone-200 bg-white flex items-center justify-center text-stone-500 hover:bg-stone-50 disabled:opacity-40"
            >
              <svg
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>
        </div>

        <AnimatePresence>
          {error && <ErrorBanner message={error} onRetry={load} />}
        </AnimatePresence>

        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {[
            {
              label: "Products Tracked",
              value: groups.length,
              icon: "📦",
              grad: "from-blue-400 to-blue-600",
            },
            {
              label: "With Price Data",
              value: groups.filter((g) => g.records.length > 0).length,
              icon: "📊",
              grad: "from-amber-400 to-orange-500",
            },
            {
              label: "Active Markets",
              value: markets.filter((m) => m.isActive).length,
              icon: "🏪",
              grad: "from-emerald-400 to-teal-600",
            },
            {
              label: "Active Records (30d)",
              value: activeRecs,
              icon: "🔄",
              grad: "from-violet-400 to-purple-600",
            },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="bg-white rounded-2xl border border-stone-200 shadow-sm px-4 py-4 flex items-center gap-3"
            >
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.grad} flex items-center justify-center text-lg flex-shrink-0`}
              >
                {s.icon}
              </div>
              {loading ? (
                <div className="space-y-1.5 flex-1">
                  <Skel cls="h-5 w-10" />
                  <Skel cls="h-3 w-20" />
                </div>
              ) : (
                <div>
                  <p className="text-xl font-black text-stone-800">{s.value}</p>
                  <p className="text-[11px] text-stone-400">{s.label}</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <div
          className={`grid gap-5 ${analyzeTarget ? "lg:grid-cols-[1fr_360px]" : "grid-cols-1"}`}
        >
          <div>
            {/* Filter bar */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm px-4 py-3.5 mb-5 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <div className="relative flex-1">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products…"
                  aria-label="Search products"
                  className="w-full pl-8 pr-4 py-2 rounded-xl border border-stone-200 text-xs bg-stone-50 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
              <div className="flex gap-0.5 bg-stone-100 rounded-xl p-0.5">
                {(["30d", "60d", "90d", "all"] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setDateRange(v)}
                    aria-pressed={dateRange === v}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${dateRange === v ? "bg-white shadow-sm text-stone-800" : "text-stone-500"}`}
                  >
                    {v === "all" ? "All" : v}
                  </button>
                ))}
              </div>
              <div className="flex gap-0.5 bg-stone-100 rounded-xl p-0.5">
                {(
                  [
                    ["ALL", "All"],
                    ["WITH_DATA", "Has Prices"],
                    ["NO_DATA", "No Data"],
                  ] as const
                ).map(([v, l]) => (
                  <button
                    key={v}
                    onClick={() => setDataFilter(v)}
                    aria-pressed={dataFilter === v}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${dataFilter === v ? "bg-white shadow-sm text-stone-800" : "text-stone-500"}`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl border border-stone-200 p-5 space-y-3"
                  >
                    <div className="flex gap-3">
                      <Skel cls="w-9 h-9 rounded-xl" />
                      <div className="space-y-1.5 flex-1">
                        <Skel cls="h-4 w-36" />
                        <Skel cls="h-3 w-24" />
                      </div>
                    </div>
                    {[1, 2, 3].map((j) => (
                      <Skel key={j} cls="h-10 w-full" />
                    ))}
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="bg-white rounded-2xl border border-stone-200">
                <EmptyState
                  title={search ? "No products match" : "No market price data"}
                  message={
                    search ? "Adjust your search." : "No prices recorded yet."
                  }
                />
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {filtered.map((g) => (
                    <ProductPriceCard
                      key={g.productId}
                      group={g}
                      onAnalyze={(id, name) =>
                        setAnalyzeTarget((p) =>
                          p?.id === id ? null : { id, name },
                        )
                      }
                      isAnalyzing={analyzeTarget?.id === g.productId}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}

            {!loading && filtered.length > 0 && (
              <p className="text-center text-[11px] text-stone-400 mt-6">
                Showing {filtered.length} of {groups.length} products · Active =
                last 30 days · Recent = older records
              </p>
            )}
          </div>

          <AnimatePresence>
            {analyzeTarget && (
              <div className="lg:sticky lg:top-6 lg:self-start">
                <AnalysisPanel
                  key={analyzeTarget.id}
                  productId={analyzeTarget.id}
                  productName={analyzeTarget.name}
                  onClose={() => setAnalyzeTarget(null)}
                />
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
