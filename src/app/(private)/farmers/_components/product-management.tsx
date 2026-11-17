"use client";

import { useState, useEffect, useMemo, useSyncExternalStore } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, AlertCircle, Sprout } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ProductSubmissionModal from "./product-submission-modal";
import { recentFromProducts } from "./recent-submissions";
import { Product } from "./product-context";
import { SubmissionDetailsModal } from "./submission-details-modal";
import { SubmissionsTable } from "./SubmissionsTable";
import { FarmerSummaryCards } from "./dashboard/farmer-summary-cards";
import { FarmerActivityChart } from "./dashboard/farmer-activity-chart";
import { BuyingOffers } from "./dashboard/buying-offers";
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
    counterOfferPrice: submission.counterOfferPrice ?? null,
    agreedPrice: submission.agreedPrice ?? null,
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
  const router = useRouter();
  const searchParams = useSearchParams();

  // "Submit produce" in the sidebar opens the form: /farmers?submit=1
  useEffect(() => {
    if (searchParams.get("submit") === "1") {
      setShowSubmissionModal(true);
      router.replace("/farmers", { scroll: false });
    }
  }, [searchParams, router]);

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

  // The user comes from the browser: use their name only once the page runs there
  const inBrowser = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const firstName = inBrowser ? user?.name?.split(" ")[0] : undefined;

  // "Submit again": the farmer's latest different products, newest first
  const recent = useMemo(() => recentFromProducts(products), [products]);

  return (
    <div>
      <main className="space-y-6">
        {/* Sell your produce: the main thing farmers come to do */}
        <section className="relative overflow-hidden rounded-[22px] bg-[#0B2E1F] p-5 text-white sm:p-7">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{ background: "radial-gradient(circle at 0% 0%, #00D04855 0, transparent 50%), radial-gradient(circle at 100% 100%, #18A0A044 0, transparent 50%)" }}
          />
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="m-0 text-[13px] font-bold uppercase tracking-[1.2px] text-[#7CF2A6]">
                {firstName ? `Welcome back, ${firstName}` : "Welcome"}
              </p>
              <h2 className="m-0 mt-2 text-[clamp(26px,3.4vw,36px)] font-bold leading-tight tracking-[-0.8px] [font-family:var(--font-inter-tight),sans-serif]">
                Have produce to sell?
              </h2>
              <p className="m-0 mt-1.5 max-w-[520px] text-[15px] text-[#E4F5EA]">
                Tell us what you have and your price. We buy it at the farm gate and pay you by Mobile Money.
              </p>
            </div>
            <div className="flex flex-col gap-2.5 lg:items-end">
              <button
                type="button"
                onClick={() => setShowSubmissionModal(true)}
                disabled={loading}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#00D048] px-6 text-[16px] font-bold text-[#0B2E1F] shadow-[0_12px_30px_-12px_#00D048] transition-colors hover:bg-[#7CF2A6] disabled:opacity-60 cursor-pointer"
              >
                <Plus className="h-5 w-5" /> Submit produce
              </button>
              {recent.length > 0 && (
                <p className="m-0 flex items-center gap-1.5 text-[13px] text-white/70">
                  <Sprout className="h-3.5 w-3.5" /> Last time: {recent.slice(0, 3).map((r) => r.productName).join(", ")}
                </p>
              )}
            </div>
          </div>
        </section>

        {error && (
          <Alert variant="destructive">
            <AlertCircle />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Buying offers (aggregators' supply requests) come first */}
        <BuyingOffers
          onSubmitted={() => {
            fetchSubmissions();
            fetchAnalytics();
          }}
        />

        {/* Everything important at a glance: earnings, submissions, performance */}
        <FarmerSummaryCards
          products={products}
          earnings={earnings}
          farmerName={user?.name}
          loading={loading}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <FarmerActivityChart data={trends} loading={analyticsLoading} />
          </div>
          <StatusBreakdownChart products={products} loading={loading} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TopProductsChart data={topProducts} loading={analyticsLoading} />
          <RecentActivityFeed items={activity} loading={analyticsLoading} />
        </div>

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
        recent={recent}
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
