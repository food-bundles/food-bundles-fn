/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { getRecipientColumns, type NotificationRecipient } from "./recipient-columns";
import { RecipientManagementModal } from "./recipient-management-modal";
import { CreateRecipientModal } from "./create-recipient-modal";
import { notificationRecipientService } from "@/app/services/notificationRecipientService";

interface RecipientManagementProps {
  recipients: NotificationRecipient[];
  onRefresh: () => void;
}

export function RecipientManagement({
  recipients,
  onRefresh,
}: RecipientManagementProps) {
  const [selectedRecipient, setSelectedRecipient] = useState<NotificationRecipient | null>(null);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleManage = (recipient: NotificationRecipient) => {
    setSelectedRecipient(recipient);
    setIsManageModalOpen(true);
  };

  const handleEdit = async (recipientId: string, data: any) => {
    await notificationRecipientService.updateRecipient(recipientId, data);
  };

  const handleDelete = async (recipientId: string) => {
    await notificationRecipientService.deleteRecipient(recipientId);
  };

  const columns = getRecipientColumns(handleManage);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notification Recipients</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage phone numbers that receive system notifications
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Recipient
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={recipients}
        showColumnVisibility={true}
        showPagination={true}
      />

      <RecipientManagementModal
        recipient={selectedRecipient}
        open={isManageModalOpen}
        onOpenChange={setIsManageModalOpen}
        onUpdate={onRefresh}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <CreateRecipientModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={onRefresh}
      />
    </div>
  );
}
