"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calculator, Search } from "lucide-react";
import { productService } from "@/app/services/productService";
import { toast } from "sonner";

interface PricingCalculatorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type CalculationMode = "purchase" | "selling" | "margin";

interface ProductData {
  id: string;
  productName: string;
  unitPrice: number;
  restaurantPrice: number;
  hotelPrice: number;
  purchasePrice: number;
  unit: string;
  latestMarketPrices?: MarketPrice[];
}

interface MarketPrice {
  marketPrice: number;
  market: { name: string };
  recordedDate: string;
}

export function PricingCalculator({
  open,
  onOpenChange,
}: PricingCalculatorProps) {
  const [mode, setMode] = useState<CalculationMode>("purchase");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<ProductData | null>(
    null,
  );
  const [searchResults, setSearchResults] = useState<ProductData[]>([]);
  const [marketPrices, setMarketPrices] = useState<MarketPrice[]>([]);
  const [purchasePrice, setPurchasePrice] = useState<number>(0);
  const [restaurantPrice, setRestaurantPrice] = useState<number>(0);
  const [hotelPrice, setHotelPrice] = useState<number>(0);
  const [targetMargin, setTargetMargin] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const searchProducts = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }
      setLoading(true);
      try {
        const response = await productService.getAllProducts({
          search: searchQuery,
          limit: 10,
        });
        if (response?.products) {
          setSearchResults(response.products);
        } else if (response?.data) {
          setSearchResults(Array.isArray(response.data) ? response.data : []);
        }
      } catch (error) {
        toast.error("Failed to search products");
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      searchProducts();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const selectProduct = async (product: ProductData) => {
    setSelectedProduct(product);
    setPurchasePrice(product.purchasePrice || 0);
    setRestaurantPrice(product.restaurantPrice || 0);
    setHotelPrice(product.hotelPrice || 0);
    setSearchResults([]);
    setSearchQuery("");

    if (product.latestMarketPrices && product.latestMarketPrices.length > 0) {
      setMarketPrices(product.latestMarketPrices);
    } else {
      setMarketPrices([]);
    }
  };

  const calculateFromPurchase = () => {
    if (purchasePrice <= 0) {
      toast.error("Please enter a valid purchase price");
      return;
    }
    // Margin = (Selling - Purchase) / Selling * 100
    // Selling = Purchase / (1 - Margin/100)
    setRestaurantPrice(Math.round(purchasePrice / (1 - 0.20)));
    setHotelPrice(Math.round(purchasePrice / (1 - 0.22)));
    setTargetMargin(20);
  };

  const calculateFromSelling = () => {
    if (restaurantPrice <= 0) {
      toast.error("Please enter a valid restaurant price");
      return;
    }
    // Purchase = Selling * (1 - Margin/100)
    const estimatedPurchase = Math.round(restaurantPrice * (1 - 0.20));
    setPurchasePrice(estimatedPurchase);
    setHotelPrice(Math.round(estimatedPurchase / (1 - 0.22)));
    setTargetMargin(20);
  };

  const calculateFromMargin = () => {
    if (purchasePrice <= 0 || targetMargin <= 0) {
      toast.error("Please enter valid purchase price and margin");
      return;
    }
    // Selling = Purchase / (1 - Margin/100)
    setRestaurantPrice(Math.round(purchasePrice / (1 - targetMargin / 100)));
    setHotelPrice(Math.round(purchasePrice / (1 - (targetMargin + 2) / 100)));
  };

  const getRestaurantMargin = () => {
    if (purchasePrice <= 0 || restaurantPrice <= 0) return 0;
    return (((restaurantPrice - purchasePrice) / restaurantPrice) * 100).toFixed(1);
  };

  const getHotelMargin = () => {
    if (purchasePrice <= 0 || hotelPrice <= 0) return 0;
    return (((hotelPrice - purchasePrice) / hotelPrice) * 100).toFixed(1);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0">
        <DialogHeader className="px-4 py-3 border-b bg-gray-50">
          <DialogTitle className="flex items-center gap-2 text-base font-semibold">
            Pricing Calculator
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-5">
          {/* LEFT SIDE - Search & Product Info */}
          <div className="col-span-2 border-r p-3 bg-gray-50">
            {/* Search */}
            <div className="mb-2">
              <Input
                placeholder="Search product..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-sm h-7 px-2 py-1"
              />
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="border rounded bg-white mb-2 max-h-40 overflow-y-auto">
                {searchResults.map((product) => (
                  <div
                    key={product.id}
                    className="px-2 py-1.5 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                    onClick={() => selectProduct(product)}
                  >
                    <p className="font-medium text-sm">{product.productName}</p>
                    <p className="text-xs text-gray-600">
                      {product.purchasePrice?.toLocaleString()} RWF
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Selected Product */}
            {selectedProduct && (
              <div className="bg-white rounded-lg p-2.5 mb-2 border shadow-sm">
                <h3 className="font-semibold text-sm mb-1.5 text-gray-900">
                  {selectedProduct.productName}
                </h3>
                <div className="space-y-0.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Purchase:</span>
                    <span className="font-semibold text-gray-900">
                      {selectedProduct.purchasePrice?.toLocaleString()} RWF
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Restaurant:</span>
                    <span className="font-semibold text-gray-900">
                      {selectedProduct.restaurantPrice?.toLocaleString()} RWF
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Hotel:</span>
                    <span className="font-semibold text-gray-900">
                      {selectedProduct.hotelPrice?.toLocaleString()} RWF
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Market Prices */}
            {marketPrices.length > 0 && (
              <div className="bg-green-50 rounded-lg p-2.5 border border-green-200 shadow-sm">
                <h3 className="font-semibold text-xs mb-1.5 text-gray-900">
                  Market Prices
                </h3>
                <div className="space-y-0">
                  {marketPrices.slice(0, 3).map((mp, idx) => (
                    <div
                      key={idx}
                      className="text-xs flex justify-between items-center py-2 border-b border-green-200 last:border-b-0"
                    >
                      <span className="text-green-700">{mp.market.name.split(' ')[0]}:</span>
                      <span className="font-semibold text-green-900">
                        {mp.marketPrice.toLocaleString()} RWF
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT SIDE - Calculator */}
          <div className="col-span-3 p-3 flex flex-col">
            {/* Results Display */}
            <div className="bg-linear-to-br from-gray-900 to-gray-800 rounded-lg p-3 mb-2.5">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-green-500/20 rounded-md p-2">
                  <p className="text-xs text-green-300">Purchase</p>
                  <p className="text-lg font-bold text-white">
                    {purchasePrice.toLocaleString()}
                  </p>
                  <p className="text-xs text-green-400">RWF</p>
                </div>
                <div className="bg-green-500/20 rounded-md p-2">
                  <p className="text-xs text-green-300">Restaurant</p>
                  <p className="text-lg font-bold text-white">
                    {restaurantPrice.toLocaleString()}
                  </p>
                  <p className="text-xs text-green-400">
                    +{getRestaurantMargin()}%
                  </p>
                </div>
                <div className="bg-orange-500/20 rounded-md p-2">
                  <p className="text-xs text-orange-300">Hotel</p>
                  <p className="text-lg font-bold text-white">
                    {hotelPrice.toLocaleString()}
                  </p>
                  <p className="text-xs text-orange-400">
                    +{getHotelMargin()}%
                  </p>
                </div>
                <div className="bg-orange-500/20 rounded-md p-2">
                  <p className="text-xs text-orange-300">Profit</p>
                  <p className="text-lg font-bold text-white">
                    {(restaurantPrice - purchasePrice).toLocaleString()}
                  </p>
                  <p className="text-xs text-orange-400">RWF</p>
                </div>
              </div>
            </div>

            {/* Mode Tabs */}
            <div className="flex gap-1 mb-2.5 bg-gray-100 p-0.5 rounded-md">
              <Button
                size="sm"
                variant={mode === "purchase" ? "default" : "ghost"}
                onClick={() => setMode("purchase")}
                className={`flex-1 h-7 text-xs ${mode === "purchase" ? "bg-green-800 hover:bg-green-900" : ""}`}
              >
                Purchase
              </Button>
              <Button
                size="sm"
                variant={mode === "selling" ? "default" : "ghost"}
                onClick={() => setMode("selling")}
                className={`flex-1 h-7 text-xs ${mode === "selling" ? "bg-green-800 hover:bg-green-900" : ""}`}
              >
                Selling
              </Button>
              <Button
                size="sm"
                variant={mode === "margin" ? "default" : "ghost"}
                onClick={() => setMode("margin")}
                className={`flex-1 h-7 text-xs ${mode === "margin" ? "bg-green-800 hover:bg-green-900" : ""}`}
              >
                Margin
              </Button>
            </div>

            {/* Input Fields */}
            <div className="bg-white rounded-lg border p-3">
              {mode === "purchase" && (
                <div>
                  <Label className="text-xs font-medium mb-1 block">
                    Purchase Price (RWF)
                  </Label>
                  <Input
                    type="number"
                    value={purchasePrice || ""}
                    onChange={(e) => setPurchasePrice(Number(e.target.value))}
                    placeholder="0"
                    className="text-base font-semibold h-9 px-2"
                  />
                </div>
              )}

              {mode === "selling" && (
                <div>
                  <Label className="text-xs font-medium mb-1 block">
                    Restaurant Price (RWF)
                  </Label>
                  <Input
                    type="number"
                    value={restaurantPrice || ""}
                    onChange={(e) => setRestaurantPrice(Number(e.target.value))}
                    placeholder="0"
                    className="text-base font-semibold h-9 px-2"
                  />
                </div>
              )}

              {mode === "margin" && (
                <div className="space-y-2.5">
                  <div>
                    <Label className="text-xs font-medium mb-1 block">
                      Purchase Price (RWF)
                    </Label>
                    <Input
                      type="number"
                      value={purchasePrice || ""}
                      onChange={(e) => setPurchasePrice(Number(e.target.value))}
                      placeholder="0"
                      className="text-base font-semibold h-9 px-2"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-medium mb-1 block">
                      Target Margin (%)
                    </Label>
                    <Input
                      type="number"
                      value={targetMargin || ""}
                      onChange={(e) => setTargetMargin(Number(e.target.value))}
                      placeholder="0"
                      className="text-base font-semibold h-9 px-2"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Calculate Button */}
            <Button
              onClick={
                mode === "purchase"
                  ? calculateFromPurchase
                  : mode === "selling"
                    ? calculateFromSelling
                    : calculateFromMargin
              }
              className="w-full h-9 text-sm font-semibold mt-2.5 bg-linear-to-r from-green-800 to-green-900 hover:from-green-900 hover:to-green-800"
            >
              Calculate Prices
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}





