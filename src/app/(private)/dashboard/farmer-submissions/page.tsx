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
import { ConfirmationDialog } from "./_components/ApprovalConfirmationDialog";
import { submissionService } from "@/app/services/submissionServices";
import {
  ReasonConfirmDialog,
  ReverseStatusDialog,
} from "./_components/SubmissionActionDialogs";
import { SubmissionPayoutModal } from "./_components/SubmissionPayoutModal";
import { SubmissionHistoryModal } from "./_components/SubmissionHistoryModal";
import { exportService } from "@/app/services/exportService";
import { AddSubmissionModal } from "./_components/AddSubmissionModal";

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
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
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
  const [historyTarget, setHistoryTarget] = useState<FarmerSubmission | null>(
    null
  );
  const [isActionProcessing, setIsActionProcessing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isAddSubmissionOpen, setIsAddSubmissionOpen] = useState(false);

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

  const handleRequestPayoutOTP = async (phoneNumber: string) => {
    if (!payoutTarget) throw new Error("No submission selected");
    const response = await submissionService.requestSubmissionPayoutOTP(
      payoutTarget.id,
      phoneNumber
    );

    if (!response.success) {
      throw new Error(response.message || "Failed to send OTP");
    }

    return response.sessionId as string;
  };

  const handleVerifyPayoutOTP = async (otp: string, sessionId: string) => {
    if (!payoutTarget) throw new Error("No submission selected");
    const response = await submissionService.verifySubmissionPayoutOTP(
      payoutTarget.id,
      otp,
      sessionId
    );

    if (!response.success) {
      throw new Error(response.message || "Failed to initiate payout");
    }

    toast.success(
      "Payout initiated. It is pending confirmation once PayPack processes the cashout."
    );
    setPayoutTarget(null);
    fetchSubmissions(pagination.page, pagination.limit);
  };

  // Fetch submissions from the server, applying all current filters/pagination
  const fetchSubmissions = async (
    page = pagination.page,
    limit = pagination.limit
  ) => {
    try {
      setLoading(true);

      const params: {
        page: number;
        limit: number;
        status?: string;
        feedbackStatus?: string;
        province?: string;
        search?: string;
        dateFrom?: string;
        dateTo?: string;
      } = { page, limit };

      if (searchValue.trim()) params.search = searchValue.trim();
      if (selectedStatus !== "all") params.status = selectedStatus;
      if (selectedFeedbackStatus !== "all")
        params.feedbackStatus = selectedFeedbackStatus;
      if (selectedProvince !== "all") params.province = selectedProvince;
      if (selectedDateRange.from)
        params.dateFrom = selectedDateRange.from.toISOString().split("T")[0];
      if (selectedDateRange.to)
        params.dateTo = selectedDateRange.to.toISOString().split("T")[0];

      const response: SubmissionResponse = await getAllSubmissions(params);

      if (response.success) {
        setSubmissions(response.data);
        setPagination({
          page: response.pagination.currentPage,
          limit: response.pagination.limit,
          total: response.pagination.totalCount,
          totalPages: response.pagination.totalPages,
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

  // Refetch (from page 1) whenever a filter changes, debounced
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchSubmissions(1, pagination.limit);
    }, 500);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    searchValue,
    selectedStatus,
    selectedFeedbackStatus,
    selectedProvince,
    selectedDateRange,
  ]);

  const handlePaginationChange = (page: number, limit: number) => {
    fetchSubmissions(page, limit);
  };

  // Get columns for admin view - MODIFIED: Pass the click handler instead
  const columns = useMemo(() => {
    return getAdminSubmissionColumns(
      handleOpenModal,
      handleApproveSubmissionClick,
      setRejectTarget,
      setDeleteTarget,
      setForceCompleteTarget,
      setPayoutTarget,
      setReverseStatusTarget,
      setHistoryTarget
    );
  }, []);

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

  const handleExport = async (
    _selectedRows: FarmerSubmission[],
    format: "excel" | "csv" | "pdf"
  ) => {
    try {
      setIsExporting(true);
      toast.info(`Generating ${format.toUpperCase()} export...`);

      await exportService.downloadExport("submissions", format, {
        search: searchValue.trim() || undefined,
        status: selectedStatus !== "all" ? selectedStatus : undefined,
        province: selectedProvince !== "all" ? selectedProvince : undefined,
        startDate: selectedDateRange.from
          ? selectedDateRange.from.toISOString().split("T")[0]
          : undefined,
        endDate: selectedDateRange.to
          ? selectedDateRange.to.toISOString().split("T")[0]
          : undefined,
      });

      toast.success("Export downloaded successfully!");
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to download export");
    } finally {
      setIsExporting(false);
    }
  };

  // Handle add submission
  const handleAddSubmission = () => {
    setIsAddSubmissionOpen(true);
  };

 

  return (
    <>
      <div className="p-6">
        <DataTable
          columns={columns}
          data={submissions}
          title="All Farmer Submissions"
          showExport={true}
          onExport={handleExport}
          isExporting={isExporting}
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
          pagination={pagination}
          onPaginationChange={handlePaginationChange}
          isLoading={loading}
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
            onClose={() => setPayoutTarget(null)}
            onRequestOTP={handleRequestPayoutOTP}
            onVerifyOTP={handleVerifyPayoutOTP}
          />
        )}

        <SubmissionHistoryModal
          isOpen={!!historyTarget}
          submissionId={historyTarget?.id ?? null}
          onClose={() => setHistoryTarget(null)}
          onChanged={() => fetchSubmissions(pagination.page, pagination.limit)}
        />

        <AddSubmissionModal
          isOpen={isAddSubmissionOpen}
          onClose={() => setIsAddSubmissionOpen(false)}
          onCreated={() => fetchSubmissions(pagination.page, pagination.limit)}
        />
      </div>

      {/* Product Verification Modal */}
      <ProductVerificationModal
        submission={selectedSubmission}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        mode={modalMode}
        onModeChange={handleModeChange}
        onSuccess={() => fetchSubmissions(pagination.page, pagination.limit)}
      />
    </>
  );
}
