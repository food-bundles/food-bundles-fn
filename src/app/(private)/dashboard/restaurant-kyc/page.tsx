"use client";

import { useState } from "react";
import {
  ChevronRight,
  Users,
  Lightbulb,
  UtensilsCrossed,
  MapPin,
  Tag,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Star,
  DollarSign,
} from "lucide-react";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const segmentationData = [
  { id: 1, name: "Kigali Fine Dining", medianPrice: 12500, p90Price: 28000, tier: "Premium", risk: "Low", items: 42 },
  { id: 2, name: "Mama Africa Kitchen", medianPrice: 2800, p90Price: 5500, tier: "Budget", risk: "High", items: 18 },
  { id: 3, name: "Green Garden Bistro", medianPrice: 6500, p90Price: 14000, tier: "Mid-Range", risk: "Medium", items: 31 },
  { id: 4, name: "Nyamirambo Grill", medianPrice: 3200, p90Price: 7000, tier: "Budget", risk: "High", items: 22 },
  { id: 5, name: "The Rooftop Lounge", medianPrice: 15000, p90Price: 35000, tier: "Premium", risk: "Low", items: 55 },
  { id: 6, name: "Quick Bites Express", medianPrice: 1800, p90Price: 3500, tier: "Budget", risk: "High", items: 12 },
];

const menuSuggestions = [
  { id: 1, restaurant: "Mama Africa Kitchen", item: "Grilled Tilapia", margin: 68, competitorPrice: 4500, suggestedPrice: 3800, wholesaleCost: 1200, reason: "High demand in zone, low competition" },
  { id: 2, restaurant: "Nyamirambo Grill", item: "Brochettes Platter", margin: 72, competitorPrice: 5000, suggestedPrice: 4200, wholesaleCost: 1180, reason: "Top seller among nearby restaurants" },
  { id: 3, restaurant: "Green Garden Bistro", item: "Avocado Salad", margin: 80, competitorPrice: 3500, suggestedPrice: 2800, wholesaleCost: 560, reason: "Low wholesale cost, high perceived value" },
  { id: 4, restaurant: "Quick Bites Express", item: "Chapati & Beans", margin: 65, competitorPrice: 1500, suggestedPrice: 1200, wholesaleCost: 420, reason: "Popular budget item in the area" },
];

const menuItems = [
  { id: 1, restaurant: "Kigali Fine Dining", item: "Beef Tenderloin", portion: "250g", price: 22000, category: "Main Course", avgOrderValue: 38000, status: "Active" },
  { id: 2, restaurant: "Kigali Fine Dining", item: "Caesar Salad", portion: "180g", price: 8500, category: "Starter", avgOrderValue: 38000, status: "Active" },
  { id: 3, restaurant: "Mama Africa Kitchen", item: "Ugali & Stew", portion: "400g", price: 2500, category: "Main Course", avgOrderValue: 3200, status: "Active" },
  { id: 4, restaurant: "Green Garden Bistro", item: "Pasta Primavera", portion: "300g", price: 7000, category: "Main Course", avgOrderValue: 12000, status: "Active" },
  { id: 5, restaurant: "Nyamirambo Grill", item: "Mixed Grill", portion: "350g", price: 6500, category: "Main Course", avgOrderValue: 8500, status: "Active" },
  { id: 6, restaurant: "Quick Bites Express", item: "Samosa (3pcs)", portion: "150g", price: 800, category: "Snack", avgOrderValue: 1500, status: "Active" },
];

const zoneBenchmarks = [
  { id: 1, restaurant: "Mama Africa Kitchen", zone: "Nyamirambo", lat: -1.9706, lng: 30.0444, avgZonePrice: 3500, restaurantAvg: 2800, deviation: -20, flag: "Under-priced", peers: 8 },
  { id: 2, restaurant: "The Rooftop Lounge", zone: "Kiyovu", lat: -1.9441, lng: 30.0619, avgZonePrice: 14000, restaurantAvg: 15000, deviation: +7, flag: "Normal", peers: 5 },
  { id: 3, restaurant: "Green Garden Bistro", zone: "Kimihurura", lat: -1.9355, lng: 30.0877, avgZonePrice: 6000, restaurantAvg: 6500, deviation: +8, flag: "Normal", peers: 11 },
  { id: 4, restaurant: "Quick Bites Express", zone: "Remera", lat: -1.9536, lng: 30.1127, avgZonePrice: 2200, restaurantAvg: 1800, deviation: -18, flag: "Under-priced", peers: 14 },
  { id: 5, restaurant: "Kigali Fine Dining", zone: "Kiyovu", lat: -1.9441, lng: 30.0619, avgZonePrice: 14000, restaurantAvg: 12500, deviation: -11, flag: "Normal", peers: 5 },
];

const classificationData = [
  { id: 1, restaurant: "Kigali Fine Dining", type: "Fine Dining", tags: ["Steak", "Wine", "Seafood", "Desserts"], creditLimit: 5000000, score: 92, recommendation: "Approved" },
  { id: 2, restaurant: "Mama Africa Kitchen", type: "Local Cuisine", tags: ["Ugali", "Stew", "Grilled Meat"], creditLimit: 500000, score: 48, recommendation: "Review" },
  { id: 3, restaurant: "Green Garden Bistro", type: "Bistro", tags: ["Salads", "Pasta", "Sandwiches", "Coffee"], creditLimit: 1500000, score: 71, recommendation: "Approved" },
  { id: 4, restaurant: "Nyamirambo Grill", type: "Grill House", tags: ["Brochettes", "Grilled Chicken", "Fries"], creditLimit: 750000, score: 55, recommendation: "Review" },
  { id: 5, restaurant: "The Rooftop Lounge", type: "Fine Dining", tags: ["Cocktails", "Sushi", "Tapas", "Desserts"], creditLimit: 8000000, score: 96, recommendation: "Approved" },
  { id: 6, restaurant: "Quick Bites Express", type: "Fast Food", tags: ["Samosa", "Chapati", "Juice"], creditLimit: 200000, score: 32, recommendation: "Declined" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const tierColor = (tier: string) => {
  if (tier === "Premium") return "bg-purple-100 text-purple-700";
  if (tier === "Mid-Range") return "bg-blue-100 text-blue-700";
  return "bg-gray-100 text-gray-600";
};

const riskColor = (risk: string) => {
  if (risk === "Low") return "bg-green-100 text-green-700";
  if (risk === "Medium") return "bg-amber-100 text-amber-700";
  return "bg-red-100 text-red-700";
};

const flagColor = (flag: string) => {
  if (flag === "Normal") return "bg-green-100 text-green-700";
  if (flag === "Over-priced") return "bg-red-100 text-red-700";
  return "bg-amber-100 text-amber-700";
};

const recommendationColor = (rec: string) => {
  if (rec === "Approved") return "bg-green-100 text-green-700";
  if (rec === "Review") return "bg-amber-100 text-amber-700";
  return "bg-red-100 text-red-700";
};

const scoreColor = (score: number) => {
  if (score >= 75) return "text-green-600";
  if (score >= 50) return "text-amber-600";
  return "text-red-600";
};

const fmt = (n: number) => n.toLocaleString("en-RW") + " RWF";

// ─── Tab Components ───────────────────────────────────────────────────────────

function SegmentationTab() {
  const summary = {
    premium: segmentationData.filter(r => r.tier === "Premium").length,
    midRange: segmentationData.filter(r => r.tier === "Mid-Range").length,
    budget: segmentationData.filter(r => r.tier === "Budget").length,
    lowRisk: segmentationData.filter(r => r.risk === "Low").length,
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Premium Tier", value: summary.premium, color: "bg-purple-50 text-purple-700", icon: Star },
          { label: "Mid-Range Tier", value: summary.midRange, color: "bg-blue-50 text-blue-700", icon: TrendingUp },
          { label: "Budget Tier", value: summary.budget, color: "bg-gray-50 text-gray-700", icon: DollarSign },
          { label: "Low Risk", value: summary.lowRisk, color: "bg-green-50 text-green-700", icon: CheckCircle },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className={`p-4 rounded-lg border ${color} transition-all duration-200 hover:shadow-md`}>
            <Icon className="w-5 h-5 mb-2 opacity-70" />
            <p className="text-xs font-medium">{label}</p>
            <p className="text-xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-[13px]">
          <thead className="bg-gray-50 border-b">
            <tr>
              {["Restaurant", "Median Price", "90th Percentile", "Items", "Tier", "Risk"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {segmentationData.map(r => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{r.name}</td>
                <td className="px-4 py-3 text-gray-600">{fmt(r.medianPrice)}</td>
                <td className="px-4 py-3 text-gray-600">{fmt(r.p90Price)}</td>
                <td className="px-4 py-3 text-gray-600">{r.items}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${tierColor(r.tier)}`}>{r.tier}</span></td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${riskColor(r.risk)}`}>{r.risk}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MenuSuggestionTab() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: "Suggestions Generated", value: menuSuggestions.length, color: "bg-emerald-50 text-emerald-700" },
          { label: "Avg Margin", value: Math.round(menuSuggestions.reduce((s, i) => s + i.margin, 0) / menuSuggestions.length) + "%", color: "bg-blue-50 text-blue-700" },
          { label: "Restaurants Covered", value: new Set(menuSuggestions.map(i => i.restaurant)).size, color: "bg-purple-50 text-purple-700" },
        ].map(({ label, value, color }) => (
          <div key={label} className={`p-4 rounded-lg border ${color} transition-all duration-200 hover:shadow-md`}>
            <p className="text-xs font-medium">{label}</p>
            <p className="text-xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4">
        {menuSuggestions.map(s => (
          <div key={s.id} className="border rounded-lg p-4 hover:shadow-md transition-all duration-200 bg-white">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-semibold text-gray-900 text-[14px]">{s.item}</p>
                <p className="text-[12px] text-gray-500">{s.restaurant}</p>
              </div>
              <span className="bg-green-100 text-green-700 text-[11px] font-bold px-2 py-1 rounded-full">{s.margin}% margin</span>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div className="bg-gray-50 rounded p-2">
                <p className="text-[10px] text-gray-500">Wholesale Cost</p>
                <p className="text-[13px] font-semibold text-gray-800">{fmt(s.wholesaleCost)}</p>
              </div>
              <div className="bg-gray-50 rounded p-2">
                <p className="text-[10px] text-gray-500">Suggested Price</p>
                <p className="text-[13px] font-semibold text-emerald-700">{fmt(s.suggestedPrice)}</p>
              </div>
              <div className="bg-gray-50 rounded p-2">
                <p className="text-[10px] text-gray-500">Competitor Price</p>
                <p className="text-[13px] font-semibold text-gray-800">{fmt(s.competitorPrice)}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[12px] text-gray-500">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              {s.reason}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MenuGenerationTab() {
  const [filter, setFilter] = useState("All");
  const restaurants = ["All", ...Array.from(new Set(menuItems.map(i => i.restaurant)))];
  const filtered = filter === "All" ? menuItems : menuItems.filter(i => i.restaurant === filter);

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {restaurants.map(r => (
          <button
            key={r}
            onClick={() => setFilter(r)}
            className={`px-3 py-1.5 text-[12px] rounded-full border transition-colors ${
              filter === r ? "bg-green-700 text-white border-green-700" : "bg-white text-gray-600 border-gray-300 hover:border-green-500"
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-[13px]">
          <thead className="bg-gray-50 border-b">
            <tr>
              {["Restaurant", "Item Name", "Category", "Portion", "Price", "Avg Order Value", "Status"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(item => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-700">{item.restaurant}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{item.item}</td>
                <td className="px-4 py-3"><span className="bg-blue-50 text-blue-700 text-[11px] px-2 py-0.5 rounded-full">{item.category}</span></td>
                <td className="px-4 py-3 text-gray-600">{item.portion}</td>
                <td className="px-4 py-3 font-semibold text-gray-900">{fmt(item.price)}</td>
                <td className="px-4 py-3 text-gray-600">{fmt(item.avgOrderValue)}</td>
                <td className="px-4 py-3"><span className="bg-green-100 text-green-700 text-[11px] px-2 py-0.5 rounded-full">{item.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ZoneBenchmarkingTab() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: "Zones Analyzed", value: new Set(zoneBenchmarks.map(z => z.zone)).size, color: "bg-blue-50 text-blue-700" },
          { label: "Under-priced", value: zoneBenchmarks.filter(z => z.flag === "Under-priced").length, color: "bg-amber-50 text-amber-700" },
          { label: "Normal Range", value: zoneBenchmarks.filter(z => z.flag === "Normal").length, color: "bg-green-50 text-green-700" },
        ].map(({ label, value, color }) => (
          <div key={label} className={`p-4 rounded-lg border ${color} transition-all duration-200 hover:shadow-md`}>
            <p className="text-xs font-medium">{label}</p>
            <p className="text-xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-[13px]">
          <thead className="bg-gray-50 border-b">
            <tr>
              {["Restaurant", "Zone", "Zone Avg Price", "Restaurant Avg", "Deviation", "Peers", "Flag"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {zoneBenchmarks.map(z => (
              <tr key={z.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{z.restaurant}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 text-gray-600">
                    <MapPin className="w-3 h-3" />{z.zone}
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">{fmt(z.avgZonePrice)}</td>
                <td className="px-4 py-3 text-gray-600">{fmt(z.restaurantAvg)}</td>
                <td className="px-4 py-3">
                  <div className={`flex items-center gap-1 font-semibold ${z.deviation < 0 ? "text-amber-600" : "text-green-600"}`}>
                    {z.deviation < 0 ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
                    {z.deviation > 0 ? "+" : ""}{z.deviation}%
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">{z.peers} restaurants</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${flagColor(z.flag)}`}>{z.flag}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ClassificationTab() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Approved", value: classificationData.filter(r => r.recommendation === "Approved").length, color: "bg-green-50 text-green-700" },
          { label: "Under Review", value: classificationData.filter(r => r.recommendation === "Review").length, color: "bg-amber-50 text-amber-700" },
          { label: "Declined", value: classificationData.filter(r => r.recommendation === "Declined").length, color: "bg-red-50 text-red-700" },
          { label: "Avg Credit Score", value: Math.round(classificationData.reduce((s, r) => s + r.score, 0) / classificationData.length), color: "bg-blue-50 text-blue-700" },
        ].map(({ label, value, color }) => (
          <div key={label} className={`p-4 rounded-lg border ${color} transition-all duration-200 hover:shadow-md`}>
            <p className="text-xs font-medium">{label}</p>
            <p className="text-xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4">
        {classificationData.map(r => (
          <div key={r.id} className="border rounded-lg p-4 hover:shadow-md transition-all duration-200 bg-white">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-semibold text-gray-900 text-[14px]">{r.restaurant}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Tag className="w-3 h-3 text-gray-400" />
                  <p className="text-[12px] text-gray-500">{r.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-lg font-bold ${scoreColor(r.score)}`}>{r.score}</span>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${recommendationColor(r.recommendation)}`}>{r.recommendation}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-1.5">
                {r.tags.map(tag => (
                  <span key={tag} className="bg-gray-100 text-gray-600 text-[11px] px-2 py-0.5 rounded-full">{tag}</span>
                ))}
              </div>
              <div className="text-right ml-4 shrink-0">
                <p className="text-[10px] text-gray-500">Credit Limit</p>
                <p className="text-[13px] font-bold text-gray-800">{fmt(r.creditLimit)}</p>
              </div>
            </div>
            <div className="mt-3">
              <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                <span>Credit Score</span><span>{r.score}/100</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full ${r.score >= 75 ? "bg-green-500" : r.score >= 50 ? "bg-amber-500" : "bg-red-500"}`}
                  style={{ width: `${r.score}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const tabs = [
  { key: "segmentation", label: "Customer Segmentation", icon: Users },
  { key: "suggestion", label: "Menu Suggestion", icon: Lightbulb },
  { key: "generation", label: "Menu Generation", icon: UtensilsCrossed },
  { key: "benchmarking", label: "Zone Benchmarking", icon: MapPin },
  { key: "classification", label: "Classification", icon: Tag },
];

export default function RestaurantKYCPage() {
  const [activeTab, setActiveTab] = useState("segmentation");

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center text-sm text-gray-500 font-medium space-x-1">
          <span>Dashboard</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900">Restaurant KYC & Credit Scoring</span>
        </div>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Restaurant KYC & Credit Risk Scoring</h1>
          <span className="text-[11px] bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Mock Data
          </span>
        </div>
        <p className="text-[13px] text-gray-500">Analyze restaurant risk profiles, menu performance, and credit eligibility.</p>
      </div>

      {/* Tab Nav */}
      <div className="border-b border-gray-200">
        <div className="flex gap-0 overflow-x-auto scrollbar-hide">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-4 py-3 text-[13px] font-medium border-b-2 whitespace-nowrap transition-colors ${
                activeTab === key
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-800"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "segmentation" && <SegmentationTab />}
        {activeTab === "suggestion" && <MenuSuggestionTab />}
        {activeTab === "generation" && <MenuGenerationTab />}
        {activeTab === "benchmarking" && <ZoneBenchmarkingTab />}
        {activeTab === "classification" && <ClassificationTab />}
      </div>
    </div>
  );
}
