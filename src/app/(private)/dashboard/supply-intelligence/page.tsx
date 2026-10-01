"use client";

import { useState } from "react";
import {
  Boxes,
  Award,
  Truck,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  MapPin,
  Star,
  Layers,
  Search,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MOCK_SUPPLIER_SCORES, MOCK_FARMER_DEMAND_SIGNALS } from "@/app/services/minagriMockData";

export default function AdminSupplyIntelligencePage() {
  const [activeTab, setActiveTab] = useState<"scoring" | "demand_aggregation">("scoring");

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-green-900 text-white p-6 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-green-700/20 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-1 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-800/80 border border-green-700 text-green-200 text-xs font-semibold">
            <Award className="w-3.5 h-3.5" />
            Supply Chain & Operational Analytics
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Supply Intelligence & Supplier Quality Scoring
          </h1>
          <p className="text-green-100/80 text-sm max-w-2xl">
            Evaluate supplier quality, track fulfillment reliability, optimize sourcing routes, and aggregate restaurant demand signals for farmer planning.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto gap-2 bg-white px-4 pt-3 rounded-t-xl shadow-xs">
        <button
          onClick={() => setActiveTab("scoring")}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition ${
            activeTab === "scoring"
              ? "border-green-700 text-green-800"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <Award className="w-4 h-4" />
          Supplier Quality Scoring (12)
        </button>

        <button
          onClick={() => setActiveTab("demand_aggregation")}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition ${
            activeTab === "demand_aggregation"
              ? "border-green-700 text-green-800"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <Layers className="w-4 h-4" />
          Demand Aggregation & Planning (7.2)
        </button>
      </div>

      {/* Tab 1: Supplier Quality Scoring */}
      {activeTab === "scoring" && (
        <div className="space-y-4">
          <Card className="py-5 shadow-xs border-gray-200">
            <CardContent className="px-5">
              <h3 className="text-base font-bold text-gray-900">Supplier & Cooperative Performance Matrix</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Combines fulfillment reliability, harvest freshness, price competitiveness, and on-time delivery into a single unified performance score.
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {MOCK_SUPPLIER_SCORES.map((sup) => (
              <Card key={sup.supplierId} className="py-5 shadow-xs border-gray-200">
                <CardContent className="px-5 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <Badge className="bg-green-50 text-green-800 border-green-200 font-bold text-[10px]">
                        {sup.region}
                      </Badge>
                      <h4 className="text-base font-bold text-gray-900 mt-1">{sup.supplierName}</h4>
                    </div>

                    <span className="w-9 h-9 rounded-xl bg-green-700 text-white font-extrabold text-sm flex items-center justify-center shadow-xs">
                      {sup.grade}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <div className="flex justify-between font-semibold text-gray-700">
                        <span>Fulfillment Reliability</span>
                        <span className="text-green-700 font-mono">{sup.fulfillmentReliabilityPct}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full mt-1 overflow-hidden">
                        <div className="h-full bg-green-600 rounded-full" style={{ width: `${sup.fulfillmentReliabilityPct}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-semibold text-gray-700">
                        <span>Harvest Freshness Score</span>
                        <span className="text-green-700 font-mono">{sup.freshnessScorePct}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full mt-1 overflow-hidden">
                        <div className="h-full bg-green-600 rounded-full" style={{ width: `${sup.freshnessScorePct}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-semibold text-gray-700">
                        <span>Price Competitiveness</span>
                        <span className="text-green-700 font-mono">{sup.priceCompetitivenessPct}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full mt-1 overflow-hidden">
                        <div className="h-full bg-green-600 rounded-full" style={{ width: `${sup.priceCompetitivenessPct}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-semibold text-gray-700">
                        <span>On-Time Delivery Rate</span>
                        <span className="text-green-700 font-mono">{sup.onTimeDeliveryPct}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full mt-1 overflow-hidden">
                        <div className="h-full bg-green-600 rounded-full" style={{ width: `${sup.onTimeDeliveryPct}%` }} />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                    <span className="text-gray-500">Overall Supplier Index:</span>
                    <span className="text-lg font-extrabold text-green-900 font-mono">{sup.overallScore} / 100</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Demand Aggregation */}
      {activeTab === "demand_aggregation" && (
        <div className="space-y-4">
          <Card className="py-5 shadow-xs border-gray-200">
            <CardContent className="px-5">
              <h3 className="text-base font-bold text-gray-900">Anonymized Restaurant Demand Aggregation</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Consolidates multi-restaurant purchasing forecasts into regional production signals to stabilize supply chains.
              </p>
            </CardContent>
          </Card>

          <Card className="py-0 border-gray-200 overflow-hidden shadow-xs">
            <CardContent className="px-0 py-0">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-5">Crop Name</th>
                    <th className="py-3 px-5">Target Region</th>
                    <th className="py-3 px-5">Delivery Month</th>
                    <th className="py-3 px-5 text-right">Aggregated Monthly Demand</th>
                    <th className="py-3 px-5 text-right">Pre-Contracted Buyers</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {MOCK_FARMER_DEMAND_SIGNALS.map((sig) => (
                    <tr key={sig.id} className="hover:bg-gray-50/50">
                      <td className="py-3 px-5 font-bold text-gray-900">{sig.cropName}</td>
                      <td className="py-3 px-5 text-gray-600">{sig.region}</td>
                      <td className="py-3 px-5 text-gray-600">{sig.targetMonth}</td>
                      <td className="py-3 px-5 text-right font-mono font-bold text-green-800">{sig.aggregatedMonthlyDemandKg.toLocaleString()} kg</td>
                      <td className="py-3 px-5 text-right font-bold text-gray-900">{sig.contractedBuyersCount} Restaurants</td>
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
