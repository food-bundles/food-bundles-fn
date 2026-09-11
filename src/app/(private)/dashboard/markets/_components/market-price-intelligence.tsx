"use client";

import { useState } from "react";
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
} from "lucide-react";
import { MOCK_MINAGRI_BENCHMARKS } from "@/app/services/minagriMockData";
import type { TimeframePeriod } from "@/types/minagri-intelligence";

const PRICE_ALERTS = [
  { id: 1, item: "Cooking Oil", change: 12, trend: "up" as const, message: "MINAGRI reference price for Cooking Oil increased 12% today", time: "2h ago", severity: "high" },
  { id: 2, item: "Chicken", change: -5, trend: "down" as const, message: "Chicken dropped 5% below MINAGRI market baseline", time: "4h ago", severity: "info" },
  { id: 3, item: "Tomatoes", change: 8, trend: "up" as const, message: "Tomatoes up 8% across Kimironko & Nyabugogo", time: "1d ago", severity: "medium" },
];

const fmt = (n: number) => `RWF ${Math.round(n).toLocaleString("en-RW")}`;

export default function MarketPriceIntelligence() {
  const [timeframe, setTimeframe] = useState<TimeframePeriod>("today");
  const [selectedRegion, setSelectedRegion] = useState<string>("ALL");

  const filteredBenchmarks = MOCK_MINAGRI_BENCHMARKS.filter(
    (b) => selectedRegion === "ALL" || b.region === selectedRegion
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            MINAGRI Official Daily API & Benchmark Synchronization
          </div>
          <h2 className="text-xl font-bold">Market Price Intelligence & Reference Comparisons</h2>
          <p className="text-xs text-gray-300">
            Distinguishes official MINAGRI reference market prices from FoodBundles platform transaction quotes.
          </p>
        </div>

        <div className="flex items-center gap-2 z-10">
          <div className="bg-slate-800 p-2.5 rounded-xl border border-slate-700 text-xs text-right">
            <p className="text-gray-400 font-medium">Daily API Freshness</p>
            <p className="text-emerald-400 font-bold flex items-center gap-1.5 justify-end">
              <CheckCircle2 className="w-3.5 h-3.5" /> Synced Today 08:30 AM
            </p>
          </div>
        </div>
      </div>

      {/* Timeframe & Multi-View Selector Bar (Section 8 Requirement) */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl overflow-x-auto">
          {[
            ["today", "Today's Live API"],
            ["7d", "7-Day Trend"],
            ["30d", "30-Day Moving Avg"],
            ["seasonal", "Seasonal / YoY"],
            ["comparison", "Market Comparison"],
          ].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setTimeframe(val as TimeframePeriod)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition whitespace-nowrap ${
                timeframe === val ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-500">Region:</span>
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="p-1.5 text-xs font-bold rounded-lg border border-gray-200 bg-white outline-none"
          >
            <option value="ALL">All Regions</option>
            <option value="Kigali">Kigali City</option>
            <option value="Northern">Northern Province</option>
            <option value="Southern">Southern Province</option>
            <option value="Eastern">Eastern Province</option>
            <option value="Western">Western Province</option>
          </select>
        </div>
      </div>

      {/* MINAGRI Benchmark vs Platform Offer Price Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBenchmarks.map((b) => {
          const delta = b.minagriReferencePrice - b.platformPrice;
          const savingsPct = Math.round((delta / b.minagriReferencePrice) * 100);

          return (
            <div key={b.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    {b.marketName} ({b.region})
                  </span>
                  <h3 className="text-base font-bold text-gray-900 mt-1">{b.productName}</h3>
                </div>

                <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                  {b.freshnessStatus}
                </span>
              </div>

              {/* Side by Side Price Box */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <p className="text-gray-500 font-medium">MINAGRI Benchmark</p>
                  <p className="text-base font-black text-gray-900 mt-0.5">{fmt(b.minagriReferencePrice)}</p>
                  <p className="text-[10px] text-gray-400">/{b.unit} official ref</p>
                </div>

                <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                  <p className="text-emerald-700 font-semibold">FoodBundles Price</p>
                  <p className="text-base font-black text-emerald-900 mt-0.5">{fmt(b.platformPrice)}</p>
                  <p className="text-[10px] text-emerald-700 font-bold">
                    {delta >= 0 ? `${savingsPct}% Below Market` : `${Math.abs(savingsPct)}% Premium`}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-100">
                <span className="text-gray-500">30d Volatility:</span>
                <span className="font-bold text-gray-900">{b.volatility} ({b.priceChange30d > 0 ? `+${b.priceChange30d}%` : `${b.priceChange30d}%`})</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Market Price Alerts */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <Bell className="w-4 h-4 text-emerald-600" />
          Real-Time MINAGRI Price Shift Alerts
        </h3>
        <div className="space-y-2">
          {PRICE_ALERTS.map((a) => (
            <div key={a.id} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between text-xs">
              <span className="font-semibold text-gray-800">{a.message}</span>
              <span className="text-gray-400">{a.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
