/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { DataTable } from "@/components/data-table";
import { createInvitationColumns } from "./_components/invitation-columns";
import { InviteModal } from "./_components/invite-modal";
import { invitationService, Invitation, CreateInvitationData } from "@/app/services/invitationService";
import { toast } from "sonner";

export default function InvitationsPage() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchInvitations();
  }, []);

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
      await invitationService.createInvitation(data);
      toast.success("Invitation sent successfully");
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
      await invitationService.resendInvitation(id);
      toast.success("Invitation resent successfully");
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

      <InviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSubmit={handleCreateInvitation}
        isLoading={isSubmitting}
      />
    </div>
  );
}