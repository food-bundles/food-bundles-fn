import createAxiosClient from "../hooks/axiosClient";

export interface NewsletterSubscriber {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  restaurantId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NewsletterCampaign {
  id: string;
  subject: string;
  content: string;
  status: "DRAFT" | "SENDING" | "SENT" | "FAILED";
  sentAt: string | null;
  sentBy: string;
  recipientCount: number;
  openCount: number;
  clickCount: number;
  createdAt: string;
  updatedAt: string;
}

export const newsletterService = {
  // Subscribers
  getAllSubscribers: async (page = 1, limit = 50, isActive?: boolean) => {
    const axiosClient = createAxiosClient();
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (isActive !== undefined) params.append("isActive", String(isActive));
    const response = await axiosClient.get(`/newsletter/subscribers?${params}`);
    return response.data;
  },

  subscribe: async (data: { email: string; name?: string; phone?: string; restaurantId?: string }) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.post("/newsletter/subscribe", data);
    return response.data;
  },

  unsubscribe: async (email: string) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.post("/newsletter/unsubscribe", { email });
    return response.data;
  },

  // Campaigns
  getAllCampaigns: async (page = 1, limit = 10, status?: string) => {
    const axiosClient = createAxiosClient();
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status) params.append("status", status);
    const response = await axiosClient.get(`/newsletter/campaigns?${params}`);
    return response.data;
  },

  createCampaign: async (data: { subject: string; content: string }) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.post("/newsletter/campaigns", data);
    return response.data;
  },

  updateCampaign: async (campaignId: string, data: { subject?: string; content?: string }) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.put(`/newsletter/campaigns/${campaignId}`, data);
    return response.data;
  },

  deleteCampaign: async (campaignId: string) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.delete(`/newsletter/campaigns/${campaignId}`);
    return response.data;
  },

  sendCampaign: async (campaignId: string) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.post(`/newsletter/campaigns/${campaignId}/send`);
    return response.data;
  },

  sendWeeklyUpdate: async () => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.post("/newsletter/weekly-update");
    return response.data;
  },
};
