/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { DataTable } from "@/components/data-table";
import { createInvitationColumns } from "./_components/invitation-columns";
import { InviteModal } from "./_components/invite-modal";
import { invitationService, Invitation, CreateInvitationData } from "@/app/services/invitationService";
import { toast } from "sonner";
import { useAdminAccess } from "@/app/hooks/useAdminAccess";
import { aggregatorApplicationService } from "@/app/services/aggregatorApplicationService";
import { AggregatorApplicationsPanel } from "./_components/aggregator-applications-panel";

export default function InvitationsPage() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Aggregator applications (from the QR code) are reviewed here: approving one sends its invitation
  const { can } = useAdminAccess();
  const canSeeApplications = can("aggregator_applications");
  const [tab, setTab] = useState<"invitations" | "aggregators">("invitations");
  const [waiting, setWaiting] = useState(0);

  useEffect(() => {
    fetchInvitations();
    if (new URLSearchParams(window.location.search).get("tab") === "aggregators") setTab("aggregators");
  }, []);

  const fetchWaiting = () =>
    aggregatorApplicationService
      .list("PENDING")
      .then((r) => setWaiting(r.counts?.PENDING ?? 0))
      .catch(() => setWaiting(0));

  useEffect(() => {
    if (canSeeApplications) fetchWaiting();
  }, [canSeeApplications]);

  const switchTab = (next: "invitations" | "aggregators") => {
    setTab(next);
    const url = new URL(window.location.href);
    if (next === "aggregators") url.searchParams.set("tab", "aggregators");
    else url.searchParams.delete("tab");
    window.history.replaceState({}, "", url.toString());
  };

  const fetchInvitations = async () => {
    try {
      setIsLoading(true);
      const response = await invitationService.getInvitations();
      setInvitations(response.data);
    } catch (error) {
      console.error("Failed to fetch invitations:", error);
      toast.error("Failed to load invitations");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateInvitation = async (data: CreateInvitationData) => {
    try {
      setIsSubmitting(true);
      const response = await invitationService.createInvitation(data);
      if (response.emailNotSent) {
        toast.warning("Invitation created but email not sent. You can resend it later.");
      } else {
        toast.success("Invitation sent successfully");
      }
      fetchInvitations();
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to send invitation";
      toast.error(message);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendInvitation = async (id: string) => {
    try {
      const response = await invitationService.resendInvitation(id);
      if (response.emailNotSent) {
        toast.warning("Invitation resent but email not sent. You can try again later.");
      } else {
        toast.success("Invitation resent successfully");
      }
      fetchInvitations();
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to resend invitation";
      toast.error(message);
    }
  };

  const handleCancelInvitation = async (id: string) => {
    try {
      await invitationService.cancelInvitation(id);
      toast.success("Invitation cancelled successfully");
      fetchInvitations();
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to cancel invitation";
      toast.error(message);
    }
  };

  const columns = createInvitationColumns({
    onResend: handleResendInvitation,
    onCancel: handleCancelInvitation,
  });

  return (
    <div className="p-6 space-y-6">
      {canSeeApplications && (
        <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Invitations">
          {([
            ["invitations", "Invitations", invitations.length],
            ["aggregators", "Aggregator applications", waiting],
          ] as const).map(([key, label, n]) => {
            const on = tab === key;
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => switchTab(key)}
                className={`min-h-10 rounded-full px-4 text-[14px] font-bold transition-colors cursor-pointer ${
                  on ? "bg-[#0B2E1F] text-white" : "border border-[#DCE6DF] bg-white text-[#0B2E1F] hover:border-[#00A43A]"
                }`}
              >
                {label}{" "}
                <span className={on ? "text-[#7CF2A6]" : key === "aggregators" && n > 0 ? "text-[#E5402D]" : "text-[#4A6358]"}>
                  {key === "aggregators" ? `${n} waiting` : n}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {tab === "aggregators" && canSeeApplications ? (
        <AggregatorApplicationsPanel
          onChanged={() => {
            fetchWaiting();
            fetchInvitations();
          }}
        />
      ) : (
      <DataTable
        columns={columns}
        data={invitations}
        title="User Invitations"
        description="Send and manage invitations for new users"
        showAddButton
        addButtonLabel="Send Invitation"
        onAddButton={() => setIsInviteModalOpen(true)}
        isLoading={isLoading}
        showSearch={false}
        showColumnVisibility
        showPagination
      />
      )}

      <InviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSubmit={handleCreateInvitation}
        isLoading={isSubmitting}
      />
    </div>
  );
}