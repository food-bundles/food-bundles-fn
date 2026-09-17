"use client";

import { useState } from "react";
import {
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Sparkles,
  BarChart3,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ShieldAlert,
  Zap,
  Info,
  Calendar,
  Layers,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MOCK_PRICE_FORECASTS,
  MOCK_DEMAND_FORECASTS,
  MOCK_RECOMMENDATIONS,
  MOCK_ANOMALIES,
} from "@/app/services/minagriMockData";

const fmt = (n: number) => `RWF ${Math.round(n).toLocaleString("en-RW")}`;

export default function PredictiveIntelligencePage() {
  const [activeTab, setActiveTab] = useState<"price_forecast" | "demand_forecast" | "recommendations" | "anomalies">("price_forecast");
  const [horizonFilter, setHorizonFilter] = useState<number>(14);
  const [anomalyFilter, setAnomalyFilter] = useState<string>("ALL");

  const openAnomaliesCount = MOCK_ANOMALIES.filter((a) => a.status === "OPEN").length;

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-green-900 text-white p-6 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-green-700/20 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-1 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-800/80 border border-green-700 text-green-200 text-xs font-semibold">
            <Brain className="w-3.5 h-3.5" />
            Decision Support & Machine Learning Intelligence
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Predictive Market & Operations Intelligence
          </h1>
          <p className="text-green-100/80 text-sm max-w-2xl">
            Proactive price range forecasts, aggregate demand modeling, AI procurement recommendations, and automated market anomaly detection.
          </p>
        </div>

        <div className="flex items-center gap-3 z-10">
          <div className="bg-green-800/80 border border-green-700 p-3 rounded-xl text-right">
            <p className="text-xs text-green-200 font-medium">Model Accuracy</p>
            <p className="text-lg font-black text-green-300">89.4% Confidence</p>
          </div>
        </div>
      </div>

      {/* Quick Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="py-4 shadow-xs border-gray-200">
          <CardContent className="px-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Price Forecast Horizon</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">14 - 90 Days</p>
              <p className="text-xs text-green-600 mt-0.5 font-medium">Range & probability bounds</p>
            </div>
            <div className="w-12 h-12 bg-green-50 text-green-700 rounded-xl flex items-center justify-center border border-green-100">
              <TrendingUp className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="py-4 shadow-xs border-gray-200">
          <CardContent className="px-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Projected Demand Growth</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">+15.4% Q4</p>
              <p className="text-xs text-gray-500 mt-0.5">Aggregated restaurant demand</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100">
              <BarChart3 className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="py-4 shadow-xs border-gray-200">
          <CardContent className="px-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">AI Recommendations</p>
              <p className="text-2xl font-bold text-green-700 mt-1">{MOCK_RECOMMENDATIONS.length} Active</p>
              <p className="text-xs text-green-600 mt-0.5 font-medium">Actionable decision signals</p>
            </div>
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center border border-purple-100">
              <Zap className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="py-4 shadow-xs border-gray-200">
          <CardContent className="px-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Open Anomalies</p>
              <p className="text-2xl font-bold text-rose-600 mt-1">{openAnomaliesCount} Flags</p>
              <p className="text-xs text-rose-600 mt-0.5 font-medium">Requires human review</p>
            </div>
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center border border-rose-100">
              <ShieldAlert className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto gap-2 bg-white px-4 pt-3 rounded-t-xl shadow-xs">
        <button
          onClick={() => setActiveTab("price_forecast")}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition ${
            activeTab === "price_forecast"
              ? "border-green-700 text-green-800"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Price Forecasting Model (10.1)
        </button>

        <button
          onClick={() => setActiveTab("demand_forecast")}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition ${
            activeTab === "demand_forecast"
              ? "border-green-700 text-green-800"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Demand Forecasting Model (10.2)
        </button>

        <button
          onClick={() => setActiveTab("recommendations")}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition ${
            activeTab === "recommendations"
              ? "border-green-700 text-green-800"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <Zap className="w-4 h-4" />
          Recommendation Engine (10.3)
        </button>

        <button
          onClick={() => setActiveTab("anomalies")}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition ${
            activeTab === "anomalies"
              ? "border-green-700 text-green-800"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          Anomaly Detection (10.4) ({openAnomaliesCount})
        </button>
      </div>

      {/* Tab 1: Price Forecasting Model */}
      {activeTab === "price_forecast" && (
        <div className="space-y-4">
          <Card className="py-5 shadow-xs border-gray-200">
            <CardContent className="px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-gray-900">Multi-Commodity Short-Term Price Forecast Ranges</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Displays expected future price ranges rather than single exact values, keeping human buyers in control.
                </p>
              </div>

              <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-lg">
                {[7, 14, 30, 90].map((days) => (
                  <button
                    key={days}
                    onClick={() => setHorizonFilter(days)}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition ${
                      horizonFilter === days ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    {days} Days Horizon
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MOCK_PRICE_FORECASTS.map((pf) => {
              const isUp = pf.trend === "UPWARD";
              const isDown = pf.trend === "DOWNWARD";

              return (
                <Card key={pf.id} className="py-5 shadow-xs border-gray-200">
                  <CardContent className="px-5 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <Badge className="bg-green-50 text-green-800 border-green-200 font-bold text-[10px]">
                          {pf.category}
                        </Badge>
                        <h4 className="text-base font-bold text-gray-900 mt-1">{pf.productName}</h4>
                      </div>

                      <div className="text-right">
                        <Badge className={isUp ? "bg-amber-50 text-amber-700 border-amber-200 font-bold gap-1" : isDown ? "bg-green-50 text-green-700 border-green-200 font-bold gap-1" : "bg-gray-100 text-gray-700 font-bold"}>
                          {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : isDown ? <TrendingDown className="w-3.5 h-3.5" /> : null}
                          {pf.trend}
                        </Badge>
                        <p className="text-[10px] text-gray-500 mt-1 font-semibold">{pf.confidencePct}% Confidence</p>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3">
                      <div className="flex justify-between items-center text-xs text-gray-600">
                        <span>Current Price: <strong className="text-gray-900 font-mono">{fmt(pf.currentPrice)}</strong></span>
                        <span>Forecast ({pf.horizonDays}d): <strong className="text-green-800 font-mono">{fmt(pf.predictedPriceExpected)}</strong></span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-mono text-gray-500 font-semibold">
                          <span>Low: {fmt(pf.predictedPriceLow)}</span>
                          <span className="text-green-700 font-bold">Expected: {fmt(pf.predictedPriceExpected)}</span>
                          <span>High: {fmt(pf.predictedPriceHigh)}</span>
                        </div>
                        <div className="h-2.5 w-full bg-gray-200 rounded-full relative overflow-hidden flex items-center">
                          <div
                            className="h-full bg-green-500/30 rounded-full"
                            style={{ width: "100%" }}
                          />
                          <div className="absolute top-0 bottom-0 bg-green-700 w-2.5 rounded-full shadow-xs" style={{ left: "50%" }} />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1 text-xs">
                      <p className="font-semibold text-gray-700">Primary Market Drivers:</p>
                      <ul className="list-disc list-inside text-gray-500 space-y-0.5">
                        {pf.primaryDrivers.map((d, i) => (
                          <li key={i}>{d}</li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Demand Forecasting Model */}
      {activeTab === "demand_forecast" && (
        <div className="space-y-4">
          <Card className="py-5 shadow-xs border-gray-200">
            <CardContent className="px-5">
              <h3 className="text-base font-bold text-gray-900">Aggregated Buyer Demand Projections</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Models recurring restaurant and hotel consumption patterns to help platform managers and farmers prepare stock before demand peaks.
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {MOCK_DEMAND_FORECASTS.map((df) => (
              <Card key={df.id} className="py-5 shadow-xs border-gray-200">
                <CardContent className="px-5 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <Badge className="bg-blue-50 text-blue-700 border-blue-200 font-bold text-[10px]">
                        {df.buyerSegment}
                      </Badge>
                      <h4 className="text-base font-bold text-gray-900 mt-1">{df.productName}</h4>
                    </div>
                    <Badge className="bg-green-50 text-green-700 border-green-200 font-bold">
                      +{df.growthPct}% Growth
                    </Badge>
                  </div>

                  <div className="space-y-2 text-xs bg-gray-50 p-3.5 rounded-lg border border-gray-100 font-medium">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Current Monthly Volume:</span>
                      <span className="font-bold text-gray-900 font-mono">{df.currentMonthlyDemandKg.toLocaleString()} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Projected Next Month:</span>
                      <span className="font-bold text-green-700 font-mono">{df.projectedNextMonthDemandKg.toLocaleString()} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Seasonality Peak:</span>
                      <span className="font-semibold text-gray-800">{df.seasonalityPeak}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-green-50/60 rounded-lg border border-green-100 text-xs">
                    <p className="text-green-800 font-semibold">Recommended Buffer Reserve:</p>
                    <p className="text-lg font-black text-green-950 font-mono mt-0.5">{df.recommendedStockReserveKg.toLocaleString()} kg</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Recommendation Engine */}
      {activeTab === "recommendations" && (
        <div className="space-y-4">
          <Card className="py-5 shadow-xs border-gray-200">
            <CardContent className="px-5">
              <h3 className="text-base font-bold text-gray-900">AI Recommendation Engine (Decision Support)</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Converts raw market & operational data into clear, actionable advice for buyers, menu planners, and farmers.
              </p>
            </CardContent>
          </Card>

          <div className="space-y-3">
            {MOCK_RECOMMENDATIONS.map((rec) => (
              <Card key={rec.id} className="py-5 shadow-xs border-gray-200">
                <CardContent className="px-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-purple-50 text-purple-700 border-purple-200 font-bold uppercase text-[10px]">
                        {rec.type}
                      </Badge>
                      <span className="text-xs text-gray-400 font-medium">{rec.timestamp}</span>
                    </div>
                    <h4 className="text-base font-bold text-gray-900">{rec.title}</h4>
                    <p className="text-xs text-gray-600">{rec.description}</p>
                    <div className="flex items-center gap-3 text-xs pt-1">
                      <span className="font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200">
                        {rec.estimatedImpact}
                      </span>
                      <span className="text-gray-500">Confidence: {rec.confidencePct}%</span>
                    </div>
                  </div>

                  <div className="shrink-0 flex flex-col items-end gap-2">
                    <Button variant="green" size="sm" className="font-bold text-xs">
                      {rec.actionText}
                    </Button>
                    <p className="text-[10px] text-gray-400 max-w-xs text-right font-medium">
                      Rationale: {rec.rationale}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Anomaly Control Center */}
      {activeTab === "anomalies" && (
        <div className="space-y-4">
          <Card className="py-5 shadow-xs border-gray-200">
            <CardContent className="px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-gray-900">Market Anomaly & Data Quality Control Center</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Automatically monitors abnormal price spikes, suspicious supplier quotations, demand surges, and duplicate observations.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-500">Status:</span>
                <Button
                  onClick={() => setAnomalyFilter("ALL")}
                  variant={anomalyFilter === "ALL" ? "default" : "outline"}
                  size="sm"
                  className="text-xs font-bold"
                >
                  All Flags
                </Button>
                <Button
                  onClick={() => setAnomalyFilter("OPEN")}
                  variant={anomalyFilter === "OPEN" ? "destructive" : "outline"}
                  size="sm"
                  className="text-xs font-bold"
                >
                  Open ({openAnomaliesCount})
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            {MOCK_ANOMALIES.filter((a) => anomalyFilter === "ALL" || a.status === anomalyFilter).map((anom) => {
              const isCrit = anom.severity === "critical";

              return (
                <Card
                  key={anom.id}
                  className={`py-5 shadow-xs border ${
                    isCrit ? "border-rose-200 bg-rose-50/20" : "border-gray-200"
                  }`}
                >
                  <CardContent className="px-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5 max-w-2xl">
                      <div className="flex items-center gap-2">
                        <Badge className={isCrit ? "bg-rose-100 text-rose-800 uppercase font-extrabold text-[10px]" : "bg-amber-100 text-amber-800 uppercase font-extrabold text-[10px]"}>
                          {anom.severity} • {anom.type}
                        </Badge>
                        <span className="text-xs text-gray-400 font-medium">{anom.timestamp}</span>
                      </div>
                      <h4 className="text-base font-bold text-gray-900">{anom.title}</h4>
                      <p className="text-xs font-mono font-semibold text-gray-700">{anom.detectedDifference}</p>
                      <p className="text-xs text-gray-500">Action: {anom.recommendedAction}</p>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      {anom.status === "OPEN" ? (
                        <Button variant="destructive" size="sm" className="font-bold text-xs">
                          Review Anomaly
                        </Button>
                      ) : (
                        <Badge className="bg-green-50 text-green-700 border-green-200 font-bold gap-1 text-xs py-1 px-3">
                          <CheckCircle2 className="w-4 h-4" /> {anom.status}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
