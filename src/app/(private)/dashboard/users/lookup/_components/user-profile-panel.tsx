/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Check, Copy, Loader2, X } from "lucide-react";
import { userLookupService } from "@/app/services/userLookupService";

// ── formatting ────────────────────────────────────────────────────────────
const rwf = (n: any) => (typeof n === "number" ? `${Math.round(n).toLocaleString()} RWF` : "—");
const day = (d: any) => (d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—");
const words = (s: any) => (s ? String(s).replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase()) : "—");
const yesNo = (b: any) => (b ? "Yes" : "No");
const address = (u: any) =>
  [u.village, u.cell, u.sector, u.district, u.province].filter(Boolean).join(", ") || u.location || "—";

const STATUS_TONE: Record<string, string> = {
  DELIVERED: "bg-[#E3F3E8] text-[#007A35]", PAID: "bg-[#E3F3E8] text-[#007A35]", COMPLETED: "bg-[#E3F3E8] text-[#007A35]",
  ACTIVE: "bg-[#E3F3E8] text-[#007A35]", VERIFIED: "bg-[#E3F3E8] text-[#007A35]", APPROVED: "bg-[#E3F3E8] text-[#007A35]",
  CANCELLED: "bg-red-50 text-red-700", FAILED: "bg-red-50 text-red-700", REJECTED: "bg-red-50 text-red-700",
  EXPIRED: "bg-red-50 text-red-700", REFUNDED: "bg-orange-50 text-orange-700",
};
function Status({ value }: { value: any }) {
  if (!value) return <span className="text-[#4A6358]">—</span>;
  return (
    <span className={`inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-[12px] font-bold ${STATUS_TONE[value] ?? "bg-[#FFF3D1] text-[#7A5200]"}`}>
      {words(value)}
    </span>
  );
}

// ── building blocks ───────────────────────────────────────────────────────
type Column = { label: string; render: (row: any) => ReactNode; align?: "right" };

function RecordsTable({ rows, columns, empty }: { rows: any[]; columns: Column[]; empty: string }) {
  if (!rows?.length) return <p className="m-0 rounded-xl bg-[#F6F9F7] p-6 text-center text-sm text-[#4A6358]">{empty}</p>;
  return (
    <div className="overflow-x-auto rounded-xl border border-[#DCE6DF]">
      <table className="w-full text-[14px]">
        <thead>
          <tr className="bg-[#F6F9F7] text-left text-[12px] uppercase tracking-[0.6px] text-[#4A6358]">
            {columns.map((c) => (
              <th key={c.label} className={`whitespace-nowrap px-3 py-2.5 font-bold ${c.align === "right" ? "text-right" : ""}`}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 50).map((row, i) => (
            <tr key={row.id ?? i} className="border-t border-[#EEF3EF]">
              {columns.map((c) => (
                <td key={c.label} className={`px-3 py-2.5 text-[#0B2E1F] ${c.align === "right" ? "whitespace-nowrap text-right" : ""}`}>{c.render(row)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length > 50 && <p className="m-0 border-t border-[#EEF3EF] px-3 py-2 text-xs text-[#4A6358]">Showing the latest 50 of {rows.length}.</p>}
    </div>
  );
}

function Figure({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-xl bg-[#F6F9F7] px-3.5 py-3">
      <p className="m-0 text-[12px] font-bold uppercase tracking-[0.6px] text-[#4A6358]">{label}</p>
      <p className="m-0 mt-1 text-[18px] font-bold text-[#0B2E1F] [font-family:var(--font-inter-tight),sans-serif]">{value}</p>
    </div>
  );
}

function Facts({ items }: { items: [string, ReactNode][] }) {
  return (
    <dl className="m-0 grid grid-cols-1 gap-x-6 gap-y-2.5 sm:grid-cols-2">
      {items.map(([k, v]) => (
        <div key={k} className="min-w-0">
          <dt className="text-[12px] font-bold uppercase tracking-[0.6px] text-[#4A6358]">{k}</dt>
          <dd className="m-0 break-words text-[15px] text-[#0B2E1F]">{v || "—"}</dd>
        </div>
      ))}
    </dl>
  );
}

// ── what each kind of account shows ───────────────────────────────────────
type View = { kindLabel: string; facts: [string, ReactNode][]; figures: [string, ReactNode][]; tabs: { key: string; label: string; rows: any[]; columns: Column[]; empty: string }[] };

const orderColumns: Column[] = [
  { label: "Order", render: (o) => o.orderNumber || o.id?.slice(0, 8) },
  { label: "Status", render: (o) => <Status value={o.status} /> },
  { label: "Payment", render: (o) => <Status value={o.paymentStatus} /> },
  { label: "Items", render: (o) => o.orderItems?.length ?? "—", align: "right" },
  { label: "Amount", render: (o) => rwf(o.totalAmount), align: "right" },
  { label: "Date", render: (o) => day(o.createdAt) },
];
const walletColumns: Column[] = [
  { label: "Type", render: (t) => words(t.type) },
  { label: "Status", render: (t) => <Status value={t.status} /> },
  { label: "Amount", render: (t) => rwf(t.amount), align: "right" },
  { label: "Balance after", render: (t) => rwf(t.newBalance), align: "right" },
  { label: "Date", render: (t) => day(t.createdAt) },
];
const voucherColumns: Column[] = [
  { label: "Code", render: (v) => v.voucherCode },
  { label: "Status", render: (v) => <Status value={v.status} /> },
  { label: "Credit limit", render: (v) => rwf(v.creditLimit), align: "right" },
  { label: "Used", render: (v) => rwf(v.usedCredit), align: "right" },
  { label: "Still owed", render: (v) => rwf(v.remainingAmount), align: "right" },
  { label: "Issued", render: (v) => day(v.issuedDate || v.createdAt) },
];
const subscriptionColumns: Column[] = [
  { label: "Plan", render: (s) => s.plan?.name ?? "—" },
  { label: "Status", render: (s) => <Status value={s.status} /> },
  { label: "From", render: (s) => day(s.startDate) },
  { label: "To", render: (s) => day(s.endDate) },
  { label: "Paid", render: (s) => rwf(s.amountPaid), align: "right" },
];
const submissionColumns: Column[] = [
  { label: "Product", render: (s) => s.approvedProduct?.productName || s.productName },
  { label: "Status", render: (s) => <Status value={s.status} /> },
  { label: "Qty", render: (s) => s.acceptedQty ?? s.submittedQty ?? "—", align: "right" },
  { label: "Price", render: (s) => rwf(s.agreedPrice ?? s.acceptedPrice ?? s.wishedPrice), align: "right" },
  { label: "Total", render: (s) => rwf(s.totalAmount), align: "right" },
  { label: "Date", render: (s) => day(s.submittedAt || s.createdAt) },
];

const sum = (rows: any[] = [], pick: (r: any) => number, when: (r: any) => boolean = () => true) =>
  rows.filter(when).reduce((t, r) => t + (Number(pick(r)) || 0), 0);

function buildView(u: any): View {
  const account: [string, ReactNode][] = [
    ["Email", u.email],
    ["Phone", u.phone],
    ["Joined", day(u.createdAt)],
    ["Two-factor sign-in", yesNo(u.twoFactorEnabled)],
  ];

  if (u.userType === "FARMER") {
    const subs = u.submissions ?? [];
    return {
      kindLabel: "Farmer",
      facts: [...account, ["Address", address(u)], ["Phone verified", yesNo(u.phoneVerified)], ["Language", u.preferredLanguage], ["Account locked", yesNo(u.accountLocked)]],
      figures: [
        ["Submissions", subs.length],
        ["Paid to farmer", rwf(sum(subs, (s) => s.totalAmount, (s) => s.status === "PAID"))],
        ["In progress", subs.filter((s: any) => !["PAID", "REJECTED"].includes(s.status)).length],
        ["Vouchers", u.Voucher?.length ?? 0],
      ],
      tabs: [
        { key: "submissions", label: "Submissions", rows: subs, columns: submissionColumns, empty: "No harvest submissions yet." },
        { key: "vouchers", label: "Vouchers", rows: u.Voucher ?? [], columns: voucherColumns, empty: "No vouchers." },
      ],
    };
  }

  if (u.userType === "RESTAURANT") {
    const orders = u.orders ?? [];
    const activeSub = (u.subscriptions ?? []).find((s: any) => s.status === "ACTIVE");
    const txns = u.Wallet?.transactions ?? u.walletTransactions ?? [];
    return {
      kindLabel: u.customerType?.name || words(u.role) || "Customer",
      facts: [
        ...account,
        ["TIN", u.tin], ["Address", address(u)], ["Verified", yesNo(u.verified)], ["Accepted terms", yesNo(u.agreed)],
        ["Language", u.preferredLanguage], ["On website", yesNo(u.featuredOnWebsite)],
      ],
      figures: [
        ["Orders", orders.length],
        ["Spent (delivered)", rwf(sum(orders, (o) => o.totalAmount, (o) => o.status === "DELIVERED"))],
        ["Wallet balance", u.Wallet ? rwf(u.Wallet.balance) : "No wallet"],
        ["Subscription", activeSub?.plan?.name ?? "None"],
      ],
      tabs: [
        { key: "orders", label: "Orders", rows: orders, columns: orderColumns, empty: "No orders yet." },
        { key: "wallet", label: "Wallet", rows: txns, columns: walletColumns, empty: "No wallet activity." },
        { key: "vouchers", label: "Vouchers", rows: u.Voucher ?? [], columns: voucherColumns, empty: "No vouchers." },
        { key: "subscriptions", label: "Subscriptions", rows: u.subscriptions ?? [], columns: subscriptionColumns, empty: "No subscriptions." },
        {
          key: "affiliators", label: "Affiliators", rows: u.affiliators ?? [], empty: "No affiliators.",
          columns: [
            { label: "Name", render: (a) => a.name },
            { label: "Phone", render: (a) => a.phone ?? "—" },
            { label: "Email", render: (a) => a.email ?? "—" },
            { label: "Orders", render: (a) => a.orders?.length ?? 0, align: "right" },
          ],
        },
      ],
    };
  }

  if (u.userType === "AFFILIATOR") {
    const orders = u.orders ?? [];
    return {
      kindLabel: "Affiliator",
      facts: [...account, ["Works for", u.restaurant?.name]],
      figures: [
        ["Orders placed", orders.length],
        ["Order value", rwf(sum(orders, (o) => o.totalAmount))],
        ["Customer", u.restaurant?.name ?? "—"],
      ],
      tabs: [
        { key: "orders", label: "Orders", rows: orders, columns: orderColumns, empty: "No orders yet." },
        { key: "wallet", label: "Wallet", rows: u.walletTransactions ?? [], columns: walletColumns, empty: "No wallet activity." },
      ],
    };
  }

  // Staff: admins, aggregators, logistics, traders, market prices…
  const assigned = u.aggregatorAssignments ?? [];
  const deliveries = u.logisticsAssignments ?? [];
  return {
    kindLabel: "Staff",
    facts: [
      ...account,
      ["System role", words(u.role)], ["Dashboard role", u.AdminRole?.name ?? (u.role === "SUPERUSER" ? "Super admin" : "—")],
      ["Address", address(u)], ["Accepted terms", yesNo(u.agreed)],
    ],
    figures: [
      ["Submissions handled", assigned.length],
      ["Deliveries", deliveries.length],
      ...(u.traderWallet ? ([["Trader wallet", rwf(u.traderWallet.balance)]] as [string, ReactNode][]) : []),
    ],
    tabs: [
      { key: "submissions", label: "Submissions handled", rows: assigned, empty: "No farmer submissions assigned.",
        columns: [{ label: "Farmer", render: (s) => s.farmer?.name ?? s.farmer?.phone ?? "—" }, ...submissionColumns] },
      { key: "deliveries", label: "Deliveries", rows: deliveries, empty: "No deliveries assigned.",
        columns: [{ label: "Customer", render: (o) => o.restaurant?.name ?? "—" }, ...orderColumns] },
      { key: "wallet", label: "Wallet", rows: u.walletTransactions ?? [], columns: walletColumns, empty: "No wallet activity." },
    ],
  };
}

// ── panel ─────────────────────────────────────────────────────────────────
export function UserProfilePanel({ userId, onClose }: { userId: string; onClose?: () => void }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    setUser(null);
    userLookupService
      .getUserById(userId)
      .then((res) => !cancelled && setUser(res.data))
      .catch((e) => !cancelled && setError(e?.response?.data?.message || "Could not load this user"))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const view = useMemo(() => (user ? buildView(user) : null), [user]);
  useEffect(() => {
    if (view) setTab(view.tabs.find((t) => t.rows.length)?.key ?? view.tabs[0]?.key ?? "");
  }, [view]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center gap-2 text-[#4A6358]">
        <Loader2 className="h-5 w-5 animate-spin" /> Loading details…
      </div>
    );
  }
  if (error || !user || !view) return <p className="m-0 p-6 text-sm text-red-600">{error || "User not found"}</p>;

  const active = view.tabs.find((t) => t.key === tab) ?? view.tabs[0];
  const initials = String(user.name || "?").trim().slice(0, 2).toUpperCase();

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#0B2E1F] text-lg font-bold text-[#00D048]">{initials}</span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="m-0 truncate text-[22px] font-bold text-[#0B2E1F] [font-family:var(--font-inter-tight),sans-serif]">{user.name}</h2>
            <span className="rounded-full bg-[#E3F3E8] px-2.5 py-0.5 text-[12px] font-bold text-[#007A35]">{view.kindLabel}</span>
            {user.deletedAt && <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-[12px] font-bold text-red-700">In trash since {day(user.deletedAt)}</span>}
          </div>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText(user.id);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
            className="mt-1 inline-flex items-center gap-1.5 rounded-md text-[12px] text-[#4A6358] hover:text-[#0B2E1F] cursor-pointer"
            title="Copy user ID"
          >
            ID {user.id} {copied ? <Check className="h-3.5 w-3.5 text-[#00A43A]" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>
        {onClose && (
          <button type="button" onClick={onClose} aria-label="Close details" className="flex h-9 w-9 items-center justify-center rounded-full text-[#4A6358] hover:bg-[#F6F9F7] cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {view.figures.length > 0 && (
        <div className="grid grid-cols-2 gap-2.5 xl:grid-cols-4">
          {view.figures.map(([k, v]) => <Figure key={k} label={k} value={v} />)}
        </div>
      )}

      <section className="rounded-2xl border border-[#DCE6DF] p-4">
        <h3 className="m-0 mb-3 text-[15px] font-bold text-[#0B2E1F]">Account</h3>
        <Facts items={view.facts} />
      </section>

      {view.tabs.length > 0 && (
        <section className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-1.5" role="tablist">
            {view.tabs.map((t) => (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={t.key === active.key}
                onClick={() => setTab(t.key)}
                className={`min-h-9 rounded-full px-3.5 text-[13px] font-bold transition-colors cursor-pointer ${
                  t.key === active.key ? "bg-[#0B2E1F] text-white" : "border border-[#DCE6DF] bg-white text-[#0B2E1F] hover:border-[#00A43A]"
                }`}
              >
                {t.label} <span className={t.key === active.key ? "text-[#7CF2A6]" : "text-[#4A6358]"}>{t.rows.length}</span>
              </button>
            ))}
          </div>
          <RecordsTable rows={active.rows} columns={active.columns} empty={active.empty} />
        </section>
      )}
    </div>
  );
}
