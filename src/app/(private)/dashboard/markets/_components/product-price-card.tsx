"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ProductPriceCardProps,
  type PriceRecord,
} from "@/types/market-pricing";
import { PricePill, EmptyTab } from "./shared-atoms";
import { fmtDate, fmt } from "./utils";

function PriceRecordRow({
  record,
  onEdit,
  onDelete,
}: {
  record: PriceRecord;
  onEdit: (r: PriceRecord) => void;
  onDelete: (r: PriceRecord) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-stone-50 transition-colors group"
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
        <div className="min-w-0">
          <p className="text-xs font-semibold text-stone-700 truncate">
            {record.market.name}
          </p>
          <p className="text-[10px] text-stone-400">
            {[record.market.district, record.market.province]
              .filter(Boolean)
              .join(" · ")}{" "}
            · {fmtDate(record.recordedDate)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="text-right hidden sm:block">
          <p className="text-[10px] text-stone-400">Ours</p>
          <p className="text-xs font-bold text-stone-600">
            {fmt(record.ourPrice)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-stone-400">Market</p>
          <p className="text-xs font-bold text-stone-900">
            {fmt(record.marketPrice)}
          </p>
        </div>
        <PricePill
          diff={record.difference}
          pct={
            record.marketPrice > 0
              ? Math.round((record.difference / record.marketPrice) * 100)
              : 0
          }
        />
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(record)}
            aria-label="Edit"
            className="w-6 h-6 rounded-lg border border-stone-200 flex items-center justify-center
                       text-stone-400 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 transition-all"
          >
            <svg
              className="w-3 h-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
          <button
            onClick={() => onDelete(record)}
            aria-label="Delete"
            className="w-6 h-6 rounded-lg border border-stone-200 flex items-center justify-center
                       text-stone-400 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
          >
            <svg
              className="w-3 h-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function ProductPriceCard({
  group,
  onAnalyze,
  isAnalyzing,
  onRecordPrice,
  onEditRecord,
  onDeleteRecord,
}: ProductPriceCardProps) {
  const [tab, setTab] = useState<"active" | "recent">("active");
  const [expanded, setExpanded] = useState(true);

  /**
   * TAB DEFINITIONS (fixed)
   *
   * "Active"  = any record from the last 30 days   (>= 30-day cutoff)
   * "Recent"  = any record from the last 7 days    (>= 7-day cutoff)
   *             ← this is a SUB-SET of Active, so it always has data
   *               when you've recorded something this week.
   *
   * Both lists are sorted newest-first.
   *
   * ── Why the old code broke ────────────────────────────────────────────────
   * The old helper defined "recent" as records OLDER than 30 days. In a new
   * database with only recent data, that bucket is always empty. Redefining
   * "recent" as "last 7 days" gives useful, always-populated data.
   */
  const { active, recent } = useMemo(() => {
    const now = Date.now();
    const cutoff30 = now - 30 * 24 * 60 * 60 * 1000;
    const cutoff7 = now - 7 * 24 * 60 * 60 * 1000;

    const desc = (a: PriceRecord, b: PriceRecord) =>
      new Date(b.recordedDate).getTime() - new Date(a.recordedDate).getTime();

    const active = group.records
      .filter((r) => new Date(r.recordedDate).getTime() >= cutoff30)
      .sort(desc);

    const recent = group.records
      .filter((r) => new Date(r.recordedDate).getTime() >= cutoff7)
      .sort(desc);

    return { active, recent };
  }, [group.records]);

  const shown = tab === "active" ? active : recent;

  const avg = group.records.length
    ? group.records.reduce((s, r) => s + r.marketPrice, 0) /
      group.records.length
    : 0;
  const diff = group.ourPrice - avg;
  const pct = avg > 0 ? Math.round((diff / avg) * 100) : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden"
    >
      {/* header */}
      <div
        className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-stone-50 transition-colors"
        onClick={() => setExpanded((e) => !e)}
        role="button"
        aria-expanded={expanded}
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500
                          flex items-center justify-center text-white font-black text-sm flex-shrink-0"
          >
            {group.productName.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-stone-800 truncate">
              {group.productName}
            </h3>
            <p className="text-[11px] text-stone-400">
              Our price:{" "}
              <span className="font-semibold text-stone-600">
                {fmt(group.ourPrice)}
              </span>{" "}
              · {group.records.length} records
              {recent.length > 0 && (
                <span className="ml-1 text-emerald-600 font-semibold">
                  · {recent.length} this week
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {group.records.length > 0 && <PricePill diff={diff} pct={pct} />}

          {/* add record */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRecordPrice(group.productId);
            }}
            aria-label="Record price"
            title="Record price at a market"
            className="w-7 h-7 rounded-lg border border-stone-200 flex items-center justify-center
                       text-stone-400 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 transition-all"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>

          {/* analyze */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAnalyze(group.productId, group.productName);
            }}
            disabled={group.records.length === 0}
            className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all disabled:opacity-30 ${
              isAnalyzing
                ? "border-amber-500 bg-amber-100 text-amber-900"
                : "border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100"
            }`}
          >
            {isAnalyzing ? "Open ▸" : "Analyze"}
          </button>

          <motion.div
            animate={{ rotate: expanded ? 0 : -90 }}
            className="text-stone-400"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </motion.div>
        </div>
      </div>

      {/* body */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            {/* tab bar */}
            <div className="flex items-center justify-between px-5 pt-3 pb-1.5 border-t border-stone-50">
              <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">
                Market Prices
              </p>
              <div className="flex gap-0.5 bg-stone-100 rounded-xl p-0.5">
                {(["active", "recent"] as const).map((t) => {
                  const count = t === "active" ? active.length : recent.length;
                  return (
                    <button
                      key={t}
                      onClick={(e) => {
                        e.stopPropagation();
                        setTab(t);
                      }}
                      aria-pressed={tab === t}
                      className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
                        tab === t
                          ? "bg-white shadow-sm text-stone-800"
                          : "text-stone-500"
                      }`}
                    >
                      <span className="capitalize">{t}</span>
                      <span
                        className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full ${
                          tab === t
                            ? "bg-amber-100 text-amber-700"
                            : "bg-stone-200 text-stone-500"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* tab hint */}
            <p className="text-[9px] text-stone-300 px-5 pb-1">
              {tab === "active"
                ? "Last 30 days · hover rows to edit or delete"
                : "Last 7 days · hover rows to edit or delete"}
            </p>

            {/* records */}
            <div className="px-3 pb-3">
              {shown.length === 0 ? (
                <EmptyTab tab={tab} />
              ) : (
                <div className="space-y-0.5">
                  {shown.map((r) => (
                    <PriceRecordRow
                      key={r.id}
                      record={r}
                      onEdit={onEditRecord}
                      onDelete={onDeleteRecord}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
