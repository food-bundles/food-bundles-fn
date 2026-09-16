"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
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
  X,
  Phone,
  Globe,
  Utensils,
  Building2,
  Sparkles,
  Plus,
} from "lucide-react";
import "leaflet/dist/leaflet.css";

const ZoneMap = dynamic(() => import("./_components/zone-map"), { ssr: false });

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
  { id: 1, restaurant: "Mama Africa Kitchen", zone: "Nyamirambo", lat: -1.9706, lng: 30.0444, avgZonePrice: 3500, restaurantAvg: 2800, deviation: -20, flag: "Under-priced", peers: 8, phone: "+250 788 123 456", cuisine: "Local Rwandan", address: "KN 4 Ave, Nyamirambo", established: 2018, rating: 4.2, monthlyOrders: 320 },
  { id: 2, restaurant: "The Rooftop Lounge", zone: "Kiyovu", lat: -1.9441, lng: 30.0619, avgZonePrice: 14000, restaurantAvg: 15000, deviation: +7, flag: "Normal", peers: 5, phone: "+250 788 234 567", cuisine: "Fine Dining & Cocktails", address: "KG 7 Ave, Kiyovu", established: 2020, rating: 4.7, monthlyOrders: 180 },
  { id: 3, restaurant: "Green Garden Bistro", zone: "Kimihurura", lat: -1.9355, lng: 30.0877, avgZonePrice: 6000, restaurantAvg: 6500, deviation: +8, flag: "Normal", peers: 11, phone: "+250 788 345 678", cuisine: "Bistro & Salads", address: "KG 11 Ave, Kimihurura", established: 2019, rating: 4.4, monthlyOrders: 245 },
  { id: 4, restaurant: "Quick Bites Express", zone: "Remera", lat: -1.9536, lng: 30.1127, avgZonePrice: 2200, restaurantAvg: 1800, deviation: -18, flag: "Under-priced", peers: 14, phone: "+250 788 456 789", cuisine: "Fast Food", address: "KN 3 Road, Remera", established: 2021, rating: 3.9, monthlyOrders: 510 },
  { id: 5, restaurant: "Kigali Fine Dining", zone: "Kiyovu", lat: -1.9441, lng: 30.0619, avgZonePrice: 14000, restaurantAvg: 12500, deviation: -11, flag: "Normal", peers: 5, phone: "+250 788 567 890", cuisine: "Fine Dining & Seafood", address: "KG 5 Ave, Kiyovu", established: 2017, rating: 4.8, monthlyOrders: 145 },
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
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const summary = {
    premium: segmentationData.filter(r => r.tier === "Premium").length,
    midRange: segmentationData.filter(r => r.tier === "Mid-Range").length,
    budget: segmentationData.filter(r => r.tier === "Budget").length,
    lowRisk: segmentationData.filter(r => r.risk === "Low").length,
  };

  const filterCards = [
    { key: "Premium", label: "Premium Tier", value: summary.premium, color: "bg-purple-50 text-purple-700", activeColor: "bg-purple-600 text-white", icon: Star },
    { key: "Mid-Range", label: "Mid-Range Tier", value: summary.midRange, color: "bg-blue-50 text-blue-700", activeColor: "bg-blue-600 text-white", icon: TrendingUp },
    { key: "Budget", label: "Budget Tier", value: summary.budget, color: "bg-gray-50 text-gray-700", activeColor: "bg-gray-600 text-white", icon: DollarSign },
    { key: "Low Risk", label: "Low Risk", value: summary.lowRisk, color: "bg-green-50 text-green-700", activeColor: "bg-green-600 text-white", icon: CheckCircle },
  ];

  const filteredData = segmentationData.filter(r => {
    if (!activeFilter) return true;
    if (activeFilter === "Low Risk") return r.risk === "Low";
    return r.tier === activeFilter;
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {filterCards.map(({ key, label, value, color, activeColor, icon: Icon }) => {
          const isActive = activeFilter === key;
          return (
            <button
              key={key}
              onClick={() => setActiveFilter(isActive ? null : key)}
              className={`p-4 rounded-lg border text-left transition-all duration-200 hover:shadow-md ${
                isActive ? activeColor : color
              }`}
            >
              <Icon className="w-5 h-5 mb-2 opacity-70" />
              <p className="text-xs font-medium">{label}</p>
              <p className="text-xl font-bold">{value}</p>
            </button>
          );
        })}
      </div>

      {activeFilter && (
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>Showing {filteredData.length} of {segmentationData.length} restaurants</span>
          <button
            onClick={() => setActiveFilter(null)}
            className="text-green-600 hover:text-green-700 font-semibold underline"
          >
            Clear filter
          </button>
        </div>
      )}

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
            {filteredData.map(r => (
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

function MenuIntelligenceTab() {
  const [filter, setFilter] = useState("All");
  const [activeView, setActiveView] = useState<"suggestions" | "catalog" | "generate">("suggestions");
  const restaurants = ["All", ...Array.from(new Set(menuItems.map(i => i.restaurant)))];
  const filtered = filter === "All" ? menuItems : menuItems.filter(i => i.restaurant === filter);

  // ── Generate Menu State ──
  const [genRestaurant, setGenRestaurant] = useState("");
  const [cuisineType, setCuisineType] = useState("Rwandan");
  const [targetMargin, setTargetMargin] = useState(65);
  const [itemCount, setItemCount] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedItems, setGeneratedItems] = useState<Array<{
    name: string;
    category: string;
    portion: string;
    wholesaleCost: number;
    suggestedPrice: number;
    margin: number;
    competitorPrice: number;
    reasoning: string;
  }>>([]);

  const cuisineTypes = ["Rwandan", "Continental", "Asian Fusion", "Grill & BBQ", "Seafood", "Vegetarian", "Fast Food", "Cafe & Bakery"];

  const mockGeneratedItems = [
    { name: "Grilled Tilapia Fillet", category: "Main Course", portion: "300g", wholesaleCost: 1800, suggestedPrice: 4200, margin: 57, competitorPrice: 4500, reasoning: "High demand in zone, premium positioning" },
    { name: "Isombe Cassava Leaves", category: "Traditional", portion: "250g", wholesaleCost: 600, suggestedPrice: 1800, margin: 67, competitorPrice: 2000, reasoning: "Authentic Rwandan dish, low competition" },
    { name: "Brochette Platter Special", category: "Grill", portion: "350g", wholesaleCost: 1200, suggestedPrice: 3500, margin: 66, competitorPrice: 3800, reasoning: "Top seller across Kigali restaurants" },
    { name: "Avocado Mango Salad", category: "Starter", portion: "200g", wholesaleCost: 450, suggestedPrice: 1800, margin: 75, competitorPrice: 2000, reasoning: "High margin, trending health option" },
    { name: "Rwandan Coffee Cake", category: "Dessert", portion: "150g", wholesaleCost: 350, suggestedPrice: 1500, margin: 77, competitorPrice: 1600, reasoning: "Unique local ingredient, high perceived value" },
    { name: "Ugali & Goat Stew", category: "Traditional", portion: "400g", wholesaleCost: 800, suggestedPrice: 2500, margin: 68, competitorPrice: 2800, reasoning: "Comfort food, consistent demand" },
    { name: "Grilled Chicken Wings", category: "Starter", portion: "250g", wholesaleCost: 700, suggestedPrice: 2200, margin: 68, competitorPrice: 2400, reasoning: "Popular appetizer, shareable format" },
    { name: "Chapati Wrap Deluxe", category: "Fast Food", portion: "200g", wholesaleCost: 300, suggestedPrice: 1200, margin: 75, competitorPrice: 1400, reasoning: "Budget-friendly, high volume potential" },
  ];

  const handleGenerate = () => {
    if (!genRestaurant) return;
    setIsGenerating(true);
    setGeneratedItems([]);
    setTimeout(() => {
      const shuffled = [...mockGeneratedItems].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, itemCount).map(item => {
        const marginFactor = targetMargin / 65;
        const adjustedPrice = Math.round(item.suggestedPrice * marginFactor);
        return {
          ...item,
          suggestedPrice: adjustedPrice,
          margin: Math.round(((adjustedPrice - item.wholesaleCost) / adjustedPrice) * 100),
        };
      });
      setGeneratedItems(selected);
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Suggestions Generated", value: menuSuggestions.length, color: "bg-emerald-50 text-emerald-700" },
          { label: "Avg Margin", value: Math.round(menuSuggestions.reduce((s, i) => s + i.margin, 0) / menuSuggestions.length) + "%", color: "bg-blue-50 text-blue-700" },
          { label: "Restaurants Covered", value: new Set([...menuSuggestions.map(i => i.restaurant), ...menuItems.map(i => i.restaurant)]).size, color: "bg-purple-50 text-purple-700" },
          { label: "Menu Items", value: menuItems.length, color: "bg-amber-50 text-amber-700" },
        ].map(({ label, value, color }) => (
          <div key={label} className={`p-4 rounded-lg border ${color} transition-all duration-200 hover:shadow-md`}>
            <p className="text-xs font-medium">{label}</p>
            <p className="text-xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      {/* Sub-view Toggle */}
      <div className="flex gap-0.5 bg-gray-100 p-1 rounded-xl w-fit">
        {[
          { key: "suggestions" as const, label: "AI Suggestions", icon: Lightbulb },
          { key: "catalog" as const, label: "Menu Catalog", icon: UtensilsCrossed },
          { key: "generate" as const, label: "Generate Menu", icon: Sparkles },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveView(key)}
            className={`px-4 py-2 text-[12px] font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeView === key ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* AI Suggestions View */}
      {activeView === "suggestions" && (
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
      )}

      {/* Menu Catalog View */}
      {activeView === "catalog" && (
        <>
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
        </>
      )}

      {/* Generate Menu View */}
      {activeView === "generate" && (
        <div className="space-y-4">
          {/* Generation Form */}
          <div className="border rounded-lg p-5 bg-white">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-green-600" />
              <h3 className="text-sm font-bold text-gray-900">AI Menu Generator</h3>
            </div>
            <p className="text-[12px] text-gray-500 mb-4">
              Configure parameters below and generate optimized menu items for your restaurant.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-gray-600">Restaurant</label>
                <select
                  value={genRestaurant}
                  onChange={(e) => setGenRestaurant(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-gray-200 text-[13px] bg-white outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select restaurant...</option>
                  {Array.from(new Set(menuItems.map(i => i.restaurant))).map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-gray-600">Cuisine Type</label>
                <select
                  value={cuisineType}
                  onChange={(e) => setCuisineType(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-gray-200 text-[13px] bg-white outline-none focus:ring-2 focus:ring-green-500"
                >
                  {cuisineTypes.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-gray-600">Target Margin ({targetMargin}%)</label>
                <input
                  type="range"
                  min={20}
                  max={90}
                  value={targetMargin}
                  onChange={(e) => setTargetMargin(Number(e.target.value))}
                  className="w-full accent-green-600"
                />
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>20%</span>
                  <span>90%</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-gray-600">Items to Generate</label>
                <select
                  value={itemCount}
                  onChange={(e) => setItemCount(Number(e.target.value))}
                  className="w-full p-2.5 rounded-lg border border-gray-200 text-[13px] bg-white outline-none focus:ring-2 focus:ring-green-500"
                >
                  {[3, 5, 7, 10].map(n => (
                    <option key={n} value={n}>{n} items</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={!genRestaurant || isGenerating}
              className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white text-[13px] font-bold rounded-lg hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Menu
                </>
              )}
            </button>
          </div>

          {/* Generated Results */}
          {generatedItems.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900">
                  Generated Items ({generatedItems.length})
                </h3>
                <span className="text-[11px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                  Avg {Math.round(generatedItems.reduce((s, i) => s + i.margin, 0) / generatedItems.length)}% margin
                </span>
              </div>

              <div className="grid gap-3">
                {generatedItems.map((item, idx) => (
                  <div key={idx} className="border rounded-lg p-4 bg-white hover:shadow-md transition-all duration-200">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold text-gray-900 text-[14px]">{item.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="bg-blue-50 text-blue-700 text-[10px] font-medium px-2 py-0.5 rounded-full">{item.category}</span>
                          <span className="text-[11px] text-gray-400">{item.portion}</span>
                        </div>
                      </div>
                      <span className="bg-green-100 text-green-700 text-[11px] font-bold px-2 py-1 rounded-full">{item.margin}% margin</span>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div className="bg-gray-50 rounded p-2">
                        <p className="text-[10px] text-gray-500">Wholesale Cost</p>
                        <p className="text-[13px] font-semibold text-gray-800">{fmt(item.wholesaleCost)}</p>
                      </div>
                      <div className="bg-emerald-50 rounded p-2">
                        <p className="text-[10px] text-emerald-600">Suggested Price</p>
                        <p className="text-[13px] font-bold text-emerald-700">{fmt(item.suggestedPrice)}</p>
                      </div>
                      <div className="bg-gray-50 rounded p-2">
                        <p className="text-[10px] text-gray-500">Competitor Price</p>
                        <p className="text-[13px] font-semibold text-gray-800">{fmt(item.competitorPrice)}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[12px] text-gray-500">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                        {item.reasoning}
                      </div>
                      <button className="text-[11px] font-semibold text-green-600 hover:text-green-700 flex items-center gap-1">
                        <Plus className="w-3 h-3" />
                        Add to Menu
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ZoneBenchmarkingTab() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selected = zoneBenchmarks.find((z) => z.id === selectedId);

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
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

      {/* Map */}
      <ZoneMap
        restaurants={zoneBenchmarks}
        selectedId={selectedId}
        onSelect={(id) => setSelectedId(id === selectedId ? null : id)}
      />

      {/* Table + Detail Panel */}
      <div className="flex gap-4">
        {/* Table */}
        <div className={`border rounded-lg overflow-hidden transition-all duration-300 ${selected ? "flex-1" : "w-full"}`}>
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
                <tr
                  key={z.id}
                  onClick={() => setSelectedId(z.id === selectedId ? null : z.id)}
                  className={`cursor-pointer transition-colors ${
                    z.id === selectedId
                      ? "bg-green-50 border-l-2 border-l-green-600"
                      : "hover:bg-gray-50"
                  }`}
                >
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

        {/* Detail Panel */}
        {selected && (
          <div className="w-80 shrink-0 border rounded-lg bg-white shadow-sm overflow-hidden animate-in slide-in-from-right">
            <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900 truncate">{selected.restaurant}</h3>
              <button
                onClick={() => setSelectedId(null)}
                className="p-1 rounded hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              {/* Zone & Flag */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-gray-600 text-xs">
                  <MapPin className="w-3.5 h-3.5" />
                  {selected.zone}
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${flagColor(selected.flag)}`}>
                  {selected.flag}
                </span>
              </div>

              {/* Price Comparison */}
              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Price Comparison</p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-[10px] text-gray-500">Zone Average</p>
                    <p className="text-sm font-bold text-gray-900">{fmt(selected.avgZonePrice)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500">Restaurant Avg</p>
                    <p className="text-sm font-bold text-gray-900">{fmt(selected.restaurantAvg)}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-gray-200">
                  <span className="text-[10px] text-gray-500">Deviation</span>
                  <span className={`text-sm font-bold ${selected.deviation < 0 ? "text-amber-600" : "text-green-600"}`}>
                    {selected.deviation > 0 ? "+" : ""}{selected.deviation}%
                  </span>
                </div>
              </div>

              {/* Restaurant Info */}
              <div className="space-y-2.5">
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Restaurant Info</p>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Utensils className="w-3.5 h-3.5 text-gray-400" />
                  {selected.cuisine}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Building2 className="w-3.5 h-3.5 text-gray-400" />
                  {selected.address}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  {selected.phone}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Globe className="w-3.5 h-3.5 text-gray-400" />
                  Est. {selected.established}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-blue-50 rounded-lg p-2.5 text-center">
                  <p className="text-lg font-bold text-blue-700">{selected.rating}</p>
                  <p className="text-[10px] text-blue-600">Rating</p>
                </div>
                <div className="bg-green-50 rounded-lg p-2.5 text-center">
                  <p className="text-lg font-bold text-green-700">{selected.monthlyOrders}</p>
                  <p className="text-[10px] text-green-600">Monthly Orders</p>
                </div>
              </div>

              {/* Peer Count */}
              <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                <p className="text-xs text-gray-500">Zone Peers</p>
                <p className="text-sm font-bold text-gray-900">{selected.peers} restaurants in {selected.zone}</p>
              </div>
            </div>
          </div>
        )}
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
  { key: "menu", label: "Menu Intelligence", icon: Lightbulb },
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
        {activeTab === "menu" && <MenuIntelligenceTab />}
        {activeTab === "benchmarking" && <ZoneBenchmarkingTab />}
        {activeTab === "classification" && <ClassificationTab />}
      </div>
    </div>
  );
}
