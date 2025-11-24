import { apiClient } from '@/lib/api-client';

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

export const notificationService = {
  async getNotifications(page = 1, limit = 10): Promise<NotificationResponse> {
    return apiClient.get(`/notifications/my-notifications?page=${page}&limit=${limit}`);
  },

  async getUnreadCount(): Promise<UnreadCountResponse> {
    return apiClient.get('/notifications/unread-count');
  },

  async markAllAsRead(): Promise<{ message: string; data: { updatedCount: number } }> {
    return apiClient.patch('/notifications/mark-all-read');
  },

  async getNotificationById(id: string): Promise<{ message: string; data: Notification }> {
    return apiClient.get(`/notifications/${id}`);
  },

  async deleteNotification(id: string): Promise<{ message: string }> {
    return apiClient.delete(`/notifications/${id}`);
  },

  async markAsRead(id: string): Promise<{ message: string; data: Notification }> {
    return apiClient.patch(`/notifications/${id}/read`);
  }
};