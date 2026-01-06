import createAxiosClient from "../hooks/axiosClient";

export interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  isActive?: boolean;
  isPublic?: boolean;
}

export interface CreatePaymentMethodData {
  name: string;
  description: string;
  isActive?: boolean;
  isPublic?: boolean;
}

export interface UpdatePaymentMethodData {
  name?: string;
  description?: string;
  isActive?: boolean;
  isPublic?: boolean;
}

export const paymentMethodService = {
  // Get all payment methods
  getAllPaymentMethods: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
  }) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get("/payment-method", { params });
    return response.data;
  },

  // Get active payment methods (for dropdowns)
  getActivePaymentMethods: async () => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get("/payment-method/active");
    return response.data;
  },

  // Get public payment methods
  getPublicPaymentMethods: async () => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get("/payment-method/public");
    return response.data;
  },

  // Get payment method by ID
  getPaymentMethodById: async (methodId: string) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get(`/payment-method/${methodId}`);
    return response.data;
  },

  // Create payment method (Admin only)
  createPaymentMethod: async (data: CreatePaymentMethodData) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.post("/payment-method", data);
    return response.data;
  },

  // Update payment method
  updatePaymentMethod: async (methodId: string, data: UpdatePaymentMethodData) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.patch(`/payment-method/${methodId}`, data);
    return response.data;
  },

  // Delete payment method
  deletePaymentMethod: async (methodId: string) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.delete(`/payment-method/${methodId}`);
    return response.data;
  },

  // Bulk update payment method status
  bulkUpdateStatus: async (data: { ids: string[]; isActive: boolean }) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.patch("/payment-method/bulk-status", data);
    return response.data;
  },
};