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

/** One line of the farmer's money report */
export interface FarmerReportRecord {
  id: string;
  productName: string;
  quantity: number;
  status: string;
  farmerFeedbackStatus: string | null;
  date: string;
  amount: number;
  paymentMethod: "MOMO" | "CASH" | null;
  paidTo: string | null;
  aggregationSite: string | null;
}

/** Money received and coming, split by how it was paid (same as the mobile app's Report) */
export interface FarmerReport {
  wallet: { momoReceived: number; momoPayments: number };
  pending: { amount: number; count: number };
  period: { paidMomo: number; paidCash: number; pending: number };
  records: FarmerReportRecord[];
}

/** The aggregation site the farmer delivers to, with the aggregators who work there */
export interface FarmerSite {
  id: string;
  name: string;
  district: string | null;
  province: string | null;
  distanceKm: number;
  /** Distance measured from the middle of the farmer's district, not a GPS pin */
  approximate: boolean;
  assignedByAdmin: boolean;
  aggregators: { id: string; name: string; phone: string | null }[];
}

/** Language the farmer gets SMS and messages in */
export type FarmerLanguage = "KINY" | "ENG" | "FRE";

/** What Food Bundles pays for a product; the farmer's own crops come first (`mine`) */
export interface FarmerPrice {
  productId: string;
  productName: string;
  unit: string;
  category: string | null;
  /** Per unit, in RWF; null when no price is set yet */
  price: number | null;
  mine: boolean;
}

/** Buyer demand right now for one of the farmer's crops */
export interface CropDemand {
  productId: string;
  cropName: string;
  neededKg: number;
  /** Null while the farmer's prices are locked (no sale to Food Bundles yet) */
  ratePerKg: number | null;
  orderCount: number;
  /** The farmer's aggregation site, where to bring it; null when unknown */
  deliveryPoint: string | null;
}

/** One of the farmer's own submissions, with who receives it and how it was paid */
export interface FarmerSubmissionDetail {
  id: string;
  status: string;
  payment: { method: "MOMO" | "CASH"; amount: number; paidTo: string | null; paidAt: string | null } | null;
  aggregator: { name: string; phone: string | null; assignedAt: string | null } | null;
  deliverySite: { name: string; district: string | null } | null;
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
  // GET /farmers/dashboard/prices: what Food Bundles pays per unit, the farmer's own crops first
  getPrices: async (): Promise<FarmerPrice[]> => {
    const response = await createAxiosClient().get<ApiEnvelope<FarmerPrice[]>>("/farmers/dashboard/prices");
    return response.data.data || [];
  },

  // Prices and buyer demand together, with whether prices are locked: Food Bundles prices are shown only
  // after the farmer's first paid sale (the API leaves them out until then)
  getMarket: async (): Promise<{ prices: FarmerPrice[]; demand: CropDemand[]; pricesLocked: boolean }> => {
    type Locked<T> = ApiEnvelope<T> & { pricesLocked?: boolean };
    const client = createAxiosClient();
    const [prices, demand] = await Promise.all([
      client.get<Locked<FarmerPrice[]>>("/farmers/dashboard/prices"),
      client.get<Locked<CropDemand[]>>("/farmers/dashboard/crop-demand"),
    ]);
    return {
      prices: prices.data.data || [],
      demand: demand.data.data || [],
      pricesLocked: !!prices.data.pricesLocked,
    };
  },

  // GET /farmers/dashboard/crop-demand: buyers' open demand for the farmer's own crops
  getCropDemand: async (): Promise<CropDemand[]> => {
    const response = await createAxiosClient().get<ApiEnvelope<CropDemand[]>>("/farmers/dashboard/crop-demand");
    return response.data.data || [];
  },

  // PUT /farmers/dashboard/primary-crops: the crops the farmer grows (drives demand, requests and matching)
  updatePrimaryCrops: async (productIds: string[]): Promise<void> => {
    await createAxiosClient().put("/farmers/dashboard/primary-crops", { productIds });
  },

  // GET /farmers/dashboard/submissions/:id: one submission with its aggregator, payment and drop-off site
  getSubmissionDetail: async (id: string): Promise<FarmerSubmissionDetail> => {
    const response = await createAxiosClient().get<ApiEnvelope<FarmerSubmissionDetail>>(
      `/farmers/dashboard/submissions/${id}`
    );
    return response.data.data;
  },
  // GET /farmers/dashboard/report?from=: wallet (MoMo received), pending money and every submission with how it was paid
  getReport: async (from?: Date): Promise<FarmerReport> => {
    const response = await createAxiosClient().get<ApiEnvelope<FarmerReport>>("/farmers/dashboard/report", {
      params: from ? { from: from.toISOString() } : {},
    });
    return response.data.data;
  },

  // GET /farmers/dashboard/my-site: the farmer's aggregation site and its aggregators (null when none yet)
  getMySite: async (): Promise<FarmerSite | null> => {
    const response = await createAxiosClient().get<ApiEnvelope<FarmerSite | null>>("/farmers/dashboard/my-site");
    return response.data.data ?? null;
  },

  // PATCH /farmers/dashboard/location: saves the farm's GPS position; the nearest site follows from it
  saveFarmLocation: async (latitude: number, longitude: number): Promise<void> => {
    await createAxiosClient().patch("/farmers/dashboard/location", { latitude, longitude });
  },

  // PATCH /farmers/dashboard/preferences: SMS on/off and the language messages are sent in
  updatePreferences: async (changes: { smsNotifications?: boolean; preferredLanguage?: FarmerLanguage }) => {
    await createAxiosClient().patch("/farmers/dashboard/preferences", changes);
  },
};
