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
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  paymentMethod: "CASH" | "MOBILE_MONEY" | "CARD" | "BANK_TRANSFER";
  items: OrderItem[];
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
}

export interface OrderStatistics {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  ordersByStatus: Record<string, number>;
  recentOrders: Order[];
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
  // Create order from completed checkout
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

  // Create direct order (without checkout process)
  createDirectOrder: async (
    orderData: CreateDirectOrderData
  ): Promise<OrderResponse> => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.post("/orders/direct", orderData);
    return response.data;
  },

  // Get order by ID
  getOrderById: async (orderId: string): Promise<OrderResponse> => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get(`/orders/${orderId}`);
    return response.data;
  },

  // Get order by order number
  getOrderByNumber: async (orderNumber: string): Promise<OrderResponse> => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get(`/orders/number/${orderNumber}`);
    return response.data;
  },

  // Get all orders (Admin only)
  getAllOrders: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    restaurantId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<OrdersResponse> => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get("/orders", { params });
    return response.data;
  },

  // Get current restaurant's orders
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
      data: response.data.data, // ✅ extract the actual array
      pagination: response.data.pagination,
      message: response.data.message,
    };
  },

  // Update order
  updateOrder: async (
    orderId: string,
    updateData: UpdateOrderData
  ): Promise<OrderResponse> => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.patch(`/orders/${orderId}`, updateData);
    return response.data;
  },

  // Cancel order
  cancelOrder: async (orderId: string): Promise<OrderResponse> => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.post(`/orders/${orderId}/cancel`);
    return response.data;
  },

  // Delete order (Admin only)
  deleteOrder: async (
    orderId: string
  ): Promise<{ success: boolean; message?: string }> => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.delete(`/orders/${orderId}`);
    return response.data;
  },

  // Get order statistics
  getOrderStatistics: async (params?: {
    period?: "day" | "week" | "month" | "year";
    startDate?: string;
    endDate?: string;
    restaurantId?: string;
  }): Promise<StatisticsResponse> => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get("/orders/statistics", { params });
    return response.data;
  },
};
