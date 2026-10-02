"use client";

import { useState, useMemo } from "react";
import {
  Bell,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
  Minus,
  User,
  Clock,
  Building2,
  CheckCircle2,
  Sparkles,
  Calendar,
  Layers,
  Search,
  Filter,
  Scale,
  DollarSign,
  ArrowUpRight,
  LineChart as LineChartIcon,
  Table as TableIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  MOCK_MARKET_BENCHMARK_TABLE,
  REFERENCE_MARKETS,
  MarketPriceComparisonItem,
} from "@/app/services/predictiveIntelligenceData";

const fmtRwf = (n: number) => `RWF ${Math.round(n).toLocaleString("en-RW")}`;

export default function MarketPriceIntelligence() {
  const [selectedReferenceMarket, setSelectedReferenceMarket] = useState<string>("Kimironko");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedProductForTrend, setSelectedProductForTrend] = useState<string>("item-1");

  // Filter products
  const filteredProducts = useMemo(() => {
    return MOCK_MARKET_BENCHMARK_TABLE.filter((p) => {
      const matchesCategory = selectedCategory === "ALL" || p.category === selectedCategory;
      const matchesSearch =
        p.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Selected product trend
  const productForTrend = useMemo(() => {
    return MOCK_MARKET_BENCHMARK_TABLE.find((p) => p.id === selectedProductForTrend) || MOCK_MARKET_BENCHMARK_TABLE[0];
  }, [selectedProductForTrend]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-gray-200 text-gray-900 p-6 md:p-8 rounded-3xl shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Market Price Intelligence & 30% Margin Analytics
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Market Trends, Regional Benchmarks & Profit Margins</h2>
          <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
            Compare farmer acquisition costs against our 30% standard selling price and live regional reference markets (Kimironko, Nyabugogo, Musanze, Mahoko, Huye, Rwamagana).
          </p>
        </div>

        {/* Global Reference Market Selector */}
        <div className="z-10 bg-gray-50 p-3.5 rounded-2xl border border-gray-200 space-y-1 shrink-0">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Active Reference Market:</p>
          <select
            value={selectedReferenceMarket}
            onChange={(e) => setSelectedReferenceMarket(e.target.value)}
            className="w-full p-2 text-xs font-bold rounded-xl border border-gray-200 bg-white text-gray-900 outline-none cursor-pointer shadow-xs focus:ring-2 focus:ring-emerald-500"
          >
            {REFERENCE_MARKETS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Interactive Price Trends Chart */}
      <Card className="border-gray-200 shadow-sm bg-white overflow-hidden">
        <CardHeader className="border-b border-gray-100 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
                <LineChartIcon className="w-4 h-4 text-emerald-600" />
                Price Trends Across Regional Markets vs Our 30% Selling Price
              </CardTitle>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Select any item to compare historical price movements between our selling price and regional reference markets.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500">Select Item:</span>
            <select
              value={selectedProductForTrend}
              onChange={(e) => setSelectedProductForTrend(e.target.value)}
              className="p-1.5 text-xs font-bold rounded-lg border border-gray-200 bg-white outline-none cursor-pointer"
            >
              {MOCK_MARKET_BENCHMARK_TABLE.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.productName}
                </option>
              ))}
            </select>
          </div>
        </CardHeader>

        <CardContent className="p-4 md:p-6">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={productForTrend.historicalTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis domain={["auto", "auto"]} tick={{ fontSize: 11, fill: "#64748b" }} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 text-white p-3.5 rounded-xl shadow-xl text-xs space-y-1.5 min-w-[210px]">
                          <p className="font-bold text-sm text-emerald-400 border-b border-slate-800 pb-1">
                            {productForTrend.productName} ({label})
                          </p>
                          {payload.map((p) => (
                            <div key={p.name} className="flex justify-between">
                              <span className="text-gray-400">{p.name}:</span>
                              <span className="font-bold" style={{ color: p.color }}>
                                {fmtRwf(Number(p.value))}
                              </span>
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                <Line
                  type="monotone"
                  dataKey="ourPrice"
                  name="Our Selling Price (30% Margin)"
                  stroke="#059669"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#059669" }}
                />
                <Line type="monotone" dataKey="kimironko" name="Kimironko Market" stroke="#2563eb" strokeWidth={1.8} />
                <Line type="monotone" dataKey="nyabugogo" name="Nyabugogo Market" stroke="#9333ea" strokeWidth={1.8} />
                <Line type="monotone" dataKey="musanze" name="Musanze Market" stroke="#f59e0b" strokeWidth={1.8} />
                <Line type="monotone" dataKey="mahoko" name="Mahoko Market" stroke="#ec4899" strokeWidth={1.8} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* ========================================================================= */}
      {/* THE REQUESTED TABLE: ITEMS, PURCHASE PRICES, SELLING PRICES, 30% MARGIN */}
      {/* ========================================================================= */}
      <Card className="border-gray-200 shadow-sm bg-white overflow-hidden">
        <CardHeader className="border-b border-gray-100 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-base font-extrabold text-gray-900 flex items-center gap-2">
              <TableIcon className="w-4 h-4 text-emerald-600" />
              Item Pricing, Purchase Cost, 30% Profit Margin & Market Benchmarks
            </CardTitle>
            <p className="text-xs text-gray-500 mt-0.5">
              Real-time calculation showing: Purchase Price + 30% Margin = Our Selling Price vs {selectedReferenceMarket} Market Price.
            </p>
          </div>

          {/* Table Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200 text-xs">
              <Search className="w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent outline-none text-xs w-28 md:w-36 font-medium"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
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
          </div>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white font-bold uppercase tracking-wider text-[10px]">
                <th className="py-4 px-4">Nbr</th>
                <th className="py-4 px-4">Item / Crop Name</th>
                <th className="py-4 px-4">Category</th>
                <th className="py-4 px-4 text-slate-300">Farmer Purchase Price</th>
                <th className="py-4 px-4 text-emerald-400">30% Profit Margin</th>
                <th className="py-4 px-4 text-amber-300">Our Selling Price (30%)</th>
                <th className="py-4 px-4">{selectedReferenceMarket} Market Price</th>
                <th className="py-4 px-4">Price Difference</th>
                <th className="py-4 px-4">Intelligence Recommendation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-800">
              {filteredProducts.map((item, idx) => {
                const refMarketPrice = item.marketPrices[selectedReferenceMarket] || 1000;
                const ourSellingPrice = Math.round(item.farmerPurchasePrice * 1.30);
                const marginProfit = ourSellingPrice - item.farmerPurchasePrice;
                const priceDiff = ourSellingPrice - refMarketPrice;
                const priceDiffPct = Number(((priceDiff / refMarketPrice) * 100).toFixed(1));
                const isOverpriced = ourSellingPrice > refMarketPrice;
                const isSignificantlyCheaper = priceDiff < -150;

                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-gray-50/90 transition ${
                      isOverpriced ? "bg-rose-50/30" : isSignificantlyCheaper ? "bg-emerald-50/20" : ""
                    }`}
                  >
                    <td className="py-4 px-4 text-gray-400 font-bold">{idx + 1}</td>
                    <td className="py-4 px-4 font-extrabold text-gray-900">
                      {item.productName}
                      <span className="block text-[10px] font-normal text-gray-500">Per {item.unit}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[10px] font-semibold">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-bold text-gray-700">
                      {fmtRwf(item.farmerPurchasePrice)}
                    </td>
                    <td className="py-4 px-4 font-bold text-emerald-700">
                      +{fmtRwf(marginProfit)}
                      <span className="block text-[10px] text-emerald-600 font-bold">(30.0%)</span>
                    </td>
                    <td className="py-4 px-4 font-black text-emerald-950 text-sm bg-emerald-50/50">
                      {fmtRwf(ourSellingPrice)}
                    </td>
                    <td className="py-4 px-4 font-bold text-gray-800">
                      {fmtRwf(refMarketPrice)}
                      <span className="block text-[10px] text-gray-400 font-normal">{selectedReferenceMarket}</span>
                    </td>
                    <td className="py-4 px-4">
                      {priceDiff < 0 ? (
                        <span className="font-extrabold text-emerald-700 flex items-center gap-1">
                          <TrendingDown className="w-3.5 h-3.5" />
                          {fmtRwf(Math.abs(priceDiff))} cheaper ({Math.abs(priceDiffPct)}%)
                        </span>
                      ) : priceDiff > 0 ? (
                        <span className="font-extrabold text-rose-700 flex items-center gap-1">
                          <TrendingUp className="w-3.5 h-3.5" />
                          +{fmtRwf(priceDiff)} higher (+{priceDiffPct}%)
                        </span>
                      ) : (
                        <span className="font-bold text-gray-600">Equal (0%)</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {isOverpriced ? (
                        <div className="space-y-1 max-w-[220px]">
                          <Badge className="bg-rose-100 text-rose-900 border-rose-300 font-bold text-[10px]">
                            ⚠️ Overpriced vs {selectedReferenceMarket}
                          </Badge>
                          <p className="text-[10px] text-rose-800 font-medium leading-tight">
                            Reduce farmer purchase price to ≤ {fmtRwf(Math.round(refMarketPrice / 1.30))} or trim margin to match {selectedReferenceMarket}.
                          </p>
                        </div>
                      ) : isSignificantlyCheaper ? (
                        <div className="space-y-1 max-w-[220px]">
                          <Badge className="bg-emerald-100 text-emerald-900 border-emerald-300 font-bold text-[10px]">
                            ✓ High Competitive Advantage
                          </Badge>
                          <p className="text-[10px] text-emerald-700 font-medium leading-tight">
                            Strong price lead ({Math.abs(priceDiffPct)}% below market). Opportunity to increase purchase volume.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-1 max-w-[220px]">
                          <Badge className="bg-blue-100 text-blue-900 border-blue-300 font-bold text-[10px]">
                            ✓ Optimal Margin (30%)
                          </Badge>
                          <p className="text-[10px] text-gray-600 font-medium leading-tight">
                            Balanced price point for restaurants and buyers.
                          </p>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Multi-Market Regional Price Matrix */}
      <Card className="border-gray-200 shadow-sm bg-white overflow-hidden">
        <CardHeader className="border-b border-gray-100 pb-3">
          <CardTitle className="text-sm font-extrabold text-gray-900">
            Multi-Market Regional Price Matrix (All Markets Comparison)
          </CardTitle>
          <p className="text-xs text-gray-500">
            Live selling price comparison across all 6 monitoring markets in Rwanda against Our 30% Selling Price.
          </p>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Item</th>
                <th className="py-3 px-4 text-emerald-700">Our 30% Price</th>
                <th className="py-3 px-4">Kimironko</th>
                <th className="py-3 px-4">Nyabugogo</th>
                <th className="py-3 px-4">Musanze</th>
                <th className="py-3 px-4">Mahoko</th>
                <th className="py-3 px-4">Huye</th>
                <th className="py-3 px-4">Rwamagana</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {filteredProducts.map((item) => {
                const ourPrice = Math.round(item.farmerPurchasePrice * 1.30);
                return (
                  <tr key={item.id} className="hover:bg-gray-50/70 transition">
                    <td className="py-3 px-4 font-bold text-gray-900">{item.productName}</td>
                    <td className="py-3 px-4 font-black text-emerald-800 bg-emerald-50/60">{fmtRwf(ourPrice)}</td>
                    <td className="py-3 px-4">{fmtRwf(item.marketPrices.Kimironko)}</td>
                    <td className="py-3 px-4">{fmtRwf(item.marketPrices.Nyabugogo)}</td>
                    <td className="py-3 px-4">{fmtRwf(item.marketPrices.Musanze)}</td>
                    <td className="py-3 px-4">{fmtRwf(item.marketPrices.Mahoko)}</td>
                    <td className="py-3 px-4">{fmtRwf(item.marketPrices.Huye)}</td>
                    <td className="py-3 px-4">{fmtRwf(item.marketPrices.Rwamagana)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
