"use client";

import { useState, useEffect } from "react";
import { Plus, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ProductSubmissionModal from "./product-submission-modal";
import { Product } from "./product-context";
import { SubmissionDetailsModal } from "./submission-details-modal";
import { SubmissionsTable } from "./SubmissionsTable";
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
import { showToast } from "@/lib/toast";
import { getStatusColor, deriveDisplayStatus } from "./status-helpers";

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

export default function ProductManagement() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [viewProduct, setViewProduct] = useState<Product | null>(null);

  // Dashboard analytics state
  const [earnings, setEarnings] = useState<EarningsSummary | null>(null);
  const [trends, setTrends] = useState<EarningsTimeSeriesPoint[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [activity, setActivity] = useState<RecentActivityItem[]>([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

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

        <SubmissionsTable
          products={products}
          loading={loading}
          onViewDetails={handleViewDetails}
        />
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
