"use client";

import { useState, useEffect } from "react";
import { X, Mail } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import axios from "axios";
import { useAuth } from "@/app/contexts/auth-context";
import { useSubscriptions } from "@/app/contexts/subscriptionContext";

interface Product {
  name: string;
  foodbundles: number;
  markets: { [key: string]: number };
}

interface PriceComparisonProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PriceComparison({ isOpen, onClose }: PriceComparisonProps) {
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [showSubscribeForm, setShowSubscribeForm] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [marketNames, setMarketNames] = useState<string[]>([]);
  
  const { isAuthenticated } = useAuth();
  const { mySubscriptions } = useSubscriptions();
  
  const hasActiveSubscription = isAuthenticated && mySubscriptions?.some(sub => sub.status === 'ACTIVE' && new Date(sub.endDate) > new Date());

  useEffect(() => {
    if (isOpen) {
      fetchMarketsAndProducts();
    }
  }, [isOpen]);

  const fetchMarketsAndProducts = async () => {
    setLoading(true);
    try {
      // Fetch markets first (only active markets)
      const marketsResponse = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/markets?limit=3&isActive=true`);
      let markets: string[] = [];
      if (marketsResponse.data.success && marketsResponse.data.data) {
        markets = marketsResponse.data.data.slice(0, 3).map((m: any) => m.name);
        setMarketNames(markets);
        console.log('Fetched markets:', markets);
        console.log('Market count:', markets.length);
      }

      // Then fetch products
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/markets/prices/history`, {
        params: { limit: 100 }
      });
      
      if (response.data.success && response.data.data) {
        const priceMap = new Map<string, any>();
        
        response.data.data.forEach((item: any) => {
          const productId = item.productId;
          const marketName = item.market.name;
          const ourPrice = item.ourPrice;
          const marketPrice = item.marketPrice;
          
          if (!priceMap.has(productId)) {
            priceMap.set(productId, {
              name: item.product.productName,
              foodbundles: ourPrice,
              markets: {}
            });
          }
          
          const product = priceMap.get(productId);
          product.markets[marketName] = marketPrice;
        });
        
        const allProducts = Array.from(priceMap.values())
          .filter(p => Object.keys(p.markets).length >= 1);
        
        setProducts(allProducts);
      }
    } catch (error: any) {
      console.error("Failed to fetch data:", error);
      if (error.response?.status === 401) {
        toast.error("Please contact admin to enable public price access");
      } else {
        toast.error("Failed to load market prices");
      }
    } finally {
      setLoading(false);
    }
  };
  const displayProducts = hasActiveSubscription ? products : products.slice(0, 5);

  return (
    <>
      {/* Price Comparison Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Market Price Comparison
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Compare prices across different markets
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Table */}
            <div className="overflow-y-auto max-h-[calc(90vh-180px)] p-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-gray-500">Loading market prices...</div>
                </div>
              ) : products.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-gray-500">No products available for comparison</div>
                </div>
              ) : (
                <table className="w-full border-collapse">
                  <thead className="sticky top-0 bg-white">
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">
                        Product Name
                      </th>
                      <th className="text-right py-3 px-4 font-semibold text-green-700">
                        FoodBundles
                      </th>
                      {marketNames.map((marketName, idx) => (
                        <th key={idx} className="text-right py-3 px-4 font-semibold text-orange-600">
                          {marketName}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {displayProducts.map((product, index) => {
                      const marketPrices = marketNames.map(name => product.markets[name]).filter(p => p !== undefined);
                      const allPrices = [product.foodbundles, ...marketPrices];
                      const minPrice = Math.min(...allPrices);
                      
                      return (
                        <tr
                          key={index}
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-3 px-4 text-gray-900 font-medium">
                            {product.name}
                          </td>
                          <td className={`py-3 px-4 text-right ${product.foodbundles === minPrice ? 'text-green-700 font-bold' : 'text-gray-700'}`}>
                            {product.foodbundles.toLocaleString()} RWF
                          </td>
                          {marketNames.map((marketName, idx) => {
                            const price = product.markets[marketName];
                            return (
                              <td key={idx} className={`py-3 px-4 text-right ${price && price === minPrice ? 'text-orange-600 font-bold' : 'text-gray-700'}`}>
                                {price ? `${price.toLocaleString()} RWF` : '—'}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
            {/* Footer */}
            <div className="p-6 border-t bg-gray-50">
              <div className="space-y-4">
                {!hasActiveSubscription && products.length > 5 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <h3 className="font-semibold text-gray-900 text-sm mb-2">
                      View All Market Prices
                    </h3>
                    <p className="text-xs text-gray-600 mb-4">
                      {isAuthenticated 
                        ? "You need an active subscription to view prices for all products across different markets." 
                        : "Please log in and subscribe to view prices for all products across different markets."}
                    </p>
                    {isAuthenticated ? (
                      <Link href="/restaurant/subscribe" className="inline-block px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors">
                        Subscribe Now
                      </Link>
                    ) : (
                      <Link href="/login" className="inline-block px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors">
                        Log In
                      </Link>
                    )}
                  </div>
                )}

                {/* Shop Now CTA */}
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Note:</span> Prices are updated daily. Bold prices indicate the lowest price for each product.
                  </p>
                  <Link
                    href="/signup"
                    className="px-6 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors font-medium text-sm"
                  >
                    Shop Now
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
