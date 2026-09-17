"use client";

import { useState } from "react";
import {
  Sprout,
  TrendingUp,
  Store,
  Calendar,
  Users,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  Info,
  Clock,
  Package,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MOCK_FARMER_DEMAND_SIGNALS,
  MOCK_MINAGRI_BENCHMARKS,
  MOCK_TRACEABILITY_BATCHES,
} from "@/app/services/minagriMockData";

const fmt = (n: number) => `RWF ${Math.round(n).toLocaleString("en-RW")}`;

export default function FarmerDemandSignalsPage() {
  const [activeTab, setActiveTab] = useState<"signals" | "market_prices" | "batches">("signals");

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-green-900 text-white p-6 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-green-700/20 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-1 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-800/80 border border-green-700 text-green-200 text-xs font-semibold">
            <Sprout className="w-3.5 h-3.5" />
            Demand-Driven Production & Market Visibility Portal
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Farmer Demand Signals & Market Reference
          </h1>
          <p className="text-green-100/80 text-sm max-w-2xl">
            Access transparent MINAGRI reference prices, explore aggregated restaurant demand forecasts, and plant crops with guaranteed off-take visibility.
          </p>
        </div>

        <div className="flex items-center gap-3 z-10">
          <div className="bg-green-800/80 border border-green-700 p-3 rounded-xl text-right">
            <p className="text-xs text-green-200 font-medium">Contracted Buyers</p>
            <p className="text-lg font-black text-white">129 Verified Businesses</p>
          </div>
        </div>
      </div>

      {/* Top Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="py-4 shadow-xs border-gray-200">
          <CardContent className="px-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Demand Growth Trend</p>
              <p className="text-2xl font-extrabold text-green-700 mt-1">+18.2% Q4</p>
              <p className="text-xs text-green-600 mt-0.5 font-medium">Horticulture & Tubers demand</p>
            </div>
            <div className="w-12 h-12 bg-green-50 text-green-700 rounded-xl flex items-center justify-center border border-green-100">
              <TrendingUp className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="py-4 shadow-xs border-gray-200">
          <CardContent className="px-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Aggregated Monthly Need</p>
              <p className="text-2xl font-extrabold text-gray-900 mt-1">87,500 kg</p>
              <p className="text-xs text-gray-500 mt-0.5 font-medium">Kigali restaurant orders</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100">
              <Users className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="py-4 shadow-xs border-gray-200">
          <CardContent className="px-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Farm-Gate Sell-Through</p>
              <p className="text-2xl font-extrabold text-green-800 mt-1">94.6%</p>
              <p className="text-xs text-green-600 mt-0.5 font-medium">Reduced post-harvest waste</p>
            </div>
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center border border-purple-100">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="py-4 shadow-xs border-gray-200">
          <CardContent className="px-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">MINAGRI Fresh Data</p>
              <p className="text-2xl font-extrabold text-gray-900 mt-1">12 Markets</p>
              <p className="text-xs text-gray-500 mt-0.5 font-medium">Updated today 08:30 AM</p>
            </div>
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center border border-amber-100">
              <Store className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto gap-2 bg-white px-4 pt-3 rounded-t-xl shadow-xs">
        <button
          onClick={() => setActiveTab("signals")}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition ${
            activeTab === "signals"
              ? "border-green-700 text-green-800"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <Sprout className="w-4 h-4" />
          Crop Production & Planting Signals (7.2)
        </button>

        <button
          onClick={() => setActiveTab("market_prices")}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition ${
            activeTab === "market_prices"
              ? "border-green-700 text-green-800"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <Store className="w-4 h-4" />
          MINAGRI Reference Market Prices (7.1)
        </button>

        <button
          onClick={() => setActiveTab("batches")}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition ${
            activeTab === "batches"
              ? "border-green-700 text-green-800"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <Package className="w-4 h-4" />
          Harvest Batch Provenance & Off-take (7.3)
        </button>
      </div>

      {/* Tab 1: Planting Signals */}
      {activeTab === "signals" && (
        <div className="space-y-4">
          <Card className="py-5 shadow-xs border-gray-200">
            <CardContent className="px-5">
              <h3 className="text-base font-bold text-gray-900">Demand-Driven Production Signals for Farmers</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Non-binding crop planting guidance derived from consolidated, anonymized restaurant purchasing contracts.
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {MOCK_FARMER_DEMAND_SIGNALS.map((sig) => (
              <Card key={sig.id} className="py-5 shadow-xs border-gray-200">
                <CardContent className="px-5 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <Badge className="bg-green-50 text-green-800 border-green-200 font-bold text-[10px]">
                        {sig.region}
                      </Badge>
                      <h4 className="text-lg font-extrabold text-gray-900 mt-1">{sig.cropName}</h4>
                    </div>
                    <Badge className="bg-green-100 text-green-800 font-bold">
                      {sig.demandGrowthTrend} Demand
                    </Badge>
                  </div>

                  <div className="space-y-2 text-xs bg-gray-50 p-3.5 rounded-xl border border-gray-100 font-medium">
                    <div className="flex justify-between text-gray-600">
                      <span>Target Delivery Window:</span>
                      <span className="font-bold text-gray-900">{sig.targetMonth}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Aggregated Monthly Demand:</span>
                      <span className="font-bold text-green-800 font-mono">{sig.aggregatedMonthlyDemandKg.toLocaleString()} kg</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>MINAGRI Benchmark Price:</span>
                      <span className="font-bold text-gray-900 font-mono">{fmt(sig.minagriBenchmarkPrice)}/kg</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Expected Farm-Gate Price:</span>
                      <span className="font-extrabold text-green-900 font-mono">{fmt(sig.expectedFarmGatePrice)}/kg</span>
                    </div>
                  </div>

                  <div className="p-3 bg-green-50/60 rounded-xl border border-green-100 text-xs space-y-1">
                    <p className="text-green-900 font-bold flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      Recommended Planting Window:
                    </p>
                    <p className="text-green-800 font-medium">{sig.recommendedPlantingWindow}</p>
                  </div>

                  <Button variant="green" size="sm" className="w-full font-bold text-xs">
                    Commit Harvest Pre-Order ({sig.contractedBuyersCount} Buyers Ready)
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: MINAGRI Reference Market Prices */}
      {activeTab === "market_prices" && (
        <div className="space-y-4">
          <Card className="py-5 shadow-xs border-gray-200">
            <CardContent className="px-5">
              <h3 className="text-base font-bold text-gray-900">Fair Market Price Reference Table</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Transparent baseline prices gathered from MINAGRI daily API feeds across major regional agricultural markets.
              </p>
            </CardContent>
          </Card>

          <Card className="py-0 border-gray-200 overflow-hidden shadow-xs">
            <CardContent className="px-0 py-0">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-5">Product Name</th>
                    <th className="py-3 px-5">Market & Region</th>
                    <th className="py-3 px-5 text-right">MINAGRI Benchmark</th>
                    <th className="py-3 px-5 text-right">Est. Farm-Gate Price</th>
                    <th className="py-3 px-5 text-center">Data Freshness</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {MOCK_MINAGRI_BENCHMARKS.map((m) => (
                    <tr key={m.id} className="hover:bg-gray-50/50">
                      <td className="py-3 px-5 font-bold text-gray-900">{m.productName}</td>
                      <td className="py-3 px-5 text-gray-600">{m.marketName} ({m.region})</td>
                      <td className="py-3 px-5 text-right font-mono font-bold text-gray-900">{fmt(m.minagriReferencePrice)}/{m.unit}</td>
                      <td className="py-3 px-5 text-right font-mono font-bold text-green-700">{fmt(Math.round(m.minagriReferencePrice * 0.82))}/{m.unit}</td>
                      <td className="py-3 px-5 text-center">
                        <Badge className="bg-green-50 text-green-700 border-green-200 font-bold text-[10px]">
                          {m.freshnessStatus}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 3: Harvest Batch Provenance */}
      {activeTab === "batches" && (
        <div className="space-y-4">
          <Card className="py-5 shadow-xs border-gray-200">
            <CardContent className="px-5">
              <h3 className="text-base font-bold text-gray-900">Verifiable Harvest Batches & Provenance</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Verified supply chain tracking for farmer produce connected directly to restaurant buyers.
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MOCK_TRACEABILITY_BATCHES.map((b) => (
              <Card key={b.batchId} className="py-5 shadow-xs border-gray-200">
                <CardContent className="px-5 space-y-3">
                  <div className="flex justify-between items-start border-b border-gray-100 pb-3">
                    <div>
                      <span className="text-xs font-mono font-bold text-green-800">{b.batchId}</span>
                      <h4 className="text-base font-bold text-gray-900 mt-0.5">{b.productName}</h4>
                    </div>
                    <Badge className="bg-green-50 text-green-700 border-green-200 font-bold">
                      {b.certification}
                    </Badge>
                  </div>

                  <div className="space-y-1.5 text-xs text-gray-600">
                    <p><strong>Origin Farm:</strong> {b.originFarm} ({b.district})</p>
                    <p><strong>Harvest Timestamp:</strong> {b.harvestDate}</p>
                    <p><strong>Quality Grade:</strong> <strong className="text-green-700">{b.qualityGrade}</strong></p>
                    <p className="text-[11px] text-gray-500 font-mono bg-gray-50 p-2 rounded">
                      Cold Chain Log: {b.temperatureLogs}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
