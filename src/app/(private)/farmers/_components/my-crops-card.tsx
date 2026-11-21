"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Loader2, Search, Sprout } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { showToast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { farmerDashboardService, type FarmerPrice } from "@/app/services/farmerDashboardService";

/**
 * The crops the farmer grows. They decide which buyer demand ("Wanted now"), which supply requests and which
 * nearby-request alerts the farmer gets, the same list the mobile app edits.
 */
export function MyCropsCard() {
  const [products, setProducts] = useState<FarmerPrice[] | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    farmerDashboardService
      .getPrices()
      .then((list) => {
        setProducts(list);
        const mine = new Set(list.filter((p) => p.mine).map((p) => p.productId));
        setSelected(mine);
        setSaved(mine);
      })
      .catch(() => {
        setProducts([]);
        showToast("error", "Could not load the crop list.");
      });
  }, []);

  // By category, alphabetical, filtered by the search
  const groups = useMemo(() => {
    const needle = search.trim().toLowerCase();
    const byCategory = new Map<string, FarmerPrice[]>();
    for (const p of products ?? []) {
      if (needle && !p.productName.toLowerCase().includes(needle)) continue;
      const key = p.category || "Other";
      byCategory.set(key, [...(byCategory.get(key) ?? []), p]);
    }
    return [...byCategory.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [products, search]);

  const changed = selected.size !== saved.size || [...selected].some((id) => !saved.has(id));

  const toggle = (id: string) =>
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const save = async () => {
    setSaving(true);
    try {
      await farmerDashboardService.updatePrimaryCrops([...selected]);
      setSaved(new Set(selected));
      showToast("success", "Your crops were saved. You will see buyer demand and requests for them.");
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Could not save your crops. Try again.";
      showToast("error", message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Sprout className="h-5 w-5 text-green-600" /> My crops
          </CardTitle>
          <CardDescription>
            Choose what you grow. You then see what buyers need, supply requests near you, and get alerts for them.
          </CardDescription>
        </div>
        <Button
          onClick={save}
          disabled={!changed || saving}
          className="shrink-0 bg-green-600 text-white hover:bg-green-700"
        >
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save my crops
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search crops"
              className="pl-9"
            />
          </div>
          <p className="text-sm text-gray-500">
            {selected.size} crop{selected.size === 1 ? "" : "s"} chosen
          </p>
        </div>

        {products === null ? (
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 10 }, (_, i) => (
              <Skeleton key={i} className="h-9 w-24 rounded-full" />
            ))}
          </div>
        ) : groups.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-500">No crop found.</p>
        ) : (
          groups.map(([category, items]) => (
            <div key={category} className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{category}</p>
              <div className="flex flex-wrap gap-2">
                {items.map((p) => {
                  const on = selected.has(p.productId);
                  return (
                    <button
                      key={p.productId}
                      type="button"
                      role="checkbox"
                      aria-checked={on}
                      onClick={() => toggle(p.productId)}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors",
                        on
                          ? "border-green-600 bg-green-600 text-white"
                          : "border-gray-200 bg-white text-gray-700 hover:border-green-300 hover:bg-green-50"
                      )}
                    >
                      {on && <Check className="h-3.5 w-3.5" />}
                      {p.productName}
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
