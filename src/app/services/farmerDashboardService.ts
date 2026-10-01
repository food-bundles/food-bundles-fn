import createAxiosClient from "@/app/hooks/axiosClient";
import type {
  EarningsSummary,
  PerformanceMetrics,
  ComparisonAnalytics,
  PaymentHistoryResponse,
  EarningsTimeSeriesPoint,
  RecentActivityItem,
  FarmingProfile,
  FarmingProfileUpdatePayload,
  VoucherSummary,
  VoucherEligibility,
  DashboardSummary,
} from "@/app/types/farmer-dashboard";

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

/** Farmer-scoped analytics, farming-profile, and voucher/loan dashboard data. */
export const farmerDashboardService = {
  getSummary: async (): Promise<DashboardSummary> => {
    try {
      const axiosClient = createAxiosClient();
      const response = await axiosClient.get<ApiEnvelope<DashboardSummary>>(
        "/farmers/dashboard/summary"
      );
      return response.data.data;
    } catch (error) {
      console.error("Failed to fetch dashboard summary:", error);
      throw error;
    }
  },

  getEarningsSummary: async (): Promise<EarningsSummary> => {
    try {
      const axiosClient = createAxiosClient();
      const response = await axiosClient.get<ApiEnvelope<EarningsSummary>>(
        "/farmers/dashboard/earnings-summary"
      );
      return response.data.data;
    } catch (error) {
      console.error("Failed to fetch earnings summary:", error);
      throw error;
    }
  },

  getPerformance: async (): Promise<PerformanceMetrics> => {
    try {
      const axiosClient = createAxiosClient();
      const response = await axiosClient.get<ApiEnvelope<PerformanceMetrics>>(
        "/farmers/dashboard/performance"
      );
      return response.data.data;
    } catch (error) {
      console.error("Failed to fetch performance metrics:", error);
      throw error;
    }
  },

  getComparison: async (): Promise<ComparisonAnalytics> => {
    try {
      const axiosClient = createAxiosClient();
      const response = await axiosClient.get<ApiEnvelope<ComparisonAnalytics>>(
        "/farmers/dashboard/comparison"
      );
      return response.data.data;
    } catch (error) {
      console.error("Failed to fetch comparison analytics:", error);
      throw error;
    }
  },

  getPaymentHistory: async (limit = 10): Promise<PaymentHistoryResponse> => {
    try {
      const axiosClient = createAxiosClient();
      const response = await axiosClient.get<
        ApiEnvelope<PaymentHistoryResponse>
      >("/farmers/dashboard/payment-history", { params: { limit } });
      return response.data.data;
    } catch (error) {
      console.error("Failed to fetch payment history:", error);
      throw error;
    }
  },

  getEarningsTimeSeries: async (
    months = 6
  ): Promise<EarningsTimeSeriesPoint[]> => {
    try {
      const axiosClient = createAxiosClient();
      const response = await axiosClient.get<
        ApiEnvelope<EarningsTimeSeriesPoint[]>
      >("/farmers/dashboard/earnings-timeseries", { params: { months } });
      return response.data.data;
    } catch (error) {
      console.error("Failed to fetch earnings time series:", error);
      throw error;
    }
  },

  getRecentActivity: async (): Promise<RecentActivityItem[]> => {
    try {
      const axiosClient = createAxiosClient();
      const response = await axiosClient.get<
        ApiEnvelope<RecentActivityItem[]>
      >("/farmers/dashboard/recent-activity");
      return response.data.data;
    } catch (error) {
      console.error("Failed to fetch recent activity:", error);
      throw error;
    }
  },

  getFarmingProfile: async (): Promise<FarmingProfile> => {
    try {
      const axiosClient = createAxiosClient();
      const response = await axiosClient.get<ApiEnvelope<FarmingProfile>>(
        "/farmers/dashboard/farming-profile"
      );
      return response.data.data;
    } catch (error) {
      console.error("Failed to fetch farming profile:", error);
      throw error;
    }
  },

  updateFarmingProfile: async (
    payload: FarmingProfileUpdatePayload
  ): Promise<FarmingProfile> => {
    try {
      const axiosClient = createAxiosClient();
      const response = await axiosClient.patch<ApiEnvelope<FarmingProfile>>(
        "/farmers/dashboard/farming-profile",
        payload
      );
      return response.data.data;
    } catch (error) {
      console.error("Failed to update farming profile:", error);
      throw error;
    }
  },

  getVoucherSummary: async (): Promise<VoucherSummary> => {
    try {
      const axiosClient = createAxiosClient();
      const response = await axiosClient.get<ApiEnvelope<VoucherSummary>>(
        "/farmers/dashboard/voucher-summary"
      );
      return response.data.data;
    } catch (error) {
      console.error("Failed to fetch voucher summary:", error);
      throw error;
    }
  },

  getVoucherEligibility: async (): Promise<VoucherEligibility> => {
    try {
      const axiosClient = createAxiosClient();
      const response = await axiosClient.get<ApiEnvelope<VoucherEligibility>>(
        "/farmers/dashboard/voucher-eligibility"
      );
      return response.data.data;
    } catch (error) {
      console.error("Failed to fetch voucher eligibility:", error);
      throw error;
    }
  },
};
