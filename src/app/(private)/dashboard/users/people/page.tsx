/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Loader2, Search, Users, X } from "lucide-react";
import createAxiosClient from "@/app/hooks/axiosClient";

/** All users: one row per person, with every role they hold */

type Tab = "all" | "farmers" | "customers" | "staff" | "affiliators" | "deleted";

interface PersonRole {
  role: string;
  label: string;
  kind: "farmer" | "restaurant" | "affiliator" | "admin";
  profileId: string | null;
  actingAs: boolean;
  status: "ACTIVE" | "PENDING" | "SUSPENDED" | "DELETED";
}
interface Person {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  createdAt: string;
  deletedAt: string | null;
  roles: PersonRole[];
}

const TABS: { key: Tab; label: string }[] = [
  { key: "all", label: "All users" },
  { key: "farmers", label: "Farmers" },
  { key: "customers", label: "Customers" },
  { key: "staff", label: "Staff" },
  { key: "affiliators", label: "Affiliators" },
  { key: "deleted", label: "Deleted" },
];

const ROLE_STYLE: Record<PersonRole["kind"], string> = {
  farmer: "bg-[#E3F3E8] text-[#007A35]",
  restaurant: "bg-[#0B2E1F] text-[#00D048]",
  affiliator: "bg-[#FFF3D1] text-[#7A5200]",
  admin: "bg-[#E4EEF7] text-[#1B4F7A]",
};

const STATUS_NOTE: Record<string, string> = {
  PENDING: "waiting for approval",
  SUSPENDED: "deactivated",
  DELETED: "deleted",
};

const initials = (p: Person) =>
  (p.name || p.email || "?")
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]!.toUpperCase())
    .join("");

/** Page numbers around the current one: 1 … 4 5 6 … 12 */
const pageNumbers = (page: number, pages: number): (number | null)[] => {
  const keep = new Set([1, pages, page - 1, page, page + 1].filter((n) => n >= 1 && n <= pages));
  const sorted = [...keep].sort((a, b) => a - b);
  const out: (number | null)[] = [];
  sorted.forEach((n, i) => {
    if (i > 0 && n - sorted[i - 1] > 1) out.push(null);
    out.push(n);
  });
  return out;
};

const PageButton = ({ label, disabled, onClick, children }: { label: string; disabled: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button
    type="button"
    aria-label={label}
    disabled={disabled}
    onClick={onClick}
    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-[#DCE6DF] text-[#0B2E1F] hover:border-[#00A43A] disabled:cursor-not-allowed disabled:opacity-40"
  >
    {children}
  </button>
);

export default function AllUsersPage() {
  const [tab, setTab] = useState<Tab>("all");
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [data, setData] = useState<{ people: Person[]; counts: Record<Tab, number>; pagination: any } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Search after a short pause
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(query.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    createAxiosClient()
      .get("/users/people", { params: { tab, search: search || undefined, page, limit } })
      .then((res) => !cancelled && setData(res.data?.data ?? null))
      .catch((e) => !cancelled && setError(e?.response?.data?.message || "Could not load users"))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [tab, search, page, limit]);

  const people = data?.people ?? [];
  const pages = data?.pagination?.totalPages ?? 1;
  const total = data?.pagination?.total ?? 0;

  return (
    <div className="flex flex-col gap-5 p-4 sm:p-6">
      <section className="rounded-2xl border border-[#DCE6DF] bg-white p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="m-0 text-[22px] font-bold text-[#0B2E1F] [font-family:var(--font-inter-tight),sans-serif]">All users</h2>
            <p className="m-0 mt-1 text-[15px] text-[#4A6358]">
              Every person once, with all the roles they hold. Someone who is a farmer and a customer is one user.
            </p>
          </div>
          <div className="rounded-xl bg-[#F6F9F7] px-4 py-2 text-right">
            <p className="m-0 text-[12px] font-semibold uppercase tracking-wide text-[#4A6358]">People</p>
            <p className="m-0 text-[24px] font-bold text-[#007A35]">{data?.counts?.all ?? "–"}</p>
          </div>
        </div>

        <div className="relative mt-4">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#4A6358]" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Name, email or phone"
            aria-label="Search users"
            className="h-12 w-full rounded-full border border-[#DCE6DF] bg-white pl-12 pr-12 text-[15px] text-[#0B2E1F] placeholder:text-[#7A8E83] focus:border-[#00A43A] focus:outline-none focus:ring-4 focus:ring-[#00D048]/40"
          />
          {query && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-[#4A6358] hover:bg-[#F6F9F7]"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5" role="tablist" aria-label="Filter users">
          {TABS.map((t) => {
            const on = tab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => {
                  setTab(t.key);
                  setPage(1);
                }}
                className={`cursor-pointer rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition ${
                  on ? "border-[#007A35] bg-[#007A35] text-white" : "border-[#DCE6DF] bg-white text-[#0B2E1F] hover:border-[#00A43A]"
                }`}
              >
                {t.label}
                <span className={`ml-1.5 ${on ? "text-white/80" : "text-[#7A8E83]"}`}>{data?.counts?.[t.key] ?? ""}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-[#DCE6DF] bg-white">
        {error ? (
          <p className="m-0 p-6 text-sm text-red-700">{error}</p>
        ) : loading && !people.length ? (
          <div className="flex items-center justify-center gap-2 p-10 text-[#4A6358]">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading users…
          </div>
        ) : !people.length ? (
          <div className="flex flex-col items-center gap-2 px-6 py-14 text-center">
            <Users className="h-8 w-8 text-[#00A43A]" />
            <p className="m-0 font-bold text-[#0B2E1F]">No users here</p>
            <p className="m-0 text-sm text-[#4A6358]">{search ? "Nobody matches this search." : "Nobody in this group yet."}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className={`w-full min-w-[720px] text-left text-[14px] ${loading ? "opacity-60" : ""}`}>
              <thead className="bg-[#F6F9F7] text-[12px] uppercase tracking-wide text-[#4A6358]">
                <tr>
                  <th className="px-4 py-3 font-semibold">User</th>
                  <th className="px-4 py-3 font-semibold">Phone</th>
                  <th className="px-4 py-3 font-semibold">Roles</th>
                  <th className="px-4 py-3 font-semibold">Joined</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {people.map((p) => (
                  <tr key={p.id} className="border-t border-[#EEF3EF] align-top hover:bg-[#FAFCFA]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E3F3E8] text-[13px] font-bold text-[#007A35]">
                          {initials(p)}
                        </span>
                        <div className="min-w-0">
                          <p className="m-0 truncate font-semibold text-[#0B2E1F]">{p.name || "No name"}</p>
                          <p className="m-0 truncate text-[13px] text-[#4A6358]">{p.email || "No email"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#0B2E1F]">{p.phone || <span className="text-[#7A8E83]">–</span>}</td>
                    <td className="px-4 py-3">
                      <div className="flex max-w-[360px] flex-wrap gap-1">
                        {p.roles.map((r) => (
                          <span
                            key={r.role}
                            title={r.actingAs ? "Opened to work in this dashboard (not counted as a real account)" : STATUS_NOTE[r.status]}
                            className={`rounded-full px-2 py-0.5 text-[12px] font-semibold ${
                              r.status === "ACTIVE" ? ROLE_STYLE[r.kind] : "bg-gray-100 text-gray-500 line-through"
                            } ${r.actingAs ? "opacity-60" : ""}`}
                          >
                            {r.label}
                            {r.actingAs ? " (act as)" : ""}
                            {STATUS_NOTE[r.status] ? ` · ${STATUS_NOTE[r.status]}` : ""}
                          </span>
                        ))}
                        {!p.roles.length && <span className="text-[13px] text-[#7A8E83]">No role</span>}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-[#4A6358]">{format(new Date(p.createdAt), "dd MMM yyyy")}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/dashboard/users/lookup?q=${encodeURIComponent(p.email || p.phone || p.id)}`}
                        className="whitespace-nowrap text-[13px] font-semibold text-[#007A35] hover:underline"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {people.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#EEF3EF] px-4 py-3 text-[13px] text-[#4A6358]">
            <span>
              {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total} users
            </span>
            <nav className="flex items-center gap-1" aria-label="Pages">
              <PageButton label="First page" disabled={page <= 1} onClick={() => setPage(1)}>
                <ChevronsLeft className="h-4 w-4" />
              </PageButton>
              <PageButton label="Previous page" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </PageButton>
              {pageNumbers(page, pages).map((n, i) =>
                n === null ? (
                  <span key={`gap-${i}`} className="px-1">…</span>
                ) : (
                  <button
                    key={n}
                    type="button"
                    aria-current={n === page ? "page" : undefined}
                    onClick={() => setPage(n)}
                    className={`h-8 min-w-8 cursor-pointer rounded-full px-2 font-semibold ${
                      n === page ? "bg-[#007A35] text-white" : "border border-[#DCE6DF] text-[#0B2E1F] hover:border-[#00A43A]"
                    }`}
                  >
                    {n}
                  </button>
                ),
              )}
              <PageButton label="Next page" disabled={page >= pages} onClick={() => setPage(page + 1)}>
                <ChevronRight className="h-4 w-4" />
              </PageButton>
              <PageButton label="Last page" disabled={page >= pages} onClick={() => setPage(pages)}>
                <ChevronsRight className="h-4 w-4" />
              </PageButton>
            </nav>
            <label className="flex items-center gap-2">
              Rows per page
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="h-8 cursor-pointer rounded-lg border border-[#DCE6DF] bg-white px-2 text-[#0B2E1F]"
              >
                {[10, 20, 50, 100].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}
      </section>
    </div>
  );
}
