"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ProductGroup } from "@/types/market-pricing";

// ─── types ────────────────────────────────────────────────────────────────────

interface TrendPoint {
  label: string;
  our: number;
  mkt: number;
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function shortDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-RW", {
    month: "short",
    day: "numeric",
  });
}

function kFmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(Math.round(n));
}

function buildSeries(group: ProductGroup): TrendPoint[] {
  if (!group.records.length) return [];

  const sorted = [...group.records].sort(
    (a, b) =>
      new Date(a.recordedDate).getTime() - new Date(b.recordedDate).getTime(),
  );

  const map = new Map<string, TrendPoint>();
  for (const r of sorted) {
    const key = r.recordedDate.split("T")[0];
    map.set(key, {
      label: shortDate(r.recordedDate),
      our: r.ourPrice,
      mkt: r.marketPrice,
    });
  }
  return Array.from(map.values());
}

// ─── SVG sparkline ────────────────────────────────────────────────────────────

function Sparkline({
  points,
  w,
  h,
}: {
  points: TrendPoint[];
  w: number;
  h: number;
}) {
  if (points.length < 2) return null;

  const pT = 18,
    pB = 22,
    pL = 4,
    pR = 4;
  const iw = w - pL - pR;
  const ih = h - pT - pB;

  const allV = points.flatMap((p) => [p.our, p.mkt]);
  const vMin = Math.min(...allV) * 0.96;
  const vMax = Math.max(...allV) * 1.04;
  const vR = vMax - vMin || 1;

  const px = (i: number) => pL + (i / (points.length - 1)) * iw;
  const py = (v: number) => pT + ih - ((v - vMin) / vR) * ih;

  const line = (k: "our" | "mkt") =>
    points
      .map(
        (p, i) =>
          `${i === 0 ? "M" : "L"} ${px(i).toFixed(1)} ${py(p[k]).toFixed(1)}`,
      )
      .join(" ");

  const area = (k: "our" | "mkt") => {
    const base = pT + ih;
    return `${line(k)} L ${px(points.length - 1).toFixed(1)} ${base} L ${px(0).toFixed(1)} ${base} Z`;
  };

  const labelIdxs = [
    ...new Set([0, Math.floor((points.length - 1) / 2), points.length - 1]),
  ];

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width="100%"
      height={h}
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id="cg-our" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.38" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.03" />
        </linearGradient>
        <linearGradient id="cg-mkt" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#34d399" stopOpacity="0.30" />
          <stop offset="100%" stopColor="#34d399" stopOpacity="0.03" />
        </linearGradient>
        <filter id="cg-glow">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* grid */}
      {[0, 0.5, 1].map((t) => (
        <line
          key={t}
          x1={pL}
          x2={pL + iw}
          y1={pT + t * ih}
          y2={pT + t * ih}
          stroke="rgba(255,255,255,0.07)"
          strokeWidth="0.6"
        />
      ))}

      {/* areas */}
      <motion.path
        d={area("mkt")}
        fill="url(#cg-mkt)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      />
      <motion.path
        d={area("our")}
        fill="url(#cg-our)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.08 }}
      />

      {/* market line */}
      <motion.path
        d={line("mkt")}
        fill="none"
        stroke="#34d399"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      />

      {/* our price line — glowing amber */}
      <motion.path
        d={line("our")}
        fill="none"
        stroke="#f59e0b"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        filter="url(#cg-glow)"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.12, ease: "easeOut" }}
      />

      {/* terminal dots at last point */}
      {(["our", "mkt"] as const).map((k) => (
        <motion.circle
          key={k}
          cx={px(points.length - 1)}
          cy={py(points[points.length - 1][k])}
          r={3}
          fill={k === "our" ? "#f59e0b" : "#34d399"}
          stroke="rgba(20,18,16,0.85)"
          strokeWidth={1.5}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.78, type: "spring", stiffness: 420 }}
        />
      ))}

      {/* x-axis labels */}
      {labelIdxs.map((i) => (
        <text
          key={i}
          x={px(i)}
          y={h - 3}
          textAnchor={
            i === 0 ? "start" : i === points.length - 1 ? "end" : "middle"
          }
          fontSize="7"
          fill="rgba(168,162,158,0.75)"
          fontFamily="system-ui"
        >
          {points[i].label}
        </text>
      ))}
    </svg>
  );
}

// ─── slide ────────────────────────────────────────────────────────────────────

function TrendSlide({
  group,
  idx,
  total,
}: {
  group: ProductGroup;
  idx: number;
  total: number;
}) {
  const series = useMemo(() => buildSeries(group), [group]);
  const hasChart = series.length >= 2;

  const latestMkt = group.records.length
    ? [...group.records].sort(
        (a, b) =>
          new Date(b.recordedDate).getTime() -
          new Date(a.recordedDate).getTime(),
      )[0].marketPrice
    : 0;

  const diff = group.ourPrice - latestMkt;
  const absPct =
    latestMkt > 0 ? Math.abs((diff / latestMkt) * 100).toFixed(1) : "—";
  const isHigher = diff > 0;
  const isEqual = Math.abs(Number(absPct)) < 1;
  const trend =
    series.length >= 2 ? series[series.length - 1].our - series[0].our : 0;

  return (
    <div className="h-full flex flex-col select-none">
      {/* header row */}
      <div className="flex items-start justify-between mb-2.5 flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="w-7 h-7 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500
                          flex items-center justify-center text-white text-[10px] font-black
                          flex-shrink-0 shadow-lg shadow-amber-900/30"
          >
            {group.productName.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-black text-white truncate">
              {group.productName}
            </p>
            <p className="text-[8px] text-stone-500 mt-0.5">
              {group.records.length} records
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
          {isEqual ? (
            <span
              className="text-[8px] font-black px-1.5 py-0.5 rounded-full
                             bg-stone-700 text-stone-400 border border-stone-600"
            >
              ≈ EQ
            </span>
          ) : (
            <span
              className={`text-[8px] font-black px-1.5 py-0.5 rounded-full border ${
                isHigher
                  ? "bg-amber-900/40 text-amber-300 border-amber-700/50"
                  : "bg-emerald-900/40 text-emerald-300 border-emerald-700/50"
              }`}
            >
              {isHigher ? "▲" : "▼"} {absPct}%
            </span>
          )}
          <span className="text-[8px] text-stone-600 tabular-nums">
            {idx + 1}/{total}
          </span>
        </div>
      </div>

      {/* price mini-cards */}
      <div className="grid grid-cols-2 gap-1.5 mb-2.5 flex-shrink-0">
        <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 px-2.5 py-1.5">
          <div className="flex items-center gap-1 mb-0.5">
            <span
              className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0"
              style={{ boxShadow: "0 0 4px #f59e0b" }}
            />
            <span className="text-[7px] font-bold text-amber-400 uppercase tracking-wider">
              Ours
            </span>
          </div>
          <p className="text-sm font-black text-white tabular-nums">
            {kFmt(group.ourPrice)}
          </p>
          <p className="text-[7px] text-stone-600">RWF</p>
        </div>
        <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1.5">
          <div className="flex items-center gap-1 mb-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
            <span className="text-[7px] font-bold text-emerald-400 uppercase tracking-wider">
              Market
            </span>
          </div>
          <p className="text-sm font-black text-white tabular-nums">
            {kFmt(latestMkt)}
          </p>
          <p className="text-[7px] text-stone-600">RWF</p>
        </div>
      </div>

      {/* chart */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {hasChart ? (
          <Sparkline points={series} w={280} h={96} />
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-[9px] text-stone-600 text-center leading-relaxed">
              Need 2+ records
              <br />
              for trend chart
            </p>
          </div>
        )}
      </div>

      {/* legend */}
      {hasChart && (
        <div className="flex items-center justify-between mt-1.5 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center gap-1">
              <span
                className="inline-block w-3 h-px bg-amber-400"
                style={{ boxShadow: "0 0 4px #f59e0b80" }}
              />
              <span className="text-[7px] text-stone-600">Ours</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-px bg-emerald-400" />
              <span className="text-[7px] text-stone-600">Market</span>
            </span>
          </div>
          {trend !== 0 && (
            <span
              className={`text-[7px] font-bold ${trend > 0 ? "text-red-400" : "text-emerald-400"}`}
            >
              {trend > 0 ? "↑" : "↓"} {kFmt(Math.abs(trend))} RWF
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ─── carousel ─────────────────────────────────────────────────────────────────

export interface PriceTrendCarouselProps {
  groups: ProductGroup[];
  /** ms per slide, default 1600 */
  interval?: number;
}

const slideVariants = {
  enter: (d: number) => ({ x: d > 0 ? 60 : -60, opacity: 0, scale: 0.95 }),
  center: { x: 0, opacity: 1, scale: 1 },
  exit: (d: number) => ({ x: d > 0 ? -60 : 60, opacity: 0, scale: 0.95 }),
};

export default function PriceTrendCarousel({
  groups,
  interval = 3200,
}: PriceTrendCarouselProps) {
  const slides = useMemo(
    () => groups.filter((g) => g.records.length > 0),
    [groups],
  );
  const [cur, setCur] = useState(0);
  const [dir, setDir] = useState(1);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const go = useCallback(
    (next: number) => {
      const safe = ((next % slides.length) + slides.length) % slides.length;
      setDir(next >= cur ? 1 : -1);
      setCur(safe);
    },
    [cur, slides.length],
  );

  const advance = useCallback(() => {
    setDir(1);
    setCur((c) => (c + 1) % Math.max(slides.length, 1));
  }, [slides.length]);

  useEffect(() => {
    if (paused || slides.length <= 1) return;
    timerRef.current = setInterval(advance, interval);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [paused, advance, interval, slides.length]);

  if (slides.length === 0) {
    return (
      <div
        className="rounded-2xl border border-stone-700/60 bg-[#181613] shadow-2xl
                   flex items-center justify-center"
        style={{ height: 272 }}
      >
        <div className="text-center px-4">
          <div className="text-2xl mb-2 opacity-20">📈</div>
          <p className="text-xs font-bold text-stone-500">No trend data yet</p>
          <p className="text-[10px] text-stone-600 mt-0.5">
            Record prices to see live charts
          </p>
        </div>
      </div>
    );
  }

  const safeIdx = cur % slides.length;
  const group = slides[safeIdx];

  return (
    <div
      className="rounded-2xl border border-stone-700/60 bg-[#181613] shadow-2xl overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* header */}
      <div
        className="flex items-center justify-between px-4 py-2.5 border-b border-stone-800/80
                   bg-gradient-to-r from-stone-900 to-stone-800/60"
      >
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
          </span>
          <span className="text-[9px] font-black text-stone-400 uppercase tracking-[0.15em]">
            Price Trends
          </span>
          {paused && (
            <span className="text-[8px] bg-stone-800 text-stone-500 px-1.5 py-0.5 rounded-full border border-stone-700">
              paused
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!paused && slides.length > 1 && (
            <div className="w-12 h-0.5 bg-stone-800 rounded-full overflow-hidden">
              <motion.div
                key={safeIdx}
                className="h-full rounded-full bg-amber-500"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: interval / 1000, ease: "linear" }}
              />
            </div>
          )}
          {[
            { label: "←", delta: -1 },
            { label: "→", delta: 1 },
          ].map(({ label, delta }) => (
            <button
              key={label}
              onClick={() => go(safeIdx + delta)}
              aria-label={label}
              className="w-5 h-5 rounded-lg border border-stone-700 flex items-center justify-center
                         text-stone-600 hover:text-stone-200 hover:border-stone-500 transition-all
                         text-[9px] font-bold"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* slides */}
      <div
        className="relative overflow-hidden px-4 pt-3 pb-1"
        style={{ height: 218 }}
      >
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={group.productId}
            custom={dir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
            className="absolute inset-0 px-4 pt-3 pb-1"
          >
            <TrendSlide group={group} idx={safeIdx} total={slides.length} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* dot nav */}
      {slides.length > 1 && (
        <div className="flex items-center justify-center gap-1 py-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              aria-label={`Slide ${i + 1}`}
              className={`rounded-full transition-all duration-300 ${
                i === safeIdx
                  ? "w-4 h-1.5 bg-amber-500"
                  : "w-1.5 h-1.5 bg-stone-700 hover:bg-stone-500"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
