"use client";

import { useState, useEffect } from "react";
import { marketService } from "@/app/services/marketService";
import { newsletterService } from "@/app/services/newsletterService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/app/contexts/auth-context";
import { useRouter } from "next/navigation";

interface PriceComparisonData {
  productName: string;
  foodbundlesPrice: number;
  markets: Array<{
    marketName: string;
    price: number;
  }>;
}

export function PriceComparisonPopup() {
  const [data, setData] = useState<PriceComparisonData[]>([]);
  const [loading, setLoading] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [marketNames, setMarketNames] = useState<string[]>([]);
  const [email, setEmail] = useState("");
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetchPriceComparison();
  }, []);

  const fetchPriceComparison = async () => {
    setLoading(true);
    try {
      const response = await marketService.getLowestPriceComparison(5);
      if (response.data && Array.isArray(response.data)) {
        // Get unique market names (max 3)
        const allMarkets = new Set<string>();
        response.data.forEach((item: any) => {
          allMarkets.add(item.market.name);
        });
        const uniqueMarkets = Array.from(allMarkets).slice(0, 3);
        setMarketNames(uniqueMarkets);
        
        // Transform price history data to comparison format
        const productMap = new Map<string, any>();
        
        response.data.forEach((item: any) => {
          const productId = item.product.id;
          if (!productMap.has(productId)) {
            productMap.set(productId, {
              productName: item.product.productName,
              foodbundlesPrice: item.ourPrice,
              markets: []
            });
          }
          productMap.get(productId).markets.push({
            marketName: item.market.name,
            price: item.marketPrice
          });
        });
        
        setData(Array.from(productMap.values()).slice(0, 5));
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
        email: isAuthenticated ? user.email : email,
        name: isAuthenticated ? (user.name || user.username) : undefined,
        phone: isAuthenticated ? user.phone : undefined,
      });
      toast.success("Successfully subscribed to newsletter!");
      setEmail("");
    } catch (error: any) {
      console.error('Subscribe error:', error);
      const errorMsg = error.response?.data?.message || error.message || "Failed to subscribe";
      toast.error(errorMsg);
    } finally {
      setSubscribing(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-center text-sm text-gray-600">
        Loading price comparison...
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="p-4 text-center space-y-3">
        <p className="text-sm text-gray-600">Price comparison coming soon. Subscribe to get notified!</p>
        <div className="flex gap-2 w-full max-w-md mx-auto">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1"
          />
          <Button
            onClick={handleSubscribe}
            disabled={subscribing}
            className="bg-green-700 hover:bg-green-600 text-white"
          >
            {subscribing ? "Subscribing..." : "Subscribe"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="px-4 py-2 text-left font-semibold text-gray-900">Product</th>
              <th className="px-4 py-2 text-left font-semibold text-green-700">FoodBundles</th>
              {marketNames.map((marketName, idx) => (
                <th key={idx} className="px-4 py-2 text-left font-semibold text-gray-900">
                  {marketName}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, idx) => {
              const marketPricesMap = new Map(item.markets.map(m => [m.marketName, m.price]));
              return (
                <tr key={idx} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium">{item.productName}</td>
                  <td className="px-4 py-2 text-green-700 font-bold">
                    {item.foodbundlesPrice.toLocaleString()} RWF
                  </td>
                  {marketNames.map((marketName, mIdx) => {
                    const price = marketPricesMap.get(marketName);
                    return (
                      <td key={mIdx} className="px-4 py-2 text-gray-600">
                        {price ? `${price.toLocaleString()} RWF` : '—'}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex flex-col items-center gap-2">
        <p className="text-xs text-gray-600 text-center">
          You need to subscribe as restaurant to get full comparison table
        </p>
        <div className="flex gap-2 w-full max-w-md">
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
    </div>
  );
}
