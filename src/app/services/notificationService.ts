/* eslint-disable @typescript-eslint/no-explicit-any */
import createAxiosClient from '@/app/hooks/axiosClient';

export interface Notification {
  id: string;
  title: string;
  message: string;
  eventType: string;
  targetType: string;
  targetId: string;
  targetRole: string | null;
  isRead: boolean;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationResponse {
  message: string;
  data: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UnreadCountResponse {
  message: string;
  data: {
    unreadCount: number;
  };
}

const axiosClient = createAxiosClient();

export const notificationService = {
  async getNotifications(page = 1, limit = 10): Promise<NotificationResponse> {
    const response = await axiosClient.get(`/notifications/my-notifications?page=${page}&limit=${limit}`);
    return response.data;
  },

  async getUnreadCount(): Promise<UnreadCountResponse> {
    const response = await axiosClient.get('/notifications/unread-count');
    return response.data;
  },

  async markAllAsRead(): Promise<{ message: string; data: { updatedCount: number } }> {
    const response = await axiosClient.patch('/notifications/mark-all-read');
    return response.data;
  },

  async getNotificationById(id: string): Promise<{ message: string; data: Notification }> {
    const response = await axiosClient.get(`/notifications/${id}`);
    return response.data;
  },

  async deleteNotification(id: string): Promise<{ message: string }> {
    const response = await axiosClient.delete(`/notifications/${id}`);
    return response.data;
  },

  async markAsRead(id: string): Promise<{ message: string; data: Notification }> {
    const response = await axiosClient.patch(`/notifications/${id}/read`);
    return response.data;
  }
};