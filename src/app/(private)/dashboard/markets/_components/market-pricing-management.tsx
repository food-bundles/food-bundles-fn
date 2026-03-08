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
import MarketPricingTable from "./market-pricing-table";
import { daysAgo } from "./utils";
import {
  ErrorBanner,
  Skel,
  EmptyState,
  ToastStack,
  useToast,
  groupByProduct,
} from "./shared-atoms";
import {
  Package,
  BarChart2,
  Store,
  RefreshCw,
  MapPin,
  Plus,
  Building2,
  LayoutGrid,
  Table2,
} from "lucide-react";

export default function MarketPricingManagement() {
  // ── data ──────────────────────────────────────────────────────────────────
  const [groups, setGroups] = useState<ProductGroup[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── view ──────────────────────────────────────────────────────────────────
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

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

  const summaryCards = [
    {
      label: "Products Tracked",
      value: groups.length,
      Icon: Package,
    },
    {
      label: "With Price Data",
      value: groups.filter((g) => g.records.length > 0).length,
      Icon: BarChart2,
    },
    {
      label: "Active Markets",
      value: markets.filter((m) => m.isActive).length,
      Icon: Store,
    },
    {
      label: "Active Records (30d)",
      value: activeRecs,
      Icon: RefreshCw,
    },
  ];

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white">
      <ToastStack toasts={toasts} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 text-xs text-gray-400 mb-7"
        >
          {[{ l: "Dashboard", h: "/dashboard" }, { l: "Market Pricing" }].map(
            (item, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-gray-300">›</span>}
                {item.h ? (
                  <a
                    href={item.h}
                    className="hover:text-gray-700 transition-colors font-medium"
                  >
                    {item.l}
                  </a>
                ) : (
                  <span className="text-gray-700 font-semibold">{item.l}</span>
                )}
              </span>
            ),
          )}
        </nav>

        {/* page header */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-8 h-8 rounded-xl bg-black flex items-center justify-center text-white shadow-sm">
                <BarChart2 className="w-4 h-4" />
              </div>
              <h1 className="text-2xl font-black text-gray-900">
                Market Pricing
              </h1>
            </div>
            <p className="text-sm text-gray-500 ml-10">
              Compare product prices across all registered markets
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {!loading && (
              <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-white border border-gray-200 px-3 py-1.5 rounded-xl">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Live · {groups.length} products
              </div>
            )}

            {/* View mode toggle */}
            <div className="flex gap-0.5 bg-gray-100 rounded-xl p-0.5">
              <button
                onClick={() => setViewMode("cards")}
                aria-pressed={viewMode === "cards"}
                title="Card view"
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 ${
                  viewMode === "cards"
                    ? "bg-white shadow-sm text-gray-900"
                    : "text-gray-500"
                }`}
              >
                <LayoutGrid className="w-3 h-3" />
                Cards
              </button>
              <button
                onClick={() => setViewMode("table")}
                aria-pressed={viewMode === "table"}
                title="Table view"
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 ${
                  viewMode === "table"
                    ? "bg-white shadow-sm text-gray-900"
                    : "text-gray-500"
                }`}
              >
                <Table2 className="w-3 h-3" />
                Table
              </button>
            </div>

            <button
              onClick={() => setManageMarketsOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
            >
              <Building2 className="w-3.5 h-3.5" />
              Manage Markets
            </button>

            <button
              onClick={() => setCreateMarketOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
            >
              <MapPin className="w-3.5 h-3.5" />
              Add Market
            </button>

            <button
              onClick={() => {
                setRecordPriceDefaultProduct(undefined);
                setRecordPriceOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-green-600 text-white text-xs font-black shadow-sm hover:bg-green-700 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Record Price
            </button>

            <button
              onClick={load}
              disabled={loading}
              aria-label="Refresh"
              className="w-9 h-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {error && <ErrorBanner message={error} onRetry={load} />}
        </AnimatePresence>

        {/* summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {summaryCards.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm px-4 py-4 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center flex-shrink-0">
                <s.Icon className="w-5 h-5 text-white" />
              </div>
              {loading ? (
                <div className="space-y-1.5 flex-1">
                  <Skel cls="h-5 w-10" />
                  <Skel cls="h-3 w-20" />
                </div>
              ) : (
                <div>
                  <p className="text-xl font-black text-gray-900">{s.value}</p>
                  <p className="text-[11px] text-gray-500">{s.label}</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Table view */}
        {viewMode === "table" && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <MarketPricingTable />
          </div>
        )}

        {/* Card view */}
        {viewMode === "cards" && (
          <div className="grid grid-cols-1 gap-5">
            {/* LEFT — filter bar + product cards */}
            <div className="min-w-0 w-full">
              {/* filter bar */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-4 py-3.5 mb-5 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                <div className="relative flex-1">
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400"
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
                    className="w-full pl-8 pr-4 py-2 rounded-xl border border-gray-200 text-xs bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                </div>

                <div className="flex gap-0.5 bg-gray-100 rounded-xl p-0.5">
                  {(["30d", "60d", "90d", "all"] as const).map((v) => (
                    <button
                      key={v}
                      onClick={() => setDateRange(v)}
                      aria-pressed={dateRange === v}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                        dateRange === v
                          ? "bg-white shadow-sm text-gray-900"
                          : "text-gray-500"
                      }`}
                    >
                      {v === "all" ? "All" : v}
                    </button>
                  ))}
                </div>

                <div className="flex gap-0.5 bg-gray-100 rounded-xl p-0.5">
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
                          ? "bg-white shadow-sm text-gray-900"
                          : "text-gray-500"
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {/* product cards + carousel side-by-side on lg */}
              <div className="flex flex-col lg:flex-row gap-5">
                {/* cards column */}
                <div className="flex-1 min-w-0">
                  {loading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3"
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
                    <div className="bg-white rounded-2xl border border-gray-200">
                      <EmptyState
                        title={
                          search ? "No products match" : "No market price data"
                        }
                        message={
                          search
                            ? "Adjust your search."
                            : "No prices recorded yet."
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
                        <p className="text-center text-[11px] text-gray-400 mt-6">
                          Showing {filtered.length} of {groups.length} products
                          · Active = last 30 days · Recent = last 7 days
                        </p>
                      )}
                    </>
                  )}
                </div>

                {/* Carousel — same level as product cards on lg */}
                <div className="lg:w-[280px] flex-shrink-0">
                  <div className="lg:sticky lg:top-6 flex flex-col gap-4">
                    {loading ? (
                      <div
                        className="rounded-2xl border border-gray-200 bg-white overflow-hidden"
                        style={{ height: 272 }}
                      >
                        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100">
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
            </div>

            {/* RIGHT — analysis panel only (when analysis is open, carousel moved inline) */}
          </div>
        )}
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
