"use client";

import { motion } from "motion/react";
import { useState, useCallback, useEffect } from "react";
import { marketPricingService } from "@/app/services/marketPricingService";
import { PriceAnalysis } from "@/types/market-pricing";
import { Skel, ErrorBanner, EmptyState, PnLBadge } from "./shared-atoms";
import { daysAgo, fmt } from "./utils";

const AnalysisPanel = ({
  productId,
  productName,
  onClose,
}: {
  productId: string;
  productName: string;
  onClose: () => void;
}) => {
  const [data, setData] = useState<PriceAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await marketPricingService.analyzePrice({
        productId,
        startDate: daysAgo(30),
        endDate: new Date().toISOString(),
      });
      if (res.success) setData(res.data);
      else setError(res.message ?? "Analysis failed.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error.");
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      className="bg-white border border-stone-200 rounded-2xl shadow-lg overflow-hidden"
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 bg-gradient-to-r from-amber-50 to-stone-50">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-700 mb-0.5">
            Price Analysis
          </p>
          <h3 className="text-sm font-bold text-stone-800 truncate max-w-[220px]">
            {productName}
          </h3>
          <p className="text-[11px] text-stone-400 mt-0.5">Last 30 days</p>
        </div>
        <button
          onClick={onClose}
          aria-label="Close analysis"
          className="w-8 h-8 rounded-xl border border-stone-200 flex items-center justify-center text-stone-400 hover:bg-stone-100 transition-all"
        >
          ✕
        </button>
      </div>

      <div className="px-5 py-4">
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skel key={i} cls="h-12 w-full" />
            ))}
          </div>
        )}
        {!loading && error && <ErrorBanner message={error} onRetry={load} />}
        {!loading &&
          !error &&
          data &&
          (data.analysis.totalRecords === 0 ? (
            <EmptyState
              title="No data"
              message="No price records for this period."
            />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {[
                  {
                    label: "Our Avg",
                    val: fmt(data.analysis.avgOurPrice),
                    c: "text-blue-700",
                    bg: "bg-blue-50 border-blue-100",
                  },
                  {
                    label: "Avg Market",
                    val: fmt(data.analysis.avgMarketPrice),
                    c: "text-stone-700",
                    bg: "bg-stone-50 border-stone-100",
                  },
                  {
                    label: "Min Market",
                    val: fmt(data.analysis.minMarketPrice),
                    c: "text-emerald-700",
                    bg: "bg-emerald-50 border-emerald-100",
                  },
                  {
                    label: "Max Market",
                    val: fmt(data.analysis.maxMarketPrice),
                    c: "text-red-600",
                    bg: "bg-red-50 border-red-100",
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className={`rounded-xl px-3 py-2.5 border ${s.bg}`}
                  >
                    <p className="text-[10px] text-stone-500 mb-0.5">
                      {s.label}
                    </p>
                    <p className={`text-sm font-bold ${s.c}`}>{s.val}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 mb-4">
                <div>
                  <p className="text-[10px] text-stone-500 mb-1">
                    Overall Status
                  </p>
                  <div className="flex items-center gap-2">
                    <PnLBadge status={data.analysis.profitLoss} />
                    <span className="text-xs text-stone-500">
                      {Math.abs(data.analysis.percentageDifference)}% diff
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-stone-500 mb-0.5">Records</p>
                  <p className="text-xl font-black text-stone-800">
                    {data.analysis.totalRecords}
                  </p>
                </div>
              </div>

              {data.marketBreakdown && data.marketBreakdown.length > 0 && (
                <>
                  <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2">
                    Per Market
                  </p>
                  <div className="space-y-1.5">
                    {data.marketBreakdown.map((mb) => (
                      <div
                        key={mb.market.id}
                        className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-stone-50 border border-stone-100"
                      >
                        <div>
                          <p className="text-xs font-semibold text-stone-700 truncate">
                            {mb.market.name}
                          </p>
                          <p className="text-[10px] text-stone-400">
                            {mb.market.district} · {mb.recordCount} records
                          </p>
                        </div>
                        <div className="text-right ml-3 space-y-0.5">
                          <p className="text-xs font-bold">
                            {fmt(mb.avgMarketPrice)}
                          </p>
                          <PnLBadge status={mb.profitLoss} />
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          ))}
      </div>
    </motion.div>
  );
};

export default AnalysisPanel;
