"use client";

import { useState, useEffect } from "react";
import { marketService } from "@/app/services/marketService";
import { newsletterService } from "@/app/services/newsletterService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/app/contexts/auth-context";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PriceComparisonData {
  productName: string;
  foodbundlesPrice: number;
  markets: Array<{
    marketName: string;
    price: number;
  }>;
}

export default function PriceComparisonPage() {
  const [data, setData] = useState<PriceComparisonData[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [marketNames, setMarketNames] = useState<string[]>([]);
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    fetchFullComparison();
  }, []);

  useEffect(() => {
    if (isAuthenticated && user?.email) {
      newsletterService
        .checkNewsletterStatus(user.email)
        .then((res) => {
          setIsSubscribed(res?.data?.isSubscribed === true);
        })
        .catch(() => {
          setIsSubscribed(false);
        })
        .finally(() => setCheckingStatus(false));
    } else {
      setCheckingStatus(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    setCurrentPage(1);
  }, [pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [data]);

  const fetchFullComparison = async () => {
    setLoading(true);
    try {
      const response = await marketService.getLowestPriceComparison(200);
      if (response.data && Array.isArray(response.data)) {
        const allMarkets = new Set<string>();
        response.data.forEach((item: any) => {
          allMarkets.add(item.market.name);
        });
        setMarketNames(Array.from(allMarkets));

        const productMap = new Map<string, any>();

        response.data.forEach((item: any) => {
          const productId = item.product.id;
          if (!productMap.has(productId)) {
            productMap.set(productId, {
              productName: item.product.productName,
              foodbundlesPrice: item.ourPrice,
              markets: [],
            });
          }
          productMap.get(productId).markets.push({
            marketName: item.market.name,
            price: item.marketPrice,
          });
        });

        setData(Array.from(productMap.values()));
      } else {
        setData([]);
      }
    } catch (error: any) {
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!isAuthenticated && !email) {
      toast.error("Please enter your email");
      return;
    }

    setSubscribing(true);
    try {
      await newsletterService.subscribe({
        email: isAuthenticated && user ? user.email : email,
        name:
          isAuthenticated && user
            ? (user.name || user.username)
            : undefined,
        phone: isAuthenticated && user ? user.phone : undefined,
      });
      setIsSubscribed(true);
      toast.success("Successfully subscribed to newsletter!");
      setEmail("");
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message || error.message || "Failed to subscribe";
      if (errorMsg.toLowerCase().includes("already subscribed")) {
        setIsSubscribed(true);
        toast.success("You are already subscribed!");
      } else {
        toast.error(errorMsg);
      }
    } finally {
      setSubscribing(false);
    }
  };

  const isPending = loading || checkingStatus;
  const needsSubscription = !isPending && (!isAuthenticated || !isSubscribed);

  // Search narrows the table; savings compare our price with the average market price
  const query = search.trim().toLowerCase();
  const filtered = query ? data.filter((d) => d.productName.toLowerCase().includes(query)) : data;
  const totalPages = Math.ceil(filtered.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = filtered.slice(startIndex, startIndex + pageSize);

  const savingOf = (item: PriceComparisonData) => {
    const prices = item.markets.map((m) => m.price).filter((p) => p > 0);
    if (!prices.length || !item.foodbundlesPrice) return null;
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
    return Math.round(((avg - item.foodbundlesPrice) / avg) * 100);
  };
  const savings = data.map(savingOf).filter((s): s is number => s !== null);
  const avgSaving = savings.length ? Math.round(savings.reduce((a, b) => a + b, 0) / savings.length) : null;

  return (
    <div className="pb-20">
      <section className="fb-mesh relative overflow-hidden px-4 pb-24 pt-14 text-white sm:px-8">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-4">
          <span className="inline-flex items-center gap-2 self-start rounded-full bg-white/15 px-3 py-1.5 text-[13px] font-bold tracking-[1.2px]">
            <span className="fb-live h-2 w-2 rounded-full bg-[#00D048]" />
            PRICE COMPARISON
          </span>
          <h1 className="fb-display m-0 max-w-[760px] text-[clamp(38px,5.4vw,68px)] font-bold leading-[1] tracking-[-2px]">
            Farm-gate prices, side by side with the market.
          </h1>
          <p className="m-0 max-w-[560px] text-lg leading-relaxed text-[#E4F5EA] sm:text-xl">
            Compare Food Bundles prices with the prices in Kigali’s markets, product by product.
          </p>
        </div>
      </section>

      <div className="relative mx-auto -mt-14 max-w-[1180px] px-4 sm:px-8">
        {isPending && (
          <div className="rounded-[22px] bg-white p-10 text-center text-[15px] text-[#4A6358] shadow-[0_40px_80px_-30px_#0B2E1F66]">
            Loading price comparison…
          </div>
        )}

        {needsSubscription && (
          <div className="relative overflow-hidden rounded-[22px] bg-white shadow-[0_40px_80px_-30px_#0B2E1F66]">
            <div aria-hidden="true" className="pointer-events-none select-none p-6 blur-[3px] sm:p-8">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="flex items-center gap-4 border-b border-[#EEF3EF] py-4">
                  <span className="h-3 w-32 rounded bg-[#E6EEE9]" />
                  <span className="h-3 w-20 rounded bg-[#C9EBD3]" />
                  <span className="ml-auto h-3 w-16 rounded bg-[#E6EEE9]" />
                  <span className="h-3 w-16 rounded bg-[#E6EEE9]" />
                  <span className="hidden h-3 w-16 rounded bg-[#E6EEE9] sm:block" />
                </div>
              ))}
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-white/60 p-4">
              <div className="w-full max-w-[520px] rounded-[20px] bg-white p-6 text-center shadow-[0_30px_60px_-24px_#0B2E1F59] sm:p-8">
                <h2 className="fb-display m-0 text-[26px] font-bold tracking-[-0.5px]">Subscribe to see the full comparison</h2>
                <p className="mx-auto mt-2 max-w-[400px] text-base leading-normal text-[#4A6358]">
                  Get the full table with every product and market, free. We’ll also send you price updates.
                </p>
                <div className="mt-5 flex w-full flex-col gap-2 sm:flex-row">
                  {!isAuthenticated && (
                    <Input
                      type="email"
                      placeholder="Your email"
                      aria-label="Your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
                      className="h-12 flex-1 rounded-full border-[#DCE6DF] px-5 text-base"
                    />
                  )}
                  <Button
                    onClick={handleSubscribe}
                    disabled={subscribing}
                    className="h-12 rounded-full bg-[#0B2E1F] px-7 text-base font-bold text-white hover:bg-[#0F5C36]"
                  >
                    {subscribing ? "Subscribing…" : "Subscribe"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {!isPending && !needsSubscription && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
              {[
                ["Products compared", data.length.toString()],
                ["Markets tracked", marketNames.length.toString()],
                ["Average saving vs market", avgSaving === null ? "—" : `${avgSaving}%`],
              ].map(([label, value]) => (
                <div key={label} className="flex flex-col gap-1 rounded-[18px] bg-white p-5 shadow-[0_30px_60px_-30px_#0B2E1F66]">
                  <span className="text-sm font-bold text-[#4A6358]">{label}</span>
                  <span className="fb-display text-[34px] font-bold tracking-[-1px] text-[#007A35]">{value}</span>
                </div>
              ))}
            </div>

            {!data.length ? (
              <div className="rounded-[18px] border border-[#DCE6DF] bg-white p-10 text-center text-[15px] text-[#4A6358]">
                Price comparison coming soon.
              </div>
            ) : (
              <div className="overflow-hidden rounded-[18px] border border-[#DCE6DF] bg-white">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#DCE6DF] p-4">
                  <Input
                    type="search"
                    placeholder="Search a product"
                    aria-label="Search a product"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="h-11 max-w-[320px] rounded-full border-[#DCE6DF] px-5 text-base"
                  />
                  <span className="flex items-center gap-2 text-sm text-[#4A6358]">
                    <span className="h-3 w-3 rounded-sm bg-[#E3F3E8] ring-1 ring-[#00A43A]" /> Lowest price
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-[15px]">
                    <thead>
                      <tr className="bg-[#F6F9F7] text-left text-[13px] uppercase tracking-[0.8px] text-[#4A6358]">
                        <th className="px-4 py-3 font-bold">#</th>
                        <th className="px-4 py-3 font-bold">Product</th>
                        <th className="px-4 py-3 font-bold text-[#007A35]">Food Bundles</th>
                        {marketNames.map((marketName) => (
                          <th key={marketName} className="whitespace-nowrap px-4 py-3 font-bold">{marketName}</th>
                        ))}
                        <th className="px-4 py-3 font-bold">You save</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedData.map((item, idx) => {
                        const marketPricesMap = new Map(item.markets.map((m) => [m.marketName, m.price]));
                        const lowest = Math.min(item.foodbundlesPrice, ...item.markets.map((m) => m.price).filter((p) => p > 0));
                        const saving = savingOf(item);
                        const cell = (price: number) =>
                          price === lowest ? "bg-[#E3F3E8] font-bold text-[#007A35]" : "text-[#4A6358]";
                        return (
                          <tr key={item.productName + idx} className="border-t border-[#EEF3EF] hover:bg-[#FAFCFA]">
                            <td className="px-4 py-3 text-[#4A6358]">{startIndex + idx + 1}</td>
                            <td className="px-4 py-3 font-bold">{item.productName}</td>
                            <td className={`whitespace-nowrap px-4 py-3 ${cell(item.foodbundlesPrice)}`}>
                              {item.foodbundlesPrice.toLocaleString()} RWF
                            </td>
                            {marketNames.map((marketName) => {
                              const price = marketPricesMap.get(marketName);
                              return (
                                <td key={marketName} className={`whitespace-nowrap px-4 py-3 ${price ? cell(price) : "text-[#4A6358]"}`}>
                                  {price ? `${price.toLocaleString()} RWF` : "—"}
                                </td>
                              );
                            })}
                            <td className="px-4 py-3">
                              {saving !== null && saving > 0 ? (
                                <span className="whitespace-nowrap rounded-full bg-[#00A43A] px-2.5 py-1 text-[13px] font-bold text-white">
                                  {saving}%
                                </span>
                              ) : (
                                <span className="text-[#4A6358]">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                      {!paginatedData.length && (
                        <tr>
                          <td colSpan={marketNames.length + 4} className="px-4 py-10 text-center text-[#4A6358]">
                            No product matches “{search}”.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {totalPages > 0 && (
              <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                <div className="flex items-center gap-2 text-sm text-[#4A6358]">
                  <span>Show</span>
                  <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(parseInt(value))}>
                    <SelectTrigger className="h-9 w-20 rounded-full text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[5, 10, 20, 50, 100].map((n) => (
                        <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span>per page</span>
                </div>

                <nav aria-label="Pages" className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    aria-label="Previous page"
                    className="flex h-10 w-10 items-center justify-center rounded-full text-[#0B2E1F] hover:bg-[#E3F3E8] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNumber;
                    if (totalPages <= 5 || currentPage <= 3) pageNumber = i + 1;
                    else if (currentPage >= totalPages - 2) pageNumber = totalPages - 4 + i;
                    else pageNumber = currentPage - 2 + i;
                    const on = pageNumber === currentPage;
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => setCurrentPage(pageNumber)}
                        aria-current={on ? "page" : undefined}
                        className={`h-10 min-w-10 rounded-full px-3 text-sm font-bold ${
                          on ? "bg-[#0B2E1F] text-white" : "border border-[#DCE6DF] bg-white text-[#0B2E1F] hover:bg-[#F6F9F7]"
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    aria-label="Next page"
                    className="flex h-10 w-10 items-center justify-center rounded-full text-[#0B2E1F] hover:bg-[#E3F3E8] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-5 rounded-[20px] bg-[#0B2E1F] px-6 py-8 text-white sm:px-10">
              <div className="flex flex-col gap-1.5">
                <h2 className="fb-display m-0 text-[clamp(24px,2.6vw,32px)] font-bold tracking-[-0.6px]">Buy at these prices.</h2>
                <p className="m-0 text-base text-[#C9DCD0]">Order today’s market and get it delivered to your kitchen.</p>
              </div>
              <Link href="/shop" className="fb-arrow inline-flex min-h-12 items-center gap-1 rounded-full bg-[#00D048] px-6 text-[17px] font-bold text-[#0B2E1F]">
                Shop today’s market <span className="fb-chev">›</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
