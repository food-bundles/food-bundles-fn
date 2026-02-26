"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { marketService, PriceAnalysis } from "@/app/services/marketService";
import { toast } from "sonner";
import createAxiosClient from "@/app/hooks/axiosClient";
import PriceComparisonChart from "./PriceComparisonChart";
import { TrendingUp, TrendingDown, Calendar } from "lucide-react";

interface PriceAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PriceAnalysisModal({
  isOpen,
  onClose,
}: PriceAnalysisModalProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [productId, setProductId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [analysis, setAnalysis] = useState<PriceAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchProducts();
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      setStartDate(firstDay.toISOString().split("T")[0]);
      setEndDate(today.toISOString().split("T")[0]);
    }
  }, [isOpen]);

  const fetchProducts = async () => {
    try {
      const axiosClient = createAxiosClient();
      const response = await axiosClient.get("/products");
      setProducts(response.data.data || []);
    } catch (error) {
      toast.error("Failed to fetch products");
    }
  };

  const handleAnalyze = async () => {
    if (!productId || !startDate || !endDate) {
      toast.error("Please fill all fields");
      return;
    }
    setLoading(true);
    try {
      const response = await marketService.analyzePrices({
        productId,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
      });
      setAnalysis(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to analyze prices");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Price Analysis</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Product</Label>
              <Select value={productId} onValueChange={setProductId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.productName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Start Date</Label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <Label>End Date</Label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
          </div>
          <Button onClick={handleAnalyze} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
            {loading ? "Analyzing..." : "Analyze"}
          </Button>

          {analysis && analysis.analysis && (
            <div className="space-y-6 mt-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Avg Our Price</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {(analysis.analysis.avgOurPrice || 0).toLocaleString()} RWF
                  </p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <p className="text-sm text-gray-600">Avg Market Price</p>
                  <p className="text-2xl font-bold text-red-600">
                    {(analysis.analysis.avgMarketPrice || 0).toLocaleString()} RWF
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${analysis.analysis.profitLoss === "PROFIT" ? "bg-green-50" : "bg-red-50"}`}>
                  <p className="text-sm text-gray-600">Difference</p>
                  <div className="flex items-center gap-2">
                    {analysis.analysis.profitLoss === "PROFIT" ? (
                      <TrendingDown className="w-5 h-5 text-green-600" />
                    ) : (
                      <TrendingUp className="w-5 h-5 text-red-600" />
                    )}
                    <p className={`text-2xl font-bold ${analysis.analysis.profitLoss === "PROFIT" ? "text-green-600" : "text-red-600"}`}>
                      {Math.abs(analysis.analysis.avgDifference || 0).toLocaleString()} RWF
                    </p>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {(analysis.analysis.percentageDifference || 0).toFixed(2)}%
                  </p>
                </div>
              </div>

              <div className="bg-white border rounded-lg p-4">
                <h3 className="font-semibold mb-4">Price Trend</h3>
                <PriceComparisonChart data={analysis} />
              </div>

              <div className="bg-white border rounded-lg p-4">
                <h3 className="font-semibold mb-4">Market Breakdown</h3>
                <div className="space-y-3">
                  {analysis.marketBreakdown?.map((market) => (
                    <div key={market.market.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">{market.market.name}</p>
                        <p className="text-xs text-gray-600">
                          {market.market.district}, {market.market.province}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {(market.avgMarketPrice || 0).toLocaleString()} RWF
                        </p>
                        <p className={`text-xs ${market.profitLoss === "PROFIT" ? "text-green-600" : "text-red-600"}`}>
                          {(market.percentageDifference || 0).toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
