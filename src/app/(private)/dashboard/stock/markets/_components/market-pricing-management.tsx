"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { marketPricingService } from "@/app/services/marketPricingService";
import {
  CreateMarketModal,
  EditMarketModal,
  DeleteMarketModal,
  RecordPriceModal,
  EditPriceHistoryModal,
  DeletePriceHistoryModal,
  ManageMarketsPanel,
} from "./market-pricing-modals";
import type { Market, PriceRecord, ProductGroup } from "@/types/market-pricing";
import AnalysisPanel from "./analysis-panel";
import ProductPriceCard from "./product-price-card";
import PriceTrendCarousel from "./price-trend-carousel";
import { daysAgo } from "./utils";
import {
  ErrorBanner,
  Skel,
  EmptyState,
  ToastStack,
  useToast,
  groupByProduct,
} from "./shared-atoms";

export default function MarketPricingManagement() {
  // ── data ──────────────────────────────────────────────────────────────────
  const [groups, setGroups] = useState<ProductGroup[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── filters ───────────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [dataFilter, setDataFilter] = useState<"ALL" | "WITH_DATA" | "NO_DATA">(
    "ALL",
  );
  const [dateRange, setDateRange] = useState<"30d" | "60d" | "90d" | "all">(
    "30d",
  );

  // ── analysis ──────────────────────────────────────────────────────────────
  const [analyzeTarget, setAnalyzeTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // ── modals ────────────────────────────────────────────────────────────────
  const [createMarketOpen, setCreateMarketOpen] = useState(false);
  const [editMarketTarget, setEditMarketTarget] = useState<Market | null>(null);
  const [deleteMarketTarget, setDeleteMarketTarget] = useState<Market | null>(
    null,
  );
  const [manageMarketsOpen, setManageMarketsOpen] = useState(false);
  const [recordPriceOpen, setRecordPriceOpen] = useState(false);
  const [recordPriceDefaultProduct, setRecordPriceDefaultProduct] = useState<
    string | undefined
  >();
  const [editRecordTarget, setEditRecordTarget] = useState<PriceRecord | null>(
    null,
  );
  const [deleteRecordTarget, setDeleteRecordTarget] =
    useState<PriceRecord | null>(null);

  // ── toasts ────────────────────────────────────────────────────────────────
  const { toasts, add: toast } = useToast();

  // ── fetch ─────────────────────────────────────────────────────────────────
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

  // ── filtered ──────────────────────────────────────────────────────────────
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

  // ── handlers ──────────────────────────────────────────────────────────────
  const handleMarketCreated = (m: Market) => {
    setMarkets((p) => [m, ...p]);
    toast(`Market "${m.name}" created`);
  };
  const handleMarketUpdated = (m: Market) => {
    setMarkets((p) => p.map((x) => (x.id === m.id ? m : x)));
    toast(`Market "${m.name}" updated`);
    setEditMarketTarget(null);
  };
  const handleMarketDeleted = (id: string) => {
    setMarkets((p) => p.filter((m) => m.id !== id));
    toast("Market deleted", "error");
    setDeleteMarketTarget(null);
    load();
  };
  const handlePriceRecorded = (_: PriceRecord) => {
    toast("Price recorded successfully");
    load();
  };
  const handleRecordUpdated = (updated: PriceRecord) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.productId === updated.product.id
          ? {
              ...g,
              records: g.records.map((r) =>
                r.id === updated.id ? updated : r,
              ),
            }
          : g,
      ),
    );
    toast("Price record updated");
    setEditRecordTarget(null);
  };
  const handleRecordDeleted = (id: string) => {
    setGroups((prev) =>
      prev.map((g) => ({
        ...g,
        records: g.records.filter((r) => r.id !== id),
      })),
    );
    toast("Price record deleted", "error");
    setDeleteRecordTarget(null);
  };
  const openRecordForProduct = (productId: string) => {
    setRecordPriceDefaultProduct(productId);
    setRecordPriceOpen(true);
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen">
      <ToastStack toasts={toasts} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* breadcrumb */}
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

        {/* page header */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div
                className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500
                              flex items-center justify-center text-white shadow-sm"
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

          <div className="flex items-center gap-2 flex-wrap">
            {!loading && (
              <div className="flex items-center gap-1.5 text-xs text-stone-400 bg-white border border-stone-200 px-3 py-1.5 rounded-xl">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live · {groups.length} products
              </div>
            )}

            <button
              onClick={() => setManageMarketsOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-stone-200 bg-white text-xs font-bold text-stone-700 hover:bg-stone-50 transition-colors shadow-sm"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              Manage Markets
            </button>

            <button
              onClick={() => setCreateMarketOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-stone-200 bg-white text-xs font-bold text-stone-700 hover:bg-stone-50 transition-colors shadow-sm"
            >
              <svg
                className="w-3.5 h-3.5 text-amber-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Add Market
            </button>

            <button
              onClick={() => {
                setRecordPriceDefaultProduct(undefined);
                setRecordPriceOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-black shadow-sm hover:from-amber-600 hover:to-orange-600 transition-all"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Record Price
            </button>

            <button
              onClick={load}
              disabled={loading}
              aria-label="Refresh"
              className="w-9 h-9 rounded-xl border border-stone-200 bg-white flex items-center justify-center text-stone-500 hover:bg-stone-50 disabled:opacity-40 transition-colors"
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

        {/* summary cards */}
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

        {/* ── main grid ─────────────────────────────────────────────────── */}
        {/*  lg: [product list flex-1] [right sidebar 300px]               */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">
          {/* LEFT — filter bar + product cards */}
          <div className="min-w-0">
            {/* filter bar */}
            <div
              className="bg-white rounded-2xl border border-stone-200 shadow-sm px-4 py-3.5 mb-5
                            flex flex-col sm:flex-row gap-3 items-stretch sm:items-center"
            >
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
                  className="w-full pl-8 pr-4 py-2 rounded-xl border border-stone-200 text-xs bg-stone-50
                             focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div className="flex gap-0.5 bg-stone-100 rounded-xl p-0.5">
                {(["30d", "60d", "90d", "all"] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setDateRange(v)}
                    aria-pressed={dateRange === v}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                      dateRange === v
                        ? "bg-white shadow-sm text-stone-800"
                        : "text-stone-500"
                    }`}
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
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
                      dataFilter === v
                        ? "bg-white shadow-sm text-stone-800"
                        : "text-stone-500"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* product cards */}
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
              <>
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
                        onRecordPrice={openRecordForProduct}
                        onEditRecord={setEditRecordTarget}
                        onDeleteRecord={setDeleteRecordTarget}
                      />
                    ))}
                  </AnimatePresence>
                </div>
                {!loading && filtered.length > 0 && (
                  <p className="text-center text-[11px] text-stone-400 mt-6">
                    Showing {filtered.length} of {groups.length} products ·
                    Active = last 30 days · Recent = last 7 days
                  </p>
                )}
              </>
            )}
          </div>

          {/* RIGHT — trend carousel + analysis panel (sticky) */}
          <div className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start">
            {/* carousel — always visible */}
            {loading ? (
              <div
                className="rounded-2xl border border-stone-700/60 bg-[#181613] overflow-hidden"
                style={{ height: 272 }}
              >
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-stone-800/80">
                  <Skel cls="w-2 h-2 rounded-full" />
                  <Skel cls="h-2 w-20" />
                </div>
                <div className="p-4 space-y-2.5">
                  <div className="grid grid-cols-2 gap-1.5">
                    <Skel cls="h-14 rounded-lg" />
                    <Skel cls="h-14 rounded-lg" />
                  </div>
                  <Skel cls="h-24 rounded-lg" />
                </div>
              </div>
            ) : (
              <PriceTrendCarousel groups={groups} interval={3200} />
            )}

            {/* analysis panel — slides in below carousel */}
            <AnimatePresence>
              {analyzeTarget && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                >
                  <AnalysisPanel
                    key={analyzeTarget.id}
                    productId={analyzeTarget.id}
                    productName={analyzeTarget.name}
                    onClose={() => setAnalyzeTarget(null)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── modals ─────────────────────────────────────────────────────── */}
      <CreateMarketModal
        open={createMarketOpen}
        onClose={() => setCreateMarketOpen(false)}
        onSuccess={handleMarketCreated}
      />
      <EditMarketModal
        open={!!editMarketTarget}
        market={editMarketTarget}
        onClose={() => setEditMarketTarget(null)}
        onSuccess={handleMarketUpdated}
      />
      <DeleteMarketModal
        open={!!deleteMarketTarget}
        market={deleteMarketTarget}
        onClose={() => setDeleteMarketTarget(null)}
        onSuccess={handleMarketDeleted}
      />
      <ManageMarketsPanel
        open={manageMarketsOpen}
        onClose={() => setManageMarketsOpen(false)}
        onMarketsChange={load}
      />
      <RecordPriceModal
        open={recordPriceOpen}
        defaultProductId={recordPriceDefaultProduct}
        markets={markets}
        onClose={() => setRecordPriceOpen(false)}
        onSuccess={handlePriceRecorded}
      />
      <EditPriceHistoryModal
        open={!!editRecordTarget}
        record={editRecordTarget}
        onClose={() => setEditRecordTarget(null)}
        onSuccess={handleRecordUpdated}
      />
      <DeletePriceHistoryModal
        open={!!deleteRecordTarget}
        record={deleteRecordTarget}
        onClose={() => setDeleteRecordTarget(null)}
        onSuccess={handleRecordDeleted}
      />
    </div>
  );
}
