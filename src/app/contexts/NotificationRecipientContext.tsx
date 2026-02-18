/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type React from "react";
import {
  createContext,
  useContext,
  useCallback,
  useMemo,
} from "react";
import { notificationRecipientService } from "@/app/services/notificationRecipientService";

export interface NotificationRecipient {
  id: string;
  name: string;
  phoneNumber: string;
  category: string;
  isActive: boolean;
  createdAt: string;
}

export interface RecipientsResponse {
  success: boolean;
  data: NotificationRecipient[];
  message?: string;
}

interface NotificationRecipientContextType {
  getAllRecipients: (params?: {
    category?: string;
    isActive?: boolean;
  }) => Promise<RecipientsResponse>;
}

const NotificationRecipientContext = createContext<NotificationRecipientContextType | undefined>(undefined);

export function NotificationRecipientProvider({ children }: { children: React.ReactNode }) {
  const getAllRecipients = useCallback(async (params?: {
    category?: string;
    isActive?: boolean;
  }): Promise<RecipientsResponse> => {
    try {
      const response = await notificationRecipientService.getAllRecipients(params);

      if (response.success && response.data) {
        return {
          success: true,
          data: response.data,
        };
      }

      return {
        success: false,
        data: [],
        message: "Failed to fetch recipients",
      };
    } catch (error) {
      console.error("Failed to fetch recipients:", error);
      return {
        success: false,
        data: [],
        message: "Failed to fetch recipients",
      };
    }
  }, []);

  const contextValue: NotificationRecipientContextType = useMemo(() => ({
    getAllRecipients,
  }), [getAllRecipients]);

  return (
    <NotificationRecipientContext.Provider value={contextValue}>
      {children}
    </NotificationRecipientContext.Provider>
  );
}

export function useNotificationRecipients() {
  const context = useContext(NotificationRecipientContext);
  if (!context) {
    throw new Error("useNotificationRecipients must be used within a NotificationRecipientProvider");
  }
  return context;
}
