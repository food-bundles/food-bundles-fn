/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Search, UserSearch, X } from "lucide-react";
import { userLookupService, type UserKind, type UserSearchResult } from "@/app/services/userLookupService";
import { UserProfilePanel } from "./_components/user-profile-panel";

const KINDS: { key: "ALL" | UserKind; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "CUSTOMER", label: "Customers" },
  { key: "FARMER", label: "Farmers" },
  { key: "AFFILIATOR", label: "Affiliators" },
  { key: "STAFF", label: "Staff" },
];

const KIND_STYLE: Record<UserKind, { label: string; avatar: string }> = {
  CUSTOMER: { label: "Customer", avatar: "bg-[#0B2E1F] text-[#00D048]" },
  FARMER: { label: "Farmer", avatar: "bg-[#E3F3E8] text-[#007A35]" },
  AFFILIATOR: { label: "Affiliator", avatar: "bg-[#FFF3D1] text-[#7A5200]" },
  STAFF: { label: "Staff", avatar: "bg-[#E4EEF7] text-[#1B4F7A]" },
};

const roleLabel = (r: UserSearchResult) =>
  r.kind === "STAFF" || r.kind === "CUSTOMER" ? r.role.replace(/_/g, " ").toLowerCase() : null;

export default function UserLookupPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [searched, setSearched] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [kind, setKind] = useState<"ALL" | UserKind>("ALL");
  const [selected, setSelected] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);

  // Search as you type, after a short pause
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setSearched("");
      setError("");
      return;
    }
    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const data = await userLookupService.search(q);
        if (cancelled) return;
        setResults(data);
        setSearched(q);
      } catch (e: any) {
        if (!cancelled) setError(e?.response?.data?.message || "Search failed. Try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { ALL: results.length };
    results.forEach((r) => (c[r.kind] = (c[r.kind] ?? 0) + 1));
    return c;
  }, [results]);
  const shown = kind === "ALL" ? results : results.filter((r) => r.kind === kind);

  const open = (id: string) => {
    setSelected(id);
    // On narrow screens the details sit below the list
    if (window.innerWidth < 1024) setTimeout(() => detailsRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  return (
    <div className="flex flex-col gap-5 p-4 sm:p-6">
      {/* Search */}
      <section className="rounded-2xl border border-[#DCE6DF] bg-white p-5 sm:p-7">
        <h2 className="m-0 text-[22px] font-bold text-[#0B2E1F] [font-family:var(--font-inter-tight),sans-serif]">Find anyone on Food Bundles</h2>
        <p className="m-0 mt-1 text-[15px] text-[#4A6358]">
          Type anything you remember: a name, phone (any format), email, TIN, ID, district or sector, customer type or staff role.
        </p>
        <div className="relative mt-4">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#4A6358]" />
          <input
            ref={inputRef}
            type="search"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. Imboni, 0788 123 456, Gasabo, hotel, aggregator…"
            aria-label="Search users"
            className="h-14 w-full rounded-full border border-[#DCE6DF] bg-white pl-12 pr-12 text-[16px] text-[#0B2E1F] placeholder:text-[#7A8E83] focus:outline-none focus:ring-4 focus:ring-[#00D048]/40 focus:border-[#00A43A]"
          />
          {loading ? (
            <Loader2 className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 animate-spin text-[#4A6358]" />
          ) : query ? (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => {
                setQuery("");
                setSelected(null);
                inputRef.current?.focus();
              }}
              className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-[#4A6358] hover:bg-[#F6F9F7] cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </section>

      {/* Results + details */}
      {query.trim().length < 2 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-[#C5D1C6] bg-white px-6 py-14 text-center">
          <UserSearch className="h-8 w-8 text-[#00A43A]" />
          <p className="m-0 font-bold text-[#0B2E1F]">Search across every account</p>
          <p className="m-0 max-w-md text-sm text-[#4A6358]">Customers, farmers, affiliators and staff. Results appear as you type.</p>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
          <section className="flex min-w-0 flex-col gap-3" aria-label="Search results">
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by account type">
              {KINDS.map((k) => {
                const on = kind === k.key;
                const n = counts[k.key] ?? 0;
                return (
                  <button
                    key={k.key}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setKind(k.key)}
                    disabled={k.key !== "ALL" && n === 0}
                    className={`min-h-9 rounded-full px-3.5 text-[13px] font-bold transition-colors disabled:opacity-40 cursor-pointer ${
                      on ? "bg-[#0B2E1F] text-white" : "border border-[#DCE6DF] bg-white text-[#0B2E1F] hover:border-[#00A43A]"
                    }`}
                  >
                    {k.label} <span className={on ? "text-[#7CF2A6]" : "text-[#4A6358]"}>{n}</span>
                  </button>
                );
              })}
            </div>

            {error ? (
              <p className="m-0 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>
            ) : searched && !loading && shown.length === 0 ? (
              <p className="m-0 rounded-xl bg-white p-6 text-center text-sm text-[#4A6358]">
                No one matches “{searched}”. Try part of the name, the last digits of the phone, or the district.
              </p>
            ) : (
              <ul className="m-0 flex list-none flex-col gap-2 p-0">
                {shown.map((r) => {
                  const on = r.id === selected;
                  const style = KIND_STYLE[r.kind];
                  return (
                    <li key={`${r.kind}-${r.id}`}>
                      <button
                        type="button"
                        onClick={() => open(r.id)}
                        aria-current={on ? "true" : undefined}
                        className={`flex w-full items-start gap-3 rounded-2xl border bg-white p-3.5 text-left transition-colors cursor-pointer ${
                          on ? "border-[#00A43A] ring-2 ring-[#00A43A]/20" : "border-[#DCE6DF] hover:border-[#00A43A]"
                        }`}
                      >
                        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[14px] font-bold ${style.avatar}`}>
                          {r.name.trim().slice(0, 2).toUpperCase()}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-center gap-1.5">
                            <span className="truncate text-[15px] font-bold text-[#0B2E1F]">{r.name}</span>
                            <span className="rounded-full bg-[#F6F9F7] px-2 py-0.5 text-[11px] font-bold text-[#4A6358]">
                              {style.label}
                              {roleLabel(r) ? ` · ${roleLabel(r)}` : ""}
                            </span>
                            {r.deleted && <span className="rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-bold text-red-700">In trash</span>}
                          </span>
                          <span className="mt-0.5 block truncate text-[13px] text-[#4A6358]">
                            {[r.phone, r.email, r.location].filter(Boolean).join(" · ") || "No contact details"}
                          </span>
                          {(r.details.length > 0 || r.matchedOn.length > 0) && (
                            <span className="mt-1.5 flex flex-wrap gap-1">
                              {r.details.slice(0, 3).map((d) => (
                                <span key={d.label} className="rounded-md bg-[#F6F9F7] px-1.5 py-0.5 text-[11px] text-[#2E4A3B]">
                                  {d.label}: <b>{d.value}</b>
                                </span>
                              ))}
                              {r.matchedOn.length > 0 && (
                                <span className="rounded-md bg-[#E3F3E8] px-1.5 py-0.5 text-[11px] font-bold text-[#007A35]">
                                  Matched: {r.matchedOn.join(", ")}
                                </span>
                              )}
                            </span>
                          )}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
            {results.length >= 60 && (
              <p className="m-0 text-xs text-[#4A6358]">Showing the first 60 matches. Add more detail to narrow the search.</p>
            )}
          </section>

          <section ref={detailsRef} aria-label="User details" className="min-w-0 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-[#DCE6DF] bg-white p-4 sm:p-6">
              {selected ? (
                <UserProfilePanel userId={selected} onClose={() => setSelected(null)} />
              ) : (
                <div className="flex flex-col items-center gap-2 py-16 text-center">
                  <UserSearch className="h-8 w-8 text-[#C5D1C6]" />
                  <p className="m-0 text-sm text-[#4A6358]">Pick someone from the results to see their account, orders, payments and history.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
