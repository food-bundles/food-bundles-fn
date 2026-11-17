"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { MapPin, Search, ShoppingCart, Sprout, Tag, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import ProductSubmissionModal from "../_components/product-submission-modal";
import { farmerDashboardService, type CropDemand, type FarmerPrice } from "@/app/services/farmerDashboardService";

const rwf = (n: number) => `RWF ${Math.round(n).toLocaleString("en-RW")}`;

type Tab = "wanted" | "prices";

/**
 * What buyers want now for the farmer's own crops, and what Food Bundles pays per unit for every crop:
 * the same data as the mobile app's "Wanted now" and prices screens.
 */
export default function FarmerMarketPage() {
  const [tab, setTab] = useState<Tab>("wanted");
  const [demand, setDemand] = useState<CropDemand[] | null>(null);
  const [prices, setPrices] = useState<FarmerPrice[] | null>(null);
  const [search, setSearch] = useState("");
  const [selling, setSelling] = useState(false);
  const [error, setError] = useState(false);

  const load = () => {
    setError(false);
    Promise.all([farmerDashboardService.getCropDemand(), farmerDashboardService.getPrices()])
      .then(([d, p]) => {
        setDemand(d);
        setPrices(p);
      })
      .catch(() => {
        setError(true);
        setDemand([]);
        setPrices([]);
      });
  };

  useEffect(load, []);

  const hasCrops = (prices ?? []).some((p) => p.mine);
  const visiblePrices = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return (prices ?? []).filter(
      (p) => !needle || p.productName.toLowerCase().includes(needle) || p.category?.toLowerCase().includes(needle)
    );
  }, [prices, search]);

  const tabs: { key: Tab; label: string; icon: typeof TrendingUp; count?: number }[] = [
    { key: "wanted", label: "Wanted now", icon: TrendingUp, count: demand?.length },
    { key: "prices", label: "Food Bundles prices", icon: Tag },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        <div>
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Wanted &amp; prices</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            What buyers need right now for your crops, and what Food Bundles pays for each crop.
          </p>
        </div>

        <div className="flex w-full gap-1 rounded-xl bg-white p-1 shadow-sm sm:w-fit" role="tablist">
          {tabs.map(({ key, label, icon: Icon, count }) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors sm:flex-none",
                tab === key ? "bg-green-600 text-white" : "text-gray-600 hover:bg-gray-50"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
              {count != null && (
                <span className={cn("rounded-full px-1.5 text-xs", tab === key ? "bg-white/20" : "bg-gray-100")}>{count}</span>
              )}
            </button>
          ))}
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Could not load the market data.{" "}
            <button className="font-medium underline" onClick={load}>
              Try again
            </button>
          </div>
        )}

        {tab === "wanted" &&
          (demand === null ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }, (_, i) => (
                <Skeleton key={i} className="h-44 rounded-xl" />
              ))}
            </div>
          ) : demand.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-600">
                  <Sprout className="h-6 w-6" />
                </span>
                {hasCrops ? (
                  <p className="max-w-md text-sm text-gray-600">
                    No buyer needs your crops right now. Check back soon, or see Food Bundles prices to sell anyway.
                  </p>
                ) : (
                  <>
                    <p className="max-w-md text-sm text-gray-600">
                      Choose the crops you grow to see what buyers need for them.
                    </p>
                    <Button asChild className="bg-green-600 text-white hover:bg-green-700">
                      <Link href="/farmers/profile">Choose my crops</Link>
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {demand.map((d) => (
                <Card key={d.productId} className="overflow-hidden border-green-100">
                  <CardContent className="flex h-full flex-col gap-3 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-lg font-semibold text-gray-900">{d.cropName}</p>
                        <p className="text-sm text-gray-500">
                          Buyers need {d.neededKg.toLocaleString()} kg · {d.orderCount} order{d.orderCount === 1 ? "" : "s"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-green-700">{rwf(d.ratePerKg)}</p>
                        <p className="text-xs text-gray-500">per kg</p>
                      </div>
                    </div>
                    <p className="flex items-center gap-1.5 text-sm text-gray-600">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      {d.deliveryPoint ? `Bring it to ${d.deliveryPoint}` : "Farm-gate pickup"}
                    </p>
                    <Button
                      onClick={() => setSelling(true)}
                      className="mt-auto bg-green-600 text-white hover:bg-green-700"
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" /> Sell this crop
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ))}

        {tab === "prices" && (
          <Card>
            <CardContent className="space-y-4 p-4 sm:p-6">
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search crops or categories"
                  className="pl-9"
                />
              </div>
              {prices === null ? (
                <div className="space-y-2">
                  {Array.from({ length: 6 }, (_, i) => (
                    <Skeleton key={i} className="h-11 rounded-lg" />
                  ))}
                </div>
              ) : visiblePrices.length === 0 ? (
                <p className="py-8 text-center text-sm text-gray-500">No crop found.</p>
              ) : (
                <div className="divide-y rounded-lg border">
                  {visiblePrices.map((p) => (
                    <div key={p.productId} className="flex items-center gap-3 px-4 py-3">
                      <div className="min-w-0 flex-1">
                        <p className="flex items-center gap-2 truncate font-medium text-gray-900">
                          {p.productName}
                          {p.mine && <Badge className="border-0 bg-green-100 text-[10px] text-green-800">Your crop</Badge>}
                        </p>
                        {p.category && <p className="text-xs text-gray-500">{p.category}</p>}
                      </div>
                      <p className={cn("text-right font-semibold", p.price ? "text-green-700" : "text-gray-400")}>
                        {p.price ? `${rwf(p.price)} / ${p.unit}` : "No price yet"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>

      <ProductSubmissionModal isOpen={selling} onClose={() => setSelling(false)} onSubmit={() => setSelling(false)} />
    </div>
  );
}
