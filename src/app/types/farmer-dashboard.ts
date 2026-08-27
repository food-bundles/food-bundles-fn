export interface EarningsSummary {
  thisMonth: number;
  lastMonth: number;
  yearToDate: number;
  avgPerSubmission: number;
}

export interface TopProduct {
  productName: string;
  totalEarnings: number;
  submissionCount: number;
}

export interface SeasonalTrendPoint {
  month: number;
  year: number;
  earnings: number;
}

export interface PerformanceMetrics {
  acceptanceRate: number;
  avgPrice: number;
  topProducts: TopProduct[];
  seasonalTrends: SeasonalTrendPoint[];
}

export interface PreviousYearComparison {
  currentYear: number;
  previousYear: number;
  growthRate: number;
}

export interface ComparisonAnalytics {
  regionalAverage: number;
  previousYear: PreviousYearComparison;
  marketPosition: number;
}

export interface PaymentHistoryItem {
  id: string;
  productName: string;
  acceptedQty: number | null;
  acceptedPrice: number | null;
  totalAmount: number | null;
  paidAt: string | null;
  paymentMethod: string | null;
}

export interface PaymentHistoryResponse {
  recentPayments: PaymentHistoryItem[];
  pendingAmount: number;
  pendingCount: number;
}

export interface EarningsTimeSeriesPoint {
  month: string;
  submissions: number;
  earnings: number;
}

export interface RecentActivityItem {
  id: string;
  successful: boolean;
  attemptTime: string;
  deviceInfo: string | null;
}

export type FarmSizeUnit = "HECTARES" | "ACRES";
export type FarmingMethod = "ORGANIC" | "CONVENTIONAL" | "MIXED";
export type PreferredPaymentMethod = "MOBILE_MONEY" | "BANK_TRANSFER" | "CASH";
export type DeliveryPreference =
  | "FARM_PICKUP"
  | "COOPERATIVE_CENTER"
  | "MARKET_DELIVERY";

export interface FarmerProfileDetails {
  farmSize: number | null;
  farmSizeUnit: FarmSizeUnit | null;
  experienceYears: number | null;
  cooperativeMember: boolean;
  cooperativeName: string | null;
  certifications: string[];
  farmingMethod: FarmingMethod | null;
  preferredPaymentMethod: PreferredPaymentMethod | null;
  minimumOrderQuantity: number | null;
  deliveryPreference: DeliveryPreference | null;
  maxDeliveryDistance: number | null;
}

export interface FarmingProfile {
  id: string;
  phone: string | null;
  email: string | null;
  name: string | null;
  province: string | null;
  district: string | null;
  sector: string | null;
  cell: string | null;
  village: string | null;
  FarmerProfile: FarmerProfileDetails;
  FarmerPrimaryCrop: Array<Record<string, unknown>>;
}

export interface FarmingProfileUpdatePayload {
  farmSize?: number;
  farmSizeUnit?: FarmSizeUnit;
  experienceYears?: number;
  cooperativeMember?: boolean;
  cooperativeName?: string;
  certifications?: string[];
  farmingMethod?: FarmingMethod;
  preferredPaymentMethod?: PreferredPaymentMethod;
  minimumOrderQuantity?: number;
  deliveryPreference?: DeliveryPreference;
  maxDeliveryDistance?: number;
}

export interface VoucherSummary {
  totalApplications: number;
  totalRequested: number;
  totalApproved: number;
  activeVouchers: number;
  totalRemainingCredit: number;
  pendingApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
}

export interface VoucherEligibility {
  isEligible: boolean;
  reason: string;
  maxAmount?: number;
  maxDays?: number;
}

export interface DashboardSummary {
  earnings: EarningsSummary | null;
  vouchers: VoucherSummary;
  profileComplete: boolean;
}

export interface FarmerSettingsPayload {
  smsNotifications?: boolean;
  notificationFrequency?: string;
  preferredLanguage?: string;
}
