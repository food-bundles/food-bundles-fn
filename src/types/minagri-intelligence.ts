export type TimeframePeriod = "today" | "7d" | "30d" | "seasonal" | "comparison";
export type StockLevel = "High" | "Medium" | "Low" | "Out";
export type AnomalySeverity = "critical" | "warning" | "info";
export type VolatilityLevel = "Stable" | "Moderate" | "High" | "Extreme";

export interface MINAGRIBenchmarkRecord {
  id: string;
  productId: string;
  productName: string;
  category: string;
  unit: string;
  marketName: string;
  region: "Kigali" | "Northern" | "Southern" | "Eastern" | "Western";
  minagriReferencePrice: number;
  platformPrice: number;
  traderAvgPrice: number;
  recordedDate: string;
  lastUpdatedTime: string;
  freshnessStatus: "Fresh Today" | "1 Day Ago" | "2 Days Ago" | "Stale";
  priceChange30d: number;
  volatility: VolatilityLevel;
  confidenceScore: number;
}

export interface RecipeIngredient {
  id: string;
  ingredientName: string;
  quantity: number;
  unit: string;
  currentUnitPrice: number; // RWF per unit
  historicalUnitPrice: number;
  itemCost: number;
}

export interface RecipeItem {
  id: string;
  dishName: string;
  category: string;
  sellingPrice: number;
  ingredients: RecipeIngredient[];
  totalIngredientCost: number;
  foodCostPct: number;
  targetFoodCostPct: number;
  grossMarginRwf: number;
  grossMarginPct: number;
  volatilityLevel: VolatilityLevel;
  opportunityScore: number; // 0 - 100
  substitutionsAvailable: number;
  statusAlert?: "OVER_COST_TARGET" | "HIGH_VOLATILITY" | "OPTIMAL";
}

export interface IngredientSubstitution {
  id: string;
  dishId: string;
  dishName: string;
  originalIngredient: string;
  originalPrice: number;
  proposedIngredient: string;
  proposedPrice: number;
  savingsPct: number;
  qualityMatchPct: number;
  chefApprovalStatus: "PENDING" | "APPROVED" | "REJECTED";
  seasonalityNote: string;
}

export interface PriceForecastItem {
  id: string;
  productId: string;
  productName: string;
  category: string;
  currentPrice: number;
  predictedPriceLow: number;
  predictedPriceExpected: number;
  predictedPriceHigh: number;
  horizonDays: 7 | 14 | 30 | 90;
  confidencePct: number;
  trend: "UPWARD" | "DOWNWARD" | "STABLE";
  primaryDrivers: string[];
}

export interface DemandForecastItem {
  id: string;
  productId: string;
  productName: string;
  category: string;
  buyerSegment: "Restaurants" | "Hotels" | "Institutions" | "Retailers";
  currentMonthlyDemandKg: number;
  projectedNextMonthDemandKg: number;
  growthPct: number;
  seasonalityPeak: string;
  recommendedStockReserveKg: number;
}

export interface SmartRecommendation {
  id: string;
  type: "PROCUREMENT" | "MENU" | "FARMER_PLANTING" | "SOURCING";
  title: string;
  description: string;
  estimatedImpact: string;
  actionText: string;
  confidencePct: number;
  rationale: string;
  timestamp: string;
}

export interface AnomalyRecord {
  id: string;
  type: "PRICE_SPIKE" | "UNUSUAL_QUOTE" | "DEMAND_SURGE" | "DATA_QUALITY";
  severity: AnomalySeverity;
  title: string;
  productName: string;
  location: string;
  detectedDifference: string;
  timestamp: string;
  status: "OPEN" | "REVIEWED" | "RESOLVED";
  recommendedAction: string;
}

export interface FarmerDemandSignal {
  id: string;
  cropName: string;
  category: string;
  region: string;
  targetMonth: string;
  aggregatedMonthlyDemandKg: number;
  demandGrowthTrend: "Increasing" | "Stable" | "Decreasing";
  recommendedPlantingWindow: string;
  minagriBenchmarkPrice: number;
  expectedFarmGatePrice: number;
  contractedBuyersCount: number;
}

export interface SupplierQualityScore {
  supplierId: string;
  supplierName: string;
  region: string;
  productsSupplied: string[];
  fulfillmentReliabilityPct: number;
  freshnessScorePct: number;
  priceCompetitivenessPct: number;
  onTimeDeliveryPct: number;
  overallScore: number; // 0 - 100
  grade: "A+" | "A" | "B" | "C";
}

export interface TraceabilityBatch {
  batchId: string;
  productName: string;
  originFarm: string;
  district: string;
  harvestDate: string;
  deliveryDate: string;
  qualityGrade: "Grade A" | "Grade B" | "Premium";
  certification: "MINAGRI Verified Organic" | "Standard GAP";
  temperatureLogs: string;
  qrCodeId: string;
}

export interface MarketReport {
  id: string;
  title: string;
  reportType: "Weekly Index" | "Monthly Benchmark" | "Inflation Analysis" | "Farmer Supply Outlook";
  publishedDate: string;
  periodCovered: string;
  summary: string;
  downloadSize: string;
  featuredProducts: string[];
}
