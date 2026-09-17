"use client";

import { TrendingUp, Sparkles, CheckCircle2 } from "lucide-react";
import MarketPriceIntelligence from "../markets/_components/market-price-intelligence";

export default function MarketPriceIntelligencePage() {
  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-green-900 text-white p-6 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-green-700/20 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-1 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-800/80 border border-green-700 text-green-200 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            MINAGRI Official Daily API & Benchmark Synchronization
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Market Price Intelligence
          </h1>
          <p className="text-green-100/80 text-sm max-w-2xl">
            Distinguishes official MINAGRI reference market prices from FoodBundles platform transaction quotes.
          </p>
        </div>

        <div className="flex items-center gap-2 z-10">
          <div className="bg-green-800 p-2.5 rounded-xl border border-green-700 text-xs text-right">
            <p className="text-green-300 font-medium">Daily API Freshness</p>
            <p className="text-emerald-300 font-bold flex items-center gap-1.5 justify-end">
              <CheckCircle2 className="w-3.5 h-3.5" /> Synced Today 08:30 AM
            </p>
          </div>
        </div>
      </div>

      {/* Intelligence Content */}
      <MarketPriceIntelligence />
    </div>
  );
}
