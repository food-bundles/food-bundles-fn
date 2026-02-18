/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useNotificationRecipients } from "@/app/contexts/NotificationRecipientContext";
import { RecipientManagement } from "./_components/recipient-management";
import type { NotificationRecipient } from "@/app/contexts/NotificationRecipientContext";
import { Spinner } from "@/components/ui/shadcn-io/spinner";

export default function NotificationRecipientPage() {
  const [recipients, setRecipients] = useState<NotificationRecipient[]>([]);
  const [loading, setLoading] = useState(true);
  const { getAllRecipients } = useNotificationRecipients();

  const fetchRecipients = async () => {
    try {
      setLoading(true);
      const response = await getAllRecipients();

      if (response?.success && Array.isArray(response?.data)) {
        setRecipients(response.data);
      } else {
        console.warn("Unexpected API response format:", response);
      }
    } catch (error) {
      console.error("Failed to fetch recipients:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipients();
  }, []);

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        <Spinner variant="ring" className="w-10 h-10" />
      </div>
    );

  return (
    <div className="p-6">
      <RecipientManagement 
        recipients={recipients} 
        onRefresh={fetchRecipients}
      />
    </div>
  );
}
