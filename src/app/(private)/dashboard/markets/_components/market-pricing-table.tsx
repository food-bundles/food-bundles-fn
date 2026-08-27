/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Download,
  Edit,
  Trash2,
} from "lucide-react";
import {
  marketService,
  Market,
  PriceHistory,
  PriceAnalysis,
  PriceByProduct,
} from "@/app/services/marketService";
import { toast } from "sonner";
import { ColumnDef } from "@tanstack/react-table";
import PriceComparisonChart from "@/app/(private)/dashboard/markets/_components/PriceComparisonChart";
import RecordPriceModal from "@/app/(private)/dashboard//markets/_components/RecordPriceModal";
import {
  ModalShell,
  ModalHeader,
  ModalActions,
} from "./shared-atoms";

type ActiveTab = "markets" | "prices" | "analysis" | "comparison";

export default function MarketPricingTable() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("markets");
  const [markets, setMarkets] = useState<Market[]>([]);
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const [pricesByProduct, setPricesByProduct] = useState<PriceByProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [showRecordPriceModal, setShowRecordPriceModal] = useState(false);
  const [editingPrice, setEditingPrice] = useState<PriceHistory | null>(null);
  const [editingMarket, setEditingMarket] = useState<Market | null>(null);
  const [marketSearch, setMarketSearch] = useState("");
  const [priceSearch, setPriceSearch] = useState("");
  const [priceMarketFilter, setPriceMarketFilter] = useState("all");
  const [priceDateFrom, setPriceDateFrom] = useState("");
  const [priceDateTo, setPriceDateTo] = useState("");
  const [comparisonSearch, setComparisonSearch] = useState("");
  const [selectedMarkets, setSelectedMarkets] = useState<Market[]>([]);
  const [selectedPrices, setSelectedPrices] = useState<PriceHistory[]>([]);
  const [selectedComparison, setSelectedComparison] = useState<any[]>([]);
  const [showBulkDeleteMarkets, setShowBulkDeleteMarkets] = useState(false);
  const [showBulkDeletePrices, setShowBulkDeletePrices] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
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
      fetchPricesByProduct();
    }
  }, [activeTab, pagination.page]);

  const handleExport = async (tab: string, format: "csv" | "excel") => {
    try {
      let blob;
      if (tab === "markets") blob = await marketService.exportMarkets(format);
      else if (tab === "prices")
        blob = await marketService.exportPriceHistory(format);
      else if (tab === "comparison")
        blob = await marketService.exportComparison(format);

      const url = window.URL.createObjectURL(blob as Blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${tab}_${Date.now()}.${format === "csv" ? "csv" : "xls"}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success(`Exported to ${format.toUpperCase()}`);
    } catch {
      toast.error("Export failed");
    }
  };

  const handleUpdatePrice = async (historyId: string, marketPrice: number) => {
    try {
      await marketService.updatePriceHistory(historyId, { marketPrice });
      toast.success("Price updated successfully");
      setEditingPrice(null);
      fetchPriceHistory();
      fetchPricesByProduct();
    } catch {
      toast.error("Failed to update price");
    }
  };

  const handleUpdateMarket = async (
    marketId: string,
    data: Partial<Market>,
  ) => {
    try {
      await marketService.updateMarket(marketId, data);
      toast.success("Market updated successfully");
      setEditingMarket(null);
      fetchMarkets();
    } catch {
      toast.error("Failed to update market");
    }
  };

  const handleToggleActive = async (market: Market) => {
    try {
      await marketService.updateMarket(market.id, {
        isActive: !market.isActive,
      });
      toast.success(
        `Market ${market.isActive ? "deactivated" : "activated"} successfully`,
      );
      fetchMarkets();
    } catch {
      toast.error("Failed to update market status");
    }
  };

  const fetchMarkets = async () => {
    setLoading(true);
    try {
      const response = await marketService.getAllMarkets(
        pagination.page,
        pagination.limit,
      );
      setMarkets(response.data);
      setPagination(response.pagination);
    } catch {
      toast.error("Failed to fetch markets");
    } finally {
      setLoading(false);
    }
  };

  const fetchPriceHistory = async () => {
    setLoading(true);
    try {
      const response = await marketService.getPriceHistory(
        pagination.page,
        pagination.limit,
      );
      setPriceHistory(response.data);
      setPagination(response.pagination);
    } catch {
      toast.error("Failed to fetch price history");
    } finally {
      setLoading(false);
    }
  };

  const fetchPricesByProduct = async () => {
    setLoading(true);
    try {
      const response = await marketService.getPricesByProduct(
        pagination.page,
        pagination.limit,
      );
      setPricesByProduct(response.data);
      setPagination(response.pagination);
    } catch {
      toast.error("Failed to fetch products comparison");
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await marketService.getPriceHistory(1, 1000);
      const uniqueProducts = Array.from(
        new Map(
          response.data.map((item: PriceHistory) => [
            item.product.id,
            { id: item.product.id, productName: item.product.productName },
          ]),
        ).values(),
      );
      setProducts(uniqueProducts);
    } catch {
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
      const response = await marketService.analyzePrices({
        productId,
        startDate: startDate,
        endDate: endDate,
      });
      setAnalysis(response.data);
      if (response.data.analysis.totalRecords === 0) {
        toast.warning("No price data found for the selected period");
      } else {
        toast.success("Analysis completed successfully");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to analyze prices");
    } finally {
      setAnalysisLoading(false);
    }
  };

  const handleBulkToggleActive = async (isActive: boolean) => {
    if (selectedMarkets.length === 0) return;
    try {
      await marketService.bulkUpdateMarketStatus(
        selectedMarkets.map((m) => m.id),
        isActive,
      );
      toast.success(
        `${selectedMarkets.length} market(s) ${isActive ? "activated" : "deactivated"}`,
      );
      setSelectedMarkets([]);
      fetchMarkets();
    } catch {
      toast.error("Failed to update markets");
    }
  };

  const handleBulkDeleteMarkets = async () => {
    if (selectedMarkets.length === 0) return;
    setBulkActionLoading(true);
    try {
      await marketService.bulkDeleteMarkets(
        selectedMarkets.map((m) => m.id),
      );
      toast.success(`${selectedMarkets.length} market(s) deleted`);
      setSelectedMarkets([]);
      setShowBulkDeleteMarkets(false);
      fetchMarkets();
    } catch {
      toast.error("Failed to delete markets");
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkDeletePrices = async () => {
    if (selectedPrices.length === 0) return;
    setBulkActionLoading(true);
    try {
      await marketService.bulkDeletePriceHistory(
        selectedPrices.map((p) => p.id),
      );
      toast.success(`${selectedPrices.length} price record(s) deleted`);
      setSelectedPrices([]);
      setShowBulkDeletePrices(false);
      fetchPriceHistory();
      fetchPricesByProduct();
    } catch {
      toast.error("Failed to delete price records");
    } finally {
      setBulkActionLoading(false);
    }
  };

  const marketColumns: ColumnDef<Market>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "nbr",
      header: "Nbr",
      cell: ({ row }) => (
        <span className="text-sm text-gray-600">
          {row.index + 1 + (pagination.page - 1) * pagination.limit}
        </span>
      ),
    },
    { accessorKey: "name", header: "Market Name" },
    { accessorKey: "location", header: "Location" },
    { accessorKey: "province", header: "Province" },
    { accessorKey: "district", header: "District" },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => (
        <button
          onClick={() => handleToggleActive(row.original)}
          className={`px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${
            row.original.isActive
              ? "bg-green-100 text-green-700 hover:bg-green-200"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
          }`}
        >
          {row.original.isActive ? "Active" : "Inactive"}
        </button>
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
        <div className="flex gap-1">
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
              } catch {
                toast.error("Failed to delete market");
              }
            }}
            className="h-7 px-2 text-xs text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  // Transform comparison data to show markets as columns
  const transformComparisonData = () => {
    const productMap = new Map<string, any>();

    pricesByProduct.forEach((item) => {
      const productId = item.product.id;
      const marketName = item.market.name;

      if (!productMap.has(productId)) {
        productMap.set(productId, {
          product: item.product.name,
          foodbundles: item.ourPrice,
          markets: {},
          priceRecords: {},
          id: productId,
        });
      }

      const product = productMap.get(productId);
      product.markets[marketName] = item.marketPrice;
      product.priceRecords[marketName] = item;
    });

    return Array.from(productMap.values());
  };

  const comparisonMarketNames = Array.from(
    new Set(pricesByProduct.map((p) => p.market.name)),
  );

  const comparisonColumns: ColumnDef<any>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "nbr",
      header: "Nbr",
      cell: ({ row }) => (
        <span className="text-sm text-gray-600">{row.index + 1}</span>
      ),
    },
    {
      accessorKey: "product",
      header: "Product",
      cell: ({ row }) => (
        <span className="font-medium text-gray-900">
          {row.original.product}
        </span>
      ),
    },
    {
      accessorKey: "foodbundles",
      header: "FoodBundles",
      cell: ({ row }) => {
        const allPrices = [
          row.original.foodbundles,
          ...Object.values(row.original.markets),
        ];
        const minPrice = Math.min(...allPrices);
        return (
          <span
            className={`${row.original.foodbundles === minPrice ? "text-green-700 font-bold" : "text-gray-700"}`}
          >
            {row.original.foodbundles.toLocaleString()} RWF
          </span>
        );
      },
    },
    ...comparisonMarketNames.map((marketName) => ({
      accessorKey: `markets.${marketName}`,
      header: marketName,
      accessorFn: (row: any) => row.markets[marketName],
      cell: ({ row }: any) => {
        const price = row.original.markets[marketName];
        const record = row.original.priceRecords[marketName];
        if (!price) return <span className="text-gray-400">—</span>;
        const allPrices = [
          row.original.foodbundles,
          ...Object.values(row.original.markets),
        ];
        const minPrice = Math.min(...allPrices);
        const diff = price - row.original.foodbundles;
        return (
          <div className="space-y-0.5">
            <div className="flex items-center gap-1">
              <span
                className={`${price === minPrice ? "text-orange-600 font-bold" : "text-gray-700"}`}
              >
                {price.toLocaleString()} RWF
              </span>
              {record && (
                <div className="flex gap-0.5">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingPrice(record as any)}
                    className="h-5 w-5 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={async () => {
                      if (!confirm("Delete this price record?")) return;
                      try {
                        await marketService.deleteMarketPriceHistory(record.id);
                        toast.success("Price record deleted");
                        fetchPricesByProduct();
                        fetchPriceHistory();
                      } catch {
                        toast.error("Failed to delete");
                      }
                    }}
                    className="h-5 w-5 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>
            <div
              className={`text-xs ${diff > 0 ? "text-red-600" : "text-green-600"}`}
            >
              {diff > 0 ? "+" : ""}
              {diff.toLocaleString()} RWF
            </div>
          </div>
        );
      },
    })),
  ];

  const priceColumns: ColumnDef<PriceHistory>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "nbr",
      header: "#",
      cell: ({ row }) => (
        <span className="text-sm text-gray-600">
          {row.index + 1 + (pagination.page - 1) * pagination.limit}
        </span>
      ),
    },
    {
      accessorFn: (row) => row.market.name,
      id: "market",
      header: "Market",
      cell: ({ row }) => (
        <span className="font-medium text-gray-900">
          {row.original.market.name}
        </span>
      ),
    },
    {
      accessorFn: (row) => row.product.productName,
      id: "product",
      header: "Product",
      cell: ({ row }) => (
        <span className="text-gray-700">
          {row.original.product.productName}
        </span>
      ),
    },
    {
      accessorKey: "ourPrice",
      header: "Our Price",
      cell: ({ row }) => (
        <span className="text-gray-700">
          {row.original.ourPrice.toLocaleString()} RWF
        </span>
      ),
    },
    {
      accessorKey: "marketPrice",
      header: "Market Price",
      cell: ({ row }) => (
        <span className="font-medium text-gray-900">
          {row.original.marketPrice.toLocaleString()} RWF
        </span>
      ),
    },
    {
      id: "difference",
      header: "Difference",
      cell: ({ row }) => {
        const diff = row.original.marketPrice - row.original.ourPrice;
        const isLower = diff > 0;
        return (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
              isLower
                ? "bg-green-100 text-green-700"
                : diff < 0
                  ? "bg-red-100 text-red-700"
                  : "bg-gray-100 text-gray-600"
            }`}
          >
            {diff > 0 ? "+" : ""}
            {diff.toLocaleString()} RWF
          </span>
        );
      },
    },
    {
      accessorKey: "recordedDate",
      header: "Date Recorded",
      cell: ({ row }) => (
        <span className="text-gray-600">
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
        <div className="flex gap-1">
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
              } catch {
                toast.error("Failed to delete");
              }
            }}
            className="h-7 px-2 text-xs text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-2 space-y-2">
      {/* Header — same structure as Subscription Management */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[15px] font-medium text-gray-900">
            Market Price Comparison
          </h1>
        </div>
      </div>

      {/* Tabs — same structure & classes as Subscription Management */}
      <div className="border-b">
        <nav className="-mb-px flex space-x-8">
          {(["markets", "prices", "analysis", "comparison"] as const).map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-gray-700 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab === "markets"
                  ? "Markets"
                  : tab === "prices"
                    ? "Price History"
                    : tab === "analysis"
                      ? "Analysis"
                      : "Comparison"}
              </button>
            ),
          )}
        </nav>
      </div>

      {/* Markets Tab */}
      {activeTab === "markets" && (
        <DataTable
          columns={marketColumns}
          data={markets.filter(
            (m) =>
              m.name.toLowerCase().includes(marketSearch.toLowerCase()) ||
              m.location.toLowerCase().includes(marketSearch.toLowerCase()) ||
              m.district.toLowerCase().includes(marketSearch.toLowerCase()) ||
              m.province.toLowerCase().includes(marketSearch.toLowerCase()),
          )}
          showPagination={true}
          showSearch={false}
          pagination={pagination}
          onPaginationChange={(page, limit) =>
            setPagination((prev) => ({ ...prev, page, limit }))
          }
          isLoading={loading}
          onSelectionChange={(rows) => setSelectedMarkets(rows as Market[])}
          customFilters={
            <div className="flex items-center justify-between w-full">
              {/* Search — left side */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <svg
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search markets..."
                    value={marketSearch}
                    onChange={(e) => setMarketSearch(e.target.value)}
                    className="pl-8 pr-3 h-8 w-80 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                {selectedMarkets.length > 0 && (
                  <div className="flex items-center gap-1.5 ml-2">
                    <span className="text-xs text-gray-500 font-medium">
                      {selectedMarkets.length} selected
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs border-gray-300"
                      onClick={() => handleBulkToggleActive(true)}
                    >
                      Activate
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs border-gray-300"
                      onClick={() => handleBulkToggleActive(false)}
                    >
                      Deactivate
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs border-red-300 text-red-600 hover:bg-red-50"
                      onClick={() => setShowBulkDeleteMarkets(true)}
                    >
                      <Trash2 className="w-3 h-3 mr-1" /> Delete
                    </Button>
                  </div>
                )}
              </div>
              {/* Export buttons — right side, next to Columns button */}
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => handleExport("markets", "csv")}
                  variant="outline"
                  size="sm"
                  className="text-xs h-8 border-green-600 text-green-700 hover:bg-green-50"
                >
                  <Download className="w-3 h-3 mr-1" /> CSV
                </Button>
                <Button
                  onClick={() => handleExport("markets", "excel")}
                  variant="outline"
                  size="sm"
                  className="text-xs h-8 border-green-600 text-green-700 hover:bg-green-50"
                >
                  <Download className="w-3 h-3 mr-1" /> Excel
                </Button>
              </div>
            </div>
          }
        />
      )}

      {/* Prices Tab */}
      {activeTab === "prices" && (
        <DataTable
          columns={priceColumns}
          data={priceHistory.filter((item) => {
            const matchesSearch =
              item.market.name
                .toLowerCase()
                .includes(priceSearch.toLowerCase()) ||
              item.product.productName
                .toLowerCase()
                .includes(priceSearch.toLowerCase());
            const matchesMarket =
              priceMarketFilter === "all" ||
              item.market.id === priceMarketFilter;
            const itemDate = new Date(item.recordedDate);
            const matchesDateFrom =
              !priceDateFrom || itemDate >= new Date(priceDateFrom);
            const matchesDateTo =
              !priceDateTo || itemDate <= new Date(priceDateTo + "T23:59:59");
            return matchesSearch && matchesMarket && matchesDateFrom && matchesDateTo;
          })}
          showPagination={true}
          showSearch={false}
          pagination={pagination}
          onPaginationChange={(page, limit) =>
            setPagination((prev) => ({ ...prev, page, limit }))
          }
          isLoading={loading}
          onSelectionChange={(rows) => setSelectedPrices(rows as PriceHistory[])}
          customFilters={
            <div className="flex flex-col gap-2 w-full">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <svg
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search by market or product..."
                      value={priceSearch}
                      onChange={(e) => setPriceSearch(e.target.value)}
                      className="pl-8 pr-3 h-8 w-64 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <Select
                    value={priceMarketFilter}
                    onValueChange={setPriceMarketFilter}
                  >
                    <SelectTrigger className="h-8 w-44 text-xs">
                      <SelectValue placeholder="All Markets" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="text-xs">All Markets</SelectItem>
                      {markets.map((m) => (
                        <SelectItem key={m.id} value={m.id} className="text-xs">
                          {m.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <input
                    type="date"
                    value={priceDateFrom}
                    onChange={(e) => setPriceDateFrom(e.target.value)}
                    placeholder="From date"
                    className="h-8 px-2 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                  />
                  <span className="text-gray-400 text-xs">to</span>
                  <input
                    type="date"
                    value={priceDateTo}
                    onChange={(e) => setPriceDateTo(e.target.value)}
                    placeholder="To date"
                    className="h-8 px-2 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                  />
                  {(priceMarketFilter !== "all" || priceDateFrom || priceDateTo) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-xs text-gray-500 hover:text-gray-700"
                      onClick={() => {
                        setPriceMarketFilter("all");
                        setPriceDateFrom("");
                        setPriceDateTo("");
                      }}
                    >
                      Clear filters
                    </Button>
                  )}
                </div>
              <div className="flex items-center gap-2">
                {selectedPrices.length > 0 && (
                  <div className="flex items-center gap-1.5 mr-2">
                    <span className="text-xs text-gray-500 font-medium">
                      {selectedPrices.length} selected
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs border-red-300 text-red-600 hover:bg-red-50"
                      onClick={() => setShowBulkDeletePrices(true)}
                    >
                      <Trash2 className="w-3 h-3 mr-1" /> Delete
                    </Button>
                  </div>
                )}
                <Button
                  onClick={() => setShowRecordPriceModal(true)}
                  className="bg-green-700 hover:bg-green-600 text-white"
                  size="sm"
                >
                  <Plus className="w-3 h-3 mr-1" /> Record Price
                </Button>
                  <Button
                    onClick={() => handleExport("prices", "csv")}
                    variant="outline"
                    size="sm"
                    className="text-xs h-8 border-green-600 text-green-700 hover:bg-green-50"
                  >
                    <Download className="w-3 h-3 mr-1" /> CSV
                  </Button>
                  <Button
                    onClick={() => handleExport("prices", "excel")}
                    variant="outline"
                    size="sm"
                    className="text-xs h-8 border-green-600 text-green-700 hover:bg-green-50"
                  >
                    <Download className="w-3 h-3 mr-1" /> Excel
                  </Button>
                </div>
              </div>
            </div>
          }
        />
      )}

      {/* Analysis Tab */}
      {activeTab === "analysis" && (
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">
                Product
              </Label>
              <Select value={productId} onValueChange={setProductId}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem
                      key={product.id}
                      value={product.id}
                      className="text-sm"
                    >
                      {product.productName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">
                Start Date
              </Label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full h-9 px-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">
                End Date
              </Label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full h-9 px-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
          <Button
            variant="green"
            onClick={handleAnalyze}
            disabled={analysisLoading}
            className="text-xs"
          >
            {analysisLoading ? "Analyzing..." : "Generate Analysis"}
          </Button>

          {analysis &&
            analysis.analysis &&
            analysis.analysis.totalRecords > 0 && (
              <div className="space-y-6 pt-2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs text-gray-600 font-medium">
                      Avg Our Price
                    </p>
                    <p className="text-xl font-bold text-blue-700 mt-1">
                      {(analysis.analysis.avgOurPrice || 0).toLocaleString()}{" "}
                      RWF
                    </p>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-xs text-gray-600 font-medium">
                      Avg Market Price
                    </p>
                    <p className="text-xl font-bold text-red-700 mt-1">
                      {(analysis.analysis.avgMarketPrice || 0).toLocaleString()}{" "}
                      RWF
                    </p>
                  </div>
                  <div
                    className={`p-4 rounded-lg border ${
                      analysis.analysis.profitLoss === "PROFIT"
                        ? "bg-green-50 border-green-200"
                        : "bg-red-50 border-red-200"
                    }`}
                  >
                    <p className="text-xs text-gray-600 font-medium">
                      Price Gap
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {analysis.analysis.profitLoss === "PROFIT" ? (
                        <TrendingDown className="w-4 h-4 text-green-600" />
                      ) : (
                        <TrendingUp className="w-4 h-4 text-red-600" />
                      )}
                      <p
                        className={`text-xl font-bold ${analysis.analysis.profitLoss === "PROFIT" ? "text-green-700" : "text-red-700"}`}
                      >
                        {Math.abs(
                          analysis.analysis.avgDifference || 0,
                        ).toLocaleString()}{" "}
                        RWF
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {(analysis.analysis.percentageDifference || 0).toFixed(2)}
                      %
                    </p>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">
                    Price Trend
                  </h3>
                  <PriceComparisonChart data={analysis} />
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">
                    Market Breakdown
                  </h3>
                  <div className="space-y-2">
                    {analysis.marketBreakdown?.map((market) => (
                      <div
                        key={market.market.id}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-100 hover:bg-gray-100 transition-colors"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {market.market.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {market.market.district}, {market.market.province}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {(market.avgMarketPrice || 0).toLocaleString()} RWF
                          </p>
                          <p
                            className={`text-xs font-medium ${market.profitLoss === "PROFIT" ? "text-green-600" : "text-red-600"}`}
                          >
                            {(market.percentageDifference || 0).toFixed(2)}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          {analysis &&
            analysis.analysis &&
            analysis.analysis.totalRecords === 0 && (
              <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                <p className="text-sm text-yellow-800">
                  No price data available for the selected period
                </p>
              </div>
            )}
        </div>
      )}

      {/* Comparison Tab */}
      {activeTab === "comparison" && (
        <DataTable
          columns={comparisonColumns}
          data={transformComparisonData().filter((item) =>
            item.product.toLowerCase().includes(comparisonSearch.toLowerCase()),
          )}
          showPagination={false}
          showSearch={false}
          isLoading={loading}
          onSelectionChange={(rows) => setSelectedComparison(rows)}
          customFilters={
            <div className="flex items-center justify-between w-full">
              <div className="relative">
                <svg
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={comparisonSearch}
                  onChange={(e) => setComparisonSearch(e.target.value)}
                  className="pl-8 pr-3 h-8 w-80 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              {selectedComparison.length > 0 && (
                <span className="text-xs text-gray-500 font-medium ml-2">
                  {selectedComparison.length} selected
                </span>
              )}
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => handleExport("comparison", "csv")}
                  variant="outline"
                  size="sm"
                  className="text-xs h-8 border-green-600 text-green-700 hover:bg-green-50"
                >
                  <Download className="w-3 h-3 mr-1" /> CSV
                </Button>
                <Button
                  onClick={() => handleExport("comparison", "excel")}
                  variant="outline"
                  size="sm"
                  className="text-xs h-8 border-green-600 text-green-700 hover:bg-green-50"
                >
                  <Download className="w-3 h-3 mr-1" /> Excel
                </Button>
              </div>
            </div>
          }
        />
      )}

      {/* Modals */}
      <RecordPriceModal
        isOpen={showRecordPriceModal}
        onClose={() => setShowRecordPriceModal(false)}
        onSuccess={fetchPriceHistory}
        markets={markets}
      />

      {/* Edit Price Modal */}
      {editingPrice && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-[15px] font-medium text-gray-900 mb-4">
              Update Market Price
            </h3>
            <div className="space-y-4">
              <div>
                <Label className="text-sm text-gray-700">Product</Label>
                <p className="text-sm text-gray-900 font-medium mt-0.5">
                  {(editingPrice.product as any).name ||
                    (editingPrice.product as any).productName ||
                    "—"}
                </p>
              </div>
              <div>
                <Label className="text-sm text-gray-700">Market</Label>
                <p className="text-sm text-gray-900 font-medium mt-0.5">
                  {editingPrice.market.name}
                </p>
              </div>
              <div>
                <Label className="text-sm text-gray-700">
                  Market Price (RWF)
                </Label>
                <input
                  type="number"
                  defaultValue={editingPrice.marketPrice}
                  id="newPrice"
                  className="w-full mt-1 h-9 px-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingPrice(null)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  variant="green"
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    const el = document.getElementById(
                      "newPrice",
                    ) as HTMLInputElement;
                    const val = parseFloat(el.value);
                    if (!isNaN(val)) handleUpdatePrice(editingPrice.id, val);
                  }}
                >
                  Update Price
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Market Modal */}
      {editingMarket && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-[15px] font-medium text-gray-900 mb-4">
              Update Market Details
            </h3>
            <div className="space-y-4">
              <div>
                <Label className="text-sm text-gray-700">Market Name</Label>
                <input
                  type="text"
                  defaultValue={editingMarket.name}
                  id="edit_market_name"
                  className="w-full mt-1 h-9 px-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              </div>
              <div>
                <Label className="text-sm text-gray-700">Location</Label>
                <input
                  type="text"
                  defaultValue={editingMarket.location}
                  id="edit_market_location"
                  className="w-full mt-1 h-9 px-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm text-gray-700">Province</Label>
                  <input
                    type="text"
                    defaultValue={editingMarket.province}
                    id="edit_market_province"
                    className="w-full mt-1 h-9 px-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                  />
                </div>
                <div>
                  <Label className="text-sm text-gray-700">District</Label>
                  <input
                    type="text"
                    defaultValue={editingMarket.district}
                    id="edit_market_district"
                    className="w-full mt-1 h-9 px-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingMarket(null)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  variant="green"
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    const name = (
                      document.getElementById(
                        "edit_market_name",
                      ) as HTMLInputElement
                    ).value;
                    const location = (
                      document.getElementById(
                        "edit_market_location",
                      ) as HTMLInputElement
                    ).value;
                    const province = (
                      document.getElementById(
                        "edit_market_province",
                      ) as HTMLInputElement
                    ).value;
                    const district = (
                      document.getElementById(
                        "edit_market_district",
                      ) as HTMLInputElement
                    ).value;
                    handleUpdateMarket(editingMarket.id, {
                      name,
                      location,
                      province,
                      district,
                    });
                  }}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Markets Confirmation Modal */}
      <ModalShell open={showBulkDeleteMarkets} onClose={() => setShowBulkDeleteMarkets(false)}>
        <ModalHeader
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          }
          title="Delete Markets"
          subtitle={`This will permanently delete ${selectedMarkets.length} market(s) and all their price history.`}
          onClose={() => setShowBulkDeleteMarkets(false)}
          danger
        />
        <div className="px-6 py-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to delete {selectedMarkets.length} market(s)? This action cannot be undone.
          </p>
        </div>
        <div className="px-6 pb-5">
          <ModalActions
            onCancel={() => setShowBulkDeleteMarkets(false)}
            onConfirm={handleBulkDeleteMarkets}
            confirmLabel={`Delete ${selectedMarkets.length} market(s)`}
            loading={bulkActionLoading}
            danger
          />
        </div>
      </ModalShell>

      {/* Bulk Delete Prices Confirmation Modal */}
      <ModalShell open={showBulkDeletePrices} onClose={() => setShowBulkDeletePrices(false)}>
        <ModalHeader
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          }
          title="Delete Price Records"
          subtitle={`This will permanently delete ${selectedPrices.length} price record(s).`}
          onClose={() => setShowBulkDeletePrices(false)}
          danger
        />
        <div className="px-6 py-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to delete {selectedPrices.length} price record(s)? This action cannot be undone.
          </p>
        </div>
        <div className="px-6 pb-5">
          <ModalActions
            onCancel={() => setShowBulkDeletePrices(false)}
            onConfirm={handleBulkDeletePrices}
            confirmLabel={`Delete ${selectedPrices.length} record(s)`}
            loading={bulkActionLoading}
            danger
          />
        </div>
      </ModalShell>
    </div>
  );
}
