"use client";

import { useState, useMemo } from "react";
import {
  Boxes,
  Award,
  Truck,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  MapPin,
  Star,
  Layers,
  Search,
  AlertTriangle,
  Scale,
  DollarSign,
  UserCheck,
  Building2,
  Users,
  ChevronRight,
  Info,
  Filter,
  BarChart2,
  Sparkles,
  ArrowUpRight,
  PackageCheck,
  CreditCard,
  Clock,
  ArrowRight,
  Warehouse,
  ShieldAlert,
  HelpCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import {
  MOCK_AGGREGATOR_STATUS,
  MOCK_LOCATION_SUPPLY_METRICS,
  MOCK_MARKET_BENCHMARK_TABLE,
  MOCK_VIRTUAL_STOCK_ITEMS,
  MOCK_VIRTUAL_STOCK_PIPELINE,
  REFERENCE_MARKETS,
  AggregatorSupplyStatus,
  LocationSupplyMetric,
  VirtualStockItem,
} from "@/app/services/predictiveIntelligenceData";

const fmtRwf = (n: number) => `RWF ${Math.round(n).toLocaleString("en-RW")}`;
const fmtNum = (n: number) => Math.round(n).toLocaleString("en-RW");

export default function AdminSupplyIntelligencePage() {
  const [activeTab, setActiveTab] = useState<"virtual_stock" | "aggregators" | "locations" | "pricing_engine">("virtual_stock");
  const [selectedLocation, setSelectedLocation] = useState<string>("ALL");
  const [selectedReferenceMarket, setSelectedReferenceMarket] = useState<string>("Kimironko");
  const [searchAggregator, setSearchAggregator] = useState<string>("");
  const [virtualStockCategoryFilter, setVirtualStockCategoryFilter] = useState<string>("ALL");
  const [virtualStockSearch, setVirtualStockSearch] = useState<string>("");
  const [showExplanationModal, setShowExplanationModal] = useState<boolean>(false);

  // Filter virtual stock items
  const filteredVirtualStock = useMemo(() => {
    return MOCK_VIRTUAL_STOCK_ITEMS.filter((item) => {
      const matchesCategory = virtualStockCategoryFilter === "ALL" || item.category === virtualStockCategoryFilter;
      const matchesSearch =
        item.cropName.toLowerCase().includes(virtualStockSearch.toLowerCase()) ||
        item.primaryLocation.toLowerCase().includes(virtualStockSearch.toLowerCase()) ||
        item.topAggregator.toLowerCase().includes(virtualStockSearch.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [virtualStockCategoryFilter, virtualStockSearch]);

  // Filter aggregators
  const filteredAggregators = useMemo(() => {
    return MOCK_AGGREGATOR_STATUS.filter((agg) => {
      const matchesLocation = selectedLocation === "ALL" || agg.district === selectedLocation;
      const matchesSearch =
        agg.name.toLowerCase().includes(searchAggregator.toLowerCase()) ||
        agg.district.toLowerCase().includes(searchAggregator.toLowerCase()) ||
        agg.primaryCrops.some((c) => c.toLowerCase().includes(searchAggregator.toLowerCase()));
      return matchesLocation && matchesSearch;
    });
  }, [selectedLocation, searchAggregator]);

  // Pricing engine calculations with 30% margin vs reference market
  const pricingEngineRows = useMemo(() => {
    return MOCK_MARKET_BENCHMARK_TABLE.map((item) => {
      const refMarketPrice = item.marketPrices[selectedReferenceMarket] || item.marketPrices["Kimironko"] || 1000;
      const ourSellingPrice = Math.round(item.farmerPurchasePrice * 1.30); // Purchase + 30% margin
      const marginAmount = ourSellingPrice - item.farmerPurchasePrice;
      const priceDifference = ourSellingPrice - refMarketPrice;
      const priceDifferencePct = Number(((priceDifference / refMarketPrice) * 100).toFixed(1));
      const isOverpriced = ourSellingPrice > refMarketPrice;

      return {
        ...item,
        ourCalculatedPrice: ourSellingPrice,
        marginAmount,
        refMarketPrice,
        priceDifference,
        priceDifferencePct,
        isOverpriced,
      };
    });
  }, [selectedReferenceMarket]);

  const overpricedCount = pricingEngineRows.filter((r) => r.isOverpriced).length;
  const competitiveCount = pricingEngineRows.length - overpricedCount;

  // Chart data for virtual stock distribution across stages
  const virtualPipelineChartData = [
    { name: "1. Farmer Submitted", kg: MOCK_VIRTUAL_STOCK_PIPELINE.totalSubmittedKg, fill: "#94a3b8", label: "Submitted by Farmers" },
    { name: "2. Offers Accepted", kg: MOCK_VIRTUAL_STOCK_PIPELINE.totalAcceptedKg, fill: "#3b82f6", label: "Accepted by Aggregators" },
    { name: "3. Offers Paid", kg: MOCK_VIRTUAL_STOCK_PIPELINE.totalPaidKg, fill: "#059669", label: "Paid & Secured" },
    { name: "4. Allocated to Orders", kg: MOCK_VIRTUAL_STOCK_PIPELINE.totalAllocatedKg, fill: "#8b5cf6", label: "Reserved for Orders" },
    { name: "5. Net Available Buffer", kg: MOCK_VIRTUAL_STOCK_PIPELINE.netAvailableVirtualStockKg, fill: "#10b981", label: "Ready for New Orders" },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white border border-gray-200 text-gray-900 p-6 md:p-8 rounded-3xl shadow-sm relative overflow-hidden">
        <div className="space-y-2 z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
            <Warehouse className="w-3.5 h-3.5 text-emerald-600" />
            Supply Chain & Virtual Stock Intelligence
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-gray-900 tracking-tight">
            Supply Intelligence & Virtual Stock Operations
          </h1>
          <p className="text-gray-600 text-sm leading-relaxed">
            Track committed in-pipeline inventory from <strong>Accepted Farmer Offers</strong> and <strong>Paid Offers</strong>, monitor aggregator buying quotas, and compare dynamic 30% margin selling prices against regional benchmark markets.
          </p>
        </div>

        {/* Global Reference Market Selector */}
        <div className="z-10 flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-gray-50 p-3.5 rounded-2xl border border-gray-200 shrink-0">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Benchmark Reference Market:</p>
            <select
              value={selectedReferenceMarket}
              onChange={(e) => setSelectedReferenceMarket(e.target.value)}
              className="p-2 text-xs font-bold rounded-xl border border-gray-200 bg-white text-gray-900 outline-none cursor-pointer shadow-xs focus:ring-2 focus:ring-emerald-500"
            >
              {REFERENCE_MARKETS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Virtual Stock (Accepted + Paid) */}
        <Card className="py-4 shadow-xs border-gray-200 bg-white">
          <CardContent className="px-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Virtual Stock</p>
              <p className="text-2xl font-black text-emerald-700 mt-1">
                {(MOCK_VIRTUAL_STOCK_PIPELINE.totalAcceptedKg / 1000).toFixed(1)} Tons
              </p>
              <div className="flex items-center gap-1 mt-1 text-xs text-emerald-600 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" /> {fmtRwf(MOCK_VIRTUAL_STOCK_PIPELINE.totalVirtualStockValueRwf)} Value
              </div>
            </div>
            <div className="w-12 h-12 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center border border-emerald-100">
              <Warehouse className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {/* Paid & Guaranteed Inflow */}
        <Card className="py-4 shadow-xs border-gray-200 bg-white">
          <CardContent className="px-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Paid Farmer Offers</p>
              <p className="text-2xl font-black text-blue-700 mt-1">
                {(MOCK_VIRTUAL_STOCK_PIPELINE.totalPaidKg / 1000).toFixed(1)} Tons
              </p>
              <p className="text-xs text-blue-600 mt-1 font-semibold">
                {MOCK_VIRTUAL_STOCK_PIPELINE.paidExecutionRatePct}% Paid & Secured
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center border border-blue-100">
              <CreditCard className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {/* Available Buffer for Orders */}
        <Card className="py-4 shadow-xs border-gray-200 bg-white">
          <CardContent className="px-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Net Available Buffer</p>
              <p className="text-2xl font-black text-purple-700 mt-1">
                {(MOCK_VIRTUAL_STOCK_PIPELINE.netAvailableVirtualStockKg / 1000).toFixed(1)} Tons
              </p>
              <p className="text-xs text-purple-600 mt-1 font-semibold">Unallocated for New Orders</p>
            </div>
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center border border-purple-100">
              <PackageCheck className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {/* Pricing Engine vs Market */}
        <Card className="py-4 shadow-xs border-gray-200 bg-white">
          <CardContent className="px-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">30% Margin Pricing</p>
              <p className="text-2xl font-black text-gray-900 mt-1">
                {competitiveCount} / {pricingEngineRows.length} Match
              </p>
              <p className="text-xs text-amber-600 font-bold mt-1">
                {overpricedCount} Alert{overpricedCount === 1 ? "" : "s"} vs {selectedReferenceMarket}
              </p>
            </div>
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center border border-amber-100">
              <Scale className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex border-b border-gray-200 overflow-x-auto gap-2 bg-white px-4 pt-3 rounded-t-2xl shadow-xs">
        <button
          onClick={() => setActiveTab("virtual_stock")}
          className={`flex items-center gap-2 px-5 py-3.5 text-xs font-bold border-b-2 transition whitespace-nowrap ${
            activeTab === "virtual_stock"
              ? "border-emerald-700 text-emerald-800 bg-emerald-50/50 rounded-t-xl"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <Warehouse className="w-4 h-4" />
          1. Virtual Stock (Accepted & Paid Offers)
        </button>

        <button
          onClick={() => setActiveTab("aggregators")}
          className={`flex items-center gap-2 px-5 py-3.5 text-xs font-bold border-b-2 transition whitespace-nowrap ${
            activeTab === "aggregators"
              ? "border-emerald-700 text-emerald-800 bg-emerald-50/50 rounded-t-xl"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <UserCheck className="w-4 h-4" />
          2. Aggregator Activity & Buying Capacity
        </button>

        <button
          onClick={() => setActiveTab("locations")}
          className={`flex items-center gap-2 px-5 py-3.5 text-xs font-bold border-b-2 transition whitespace-nowrap ${
            activeTab === "locations"
              ? "border-emerald-700 text-emerald-800 bg-emerald-50/50 rounded-t-xl"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <MapPin className="w-4 h-4" />
          3. Location-Based Supply & Availability
        </button>

        <button
          onClick={() => setActiveTab("pricing_engine")}
          className={`flex items-center gap-2 px-5 py-3.5 text-xs font-bold border-b-2 transition whitespace-nowrap ${
            activeTab === "pricing_engine"
              ? "border-emerald-700 text-emerald-800 bg-emerald-50/50 rounded-t-xl"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <Scale className="w-4 h-4" />
          4. 30% Margin Pricing Engine vs Reference Market
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: VIRTUAL STOCK (ACCEPTED & PAID OFFERS) - NEW FEATURE */}
      {/* ========================================================================= */}
      {activeTab === "virtual_stock" && (
        <div className="space-y-6">
          {/* Easy-to-Understand Explainer Card */}
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200/80 rounded-2xl p-5 space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <Warehouse className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-extrabold text-emerald-950">
                      What is Virtual Stock?
                    </h3>
                    <Badge className="bg-emerald-200 text-emerald-900 text-[10px] font-bold">
                      In-Flight Inventory
                    </Badge>
                  </div>
                  <p className="text-xs text-emerald-900/90 leading-relaxed max-w-3xl">
                    <strong>Virtual Stock</strong> represents crops committed by farmers across rural collection centers before physical warehouse delivery. It is calculated by adding <strong>Accepted Farmer Offers</strong> (price agreed) and <strong>Paid Offers</strong> (funds settled), subtracting already allocated restaurant orders.
                  </p>
                </div>
              </div>

              {/* Quick Pipeline Health Badge */}
              <div className="bg-white p-3 rounded-xl border border-emerald-200 text-xs shrink-0 space-y-1 shadow-2xs">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Fulfillment Buffer:</p>
                <p className="text-base font-black text-emerald-700">8.4 Days Supply</p>
                <p className="text-[10px] text-gray-500">Across 10 core crop categories</p>
              </div>
            </div>

            {/* Visual Step-by-Step Flow */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 pt-2 border-t border-emerald-200/60 text-xs">
              <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-100">
                <span className="text-[10px] text-gray-500 font-bold block">1. Farmer Submission</span>
                <span className="font-extrabold text-gray-900 text-sm">{(MOCK_VIRTUAL_STOCK_PIPELINE.totalSubmittedKg / 1000).toFixed(1)} T</span>
                <span className="text-[10px] text-gray-500 block">Offered by farmers</span>
              </div>
              <div className="bg-blue-50/80 p-2.5 rounded-xl border border-blue-200">
                <span className="text-[10px] text-blue-700 font-bold block">2. Offers Accepted</span>
                <span className="font-extrabold text-blue-900 text-sm">{(MOCK_VIRTUAL_STOCK_PIPELINE.totalAcceptedKg / 1000).toFixed(1)} T</span>
                <span className="text-[10px] text-blue-700 block">Committed harvest</span>
              </div>
              <div className="bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-200">
                <span className="text-[10px] text-emerald-700 font-bold block">3. Offers Paid</span>
                <span className="font-extrabold text-emerald-900 text-sm">{(MOCK_VIRTUAL_STOCK_PIPELINE.totalPaidKg / 1000).toFixed(1)} T</span>
                <span className="text-[10px] text-emerald-700 block">Secured & verified</span>
              </div>
              <div className="bg-purple-50/80 p-2.5 rounded-xl border border-purple-200">
                <span className="text-[10px] text-purple-700 font-bold block">4. Reserved for Orders</span>
                <span className="font-extrabold text-purple-900 text-sm">{(MOCK_VIRTUAL_STOCK_PIPELINE.totalAllocatedKg / 1000).toFixed(1)} T</span>
                <span className="text-[10px] text-purple-700 block">Active restaurant carts</span>
              </div>
              <div className="bg-teal-50 p-2.5 rounded-xl border border-teal-300 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-teal-800 font-bold block">5. Net Available Buffer</span>
                <span className="font-extrabold text-teal-950 text-sm">{(MOCK_VIRTUAL_STOCK_PIPELINE.netAvailableVirtualStockKg / 1000).toFixed(1)} T</span>
                <span className="text-[10px] text-teal-700 font-bold block">Ready for checkout</span>
              </div>
            </div>
          </div>

          {/* Virtual Stock Pipeline Chart */}
          <Card className="border-gray-200 shadow-sm bg-white overflow-hidden">
            <CardHeader className="border-b border-gray-100 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-emerald-600" />
                  Virtual Stock Pipeline Stages: From Farmer Submission to Available Buffer
                </CardTitle>
                <p className="text-xs text-gray-500">
                  Visualizes total tonnage (Kg) moving across each stage of the supply pipeline.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold text-gray-600 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200">
                <Info className="w-3.5 h-3.5 text-blue-600" />
                <span>85.5% Conversion from Submission to Accepted</span>
              </div>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={virtualPipelineChartData} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 11, fill: "#64748b" }}
                      tickFormatter={(v) => `${(v / 1000).toFixed(0)}T`}
                    />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: "#334155", fontWeight: "bold" }} width={140} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const d = payload[0].payload;
                          return (
                            <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1">
                              <p className="font-bold text-emerald-400">{d.name}</p>
                              <p className="text-gray-300">{d.label}</p>
                              <p className="text-sm font-black text-white">{fmtNum(d.kg)} kg ({(d.kg / 1000).toFixed(1)} Tons)</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="kg" radius={[0, 6, 6, 0]}>
                      {virtualPipelineChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Virtual Stock Per Crop Table */}
          <Card className="border-gray-200 shadow-sm bg-white overflow-hidden">
            <CardHeader className="border-b border-gray-100 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                  <Warehouse className="w-4 h-4 text-emerald-600" />
                  Virtual Stock Inventory per Crop & Fulfillment Buffer
                </CardTitle>
                <p className="text-xs text-gray-500 mt-0.5">
                  Breakdown of accepted farmer offers, paid guarantees, order reservations, and net available stock ready for restaurant purchasing.
                </p>
              </div>

              {/* Table Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200 text-xs">
                  <Search className="w-3.5 h-3.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search crop or district..."
                    value={virtualStockSearch}
                    onChange={(e) => setVirtualStockSearch(e.target.value)}
                    className="bg-transparent outline-none text-xs w-28 md:w-36 font-medium"
                  />
                </div>

                <select
                  value={virtualStockCategoryFilter}
                  onChange={(e) => setVirtualStockCategoryFilter(e.target.value)}
                  className="p-1.5 text-xs font-bold rounded-xl border border-gray-200 bg-white outline-none cursor-pointer"
                >
                  <option value="ALL">All Categories</option>
                  <option value="Vegetables">Vegetables</option>
                  <option value="Roots & Tubers">Roots & Tubers</option>
                  <option value="Meat & Poultry">Meat & Poultry</option>
                  <option value="Fruits & Bananas">Fruits & Bananas</option>
                  <option value="Grains & Pulses">Grains & Pulses</option>
                </select>
              </div>
            </CardHeader>

            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-4 px-4">Nbr</th>
                    <th className="py-4 px-4">Crop Name</th>
                    <th className="py-4 px-4">Origin / Aggregator</th>
                    <th className="py-4 px-4 text-slate-300">Submitted (kg)</th>
                    <th className="py-4 px-4 text-blue-300">Accepted Offers (kg)</th>
                    <th className="py-4 px-4 text-emerald-400">Paid Offers (kg)</th>
                    <th className="py-4 px-4 text-purple-300">Reserved for Orders</th>
                    <th className="py-4 px-4 text-amber-300 font-extrabold">Net Available Buffer</th>
                    <th className="py-4 px-4">Virtual Stock Value</th>
                    <th className="py-4 px-4">Supply Status & Advice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium text-gray-800">
                  {filteredVirtualStock.map((item, idx) => (
                    <tr
                      key={item.id}
                      className={`hover:bg-gray-50/90 transition ${
                        item.stockStatus === "CRITICAL"
                          ? "bg-rose-50/40"
                          : item.stockStatus === "LOW_BUFFER"
                          ? "bg-amber-50/30"
                          : ""
                      }`}
                    >
                      <td className="py-4 px-4 text-gray-400 font-bold">{idx + 1}</td>
                      <td className="py-4 px-4 font-extrabold text-gray-900">
                        {item.cropName}
                        <span className="block text-[10px] font-normal text-gray-500">{item.category}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-bold text-gray-800 block">{item.primaryLocation}</span>
                        <span className="text-[10px] text-gray-500">Aggregator: {item.topAggregator}</span>
                      </td>
                      <td className="py-4 px-4 text-gray-600 font-semibold">
                        {fmtNum(item.submittedKg)} kg
                      </td>
                      <td className="py-4 px-4 font-bold text-blue-700">
                        {fmtNum(item.acceptedKg)} kg
                      </td>
                      <td className="py-4 px-4 font-bold text-emerald-700">
                        {fmtNum(item.paidKg)} kg
                        <span className="block text-[10px] text-emerald-600 font-normal">
                          {Math.round((item.paidKg / item.acceptedKg) * 100)}% Paid
                        </span>
                      </td>
                      <td className="py-4 px-4 text-purple-700 font-semibold">
                        {fmtNum(item.allocatedToOrdersKg)} kg
                      </td>
                      <td className="py-4 px-4 font-black text-sm text-gray-900 bg-emerald-50/40">
                        {fmtNum(item.availableVirtualStockKg)} kg
                        <span className="block text-[10px] font-bold text-emerald-700">
                          ~{item.fulfillmentDays} Days Buffer
                        </span>
                      </td>
                      <td className="py-4 px-4 font-bold text-gray-800">
                        {fmtRwf(item.virtualStockValueRwf)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-1 max-w-[220px]">
                          <Badge
                            className={`text-[10px] font-bold ${
                              item.stockStatus === "SURPLUS"
                                ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                                : item.stockStatus === "OPTIMAL"
                                ? "bg-blue-100 text-blue-900 border-blue-300"
                                : item.stockStatus === "LOW_BUFFER"
                                ? "bg-amber-100 text-amber-900 border-amber-300"
                                : "bg-rose-100 text-rose-900 border-rose-300"
                            }`}
                          >
                            {item.stockStatus === "SURPLUS"
                              ? "✓ Healthy Surplus"
                              : item.stockStatus === "OPTIMAL"
                              ? "✓ Optimal Buffer"
                              : item.stockStatus === "LOW_BUFFER"
                              ? "⚠️ Low Stock Buffer"
                              : "⛔ Critical Deficit"}
                          </Badge>
                          <p className="text-[10px] text-gray-600 leading-snug">{item.recommendation}</p>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: AGGREGATOR ACTIVITY & BUYING CAPACITY */}
      {/* ========================================================================= */}
      {activeTab === "aggregators" && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search aggregator by name, crop, or district..."
                value={searchAggregator}
                onChange={(e) => setSearchAggregator(e.target.value)}
                className="text-xs w-full bg-transparent outline-none font-medium placeholder:text-gray-400"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-500">District:</span>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="p-1.5 text-xs font-bold rounded-lg border border-gray-200 bg-white outline-none cursor-pointer"
              >
                <option value="ALL">All Districts</option>
                <option value="Musanze">Musanze</option>
                <option value="Bugesera">Bugesera</option>
                <option value="Nyagatare">Nyagatare</option>
                <option value="Huye">Huye</option>
                <option value="Rubavu">Rubavu</option>
                <option value="Rwamagana">Rwamagana</option>
              </select>
            </div>
          </div>

          {/* Aggregators Card Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredAggregators.map((agg) => (
              <Card key={agg.id} className="border-gray-200 shadow-xs bg-white overflow-hidden space-y-4 py-5">
                <CardContent className="px-5 space-y-4">
                  {/* Top Details */}
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px] font-bold">
                          {agg.district} ({agg.province})
                        </Badge>
                        <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-amber-500" /> {agg.qualityRating}
                        </span>
                      </div>
                      <h4 className="text-base font-extrabold text-gray-900 mt-1.5">{agg.name}</h4>
                      <p className="text-xs text-gray-500 font-medium">{agg.phone}</p>
                    </div>

                    {/* Buying Permission Badge */}
                    <Badge
                      className={`text-[10px] font-bold ${
                        agg.buyingStatus === "ALLOWED_TO_BUY"
                          ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                          : agg.buyingStatus === "NEAR_LIMIT"
                          ? "bg-amber-100 text-amber-900 border-amber-300"
                          : "bg-rose-100 text-rose-900 border-rose-300"
                      }`}
                    >
                      {agg.buyingStatus === "ALLOWED_TO_BUY"
                        ? "✓ Can Buy More"
                        : agg.buyingStatus === "NEAR_LIMIT"
                        ? "⚠️ Near Quota Limit"
                        : "⛔ Quota Reached"}
                    </Badge>
                  </div>

                  {/* Buying Capacity Progress Bar */}
                  <div className="space-y-1.5 bg-gray-50 p-3 rounded-xl border border-gray-100 text-xs">
                    <div className="flex justify-between font-semibold">
                      <span className="text-gray-600">Monthly Buying Quota:</span>
                      <span className="font-bold text-gray-900">
                        {fmtNum(agg.currentBoughtKg)} / {fmtNum(agg.monthlyCapacityKg)} kg
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          agg.capacityUtilizationPct >= 95
                            ? "bg-rose-600"
                            : agg.capacityUtilizationPct >= 75
                            ? "bg-amber-500"
                            : "bg-emerald-600"
                        }`}
                        style={{ width: `${agg.capacityUtilizationPct}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-gray-500 pt-0.5">
                      <span>{agg.capacityUtilizationPct}% Utilized</span>
                      <span>{fmtNum(agg.monthlyCapacityKg - agg.currentBoughtKg)} kg Remaining</span>
                    </div>
                  </div>

                  {/* Farmers & Crops */}
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Farmers in Network:</span>
                      <span className="font-extrabold text-gray-900">{agg.activeFarmersCount} Active Farmers</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-gray-500 text-[11px]">Primary Crops Managed:</span>
                      <div className="flex flex-wrap gap-1">
                        {agg.primaryCrops.map((crop) => (
                          <span key={crop} className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[10px] font-semibold">
                            {crop}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="pt-2 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-[11px] text-gray-500">Direct Sourcing Route</span>
                    <Button size="sm" variant="outline" className="text-xs h-7 px-3 border-emerald-300 text-emerald-800 hover:bg-emerald-50">
                      Manage Sourcing
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: LOCATION-BASED SUPPLY & AVAILABILITY */}
      {/* ========================================================================= */}
      {activeTab === "locations" && (
        <div className="space-y-6">
          {/* Comparison Graph: Submissions vs Offers Accepted */}
          <Card className="border-gray-200 shadow-sm bg-white overflow-hidden">
            <CardHeader className="border-b border-gray-100 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-emerald-600" />
                  Regional Supply Comparison: Farmer Submissions vs Accepted Offers
                </CardTitle>
                <p className="text-xs text-gray-500">
                  Identifies regions with high submissions vs lower offer conversion (indicates price rejection or logistics bottleneck).
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-semibold">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-blue-600 inline-block" />
                  <span className="text-gray-700">Submissions (kg)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block" />
                  <span className="text-gray-700">Offer Acceptance %</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={MOCK_LOCATION_SUPPLY_METRICS}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="district" tick={{ fontSize: 11, fill: "#64748b" }} />
                    <YAxis
                      yAxisId="left"
                      tick={{ fontSize: 11, fill: "#64748b" }}
                      tickFormatter={(v) => `${(v / 1000).toFixed(0)}T`}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      domain={[0, 100]}
                      tick={{ fontSize: 11, fill: "#059669" }}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const d = payload[0].payload as LocationSupplyMetric;
                          return (
                            <div className="bg-slate-900 text-white p-3.5 rounded-xl shadow-xl text-xs space-y-1.5 min-w-[210px]">
                              <p className="font-bold text-sm text-emerald-400 border-b border-slate-800 pb-1">
                                {label} ({d.province})
                              </p>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Total Submissions:</span>
                                <span className="font-bold text-blue-400">{fmtNum(d.totalFarmerSubmissionsKg)} kg</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Farmer Submissions:</span>
                                <span className="font-bold">{d.farmerSubmissionsCount} submissions</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Offers Accepted:</span>
                                <span className="font-bold text-emerald-400">
                                  {d.offersAcceptedCount} ({d.offerAcceptanceRatePct}%)
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Active Aggregators:</span>
                                <span className="font-bold text-purple-400">{d.aggregatorsActive}</span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar yAxisId="left" dataKey="totalFarmerSubmissionsKg" name="Submissions (kg)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="right" dataKey="offerAcceptanceRatePct" name="Acceptance Rate (%)" fill="#059669" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* District Supply Cards & Crop Availability Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {MOCK_LOCATION_SUPPLY_METRICS.map((loc) => (
              <div
                key={loc.district}
                className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3.5 hover:shadow-sm transition"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-base font-extrabold text-gray-900">{loc.district}</h4>
                    <p className="text-xs text-gray-500 font-medium">{loc.province}</p>
                  </div>

                  <Badge
                    className={`text-[10px] font-bold ${
                      loc.offerAcceptanceRatePct >= 85
                        ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                        : loc.offerAcceptanceRatePct >= 70
                        ? "bg-amber-100 text-amber-800 border-amber-200"
                        : "bg-rose-100 text-rose-800 border-rose-200"
                    }`}
                  >
                    {loc.offerAcceptanceRatePct}% Accepted
                  </Badge>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                  <div>
                    <p className="text-[10px] text-gray-500">Volume</p>
                    <p className="text-sm font-black text-gray-900">{fmtNum(loc.totalFarmerSubmissionsKg)} kg</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500">Aggregators</p>
                    <p className="text-sm font-black text-gray-900">{loc.aggregatorsActive} Active</p>
                  </div>
                </div>

                {/* Crop Availability */}
                <div className="space-y-1.5 text-xs">
                  <div>
                    <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Abundant Crops:
                    </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {loc.abundantCrops.map((c) => (
                        <span key={c} className="bg-emerald-50 text-emerald-800 border border-emerald-200/60 px-2 py-0.5 rounded text-[10px] font-semibold">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-1">
                    <span className="text-[11px] font-bold text-rose-700 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-rose-600" /> Scarce in Region:
                    </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {loc.scarceCrops.map((c) => (
                        <span key={c} className="bg-rose-50 text-rose-800 border border-rose-200/60 px-2 py-0.5 rounded text-[10px] font-semibold">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Location Recommendation */}
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-[11px] text-gray-600 leading-snug">
                    <span className="font-bold text-gray-800">Recommendation:</span> {loc.recommendation}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: 30% MARGIN PRICING ENGINE VS REFERENCE MARKET */}
      {/* ========================================================================= */}
      {activeTab === "pricing_engine" && (
        <div className="space-y-6">
          {/* Formula Explanation Banner */}
          <div className="bg-gradient-to-r from-emerald-900 to-green-800 text-white rounded-2xl p-6 shadow-sm space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-400/30">
                  <Scale className="w-3.5 h-3.5" />
                  Formula: Our Selling Price = Farmer Purchase Price + 30% Margin Profit
                </div>
                <h3 className="text-xl font-bold">Dynamic Margin Engine vs Reference Market Benchmark</h3>
                <p className="text-xs text-emerald-100/80 max-w-3xl leading-relaxed">
                  FoodBundles standard pricing applies a 30% profit margin directly over the farmer acquisition price. If our selling price is greater than the reference market selling price, an immediate recommendation is generated to optimize purchasing or adjust pricing.
                </p>
              </div>

              <div className="bg-slate-900/80 p-3 rounded-2xl border border-white/10 text-right shrink-0">
                <p className="text-[11px] text-gray-300 font-medium">Current Reference Market:</p>
                <p className="text-base font-black text-emerald-400">
                  {REFERENCE_MARKETS.find((m) => m.id === selectedReferenceMarket)?.name || selectedReferenceMarket}
                </p>
              </div>
            </div>
          </div>

          {/* Pricing Engine Table */}
          <Card className="border-gray-200 shadow-sm bg-white overflow-hidden">
            <CardHeader className="border-b border-gray-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-sm font-extrabold text-gray-900">
                  30% Profit Margin Benchmark Table
                </CardTitle>
                <p className="text-xs text-gray-500">
                  Real-time comparison between Farmer Purchase Price, Our 30% Selling Price, and Reference Market Price.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-500">Switch Reference Market:</span>
                <select
                  value={selectedReferenceMarket}
                  onChange={(e) => setSelectedReferenceMarket(e.target.value)}
                  className="p-1.5 text-xs font-bold rounded-lg border border-gray-200 bg-white outline-none cursor-pointer"
                >
                  {REFERENCE_MARKETS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
            </CardHeader>

            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3.5 px-4">Nbr</th>
                    <th className="py-3.5 px-4">Item / Crop Name</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Farmer Purchase Price</th>
                    <th className="py-3.5 px-4">30% Margin Profit</th>
                    <th className="py-3.5 px-4">Our Selling Price (RWF)</th>
                    <th className="py-3.5 px-4">{selectedReferenceMarket} Market Price</th>
                    <th className="py-3.5 px-4">Price Difference vs Market</th>
                    <th className="py-3.5 px-4">Intelligence Recommendation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium text-gray-800">
                  {pricingEngineRows.map((row, idx) => (
                    <tr
                      key={row.id}
                      className={`hover:bg-gray-50/80 transition ${
                        row.isOverpriced ? "bg-amber-50/40" : ""
                      }`}
                    >
                      <td className="py-3.5 px-4 text-gray-400 font-bold">{idx + 1}</td>
                      <td className="py-3.5 px-4 font-bold text-gray-900">
                        {row.productName}
                        <span className="block text-[10px] font-normal text-gray-500">Per {row.unit}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[10px] font-semibold">
                          {row.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-gray-700">
                        {fmtRwf(row.farmerPurchasePrice)}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-emerald-700">
                        +{fmtRwf(row.marginAmount)} <span className="text-[10px] text-emerald-600 font-bold">(30%)</span>
                      </td>
                      <td className="py-3.5 px-4 font-black text-gray-900 text-sm">
                        {fmtRwf(row.ourCalculatedPrice)}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-gray-700">
                        {fmtRwf(row.refMarketPrice)}
                      </td>
                      <td className="py-3.5 px-4">
                        {row.priceDifference < 0 ? (
                          <span className="font-extrabold text-emerald-700 flex items-center gap-1">
                            <TrendingDown className="w-3.5 h-3.5" />
                            {fmtRwf(Math.abs(row.priceDifference))} cheaper ({Math.abs(row.priceDifferencePct)}%)
                          </span>
                        ) : row.priceDifference > 0 ? (
                          <span className="font-extrabold text-rose-700 flex items-center gap-1">
                            <TrendingUp className="w-3.5 h-3.5" />
                            +{fmtRwf(row.priceDifference)} higher (+{row.priceDifferencePct}%)
                          </span>
                        ) : (
                          <span className="font-bold text-gray-600">Equal (0%)</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {row.isOverpriced ? (
                          <div className="space-y-1">
                            <Badge className="bg-rose-100 text-rose-900 border-rose-300 font-bold text-[10px]">
                              ⚠️ Overpriced vs {selectedReferenceMarket}
                            </Badge>
                            <p className="text-[10px] text-rose-800 font-semibold leading-tight">
                              Recommendation: Renegotiate farmer purchase price below {fmtRwf(Math.round(row.refMarketPrice / 1.3))} to keep 30% margin.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <Badge className="bg-emerald-100 text-emerald-900 border-emerald-300 font-bold text-[10px]">
                              ✓ Highly Competitive
                            </Badge>
                            <p className="text-[10px] text-emerald-700 font-medium leading-tight">
                              Optimal price. Secure higher volume from aggregators.
                            </p>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
