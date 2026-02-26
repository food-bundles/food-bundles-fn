"use client";

import { useState, useEffect } from "react";
import { X, Mail } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import axios from "axios";

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
  const [subscribeData, setSubscribeData] = useState({
    email: "",
    name: "",
    phone: "",
  });

  useEffect(() => {
    if (isOpen) {
      fetchProducts();
    }
  }, [isOpen]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
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
        
        // Try to get products where FoodBundles is cheaper
        const cheaperProducts = allProducts.filter(p => {
          const marketPrices = Object.values(p.markets) as number[];
          return marketPrices.every(price => price > p.foodbundles);
        });
        
        // Use cheaper products if available, otherwise use all products
        const productsArray = (cheaperProducts.length >= 5 ? cheaperProducts : allProducts)
          .slice(0, 10);
        
        setProducts(productsArray);
      }
    } catch (error: any) {
      console.error("Failed to fetch products:", error);
      if (error.response?.status === 401) {
        toast.error("Please contact admin to enable public price access");
      } else {
        toast.error("Failed to load market prices");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subscribeData.email || !subscribeData.name || !subscribeData.phone) {
      toast.error("Please fill all fields");
      return;
    }

    setIsSubscribing(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/newsletter/subscribe`,
        {
          email: subscribeData.email,
          name: subscribeData.name,
          phone: subscribeData.phone,
          restaurantId: null,
        }
      );

      if (response.data.success) {
        toast.success("Successfully subscribed! You'll receive market price updates.");
        setSubscribeData({ email: "", name: "", phone: "" });
        setShowSubscribeForm(false);
      }
    } catch (error: any) {
      console.error("Subscription error:", error);
      toast.error(error.response?.data?.message || "Failed to subscribe");
    } finally {
      setIsSubscribing(false);
    }
  };

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
                      {products.length > 0 && Object.keys(products[0].markets).map((marketName, idx) => (
                        <th key={idx} className="text-right py-3 px-4 font-semibold text-orange-600">
                          {marketName}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product, index) => {
                      const allPrices = [product.foodbundles, ...Object.values(product.markets)];
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
                          {Object.entries(product.markets).map(([marketName, price], idx) => (
                            <td key={idx} className={`py-3 px-4 text-right ${price === minPrice ? 'text-orange-600 font-bold' : 'text-gray-700'}`}>
                              {price.toLocaleString()} RWF
                            </td>
                          ))}
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
                {/* Newsletter Subscription */}
                {showSubscribeForm ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-green-600 mt-0.5" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-sm mb-1">
                          Get More Market Prices
                        </h3>
                        <p className="text-xs text-gray-600 mb-3">
                          Subscribe to receive daily market price updates from more locations
                        </p>
                        <form onSubmit={handleSubscribe} className="space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              type="text"
                              placeholder="Restaurant Name"
                              value={subscribeData.name}
                              onChange={(e) => setSubscribeData({ ...subscribeData, name: e.target.value })}
                              className="h-8 text-xs"
                              disabled={isSubscribing}
                            />
                            <Input
                              type="tel"
                              placeholder="Phone (+250...)"
                              value={subscribeData.phone}
                              onChange={(e) => setSubscribeData({ ...subscribeData, phone: e.target.value })}
                              className="h-8 text-xs"
                              disabled={isSubscribing}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Input
                              type="email"
                              placeholder="Email address"
                              value={subscribeData.email}
                              onChange={(e) => setSubscribeData({ ...subscribeData, email: e.target.value })}
                              className="h-8 text-xs flex-1"
                              disabled={isSubscribing}
                            />
                            <button
                              type="submit"
                              disabled={isSubscribing}
                              className="px-4 py-1 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isSubscribing ? "Subscribing..." : "Subscribe"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowSubscribeForm(false)}
                              className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs font-medium hover:bg-gray-300 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-green-600" />
                        <p className="text-sm text-gray-700">
                          Want more market prices? <span className="font-semibold">Subscribe to our newsletter</span>
                        </p>
                      </div>
                      <button
                        onClick={() => setShowSubscribeForm(true)}
                        className="px-4 py-1.5 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 transition-colors"
                      >
                        Subscribe
                      </button>
                    </div>
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
