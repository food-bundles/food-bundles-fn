"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, TrendingUp, TrendingDown, Download, Edit } from "lucide-react";
import { marketService, Market, PriceHistory, PriceAnalysis } from "@/app/services/marketService";
import { toast } from "sonner";
import { DataTable } from "@/components/data-table";
import { ColumnDef } from "@tanstack/react-table";
import CreateMarketModal from "./_components/CreateMarketModal";
import RecordPriceModal from "./_components/RecordPriceModal";
import PriceComparisonChart from "./_components/PriceComparisonChart";
import createAxiosClient from "@/app/hooks/axiosClient";

export default function MarketsPage() {
  const [activeTab, setActiveTab] = useState<"markets" | "prices" | "analysis" | "comparison">("markets");
  const [markets, setMarkets] = useState<Market[]>([]);
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRecordPriceModal, setShowRecordPriceModal] = useState(false);
  const [editingPrice, setEditingPrice] = useState<PriceHistory | null>(null);
  const [editingMarket, setEditingMarket] = useState<Market | null>(null);
  const [comparisonSearch, setComparisonSearch] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Analysis state
  const [products, setProducts] = useState<any[]>([]);
  const [productId, setProductId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [analysis, setAnalysis] = useState<PriceAnalysis | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  useEffect(() => {
    if (activeTab === "markets") {
      fetchMarkets();
    } else if (activeTab === "prices") {
      fetchPriceHistory();
    } else if (activeTab === "analysis") {
      fetchProducts();
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      setStartDate(firstDay.toISOString().split("T")[0]);
      setEndDate(today.toISOString().split("T")[0]);
    } else if (activeTab === "comparison") {
      fetchPriceHistory();
    }
  }, [activeTab, pagination.page]);

  const handleExport = async (tab: string, format: 'csv' | 'excel') => {
    try {
      let blob;
      if (tab === 'markets') {
        blob = await marketService.exportMarkets(format);
      } else if (tab === 'prices') {
        blob = await marketService.exportPriceHistory(format);
      } else if (tab === 'comparison') {
        blob = await marketService.exportComparison(format);
      }

      const url = window.URL.createObjectURL(blob as Blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${tab}_${Date.now()}.${format === 'csv' ? 'csv' : 'xls'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success(`Exported to ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Export failed');
    }
  };

  const handleUpdatePrice = async (historyId: string, marketPrice: number) => {
    try {
      await marketService.updatePriceHistory(historyId, { marketPrice });
      toast.success('Price updated successfully');
      setEditingPrice(null);
      fetchPriceHistory();
    } catch (error) {
      toast.error('Failed to update price');
    }
  };

  const handleUpdateMarket = async (marketId: string, data: Partial<Market>) => {
    try {
      await marketService.updateMarket(marketId, data);
      toast.success('Market updated successfully');
      setEditingMarket(null);
      fetchMarkets();
    } catch (error) {
      toast.error('Failed to update market');
    }
  };

  const fetchMarkets = async () => {
    setLoading(true);
    try {
      const response = await marketService.getAllMarkets(pagination.page, pagination.limit);
      setMarkets(response.data);
      setPagination(response.pagination);
    } catch (error) {
      toast.error("Failed to fetch markets");
    } finally {
      setLoading(false);
    }
  };

  const fetchPriceHistory = async () => {
    setLoading(true);
    try {
      const response = await marketService.getPriceHistory(pagination.page, pagination.limit);
      setPriceHistory(response.data);
      setPagination(response.pagination);
    } catch (error) {
      toast.error("Failed to fetch price history");
    } finally {
      setLoading(false);
    }
  };

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
    setAnalysisLoading(true);
    try {
      const startDateTime = new Date(startDate + 'T00:00:00Z').toISOString();
      const endDateTime = new Date(endDate + 'T23:59:59Z').toISOString();

      const response = await marketService.analyzePrices({
        productId,
        startDate: startDateTime,
        endDate: endDateTime,
      });
      setAnalysis(response.data);
      toast.success("Analysis completed successfully");
    } catch (error: any) {
      console.error("Analysis error:", error);
      toast.error(error.response?.data?.message || "Failed to analyze prices");
    } finally {
      setAnalysisLoading(false);
    }
  };

  const marketColumns: ColumnDef<Market>[] = [
    {
      accessorKey: "name",
      header: "Market Name",
    },
    {
      accessorKey: "location",
      header: "Location",
    },
    {
      accessorKey: "province",
      header: "Province",
    },
    {
      accessorKey: "district",
      header: "District",
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => (
        <span
          className={`px-2 py-1 rounded text-[10px] font-bold ${row.original.isActive
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800"
            }`}
        >
          {row.original.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) =>
        new Date(row.original.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setEditingMarket(row.original)}
            className="h-7 w-7 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            <Edit className="w-3.5 h-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={async () => {
              if (!confirm("Delete this market?")) return;
              try {
                await marketService.deleteMarket(row.original.id);
                toast.success("Market deleted successfully");
                fetchMarkets();
              } catch (error) {
                toast.error("Failed to delete market");
              }
            }}
            className="h-7 px-2 text-[10px] text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const priceColumns: ColumnDef<PriceHistory>[] = [
    {
      accessorKey: "productName",
      header: "Product",
      accessorFn: (row) => row.product.productName || row.product.unitPrice, // Fallback to avoid error if name missing
      cell: ({ row }) => row.original.product.productName || "N/A",
    },
    {
      accessorKey: "marketName",
      header: "Market",
      accessorFn: (row) => row.market.name,
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-xs">{row.original.market.name}</div>
          <div className="text-[10px] text-gray-500">
            {row.original.market.district}, {row.original.market.province}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "ourPrice",
      header: "Our Price",
      cell: ({ row }) => (
        <span className="text-xs font-medium text-green-700">
          {row.original.ourPrice.toLocaleString()} RWF
        </span>
      ),
    },
    {
      accessorKey: "marketPrice",
      header: "Market Price",
      cell: ({ row }) => (
        <span className="text-xs font-medium text-gray-900">
          {row.original.marketPrice.toLocaleString()} RWF
        </span>
      ),
    },
    {
      id: "difference",
      header: "Difference",
      cell: ({ row }) => {
        const diff = row.original.marketPrice - row.original.ourPrice;
        const isProfit = diff < 0;
        return (
          <div className={`flex items-center gap-1 text-xs ${isProfit ? "text-green-600" : "text-red-600"}`}>
            {isProfit ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
            <span className="font-semibold">{Math.abs(diff).toLocaleString()} RWF</span>
          </div>
        );
      },
    },
    {
      accessorKey: "recordedDate",
      header: "Recorded",
      cell: ({ row }) => (
        <span className="text-xs text-gray-600">
          {new Date(row.original.recordedDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setEditingPrice(row.original)}
            className="h-7 w-7 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            <Edit className="w-3.5 h-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={async () => {
              if (!confirm("Delete this price record?")) return;
              try {
                await marketService.deleteMarketPriceHistory(row.original.id);
                toast.success("Price record deleted");
                fetchPriceHistory();
              } catch (error) {
                toast.error("Failed to delete");
              }
            }}
            className="h-7 px-2 text-[10px] text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6 bg-gray-50/50 min-h-full font-sans">
      <div className="flex justify-between items-center">
        <div className="flex-1 min-w-0">
          <h1 className="text-[16px] font-medium text-gray-800 tracking-tight">Market Price Comparison</h1>
          <p className="text-gray-500 text-xs mt-0.5">Compare prices across different markets</p>
        </div>
        <div className="flex gap-2 shrink-0">
          {activeTab === "markets" && (
            <Button onClick={() => setShowCreateModal(true)} className="bg-green-700 hover:bg-green-600 text-[11px] h-8 px-3 text-white rounded shadow-sm">
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Add Market
            </Button>
          )}
          {activeTab === "prices" && (
            <Button onClick={() => setShowRecordPriceModal(true)} className="bg-green-700 hover:bg-green-600 text-[11px] h-8 px-3 text-white rounded shadow-sm">
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Record Price
            </Button>
          )}
        </div>
      </div>

      <Card className="border-none shadow-sm ring-1 ring-gray-200">
        <CardHeader className="pb-0 bg-white border-b border-gray-100 px-6">
          <nav className="-mb-px flex space-x-6">
            {(["markets", "prices", "analysis", "comparison"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 px-1 border-b-2 font-medium text-[11px] uppercase tracking-wider transition-colors ${activeTab === tab
                  ? "border-green-600 text-green-700"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </CardHeader>
        <CardContent className="bg-white p-6">
          {activeTab === "markets" && (
            <DataTable
              columns={marketColumns}
              data={markets}
              showPagination={true}
              showSearch={true}
              searchKey="name"
              searchPlaceholder="Search markets..."
              pagination={pagination}
              onPaginationChange={(page, limit) => {
                setPagination((prev) => ({ ...prev, page, limit }));
              }}
              isLoading={loading}
              customFilters={
                <div className="flex gap-2">
                  <Button onClick={() => handleExport('markets', 'csv')} variant="outline" size="sm" className="bg-green-700 hover:bg-green-600 text-[10px] h-7 text-white border-none">
                    <Download className="w-3 h-3 mr-1" />
                    CSV
                  </Button>
                  <Button onClick={() => handleExport('markets', 'excel')} variant="outline" size="sm" className="bg-green-700 hover:bg-green-600 text-[10px] h-7 text-white border-none">
                    <Download className="w-3 h-3 mr-1" />
                    Excel
                  </Button>
                </div>
              }
            />
          )}
          {activeTab === "prices" && (
            <DataTable
              columns={priceColumns}
              data={priceHistory}
              showPagination={true}
              showSearch={true}
              searchKey="productName"
              searchPlaceholder="Search products..."
              pagination={pagination}
              onPaginationChange={(page, limit) => {
                setPagination((prev) => ({ ...prev, page, limit }));
              }}
              isLoading={loading}
              customFilters={
                <div className="flex gap-2">
                  <Button onClick={() => handleExport('prices', 'csv')} variant="outline" size="sm" className="bg-green-700 hover:bg-green-600 text-[10px] h-7 text-white border-none">
                    <Download className="w-3 h-3 mr-1" />
                    CSV
                  </Button>
                  <Button onClick={() => handleExport('prices', 'excel')} variant="outline" size="sm" className="bg-green-700 hover:bg-green-600 text-[10px] h-7 text-white border-none">
                    <Download className="w-3 h-3 mr-1" />
                    Excel
                  </Button>
                </div>
              }
            />
          )}
          {activeTab === "analysis" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-semibold text-gray-500 uppercase tracking-tight">Product</Label>
                  <Select value={productId} onValueChange={setProductId}>
                    <SelectTrigger className="h-9 text-[11px] bg-gray-50 border-gray-200">
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id} className="text-[11px]">
                          {product.productName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-semibold text-gray-500 uppercase tracking-tight">Start Date</Label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full h-9 px-3 border border-gray-200 bg-gray-50 rounded text-[11px] focus:outline-none focus:ring-1 focus:ring-green-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-semibold text-gray-500 uppercase tracking-tight">End Date</Label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full h-9 px-3 border border-gray-200 bg-gray-50 rounded text-[11px] focus:outline-none focus:ring-1 focus:ring-green-500"
                  />
                </div>
              </div>
              <Button onClick={handleAnalyze} disabled={analysisLoading} className="bg-green-700 hover:bg-green-600 text-[11px] h-8 px-6 text-white rounded">
                {analysisLoading ? "Analyzing..." : "Generate Analysis"}
              </Button>

              {analysis && analysis.analysis && (
                <div className="space-y-8 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-linear-to-br from-blue-50 to-blue-100 rounded border border-blue-200 shadow-sm transition-all hover:shadow-md">
                      <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Avg Our Price</p>
                      <p className="text-lg font-bold text-blue-700 mt-1">
                        {(analysis.analysis.avgOurPrice || 0).toLocaleString()} <span className="text-[10px] font-medium opacity-70">RWF</span>
                      </p>
                    </div>
                    <div className="p-4 bg-linear-to-br from-red-50 to-red-100 rounded border border-red-200 shadow-sm transition-all hover:shadow-md">
                      <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Avg Market Price</p>
                      <p className="text-lg font-bold text-red-700 mt-1">
                        {(analysis.analysis.avgMarketPrice || 0).toLocaleString()} <span className="text-[10px] font-medium opacity-70">RWF</span>
                      </p>
                    </div>
                    <div className={`p-4 rounded border shadow-sm transition-all hover:shadow-md ${analysis.analysis.profitLoss === "PROFIT" ? "bg-linear-to-br from-green-50 to-green-100 border-green-200" : "bg-linear-to-br from-red-50 to-red-100 border-red-200"}`}>
                      <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Current Gap</p>
                      <div className="flex items-center gap-2 mt-1">
                        {analysis.analysis.profitLoss === "PROFIT" ? (
                          <TrendingDown className="w-4 h-4 text-green-600" />
                        ) : (
                          <TrendingUp className="w-4 h-4 text-red-600" />
                        )}
                        <p className={`text-lg font-bold ${analysis.analysis.profitLoss === "PROFIT" ? "text-green-700" : "text-red-700"}`}>
                          {Math.abs(analysis.analysis.avgDifference || 0).toLocaleString()} <span className="text-[10px] font-medium opacity-70">RWF</span>
                        </p>
                      </div>
                      <p className="text-[9px] font-bold text-gray-500 mt-1">
                        {(analysis.analysis.percentageDifference || 0).toFixed(1)}% {analysis.analysis.profitLoss === "PROFIT" ? "lower than" : "above"} market
                      </p>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-100 rounded-lg p-5 shadow-sm">
                    <h3 className="text-[10px] font-bold text-gray-400 mb-6 uppercase tracking-widest border-b pb-2">Price Velocity Trend</h3>
                    <PriceComparisonChart data={analysis} />
                  </div>

                  <div className="bg-white border border-gray-100 rounded-lg p-5 shadow-sm">
                    <h3 className="text-[10px] font-bold text-gray-400 mb-6 uppercase tracking-widest border-b pb-2">Market Locality Breakdown</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {analysis.marketBreakdown?.map((market) => (
                        <div key={market.market.id} className="flex justify-between items-center p-3 bg-gray-50/50 rounded border border-gray-100 hover:border-green-200 hover:bg-green-50/20 transition-all">
                          <div>
                            <p className="text-xs font-semibold text-gray-800">{market.market.name}</p>
                            <p className="text-[9px] text-gray-400 font-medium uppercase mt-0.5">
                              {market.market.district}, {market.market.province}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-bold text-gray-900">
                              {(market.avgMarketPrice || 0).toLocaleString()} <span className="text-[9px] opacity-60">RWF</span>
                            </p>
                            <p className={`text-[9px] font-bold mt-0.5 ${market.profitLoss === "PROFIT" ? "text-green-600" : "text-red-500"}`}>
                              {market.profitLoss === "PROFIT" ? "-" : "+"}{(market.percentageDifference || 0).toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          {activeTab === "comparison" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Quick search products..."
                    value={comparisonSearch}
                    onChange={(e) => setComparisonSearch(e.target.value)}
                    className="w-full pl-9 h-9 border border-gray-200 rounded text-[11px] focus:outline-none focus:ring-1 focus:ring-green-500 bg-gray-50/50"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => handleExport('comparison', 'csv')} variant="outline" size="sm" className="bg-green-700 hover:bg-green-600 border-none text-[10px] h-7 text-white font-medium">
                    <Download className="w-3 h-3 mr-1.5" /> Exports
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto rounded border border-gray-100 shadow-sm">
                {priceHistory.length === 0 ? (
                  <div className="text-center py-16 text-gray-400 text-xs font-medium bg-gray-50/30">
                    No comparative data discovered for this period
                  </div>
                ) : (
                  <table className="w-full border-collapse">
                    <thead className="bg-gray-50/80">
                      <tr>
                        <th className="text-left py-3 px-4 font-bold text-gray-500 text-[10px] uppercase tracking-widest border-b border-gray-100">Product Name</th>
                        <th className="text-right py-3 px-4 font-bold text-green-700 text-[10px] uppercase tracking-widest border-b border-gray-100 bg-green-50/30">FoodBundles</th>
                        {[...new Set(priceHistory.map(item => item.market.name))].map(marketName => (
                          <th key={marketName} className="text-right py-3 px-4 font-bold text-gray-500 text-[10px] uppercase tracking-widest border-b border-gray-100">
                            {marketName}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {(() => {
                        const pivotedData = new Map();
                        priceHistory.filter(item =>
                          (item.product.productName || "").toLowerCase().includes(comparisonSearch.toLowerCase()) ||
                          item.market.name.toLowerCase().includes(comparisonSearch.toLowerCase())
                        ).forEach(item => {
                          const productName = item.product.productName;
                          if (!pivotedData.has(productName)) {
                            pivotedData.set(productName, {
                              ourPrice: item.ourPrice,
                              markets: {}
                            });
                          }
                          pivotedData.get(productName).markets[item.market.name] = item.marketPrice;
                        });

                        const marketNames = [...new Set(priceHistory.map(item => item.market.name))];

                        return Array.from(pivotedData.entries()).map(([productName, data]: [string, any], idx) => (
                          <tr key={idx} className="hover:bg-green-50/20 transition-colors">
                            <td className="py-3 px-4 text-[11px] font-semibold text-gray-800 capitalize">
                              {productName}
                            </td>
                            <td className="py-3 px-4 text-[11px] text-right text-green-700 font-bold bg-green-50/10">
                              {data.ourPrice.toLocaleString()} <span className="opacity-60 text-[9px]">RWF</span>
                            </td>
                            {marketNames.map(marketName => (
                              <td key={marketName} className="py-3 px-4 text-[11px] text-right text-gray-600 font-medium">
                                {data.markets[marketName]
                                  ? `${data.markets[marketName].toLocaleString()} RWF`
                                  : <span className="text-gray-300 text-[10px]">--</span>}
                              </td>
                            ))}
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <CreateMarketModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={fetchMarkets}
      />
      <RecordPriceModal
        isOpen={showRecordPriceModal}
        onClose={() => setShowRecordPriceModal(false)}
        onSuccess={fetchPriceHistory}
        markets={markets}
      />

      {editingPrice && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[1px] z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded border border-gray-200 p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-sm font-bold text-gray-800 mb-6 uppercase tracking-wider border-b pb-2">Update Marker Intel</h3>
            <div className="space-y-5">
              <div className="flex justify-between">
                <div>
                  <Label className="text-[9px] text-gray-400 font-bold uppercase">Product</Label>
                  <p className="text-xs font-bold text-gray-800 mt-0.5">{editingPrice.product.productName || "Product"}</p>
                </div>
                <div className="text-right">
                  <Label className="text-[9px] text-gray-400 font-bold uppercase">Locality</Label>
                  <p className="text-xs font-bold text-gray-800 mt-0.5">{editingPrice.market.name}</p>
                </div>
              </div>
              <div className="pt-2">
                <Label className="text-[9px] text-gray-400 font-bold uppercase">Observed Market Price (RWF)</Label>
                <input
                  type="number"
                  defaultValue={editingPrice.marketPrice}
                  id="newPrice"
                  placeholder="0.00"
                  className="w-full mt-1.5 h-10 px-3 border border-gray-200 rounded text-sm font-bold focus:outline-none focus:ring-1 focus:ring-green-500 bg-gray-50"
                />
              </div>
              <div className="flex gap-2 justify-end pt-4 border-t border-gray-50 mt-2">
                <Button variant="outline" size="sm" onClick={() => setEditingPrice(null)} className="h-8 text-[10px] font-bold uppercase tracking-widest text-gray-500 border-gray-200">Dismiss</Button>
                <Button
                  size="sm"
                  onClick={() => {
                    const priceInput = document.getElementById('newPrice') as HTMLInputElement;
                    const newPrice = parseFloat(priceInput.value);
                    if (!isNaN(newPrice)) handleUpdatePrice(editingPrice.id, newPrice);
                  }}
                  className="h-8 bg-green-700 hover:bg-green-600 text-[10px] font-bold uppercase tracking-widest text-white px-4 rounded"
                >
                  Commit Change
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {editingMarket && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[1px] z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded border border-gray-200 p-6 max-sm:w-full max-w-sm w-full shadow-2xl">
            <h3 className="text-sm font-bold text-gray-800 mb-6 uppercase tracking-wider border-b pb-2">Update Market Details</h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-[9px] text-gray-400 font-bold uppercase">Market Name</Label>
                <input
                  type="text"
                  defaultValue={editingMarket.name}
                  id="edit_market_name"
                  className="w-full h-9 px-3 border border-gray-200 rounded text-xs font-medium focus:outline-none focus:ring-1 focus:ring-green-500 bg-gray-50"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[9px] text-gray-400 font-bold uppercase">Location</Label>
                <input
                  type="text"
                  defaultValue={editingMarket.location}
                  id="edit_market_location"
                  className="w-full h-9 px-3 border border-gray-200 rounded text-xs font-medium focus:outline-none focus:ring-1 focus:ring-green-500 bg-gray-50"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[9px] text-gray-400 font-bold uppercase">Province</Label>
                  <input
                    type="text"
                    defaultValue={editingMarket.province}
                    id="edit_market_province"
                    className="w-full h-9 px-3 border border-gray-200 rounded text-xs font-medium focus:outline-none focus:ring-1 focus:ring-green-500 bg-gray-50"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[9px] text-gray-400 font-bold uppercase">District</Label>
                  <input
                    type="text"
                    defaultValue={editingMarket.district}
                    id="edit_market_district"
                    className="w-full h-9 px-3 border border-gray-200 rounded text-xs font-medium focus:outline-none focus:ring-1 focus:ring-green-500 bg-gray-50"
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-4 border-t border-gray-50 mt-2">
                <Button variant="outline" size="sm" onClick={() => setEditingMarket(null)} className="h-8 text-[10px] font-bold uppercase tracking-widest text-gray-500 border-gray-200">Dismiss</Button>
                <Button
                  size="sm"
                  onClick={() => {
                    const name = (document.getElementById('edit_market_name') as HTMLInputElement).value;
                    const location = (document.getElementById('edit_market_location') as HTMLInputElement).value;
                    const province = (document.getElementById('edit_market_province') as HTMLInputElement).value;
                    const district = (document.getElementById('edit_market_district') as HTMLInputElement).value;
                    handleUpdateMarket(editingMarket.id, { name, location, province, district });
                  }}
                  className="h-8 bg-green-700 hover:bg-green-600 text-[10px] font-bold uppercase tracking-widest text-white px-4 rounded"
                >
                  Apply Change
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
