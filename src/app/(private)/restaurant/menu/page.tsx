"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  BadgeCheck,
  Banknote,
  ChevronDown,
  Clock3,
  Filter,
  Info,
  Minus,
  PackageCheck,
  Plus,
  Search,
  ShieldCheck,
  ShoppingCart,
  Store,
  TrendingDown,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react";

type StockLevel = "High" | "Medium" | "Low" | "Out";
type Trend = "up" | "down" | "stable";
type Confidence = "Fresh" | "Verified" | "Stale";

interface SupplierQuote {
  name: string;
  price: number;
  market: string;
  stock: StockLevel;
  eta: string;
}

interface MenuItem {
  id: string;
  name: string;
  category: string;
  unit: string;
  foodBundlesPrice: number;
  marketAverage: number;
  lastMarketPrice: number;
  priceChange: number;
  trend: Trend;
  confidence: Confidence;
  stock: StockLevel;
  kycImpact: "Positive" | "Neutral" | "Watch";
  demandScore: number;
  posMatched: number;
  suppliers: SupplierQuote[];
}

const SESSION = {
  voucherLimit: 88000,
  used: 23000,
  available: 65000,
  expiresAt: Date.now() + 31 * 60 * 60 * 1000,
  baseApproval: 82,
  repaymentScore: 91,
  kycStatus: "Verified",
  posMatch: 86,
};

const MENU_ITEMS: MenuItem[] = [
  {
    id: "1",
    name: "Tomatoes",
    category: "Vegetables",
    unit: "kg",
    foodBundlesPrice: 1200,
    marketAverage: 1350,
    lastMarketPrice: 1290,
    priceChange: 8,
    trend: "up",
    confidence: "Fresh",
    stock: "High",
    kycImpact: "Watch",
    demandScore: 92,
    posMatched: 88,
    suppliers: [
      { name: "Kimironko Trader A", market: "Kimironko", price: 1200, stock: "High", eta: "Today" },
      { name: "Nyabugogo Trader B", market: "Nyabugogo", price: 1350, stock: "Medium", eta: "Today" },
      { name: "Kicukiro Trader C", market: "Kicukiro", price: 1180, stock: "Low", eta: "Tomorrow" },
    ],
  },
  {
    id: "2",
    name: "Chicken",
    category: "Meat",
    unit: "kg",
    foodBundlesPrice: 3800,
    marketAverage: 4100,
    lastMarketPrice: 4000,
    priceChange: -5,
    trend: "down",
    confidence: "Verified",
    stock: "Medium",
    kycImpact: "Positive",
    demandScore: 84,
    posMatched: 93,
    suppliers: [
      { name: "Kayko Preferred", market: "POS Partner", price: 3800, stock: "Medium", eta: "Today" },
      { name: "Kacyiru Trader C", market: "Kacyiru", price: 3650, stock: "Low", eta: "Tomorrow" },
    ],
  },
  {
    id: "3",
    name: "Onions",
    category: "Vegetables",
    unit: "kg",
    foodBundlesPrice: 900,
    marketAverage: 940,
    lastMarketPrice: 930,
    priceChange: 0,
    trend: "stable",
    confidence: "Fresh",
    stock: "High",
    kycImpact: "Neutral",
    demandScore: 76,
    posMatched: 81,
    suppliers: [
      { name: "Nyabugogo Trader B", market: "Nyabugogo", price: 900, stock: "High", eta: "Today" },
    ],
  },
  {
    id: "4",
    name: "Rice",
    category: "Dry Goods",
    unit: "kg",
    foodBundlesPrice: 1000,
    marketAverage: 1120,
    lastMarketPrice: 1110,
    priceChange: 0,
    trend: "stable",
    confidence: "Verified",
    stock: "High",
    kycImpact: "Positive",
    demandScore: 88,
    posMatched: 90,
    suppliers: [
      { name: "Kimironko Trader A", market: "Kimironko", price: 1000, stock: "High", eta: "Today" },
      { name: "Nyabugogo Trader B", market: "Nyabugogo", price: 980, stock: "High", eta: "Tomorrow" },
    ],
  },
  {
    id: "5",
    name: "Beef",
    category: "Meat",
    unit: "kg",
    foodBundlesPrice: 5500,
    marketAverage: 5700,
    lastMarketPrice: 5530,
    priceChange: 3,
    trend: "up",
    confidence: "Fresh",
    stock: "Medium",
    kycImpact: "Neutral",
    demandScore: 61,
    posMatched: 73,
    suppliers: [
      { name: "Kacyiru Trader C", market: "Kacyiru", price: 5500, stock: "Medium", eta: "Today" },
    ],
  },
  {
    id: "6",
    name: "Cooking Oil",
    category: "Dry Goods",
    unit: "L",
    foodBundlesPrice: 2500,
    marketAverage: 2850,
    lastMarketPrice: 2640,
    priceChange: 12,
    trend: "up",
    confidence: "Fresh",
    stock: "Low",
    kycImpact: "Watch",
    demandScore: 79,
    posMatched: 86,
    suppliers: [
      { name: "Kimironko Trader A", market: "Kimironko", price: 2500, stock: "Low", eta: "Today" },
      { name: "Nyabugogo Trader B", market: "Nyabugogo", price: 2600, stock: "Medium", eta: "Tomorrow" },
    ],
  },
  {
    id: "7",
    name: "Cabbage",
    category: "Vegetables",
    unit: "kg",
    foodBundlesPrice: 500,
    marketAverage: 560,
    lastMarketPrice: 520,
    priceChange: -3,
    trend: "down",
    confidence: "Stale",
    stock: "High",
    kycImpact: "Neutral",
    demandScore: 58,
    posMatched: 64,
    suppliers: [
      { name: "Nyabugogo Trader B", market: "Nyabugogo", price: 500, stock: "High", eta: "Today" },
    ],
  },
  {
    id: "8",
    name: "Potatoes",
    category: "Vegetables",
    unit: "kg",
    foodBundlesPrice: 600,
    marketAverage: 680,
    lastMarketPrice: 675,
    priceChange: 0,
    trend: "stable",
    confidence: "Verified",
    stock: "High",
    kycImpact: "Positive",
    demandScore: 94,
    posMatched: 91,
    suppliers: [
      { name: "Kimironko Trader A", market: "Kimironko", price: 600, stock: "High", eta: "Today" },
      { name: "Kacyiru Trader C", market: "Kacyiru", price: 580, stock: "Medium", eta: "Tomorrow" },
    ],
  },
];

const CATEGORIES = ["All", "Vegetables", "Meat", "Dry Goods"];
const fmt = (n: number) => `RWF ${n.toLocaleString("en-RW")}`;

function useCountdown(expiresAt: number) {
  const remaining = Math.max(expiresAt - Date.now(), 0);
  const h = Math.floor(remaining / 3600000);
  const m = Math.floor((remaining % 3600000) / 60000);
  return `${h}h ${m}m`;
}

function stockClass(stock: StockLevel) {
  if (stock === "High") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (stock === "Medium") return "bg-amber-50 text-amber-700 border-amber-200";
  if (stock === "Low") return "bg-rose-50 text-rose-700 border-rose-200";
  return "bg-gray-50 text-gray-500 border-gray-200";
}

function confidenceClass(confidence: Confidence) {
  if (confidence === "Fresh") return "bg-blue-50 text-blue-700 border-blue-200";
  if (confidence === "Verified") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  return "bg-amber-50 text-amber-700 border-amber-200";
}

function impactClass(impact: MenuItem["kycImpact"]) {
  if (impact === "Positive") return "text-emerald-700 bg-emerald-50";
  if (impact === "Watch") return "text-amber-700 bg-amber-50";
  return "text-gray-600 bg-gray-50";
}

function priceDelta(item: MenuItem) {
  return item.marketAverage - item.foodBundlesPrice;
}

function savingsPct(item: MenuItem) {
  return Math.round((priceDelta(item) / item.marketAverage) * 100);
}

function TrendPill({ trend, change }: { trend: Trend; change: number }) {
  if (trend === "stable") {
    return (
      <span className="inline-flex items-center gap-1 rounded border border-gray-200 bg-gray-50 px-2 py-1 text-[11px] font-semibold text-gray-500">
        <Minus className="h-3 w-3" />
        Stable
      </span>
    );
  }

  const Icon = trend === "up" ? TrendingUp : TrendingDown;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded border px-2 py-1 text-[11px] font-semibold ${
        trend === "up"
          ? "border-rose-200 bg-rose-50 text-rose-700"
          : "border-emerald-200 bg-emerald-50 text-emerald-700"
      }`}
    >
      <Icon className="h-3 w-3" />
      {trend === "up" ? "+" : ""}
      {change}%
    </span>
  );
}

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase text-gray-500">{label}</p>
          <p className="mt-1 text-lg font-bold text-gray-950">{value}</p>
          <p className="mt-1 text-xs text-gray-500">{detail}</p>
        </div>
        <span className="rounded bg-gray-50 p-2 text-gray-600">
          <Icon className="h-4 w-4" />
        </span>
      </div>
    </div>
  );
}

function SessionPanel({ cartTotal, approval }: { cartTotal: number; approval: number }) {
  const countdown = useCountdown(SESSION.expiresAt);
  const projected = SESSION.used + cartTotal;
  const usedPct = Math.min((projected / SESSION.voucherLimit) * 100, 100);
  const remaining = SESSION.available - cartTotal;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded bg-emerald-600 p-2 text-white">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-950">Restaurant voucher session</p>
            <p className="text-xs text-gray-500">
              KYC {SESSION.kycStatus} - POS match {SESSION.posMatch}% - expires in {countdown}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:w-[560px]">
          <div>
            <p className="text-[11px] text-gray-500">Available</p>
            <p className="text-sm font-bold text-emerald-700">{fmt(Math.max(remaining, 0))}</p>
          </div>
          <div>
            <p className="text-[11px] text-gray-500">Cart</p>
            <p className="text-sm font-bold text-gray-950">{fmt(cartTotal)}</p>
          </div>
          <div>
            <p className="text-[11px] text-gray-500">Approval</p>
            <p className={`text-sm font-bold ${approval >= 75 ? "text-emerald-700" : approval >= 55 ? "text-amber-700" : "text-rose-700"}`}>
              {approval}%
            </p>
          </div>
          <div>
            <p className="text-[11px] text-gray-500">Used limit</p>
            <p className="text-sm font-bold text-gray-950">{Math.round(usedPct)}%</p>
          </div>
        </div>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded bg-gray-100">
        <div
          className={`h-full rounded ${usedPct > 85 ? "bg-rose-500" : usedPct > 65 ? "bg-amber-500" : "bg-emerald-500"}`}
          style={{ width: `${usedPct}%` }}
        />
      </div>
    </div>
  );
}

function MenuItemCard({
  item,
  qty,
  onAdd,
  onRemove,
}: {
  item: MenuItem;
  qty: number;
  onAdd: () => void;
  onRemove: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const bestSupplier = item.suppliers.reduce((best, next) =>
    next.price < best.price ? next : best,
  );
  const delta = priceDelta(item);

  return (
    <div className={`rounded-lg border bg-white p-4 shadow-sm ${item.kycImpact === "Watch" ? "border-amber-200" : "border-gray-200"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-bold text-gray-950">{item.name}</h3>
            <span className={`rounded border px-2 py-0.5 text-[10px] font-bold ${confidenceClass(item.confidence)}`}>
              {item.confidence}
            </span>
            <span className={`rounded border px-2 py-0.5 text-[10px] font-bold ${stockClass(item.stock)}`}>
              {item.stock}
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            {item.category} - {item.posMatched}% POS demand match - {item.demandScore}% reorder signal
          </p>
        </div>
        <TrendPill trend={item.trend} change={item.priceChange} />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="rounded bg-emerald-50 p-3">
          <p className="text-[10px] font-semibold uppercase text-emerald-700">FoodBundles</p>
          <p className="mt-1 text-sm font-black text-emerald-800">
            {fmt(item.foodBundlesPrice)}
            <span className="text-[10px] font-semibold">/{item.unit}</span>
          </p>
        </div>
        <div className="rounded bg-gray-50 p-3">
          <p className="text-[10px] font-semibold uppercase text-gray-500">Market avg</p>
          <p className="mt-1 text-sm font-bold text-gray-900">
            {fmt(item.marketAverage)}
            <span className="text-[10px] font-semibold text-gray-500">/{item.unit}</span>
          </p>
        </div>
        <div className={`rounded p-3 ${delta >= 0 ? "bg-blue-50" : "bg-rose-50"}`}>
          <p className={`text-[10px] font-semibold uppercase ${delta >= 0 ? "text-blue-700" : "text-rose-700"}`}>
            {delta >= 0 ? "Savings" : "Premium"}
          </p>
          <p className={`mt-1 text-sm font-bold ${delta >= 0 ? "text-blue-800" : "text-rose-800"}`}>
            {delta >= 0 ? `${savingsPct(item)}%` : `${Math.abs(savingsPct(item))}%`}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => setExpanded((value) => !value)}
          className="inline-flex items-center gap-2 rounded border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
        >
          <Store className="h-3.5 w-3.5" />
          {bestSupplier.name}
          <ChevronDown className={`h-3.5 w-3.5 transition ${expanded ? "rotate-180" : ""}`} />
        </button>

        <div className="flex items-center gap-2">
          {qty > 0 ? (
            <>
              <button
                onClick={onRemove}
                className="flex h-8 w-8 items-center justify-center rounded border border-gray-200 hover:bg-gray-50"
                aria-label={`Decrease ${item.name}`}
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-7 text-center text-sm font-bold text-gray-950">{qty}</span>
              <button
                onClick={onAdd}
                disabled={item.stock === "Out"}
                className="flex h-8 w-8 items-center justify-center rounded bg-emerald-700 text-white hover:bg-emerald-800 disabled:opacity-40"
                aria-label={`Increase ${item.name}`}
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </>
          ) : (
            <button
              onClick={onAdd}
              disabled={item.stock === "Out"}
              className="inline-flex h-8 items-center gap-2 rounded bg-emerald-700 px-3 text-xs font-bold text-white hover:bg-emerald-800 disabled:opacity-40"
            >
              <Plus className="h-3.5 w-3.5" />
              Add
            </button>
          )}
        </div>
      </div>

      {expanded && (
        <div className="mt-3 space-y-2 rounded border border-gray-100 bg-gray-50 p-3">
          {item.suppliers.map((supplier) => (
            <div key={supplier.name} className="flex items-center justify-between gap-3 rounded bg-white px-3 py-2 text-xs">
              <div>
                <p className="font-semibold text-gray-900">{supplier.name}</p>
                <p className="text-gray-500">{supplier.market} - ETA {supplier.eta}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-950">{fmt(supplier.price)}</p>
                <p className={supplier.stock === "Low" ? "text-rose-600" : "text-gray-500"}>{supplier.stock} stock</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
        <span className={`rounded px-2 py-1 font-semibold ${impactClass(item.kycImpact)}`}>
          Risk: {item.kycImpact}
        </span>
        <span className="rounded bg-gray-50 px-2 py-1 font-semibold text-gray-600">
          Last market: {fmt(item.lastMarketPrice)}
        </span>
      </div>
    </div>
  );
}

function CartPanel({
  cart,
  items,
  onRemove,
  onClose,
  approval,
}: {
  cart: Record<string, number>;
  items: MenuItem[];
  onRemove: (id: string) => void;
  onClose: () => void;
  approval: number;
}) {
  const selected = Object.entries(cart)
    .map(([id, qty]) => ({ item: items.find((entry) => entry.id === id), qty }))
    .filter((entry): entry is { item: MenuItem; qty: number } => Boolean(entry.item) && entry.qty > 0);
  const total = selected.reduce((sum, { item, qty }) => sum + item.foodBundlesPrice * qty, 0);
  const savings = selected.reduce((sum, { item, qty }) => sum + priceDelta(item) * qty, 0);
  const canAfford = total <= SESSION.available;

  return (
    <aside className="sticky top-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-4 w-4 text-emerald-700" />
          <p className="text-sm font-bold text-gray-950">Voucher basket</p>
        </div>
        <button onClick={onClose} className="rounded p-1 text-gray-400 hover:bg-gray-50 hover:text-gray-700">
          <X className="h-4 w-4" />
        </button>
      </div>

      {selected.length === 0 ? (
        <div className="py-8 text-center">
          <PackageCheck className="mx-auto h-8 w-8 text-gray-300" />
          <p className="mt-2 text-sm font-semibold text-gray-600">No items selected</p>
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
            {selected.map(({ item, qty }) => (
              <div key={item.id} className="flex items-start justify-between gap-2 rounded bg-gray-50 p-2 text-xs">
                <div>
                  <p className="font-semibold text-gray-900">{item.name}</p>
                  <p className="text-gray-500">
                    {qty} x {fmt(item.foodBundlesPrice)}/{item.unit}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-950">{fmt(item.foodBundlesPrice * qty)}</p>
                  <button onClick={() => onRemove(item.id)} className="mt-1 text-rose-600 hover:underline">
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2 border-t border-gray-100 pt-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Basket total</span>
              <span className="font-bold text-gray-950">{fmt(total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Market savings</span>
              <span className={savings >= 0 ? "font-bold text-blue-700" : "font-bold text-rose-700"}>
                {fmt(Math.abs(savings))}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Approval likelihood</span>
              <span className={approval >= 75 ? "font-bold text-emerald-700" : "font-bold text-amber-700"}>
                {approval}%
              </span>
            </div>
          </div>

          {!canAfford && (
            <div className="flex gap-2 rounded border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              Basket exceeds available voucher balance.
            </div>
          )}

          <button
            disabled={!canAfford}
            className="h-10 w-full rounded bg-emerald-700 text-sm font-bold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Submit BNPL request
          </button>
        </div>
      )}
    </aside>
  );
}

export default function RestaurantMenuPage() {
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [signal, setSignal] = useState<"all" | "savings" | "watch" | "fresh">("all");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [showCart, setShowCart] = useState(true);

  const cartTotal = useMemo(
    () =>
      Object.entries(cart).reduce((sum, [id, qty]) => {
        const item = MENU_ITEMS.find((entry) => entry.id === id);
        return sum + (item ? item.foodBundlesPrice * qty : 0);
      }, 0),
    [cart],
  );

  const cartSavings = useMemo(
    () =>
      Object.entries(cart).reduce((sum, [id, qty]) => {
        const item = MENU_ITEMS.find((entry) => entry.id === id);
        return sum + (item ? priceDelta(item) * qty : 0);
      }, 0),
    [cart],
  );

  const watchItems = MENU_ITEMS.filter((item) => item.kycImpact === "Watch").length;
  const approval = Math.max(
    28,
    Math.min(
      96,
      SESSION.baseApproval -
        Math.round((cartTotal / SESSION.voucherLimit) * 12) -
        Object.entries(cart).reduce((sum, [id, qty]) => {
          const item = MENU_ITEMS.find((entry) => entry.id === id);
          return sum + (item?.kycImpact === "Watch" ? qty * 3 : 0);
        }, 0) +
        (cartSavings > 0 ? 3 : 0),
    ),
  );

  const filtered = useMemo(
    () =>
      MENU_ITEMS.filter((item) => {
        const matchesCategory = category === "All" || item.category === category;
        const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
        const matchesSignal =
          signal === "all" ||
          (signal === "savings" && priceDelta(item) > 0) ||
          (signal === "watch" && item.kycImpact === "Watch") ||
          (signal === "fresh" && item.confidence !== "Stale");
        return matchesCategory && matchesSearch && matchesSignal;
      }),
    [category, search, signal],
  );

  const recommended = useMemo(
    () =>
      MENU_ITEMS.filter((item) => item.demandScore >= 84 || item.trend === "down")
        .sort((a, b) => b.demandScore - a.demandScore)
        .slice(0, 3),
    [],
  );

  const addToCart = (id: string) => setCart((current) => ({ ...current, [id]: (current[id] || 0) + 1 }));
  const removeFromCart = (id: string) =>
    setCart((current) => {
      const next = { ...current, [id]: Math.max((current[id] || 0) - 1, 0) };
      if (next[id] === 0) delete next[id];
      return next;
    });
  const removeAllFromCart = (id: string) =>
    setCart((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });

  const cartCount = Object.values(cart).reduce((sum, qty) => sum + qty, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl space-y-5 px-4 py-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-emerald-700">Restaurant procurement</p>
            <h1 className="mt-1 text-2xl font-black text-gray-950">BNPL Menu Intelligence</h1>
            <p className="mt-1 text-sm text-gray-500">
              POS demand, voucher capacity, market prices, and KYC risk in one ordering view.
            </p>
          </div>
          <button
            onClick={() => setShowCart((value) => !value)}
            className="relative inline-flex h-10 items-center justify-center gap-2 rounded bg-emerald-700 px-4 text-sm font-bold text-white hover:bg-emerald-800"
          >
            <ShoppingCart className="h-4 w-4" />
            Basket
            {cartCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-black text-white">
                {cartCount}
              </span>
            )}
          </button>
        </div>

        <SessionPanel cartTotal={cartTotal} approval={approval} />

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="KYC score" value="A-" detail="Verified profile and active trading pattern" icon={ShieldCheck} />
          <MetricCard label="Repayment score" value={`${SESSION.repaymentScore}%`} detail="Used in voucher confidence" icon={BadgeCheck} />
          <MetricCard label="Tracked markets" value="4" detail="Kimironko, Nyabugogo, Kicukiro, POS partner" icon={Store} />
          <MetricCard label="Watch items" value={String(watchItems)} detail="Volatility can reduce approval confidence" icon={AlertTriangle} />
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_340px]">
          <main className="space-y-5">
            <section className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search menu items"
                    className="h-10 w-full rounded border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>

                <div className="flex gap-1 overflow-x-auto rounded bg-gray-100 p-1">
                  {CATEGORIES.map((entry) => (
                    <button
                      key={entry}
                      onClick={() => setCategory(entry)}
                      className={`h-8 whitespace-nowrap rounded px-3 text-xs font-bold ${
                        category === entry ? "bg-white text-gray-950 shadow-sm" : "text-gray-500 hover:text-gray-900"
                      }`}
                    >
                      {entry}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500">
                  <Filter className="h-3.5 w-3.5" />
                  Signal
                </span>
                {[
                  ["all", "All"],
                  ["savings", "Below market"],
                  ["watch", "Risk watch"],
                  ["fresh", "Fresh data"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => setSignal(value as typeof signal)}
                    className={`rounded border px-3 py-1.5 text-xs font-bold ${
                      signal === value
                        ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                        : "border-gray-200 bg-white text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </section>

            <section className="grid gap-3 md:grid-cols-3">
              {recommended.map((item) => (
                <div key={item.id} className="rounded-lg border border-blue-100 bg-blue-50 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-blue-950">{item.name}</p>
                    {item.trend === "down" ? (
                      <ArrowDown className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <ArrowUp className="h-4 w-4 text-blue-600" />
                    )}
                  </div>
                  <p className="mt-1 text-xs text-blue-800">
                    {item.trend === "down" ? "Price advantage today" : `${item.demandScore}% reorder signal`}
                  </p>
                  <button
                    onClick={() => addToCart(item.id)}
                    className="mt-3 h-8 w-full rounded bg-white text-xs font-bold text-blue-800 hover:bg-blue-100"
                  >
                    Add to basket
                  </button>
                </div>
              ))}
            </section>

            <section className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              {filtered.map((item) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  qty={cart[item.id] || 0}
                  onAdd={() => addToCart(item.id)}
                  onRemove={() => removeFromCart(item.id)}
                />
              ))}
            </section>
          </main>

          {showCart && (
            <CartPanel
              cart={cart}
              items={MENU_ITEMS}
              onRemove={removeAllFromCart}
              onClose={() => setShowCart(false)}
              approval={approval}
            />
          )}
        </div>

        <div className="grid gap-3 lg:grid-cols-3">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-950">
              <Info className="h-4 w-4 text-blue-600" />
              Price confidence
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Fresh and verified prices carry stronger approval confidence than stale market records.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-950">
              <Banknote className="h-4 w-4 text-emerald-600" />
              Voucher discipline
            </div>
            <p className="mt-2 text-xs text-gray-500">
              The basket compares requested credit against available limit before submission.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-950">
              <Clock3 className="h-4 w-4 text-amber-600" />
              POS alignment
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Higher POS demand match supports practical stock decisions and better credit signals.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
