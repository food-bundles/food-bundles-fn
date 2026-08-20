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
import { ArrowLeft } from "lucide-react";

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

  const totalPages = Math.ceil(data.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = data.slice(startIndex, startIndex + pageSize);

  return (
    <div className="mx-auto max-w-7xl px-4 pt-24 pb-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Full Price Comparison</h1>
          <p className="text-sm text-gray-600">
            Compare FoodBundles prices with market prices across all markets.
          </p>
        </div>

        {isPending && (
          <div className="p-8 text-center text-sm text-gray-600">
            Loading price comparison...
          </div>
        )}

        {needsSubscription && (
          <div className="mx-auto max-w-lg rounded-lg border bg-white p-6 text-center shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">
              Subscribe to view the full comparison
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Subscribe as restaurant to get the full comparison table with all
              products and markets.
            </p>
            <div className="mt-4 flex w-full gap-2">
              {!isAuthenticated && (
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1"
                />
              )}
              <Button
                onClick={handleSubscribe}
                disabled={subscribing}
                className="bg-green-700 hover:bg-green-600 text-white"
              >
                {subscribing ? "Subscribing..." : "Subscribe"}
              </Button>
            </div>
          </div>
        )}

        {!isPending && !needsSubscription && (
          <>
            {!data.length ? (
              <div className="p-8 text-center text-sm text-gray-600">
                Price comparison coming soon.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border bg-white shadow-sm">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">Nbr</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">Product</th>
                      <th className="px-4 py-3 text-left font-semibold text-green-700">FoodBundles</th>
                      {marketNames.map((marketName, idx) => (
                        <th key={idx} className="px-4 py-3 text-left font-semibold text-gray-900">
                          {marketName}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.map((item, idx) => {
                      const marketPricesMap = new Map(item.markets.map((m) => [m.marketName, m.price]));
                      return (
                        <tr key={idx} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-600">{startIndex + idx + 1}</td>
                          <td className="px-4 py-3 font-medium">{item.productName}</td>
                          <td className="px-4 py-3 font-bold text-green-700">
                            {item.foodbundlesPrice.toLocaleString()} RWF
                          </td>
                          {marketNames.map((marketName, mIdx) => {
                            const price = marketPricesMap.get(marketName);
                            return (
                              <td key={mIdx} className="px-4 py-3 text-gray-600">
                                {price ? `${price.toLocaleString()} RWF` : "—"}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {totalPages > 0 && (
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>Show:</span>
                  <Select
                    value={pageSize.toString()}
                    onValueChange={(value) => setPageSize(parseInt(value))}
                  >
                    <SelectTrigger className="w-20 h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                  <span>per page</span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className={`p-1 rounded ${
                      currentPage === 1
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-gray-900 hover:bg-gray-100"
                    }`}
                    title="Previous Page"
                  >
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>

                  {Array.from(
                    { length: Math.min(totalPages, 5) },
                    (_, i) => {
                      let pageNumber;
                      if (totalPages <= 5) {
                        pageNumber = i + 1;
                      } else {
                        const current = currentPage;
                        const total = totalPages;

                        if (current <= 3) {
                          pageNumber = i + 1;
                        } else if (current >= total - 2) {
                          pageNumber = total - 4 + i;
                        } else {
                          pageNumber = current - 2 + i;
                        }
                      }

                      return (
                        <button
                          key={pageNumber}
                          onClick={() => setCurrentPage(pageNumber)}
                          className={`px-3 py-1 rounded text-sm ${
                            pageNumber === currentPage
                              ? "bg-green-700 hover:bg-green-800 text-white"
                              : "bg-white hover:bg-gray-100 text-gray-900 border border-gray-300"
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    }
                  )}

                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className={`p-1 rounded ${
                      currentPage === totalPages
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-gray-900 hover:bg-gray-100"
                    }`}
                    title="Next Page"
                  >
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            )}
            <div className="mt-6 flex justify-center">
              <a
                href="/"
                className="inline-flex items-center gap-2 text-sm font-medium text-green-700 hover:underline"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to home
              </a>
            </div>
          </>
        )}
    </div>
  );
}