"use client";

import { PriceRecord, ProductGroup, ToastItem } from "@/types/market-pricing";
import { AnimatePresence, motion } from "motion/react";
import { useState, useCallback, useEffect, useRef } from "react";
import {
  BarChart2,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";

export const Skel = ({ cls }: { cls: string }) => (
  <div className={`bg-gray-200 animate-pulse rounded-lg ${cls}`} />
);

export const PricePill = ({ diff, pct }: { diff: number; pct: number }) => {
  if (Math.abs(pct) < 1)
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 text-gray-500 border border-gray-200">
        ≈ Equal
      </span>
    );
  const cheaper = diff < 0;
  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
        cheaper
          ? "bg-green-50 text-green-800 border-green-200"
          : "bg-gray-100 text-gray-800 border-gray-200"
      }`}
    >
      {cheaper ? "▼" : "▲"} {Math.abs(pct)}%
    </span>
  );
};

export const PnLBadge = ({
  status,
}: {
  status: "PROFIT" | "LOSS" | "BREAK_EVEN";
}) => {
  const cfg = {
    PROFIT: {
      l: "Profit",
      c: "bg-green-100 text-green-800 border-green-200",
      Icon: TrendingDown,
    },
    LOSS: {
      l: "Loss",
      c: "bg-gray-100 text-gray-700 border-gray-200",
      Icon: TrendingUp,
    },
    BREAK_EVEN: {
      l: "Break Even",
      c: "bg-gray-100 text-gray-600 border-gray-200",
      Icon: Minus,
    },
  }[status];
  return (
    <span
      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${cfg.c}`}
    >
      <cfg.Icon className="w-2.5 h-2.5" />
      {cfg.l}
    </span>
  );
};

export const EmptyState = ({
  title,
  message,
}: {
  title: string;
  message: string;
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex flex-col items-center justify-center py-14 text-center"
  >
    <div className="w-12 h-12 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center mb-3">
      <BarChart2 className="w-6 h-6 text-gray-400" />
    </div>
    <p className="text-sm font-bold text-gray-600 mb-1">{title}</p>
    <p className="text-xs text-gray-400 max-w-xs leading-relaxed">{message}</p>
  </motion.div>
);

export const EmptyTab = ({ tab }: { tab: "active" | "recent" }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex flex-col items-center justify-center py-8 text-center"
  >
    <div className="w-9 h-9 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center mb-2">
      <BarChart2 className="w-4 h-4 text-gray-400" />
    </div>
    <p className="text-xs font-bold text-gray-500">No records</p>
    <p className="text-[10px] text-gray-400 mt-0.5 max-w-[200px] leading-relaxed">
      {tab === "active"
        ? "No prices recorded in the last 30 days."
        : "No prices recorded in the last 7 days."}
    </p>
  </motion.div>
);

export const ErrorBanner = ({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) => (
  <motion.div
    initial={{ opacity: 0, y: -8 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3.5 mb-6"
  >
    <p className="text-sm text-gray-700 font-medium">{message}</p>
    <button
      onClick={onRetry}
      className="text-xs font-bold text-gray-900 underline"
    >
      Retry
    </button>
  </motion.div>
);

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const add = useCallback(
    (message: string, type: "success" | "error" = "success") => {
      const id = Date.now();
      setToasts((t) => [...t, { id, message, type }]);
      setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
    },
    [],
  );
  return { toasts, add };
}

export function ToastStack({ toasts }: { toasts: ToastItem[] }) {
  return (
    <div className="fixed top-4 right-4 z-[100] space-y-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 24, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 24, scale: 0.96 }}
            className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border text-xs font-bold pointer-events-auto ${
              t.type === "success"
                ? "bg-white border-green-200 text-green-800"
                : "bg-white border-gray-200 text-gray-800"
            }`}
          >
            {t.type === "success" ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" />
            )}
            {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/** Animated backdrop + centred card wrapper */
export function ModalShell({
  open,
  onClose,
  children,
  width = "max-w-md",
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  width?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className={`relative w-full ${width} bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden`}
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/** Modal header */
export function ModalHeader({
  icon,
  title,
  subtitle,
  onClose,
  danger,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onClose: () => void;
  danger?: boolean;
}) {
  return (
    <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100 bg-gray-50">
      <div className="flex items-center gap-3">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-sm flex-shrink-0 ${
            danger ? "bg-gray-900" : "bg-black"
          }`}
        >
          {icon}
        </div>
        <div>
          <h2 className="text-sm font-black text-gray-900">{title}</h2>
          {subtitle && (
            <p className="text-[11px] text-gray-400 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      <button
        onClick={onClose}
        aria-label="Close modal"
        className="w-7 h-7 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-all mt-0.5"
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
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}

export function Field({
  label,
  required,
  error,
  children,
  hint,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div>
      <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-widest mb-1.5">
        {label}
        {required && <span className="text-green-600 ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="text-[10px] text-gray-400 mt-1">{hint}</p>
      )}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[11px] text-gray-700 mt-1 font-medium"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}

export function Input({
  type = "text",
  value,
  onChange,
  placeholder,
  hasError,
  min,
  step,
  autoFocus,
}: {
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hasError?: boolean;
  min?: string;
  step?: string;
  autoFocus?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (autoFocus) ref.current?.focus();
  }, [autoFocus]);
  return (
    <input
      ref={ref}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      min={min}
      step={step}
      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-gray-50 text-gray-900 placeholder-gray-400 transition-all focus:outline-none focus:ring-2 focus:bg-white ${
        hasError
          ? "border-gray-400 focus:ring-gray-300"
          : "border-gray-200 focus:ring-green-300 focus:border-green-400"
      }`}
    />
  );
}

export function Select({
  value,
  onChange,
  children,
  hasError,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
  hasError?: boolean;
  disabled?: boolean;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-gray-50 text-gray-900 transition-all focus:outline-none focus:ring-2 focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed ${
        hasError
          ? "border-gray-400 focus:ring-gray-300"
          : "border-gray-200 focus:ring-green-300 focus:border-green-400"
      }`}
    >
      {children}
    </select>
  );
}

export function Toggle({
  label,
  checked,
  onChange,
  description,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  description?: string;
}) {
  return (
    <div className="flex items-center justify-between py-2.5 px-4 rounded-xl bg-gray-50 border border-gray-200">
      <div>
        <p className="text-xs font-bold text-gray-700">{label}</p>
        {description && (
          <p className="text-[10px] text-gray-400 mt-0.5">{description}</p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-1 ${
          checked ? "bg-green-600" : "bg-gray-300"
        }`}
      >
        <motion.span
          animate={{ x: checked ? 16 : 2 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="inline-block w-4 h-4 bg-white rounded-full shadow-sm"
        />
      </button>
    </div>
  );
}

export function ModalActions({
  onCancel,
  onConfirm,
  confirmLabel,
  loading,
  danger,
  disabled,
}: {
  onCancel: () => void;
  onConfirm: () => void;
  confirmLabel: string;
  loading?: boolean;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="flex gap-2.5 pt-1">
      <button
        type="button"
        onClick={onCancel}
        disabled={loading}
        className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={onConfirm}
        disabled={loading || disabled}
        className={`flex-1 py-2.5 rounded-xl text-sm font-black text-white shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 ${
          danger
            ? "bg-gray-900 hover:bg-black"
            : "bg-green-600 hover:bg-green-700"
        }`}
      >
        {loading && (
          <svg
            className="w-3.5 h-3.5 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {confirmLabel}
      </button>
    </div>
  );
}

export function AlertBox({
  type,
  message,
}: {
  type: "error" | "success";
  message: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-start gap-2.5 px-3.5 py-3 rounded-xl text-xs font-medium border ${
        type === "error"
          ? "bg-gray-50 border-gray-200 text-gray-700"
          : "bg-green-50 border-green-200 text-green-700"
      }`}
    >
      <span className="mt-0.5 flex-shrink-0">
        {type === "error" ? (
          <AlertTriangle className="w-3.5 h-3.5" />
        ) : (
          <CheckCircle2 className="w-3.5 h-3.5" />
        )}
      </span>
      <span>{message}</span>
    </motion.div>
  );
}

export const groupByProduct = (records: PriceRecord[]): ProductGroup[] => {
  const map = new Map<string, ProductGroup>();
  for (const r of records) {
    if (!map.has(r.product.id))
      map.set(r.product.id, {
        productId: r.product.id,
        productName: r.product.name,
        ourPrice: r.ourPrice,
        records: [],
      });
    map.get(r.product.id)!.records.push(r);
  }
  return Array.from(map.values());
};
