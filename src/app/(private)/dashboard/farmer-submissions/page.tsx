/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useMemo, useEffect } from "react";
import {
  createCommonFilters,
  TableFilters,
} from "../../../../components/filters";
import { DataTable } from "@/components/data-table";
import { toast } from "sonner";
import {
  FarmerSubmission,
  SubmissionResponse,
  useSubmissions,
} from "@/app/contexts/submission-context";
import { useAuth } from "@/app/contexts/auth-context";
import { getAdminSubmissionColumns } from "./_components/farmer-submissions-columns";
import { ProductVerificationModal } from "../_components/productVerificationModal";
import { ConfirmationDialogProps } from "./_components/ApprovalConfirmationDialog";
import { X } from "lucide-react";
import { submissionService } from "@/app/services/submissionServices";
import {
  ReasonConfirmDialog,
  ReverseStatusDialog,
} from "./_components/SubmissionActionDialogs";
import { SubmissionPayoutModal } from "./_components/SubmissionPayoutModal";

// Add the ConfirmationDialog component at the top
const ConfirmationDialog = ({
  isOpen,
  onConfirm,
  onCancel,
  submissionId,
  isProcessing = false,
}: ConfirmationDialogProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-transparent bg-opacity-10 flex items-center justify-center z-50">
      <div className="bg-white  rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <h3 className="text-xl font-semibold text-gray-900">
              Are you sure you want to approve this submission?
            </h3>
          </div>
          {!isProcessing && (
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className="mb-6">
          <p className="text-xs text-gray-500 mt-3">
            This action cannot be undone. The farmer will be notified of the
            approval and quantity in stok will be updated.
          </p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Approving...</span>
              </>
            ) : (
              <>
                <span>Yes</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Filter options
const statusOptions = [
  { label: "All Status", value: "all" },
  { label: "Pending", value: "PENDING" },
  { label: "Verified", value: "VERIFIED" },
  { label: "Approved", value: "APPROVED" },
  { label: "Paid", value: "PAID" },
];

const feedbackStatusOptions = [
  { label: "All Feedback Status", value: "all" },
  { label: "Pending", value: "PENDING" },
  { label: "Accepted", value: "ACCEPTED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Extended", value: "EXTENDED" },
];

const provinceOptions = [
  { label: "All Provinces", value: "all" },
  { label: "Kigali City", value: "Umujyi wa Kigali" },
  { label: "Eastern Province", value: "Iburasirazuba" },
  { label: "Northern Province", value: "Amajyaruguru" },
  { label: "Southern Province", value: "Amajyepfo" },
  { label: "Western Province", value: "Iburengerazuba" },
];

export default function FarmerSubmissionsPage() {
  // State for filters
  const [searchValue, setSearchValue] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedFeedbackStatus, setSelectedFeedbackStatus] = useState("all");
  const [selectedProvince, setSelectedProvince] = useState("all");
  const [selectedDateRange, setSelectedDateRange] = useState<{
    from?: Date;
    to?: Date;
  }>({});

  // State for modal
  const [selectedSubmission, setSelectedSubmission] =
    useState<FarmerSubmission | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"view" | "verify" | "edit">(
    "view"
  );

  // State for data
  const [submissions, setSubmissions] = useState<FarmerSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  // MODIFIED: Changed approving state and added confirmation dialog state
  const [approving, setApproving] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingApprovalId, setPendingApprovalId] = useState<string | null>(
    null
  );

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
  });

  // State for the new admin override actions (reject / delete / force-complete / reverse-status / payout)
  const [rejectTarget, setRejectTarget] = useState<FarmerSubmission | null>(
    null
  );
  const [deleteTarget, setDeleteTarget] = useState<FarmerSubmission | null>(
    null
  );
  const [forceCompleteTarget, setForceCompleteTarget] =
    useState<FarmerSubmission | null>(null);
  const [reverseStatusTarget, setReverseStatusTarget] =
    useState<FarmerSubmission | null>(null);
  const [payoutTarget, setPayoutTarget] = useState<FarmerSubmission | null>(
    null
  );
  const [isActionProcessing, setIsActionProcessing] = useState(false);

  // Contexts
  const { getAllSubmissions, approveSubmission } = useSubmissions();
  const { user } = useAuth();

  // Modal handlers
  const handleOpenModal = (
    submission: FarmerSubmission,
    mode: "view" | "verify" | "edit"
  ) => {
    setSelectedSubmission(submission);
    setModalMode(mode);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSubmission(null);
    setModalMode("view");
  };

  const handleModeChange = (mode: "view" | "verify" | "edit") => {
    setModalMode(mode);
  };

  // MODIFIED: Handle approval click - now shows confirmation dialog
  const handleApproveSubmissionClick = async (submissionId: string) => {
    setPendingApprovalId(submissionId);
    setShowConfirmDialog(true);
  };

  // NEW: Handle confirmed approval
  const handleConfirmApproval = async () => {
    if (!pendingApprovalId) return;

    try {
      setApproving(pendingApprovalId);

      const response = await approveSubmission(pendingApprovalId);

      if (response.success) {
        toast.success("Submission approved successfully!");

        // Update the local state to reflect the approval
        setSubmissions((prevSubmissions) =>
          prevSubmissions.map((submission) =>
            submission.id === pendingApprovalId
              ? {
                  ...submission,
                  status: "APPROVED" as const,
                  approvedAt: new Date().toISOString(),
                }
              : submission
          )
        );

        // Close dialog
        setShowConfirmDialog(false);
      } else {
        toast.error(response.message || "Failed to approve submission");
      }
    } catch (error: any) {
      console.error("Error approving submission:", error);
      toast.error(
        error?.response?.data?.message || "Failed to approve submission"
      );
    } finally {
      setApproving(null);
      setPendingApprovalId(null);
    }
  };

  // NEW: Handle cancel approval
  const handleCancelApproval = () => {
    if (!approving) {
      setShowConfirmDialog(false);
      setPendingApprovalId(null);
    }
  };

  const updateSubmissionInState = (
    submissionId: string,
    changes: Partial<FarmerSubmission>
  ) => {
    setSubmissions((prev) =>
      prev.map((submission) =>
        submission.id === submissionId
          ? { ...submission, ...changes }
          : submission
      )
    );
  };

  const handleConfirmReject = async (reason: string) => {
    if (!rejectTarget) return;
    try {
      setIsActionProcessing(true);
      const response = await submissionService.rejectSubmission(
        rejectTarget.id,
        reason || undefined
      );

      if (response.success) {
        toast.success("Submission rejected successfully!");
        updateSubmissionInState(rejectTarget.id, {
          farmerFeedbackStatus: "REJECTED" as const,
        });
        setRejectTarget(null);
      } else {
        toast.error(response.message || "Failed to reject submission");
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to reject submission"
      );
    } finally {
      setIsActionProcessing(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsActionProcessing(true);
      const response = await submissionService.deleteSubmission(
        deleteTarget.id
      );

      if (response.success) {
        toast.success("Submission deleted successfully!");
        setSubmissions((prev) =>
          prev.filter((submission) => submission.id !== deleteTarget.id)
        );
        setDeleteTarget(null);
      } else {
        toast.error(response.message || "Failed to delete submission");
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to delete submission"
      );
    } finally {
      setIsActionProcessing(false);
    }
  };

  const handleConfirmForceComplete = async (reason: string) => {
    if (!forceCompleteTarget) return;
    try {
      setIsActionProcessing(true);
      const response = await submissionService.forceCompleteSubmission(
        forceCompleteTarget.id,
        reason || undefined
      );

      if (response.success) {
        toast.success("Submission force-completed successfully!");
        updateSubmissionInState(forceCompleteTarget.id, {
          status: "APPROVED" as const,
          approvedAt: new Date().toISOString(),
        });
        setForceCompleteTarget(null);
      } else {
        toast.error(response.message || "Failed to force-complete submission");
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          "Failed to force-complete submission"
      );
    } finally {
      setIsActionProcessing(false);
    }
  };

  const handleConfirmReverseStatus = async (
    toStatus: "PENDING" | "VERIFIED" | "APPROVED" | "PAID",
    reason: string
  ) => {
    if (!reverseStatusTarget) return;
    try {
      setIsActionProcessing(true);
      const response = await submissionService.reverseSubmissionStatus(
        reverseStatusTarget.id,
        { toStatus, reason: reason || undefined }
      );

      if (response.success) {
        toast.success(`Submission status reversed to ${toStatus}!`);
        updateSubmissionInState(reverseStatusTarget.id, { status: toStatus });
        setReverseStatusTarget(null);
      } else {
        toast.error(response.message || "Failed to reverse status");
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to reverse status"
      );
    } finally {
      setIsActionProcessing(false);
    }
  };

  const handleConfirmPayout = async (phoneNumber: string) => {
    if (!payoutTarget) return;
    try {
      setIsActionProcessing(true);
      const response = await submissionService.initiateSubmissionPayout(
        payoutTarget.id,
        phoneNumber
      );

      if (response.success) {
        toast.success(
          "Payout initiated. It is pending confirmation once PayPack processes the cashout."
        );
        setPayoutTarget(null);
      } else {
        toast.error(response.message || "Failed to initiate payout");
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to initiate payout"
      );
    } finally {
      setIsActionProcessing(false);
    }
  };

  // Fetch submissions on component mount
  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        const response: SubmissionResponse = await getAllSubmissions();

        if (response.success) {
          setSubmissions(response.data);
          setPagination({
            currentPage: response.pagination.currentPage,
            totalPages: response.pagination.totalPages,
            totalCount: response.pagination.totalCount,
          });
        } else {
          toast.error("Failed to fetch submissions");
        }
      } catch (error) {
        console.error("Error fetching submissions:", error);
        toast.error("Error fetching submissions");
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [getAllSubmissions]);

  // Get columns for admin view - MODIFIED: Pass the click handler instead
  const columns = useMemo(() => {
    return getAdminSubmissionColumns(
      handleOpenModal,
      handleApproveSubmissionClick,
      setRejectTarget,
      setDeleteTarget,
      setForceCompleteTarget,
      setPayoutTarget,
      setReverseStatusTarget
    );
  }, []);

  // Filter data based on user inputs
  const filteredData = useMemo(() => {
    if (!submissions.length) return [];

    return submissions.filter((submission) => {
      // Search filter
      if (searchValue) {
        const searchLower = searchValue.toLowerCase();
        const farmerEmail = submission.farmer.email?.toLowerCase() || "";
        const farmerPhone = submission.farmer.phone?.toLowerCase() || "";
        const verifiedByName =
          submission.aggregator?.username?.toLowerCase() || "";
        const productName = submission.productName.toLowerCase();
        const submissionId = submission.id.toLowerCase();
        const location =
          `${submission.village} ${submission.cell} ${submission.sector} ${submission.district} ${submission.province}`.toLowerCase();

        if (
          !farmerEmail.includes(searchLower) &&
          !farmerPhone.includes(searchLower) &&
          !productName.includes(searchLower) &&
          !submissionId.includes(searchLower) &&
          !location.includes(searchLower) &&
          !verifiedByName.includes(searchLower)
        ) {
          return false;
        }
      }

      // Status filter
      if (selectedStatus !== "all" && submission.status !== selectedStatus) {
        return false;
      }

      // Feedback status filter
      if (
        selectedFeedbackStatus !== "all" &&
        submission.farmerFeedbackStatus !== selectedFeedbackStatus
      ) {
        return false;
      }

      // Province filter
      if (
        selectedProvince !== "all" &&
        submission.province !== selectedProvince
      ) {
        return false;
      }

      // Date range filter - focusing on submittedAt date
      if (selectedDateRange.from || selectedDateRange.to) {
        const submissionDate = new Date(submission.submittedAt);

        if (selectedDateRange.from) {
          // Set start of day for 'from' date
          const startOfDay = new Date(selectedDateRange.from);
          startOfDay.setHours(0, 0, 0, 0);
          if (submissionDate < startOfDay) {
            return false;
          }
        }

        if (selectedDateRange.to) {
          // Set end of day for 'to' date
          const endOfDay = new Date(selectedDateRange.to);
          endOfDay.setHours(23, 59, 59, 999);
          if (submissionDate > endOfDay) {
            return false;
          }
        }
      }

      return true;
    });
  }, [
    submissions,
    searchValue,
    selectedStatus,
    selectedFeedbackStatus,
    selectedProvince,
    selectedDateRange,
  ]);

  // Clear date range filter
  const clearDateRange = () => {
    setSelectedDateRange({});
  };

  // Create filters - with restored date range filter
  const filters = [
    createCommonFilters.search(
      searchValue,
      setSearchValue,
      "Search names, product, or location..."
    ),
    createCommonFilters.status(
      selectedStatus,
      setSelectedStatus,
      statusOptions
    ),
    {
      type: "select" as const,
      key: "feedbackStatus",
      label: "Feedback Status",
      value: selectedFeedbackStatus,
      onChange: setSelectedFeedbackStatus,
      options: feedbackStatusOptions,
    },
    {
      type: "select" as const,
      key: "province",
      label: "Province",
      value: selectedProvince,
      onChange: setSelectedProvince,
      options: provinceOptions,
      className: "text-[10px]",
    },
    // RESTORED: Date range filter for submission date
    {
      type: "dateRange" as const,
      key: "submissionDateRange",
      label: "Submission Date Range",
      value: selectedDateRange,
      onChange: setSelectedDateRange,
    },
  ];

  const handleExport = async () => {
    try {

      toast.success(`Exporting ${filteredData.length} records...`);
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Export failed");
    }
  };

  // Handle add submission
  const handleAddSubmission = () => {
    toast.info("Add submission functionality will be implemented");
    // TODO: Navigate to add submission page or open modal
  };

 

  return (
    <>
      <div className="p-6">
        <DataTable
          columns={columns}
          data={filteredData}
          title="All Farmer Submissions"
          showExport={true}
          onExport={handleExport}
          showAddButton={true}
          onAddButton={handleAddSubmission}
          customFilters={
            <div className="flex items-center gap-4 flex-wrap">
              <TableFilters filters={filters} />
            </div>
          }
          showSearch={false}
          showColumnVisibility={false}
          showPagination={true}
        />

        {/* REMOVED: Old loading overlay */}
        {/* REPLACED WITH: Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={showConfirmDialog}
          onConfirm={handleConfirmApproval}
          onCancel={handleCancelApproval}
          submissionId={pendingApprovalId ?? ""}
          isProcessing={!!approving}
        />

        <ReasonConfirmDialog
          isOpen={!!rejectTarget}
          title="Reject Submission"
          description="Are you sure you want to reject this submission? The farmer will be notified."
          confirmLabel="Reject"
          isDestructive
          isProcessing={isActionProcessing}
          onClose={() => setRejectTarget(null)}
          onConfirm={handleConfirmReject}
        />

        <ReasonConfirmDialog
          isOpen={!!deleteTarget}
          title="Delete Submission"
          description="Delete this submission? This cannot be undone."
          confirmLabel="Delete"
          isDestructive
          isProcessing={isActionProcessing}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleConfirmDelete}
        />

        <ReasonConfirmDialog
          isOpen={!!forceCompleteTarget}
          title="Force Complete Submission"
          description="Force-complete this submission without waiting for farmer feedback?"
          confirmLabel="Force Complete"
          isProcessing={isActionProcessing}
          onClose={() => setForceCompleteTarget(null)}
          onConfirm={handleConfirmForceComplete}
        />

        {reverseStatusTarget && (
          <ReverseStatusDialog
            isOpen={!!reverseStatusTarget}
            currentStatus={reverseStatusTarget.status}
            isProcessing={isActionProcessing}
            onClose={() => setReverseStatusTarget(null)}
            onConfirm={handleConfirmReverseStatus}
          />
        )}

        {payoutTarget && (
          <SubmissionPayoutModal
            isOpen={!!payoutTarget}
            defaultPhone={payoutTarget.farmer.phone}
            isProcessing={isActionProcessing}
            onClose={() => setPayoutTarget(null)}
            onConfirm={handleConfirmPayout}
          />
        )}
      </div>

      {/* Product Verification Modal */}
      <ProductVerificationModal
        submission={selectedSubmission}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        mode={modalMode}
        onModeChange={handleModeChange}
      />
    </>
  );
}
