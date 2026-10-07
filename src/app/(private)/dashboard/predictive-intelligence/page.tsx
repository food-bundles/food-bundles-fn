"use client";

import { useState, useMemo } from "react";
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
  Ticket,
  Users,
  DollarSign,
  Package,
  Activity,
  ArrowRight,
  RefreshCw,
  Scale,
  Percent,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  TimeHorizon,
  MOCK_PREDICTIVE_ORDERS,
  MOCK_PREDICTIVE_PRICES,
  MOCK_PREDICTIVE_FINANCIALS,
  PredictivePriceItem,
} from "@/app/services/predictiveIntelligenceData";

const fmtRwf = (n: number) => `RWF ${Math.round(n).toLocaleString("en-RW")}`;
const fmtNum = (n: number) => Math.round(n).toLocaleString("en-RW");

export default function PredictiveIntelligencePage() {
  const [activeTab, setActiveTab] = useState<"orders" | "prices" | "revenue">("orders");
  const [timeHorizon, setTimeHorizon] = useState<TimeHorizon>("monthly");
  const [selectedCropId, setSelectedCropId] = useState<string>("pred-tomatoes");
  const [priceCategoryFilter, setPriceCategoryFilter] = useState<string>("ALL");
  const [priceSearchQuery, setPriceSearchQuery] = useState<string>("");

  // Orders prediction simulation state
  const [simulatedVoucherGrowth, setSimulatedVoucherGrowth] = useState<number>(0);
  const [simulatedUserGrowth, setSimulatedUserGrowth] = useState<number>(0);

  // Orders dataset for the selected time horizon
  const rawOrdersData = MOCK_PREDICTIVE_ORDERS[timeHorizon];
  const ordersData = useMemo(() => {
    return rawOrdersData.map((d) => {
      const voucherBoost = (d.vouchersRequested * (simulatedVoucherGrowth / 100)) * (d.voucherConversionRate / 100);
      const userBoost = (d.newUsersJoined * (simulatedUserGrowth / 100)) * 2.5;
      const adjustedPredicted = Math.round(d.predictedOrders + voucherBoost + userBoost);
      return {
        ...d,
        predictedOrders: adjustedPredicted,
        confidenceLower: Math.round(adjustedPredicted * 0.93),
        confidenceUpper: Math.round(adjustedPredicted * 1.07),
      };
    });
  }, [rawOrdersData, simulatedVoucherGrowth, simulatedUserGrowth]);

  // Financial dataset for the selected time horizon
  const financialsData = MOCK_PREDICTIVE_FINANCIALS[timeHorizon];

  // Price forecast filtering
  const filteredPrices = useMemo(() => {
    return MOCK_PREDICTIVE_PRICES.filter((p) => {
      const matchesCategory = priceCategoryFilter === "ALL" || p.category === priceCategoryFilter;
      const matchesSearch =
        p.productName.toLowerCase().includes(priceSearchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(priceSearchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [priceCategoryFilter, priceSearchQuery]);

  const selectedCrop = useMemo(() => {
    return MOCK_PREDICTIVE_PRICES.find((p) => p.id === selectedCropId) || MOCK_PREDICTIVE_PRICES[0];
  }, [selectedCropId]);

  // High-level summary metrics
  const totalPredictedOrders = ordersData.reduce((acc, curr) => acc + curr.predictedOrders, 0);
  const totalVouchersRequested = ordersData.reduce((acc, curr) => acc + curr.vouchersRequested, 0);
  const totalNewUsers = ordersData.reduce((acc, curr) => acc + curr.newUsersJoined, 0);
  const latestFinancialPoint = financialsData[financialsData.length - 1];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 text-xs text-gray-400 mb-6"
        >
          <span className="flex items-center gap-1.5">
            <a
              href="/dashboard"
              className="hover:text-gray-700 transition-colors font-medium"
            >
              Dashboard
            </a>
            <span className="text-gray-300">›</span>
          </span>
          <span className="text-gray-700 font-semibold">Predictive Intelligence</span>
        </nav>

        {/* Top Banner */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white border border-gray-200 text-gray-900 p-6 rounded-2xl shadow-sm relative overflow-hidden">
          <div className="space-y-1.5 z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              <Brain className="w-3.5 h-3.5 text-emerald-600" />
              AI Predictive Operations & Market Intelligence Engine
            </div>
            <h1 className="text-xl font-bold text-gray-900">
              Predictive Market & Operations Intelligence
            </h1>
            <p className="text-gray-500 text-xs leading-relaxed">
              Multi-horizon order volume forecasting from requested vouchers and buyer onboardings, crop price trajectory models from real-time farmer submissions, and revenue margin simulations.
            </p>
          </div>

          {/* Global Time Horizon Selector */}
          <div className="z-10 flex flex-col sm:flex-row items-start sm:items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-200">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider pl-2 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" /> Range:
            </span>
            <div className="grid grid-cols-4 gap-1 w-full sm:w-auto">
              {(["weekly", "monthly", "seasonal", "yearly"] as TimeHorizon[]).map((hz) => (
                <button
                  key={hz}
                  onClick={() => setTimeHorizon(hz)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition capitalize text-center ${
                    timeHorizon === hz
                      ? "bg-white text-gray-900 shadow-sm font-bold border border-gray-200"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  {hz}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="py-4 shadow-xs border-gray-200 bg-white">
            <CardContent className="px-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Predicted Orders ({timeHorizon})</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{fmtNum(totalPredictedOrders)}</p>
                <div className="flex items-center gap-1.5 mt-1 text-xs text-emerald-600 font-semibold">
                  <TrendingUp className="w-3.5 h-3.5" /> +24.8% Projected Growth
                </div>
              </div>
              <div className="w-10 h-10 bg-emerald-50 text-emerald-700 rounded-xl flex items-center justify-center border border-emerald-100">
                <Package className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="py-4 shadow-xs border-gray-200 bg-white">
            <CardContent className="px-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Requested Vouchers</p>
                <p className="text-2xl font-bold text-purple-700 mt-1">{fmtNum(totalVouchersRequested)}</p>
                <p className="text-xs text-gray-500 mt-1">91.4% Avg Conversion to Orders</p>
              </div>
              <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center border border-purple-100">
                <Ticket className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="py-4 shadow-xs border-gray-200 bg-white">
            <CardContent className="px-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">New Platform Buyers</p>
                <p className="text-2xl font-bold text-blue-700 mt-1">+{totalNewUsers}</p>
                <p className="text-xs text-blue-600 mt-1 font-semibold">Restaurants & Hotels Joining</p>
              </div>
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100">
                <Users className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="py-4 shadow-xs border-gray-200 bg-white">
            <CardContent className="px-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Projected Revenue ({timeHorizon})</p>
                <p className="text-2xl font-bold text-green-700 mt-1">{fmtRwf(latestFinancialPoint?.predictedRevenue || 0)}</p>
                <p className="text-xs text-emerald-700 mt-1 font-semibold">30% Standard Platform Margin</p>
              </div>
              <div className="w-10 h-10 bg-green-50 text-green-700 rounded-xl flex items-center justify-center border border-green-100">
                <DollarSign className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs Navigation */}
        <div className="flex border-b border-gray-200 overflow-x-auto gap-2 bg-white px-4 pt-3 rounded-t-2xl shadow-xs">
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition whitespace-nowrap ${
              activeTab === "orders"
                ? "border-green-600 text-green-700 bg-green-50/50 rounded-t-xl"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            1. Predictive Orders & Vouchers Growth
          </button>

          <button
            onClick={() => setActiveTab("prices")}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition whitespace-nowrap ${
              activeTab === "prices"
                ? "border-green-600 text-green-700 bg-green-50/50 rounded-t-xl"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            2. Predictive Prices (Farmer Inflow Driven)
          </button>

          <button
            onClick={() => setActiveTab("revenue")}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition whitespace-nowrap ${
              activeTab === "revenue"
                ? "border-green-600 text-green-700 bg-green-50/50 rounded-t-xl"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <DollarSign className="w-4 h-4" />
            3. Revenue & Predictive Sales Simulation
          </button>
        </div>

      {/* ========================================================================= */}
      {/* TAB 1: PREDICTIVE ORDERS (VOUCHERS & USER GROWTH DRIVEN) */}
      {/* ========================================================================= */}
      {activeTab === "orders" && (
        <div className="space-y-6">
          {/* Methodology Banner */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-blue-600 text-white rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-blue-950">
                  How Orders are Predicted: Requested Vouchers & Platform User Growth
                </h3>
                <p className="text-xs text-blue-800/80 leading-relaxed">
                  Orders forecast is calculated from active vouchers requested by buyers (historical conversion: 89-94%), multiplied by the influx of newly onboarded restaurants and hotels across <span className="font-bold capitalize">{timeHorizon}</span> periods.
                </p>
              </div>
            </div>

            {/* Reset Simulation Button */}
            {(simulatedVoucherGrowth !== 0 || simulatedUserGrowth !== 0) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSimulatedVoucherGrowth(0);
                  setSimulatedUserGrowth(0);
                }}
                className="text-xs border-blue-300 text-blue-700 bg-white hover:bg-blue-50 shrink-0 gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Reset Simulation
              </Button>
            )}
          </div>

          {/* Chart Card: Reality vs Predictions */}
          <Card className="border-gray-200 shadow-sm bg-white overflow-hidden">
            <CardHeader className="border-b border-gray-100 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base font-bold text-gray-900">
                    Reality vs Predictions: Order Volume & Driver Correlation
                  </CardTitle>
                  <Badge className="bg-green-100 text-green-800 border-green-200 capitalize font-bold text-[10px]">
                    {timeHorizon} Horizon
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Compares Actual Orders (Reality) with AI Predicted Orders, alongside Requested Vouchers and New User Onboardings.
                </p>
              </div>

              {/* Chart Legend */}
              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block" />
                  <span className="text-gray-700">Actual Orders (Reality)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-blue-600 inline-block" />
                  <span className="text-gray-700">Predicted Orders (AI)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-purple-500 inline-block" />
                  <span className="text-gray-700">Vouchers Requested</span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 md:p-6">
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={ordersData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#059669" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorVouchers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#9333ea" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#9333ea" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="period" tick={{ fontSize: 11, fill: "#64748b" }} />
                    <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const dataPoint = payload[0].payload as (typeof ordersData)[0];
                          return (
                            <div className="bg-slate-900 text-white p-3.5 rounded-xl shadow-xl border border-slate-800 text-xs space-y-2 min-w-[220px]">
                              <p className="font-bold text-sm text-emerald-400 border-b border-slate-800 pb-1.5">
                                {label}
                              </p>
                              <div className="space-y-1">
                                {dataPoint.actualOrders !== null ? (
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">Actual Orders (Reality):</span>
                                    <span className="font-bold text-emerald-400">{dataPoint.actualOrders}</span>
                                  </div>
                                ) : (
                                  <div className="flex justify-between text-amber-400">
                                    <span>Status:</span>
                                    <span className="font-bold">Future Forecast Period</span>
                                  </div>
                                )}
                                <div className="flex justify-between">
                                  <span className="text-gray-400">AI Predicted Orders:</span>
                                  <span className="font-bold text-blue-400">{dataPoint.predictedOrders}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Confidence Range:</span>
                                  <span className="text-gray-300 font-mono">
                                    {dataPoint.confidenceLower} - {dataPoint.confidenceUpper}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Vouchers Requested:</span>
                                  <span className="font-bold text-purple-400">{dataPoint.vouchersRequested}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Conversion Rate:</span>
                                  <span className="font-bold text-emerald-300">{dataPoint.voucherConversionRate}%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">New Buyers Joined:</span>
                                  <span className="font-bold text-cyan-300">+{dataPoint.newUsersJoined}</span>
                                </div>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="predictedOrders"
                      name="Predicted Orders"
                      stroke="#2563eb"
                      strokeWidth={2.5}
                      strokeDasharray="4 4"
                      fillOpacity={1}
                      fill="url(#colorPredicted)"
                    />
                    <Area
                      type="monotone"
                      dataKey="actualOrders"
                      name="Actual Orders"
                      stroke="#059669"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorActual)"
                    />
                    <Line
                      type="monotone"
                      dataKey="vouchersRequested"
                      name="Vouchers Requested"
                      stroke="#9333ea"
                      strokeWidth={2}
                      dot={{ r: 3, fill: "#9333ea" }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Interactive Simulation Panel & Actionable Recommendations */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Interactive Simulation Controls */}
            <Card className="border-gray-200 shadow-sm bg-white lg:col-span-1">
              <CardHeader className="pb-3 border-b border-gray-100">
                <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  What-If Scenario Simulator
                </CardTitle>
                <p className="text-xs text-gray-500">
                  Simulate changes in voucher issuance and buyer registrations to see real-time impact on predicted orders.
                </p>
              </CardHeader>
              <CardContent className="p-5 space-y-5">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-gray-700">Voucher Request Volume Growth</span>
                    <span className="text-purple-700 font-bold">{simulatedVoucherGrowth > 0 ? `+${simulatedVoucherGrowth}%` : `${simulatedVoucherGrowth}%`}</span>
                  </div>
                  <input
                    type="range"
                    min="-50"
                    max="100"
                    step="5"
                    value={simulatedVoucherGrowth}
                    onChange={(e) => setSimulatedVoucherGrowth(Number(e.target.value))}
                    className="w-full accent-purple-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400">
                    <span>-50% Drop</span>
                    <span>Baseline (0%)</span>
                    <span>+100% Surge</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-gray-700">New Buyer Onboarding Rate</span>
                    <span className="text-blue-700 font-bold">{simulatedUserGrowth > 0 ? `+${simulatedUserGrowth}%` : `${simulatedUserGrowth}%`}</span>
                  </div>
                  <input
                    type="range"
                    min="-50"
                    max="100"
                    step="5"
                    value={simulatedUserGrowth}
                    onChange={(e) => setSimulatedUserGrowth(Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400">
                    <span>-50% Slower</span>
                    <span>Baseline (0%)</span>
                    <span>+100% Faster</span>
                  </div>
                </div>

                <div className="bg-emerald-50 rounded-xl p-3.5 border border-emerald-200/70 text-xs space-y-1.5">
                  <p className="font-bold text-emerald-950 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-emerald-600" />
                    Simulated Output Impact:
                  </p>
                  <p className="text-emerald-800">
                    Simulated Orders: <span className="font-bold text-sm">{fmtNum(totalPredictedOrders)}</span>
                  </p>
                  <p className="text-[11px] text-emerald-700">
                    Estimated Additional Revenue: <span className="font-bold">{fmtRwf(totalPredictedOrders * 12500)}</span>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Smart Recommendations when Reality Diverges from Predictions */}
            <Card className="border-gray-200 shadow-sm bg-white lg:col-span-2">
              <CardHeader className="pb-3 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                    AI Recommendations & Divergence Risk Mitigations
                  </CardTitle>
                  <Badge className="bg-amber-50 text-amber-800 border-amber-200 text-[10px] font-bold">
                    3 Action Items
                  </Badge>
                </div>
                <p className="text-xs text-gray-500">
                  Automated strategic actions when actual order conversions fail to meet expectations or voucher bottlenecks occur.
                </p>
              </CardHeader>
              <CardContent className="p-5 space-y-3">
                <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 font-bold text-xs text-amber-950">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      Voucher Redemption Lag in Kigali Restaurants (Nyarugenge & Gasabo)
                    </div>
                    <Badge className="bg-amber-100 text-amber-900 text-[10px] font-bold">Risk: Moderate</Badge>
                  </div>
                  <p className="text-xs text-amber-900/90 leading-relaxed">
                    <strong>Reality Check:</strong> 64 Vouchers were requested 7 days ago but only 52% have executed an order. 
                  </p>
                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-amber-200/60">
                    <span className="text-[11px] font-bold text-amber-950">
                      💡 Recommendation: Trigger automated SMS reminders with expiring bundle discounts.
                    </span>
                    <Button size="sm" className="bg-amber-700 hover:bg-amber-800 text-white text-xs h-7 px-3">
                      Dispatch Reminders
                    </Button>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 font-bold text-xs text-blue-950">
                      <Users className="w-4 h-4 text-blue-600" />
                      High Buyer Registration Surge in Musanze (+48 new hotels)
                    </div>
                    <Badge className="bg-blue-100 text-blue-900 text-[10px] font-bold">Opportunity</Badge>
                  </div>
                  <p className="text-xs text-blue-900/90 leading-relaxed">
                    <strong>Reality Check:</strong> New hotel signups exceeded forecast by +32%. Projected orders will hit 510/week in October.
                  </p>
                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-blue-200/60">
                    <span className="text-[11px] font-bold text-blue-950">
                      💡 Recommendation: Direct aggregators in Musanze to reserve 15 Tons of Irish Potatoes and Cabbage.
                    </span>
                    <Button size="sm" className="bg-blue-700 hover:bg-blue-800 text-white text-xs h-7 px-3">
                      Allocate Supply Quota
                    </Button>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 font-bold text-xs text-emerald-950">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Optimal Voucher-to-Order Conversion in Huye (95.4%)
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-900 text-[10px] font-bold">Performing</Badge>
                  </div>
                  <p className="text-xs text-emerald-900/90 leading-relaxed">
                    Buyer engagement in the Southern Province is outperforming predictive baseline with zero payment defaults.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PREDICTIVE PRICES (FARMER CROP SUBMISSION DRIVEN) */}
      {/* ========================================================================= */}
      {activeTab === "prices" && (
        <div className="space-y-6">
          {/* Methodology Banner */}
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-emerald-600 text-white rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-emerald-950">
                  How Crop Prices are Predicted: Real-Time Farmer Harvest Submissions
                </h3>
                <p className="text-xs text-emerald-800/80 leading-relaxed">
                  Based on the volumes and asking prices that farmers are currently submitting into FoodBundles collection centers, the model forecasts whether market prices will <strong>increase</strong> (scarcity) or <strong>decrease</strong> (harvest surplus) across <span className="font-bold capitalize">{timeHorizon}</span> periods.
                </p>
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search crop or category..."
                value={priceSearchQuery}
                onChange={(e) => setPriceSearchQuery(e.target.value)}
                className="text-xs w-full bg-transparent outline-none font-medium placeholder:text-gray-400"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-500">Category:</span>
              <select
                value={priceCategoryFilter}
                onChange={(e) => setPriceCategoryFilter(e.target.value)}
                className="p-1.5 text-xs font-bold rounded-lg border border-gray-200 bg-white outline-none"
              >
                <option value="ALL">All Categories</option>
                <option value="Vegetables">Vegetables</option>
                <option value="Roots & Tubers">Roots & Tubers</option>
                <option value="Meat & Poultry">Meat & Poultry</option>
              </select>
            </div>
          </div>

          {/* Crop Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPrices.map((crop) => {
              const isSelected = crop.id === selectedCrop.id;
              return (
                <div
                  key={crop.id}
                  onClick={() => setSelectedCropId(crop.id)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-4 ${
                    isSelected
                      ? "bg-emerald-50/50 border-emerald-500 shadow-md ring-2 ring-emerald-500/20"
                      : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-gray-100 px-2 py-0.5 rounded">
                        {crop.category}
                      </span>
                      <h4 className="text-base font-bold text-gray-900 mt-1">{crop.productName}</h4>
                    </div>

                    <Badge
                      className={`font-bold text-[10px] flex items-center gap-1 ${
                        crop.priceTrend === "DECREASING"
                          ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                          : crop.priceTrend === "INCREASING"
                          ? "bg-rose-100 text-rose-800 border-rose-200"
                          : "bg-gray-100 text-gray-800 border-gray-200"
                      }`}
                    >
                      {crop.priceTrend === "DECREASING" ? (
                        <>
                          <TrendingDown className="w-3 h-3 text-emerald-700" />
                          Price Dropping ({crop.projectedChangePct}%)
                        </>
                      ) : crop.priceTrend === "INCREASING" ? (
                        <>
                          <TrendingUp className="w-3 h-3 text-rose-700" />
                          Price Rising (+{crop.projectedChangePct}%)
                        </>
                      ) : (
                        <>
                          <Scale className="w-3 h-3 text-gray-700" />
                          Stable Price
                        </>
                      )}
                    </Badge>
                  </div>

                  {/* Price & Volume Comparison Box */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                      <p className="text-[11px] text-gray-500">Current Inflow Price</p>
                      <p className="text-base font-bold text-gray-900 mt-0.5">{fmtRwf(crop.currentFarmerSubmissionPrice)}</p>
                      <p className="text-[10px] text-gray-400">/{crop.unit} farmer quote</p>
                    </div>

                    <div
                      className={`p-2.5 rounded-xl border ${
                        crop.priceTrend === "DECREASING"
                          ? "bg-emerald-50/70 border-emerald-100"
                          : "bg-rose-50/70 border-rose-100"
                      }`}
                    >
                      <p className="text-[11px] font-semibold text-gray-600">AI Predicted Price</p>
                      <p
                        className={`text-base font-bold mt-0.5 ${
                          crop.priceTrend === "DECREASING" ? "text-emerald-900" : "text-rose-900"
                        }`}
                      >
                        {fmtRwf(crop.predictedPrice)}
                      </p>
                      <p className="text-[10px] font-bold text-gray-500">
                        {crop.projectedChangePct > 0 ? `+${crop.projectedChangePct}%` : `${crop.projectedChangePct}%`} forecast
                      </p>
                    </div>
                  </div>

                  {/* Supply Inflow Indicator */}
                  <div className="pt-2 border-t border-gray-100 text-xs space-y-1">
                    <div className="flex justify-between text-gray-500">
                      <span>Submitted Farmer Volume:</span>
                      <span className="font-bold text-gray-800">{fmtNum(crop.farmerSubmissionVolumeKg)} {crop.unit}</span>
                    </div>
                    <p className="text-[11px] text-gray-600 leading-snug">
                      <span className="font-bold text-gray-700">Driver:</span> {crop.primarySupplyDriver}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Crop Historical Reality vs Predicted Chart */}
          <Card className="border-gray-200 shadow-sm bg-white overflow-hidden">
            <CardHeader className="border-b border-gray-100 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base font-bold text-gray-900">
                    {selectedCrop.productName}: Price Reality vs Predicted Trajectory
                  </CardTitle>
                  <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px] font-bold">
                    Farmer Inflow Correlation
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Shows actual historical transaction prices alongside future AI predicted prices and farmer submission volume.
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-semibold">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block" />
                  <span className="text-gray-700">Actual Price (RWF)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-blue-600 inline-block" />
                  <span className="text-gray-700">Predicted Price (RWF)</span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 md:p-6">
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={selectedCrop.historicalVsPredicted} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="period" tick={{ fontSize: 11, fill: "#64748b" }} />
                    <YAxis domain={["auto", "auto"]} tick={{ fontSize: 11, fill: "#64748b" }} />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const item = payload[0].payload;
                          return (
                            <div className="bg-slate-900 text-white p-3.5 rounded-xl shadow-xl border border-slate-800 text-xs space-y-1.5 min-w-[200px]">
                              <p className="font-bold text-sm text-emerald-400 border-b border-slate-800 pb-1">
                                {label}
                              </p>
                              {item.actualPrice !== null && (
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Actual Price:</span>
                                  <span className="font-bold text-emerald-400">{fmtRwf(item.actualPrice)}</span>
                                </div>
                              )}
                              <div className="flex justify-between">
                                <span className="text-gray-400">Predicted Price:</span>
                                <span className="font-bold text-blue-400">{fmtRwf(item.predictedPrice)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Submission Volume:</span>
                                <span className="font-bold text-purple-400">{fmtNum(item.submissionVolumeKg)} kg</span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="actualPrice"
                      name="Actual Price"
                      stroke="#059669"
                      strokeWidth={3}
                      dot={{ r: 4, fill: "#059669" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="predictedPrice"
                      name="Predicted Price"
                      stroke="#2563eb"
                      strokeWidth={2.5}
                      strokeDasharray="4 4"
                      dot={{ r: 3, fill: "#2563eb" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: REVENUE PREDICTION & PREDICTIVE SALES */}
      {/* ========================================================================= */}
      {activeTab === "revenue" && (
        <div className="space-y-6">
          {/* Methodology Banner */}
          <div className="bg-gradient-to-r from-purple-50 to-emerald-50 border border-purple-200 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-purple-600 text-white rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                <DollarSign className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-purple-950">
                  Revenue & Profit Projections: Vouchers, Pricing & Demand Velocity
                </h3>
                <p className="text-xs text-purple-800/80 leading-relaxed">
                  Forecasts gross platform revenue, realized gross profit margin (calculated with the standard 30% mark-up over farmer purchase cost), and predictive sales tonnage across <span className="font-bold capitalize">{timeHorizon}</span> horizons.
                </p>
              </div>
            </div>
          </div>

          {/* Revenue Chart: Reality vs Predictions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Revenue (RWF) */}
            <Card className="border-gray-200 shadow-sm bg-white">
              <CardHeader className="border-b border-gray-100 pb-3 flex justify-between items-center">
                <div>
                  <CardTitle className="text-sm font-bold text-gray-900">
                    Gross Revenue: Reality vs Prediction ({timeHorizon})
                  </CardTitle>
                  <p className="text-xs text-gray-500">Total transaction value in RWF</p>
                </div>
                <Badge className="bg-green-100 text-green-800 text-[10px] font-bold">Revenue RWF</Badge>
              </CardHeader>
              <CardContent className="p-4 md:p-6">
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={financialsData}>
                      <defs>
                        <linearGradient id="finActual" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="finPred" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#9333ea" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#9333ea" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="period" tick={{ fontSize: 11, fill: "#64748b" }} />
                      <YAxis
                        tick={{ fontSize: 11, fill: "#64748b" }}
                        tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`}
                      />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            const d = payload[0].payload;
                            return (
                              <div className="bg-slate-900 text-white p-3.5 rounded-xl shadow-xl text-xs space-y-1.5 min-w-[210px]">
                                <p className="font-bold text-sm text-emerald-400 border-b border-slate-800 pb-1">
                                  {label}
                                </p>
                                {d.actualRevenue !== null && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">Actual Revenue:</span>
                                    <span className="font-bold text-emerald-400">{fmtRwf(d.actualRevenue)}</span>
                                  </div>
                                )}
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Predicted Revenue:</span>
                                  <span className="font-bold text-purple-400">{fmtRwf(d.predictedRevenue)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">30% Gross Profit:</span>
                                  <span className="font-bold text-amber-300">{fmtRwf(d.grossProfit)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Voucher Share:</span>
                                  <span className="font-bold text-blue-300">{fmtRwf(d.voucherRevenueShare)}</span>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="predictedRevenue"
                        stroke="#9333ea"
                        strokeWidth={2.5}
                        strokeDasharray="4 4"
                        fill="url(#finPred)"
                      />
                      <Area
                        type="monotone"
                        dataKey="actualRevenue"
                        stroke="#059669"
                        strokeWidth={3}
                        fill="url(#finActual)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Chart 2: Predictive Sales Volume (Kg) */}
            <Card className="border-gray-200 shadow-sm bg-white">
              <CardHeader className="border-b border-gray-100 pb-3 flex justify-between items-center">
                <div>
                  <CardTitle className="text-sm font-bold text-gray-900">
                    Predictive Sales Volume: Reality vs Demand ({timeHorizon})
                  </CardTitle>
                  <p className="text-xs text-gray-500">Aggregated product quantity in Kilograms</p>
                </div>
                <Badge className="bg-blue-100 text-blue-800 text-[10px] font-bold">Tonnage kg</Badge>
              </CardHeader>
              <CardContent className="p-4 md:p-6">
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={financialsData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="period" tick={{ fontSize: 11, fill: "#64748b" }} />
                      <YAxis
                        tick={{ fontSize: 11, fill: "#64748b" }}
                        tickFormatter={(v) => `${(v / 1000).toFixed(0)}T`}
                      />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            const d = payload[0].payload;
                            return (
                              <div className="bg-slate-900 text-white p-3.5 rounded-xl shadow-xl text-xs space-y-1.5 min-w-[200px]">
                                <p className="font-bold text-sm text-cyan-400 border-b border-slate-800 pb-1">
                                  {label}
                                </p>
                                {d.actualSalesVolumeKg !== null && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">Actual Sales:</span>
                                    <span className="font-bold text-emerald-400">{fmtNum(d.actualSalesVolumeKg)} kg</span>
                                  </div>
                                )}
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Predicted Demand:</span>
                                  <span className="font-bold text-blue-400">{fmtNum(d.predictedSalesVolumeKg)} kg</span>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="actualSalesVolumeKg" name="Actual Sales (kg)" fill="#059669" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="predictedSalesVolumeKg" name="Predicted Demand (kg)" fill="#3b82f6" radius={[4, 4, 0, 0]} opacity={0.7} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
