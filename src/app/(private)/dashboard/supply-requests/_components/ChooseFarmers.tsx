"use client";

import { useEffect, useState } from "react";
import { BadgeCheck, Check, CheckCheck, History, Loader2, MapPin, Phone, Search, Sprout, Users, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LocationFields, type LocationValue } from "@/components/location-fields";
import { cn } from "@/lib/utils";
import { errorMessage, FarmerReach, RequestCustomer, supplyRequestService } from "@/app/services/supplyRequestService";

const EMPTY_PLACE: LocationValue = { province: "", district: "", sector: "", cell: "", village: "" };

/** "John Kalisa" → "JK"; a farmer without a name gets "?" */
const initials = (name: string | null) =>
  (name ?? "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("") || "?";

interface ChooseFarmersProps {
  /** The products of the request: farmers who grow (or sold) one of them are listed */
  productIds: string[];
  selected: Set<string>;
  onChange: (next: Set<string>) => void;
  disabled?: boolean;
  /** The request's customer: offered first in "Supplied before to" */
  customerId?: string;
}

/**
 * Pick the farmers who may see and supply a request: filter by place (province → district → sector),
 * see how many farmers each place and each requested crop has, then tick farmers one by one or all at
 * once. Choices are kept while the place changes, so farmers from several places can be combined.
 * "Supplied before to" narrows the list to farmers who already submitted to a given customer (a school…).
 */
export function ChooseFarmers({ productIds, selected, onChange, disabled, customerId }: ChooseFarmersProps) {
  const [place, setPlace] = useState<LocationValue>(EMPTY_PLACE);
  // Only farmers who already submitted to this customer's supply requests ("" = any farmer)
  const [suppliedTo, setSuppliedTo] = useState("");
  const [customers, setCustomers] = useState<RequestCustomer[]>([]);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [reach, setReach] = useState<FarmerReach | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search waits for typing to pause
  useEffect(() => {
    const timer = setTimeout(() => setQuery(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // The customers the person works with, for "Supplied before to"
  useEffect(() => {
    let active = true;
    supplyRequestService
      .customers()
      .then((list) => active && setCustomers(list || []))
      .catch(() => active && setCustomers([]));
    return () => {
      active = false;
    };
  }, []);

  const productKey = productIds.join(",");
  useEffect(() => setPage(1), [place.province, place.district, place.sector, query, productKey, suppliedTo]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    supplyRequestService
      .farmerReach({
        productIds: productKey ? productKey.split(",") : [],
        province: place.province || undefined,
        district: place.district || undefined,
        sector: place.sector || undefined,
        suppliedTo: suppliedTo || undefined,
        search: query || undefined,
        page,
      })
      .then((data) => active && setReach(data))
      .catch((e) => active && setError(errorMessage(e, "Could not load farmers")))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [productKey, place.province, place.district, place.sector, suppliedTo, query, page]);

  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange(next);
  };

  const allIds = reach?.allIds ?? [];
  const allPicked = allIds.length > 0 && allIds.every((id) => selected.has(id));
  const pickAll = () => onChange(new Set([...selected, ...allIds]));
  const unpickAll = () => {
    const next = new Set(selected);
    allIds.forEach((id) => next.delete(id));
    onChange(next);
  };

  const placeLabel = place.sector || place.district || place.province || reach?.limitedToDistrict || "all places";

  return (
    <div className="space-y-4">
      {/* Where the farmers must be from */}
      <div className="rounded-xl border bg-gray-50 p-3">
        <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-gray-800">
          <MapPin className="h-4 w-4 text-green-600" /> Where must the farmers be from?
        </p>
        <LocationFields
          value={place}
          onChange={(next) => setPlace({ ...next, cell: "", village: "" })}
          levels={3}
          disabled={disabled}
        />
        {reach?.limitedToDistrict && (
          <p className="mt-2 text-xs text-amber-700">
            You can choose farmers in {reach.limitedToDistrict} only, the district of your aggregation site.
          </p>
        )}
        <div className="mt-3 border-t pt-3">
          <label htmlFor="supplied-to" className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-gray-800">
            <History className="h-4 w-4 text-green-600" /> Supplied before to
          </label>
          <select
            id="supplied-to"
            className="h-9 w-full rounded-md border border-gray-300 bg-white px-2 text-sm sm:w-80"
            value={suppliedTo}
            onChange={(e) => setSuppliedTo(e.target.value)}
            disabled={disabled}
          >
            <option value="">Any farmer</option>
            {[...customers]
              .sort((a, b) => Number(b.id === customerId) - Number(a.id === customerId) || a.name.localeCompare(b.name))
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {c.id === customerId ? " (this request's customer)" : ""}
                  {c.customerType?.name ? ` · ${c.customerType.name.toLowerCase()}` : ""}
                </option>
              ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">
            {suppliedTo
              ? "Only farmers who already submitted to this customer's supply requests."
              : "Pick a school or other customer to see only the farmers who already supplied it."}
          </p>
        </div>
      </div>

      {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {/* What the place offers */}
      {!reach && loading ? (
        <Skeleton className="h-24 rounded-xl" />
      ) : reach ? (
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border p-3">
            <p className="flex items-center gap-1.5 text-xs text-gray-500">
              <Users className="h-3.5 w-3.5" /> Farmers in {placeLabel}
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{reach.total.toLocaleString()}</p>
            <p className="text-xs text-gray-500">{reach.soldBefore.toLocaleString()} sold to Food Bundles before</p>
          </div>
          <div className="rounded-xl border p-3 sm:col-span-2">
            <p className="flex items-center gap-1.5 text-xs text-gray-500">
              <Sprout className="h-3.5 w-3.5" /> Farmers per crop
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {reach.byCrop.length === 0 ? (
                <span className="text-xs text-gray-400">Add products to see who grows them</span>
              ) : (
                reach.byCrop.map((c) => (
                  <span key={c.productId} className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-800">
                    {c.productName} · {c.count}
                  </span>
                ))
              )}
            </div>
            {reach.byPlace.length > 1 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {reach.byPlace.slice(0, 8).map((p) => (
                  <button
                    key={`${p.district}|${p.sector}`}
                    type="button"
                    disabled={disabled || !p.sector || !p.district || !p.province}
                    onClick={() =>
                      setPlace({ ...EMPTY_PLACE, province: p.province ?? "", district: p.district ?? "", sector: p.sector ?? "" })
                    }
                    className="rounded-full border px-2.5 py-1 text-xs text-gray-600 hover:border-green-300 hover:bg-green-50"
                  >
                    {p.sector || "No sector"}
                    {p.district ? `, ${p.district}` : ""} · {p.count}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* The farmers */}
      <div className="rounded-xl border">
        <div className="flex flex-col gap-2 border-b p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name or phone"
              className="h-9 pl-9"
              disabled={disabled}
            />
          </div>
          <div className="flex items-center gap-2">
            {loading && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={disabled || allIds.length === 0}
              onClick={allPicked ? unpickAll : pickAll}
            >
              {allPicked ? <X className="mr-1 h-4 w-4" /> : <CheckCheck className="mr-1 h-4 w-4" />}
              {allPicked ? "Unselect" : "Select"} all {allIds.length.toLocaleString()}
            </Button>
          </div>
        </div>

        {reach && reach.farmers.items.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-gray-500">
            No farmer {productIds.length ? "grows these crops " : ""}in {placeLabel}
            {suppliedTo ? ` who supplied ${customers.find((c) => c.id === suppliedTo)?.name ?? "this customer"} before` : ""}
            {query ? ` matching "${query}"` : ""}.
          </p>
        ) : (
          <ul className="max-h-96 space-y-2 overflow-y-auto p-2" aria-label="Farmers">
            {(reach?.farmers.items ?? []).map((f) => {
              const on = selected.has(f.id);
              const place = [f.sector, f.district].filter(Boolean).join(", ");
              return (
                <li key={f.id}>
                  <label
                    className={cn(
                      "group flex cursor-pointer items-center gap-3 rounded-xl border bg-white p-3 transition-colors",
                      on ? "border-green-500 bg-green-50/70 ring-1 ring-green-500" : "border-gray-200 hover:border-green-300 hover:bg-gray-50",
                      disabled && "cursor-not-allowed opacity-70"
                    )}
                  >
                    {/* The real checkbox stays for keyboards and screen readers; the round mark on the right shows it */}
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={on}
                      disabled={disabled}
                      onChange={() => toggle(f.id)}
                    />
                    <span
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                        on ? "bg-green-600 text-white" : "bg-green-100 text-green-800"
                      )}
                      aria-hidden="true"
                    >
                      {initials(f.name)}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-1.5">
                        <span className="truncate font-semibold text-gray-900">{f.name || "Unnamed farmer"}</span>
                        {f.hasSold && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-medium text-green-800">
                            <BadgeCheck className="h-3 w-3" /> Sold to us before
                          </span>
                        )}
                      </span>
                      <span className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-500">
                        {f.phone && (
                          <span className="inline-flex items-center gap-1">
                            <Phone className="h-3 w-3" /> {f.phone}
                          </span>
                        )}
                        {place && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {place}
                          </span>
                        )}
                      </span>
                      {f.crops.length > 0 && (
                        <span className="mt-1.5 flex flex-wrap gap-1">
                          {f.crops.map((c) => (
                            <span
                              key={c.productId}
                              className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-white px-2 py-0.5 text-[11px] font-medium text-green-800"
                            >
                              <Sprout className="h-3 w-3" /> {c.productName}
                            </span>
                          ))}
                        </span>
                      )}
                    </span>

                    <span
                      className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                        on ? "border-green-600 bg-green-600 text-white" : "border-gray-300 text-transparent group-hover:border-green-400"
                      )}
                      aria-hidden="true"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        )}

        {reach && reach.farmers.pages > 1 && (
          <div className="flex items-center justify-between border-t px-3 py-2 text-xs text-gray-500">
            <span>
              Page {reach.farmers.page} of {reach.farmers.pages} · {reach.farmers.total.toLocaleString()} farmers
            </span>
            <div className="flex gap-1">
              <Button type="button" size="sm" variant="ghost" disabled={page <= 1 || loading} onClick={() => setPage(page - 1)}>
                Previous
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={page >= reach.farmers.pages || loading}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* What is chosen so far (across places and pages) */}
      <div
        className={cn(
          "flex items-center gap-3 rounded-xl border px-4 py-3",
          selected.size ? "border-green-200 bg-green-50" : "border-dashed border-gray-300 bg-gray-50"
        )}
        aria-live="polite"
      >
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
            selected.size ? "bg-green-600 text-white" : "bg-gray-200 text-gray-500"
          )}
        >
          <Users className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className={cn("block text-sm font-semibold", selected.size ? "text-green-900" : "text-gray-700")}>
            {selected.size
              ? `${selected.size.toLocaleString()} farmer${selected.size === 1 ? "" : "s"} chosen`
              : "No farmer chosen yet"}
          </span>
          <span className="block text-xs text-gray-500">
            {selected.size ? "Only they will see this request." : "Tick the farmers who may see and supply this request."}
          </span>
        </span>
        {selected.size > 0 && (
          <Button type="button" size="sm" variant="ghost" onClick={() => onChange(new Set())} disabled={disabled}>
            <X className="mr-1 h-4 w-4" /> Clear
          </Button>
        )}
      </div>
    </div>
  );
}
