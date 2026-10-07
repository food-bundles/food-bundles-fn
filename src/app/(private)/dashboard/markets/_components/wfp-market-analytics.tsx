"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  BarChart3,
  Calendar,
  Layers,
  Search,
  Filter,
  RefreshCw,
  Database,
  UploadCloud,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  MapPin,
  ArrowUpRight,
  Building2,
  Table as TableIcon,
  LineChart as LineChartIcon,
  Tag,
  Scale,
  Map,
  Compass,
  Navigation,
  Info,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  Cell,
  Area,
  AreaChart,
} from "recharts";
import {
  wfpMarketService,
  WfpPriceRecord,
  WfpAnalyticsData,
  WfpFilterOptions,
} from "@/app/services/wfpMarketService";

interface WfpMarketAnalyticsProps {
  onOpenUpload: () => void;
  refreshTrigger?: number;
}

const fmtRwf = (n: number) => `RWF ${Math.round(n).toLocaleString("en-RW")}`;

const PROVINCE_COLORS: Record<string, string> = {
  "Kigali City": "#10b981", // Emerald
  "Northern Province": "#3b82f6", // Blue
  "Southern Province": "#f59e0b", // Amber
  "Eastern Province": "#8b5cf6", // Purple
  "Western Province": "#ec4899", // Pink
  Other: "#64748b",
};

// Coordinate projection for Rwanda (Lat: -1.0 to -2.9, Lng: 28.8 to 30.9)
function projectCoordinates(lat?: number | null, lng?: number | null) {
  if (!lat || !lng) return null;
  const minLat = -2.9;
  const maxLat = -1.05;
  const minLng = 28.85;
  const maxLng = 30.95;

  const x = ((lng - minLng) / (maxLng - minLng)) * 100;
  const y = ((maxLat - lat) / (maxLat - minLat)) * 100;

  return {
    x: Math.max(5, Math.min(95, x)),
    y: Math.max(5, Math.min(95, y)),
  };
}

export default function WfpMarketAnalytics({
  onOpenUpload,
  refreshTrigger = 0,
}: WfpMarketAnalyticsProps) {
  // ── state ──────────────────────────────────────────────────────────────────
  const [filterOptions, setFilterOptions] = useState<WfpFilterOptions | null>(
    null
  );
  const [analytics, setAnalytics] = useState<WfpAnalyticsData | null>(null);
  const [prices, setPrices] = useState<WfpPriceRecord[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 1,
  });

  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [loadingPrices, setLoadingPrices] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── active filters (defaults to ALL so data is never empty) ────────────────
  const [selectedCommodity, setSelectedCommodity] = useState<string>("Maize");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedMarket, setSelectedMarket] = useState<string>("ALL");
  const [selectedProvince, setSelectedProvince] = useState<string>("ALL");
  const [selectedPriceType, setSelectedPriceType] = useState<string>("ALL");
  const [dateRangePreset, setDateRangePreset] = useState<
    "1y" | "3y" | "5y" | "10y" | "all"
  >("all");

  const [searchQuery, setSearchQuery] = useState("");
  const [activeViewTab, setActiveViewTab] = useState<
    "visualizations" | "map" | "explorer"
  >("visualizations");
  const [hoveredMarket, setHoveredMarket] = useState<any | null>(null);
  const [selectedMapMarket, setSelectedMapMarket] = useState<any | null>(null);

  // Calculate start date based on preset
  const calculatedDates = useMemo(() => {
    if (dateRangePreset === "all")
      return { startDate: undefined, endDate: undefined };
    const now = new Date();
    const start = new Date();
    if (dateRangePreset === "1y") start.setFullYear(now.getFullYear() - 1);
    if (dateRangePreset === "3y") start.setFullYear(now.getFullYear() - 3);
    if (dateRangePreset === "5y") start.setFullYear(now.getFullYear() - 5);
    if (dateRangePreset === "10y") start.setFullYear(now.getFullYear() - 10);
    return {
      startDate: start.toISOString().split("T")[0],
      endDate: undefined,
    };
  }, [dateRangePreset]);

  // ── load filter options ────────────────────────────────────────────────────
  const loadOptions = useCallback(async () => {
    try {
      const res = await wfpMarketService.getFilterOptions();
      if (res.data) {
        setFilterOptions(res.data);
        if (
          res.data.commodities.length > 0 &&
          !res.data.commodities.some((c) => c.name === selectedCommodity)
        ) {
          // Prefer Maize or Beans if available
          const preferred = res.data.commodities.find(
            (c) => c.name === "Maize" || c.name === "Beans"
          );
          setSelectedCommodity(
            preferred ? preferred.name : res.data.commodities[0].name
          );
        }
      }
    } catch (e: any) {
      // ignore
    }
  }, [selectedCommodity]);

  // ── load analytics ────────────────────────────────────────────────────────
  const loadAnalytics = useCallback(async () => {
    try {
      setLoadingAnalytics(true);
      setError(null);
      const res = await wfpMarketService.getAnalytics({
        commodity: selectedCommodity !== "ALL" ? selectedCommodity : undefined,
        category: selectedCategory !== "ALL" ? selectedCategory : undefined,
        market: selectedMarket !== "ALL" ? selectedMarket : undefined,
        province: selectedProvince !== "ALL" ? selectedProvince : undefined,
        priceType: selectedPriceType !== "ALL" ? selectedPriceType : undefined,
        startDate: calculatedDates.startDate,
        endDate: calculatedDates.endDate,
      });
      setAnalytics(res.data);
    } catch (e: any) {
      setError(e.message || "Failed to load market analytics");
    } finally {
      setLoadingAnalytics(false);
    }
  }, [
    selectedCommodity,
    selectedCategory,
    selectedMarket,
    selectedProvince,
    selectedPriceType,
    calculatedDates,
  ]);

  // ── load prices table ──────────────────────────────────────────────────────
  const loadPrices = useCallback(
    async (pageNumber = 1) => {
      try {
        setLoadingPrices(true);
        const res = await wfpMarketService.getPrices({
          page: pageNumber,
          limit: pagination.limit,
          search: searchQuery.trim() !== "" ? searchQuery : undefined,
          commodity: selectedCommodity !== "ALL" ? selectedCommodity : undefined,
          category: selectedCategory !== "ALL" ? selectedCategory : undefined,
          market: selectedMarket !== "ALL" ? selectedMarket : undefined,
          province: selectedProvince !== "ALL" ? selectedProvince : undefined,
          priceType: selectedPriceType !== "ALL" ? selectedPriceType : undefined,
          startDate: calculatedDates.startDate,
          endDate: calculatedDates.endDate,
          sortBy: "date",
          sortOrder: "desc",
        });
        setPrices(res.data);
        setPagination((prev) => ({
          ...prev,
          page: res.pagination.page,
          total: res.pagination.total,
          totalPages: res.pagination.totalPages,
        }));
      } catch (e: any) {
        // ignore
      } finally {
        setLoadingPrices(false);
      }
    },
    [
      pagination.limit,
      searchQuery,
      selectedCommodity,
      selectedCategory,
      selectedMarket,
      selectedProvince,
      selectedPriceType,
      calculatedDates,
    ]
  );

  useEffect(() => {
    loadOptions();
  }, [loadOptions, refreshTrigger]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics, refreshTrigger]);

  useEffect(() => {
    loadPrices(pagination.page);
  }, [loadPrices, refreshTrigger]);

  // Line keys for charts (unique markets in the time series)
  const chartMarketKeys = useMemo(() => {
    if (!analytics?.timeSeries || analytics.timeSeries.length === 0) return [];
    const keys = new Set<string>();
    analytics.timeSeries.forEach((pt) => {
      Object.keys(pt).forEach((k) => {
        if (!["date", "avgPrice", "minPrice", "maxPrice"].includes(k)) {
          keys.add(k);
        }
      });
    });
    return Array.from(keys).slice(0, 6);
  }, [analytics?.timeSeries]);

  // Markets with coordinates for Map View
  const mapMarkets = useMemo(() => {
    if (!analytics?.marketComparisons) return [];
    return analytics.marketComparisons
      .map((m) => {
        const coords = projectCoordinates(m.latitude, m.longitude);
        return {
          ...m,
          coords,
        };
      })
      .filter((m) => m.coords !== null);
  }, [analytics?.marketComparisons]);

  const hasData = (analytics?.kpis.totalRecords || 0) > 0;

  return (
    <div className="space-y-6">
      {/* Top Banner / Ingestion Card */}
      <div className="bg-white border border-gray-200 text-gray-900 p-6 md:p-8 rounded-3xl shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            WFP Rwanda Market Prices & National Food Security Index
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
            Food Price Trends & Regional Market Intelligence
          </h2>
          <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
            Analyze historical and real-time agricultural commodity prices
            across all Rwandan provinces, benchmark market volatility, and
            visualize national price trajectories across interactive charts and
            GPS map coordinates.
          </p>
        </div>

        <div className="z-10 flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => {
              loadOptions();
              loadAnalytics();
              loadPrices(1);
            }}
            className="px-3.5 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 transition shadow-sm flex items-center gap-2 text-xs font-semibold"
            title="Refresh analytics"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${
                loadingAnalytics ? "animate-spin text-green-600" : "text-gray-500"
              }`}
            />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {!hasData && !loadingAnalytics ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-gray-200 space-y-4">
          <div className="p-4 rounded-full bg-emerald-50 text-emerald-600 w-16 h-16 mx-auto flex items-center justify-center">
            <Database className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg font-bold text-slate-900">
              No WFP Price Data Ingested Yet
            </h3>
            <p className="text-xs text-gray-500">
              Upload the <code>wfp_food_prices_rwa.csv</code> dataset to unlock
              20+ years of food pricing analytics, historical charts, and
              regional benchmarks.
            </p>
          </div>
          <button
            onClick={onOpenUpload}
            className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition inline-flex items-center gap-2"
          >
            <UploadCloud className="w-4 h-4" /> Upload CSV File Now
          </button>
        </div>
      ) : (
        <>
          {/* KPI Summary Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-1">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Total Price Entries
              </p>
              <p className="text-2xl font-black text-slate-900">
                {analytics?.kpis.totalRecords.toLocaleString() || "..."}
              </p>
              <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                <Database className="w-3 h-3" /> Indexed in Database
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-1">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Monitored Markets
              </p>
              <p className="text-2xl font-black text-slate-900">
                {analytics?.kpis.totalMarkets || "..."}
              </p>
              <p className="text-[11px] text-blue-600 font-bold flex items-center gap-1">
                <Building2 className="w-3 h-3" /> All Provinces Covered
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-1">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Historical Span
              </p>
              <p className="text-xl font-black text-slate-900">
                {analytics?.kpis.earliestDate
                  ? `${new Date(
                      analytics.kpis.earliestDate
                    ).getFullYear()} - ${new Date(
                      analytics.kpis.latestDate || Date.now()
                    ).getFullYear()}`
                  : "..."}
              </p>
              <p className="text-[11px] text-purple-600 font-bold flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Multi-Decade Timeline
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-1">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                {selectedCommodity} Avg Price
              </p>
              <p className="text-2xl font-black text-emerald-600">
                {analytics?.kpis.selectedAvgPrice
                  ? fmtRwf(analytics.kpis.selectedAvgPrice)
                  : "..."}
              </p>
              <p className="text-[11px] text-gray-500 font-medium">
                Spread: {fmtRwf(analytics?.kpis.priceSpread || 0)}
              </p>
            </div>
          </div>

          {/* Interactive Filter Control Panel */}
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <Filter className="w-4 h-4" />
                </span>
                <h4 className="text-sm font-bold text-slate-900">
                  Interactive Visualization Filters
                </h4>
              </div>

              {/* View Switcher Tabs */}
              <div className="flex items-center p-1 bg-gray-100 rounded-2xl gap-1">
                <button
                  onClick={() => setActiveViewTab("visualizations")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    activeViewTab === "visualizations"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-gray-500 hover:text-slate-900"
                  }`}
                >
                  <LineChartIcon className="w-3.5 h-3.5" /> Trend Charts
                </button>
                <button
                  onClick={() => setActiveViewTab("map")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    activeViewTab === "map"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-gray-500 hover:text-slate-900"
                  }`}
                >
                  <Map className="w-3.5 h-3.5 text-emerald-600" /> Geographic
                  Map ({mapMarkets.length})
                </button>
                <button
                  onClick={() => setActiveViewTab("explorer")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    activeViewTab === "explorer"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-gray-500 hover:text-slate-900"
                  }`}
                >
                  <TableIcon className="w-3.5 h-3.5" /> Data Explorer (
                  {pagination.total.toLocaleString()})
                </button>
              </div>
            </div>

            {/* Filter Dropdowns Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-1">
              {/* Commodity */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">
                  Commodity
                </label>
                <select
                  value={selectedCommodity}
                  onChange={(e) => setSelectedCommodity(e.target.value)}
                  className="w-full p-2.5 text-xs font-bold rounded-xl border border-gray-200 bg-gray-50 text-slate-800 outline-none focus:border-emerald-500 transition"
                >
                  {filterOptions?.commodities.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name} ({c.unit})
                    </option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-2.5 text-xs font-bold rounded-xl border border-gray-200 bg-gray-50 text-slate-800 outline-none focus:border-emerald-500 transition"
                >
                  <option value="ALL">All Categories</option>
                  {filterOptions?.categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Market */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">
                  Market
                </label>
                <select
                  value={selectedMarket}
                  onChange={(e) => setSelectedMarket(e.target.value)}
                  className="w-full p-2.5 text-xs font-bold rounded-xl border border-gray-200 bg-gray-50 text-slate-800 outline-none focus:border-emerald-500 transition"
                >
                  <option value="ALL">All Reference Markets</option>
                  {filterOptions?.markets.map((m) => (
                    <option key={m.name} value={m.name}>
                      {m.name} {m.province ? `(${m.province})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Type (Default ALL) */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">
                  Price Type
                </label>
                <select
                  value={selectedPriceType}
                  onChange={(e) => setSelectedPriceType(e.target.value)}
                  className="w-full p-2.5 text-xs font-bold rounded-xl border border-gray-200 bg-gray-50 text-slate-800 outline-none focus:border-emerald-500 transition"
                >
                  <option value="ALL">All Types (Wholesale + Retail)</option>
                  <option value="Retail">Retail</option>
                  <option value="Wholesale">Wholesale</option>
                </select>
              </div>

              {/* Time Range Preset (Default ALL TIME) */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">
                  Time Range
                </label>
                <select
                  value={dateRangePreset}
                  onChange={(e) => setDateRangePreset(e.target.value as any)}
                  className="w-full p-2.5 text-xs font-bold rounded-xl border border-gray-200 bg-gray-50 text-slate-800 outline-none focus:border-emerald-500 transition"
                >
                  <option value="all">All Time (2000 - Present)</option>
                  <option value="10y">Last 10 Years</option>
                  <option value="5y">Last 5 Years</option>
                  <option value="3y">Last 3 Years</option>
                  <option value="1y">Last 1 Year</option>
                </select>
              </div>
            </div>
          </div>

          {/* ── TAB 1: Visualizations (Line & Bar Charts) ─────────────────── */}
          {activeViewTab === "visualizations" && (
            <div className="space-y-6">
              {/* Main Line / Area Trend Chart */}
              <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-emerald-600" />
                      {selectedCommodity} Price Trajectory Over Time
                    </h3>
                    <p className="text-xs text-gray-400">
                      Monthly average price (RWF) across selected markets
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                    <Scale className="w-3.5 h-3.5 text-emerald-600" />
                    Data Points: {analytics?.timeSeries.length || 0} Months
                  </div>
                </div>

                <div className="h-80 w-full pt-2">
                  {loadingAnalytics ? (
                    <div className="h-full flex items-center justify-center text-xs text-gray-400">
                      Loading time-series data...
                    </div>
                  ) : analytics?.timeSeries && analytics.timeSeries.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={analytics.timeSeries}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient
                            id="priceGrad"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#10b981"
                              stopOpacity={0.25}
                            />
                            <stop
                              offset="95%"
                              stopColor="#10b981"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#f1f5f9"
                        />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 11, fill: "#94a3b8" }}
                          tickLine={false}
                          axisLine={{ stroke: "#e2e8f0" }}
                        />
                        <YAxis
                          tick={{ fontSize: 11, fill: "#94a3b8" }}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(v) => `${v.toLocaleString()}`}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#0f172a",
                            borderRadius: "1rem",
                            border: "none",
                            color: "#fff",
                            fontSize: "12px",
                            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
                          }}
                          formatter={(val: any, name: any) => [
                            fmtRwf(Number(val)),
                            name === "avgPrice" ? "National Average" : name,
                          ]}
                          labelFormatter={(label) => `Date: ${label}`}
                        />
                        <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                        <Area
                          type="monotone"
                          dataKey="avgPrice"
                          name="National Average"
                          stroke="#10b981"
                          strokeWidth={2.5}
                          fill="url(#priceGrad)"
                        />
                        {chartMarketKeys.map((mKey, idx) => {
                          const colors = [
                            "#3b82f6",
                            "#f59e0b",
                            "#8b5cf6",
                            "#ec4899",
                            "#06b6d4",
                            "#6366f1",
                          ];
                          return (
                            <Line
                              key={mKey}
                              type="monotone"
                              dataKey={mKey}
                              name={mKey}
                              stroke={colors[idx % colors.length]}
                              strokeWidth={1.5}
                              dot={false}
                            />
                          );
                        })}
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-xs text-gray-400">
                      No price history found for the selected filter combination.
                    </div>
                  )}
                </div>
              </div>

              {/* Regional Benchmark & Top Commodities Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Regional Bar Chart */}
                <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-4">
                  <div>
                    <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-indigo-600" />
                      Regional Market Price Benchmarks
                    </h3>
                    <p className="text-xs text-gray-400">
                      Average {selectedCommodity} price across reporting markets
                    </p>
                  </div>

                  <div className="h-72 w-full pt-2">
                    {analytics?.marketComparisons &&
                    analytics.marketComparisons.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={analytics.marketComparisons.slice(0, 10)}
                          layout="vertical"
                          margin={{ top: 0, right: 20, left: 40, bottom: 0 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            horizontal={false}
                            stroke="#f1f5f9"
                          />
                          <XAxis
                            type="number"
                            tick={{ fontSize: 11, fill: "#94a3b8" }}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(v) => `${v.toLocaleString()}`}
                          />
                          <YAxis
                            type="category"
                            dataKey="market"
                            tick={{ fontSize: 11, fill: "#475569" }}
                            tickLine={false}
                            axisLine={{ stroke: "#e2e8f0" }}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#0f172a",
                              borderRadius: "0.75rem",
                              border: "none",
                              color: "#fff",
                              fontSize: "12px",
                            }}
                            formatter={(val: any) => [fmtRwf(Number(val)), "Average Price"]}
                          />
                          <Bar dataKey="avgPrice" radius={[0, 8, 8, 0]}>
                            {analytics.marketComparisons
                              .slice(0, 10)
                              .map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={
                                    PROVINCE_COLORS[entry.province] || "#10b981"
                                  }
                                />
                              ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-xs text-gray-400">
                        No regional data available.
                      </div>
                    )}
                  </div>
                </div>

                {/* Top Commodities Card */}
                <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-4">
                  <div>
                    <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <Tag className="w-5 h-5 text-emerald-600" />
                      Top Tracked Agricultural Commodities
                    </h3>
                    <p className="text-xs text-gray-400">
                      National commodity benchmarks and volume of recorded entries
                    </p>
                  </div>

                  <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                    {analytics?.topCommodities.map((item) => {
                      const isSelected = item.commodity === selectedCommodity;
                      return (
                        <div
                          key={item.commodity}
                          onClick={() => setSelectedCommodity(item.commodity)}
                          className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? "bg-emerald-50/70 border-emerald-300 shadow-sm"
                              : "bg-gray-50/50 border-gray-100 hover:bg-gray-100/70"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2 rounded-xl text-xs font-black ${
                                isSelected
                                  ? "bg-emerald-600 text-white"
                                  : "bg-gray-200 text-gray-700"
                              }`}
                            >
                              {item.commodity.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="font-bold text-xs text-slate-900">
                                {item.commodity}
                              </h4>
                              <p className="text-[10px] text-gray-400 capitalize">
                                {item.category} • {item.records.toLocaleString()}{" "}
                                records
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="font-black text-xs text-slate-900">
                              {fmtRwf(item.avgPrice)}
                            </p>
                            <p className="text-[10px] text-gray-400">
                              per {item.unit}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 2: Geographic Rwanda Map View ─────────────────────────── */}
          {activeViewTab === "map" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Interactive Rwanda Map Canvas */}
              <div className="lg:col-span-2 p-6 rounded-3xl bg-white border border-gray-200 text-gray-900 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[500px]">
                {/* Header info */}
                <div className="flex items-center justify-between z-10 flex-wrap gap-2">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200">
                      <Compass className="w-3.5 h-3.5 text-emerald-600" />
                      Rwanda National Market Spatial Map
                    </div>
                    <h3 className="text-lg font-black text-gray-900">
                      {selectedCommodity} Prices Across {mapMarkets.length} GPS
                      Locations
                    </h3>
                  </div>

                  {/* Province Legend */}
                  <div className="hidden sm:flex flex-wrap items-center gap-1.5 text-[10px] font-bold">
                    {Object.entries(PROVINCE_COLORS)
                      .filter(([p]) => p !== "Other")
                      .map(([prov, color]) => (
                        <span
                          key={prov}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-200 text-gray-700"
                        >
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                          {prov.replace(" Province", "")}
                        </span>
                      ))}
                  </div>
                </div>

                {/* Map Pins Overlay on Stylized Rwanda Canvas */}
                <div className="relative w-full h-96 my-4 bg-gray-50/70 rounded-2xl border border-gray-200 overflow-hidden">
                  {/* Geographic Grid Lines */}
                  <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] opacity-70 pointer-events-none" />

                  {/* Rwanda Province Regions Indicator */}
                  <div className="absolute top-4 left-6 text-[10px] font-mono text-gray-400 font-semibold uppercase">
                    NORTHERN PROVINCE (-1.6°)
                  </div>
                  <div className="absolute top-1/2 left-6 text-[10px] font-mono text-gray-400 font-semibold uppercase">
                    WESTERN PROVINCE (29.3°E)
                  </div>
                  <div className="absolute top-1/2 right-6 text-[10px] font-mono text-gray-400 font-semibold uppercase">
                    EASTERN PROVINCE (30.8°E)
                  </div>
                  <div className="absolute bottom-4 left-1/3 text-[10px] font-mono text-gray-400 font-semibold uppercase">
                    SOUTHERN PROVINCE (-2.6°)
                  </div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] font-mono text-emerald-600/50 font-bold uppercase pointer-events-none">
                    KIGALI CITY
                  </div>

                  {/* Render Pins */}
                  {mapMarkets.map((m) => {
                    const isHovered = hoveredMarket?.market === m.market;
                    const isSelected = selectedMapMarket?.market === m.market;
                    const pinColor =
                      PROVINCE_COLORS[m.province] || "#10b981";

                    return (
                      <div
                        key={m.market}
                        style={{
                          left: `${m.coords?.x}%`,
                          top: `${m.coords?.y}%`,
                        }}
                        onMouseEnter={() => setHoveredMarket(m)}
                        onMouseLeave={() => setHoveredMarket(null)}
                        onClick={() => setSelectedMapMarket(m)}
                        className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group"
                      >
                        <div className="relative flex items-center justify-center">
                          <span
                            className={`w-3.5 h-3.5 rounded-full transition-transform duration-200 border-2 border-white shadow-md ${
                              isSelected || isHovered
                                ? "scale-150 ring-4 ring-emerald-500/40"
                                : "scale-100 hover:scale-125"
                            }`}
                            style={{ backgroundColor: pinColor }}
                          />
                        </div>
                      </div>
                    );
                  })}

                  {/* Hover / Selected Market Popup Card */}
                  {(hoveredMarket || selectedMapMarket) && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute bottom-4 right-4 z-30 p-4 rounded-2xl bg-white/95 border border-emerald-500/30 backdrop-blur-md shadow-xl max-w-xs text-xs space-y-2 text-gray-900"
                    >
                      {(() => {
                        const target = hoveredMarket || selectedMapMarket;
                        return (
                          <>
                            <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-2">
                              <span className="font-black text-emerald-700 text-sm">
                                {target.market}
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                                {target.province}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-[11px]">
                              <div>
                                <span className="text-gray-500">District:</span>
                                <p className="font-bold text-gray-800">
                                  {target.district || "N/A"}
                                </p>
                              </div>
                              <div>
                                <span className="text-gray-500">
                                  Coordinates:
                                </span>
                                <p className="font-mono text-[10px] text-gray-700">
                                  {target.latitude?.toFixed(2)},{" "}
                                  {target.longitude?.toFixed(2)}
                                </p>
                              </div>
                            </div>
                            <div className="p-2 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                              <span className="text-gray-500 text-[11px]">
                                {selectedCommodity} Avg:
                              </span>
                              <span className="font-black text-emerald-700 text-sm">
                                {fmtRwf(target.avgPrice)}
                              </span>
                            </div>
                          </>
                        );
                      })()}
                    </motion.div>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 z-10 pt-2 border-t border-gray-100">
                  <span>
                    Showing {mapMarkets.length} geo-mapped markets across Rwanda
                  </span>
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <Navigation className="w-3.5 h-3.5" /> Click any pin to
                    inspect market details
                  </span>
                </div>
              </div>

              {/* Market Ranking & Geo Details Sidebar */}
              <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-4 flex flex-col">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-emerald-600" />
                    Market GPS Locations & Prices
                  </h3>
                  <p className="text-xs text-gray-400">
                    Ranked by lowest to highest {selectedCommodity} price
                  </p>
                </div>

                <div className="space-y-2 overflow-y-auto flex-1 max-h-[420px] pr-1">
                  {mapMarkets
                    .slice()
                    .sort((a, b) => a.avgPrice - b.avgPrice)
                    .map((m, idx) => (
                      <div
                        key={m.market}
                        onMouseEnter={() => setHoveredMarket(m)}
                        onMouseLeave={() => setHoveredMarket(null)}
                        onClick={() => setSelectedMapMarket(m)}
                        className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                          hoveredMarket?.market === m.market ||
                          selectedMapMarket?.market === m.market
                            ? "bg-emerald-50 border-emerald-300 shadow-sm"
                            : "bg-gray-50/50 border-gray-100 hover:bg-gray-100/70"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-[10px] font-black text-gray-400 w-4">
                            #{idx + 1}
                          </span>
                          <div>
                            <h4 className="font-bold text-xs text-slate-900">
                              {m.market}
                            </h4>
                            <p className="text-[10px] text-gray-400">
                              {m.district ? `${m.district}, ` : ""}
                              {m.province} • GPS: {m.latitude?.toFixed(2)},{" "}
                              {m.longitude?.toFixed(2)}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="font-black text-xs text-emerald-600">
                            {fmtRwf(m.avgPrice)}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            {m.dataPoints} pts
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 3: Data Explorer Table View ─────────────────────────── */}
          {activeViewTab === "explorer" && (
            <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-4">
              {/* Search Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search commodity, market, province..."
                    className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-emerald-500 outline-none transition"
                  />
                </div>

                <div className="text-xs text-gray-500 font-medium self-end sm:self-center">
                  Showing {(pagination.page - 1) * pagination.limit + 1} -{" "}
                  {Math.min(
                    pagination.page * pagination.limit,
                    pagination.total
                  )}{" "}
                  of {pagination.total.toLocaleString()} records
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-2xl border border-gray-100">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-900 text-white font-bold">
                      <th className="p-3.5">Date</th>
                      <th className="p-3.5">Commodity</th>
                      <th className="p-3.5">Category</th>
                      <th className="p-3.5">Market</th>
                      <th className="p-3.5">Province</th>
                      <th className="p-3.5">GPS Coordinates</th>
                      <th className="p-3.5 text-center">Unit</th>
                      <th className="p-3.5 text-center">Type</th>
                      <th className="p-3.5 text-right">Price (RWF)</th>
                      <th className="p-3.5 text-right">USD Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-slate-800 font-medium">
                    {loadingPrices ? (
                      <tr>
                        <td
                          colSpan={10}
                          className="p-8 text-center text-gray-400"
                        >
                          Loading price records...
                        </td>
                      </tr>
                    ) : prices.length === 0 ? (
                      <tr>
                        <td
                          colSpan={10}
                          className="p-8 text-center text-gray-400"
                        >
                          No records match the active search or filters.
                        </td>
                      </tr>
                    ) : (
                      prices.map((p) => (
                        <tr
                          key={p.id}
                          className="hover:bg-slate-50/80 transition"
                        >
                          <td className="p-3.5 font-bold text-slate-700 whitespace-nowrap">
                            {new Date(p.date).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </td>
                          <td className="p-3.5 font-bold text-slate-900">
                            {p.commodity}
                          </td>
                          <td className="p-3.5 text-gray-500 capitalize">
                            {p.category}
                          </td>
                          <td className="p-3.5">
                            <span className="inline-flex items-center gap-1 font-bold text-slate-800">
                              <MapPin className="w-3 h-3 text-emerald-600" />
                              {p.marketName}
                            </span>
                          </td>
                          <td className="p-3.5 text-gray-500">
                            {p.province || "-"}
                          </td>
                          <td className="p-3.5 text-gray-400 font-mono text-[11px]">
                            {p.latitude && p.longitude
                              ? `${p.latitude.toFixed(2)}, ${p.longitude.toFixed(2)}`
                              : "-"}
                          </td>
                          <td className="p-3.5 text-center font-bold">
                            {p.unit}
                          </td>
                          <td className="p-3.5 text-center">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                p.priceType === "Wholesale"
                                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                                  : "bg-amber-50 text-amber-700 border border-amber-200"
                              }`}
                            >
                              {p.priceType || "Wholesale"}
                            </span>
                          </td>
                          <td className="p-3.5 text-right font-black text-emerald-600">
                            {fmtRwf(p.price)}
                          </td>
                          <td className="p-3.5 text-right text-gray-500">
                            {p.usdPrice ? `$${p.usdPrice.toFixed(2)}` : "-"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => loadPrices(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-slate-800 text-xs font-bold transition disabled:opacity-40 flex items-center gap-1.5"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" /> Previous
                  </button>

                  <span className="text-xs font-bold text-gray-500">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>

                  <button
                    onClick={() => loadPrices(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-slate-800 text-xs font-bold transition disabled:opacity-40 flex items-center gap-1.5"
                  >
                    Next <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
