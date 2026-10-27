"use client";

import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ProductSubmissionModal from "../_components/product-submission-modal";
import { Product } from "../_components/product-context";
import { SubmissionDetailsModal } from "../_components/submission-details-modal";
import { SubmissionsTable } from "../_components/SubmissionsTable";
import {
  productSubmissionService,
  Submission,
} from "@/app/services/productSubmissionService";
import { deriveDisplayStatus, getStatusColor } from "../_components/status-helpers";

function transformSubmissionToProduct(submission: Submission): Product {
  const locationParts = [
    submission.village,
    submission.cell,
    submission.sector,
  ].filter(Boolean);

  const location =
    locationParts.length > 0 ? locationParts.join(", ") : "Rwanda";

  const displayStatus = deriveDisplayStatus(
    submission.status,
    submission.farmerFeedbackStatus
  );

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
}

export default function FarmerSubmissionsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [viewProduct, setViewProduct] = useState<Product | null>(null);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      setError(null);
      const submissions = await productSubmissionService.getSubmissionHistory();
      setProducts(submissions.map(transformSubmissionToProduct));
    } catch (err) {
      console.error("Failed to fetch submissions:", err);
      setError("Failed to load submissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleProductSubmit = async () => {
    try {
      await fetchSubmissions();
      setShowSubmissionModal(false);
    } catch (error) {
      console.error("Error refreshing submissions:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Submissions
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            View and manage every product submission you have made.
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <SubmissionsTable
          products={products}
          loading={loading}
          onViewDetails={setViewProduct}
          onCreateSubmission={() => setShowSubmissionModal(true)}
          showCreateButton
        />
      </main>

      <ProductSubmissionModal
        isOpen={showSubmissionModal}
        onClose={() => setShowSubmissionModal(false)}
        onSubmit={handleProductSubmit}
      />

      <SubmissionDetailsModal
        product={viewProduct}
        onClose={() => setViewProduct(null)}
        getStatusColor={getStatusColor}
        onFeedbackSubmitted={fetchSubmissions}
      />
    </div>
  );
}
