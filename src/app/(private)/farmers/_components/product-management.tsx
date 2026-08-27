"use client";

import { useState, useEffect } from "react";
import { Plus, LayoutGrid, Table2, List as ListIcon, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductSubmissionModal from "./product-submission-modal";
import { productColumns } from "./product-columns";
import { DataTable } from "@/components/data-table";
import { Product } from "./product-context";
import { SubmissionCardGrid } from "./submission-card-grid";
import { SubmissionList } from "./submission-list";
import { SubmissionDetailsModal } from "./submission-details-modal";
import { ViewModeToggle } from "@/components/view-mode-toggle";
import { DashboardStatGrid } from "./dashboard/dashboard-stat-grid";
import { SubmissionsTrendChart } from "./dashboard/submissions-trend-chart";
import { TopProductsChart } from "./dashboard/top-products-chart";
import { StatusBreakdownChart } from "./dashboard/status-breakdown-chart";
import { RecentActivityFeed } from "./dashboard/recent-activity-feed";
import {
  productSubmissionService,
  Submission,
} from "@/app/services/productSubmissionService";
import { farmerDashboardService } from "@/app/services/farmerDashboardService";
import { useAuth } from "@/app/contexts/auth-context";
import type {
  EarningsSummary,
  EarningsTimeSeriesPoint,
  TopProduct,
  RecentActivityItem,
} from "@/app/types/farmer-dashboard";
import {
  TableFilters,
  FilterConfig,
  createCommonFilters,
} from "@/components/filters";
import { showToast } from "@/lib/toast";

type ViewMode = "cards" | "table" | "list";

// Status color mapping function
const getStatusColor = (status: string): string => {
  switch (status) {
    case "APPROVED":
    case "PAID":
    case "Approved":
      return "bg-green-100 text-green-800";
    case "PENDING":
    case "Pending":
      return "bg-yellow-100 text-yellow-800";
    case "VERIFIED":
    case "Verified":
      return "bg-blue-100 text-blue-800";
    case "REJECTED":
    case "Rejected":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

/** The submission's real DB status never becomes "REJECTED" — a farmer's rejection of a
 * verified offer lives on farmerFeedbackStatus while status itself stays VERIFIED. This
 * derives the label the farmer should actually see, without touching the real status. */
export const deriveDisplayStatus = (
  status: string,
  farmerFeedbackStatus: string | null,
): string => (farmerFeedbackStatus === "REJECTED" ? "REJECTED" : status);

// Transform database submission to Product format
const transformSubmissionToProduct = (submission: Submission): Product => {
  const locationParts = [
    submission.village,
    submission.cell,
    submission.sector,
  ].filter(Boolean);

  const location =
    locationParts.length > 0 ? locationParts.join(", ") : "Rwanda";

  const displayStatus = deriveDisplayStatus(submission.status, submission.farmerFeedbackStatus);

  return {
    id: submission.id,
    name: submission.productName,
    category: submission.category || { id: "general", name: "General" },
    quantity: `${submission.submittedQty}`,
    unit: submission.unit,
    submittedDate: new Date(submission.submittedAt).toLocaleDateString(),
    price: `RWF ${submission.wishedPrice.toLocaleString()}`,
    status: submission.status,
    statusColor: getStatusColor(displayStatus),
    displayStatus,
    image: "/placeholder.svg?height=48&width=48&text=Product",
    location,
    priceValue: submission.wishedPrice,
    acceptedQty: submission.acceptedQty,
    acceptedPrice: submission.acceptedPrice,
    farmerFeedbackStatus: submission.farmerFeedbackStatus,
    feedbackDeadline: submission.feedbackDeadline,
  };
};

const VIEW_MODE_OPTIONS = [
  { value: "table" as const, label: "Table", icon: Table2 },
  { value: "cards" as const, label: "Cards", icon: LayoutGrid },
  { value: "list" as const, label: "List", icon: ListIcon },
];

export default function ProductManagement() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewProduct, setViewProduct] = useState<Product | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  // Dashboard analytics state
  const [earnings, setEarnings] = useState<EarningsSummary | null>(null);
  const [trends, setTrends] = useState<EarningsTimeSeriesPoint[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [activity, setActivity] = useState<RecentActivityItem[]>([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  const statusOptions = [
    { label: "All", value: "All" },
    { label: "PENDING", value: "PENDING" },
    { label: "VERIFIED", value: "VERIFIED" },
    { label: "APPROVED", value: "APPROVED" },
    { label: "REJECTED", value: "REJECTED" },
    { label: "PAID", value: "PAID" },
  ];

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      setError(null);
      const submissions = await productSubmissionService.getSubmissionHistory();
      const transformedProducts = submissions.map(transformSubmissionToProduct);
      setProducts(transformedProducts);
    } catch (err) {
      console.error("Failed to fetch submissions:", err);
      setError("Failed to load submissions");
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    const results = await Promise.allSettled([
      farmerDashboardService.getEarningsSummary(),
      farmerDashboardService.getEarningsTimeSeries(6),
      farmerDashboardService.getPerformance(),
      farmerDashboardService.getRecentActivity(),
    ]);

    if (results[0].status === "fulfilled") setEarnings(results[0].value);
    if (results[1].status === "fulfilled") setTrends(results[1].value);
    if (results[2].status === "fulfilled") setTopProducts(results[2].value.topProducts);
    if (results[3].status === "fulfilled") setActivity(results[3].value);

    setAnalyticsLoading(false);
  };

  useEffect(() => {
    fetchSubmissions();
    fetchAnalytics();
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesStatus =
      selectedStatus === "All" || product.status === selectedStatus;
    const matchesDate =
      !dateFilter ||
      product.submittedDate.includes(dateFilter.toLocaleDateString());
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (typeof product.category === "string" ? product.category : product.category.name)
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      product.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesDate && matchesSearch;
  });

  const handleProductSubmit = async () => {
    // ProductSubmissionModal already performs the actual submitProduct() call
    // and shows its own success toast before invoking onSubmit — this handler
    // only needs to refresh the list and close the modal, not resubmit.
    try {
      await fetchSubmissions();
      fetchAnalytics();
      setShowSubmissionModal(false);
    } catch (error) {
      console.error("Error refreshing submissions:", error);
      showToast("error", "Submitted, but failed to refresh the list. Please reload.");
    }
  };

  const handleViewDetails = (product: Product | null) => {
    setViewProduct(product);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedStatus("All");
    setDateFilter(undefined);
  };

  // Create filter configurations
  const filters: FilterConfig[] = [
    createCommonFilters.search(
      searchTerm,
      setSearchTerm,
      "Search products, categories, or locations..."
    ),
    createCommonFilters.status(selectedStatus, setSelectedStatus, statusOptions),
    createCommonFilters.date(dateFilter, setDateFilter, "Date Filter"),
  ];

  const firstName = user?.name?.split(" ")[0];

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              {firstName ? `Welcome back, ${firstName}` : "Your dashboard"}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Track your submissions, offers, and earnings in one place.
            </p>
          </div>
          <Button
            onClick={() => setShowSubmissionModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white"
            disabled={loading}
          >
            <Plus className="w-4 h-4 mr-2" />
            Submit Product
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="overview" className="gap-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <DashboardStatGrid products={products} earnings={earnings} loading={loading} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <SubmissionsTrendChart data={trends} metric="submissions" loading={analyticsLoading} />
              <SubmissionsTrendChart data={trends} metric="earnings" loading={analyticsLoading} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <TopProductsChart data={topProducts} loading={analyticsLoading} />
              <StatusBreakdownChart products={products} loading={loading} />
            </div>
            <RecentActivityFeed items={activity} loading={analyticsLoading} />
          </TabsContent>

          <TabsContent value="products" className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h2 className="text-base font-semibold text-gray-900">Your submissions</h2>
                <ViewModeToggle value={viewMode} onChange={setViewMode} options={VIEW_MODE_OPTIONS} />
              </div>

              <div>
                <TableFilters
                  filters={filters}
                  className="flex-col sm:flex-row items-stretch sm:items-center"
                />
                {(searchTerm || selectedStatus !== "All" || dateFilter) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearFilters}
                    className="mt-4 text-red-600 hover:text-red-700 w-full sm:w-auto"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>

              {viewMode === "table" && (
                <DataTable
                  columns={productColumns(handleViewDetails)}
                  data={filteredProducts}
                  title=""
                  showExport={false}
                  showSearch={false}
                  showColumnVisibility={true}
                  showPagination={true}
                  showRowSelection={false}
                />
              )}
              {viewMode === "cards" && (
                <SubmissionCardGrid products={filteredProducts} onViewDetails={handleViewDetails} />
              )}
              {viewMode === "list" && (
                <SubmissionList products={filteredProducts} onViewDetails={handleViewDetails} />
              )}

              {filteredProducts.length === 0 && !loading && (
                <div className="text-center py-8">
                  <p className="text-gray-600">No products found.</p>
                  <Button onClick={handleClearFilters} variant="outline" className="mt-4">
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Product Submission Modal */}
      <ProductSubmissionModal
        isOpen={showSubmissionModal}
        onClose={() => setShowSubmissionModal(false)}
        onSubmit={handleProductSubmit}
      />

      {/* Product Details Modal */}
      <SubmissionDetailsModal
        product={viewProduct}
        onClose={() => setViewProduct(null)}
        getStatusColor={getStatusColor}
        onFeedbackSubmitted={fetchSubmissions}
      />
    </div>
  );
}
