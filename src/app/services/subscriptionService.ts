/* eslint-disable @typescript-eslint/no-explicit-any */
import createAxiosClient from "../hooks/axiosClient";

// ==================== TYPES ====================

export interface LoanProvider {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  unlockFeeEnabled: boolean;
  unlockFeePercentage?: number | null;
  createdAt: string;
  updatedAt: string;
  plans?: {
    id: string;
    name: string;
    price: number;
    duration: number;
    isActive: boolean;
  }[];
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration: number; // in days
  voucherAccess: boolean;
  voucherPaymentDays?: number;
  freeDelivery: boolean;
  stablePricing: boolean;
  receiveEBM: boolean;
  advertisingAccess: boolean;
  otherServices: boolean;
  loanAccess?: boolean;
  loanProviderId?: string;
  loanProvider?: LoanProvider | null;
  features?: any;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    subscriptions: number;
  };
}

export interface SubscriptionPayment {
  id: string;
  subscriptionId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  txRef?: string;
  flwRef?: string;
  transactionId?: string;
  flwStatus?: string;
  flwMessage?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionHistory {
  id: string;
  subscriptionId: string;
  action: SubscriptionAction;
  oldStatus?: SubscriptionStatus;
  newStatus?: SubscriptionStatus;
  oldPlanId?: string;
  newPlanId?: string;
  reason?: string;
  performedBy?: string;
  createdAt: string;
}

export interface RestaurantSubscription {
  id: string;
  restaurantId: string;
  planId: string;
  status: SubscriptionStatus;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  paymentMethod?: PaymentMethod;
  paymentStatus: PaymentStatus;
  txRef?: string;
  flwRef?: string;
  transactionId?: string;
  amountPaid?: number;
  createdAt: string;
  updatedAt: string;
  daysRemaining?: number;
  loanAccessApprovedAt?: string | null;
  loanAccessNotes?: string | null;

  // Relations
  plan: SubscriptionPlan;
  restaurant: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role?: string;
  };
  payments?: SubscriptionPayment[];
  history?: SubscriptionHistory[];
}

export type SubscriptionStatus =
  | "ACTIVE"
  | "EXPIRED"
  | "CANCELLED"
  | "SUSPENDED"
  | "PENDING";

export type PaymentMethod = "CASH" | "MOBILE_MONEY" | "BANK_TRANSFER" | "CARD";

export type PaymentStatus =
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED"
  | "REFUNDED";

export type SubscriptionAction =
  | "CREATED"
  | "RENEWED"
  | "UPGRADED"
  | "DOWNGRADED"
  | "CANCELLED"
  | "SUSPENDED"
  | "REACTIVATED"
  | "EXPIRED"
  | "LOAN_ACCESS_REQUESTED"
  | "LOAN_ACCESS_APPROVED"
  | "LOAN_ACCESS_REJECTED"
  | "LOAN_ACCESS_DISABLED"
  | "LOAN_ACCESS_ENABLED";

// ==================== REQUEST TYPES ====================

export interface CreateSubscriptionPlanData {
  name: string;
  description?: string;
  price: number;
  duration: number;
  features?: any;
  voucherAccess?: boolean;
  voucherPaymentDays?: number;
  freeDelivery?: boolean;
  stablePricing?: boolean;
  receiveEBM?: boolean;
  advertisingAccess?: boolean;
  otherServices?: boolean;
  loanAccess?: boolean;
  loanProviderId?: string;
}

export interface UpdateSubscriptionPlanData {
  name?: string;
  description?: string;
  price?: number;
  duration?: number;
  features?: any;
  isActive?: boolean;
  voucherAccess?: boolean;
  voucherPaymentDays?: number;
  freeDelivery?: boolean;
  stablePricing?: boolean;
  receiveEBM?: boolean;
  advertisingAccess?: boolean;
  otherServices?: boolean;
  loanAccess?: boolean;
  loanProviderId?: string;
}

export interface CreateRestaurantSubscriptionData {
  planId: string;
  paymentMethodId: string;
  autoRenew?: boolean;
  paymentMethod?: PaymentMethod;
  restaurantId?: string;
  phoneNumber?: string;
  cardDetails?: {
    cardNumber: string;
    expiryDate: string;
    cvv: string;
  };
  bankDetails?: any;
}

export interface UpdateRestaurantSubscriptionData {
  status?: SubscriptionStatus;
  autoRenew?: boolean;
  endDate?: string;
}

export interface CancelSubscriptionData {
  reason?: string;
}

export interface UpgradeSubscriptionData {
  newPlanId: string;
}

export interface DowngradeSubscriptionData {
  newPlanId: string;
}

export interface RequestLoanAccessData {
  planId: string;
  notes?: string;
}

export interface CreateLoanProviderData {
  name: string;
  description?: string;
  unlockFeeEnabled?: boolean;
  unlockFeePercentage?: number | null;
}

export interface LoanAccessFilters {
  status?: SubscriptionStatus;
  userType?: string;
  loanProviderId?: string;
}

// ==================== RESPONSE TYPES ====================

export interface SubscriptionPlansResponse {
  success: boolean;
  data: SubscriptionPlan[];
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SubscriptionPlanResponse {
  success: boolean;
  data: SubscriptionPlan;
  message?: string;
}

export interface SubscriptionsResponse {
  success: boolean;
  data: RestaurantSubscription[];
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SubscriptionResponse {
  success: boolean;
  data: RestaurantSubscription;
  message?: string;
}

export interface SubscriptionHistoryResponse {
  success: boolean;
  data: SubscriptionHistory[];
  message?: string;
}

export interface CheckExpiredResponse {
  success: boolean;
  message: string;
  count: number;
}

export interface LoanProvidersResponse {
  success: boolean;
  message?: string;
  data: LoanProvider[];
}

export interface LoanProviderResponse {
  success: boolean;
  message?: string;
  data: LoanProvider;
}

export interface LoanAccessSubscriptionsResponse {
  success: boolean;
  message?: string;
  data: RestaurantSubscription[];
}

// ==================== SERVICE ====================

export const subscriptionService = {
  // ==================== SUBSCRIPTION PLAN SERVICES ====================

  /**
   * Create a new subscription plan (Admin only)
   */
  createSubscriptionPlan: async (
    data: CreateSubscriptionPlanData
  ): Promise<SubscriptionPlanResponse> => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.post("/subscriptions/plans", data);
    return response.data;
  },

  /**
   * Get all subscription plans
   */
  getAllSubscriptionPlans: async (params?: {
    page?: number;
    limit?: number;
    isActive?: boolean;
  }): Promise<SubscriptionPlansResponse> => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get("/subscriptions/plans", { params });
    return response.data;
  },

  /**
   * Get subscription plan by ID
   */
  getSubscriptionPlanById: async (
    planId: string
  ): Promise<SubscriptionPlanResponse> => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get(`/subscriptions/plans/${planId}`);
    return response.data;
  },


  createRestaurantSubscription: async (
    data: CreateRestaurantSubscriptionData
  ): Promise<SubscriptionResponse> => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.post("/subscriptions/restaurant", data);
    return response.data;
  },

  /**
   * Get restaurant's current subscription (Restaurant only)
   */
  getMySubscriptions: async (): Promise<SubscriptionResponse> => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get("/subscriptions/my-subscriptions");
    return response.data;
  },

  /**
   * Get subscription by ID
   */
  getSubscriptionById: async (
    subscriptionId: string
  ): Promise<SubscriptionResponse> => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get(`/subscriptions/${subscriptionId}`);
    return response.data;
  },

  /**
   * Update restaurant subscription
   */

  updateSubscription: async (
    subscriptionId: string,
    payload: UpdateRestaurantSubscriptionData
  ) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.patch(
      `/subscriptions/${subscriptionId}`,
      payload
    );
    return response.data;
  },

  updateSubscriptionPlan: async (
    planId: string,
    payload: UpdateSubscriptionPlanData
  ) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.patch(
      `/subscriptions/plans/${planId}`,
      payload
    );
    return response.data;
  },

  // Delete subscription (cancel)
  deleteSubscription: async (subscriptionId: string) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.delete(
      `/subscriptions/${subscriptionId}`
    );
    return response.data;
  },

  // Delete subscription plan
  deleteSubscriptionPlan: async (planId: string) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.delete(`/subscriptions/plans/${planId}`);
    return response.data;
  },

  /**
   * Cancel subscription
   */
  cancelSubscription: async (
    subscriptionId: string,
    data?: CancelSubscriptionData
  ): Promise<SubscriptionResponse> => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.post(
      `/subscriptions/${subscriptionId}/cancel`,
      data
    );
    return response.data;
  },

  /**
   * Renew subscription
   */
  renewSubscription: async (
    subscriptionId: string
  ): Promise<SubscriptionResponse> => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.post(
      `/subscriptions/${subscriptionId}/renew`
    );
    return response.data;
  },

  /**
   * Upgrade subscription
   */
  upgradeSubscription: async (
    subscriptionId: string,
    data: UpgradeSubscriptionData
  ): Promise<SubscriptionResponse> => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.post(
      `/subscriptions/${subscriptionId}/upgrade`,
      data
    );
    return response.data;
  },

  /**
   * Downgrade subscription
   */
  downgradeSubscription: async (
    subscriptionId: string,
    data: DowngradeSubscriptionData
  ): Promise<SubscriptionResponse> => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.post(
      `/subscriptions/${subscriptionId}/downgrade`,
      data
    );
    return response.data;
  },

  /**
   * Get subscription history
   */
  getSubscriptionHistory: async (
    subscriptionId: string
  ): Promise<SubscriptionHistoryResponse> => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get(
      `/subscriptions/${subscriptionId}/history`
    );
    return response.data;
  },

  // ==================== ADMIN SUBSCRIPTION SERVICES ====================

  /**
   * Get all subscriptions with filtering (Admin only)
   */
  getAllSubscriptions: async (params?: {
    page?: number;
    limit?: number;
    status?: SubscriptionStatus;
    restaurantId?: string;
  }): Promise<SubscriptionsResponse> => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get("/subscriptions", { params });
    return response.data;
  },

  /**
   * Check and expire subscriptions (Admin only - Cron job endpoint)
   */
  checkExpiredSubscriptions: async (): Promise<CheckExpiredResponse> => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.post("/subscriptions/check-expired");
    return response.data;
  },

  // ==================== LOAN ACCESS SERVICES ====================

  /**
   * Create a loan provider (Admin only)
   * POST /subscriptions/loan/providers
   */
  createLoanProvider: async (
    data: CreateLoanProviderData
  ): Promise<LoanProviderResponse> => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.post("/subscriptions/loan/providers", data);
    return response.data;
  },

  /**
   * Get all loan providers
   * GET /subscriptions/loan/providers
   */
  getAllLoanProviders: async (): Promise<LoanProvidersResponse> => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get("/subscriptions/loan/providers");
    return response.data;
  },

  /**
   * Update loan provider (Admin only) — status and/or unlock fee config
   * PATCH /subscriptions/loan/providers/:providerId
   */
  updateLoanProviderStatus: async (
    providerId: string,
    data: {
      isActive?: boolean;
      unlockFeeEnabled?: boolean;
      unlockFeePercentage?: number | null;
    }
  ): Promise<LoanProviderResponse> => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.patch(
      `/subscriptions/loan/providers/${providerId}`,
      data
    );
    return response.data;
  },

  /**
   * Request loan access via a loan-enabled plan (Restaurant/Hotel/Affiliator)
   * POST /subscriptions/loan/request
   */
  requestLoanAccess: async (
    data: RequestLoanAccessData
  ): Promise<SubscriptionResponse> => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.post("/subscriptions/loan/request", data);
    return response.data;
  },

  /**
   * Get my loan access subscriptions (Restaurant)
   * GET /subscriptions/loan/my-subscriptions
   */
  getMyLoanAccess: async (): Promise<LoanAccessSubscriptionsResponse> => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get("/subscriptions/loan/my-subscriptions");
    return response.data;
  },

  /**
   * Get all loan access subscriptions with filters (Admin only)
   * GET /subscriptions/loan
   */
  getAllLoanAccess: async (
    filters?: LoanAccessFilters
  ): Promise<LoanAccessSubscriptionsResponse> => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get("/subscriptions/loan", { params: filters });
    return response.data;
  },

  /**
   * Approve a pending loan access request (Admin only)
   * PATCH /subscriptions/loan/:subscriptionId/approve
   */
  approveLoanAccess: async (
    subscriptionId: string
  ): Promise<SubscriptionResponse> => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.patch(
      `/subscriptions/loan/${subscriptionId}/approve`
    );
    return response.data;
  },

  /**
   * Reject a pending loan access request (Admin only)
   * PATCH /subscriptions/loan/:subscriptionId/reject
   */
  rejectLoanAccess: async (
    subscriptionId: string,
    reason?: string
  ): Promise<SubscriptionResponse> => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.patch(
      `/subscriptions/loan/${subscriptionId}/reject`,
      { reason }
    );
    return response.data;
  },

  /**
   * Disable loan access (Admin only)
   * PATCH /subscriptions/loan/:subscriptionId/disable
   */
  disableLoanAccess: async (
    subscriptionId: string
  ): Promise<SubscriptionResponse> => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.patch(
      `/subscriptions/loan/${subscriptionId}/disable`
    );
    return response.data;
  },

  /**
   * Enable loan access (Admin only)
   * PATCH /subscriptions/loan/:subscriptionId/enable
   */
  enableLoanAccess: async (
    subscriptionId: string
  ): Promise<SubscriptionResponse> => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.patch(
      `/subscriptions/loan/${subscriptionId}/enable`
    );
    return response.data;
  },

  // ==================== UTILITY METHODS ====================

  /**
   * Calculate days remaining until subscription expires
   */
  calculateDaysRemaining: (endDate: string): number => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  },

  /**
   * Check if subscription is about to expire (within 7 days)
   */
  isSubscriptionExpiring: (endDate: string): boolean => {
    const daysRemaining = subscriptionService.calculateDaysRemaining(endDate);
    return daysRemaining <= 7 && daysRemaining > 0;
  },

  /**
   * Check if subscription has expired
   */
  isSubscriptionExpired: (endDate: string): boolean => {
    const end = new Date(endDate);
    const now = new Date();
    return end < now;
  },

  /**
   * Format subscription status for display
   */
  formatSubscriptionStatus: (status: SubscriptionStatus): string => {
    const statusMap: Record<SubscriptionStatus, string> = {
      ACTIVE: "Active",
      EXPIRED: "Expired",
      CANCELLED: "Cancelled",
      SUSPENDED: "Suspended",
      PENDING: "Pending",
    };
    return statusMap[status] || status;
  },

  /**
   * Get subscription status color for UI
   */
  getStatusColor: (status: SubscriptionStatus): string => {
    const colorMap: Record<SubscriptionStatus, string> = {
      ACTIVE: "bg-green-100 text-green-800",
      EXPIRED: "bg-red-100 text-red-800",
      CANCELLED: "bg-gray-100 text-gray-800",
      SUSPENDED: "bg-yellow-100 text-yellow-800",
      PENDING: "bg-blue-100 text-blue-800",
    };
    return colorMap[status] || "bg-gray-100 text-gray-800";
  },

  /**
   * Get payment status color for UI
   */
  getPaymentStatusColor: (status: PaymentStatus): string => {
    const colorMap: Record<PaymentStatus, string> = {
      COMPLETED: "bg-green-100 text-green-800",
      PENDING: "bg-yellow-100 text-yellow-800",
      PROCESSING: "bg-blue-100 text-blue-800",
      FAILED: "bg-red-100 text-red-800",
      CANCELLED: "bg-gray-100 text-gray-800",
      REFUNDED: "bg-purple-100 text-purple-800",
    };
    return colorMap[status] || "bg-gray-100 text-gray-800";
  },
};
