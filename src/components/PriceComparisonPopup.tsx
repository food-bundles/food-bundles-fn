"use client";

import { useState, useEffect } from "react";
import { marketService } from "@/app/services/marketService";
import { newsletterService } from "@/app/services/newsletterService";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/app/contexts/auth-context";
import { UserRole } from "@/lib/types";
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
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetchPriceComparison();
  }, []);

  const fetchPriceComparison = async () => {
    setLoading(true);
    try {
      // Use existing price history endpoint since lowest-comparison doesn't exist
      const response = await marketService.getPriceHistory(1, 50);
      console.log('Backend response:', response);
      
      // Transform backend response to expected format
      if (response.data && Array.isArray(response.data)) {
        // Group by product
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
        
        console.log('Product map:', Array.from(productMap.values()));
        
        // Filter products where our price is lower than all markets
        const lowestPriceProducts = Array.from(productMap.values())
          .filter(product => 
            product.markets.every((m: any) => product.foodbundlesPrice < m.price)
          )
          .slice(0, 5);
        
        console.log('Filtered products:', lowestPriceProducts);
        setData(lowestPriceProducts);
      } else {
        console.log('No data or not array');
        setData([]);
      }
    } catch (error) {
      console.error('Error fetching:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to subscribe");
      router.push("/login");
      return;
    }

    setSubscribing(true);
    try {
      await newsletterService.subscribe({
        email: user.email,
        name: user.name || user.username,
        phone: user.phone,
      });
      toast.success("Successfully subscribed to newsletter!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to subscribe");
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
      <div className="p-4 text-center text-sm text-gray-600">
        Price comparison data will be available soon
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
              {data[0]?.markets.map((market, idx) => (
                <th key={idx} className="px-4 py-2 text-left font-semibold text-gray-900">
                  {market.marketName}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, idx) => (
              <tr key={idx} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2 font-medium">{item.productName}</td>
                <td className="px-4 py-2 text-green-700 font-bold">
                  {item.foodbundlesPrice.toLocaleString()} RWF
                </td>
                {item.markets.map((market, mIdx) => (
                  <td key={mIdx} className="px-4 py-2 text-gray-600">
                    {market.price.toLocaleString()} RWF
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex flex-col items-center gap-2">
        <p className="text-xs text-gray-600 text-center">
          Subscribe to get weekly price comparisons and market trends delivered to your inbox.
        </p>
        <Button
          onClick={handleSubscribe}
          disabled={subscribing}
          className="bg-green-700 hover:bg-green-600 text-white"
        >
          {subscribing ? "Subscribing..." : "Subscribe to Newsletter"}
        </Button>
      </div>
    </div>
  );
}
