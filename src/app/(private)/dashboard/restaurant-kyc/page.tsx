"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
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
  RefreshCw,
} from "lucide-react";
import "leaflet/dist/leaflet.css";
import { restaurantService } from "@/app/services/restaurantService";

const ZoneMap = dynamic(() => import("./_components/zone-map"), { ssr: false });

// ─── Types ───────────────────────────────────────────────────────────────────

export interface RegisteredRestaurantItem {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  location?: string | null;
  district?: string | null;
  sector?: string | null;
  ordersCount?: number;
  totalSpent?: number;
}

export interface MenuItemData {
  id: string | number;
  restaurant: string;
  item: string;
  portion: string;
  price: number;
  category: string;
  avgOrderValue: number;
  status: string;
}

export interface MenuSuggestionData {
  id: string | number;
  restaurant: string;
  item: string;
  margin: number;
  competitorPrice: number;
  suggestedPrice: number;
  wholesaleCost: number;
  reason: string;
}

export interface ZoneBenchmarkData {
  id: string | number;
  restaurant: string;
  zone: string;
  lat: number;
  lng: number;
  avgZonePrice: number;
  restaurantAvg: number;
  deviation: number;
  flag: "Normal" | "Under-priced" | "Over-priced";
  peers: number;
  phone: string;
  cuisine: string;
  address: string;
  established: number;
  rating: number;
  monthlyOrders: number;
}

export interface ClassificationData {
  id: string | number;
  restaurant: string;
  type: string;
  tags: string[];
  creditLimit: number;
  score: number;
  recommendation: "Approved" | "Review" | "Declined";
}

export interface RestaurantKYCProfile {
  id: string | number;
  restaurantId: string;
  name: string;
  phone: string;
  email: string;
  location: string;
  medianPrice: number;
  p90Price: number;
  tier: "Premium" | "Mid-Range" | "Budget";
  risk: "Low" | "Medium" | "High";
  items: number;
  zoneBenchmark: ZoneBenchmarkData;
  classification: ClassificationData;
  suggestions: MenuSuggestionData[];
  catalogItems: MenuItemData[];
}

// ─── Kigali Zone Coordinates & Defaults ──────────────────────────────────────

const KIGALI_ZONES: Record<string, { lat: number; lng: number; zone: string; avgZonePrice: number }> = {
  muhima: { lat: -1.9482, lng: 30.0571, zone: "Muhima", avgZonePrice: 3800 },
  kinyinya: { lat: -1.9189, lng: 30.0934, zone: "Kinyinya", avgZonePrice: 5500 },
  kimihurura: { lat: -1.9355, lng: 30.0877, zone: "Kimihurura", avgZonePrice: 6500 },
  kiyovu: { lat: -1.9441, lng: 30.0619, zone: "Kiyovu", avgZonePrice: 14000 },
  remera: { lat: -1.9536, lng: 30.1127, zone: "Remera", avgZonePrice: 3200 },
  nyamirambo: { lat: -1.9706, lng: 30.0444, zone: "Nyamirambo", avgZonePrice: 3500 },
  kacyiru: { lat: -1.9421, lng: 30.0812, zone: "Kacyiru", avgZonePrice: 6200 },
  gikondo: { lat: -1.9723, lng: 30.0815, zone: "Gikondo", avgZonePrice: 3000 },
  kanombe: { lat: -1.9680, lng: 30.1340, zone: "Kanombe", avgZonePrice: 4200 },
  nyabugogo: { lat: -1.9392, lng: 30.0446, zone: "Nyabugogo", avgZonePrice: 2800 },
  kigali: { lat: -1.9501, lng: 30.0587, zone: "Kigali Central", avgZonePrice: 7500 },
};

// ─── Realistic KYC Profile Templates ──────────────────────────────────────────

const PROFILE_ARCHETYPES = [
  {
    tier: "Premium" as const,
    risk: "Low" as const,
    medianPrice: 12500,
    p90Price: 28000,
    items: 42,
    defaultZone: "Kiyovu",
    defaultAddress: "KG 5 Ave, Kiyovu",
    cuisine: "Fine Dining & Seafood",
    established: 2018,
    rating: 4.8,
    monthlyOrders: 280,
    peers: 5,
    type: "Fine Dining",
    tags: ["Steak", "Wine", "Seafood", "Desserts"],
    creditLimit: 5000000,
    score: 92,
    recommendation: "Approved" as const,
    suggestions: [
      { item: "Beef Tenderloin Platter", margin: 74, competitorPrice: 24000, suggestedPrice: 21500, wholesaleCost: 5600, reason: "High perceived value, strong evening wine pairing demand" },
      { item: "Grilled Tilapia Fillet", margin: 68, competitorPrice: 14500, suggestedPrice: 12800, wholesaleCost: 4100, reason: "Consistent fresh lake supply, premium margin in zone" },
    ],
    catalog: [
      { item: "Beef Tenderloin", portion: "250g", price: 22000, category: "Main Course", avgOrderValue: 38000, status: "Active" },
      { item: "Caesar Salad", portion: "180g", price: 8500, category: "Starter", avgOrderValue: 38000, status: "Active" },
    ],
  },
  {
    tier: "Budget" as const,
    risk: "High" as const,
    medianPrice: 2800,
    p90Price: 5500,
    items: 18,
    defaultZone: "Muhima",
    defaultAddress: "KN 3 Ave, Muhima",
    cuisine: "Local Rwandan",
    established: 2020,
    rating: 4.2,
    monthlyOrders: 320,
    peers: 8,
    type: "Local Cuisine",
    tags: ["Ugali", "Stew", "Grilled Meat", "Isombe"],
    creditLimit: 500000,
    score: 48,
    recommendation: "Review" as const,
    suggestions: [
      { item: "Grilled Tilapia", margin: 68, competitorPrice: 4500, suggestedPrice: 3800, wholesaleCost: 1200, reason: "High demand in zone, low competition" },
      { item: "Isombe & Goat Combo", margin: 65, competitorPrice: 3200, suggestedPrice: 2700, wholesaleCost: 950, reason: "Popular lunch hour item with fast inventory turnaround" },
    ],
    catalog: [
      { item: "Ugali & Stew", portion: "400g", price: 2500, category: "Main Course", avgOrderValue: 3200, status: "Active" },
      { item: "Isombe with Beef", portion: "350g", price: 2800, category: "Main Course", avgOrderValue: 3400, status: "Active" },
    ],
  },
  {
    tier: "Mid-Range" as const,
    risk: "Medium" as const,
    medianPrice: 6500,
    p90Price: 14000,
    items: 31,
    defaultZone: "Kimihurura",
    defaultAddress: "KG 11 Ave, Kimihurura",
    cuisine: "Bistro & Salads",
    established: 2019,
    rating: 4.4,
    monthlyOrders: 245,
    peers: 11,
    type: "Bistro",
    tags: ["Salads", "Pasta", "Sandwiches", "Coffee"],
    creditLimit: 1500000,
    score: 71,
    recommendation: "Approved" as const,
    suggestions: [
      { item: "Avocado Salad", margin: 80, competitorPrice: 3500, suggestedPrice: 2800, wholesaleCost: 560, reason: "Low wholesale cost, high perceived value" },
      { item: "Pasta Primavera", margin: 70, competitorPrice: 7500, suggestedPrice: 6800, wholesaleCost: 2040, reason: "High customer retention among professionals" },
    ],
    catalog: [
      { item: "Pasta Primavera", portion: "300g", price: 7000, category: "Main Course", avgOrderValue: 12000, status: "Active" },
      { item: "Avocado Salad", portion: "200g", price: 4500, category: "Starter", avgOrderValue: 12000, status: "Active" },
    ],
  },
  {
    tier: "Budget" as const,
    risk: "High" as const,
    medianPrice: 3200,
    p90Price: 7000,
    items: 22,
    defaultZone: "Kinyinya",
    defaultAddress: "KG 9 Ave, Kinyinya",
    cuisine: "Grill House & BBQ",
    established: 2021,
    rating: 4.1,
    monthlyOrders: 280,
    peers: 9,
    type: "Grill House",
    tags: ["Brochettes", "Grilled Chicken", "Fries"],
    creditLimit: 750000,
    score: 55,
    recommendation: "Review" as const,
    suggestions: [
      { item: "Brochettes Platter", margin: 72, competitorPrice: 5000, suggestedPrice: 4200, wholesaleCost: 1180, reason: "Top seller among nearby restaurants" },
      { item: "Grilled Wings Special", margin: 66, competitorPrice: 4800, suggestedPrice: 3900, wholesaleCost: 1320, reason: "Strong weekend evening order surge" },
    ],
    catalog: [
      { item: "Mixed Grill", portion: "350g", price: 6500, category: "Main Course", avgOrderValue: 8500, status: "Active" },
      { item: "Beef Brochette (3pcs)", portion: "250g", price: 3200, category: "Grill", avgOrderValue: 8500, status: "Active" },
    ],
  },
  {
    tier: "Premium" as const,
    risk: "Low" as const,
    medianPrice: 15000,
    p90Price: 35000,
    items: 55,
    defaultZone: "Kigali Central",
    defaultAddress: "KG 7 Ave, Kigali",
    cuisine: "Fine Dining & Cocktails",
    established: 2020,
    rating: 4.7,
    monthlyOrders: 180,
    peers: 5,
    type: "Fine Dining",
    tags: ["Cocktails", "Sushi", "Tapas", "Desserts"],
    creditLimit: 8000000,
    score: 96,
    recommendation: "Approved" as const,
    suggestions: [
      { item: "Signature Tapas Platter", margin: 76, competitorPrice: 16000, suggestedPrice: 14500, wholesaleCost: 3500, reason: "High margin, premium cocktail pairing" },
      { item: "Glazed Salmon Steak", margin: 69, competitorPrice: 26000, suggestedPrice: 22000, wholesaleCost: 6800, reason: "Exclusive supplier advantage in Kigali central zone" },
    ],
    catalog: [
      { item: "Wagyu Brochette", portion: "220g", price: 28000, category: "Main Course", avgOrderValue: 42000, status: "Active" },
      { item: "Exotic Passion Tart", portion: "120g", price: 6500, category: "Dessert", avgOrderValue: 42000, status: "Active" },
    ],
  },
  {
    tier: "Budget" as const,
    risk: "High" as const,
    medianPrice: 1800,
    p90Price: 3500,
    items: 12,
    defaultZone: "Remera",
    defaultAddress: "KN 3 Road, Remera",
    cuisine: "Fast Food",
    established: 2021,
    rating: 3.9,
    monthlyOrders: 510,
    peers: 14,
    type: "Fast Food",
    tags: ["Samosa", "Chapati", "Juice"],
    creditLimit: 200000,
    score: 32,
    recommendation: "Declined" as const,
    suggestions: [
      { item: "Chapati & Beans", margin: 65, competitorPrice: 1500, suggestedPrice: 1200, wholesaleCost: 420, reason: "Popular budget item in the area" },
      { item: "Samosa Trio & Chai", margin: 70, competitorPrice: 1200, suggestedPrice: 900, wholesaleCost: 270, reason: "High frequency morning item" },
    ],
    catalog: [
      { item: "Samosa (3pcs)", portion: "150g", price: 800, category: "Snack", avgOrderValue: 1500, status: "Active" },
      { item: "Chapati & Beans", portion: "300g", price: 1200, category: "Main Course", avgOrderValue: 1500, status: "Active" },
    ],
  },
];

const FALLBACK_REGISTERED_RESTAURANTS: RegisteredRestaurantItem[] = [
  { id: "fd767a36-b35d-454a-8afe-c53de79fc874", name: "test Restaurant", email: "patrickmuvunyi77@gmail.com", phone: "0781632401", location: "Muhima" },
  { id: "0b0de45c-43e4-441b-9595-a068dbc6869b", name: "Food Bundles", email: "foodbundlesrw@gmail.com", phone: "0780117452", location: "Kinyinya" },
  { id: "ab344a3f-24e7-4368-bb52-f6b4fdc2c8f9", name: "FB Resort", email: "shikama@food.rw", phone: "0788963267", location: "Kigali" },
  { id: "db6746c5-bc5a-49b5-aa66-5d01866bcd4b", name: "Sostene Bananayo", email: "sbananayo98@gmail.com", phone: "0788724867", location: "Kimihurura" },
  { id: "1fe38ce3-c50b-4b55-8c94-b2e35837177c", name: "Restaurant", email: "restaurant@food.rw", phone: "0780000002", location: "Kiyovu" },
];

function buildRestaurantProfiles(rawRestaurants: RegisteredRestaurantItem[]): RestaurantKYCProfile[] {
  const list = rawRestaurants && rawRestaurants.length > 0 ? rawRestaurants : FALLBACK_REGISTERED_RESTAURANTS;

  return list.map((r, index) => {
    const arch = PROFILE_ARCHETYPES[index % PROFILE_ARCHETYPES.length];

    // Determine Zone & Coordinates
    const locKey = (r.location || r.district || arch.defaultZone).toLowerCase().trim();
    const matchedZone = KIGALI_ZONES[locKey] || {
      lat: -1.9441 + (index * 0.007) * (index % 2 === 0 ? 1 : -1),
      lng: 30.0619 + (index * 0.008) * (index % 3 === 0 ? 1 : -1),
      zone: r.location || arch.defaultZone,
      avgZonePrice: arch.medianPrice > 8000 ? 14000 : arch.medianPrice > 4000 ? 6000 : 3500,
    };

    const avgZonePrice = matchedZone.avgZonePrice;
    const restaurantAvg = arch.medianPrice;
    const deviation = Math.round(((restaurantAvg - avgZonePrice) / avgZonePrice) * 100);
    const flag: "Normal" | "Under-priced" | "Over-priced" =
      deviation < -15 ? "Under-priced" : deviation > 15 ? "Over-priced" : "Normal";

    const address = r.location
      ? `${r.location}, Kigali, Rwanda`
      : arch.defaultAddress;

    const phone = r.phone || `+250 788 ${String(100000 + index * 11111).slice(0, 6)}`;

    const zoneBenchmark: ZoneBenchmarkData = {
      id: r.id || index + 1,
      restaurant: r.name,
      zone: matchedZone.zone,
      lat: matchedZone.lat,
      lng: matchedZone.lng,
      avgZonePrice,
      restaurantAvg,
      deviation,
      flag,
      peers: arch.peers,
      phone,
      cuisine: arch.cuisine,
      address,
      established: arch.established,
      rating: arch.rating,
      monthlyOrders: r.ordersCount ? Math.max(r.ordersCount * 12, 120) : arch.monthlyOrders,
    };

    const classification: ClassificationData = {
      id: r.id || index + 1,
      restaurant: r.name,
      type: arch.type,
      tags: arch.tags,
      creditLimit: arch.creditLimit,
      score: arch.score,
      recommendation: arch.recommendation,
    };

    const suggestions: MenuSuggestionData[] = arch.suggestions.map((s, sIdx) => ({
      ...s,
      id: `${r.id}-sug-${sIdx}`,
      restaurant: r.name,
    }));

    const catalogItems: MenuItemData[] = arch.catalog.map((c, cIdx) => ({
      ...c,
      id: `${r.id}-item-${cIdx}`,
      restaurant: r.name,
    }));

    return {
      id: r.id || index + 1,
      restaurantId: r.id,
      name: r.name,
      phone,
      email: r.email || "",
      location: r.location || matchedZone.zone,
      medianPrice: arch.medianPrice,
      p90Price: arch.p90Price,
      tier: arch.tier,
      risk: arch.risk,
      items: arch.items,
      zoneBenchmark,
      classification,
      suggestions,
      catalogItems,
    };
  });
}

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

function SegmentationTab({ profiles }: { profiles: RestaurantKYCProfile[] }) {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const summary = {
    premium: profiles.filter((r) => r.tier === "Premium").length,
    midRange: profiles.filter((r) => r.tier === "Mid-Range").length,
    budget: profiles.filter((r) => r.tier === "Budget").length,
    lowRisk: profiles.filter((r) => r.risk === "Low").length,
  };

  const filterCards = [
    { key: "Premium", label: "Premium Tier", value: summary.premium, color: "bg-purple-50 text-purple-700", activeColor: "bg-purple-600 text-white", icon: Star },
    { key: "Mid-Range", label: "Mid-Range Tier", value: summary.midRange, color: "bg-blue-50 text-blue-700", activeColor: "bg-blue-600 text-white", icon: TrendingUp },
    { key: "Budget", label: "Budget Tier", value: summary.budget, color: "bg-gray-50 text-gray-700", activeColor: "bg-gray-600 text-white", icon: DollarSign },
    { key: "Low Risk", label: "Low Risk", value: summary.lowRisk, color: "bg-green-50 text-green-700", activeColor: "bg-green-600 text-white", icon: CheckCircle },
  ];

  const filteredData = profiles.filter((r) => {
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
          <span>
            Showing {filteredData.length} of {profiles.length} registered restaurants
          </span>
          <button
            onClick={() => setActiveFilter(null)}
            className="text-green-600 hover:text-green-700 font-semibold underline"
          >
            Clear filter
          </button>
        </div>
      )}

      <div className="border rounded-lg overflow-hidden bg-white">
        <table className="w-full text-[13px]">
          <thead className="bg-gray-50 border-b">
            <tr>
              {["Restaurant", "Median Price", "90th Percentile", "Items", "Tier", "Risk"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredData.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900 flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span>{r.name}</span>
                </td>
                <td className="px-4 py-3 text-gray-600">{fmt(r.medianPrice)}</td>
                <td className="px-4 py-3 text-gray-600">{fmt(r.p90Price)}</td>
                <td className="px-4 py-3 text-gray-600">{r.items}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${tierColor(r.tier)}`}>
                    {r.tier}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${riskColor(r.risk)}`}>
                    {r.risk}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MenuIntelligenceTab({ profiles }: { profiles: RestaurantKYCProfile[] }) {
  const [filter, setFilter] = useState("All");
  const [activeView, setActiveView] = useState<"suggestions" | "catalog" | "generate">("suggestions");

  const restaurantNames = useMemo(() => profiles.map((p) => p.name), [profiles]);
  const restaurants = useMemo(() => ["All", ...restaurantNames], [restaurantNames]);

  // Aggregate suggestions and catalog items across registered restaurants
  const allSuggestions = useMemo(() => profiles.flatMap((p) => p.suggestions), [profiles]);
  const [customCatalogItems, setCustomCatalogItems] = useState<MenuItemData[]>([]);

  const allCatalogItems = useMemo(() => {
    const base = profiles.flatMap((p) => p.catalogItems);
    return [...base, ...customCatalogItems];
  }, [profiles, customCatalogItems]);

  const filteredCatalog = filter === "All" ? allCatalogItems : allCatalogItems.filter((i) => i.restaurant === filter);

  // ── Generate Menu State ──
  const [genRestaurant, setGenRestaurant] = useState(restaurantNames[0] || "");
  const [cuisineType, setCuisineType] = useState("Rwandan");
  const [targetMargin, setTargetMargin] = useState(65);
  const [itemCount, setItemCount] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedItems, setGeneratedItems] = useState<
    Array<{
      name: string;
      category: string;
      portion: string;
      wholesaleCost: number;
      suggestedPrice: number;
      margin: number;
      competitorPrice: number;
      reasoning: string;
    }>
  >([]);

  useEffect(() => {
    if (!genRestaurant && restaurantNames.length > 0) {
      setGenRestaurant(restaurantNames[0]);
    }
  }, [restaurantNames, genRestaurant]);

  const cuisineTypes = [
    "Rwandan",
    "Continental",
    "Asian Fusion",
    "Grill & BBQ",
    "Seafood",
    "Vegetarian",
    "Fast Food",
    "Cafe & Bakery",
  ];

  const mockGeneratedDishPool = [
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
      const shuffled = [...mockGeneratedDishPool].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, itemCount).map((item) => {
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
    }, 1200);
  };

  const handleAddGeneratedItem = (item: {
    name: string;
    category: string;
    portion: string;
    suggestedPrice: number;
  }) => {
    if (!genRestaurant) return;
    const newItem: MenuItemData = {
      id: `gen-${Date.now()}-${Math.random()}`,
      restaurant: genRestaurant,
      item: item.name,
      portion: item.portion,
      price: item.suggestedPrice,
      category: item.category,
      avgOrderValue: Math.round(item.suggestedPrice * 1.8),
      status: "Active",
    };
    setCustomCatalogItems((prev) => [newItem, ...prev]);
    setActiveView("catalog");
    setFilter(genRestaurant);
  };

  const avgMargin =
    allSuggestions.length > 0
      ? Math.round(allSuggestions.reduce((s, i) => s + i.margin, 0) / allSuggestions.length)
      : 70;

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Suggestions Generated", value: allSuggestions.length, color: "bg-emerald-50 text-emerald-700" },
          { label: "Avg Margin", value: `${avgMargin}%`, color: "bg-blue-50 text-blue-700" },
          { label: "Restaurants Covered", value: restaurantNames.length, color: "bg-purple-50 text-purple-700" },
          { label: "Menu Items", value: allCatalogItems.length, color: "bg-amber-50 text-amber-700" },
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
          {allSuggestions.map((s) => (
            <div key={s.id} className="border rounded-lg p-4 hover:shadow-md transition-all duration-200 bg-white">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-gray-900 text-[14px]">{s.item}</p>
                  <p className="text-[12px] text-gray-500 flex items-center gap-1 mt-0.5">
                    <Building2 className="w-3 h-3 text-gray-400" />
                    <span className="font-medium text-gray-700">{s.restaurant}</span>
                  </p>
                </div>
                <span className="bg-green-100 text-green-700 text-[11px] font-bold px-2 py-1 rounded-full">
                  {s.margin}% margin
                </span>
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
                <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                {s.reason}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Menu Catalog View */}
      {activeView === "catalog" && (
        <>
          <div className="flex gap-2 flex-wrap items-center">
            <span className="text-xs font-semibold text-gray-500 mr-1">Restaurant:</span>
            {restaurants.map((r) => (
              <button
                key={r}
                onClick={() => setFilter(r)}
                className={`px-3 py-1.5 text-[12px] rounded-full border transition-colors ${
                  filter === r
                    ? "bg-green-700 text-white border-green-700"
                    : "bg-white text-gray-600 border-gray-300 hover:border-green-500"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <div className="border rounded-lg overflow-hidden bg-white">
            <table className="w-full text-[13px]">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {["Restaurant", "Item Name", "Category", "Portion", "Price", "Avg Order Value", "Status"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCatalog.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-900 font-medium">{item.restaurant}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{item.item}</td>
                    <td className="px-4 py-3">
                      <span className="bg-blue-50 text-blue-700 text-[11px] px-2 py-0.5 rounded-full font-medium">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{item.portion}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{fmt(item.price)}</td>
                    <td className="px-4 py-3 text-gray-600">{fmt(item.avgOrderValue)}</td>
                    <td className="px-4 py-3">
                      <span className="bg-green-100 text-green-700 text-[11px] px-2 py-0.5 rounded-full font-medium">
                        {item.status}
                      </span>
                    </td>
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
              Configure parameters below to generate price-optimized menu additions tailored for registered restaurants.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-gray-600">Registered Restaurant</label>
                <select
                  value={genRestaurant}
                  onChange={(e) => setGenRestaurant(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-gray-200 text-[13px] bg-white outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select restaurant...</option>
                  {restaurantNames.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
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
                  {cuisineTypes.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
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
                  {[3, 5, 7, 10].map((n) => (
                    <option key={n} value={n}>
                      {n} items
                    </option>
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
                  Generating for {genRestaurant}...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Menu Items
                </>
              )}
            </button>
          </div>

          {/* Generated Results */}
          {generatedItems.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900">
                  Generated Recommendations for <span className="text-green-700">{genRestaurant}</span> ({generatedItems.length})
                </h3>
                <span className="text-[11px] bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full font-medium">
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
                          <span className="bg-blue-50 text-blue-700 text-[10px] font-medium px-2 py-0.5 rounded-full">
                            {item.category}
                          </span>
                          <span className="text-[11px] text-gray-400">{item.portion}</span>
                        </div>
                      </div>
                      <span className="bg-green-100 text-green-700 text-[11px] font-bold px-2 py-1 rounded-full">
                        {item.margin}% margin
                      </span>
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
                        <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        {item.reasoning}
                      </div>
                      <button
                        onClick={() => handleAddGeneratedItem(item)}
                        className="text-[11px] font-semibold text-green-600 hover:text-green-700 flex items-center gap-1 px-2.5 py-1 rounded bg-green-50 hover:bg-green-100 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                        Add to Catalog
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

function ZoneBenchmarkingTab({ profiles }: { profiles: RestaurantKYCProfile[] }) {
  const zoneBenchmarks = useMemo(() => profiles.map((p) => p.zoneBenchmark), [profiles]);
  const [selectedId, setSelectedId] = useState<string | number | null>(zoneBenchmarks[0]?.id || null);
  const selected = zoneBenchmarks.find((z) => z.id === selectedId);

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          {
            label: "Zones Analyzed",
            value: new Set(zoneBenchmarks.map((z) => z.zone)).size,
            color: "bg-blue-50 text-blue-700",
          },
          {
            label: "Under-priced",
            value: zoneBenchmarks.filter((z) => z.flag === "Under-priced").length,
            color: "bg-amber-50 text-amber-700",
          },
          {
            label: "Normal Range",
            value: zoneBenchmarks.filter((z) => z.flag === "Normal").length,
            color: "bg-green-50 text-green-700",
          },
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
      <div className="flex gap-4 items-start">
        {/* Table */}
        <div className={`border rounded-lg overflow-hidden bg-white transition-all duration-300 ${selected ? "flex-1" : "w-full"}`}>
          <table className="w-full text-[13px]">
            <thead className="bg-gray-50 border-b">
              <tr>
                {["Restaurant", "Zone", "Zone Avg Price", "Restaurant Avg", "Deviation", "Peers", "Flag"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {zoneBenchmarks.map((z) => (
                <tr
                  key={z.id}
                  onClick={() => setSelectedId(z.id === selectedId ? null : z.id)}
                  className={`cursor-pointer transition-colors ${
                    z.id === selectedId ? "bg-green-50 border-l-2 border-l-green-600" : "hover:bg-gray-50"
                  }`}
                >
                  <td className="px-4 py-3 font-medium text-gray-900 flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span>{z.restaurant}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-gray-600">
                      <MapPin className="w-3 h-3 text-gray-400" />
                      {z.zone}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{fmt(z.avgZonePrice)}</td>
                  <td className="px-4 py-3 text-gray-600">{fmt(z.restaurantAvg)}</td>
                  <td className="px-4 py-3">
                    <div className={`flex items-center gap-1 font-semibold ${z.deviation < 0 ? "text-amber-600" : "text-green-600"}`}>
                      {z.deviation < 0 ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
                      {z.deviation > 0 ? "+" : ""}
                      {z.deviation}%
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{z.peers} peers</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${flagColor(z.flag)}`}>
                      {z.flag}
                    </span>
                  </td>
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
                    {selected.deviation > 0 ? "+" : ""}
                    {selected.deviation}%
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
                <p className="text-sm font-bold text-gray-900">
                  {selected.peers} restaurants in {selected.zone}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ClassificationTab({ profiles }: { profiles: RestaurantKYCProfile[] }) {
  const classificationData = useMemo(() => profiles.map((p) => p.classification), [profiles]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: "Approved",
            value: classificationData.filter((r) => r.recommendation === "Approved").length,
            color: "bg-green-50 text-green-700",
          },
          {
            label: "Under Review",
            value: classificationData.filter((r) => r.recommendation === "Review").length,
            color: "bg-amber-50 text-amber-700",
          },
          {
            label: "Declined",
            value: classificationData.filter((r) => r.recommendation === "Declined").length,
            color: "bg-red-50 text-red-700",
          },
          {
            label: "Avg Credit Score",
            value:
              classificationData.length > 0
                ? Math.round(classificationData.reduce((s, r) => s + r.score, 0) / classificationData.length)
                : 0,
            color: "bg-blue-50 text-blue-700",
          },
        ].map(({ label, value, color }) => (
          <div key={label} className={`p-4 rounded-lg border ${color} transition-all duration-200 hover:shadow-md`}>
            <p className="text-xs font-medium">{label}</p>
            <p className="text-xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4">
        {classificationData.map((r) => (
          <div key={r.id} className="border rounded-lg p-4 hover:shadow-md transition-all duration-200 bg-white">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-semibold text-gray-900 text-[14px] flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-gray-400" />
                  {r.restaurant}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Tag className="w-3 h-3 text-gray-400" />
                  <p className="text-[12px] text-gray-500">{r.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-lg font-bold ${scoreColor(r.score)}`}>{r.score}</span>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${recommendationColor(r.recommendation)}`}>
                  {r.recommendation}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-1.5">
                {r.tags.map((tag) => (
                  <span key={tag} className="bg-gray-100 text-gray-600 text-[11px] px-2 py-0.5 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="text-right ml-4 shrink-0">
                <p className="text-[10px] text-gray-500">Credit Limit</p>
                <p className="text-[13px] font-bold text-gray-800">{fmt(r.creditLimit)}</p>
              </div>
            </div>
            <div className="mt-3">
              <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                <span>Credit Score</span>
                <span>{r.score}/100</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full ${
                    r.score >= 75 ? "bg-green-500" : r.score >= 50 ? "bg-amber-500" : "bg-red-500"
                  }`}
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
  const [restaurants, setRestaurants] = useState<RegisteredRestaurantItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRestaurants = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const response = await restaurantService.getAllRestaurants({ limit: 100 });
      const rawList: RegisteredRestaurantItem[] = Array.isArray(response?.data?.restaurants)
        ? response.data.restaurants
        : Array.isArray(response?.data?.data)
          ? response.data.data
          : Array.isArray(response?.data)
            ? response.data
            : [];

      if (rawList.length > 0) {
        setRestaurants(rawList);
      } else {
        setRestaurants(FALLBACK_REGISTERED_RESTAURANTS);
      }
    } catch (err) {
      console.error("Failed to load registered restaurants:", err);
      setRestaurants(FALLBACK_REGISTERED_RESTAURANTS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  // Build profiles with real registered restaurant names
  const profiles = useMemo(() => buildRestaurantProfiles(restaurants), [restaurants]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center text-sm text-gray-500 font-medium space-x-1">
          <span>Dashboard</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900">Restaurant KYC & Credit Scoring</span>
        </div>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Restaurant KYC & Credit Risk Scoring</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchRestaurants(true)}
              disabled={refreshing || loading}
              className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition-colors disabled:opacity-50"
              title="Refresh registered restaurants"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-green-600" : ""}`} />
            </button>
            <span className="text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full font-semibold flex items-center gap-1.5 shadow-sm">
              <Building2 className="w-3.5 h-3.5 text-emerald-600" />
              {profiles.length} Registered Restaurants
            </span>
          </div>
        </div>
        <p className="text-[13px] text-gray-500">
          Analyze restaurant risk profiles, menu performance, and credit eligibility for registered partners.
        </p>
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

      {/* Loading State or Tab Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-8 h-8 border-2 border-green-600/30 border-t-green-600 rounded-full animate-spin" />
          <p className="text-xs text-gray-500 font-medium">Loading registered restaurants...</p>
        </div>
      ) : (
        <div>
          {activeTab === "segmentation" && <SegmentationTab profiles={profiles} />}
          {activeTab === "menu" && <MenuIntelligenceTab profiles={profiles} />}
          {activeTab === "benchmarking" && <ZoneBenchmarkingTab profiles={profiles} />}
          {activeTab === "classification" && <ClassificationTab profiles={profiles} />}
        </div>
      )}
    </div>
  );
}
