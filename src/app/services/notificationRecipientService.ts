/* eslint-disable @typescript-eslint/no-explicit-any */
import createAxiosClient from "@/app/hooks/axiosClient";

const axiosClient = createAxiosClient();

export const notificationRecipientService = {
  // Get all notification recipients
  getAllRecipients: async (params?: {
    category?: string;
    isActive?: boolean;
  }) => {
    try {
      const response = await axiosClient.get("/notification-recipients", { params });
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error: any) {
      console.error("Get recipients error:", error);
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || "Failed to fetch recipients",
      };
    }
  },

  // Create notification recipient
  createRecipient: async (data: any) => {
    try {
      const response = await axiosClient.post("/notification-recipients", data);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error: any) {
      console.error("Create recipient error:", error);
      throw error;
    }
  },

  // Update notification recipient
  updateRecipient: async (recipientId: string, data: any) => {
    try {
      const response = await axiosClient.patch(`/notification-recipients/${recipientId}`, data);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error: any) {
      console.error("Update recipient error:", error);
      throw error;
    }
  },

  // Delete notification recipient
  deleteRecipient: async (recipientId: string) => {
    try {
      const response = await axiosClient.delete(`/notification-recipients/${recipientId}`);
      return {
        success: true,
        message: response.data.message,
      };
    } catch (error: any) {
      console.error("Delete recipient error:", error);
      throw error;
    }
  },
};
