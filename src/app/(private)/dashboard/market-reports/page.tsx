"use client";

import { useState } from "react";
import {
  FileText,
  Download,
  QrCode,
  Bell,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Plus,
  Calendar,
  Layers,
  ArrowUpRight,
  Filter,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MOCK_MARKET_REPORTS,
  MOCK_TRACEABILITY_BATCHES,
} from "@/app/services/minagriMockData";
import type { MarketReport } from "@/types/minagri-intelligence";

export default function MarketReportsPage() {
  const [activeTab, setActiveTab] = useState<"reports" | "traceability" | "rules">("reports");
  const [rules, setRules] = useState([
    { id: "rule-1", product: "Plum Tomatoes", condition: "Price falls below RWF 1,100/kg", status: "ACTIVE" },
    { id: "rule-2", product: "Prime Fresh Beef", condition: "Price spikes above RWF 5,000/kg", status: "ACTIVE" },
  ]);
  const [newProduct, setNewProduct] = useState("Irish Potatoes");
  const [newCondition, setNewCondition] = useState("Price drops below RWF 450/kg");

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    setRules([...rules, { id: `rule-${Date.now()}`, product: newProduct, condition: newCondition, status: "ACTIVE" }]);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-green-900 text-white p-6 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-green-700/20 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-1 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-800/80 border border-green-700 text-green-200 text-xs font-semibold">
            <FileText className="w-3.5 h-3.5" />
            Ecosystem Services & Enterprise Analytics
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Market Reports, Traceability & Smart Rules
          </h1>
          <p className="text-green-100/80 text-sm max-w-2xl">
            Generate recurring MINAGRI benchmark market reports, audit supply chain provenance, and set up conditional smart procurement alerts.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto gap-2 bg-white px-4 pt-3 rounded-t-xl shadow-xs">
        <button
          onClick={() => setActiveTab("reports")}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition ${
            activeTab === "reports"
              ? "border-green-700 text-green-800"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <FileText className="w-4 h-4" />
          Market Intelligence Reports (12)
        </button>

        <button
          onClick={() => setActiveTab("traceability")}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition ${
            activeTab === "traceability"
              ? "border-green-700 text-green-800"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <QrCode className="w-4 h-4" />
          Traceability & Provenance (12)
        </button>

        <button
          onClick={() => setActiveTab("rules")}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition ${
            activeTab === "rules"
              ? "border-green-700 text-green-800"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <Bell className="w-4 h-4" />
          Smart Procurement Rules (12)
        </button>
      </div>

      {/* Tab 1: Market Intelligence Reports */}
      {activeTab === "reports" && (
        <div className="space-y-4">
          <Card className="py-5 shadow-xs border-gray-200">
            <CardContent className="px-5">
              <h3 className="text-base font-bold text-gray-900">Enterprise Market Intelligence Reports</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Download structured recurring market index publications for procurement managers, hotel directors, and ministry partners.
              </p>
            </CardContent>
          </Card>

          <div className="space-y-3">
            {MOCK_MARKET_REPORTS.map((rep) => (
              <Card key={rep.id} className="py-5 shadow-xs border-gray-200">
                <CardContent className="px-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-50 text-green-800 border-green-200 font-extrabold text-[10px] uppercase">
                        {rep.reportType}
                      </Badge>
                      <span className="text-xs text-gray-400 font-medium">Published: {rep.publishedDate}</span>
                    </div>
                    <h4 className="text-base font-bold text-gray-900">{rep.title}</h4>
                    <p className="text-xs text-gray-600">{rep.summary}</p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {rep.featuredProducts.map((p) => (
                        <span key={p} className="text-[10px] bg-gray-100 text-gray-700 font-medium px-2 py-0.5 rounded">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="shrink-0 flex flex-col items-end gap-2">
                    <Button variant="green" size="sm" className="font-bold text-xs gap-2">
                      <Download className="w-3.5 h-3.5" /> Download ({rep.downloadSize})
                    </Button>
                    <p className="text-[10px] text-gray-400 font-medium">Period: {rep.periodCovered}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Traceability & Provenance */}
      {activeTab === "traceability" && (
        <div className="space-y-4">
          <Card className="py-5 shadow-xs border-gray-200">
            <CardContent className="px-5">
              <h3 className="text-base font-bold text-gray-900">Food Provenance & Harvest Journey Verification</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Verified cold-chain logs, harvest timestamps, and MINAGRI certification records for high-value buyer transparency.
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MOCK_TRACEABILITY_BATCHES.map((b) => (
              <Card key={b.batchId} className="py-5 shadow-xs border-gray-200">
                <CardContent className="px-5 space-y-4">
                  <div className="flex justify-between items-start border-b border-gray-100 pb-3">
                    <div>
                      <span className="text-xs font-mono font-bold text-green-800">{b.batchId}</span>
                      <h4 className="text-base font-bold text-gray-900 mt-0.5">{b.productName}</h4>
                    </div>
                    <div className="w-10 h-10 bg-green-900 text-white rounded-lg flex items-center justify-center shadow-xs">
                      <QrCode className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-gray-600">
                      <span>Farm Origin:</span>
                      <span className="font-bold text-gray-900">{b.originFarm} ({b.district})</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Harvest Timestamp:</span>
                      <span className="font-bold text-gray-900">{b.harvestDate}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Quality & Certification:</span>
                      <span className="font-bold text-green-700">{b.qualityGrade} • {b.certification}</span>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg text-gray-600 font-mono text-[11px]">
                      {b.temperatureLogs}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Smart Procurement Rules */}
      {activeTab === "rules" && (
        <div className="space-y-4">
          <Card className="py-5 shadow-xs border-gray-200">
            <CardContent className="px-5">
              <h3 className="text-base font-bold text-gray-900">Smart Procurement Conditional Rules</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Configure automatic notifications when market prices hit target thresholds.
              </p>
            </CardContent>
          </Card>

          <Card className="py-4 shadow-xs border-gray-200">
            <CardContent className="px-5">
              <form onSubmit={handleAddRule} className="flex flex-col sm:flex-row gap-3 items-end">
                <div className="flex-1 space-y-1">
                  <label className="text-xs font-semibold text-gray-700">Target Product</label>
                  <input
                    type="text"
                    required
                    value={newProduct}
                    onChange={(e) => setNewProduct(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-gray-300 text-xs outline-none focus:ring-2 focus:ring-green-600"
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <label className="text-xs font-semibold text-gray-700">Trigger Condition</label>
                  <input
                    type="text"
                    required
                    value={newCondition}
                    onChange={(e) => setNewCondition(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-gray-300 text-xs outline-none focus:ring-2 focus:ring-green-600"
                  />
                </div>
                <Button type="submit" variant="green" size="sm" className="font-bold text-xs gap-1.5 h-10">
                  <Plus className="w-4 h-4" /> Create Rule Alert
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-3">
            {rules.map((r) => (
              <Card key={r.id} className="py-4 shadow-xs border-gray-200">
                <CardContent className="px-5 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-gray-900">{r.product}</span>
                    <p className="text-xs text-gray-600">{r.condition}</p>
                  </div>
                  <Badge className="bg-green-50 text-green-700 border-green-200 font-bold">
                    {r.status}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
