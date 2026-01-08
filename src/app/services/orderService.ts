/* eslint-disable @typescript-eslint/no-explicit-any */
import createAxiosClient from "../hooks/axiosClient";

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  unit: string;
  image?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  restaurantId: string;
  restaurantName: string;
  restaurantEmail: string;
  restaurantPhone: string;
  totalAmount: number;
  status:
    | "PENDING"
    | "CONFIRMED"
    | "PROCESSING"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED"
    | "REFUNDED";
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED" | "PROCESSING";
  paymentMethod: "CASH" | "MOBILE_MONEY" | "CARD" | "BANK_TRANSFER";
  items: OrderItem[];
  orderItems?: any[];
  billingAddress: string;
  billingName: string;
  billingPhone: string;
  billingEmail?: string;
  deliveryInstructions?: string;
  deliveryDate?: string;
  createdAt: string;
  updatedAt: string;
  cancelledAt?: string;
  deliveredAt?: string;
  restaurant?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
}

export interface OrderStatistics {
  totalOrders: number;
  ordersByStatus: {
    pending: number;
    confirmed: number;
    preparing: number;
    ready: number;
    inTransit: number;
    delivered: number;
    cancelled: number;
  };
  revenue: {
    total: number;
    average: number;
  };
}

export interface CreateOrderFromCheckoutData {
  checkoutId: string;
}

export interface CreateDirectOrderData {
  restaurantId: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
  }>;
  billingName: string;
  billingPhone: string;
  billingEmail?: string;
  billingAddress: string;
  paymentMethod: "CASH" | "MOBILE_MONEY" | "CARD" | "BANK_TRANSFER";
  deliveryInstructions?: string;
}

export interface UpdateOrderData {
  status?: Order["status"];
  deliveryDate?: string;
  deliveryInstructions?: string;
}

export interface OrdersResponse {
  success: boolean;
  data: Order[];
  message?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface OrderResponse {
  success: boolean;
  data: Order;
  message?: string;
}

export interface StatisticsResponse {
  success: boolean;
  data: OrderStatistics;
  message?: string;
}

export const orderService = {
  createOrderFromCheckout: async (
    checkoutData: CreateOrderFromCheckoutData
  ): Promise<OrderResponse> => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.post(
      "/orders/from-checkout",
      checkoutData
    );
    return response.data;
  },

  createDirectOrder: async (
    orderData: CreateDirectOrderData
  ): Promise<OrderResponse> => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.post("/orders/direct", orderData);
    return response.data;
  },

  getOrderById: async (orderId: string): Promise<OrderResponse> => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get(`/orders/${orderId}`);
    return response.data;
  },

  getOrderByNumber: async (orderNumber: string): Promise<OrderResponse> => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get(`/orders/number/${orderNumber}`);
    return response.data;
  },

  // admins only
  getAllOrdersByAdmin: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    paymentStatus?: string;
    restaurantId?: string;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<OrdersResponse> => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get("/orders", { params });
    return {
      success: true,
      data: response.data.data,
      pagination: response.data.pagination,
      message: response.data.message,
    };
  },

  getMyOrders: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<OrdersResponse> => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get("/orders/my-orders", { params });
    return {
      success: true,
      data: response.data.data,
      pagination: response.data.pagination,
      message: response.data.message,
    };
  },

  updateOrder: async (
    orderId: string,
    updateData: any
  ): Promise<OrderResponse> => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.patch(`/orders/${orderId}`, updateData);
    return response.data;
  },

  cancelOrder: async (orderId: string, data?: { reason?: string }): Promise<OrderResponse> => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.post(`/orders/${orderId}/cancel`, data);
    return response.data;
  },

  reorderOrder: async (orderId: string): Promise<OrderResponse> => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.post(`/orders/${orderId}/reorder`);
    return response.data;
  },

  deleteOrder: async (
    orderId: string
  ): Promise<{ success: boolean; message?: string }> => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.delete(`/orders/${orderId}`);
    return response.data;
  },

  getOrderStatistics: async (params?: {
    period?: "day" | "week" | "month" | "year";
    startDate?: string;
    endDate?: string;
    restaurantId?: string;
  }): Promise<StatisticsResponse> => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get("/orders/statistics", { params });
    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
    };
  },

  getDeliveryOrders: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<OrdersResponse> => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get("/deliveries/orders", { params });
    return {
      success: true,
      data: response.data.data,
      pagination: response.data.pagination,
      message: response.data.message,
    };
  },

  updateDeliveryStatus: async (
    orderId: string, 
    status: 'PREPARING' | 'READY' | 'IN_TRANSIT' | 'CANCELLED' | 'DELIVERED'
  ): Promise<{ success: boolean; data?: any; error?: string }> => {
    try {
      const axiosClient = createAxiosClient();
      const response = await axiosClient.patch(`/deliveries/${orderId}/status`, { status });
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message || error.message };
    }
  },

  getDeliveryOrderDetails: async (
    orderId: string
  ): Promise<{ success: boolean; data?: any; error?: string }> => {
    try {
      const axiosClient = createAxiosClient();
      const response = await axiosClient.get(`/deliveries/${orderId}`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message || error.message };
    }
  },

  verifyDeliveryOTP: async (
    orderId: string, 
    otp: string
  ): Promise<{ success: boolean; data?: any; error?: string }> => {
    try {
      const axiosClient = createAxiosClient();
      const response = await axiosClient.post(`/deliveries/${orderId}/otp/verify`, { otp });
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message || error.message };
    }
  },
};
