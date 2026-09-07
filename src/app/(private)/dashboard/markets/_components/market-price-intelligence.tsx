"use client";

import { useState } from "react";
import {
  Bell, TrendingUp, TrendingDown, AlertTriangle, Info,
  ChevronDown, ChevronUp, Minus, User,
} from "lucide-react";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const PRICE_ALERTS = [
  { id: 1, item: "Cooking Oil", change: 12, trend: "up" as const, message: "Cooking Oil increased by 12% today", time: "2h ago", severity: "high" },
  { id: 2, item: "Chicken", change: -5, trend: "down" as const, message: "Chicken dropped 5% — good time to buy", time: "4h ago", severity: "info" },
  { id: 3, item: "Tomatoes", change: 8, trend: "up" as const, message: "Tomatoes up 8% this week", time: "1d ago", severity: "medium" },
  { id: 4, item: "Rice", change: 0, trend: "stable" as const, message: "Rice prices stable for 7 days", time: "1d ago", severity: "info" },
  { id: 5, item: "Beef", change: 3, trend: "up" as const, message: "Beef slightly up 3% — monitor closely", time: "2d ago", severity: "low" },
];

const TRADER_PRICES = [
  {
    product: "Tomatoes", unit: "kg",
    traders: [
      { name: "Trader A", price: 1200, stock: "High" as const, change: 8 },
      { name: "Trader B", price: 1350, stock: "Medium" as const, change: 10 },
      { name: "Trader C", price: 1180, stock: "Low" as const, change: 7 },
    ],
  },
  {
    product: "Chicken", unit: "kg",
    traders: [
      { name: "Trader A", price: 3800, stock: "Medium" as const, change: -5 },
      { name: "Trader C", price: 3650, stock: "Low" as const, change: -7 },
    ],
  },
  {
    product: "Cooking Oil", unit: "L",
    traders: [
      { name: "Trader A", price: 2500, stock: "Low" as const, change: 12 },
      { name: "Trader B", price: 2600, stock: "Medium" as const, change: 14 },
    ],
  },
  {
    product: "Rice", unit: "kg",
    traders: [
      { name: "Trader A", price: 1000, stock: "High" as const, change: 0 },
      { name: "Trader B", price: 980, stock: "High" as const, change: 0 },
    ],
  },
];

const STOCK_WARNINGS = [
  { product: "Cooking Oil", stock: "Low" as const, price: 2500, unit: "L", warning: "Low stock — price may increase soon" },
  { product: "Chicken", stock: "Medium" as const, price: 3800, unit: "kg", warning: "Medium stock — order within 48h" },
  { product: "Beef", stock: "Medium" as const, price: 5500, unit: "kg", warning: "Medium stock — limited availability" },
  { product: "Trader C Tomatoes", stock: "Low" as const, price: 1180, unit: "kg", warning: "Low stock at Trader C — consider Trader A" },
];

const RESTAURANT_INSIGHTS = [
  { product: "Tomatoes", typicalQty: "8–12 kg", lastWeekPrice: 1110, currentPrice: 1200, change: 8, note: "Current price is 8% higher than last week" },
  { product: "Chicken", typicalQty: "5–8 kg", lastWeekPrice: 4000, currentPrice: 3800, change: -5, note: "Price dropped 5% — good time to stock up" },
  { product: "Potatoes", typicalQty: "10–15 kg", lastWeekPrice: 600, currentPrice: 600, change: 0, note: "Price stable — order as usual" },
  { product: "Cooking Oil", typicalQty: "3–5 L", lastWeekPrice: 2230, currentPrice: 2500, change: 12, note: "Price up 12% — consider reducing order size" },
];

const TYPICAL_ORDER = { lastWeek: 45000, currentEstimate: 52000, change: 15.6 };

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) => `${n.toLocaleString("en-RW")} RWF`;

const stockColor = (s: "High" | "Medium" | "Low") => {
  if (s === "High") return "bg-green-100 text-green-700";
  if (s === "Medium") return "bg-amber-100 text-amber-700";
  return "bg-red-100 text-red-700";
};

const alertSeverityColor = (s: string) => {
  if (s === "high") return "border-l-red-500 bg-red-50";
  if (s === "medium") return "border-l-amber-500 bg-amber-50";
  if (s === "low") return "border-l-blue-400 bg-blue-50";
  return "border-l-green-500 bg-green-50";
};

const alertIconColor = (s: string) => {
  if (s === "high") return "text-red-500";
  if (s === "medium") return "text-amber-500";
  return "text-green-500";
};

// ─── Sub-sections ─────────────────────────────────────────────────────────────

function Section({ title, icon: Icon, children, defaultOpen = true }: {
  title: string; icon: React.ElementType; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-green-600" />
          <span className="text-[13px] font-semibold text-gray-800">{title}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {open && <div className="p-4">{children}</div>}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MarketPriceIntelligence() {
  return (
    <div className="space-y-4">
      {/* Overall order estimate */}
      <div className={`p-4 rounded-lg border-l-4 ${TYPICAL_ORDER.change > 10 ? "border-l-red-500 bg-red-50" : "border-l-amber-500 bg-amber-50"}`}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[12px] font-semibold text-gray-700">Your Typical Order Size</p>
            <p className="text-[13px] text-gray-600 mt-0.5">
              Last week: <span className="font-semibold">{fmt(TYPICAL_ORDER.lastWeek)}</span>
              {" · "}Current prices suggest: <span className="font-bold text-red-700">{fmt(TYPICAL_ORDER.currentEstimate)}</span>
            </p>
          </div>
          <span className="flex items-center gap-1 text-[12px] font-bold text-red-600">
            <TrendingUp className="w-3.5 h-3.5" />+{TYPICAL_ORDER.change}%
          </span>
        </div>
      </div>

      {/* Price Alerts */}
      <Section title={`Price Alerts (${PRICE_ALERTS.length})`} icon={Bell}>
        <div className="space-y-2">
          {PRICE_ALERTS.map(alert => (
            <div key={alert.id} className={`border-l-4 rounded-r-lg px-3 py-2.5 ${alertSeverityColor(alert.severity)}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                  {alert.trend === "up" ? (
                    <TrendingUp className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${alertIconColor(alert.severity)}`} />
                  ) : alert.trend === "down" ? (
                    <TrendingDown className="w-3.5 h-3.5 mt-0.5 shrink-0 text-green-500" />
                  ) : (
                    <Minus className="w-3.5 h-3.5 mt-0.5 shrink-0 text-gray-400" />
                  )}
                  <p className="text-[12px] text-gray-700">{alert.message}</p>
                </div>
                <span className="text-[10px] text-gray-400 shrink-0">{alert.time}</span>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Trader-specific pricing */}
      <Section title="Trader-Specific Pricing" icon={Info}>
        <div className="space-y-4">
          {TRADER_PRICES.map(p => {
            const best = p.traders.reduce((a, b) => a.price <= b.price ? a : b);
            return (
              <div key={p.product}>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[13px] font-semibold text-gray-800">{p.product}</p>
                  <span className="text-[11px] text-green-700 font-medium">Best: {fmt(best.price)} · {best.name}</span>
                </div>
                <div className="space-y-1">
                  {p.traders.map(t => (
                    <div key={t.name} className={`flex items-center justify-between px-3 py-2 rounded-lg text-[12px] ${t.name === best.name ? "bg-green-50 border border-green-200" : "bg-gray-50"}`}>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">{t.name}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${stockColor(t.stock)}`}>{t.stock}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`flex items-center gap-0.5 text-[11px] font-medium ${t.change > 0 ? "text-red-600" : t.change < 0 ? "text-green-600" : "text-gray-400"}`}>
                          {t.change > 0 ? <TrendingUp className="w-3 h-3" /> : t.change < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                          {t.change > 0 ? "+" : ""}{t.change}%
                        </span>
                        <span className={`font-bold ${t.name === best.name ? "text-green-700" : "text-gray-800"}`}>{fmt(t.price)}<span className="text-[10px] text-gray-400 font-normal">/{p.unit}</span></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* Stock-linked pricing warnings */}
      <Section title="Stock-Linked Price Warnings" icon={AlertTriangle}>
        <div className="space-y-2">
          {STOCK_WARNINGS.map((w, i) => (
            <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border ${w.stock === "Low" ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"}`}>
              <AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${w.stock === "Low" ? "text-red-500" : "text-amber-500"}`} />
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-[13px] font-semibold text-gray-800">{w.product}</p>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${stockColor(w.stock)}`}>{w.stock} stock</span>
                </div>
                <p className="text-[12px] text-gray-600">{w.warning}</p>
                <p className="text-[12px] font-semibold text-gray-800 mt-0.5">{fmt(w.price)}/{w.unit}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Restaurant-specific insights */}
      <Section title="Your Purchase Insights" icon={User}>
        <div className="space-y-3">
          {RESTAURANT_INSIGHTS.map((r, i) => (
            <div key={i} className="flex items-start justify-between gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-gray-800">{r.product}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Typical purchase: {r.typicalQty}</p>
                <p className={`text-[12px] mt-1 ${r.change > 5 ? "text-red-600" : r.change < 0 ? "text-green-600" : "text-gray-500"}`}>{r.note}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[13px] font-bold text-gray-800">{fmt(r.currentPrice)}</p>
                <div className={`flex items-center justify-end gap-0.5 text-[11px] font-medium mt-0.5 ${r.change > 0 ? "text-red-600" : r.change < 0 ? "text-green-600" : "text-gray-400"}`}>
                  {r.change > 0 ? <TrendingUp className="w-3 h-3" /> : r.change < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                  {r.change > 0 ? "+" : ""}{r.change}% vs last week
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
