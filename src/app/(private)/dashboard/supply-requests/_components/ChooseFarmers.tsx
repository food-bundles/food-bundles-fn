"use client";

import { useEffect, useState } from "react";
import { CheckCheck, Loader2, MapPin, Search, Sprout, Users, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { LocationFields, type LocationValue } from "@/components/location-fields";
import { cn } from "@/lib/utils";
import { errorMessage, FarmerReach, supplyRequestService } from "@/app/services/supplyRequestService";

const EMPTY_PLACE: LocationValue = { province: "", district: "", sector: "", cell: "", village: "" };

interface ChooseFarmersProps {
  /** The products of the request: farmers who grow (or sold) one of them are listed */
  productIds: string[];
  selected: Set<string>;
  onChange: (next: Set<string>) => void;
  disabled?: boolean;
}

/**
 * Pick the farmers who may see and supply a request: filter by place (province → district → sector),
 * see how many farmers each place and each requested crop has, then tick farmers one by one or all at
 * once. Choices are kept while the place changes, so farmers from several places can be combined.
 */
export function ChooseFarmers({ productIds, selected, onChange, disabled }: ChooseFarmersProps) {
  const [place, setPlace] = useState<LocationValue>(EMPTY_PLACE);
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

  const productKey = productIds.join(",");
  useEffect(() => setPage(1), [place.province, place.district, place.sector, query, productKey]);

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
        search: query || undefined,
        page,
      })
      .then((data) => active && setReach(data))
      .catch((e) => active && setError(errorMessage(e, "Could not load farmers")))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [productKey, place.province, place.district, place.sector, query, page]);

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
            {query ? ` matching "${query}"` : ""}.
          </p>
        ) : (
          <ul className="max-h-80 divide-y overflow-y-auto">
            {(reach?.farmers.items ?? []).map((f) => {
              const on = selected.has(f.id);
              return (
                <li key={f.id}>
                  <label
                    className={cn(
                      "flex cursor-pointer items-center gap-3 px-3 py-2.5 hover:bg-gray-50",
                      on && "bg-green-50/60",
                      disabled && "cursor-not-allowed"
                    )}
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-green-600"
                      checked={on}
                      disabled={disabled}
                      onChange={() => toggle(f.id)}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-1.5">
                        <span className="font-medium text-gray-900">{f.name || "Unnamed farmer"}</span>
                        {f.hasSold && (
                          <Badge className="border-0 bg-blue-50 text-[10px] text-blue-700">Sold before</Badge>
                        )}
                      </span>
                      <span className="block text-xs text-gray-500">
                        {[f.phone, [f.sector, f.district].filter(Boolean).join(", ")].filter(Boolean).join(" · ")}
                      </span>
                    </span>
                    <span className="hidden flex-wrap justify-end gap-1 sm:flex">
                      {f.crops.map((c) => (
                        <span key={c.productId} className="rounded bg-gray-100 px-1.5 py-0.5 text-[11px] text-gray-700">
                          {c.productName}
                        </span>
                      ))}
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

      <p className={cn("text-sm font-medium", selected.size ? "text-green-700" : "text-gray-500")}>
        {selected.size.toLocaleString()} farmer{selected.size === 1 ? "" : "s"} chosen. Only they will see this request.
      </p>
    </div>
  );
}
