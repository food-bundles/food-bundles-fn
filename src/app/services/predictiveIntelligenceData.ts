export type TimeHorizon = "weekly" | "monthly" | "seasonal" | "yearly";

export interface PredictiveOrdersPoint {
  period: string;
  actualOrders: number | null;
  predictedOrders: number;
  vouchersRequested: number;
  voucherConversionRate: number; // percentage
  newUsersJoined: number;
  confidenceLower: number;
  confidenceUpper: number;
}

export interface PredictivePriceItem {
  id: string;
  productName: string;
  category: string;
  unit: string;
  currentFarmerSubmissionPrice: number;
  farmerSubmissionVolumeKg: number;
  submissionVolumeTrendPct: number; // e.g. +35% vs baseline
  historicalAvgPrice: number;
  predictedPrice: number;
  priceTrend: "INCREASING" | "DECREASING" | "STABLE";
  projectedChangePct: number;
  timeframe: TimeHorizon;
  primarySupplyDriver: string;
  historicalVsPredicted: {
    period: string;
    actualPrice: number | null;
    predictedPrice: number;
    submissionVolumeKg: number;
  }[];
}

export interface PredictiveRevenuePoint {
  period: string;
  actualRevenue: number | null;
  predictedRevenue: number;
  actualSalesVolumeKg: number | null;
  predictedSalesVolumeKg: number;
  grossProfit: number;
  voucherRevenueShare: number;
}

export interface AggregatorSupplyStatus {
  id: string;
  name: string;
  phone: string;
  district: string;
  province: string;
  primaryCrops: string[];
  activeFarmersCount: number;
  monthlyCapacityKg: number;
  currentBoughtKg: number;
  capacityUtilizationPct: number;
  buyingStatus: "ALLOWED_TO_BUY" | "NEAR_LIMIT" | "QUOTA_REACHED";
  allowedToBuyMore: boolean;
  qualityRating: number;
}

export interface LocationSupplyMetric {
  district: string;
  province: string;
  totalFarmerSubmissionsKg: number;
  farmerSubmissionsCount: number;
  offersAcceptedCount: number;
  offerAcceptanceRatePct: number;
  aggregatorsActive: number;
  abundantCrops: string[];
  scarceCrops: string[];
  supplyRiskLevel: "LOW" | "MODERATE" | "HIGH";
  recommendation: string;
}

export interface MarketPriceComparisonItem {
  id: string;
  productName: string;
  category: string;
  unit: string;
  farmerPurchasePrice: number; // Purchase price
  marginPct: number; // 30% standard
  ourSellingPrice: number; // farmerPurchasePrice * 1.30
  profitMarginRwf: number; // ourSellingPrice - farmerPurchasePrice
  marketPrices: {
    [marketName: string]: number;
  };
  historicalTrend: {
    date: string;
    ourPrice: number;
    kimironko: number;
    nyabugogo: number;
    musanze: number;
    mahoko: number;
  }[];
}

export const REFERENCE_MARKETS = [
  { id: "Kimironko", name: "Kimironko Market (Kigali)", region: "Kigali City" },
  { id: "Nyabugogo", name: "Nyabugogo Market (Kigali)", region: "Kigali City" },
  { id: "Musanze", name: "Musanze Central Market", region: "Northern Province" },
  { id: "Mahoko", name: "Mahoko Market (Rubavu)", region: "Western Province" },
  { id: "Huye", name: "Huye Main Market", region: "Southern Province" },
  { id: "Rwamagana", name: "Rwamagana Central Market", region: "Eastern Province" },
];

// 1. PREDICTIVE ORDERS & VOUCHERS DATA (Weekly, Monthly, Seasonal, Yearly)
export const MOCK_PREDICTIVE_ORDERS: Record<TimeHorizon, PredictiveOrdersPoint[]> = {
  weekly: [
    { period: "W1 Aug", actualOrders: 210, predictedOrders: 205, vouchersRequested: 65, voucherConversionRate: 88, newUsersJoined: 12, confidenceLower: 195, confidenceUpper: 215 },
    { period: "W2 Aug", actualOrders: 235, predictedOrders: 230, vouchersRequested: 78, voucherConversionRate: 85, newUsersJoined: 15, confidenceLower: 220, confidenceUpper: 240 },
    { period: "W3 Aug", actualOrders: 260, predictedOrders: 255, vouchersRequested: 84, voucherConversionRate: 89, newUsersJoined: 18, confidenceLower: 245, confidenceUpper: 265 },
    { period: "W4 Aug", actualOrders: 290, predictedOrders: 285, vouchersRequested: 95, voucherConversionRate: 91, newUsersJoined: 22, confidenceLower: 275, confidenceUpper: 295 },
    { period: "W1 Sep", actualOrders: 310, predictedOrders: 315, vouchersRequested: 110, voucherConversionRate: 92, newUsersJoined: 26, confidenceLower: 300, confidenceUpper: 330 },
    { period: "W2 Sep", actualOrders: 345, predictedOrders: 340, vouchersRequested: 125, voucherConversionRate: 94, newUsersJoined: 30, confidenceLower: 325, confidenceUpper: 355 },
    { period: "W3 Sep", actualOrders: 380, predictedOrders: 375, vouchersRequested: 140, voucherConversionRate: 90, newUsersJoined: 35, confidenceLower: 360, confidenceUpper: 390 },
    { period: "W4 Sep", actualOrders: null, predictedOrders: 420, vouchersRequested: 165, voucherConversionRate: 89, newUsersJoined: 42, confidenceLower: 395, confidenceUpper: 445 },
    { period: "W1 Oct", actualOrders: null, predictedOrders: 460, vouchersRequested: 180, voucherConversionRate: 92, newUsersJoined: 48, confidenceLower: 430, confidenceUpper: 490 },
    { period: "W2 Oct", actualOrders: null, predictedOrders: 510, vouchersRequested: 205, voucherConversionRate: 93, newUsersJoined: 55, confidenceLower: 475, confidenceUpper: 545 },
  ],
  monthly: [
    { period: "May", actualOrders: 820, predictedOrders: 800, vouchersRequested: 260, voucherConversionRate: 84, newUsersJoined: 45, confidenceLower: 760, confidenceUpper: 840 },
    { period: "Jun", actualOrders: 950, predictedOrders: 930, vouchersRequested: 310, voucherConversionRate: 87, newUsersJoined: 58, confidenceLower: 890, confidenceUpper: 970 },
    { period: "Jul", actualOrders: 1120, predictedOrders: 1100, vouchersRequested: 380, voucherConversionRate: 90, newUsersJoined: 72, confidenceLower: 1050, confidenceUpper: 1150 },
    { period: "Aug", actualOrders: 1340, predictedOrders: 1310, vouchersRequested: 440, voucherConversionRate: 91, newUsersJoined: 88, confidenceLower: 1250, confidenceUpper: 1370 },
    { period: "Sep", actualOrders: 1580, predictedOrders: 1550, vouchersRequested: 520, voucherConversionRate: 93, newUsersJoined: 110, confidenceLower: 1480, confidenceUpper: 1620 },
    { period: "Oct", actualOrders: null, predictedOrders: 1850, vouchersRequested: 640, voucherConversionRate: 91, newUsersJoined: 135, confidenceLower: 1720, confidenceUpper: 1980 },
    { period: "Nov", actualOrders: null, predictedOrders: 2150, vouchersRequested: 750, voucherConversionRate: 92, newUsersJoined: 160, confidenceLower: 2000, confidenceUpper: 2300 },
    { period: "Dec", actualOrders: null, predictedOrders: 2650, vouchersRequested: 980, voucherConversionRate: 95, newUsersJoined: 210, confidenceLower: 2450, confidenceUpper: 2850 },
  ],
  seasonal: [
    { period: "Season 2025-A", actualOrders: 2800, predictedOrders: 2750, vouchersRequested: 890, voucherConversionRate: 86, newUsersJoined: 180, confidenceLower: 2600, confidenceUpper: 2900 },
    { period: "Season 2025-B", actualOrders: 3450, predictedOrders: 3400, vouchersRequested: 1150, voucherConversionRate: 89, newUsersJoined: 240, confidenceLower: 3250, confidenceUpper: 3550 },
    { period: "Season 2025-C", actualOrders: 4200, predictedOrders: 4100, vouchersRequested: 1480, voucherConversionRate: 91, newUsersJoined: 310, confidenceLower: 3900, confidenceUpper: 4300 },
    { period: "Season 2026-A", actualOrders: 5100, predictedOrders: 5050, vouchersRequested: 1820, voucherConversionRate: 93, newUsersJoined: 390, confidenceLower: 4800, confidenceUpper: 5300 },
    { period: "Season 2026-B (Pred)", actualOrders: null, predictedOrders: 6400, vouchersRequested: 2350, voucherConversionRate: 94, newUsersJoined: 480, confidenceLower: 6000, confidenceUpper: 6800 },
    { period: "Season 2026-C (Pred)", actualOrders: null, predictedOrders: 7900, vouchersRequested: 2950, voucherConversionRate: 95, newUsersJoined: 590, confidenceLower: 7400, confidenceUpper: 8400 },
  ],
  yearly: [
    { period: "2023", actualOrders: 6400, predictedOrders: 6200, vouchersRequested: 1900, voucherConversionRate: 82, newUsersJoined: 320, confidenceLower: 5900, confidenceUpper: 6500 },
    { period: "2024", actualOrders: 11800, predictedOrders: 11500, vouchersRequested: 3800, voucherConversionRate: 87, newUsersJoined: 650, confidenceLower: 11000, confidenceUpper: 12000 },
    { period: "2025", actualOrders: 19500, predictedOrders: 19200, vouchersRequested: 6500, voucherConversionRate: 91, newUsersJoined: 1120, confidenceLower: 18500, confidenceUpper: 19900 },
    { period: "2026 (YTD + Pred)", actualOrders: 14200, predictedOrders: 31000, vouchersRequested: 11200, voucherConversionRate: 94, newUsersJoined: 1850, confidenceLower: 29000, confidenceUpper: 33000 },
    { period: "2027 (Forecast)", actualOrders: null, predictedOrders: 48000, vouchersRequested: 18000, voucherConversionRate: 95, newUsersJoined: 2900, confidenceLower: 44000, confidenceUpper: 52000 },
  ],
};

// 2. PREDICTIVE PRICES BASED ON FARMER CROP SUBMISSIONS
export const MOCK_PREDICTIVE_PRICES: PredictivePriceItem[] = [
  {
    id: "pred-tomatoes",
    productName: "Fresh Plum Tomatoes",
    category: "Vegetables",
    unit: "kg",
    currentFarmerSubmissionPrice: 950,
    farmerSubmissionVolumeKg: 18500,
    submissionVolumeTrendPct: 42.5, // 42.5% supply increase
    historicalAvgPrice: 1200,
    predictedPrice: 820,
    priceTrend: "DECREASING",
    projectedChangePct: -13.7,
    timeframe: "monthly",
    primarySupplyDriver: "Heavy harvest inflow from Bugesera & Rwamagana (+42% volume submitted). High supply forces wholesale prices down.",
    historicalVsPredicted: [
      { period: "W1 Aug", actualPrice: 1300, predictedPrice: 1290, submissionVolumeKg: 9500 },
      { period: "W2 Aug", actualPrice: 1250, predictedPrice: 1240, submissionVolumeKg: 11200 },
      { period: "W3 Aug", actualPrice: 1150, predictedPrice: 1160, submissionVolumeKg: 13400 },
      { period: "W4 Aug", actualPrice: 1050, predictedPrice: 1040, submissionVolumeKg: 15600 },
      { period: "W1 Sep", actualPrice: 950, predictedPrice: 960, submissionVolumeKg: 18500 },
      { period: "W2 Sep (Pred)", actualPrice: null, predictedPrice: 890, submissionVolumeKg: 21000 },
      { period: "W3 Sep (Pred)", actualPrice: null, predictedPrice: 840, submissionVolumeKg: 23500 },
      { period: "W4 Sep (Pred)", actualPrice: null, predictedPrice: 820, submissionVolumeKg: 24000 },
    ],
  },
  {
    id: "pred-potatoes",
    productName: "Irish Potatoes (Kinigi)",
    category: "Roots & Tubers",
    unit: "kg",
    currentFarmerSubmissionPrice: 420,
    farmerSubmissionVolumeKg: 34000,
    submissionVolumeTrendPct: 28.0,
    historicalAvgPrice: 490,
    predictedPrice: 380,
    priceTrend: "DECREASING",
    projectedChangePct: -9.5,
    timeframe: "monthly",
    primarySupplyDriver: "Musanze & Nyabihu peak seasonal harvest. Massive farmer submissions entering aggregator collection points.",
    historicalVsPredicted: [
      { period: "W1 Aug", actualPrice: 510, predictedPrice: 505, submissionVolumeKg: 22000 },
      { period: "W2 Aug", actualPrice: 480, predictedPrice: 485, submissionVolumeKg: 25000 },
      { period: "W3 Aug", actualPrice: 460, predictedPrice: 455, submissionVolumeKg: 28000 },
      { period: "W4 Aug", actualPrice: 440, predictedPrice: 435, submissionVolumeKg: 31000 },
      { period: "W1 Sep", actualPrice: 420, predictedPrice: 415, submissionVolumeKg: 34000 },
      { period: "W2 Sep (Pred)", actualPrice: null, predictedPrice: 400, submissionVolumeKg: 37000 },
      { period: "W3 Sep (Pred)", actualPrice: null, predictedPrice: 385, submissionVolumeKg: 39500 },
      { period: "W4 Sep (Pred)", actualPrice: null, predictedPrice: 380, submissionVolumeKg: 40000 },
    ],
  },
  {
    id: "pred-onions",
    productName: "Red Dry Onions",
    category: "Vegetables",
    unit: "kg",
    currentFarmerSubmissionPrice: 820,
    farmerSubmissionVolumeKg: 8200,
    submissionVolumeTrendPct: -26.4, // Supply dropping
    historicalAvgPrice: 850,
    predictedPrice: 980,
    priceTrend: "INCREASING",
    projectedChangePct: +19.5,
    timeframe: "monthly",
    primarySupplyDriver: "Off-season transition in Eastern Province. Farmer submissions down -26% leading to supply deficit.",
    historicalVsPredicted: [
      { period: "W1 Aug", actualPrice: 780, predictedPrice: 790, submissionVolumeKg: 12000 },
      { period: "W2 Aug", actualPrice: 800, predictedPrice: 805, submissionVolumeKg: 10800 },
      { period: "W3 Aug", actualPrice: 810, predictedPrice: 815, submissionVolumeKg: 9500 },
      { period: "W4 Aug", actualPrice: 820, predictedPrice: 830, submissionVolumeKg: 8700 },
      { period: "W1 Sep", actualPrice: 850, predictedPrice: 860, submissionVolumeKg: 8200 },
      { period: "W2 Sep (Pred)", actualPrice: null, predictedPrice: 900, submissionVolumeKg: 7400 },
      { period: "W3 Sep (Pred)", actualPrice: null, predictedPrice: 940, submissionVolumeKg: 6800 },
      { period: "W4 Sep (Pred)", actualPrice: null, predictedPrice: 980, submissionVolumeKg: 6200 },
    ],
  },
  {
    id: "pred-beef",
    productName: "Fresh Beef Cuts",
    category: "Meat & Poultry",
    unit: "kg",
    currentFarmerSubmissionPrice: 3600,
    farmerSubmissionVolumeKg: 12000,
    submissionVolumeTrendPct: -8.0,
    historicalAvgPrice: 3700,
    predictedPrice: 4100,
    priceTrend: "INCREASING",
    projectedChangePct: +13.8,
    timeframe: "monthly",
    primarySupplyDriver: "Nyagatare & Gatsibo feed cost adjustments + strong Q4 restaurant hotel event bookings.",
    historicalVsPredicted: [
      { period: "W1 Aug", actualPrice: 3500, predictedPrice: 3520, submissionVolumeKg: 13500 },
      { period: "W2 Aug", actualPrice: 3550, predictedPrice: 3560, submissionVolumeKg: 13000 },
      { period: "W3 Aug", actualPrice: 3600, predictedPrice: 3620, submissionVolumeKg: 12600 },
      { period: "W4 Aug", actualPrice: 3650, predictedPrice: 3680, submissionVolumeKg: 12200 },
      { period: "W1 Sep", actualPrice: 3750, predictedPrice: 3780, submissionVolumeKg: 12000 },
      { period: "W2 Sep (Pred)", actualPrice: null, predictedPrice: 3880, submissionVolumeKg: 11500 },
      { period: "W3 Sep (Pred)", actualPrice: null, predictedPrice: 3990, submissionVolumeKg: 11000 },
      { period: "W4 Sep (Pred)", actualPrice: null, predictedPrice: 4100, submissionVolumeKg: 10600 },
    ],
  },
  {
    id: "pred-cabbage",
    productName: "Green Cabbage",
    category: "Vegetables",
    unit: "kg",
    currentFarmerSubmissionPrice: 220,
    farmerSubmissionVolumeKg: 16000,
    submissionVolumeTrendPct: 35.0,
    historicalAvgPrice: 270,
    predictedPrice: 195,
    priceTrend: "DECREASING",
    projectedChangePct: -11.4,
    timeframe: "monthly",
    primarySupplyDriver: "Northern province extensive harvest submissions pushing supply ahead of local demand.",
    historicalVsPredicted: [
      { period: "W1 Aug", actualPrice: 280, predictedPrice: 275, submissionVolumeKg: 10000 },
      { period: "W2 Aug", actualPrice: 260, predictedPrice: 255, submissionVolumeKg: 12000 },
      { period: "W3 Aug", actualPrice: 240, predictedPrice: 240, submissionVolumeKg: 13800 },
      { period: "W4 Aug", actualPrice: 230, predictedPrice: 225, submissionVolumeKg: 14900 },
      { period: "W1 Sep", actualPrice: 220, predictedPrice: 215, submissionVolumeKg: 16000 },
      { period: "W2 Sep (Pred)", actualPrice: null, predictedPrice: 205, submissionVolumeKg: 17500 },
      { period: "W3 Sep (Pred)", actualPrice: null, predictedPrice: 198, submissionVolumeKg: 19000 },
      { period: "W4 Sep (Pred)", actualPrice: null, predictedPrice: 195, submissionVolumeKg: 20000 },
    ],
  },
  {
    id: "pred-carrots",
    productName: "Fresh Orange Carrots",
    category: "Vegetables",
    unit: "kg",
    currentFarmerSubmissionPrice: 450,
    farmerSubmissionVolumeKg: 7800,
    submissionVolumeTrendPct: 5.0,
    historicalAvgPrice: 460,
    predictedPrice: 465,
    priceTrend: "STABLE",
    projectedChangePct: +1.1,
    timeframe: "monthly",
    primarySupplyDriver: "Balanced harvest in Gicumbi matching regular restaurant consumption curves.",
    historicalVsPredicted: [
      { period: "W1 Aug", actualPrice: 450, predictedPrice: 455, submissionVolumeKg: 7500 },
      { period: "W2 Aug", actualPrice: 455, predictedPrice: 455, submissionVolumeKg: 7600 },
      { period: "W3 Aug", actualPrice: 460, predictedPrice: 460, submissionVolumeKg: 7700 },
      { period: "W4 Aug", actualPrice: 455, predictedPrice: 460, submissionVolumeKg: 7800 },
      { period: "W1 Sep", actualPrice: 460, predictedPrice: 462, submissionVolumeKg: 7800 },
      { period: "W2 Sep (Pred)", actualPrice: null, predictedPrice: 465, submissionVolumeKg: 7900 },
      { period: "W3 Sep (Pred)", actualPrice: null, predictedPrice: 465, submissionVolumeKg: 8000 },
      { period: "W4 Sep (Pred)", actualPrice: null, predictedPrice: 465, submissionVolumeKg: 8100 },
    ],
  },
];

// 3. REVENUE & PREDICTIVE SALES DATA
export const MOCK_PREDICTIVE_FINANCIALS: Record<TimeHorizon, PredictiveRevenuePoint[]> = {
  weekly: [
    { period: "W1 Aug", actualRevenue: 8400000, predictedRevenue: 8200000, actualSalesVolumeKg: 12500, predictedSalesVolumeKg: 12200, grossProfit: 2520000, voucherRevenueShare: 4200000 },
    { period: "W2 Aug", actualRevenue: 9800000, predictedRevenue: 9500000, actualSalesVolumeKg: 14200, predictedSalesVolumeKg: 13900, grossProfit: 2940000, voucherRevenueShare: 5100000 },
    { period: "W3 Aug", actualRevenue: 11200000, predictedRevenue: 10900000, actualSalesVolumeKg: 16100, predictedSalesVolumeKg: 15800, grossProfit: 3360000, voucherRevenueShare: 6200000 },
    { period: "W4 Aug", actualRevenue: 12900000, predictedRevenue: 12600000, actualSalesVolumeKg: 18400, predictedSalesVolumeKg: 18000, grossProfit: 3870000, voucherRevenueShare: 7400000 },
    { period: "W1 Sep", actualRevenue: 14500000, predictedRevenue: 14300000, actualSalesVolumeKg: 20500, predictedSalesVolumeKg: 20100, grossProfit: 4350000, voucherRevenueShare: 8600000 },
    { period: "W2 Sep", actualRevenue: 16200000, predictedRevenue: 16000000, actualSalesVolumeKg: 22800, predictedSalesVolumeKg: 22400, grossProfit: 4860000, voucherRevenueShare: 9800000 },
    { period: "W3 Sep", actualRevenue: 18100000, predictedRevenue: 17800000, actualSalesVolumeKg: 25300, predictedSalesVolumeKg: 24900, grossProfit: 5430000, voucherRevenueShare: 11200000 },
    { period: "W4 Sep", actualRevenue: null, predictedRevenue: 20400000, actualSalesVolumeKg: null, predictedSalesVolumeKg: 28200, grossProfit: 6120000, voucherRevenueShare: 12800000 },
    { period: "W1 Oct", actualRevenue: null, predictedRevenue: 23100000, actualSalesVolumeKg: null, predictedSalesVolumeKg: 31800, grossProfit: 6930000, voucherRevenueShare: 14600000 },
    { period: "W2 Oct", actualRevenue: null, predictedRevenue: 26000000, actualSalesVolumeKg: null, predictedSalesVolumeKg: 35500, grossProfit: 7800000, voucherRevenueShare: 16800000 },
  ],
  monthly: [
    { period: "May", actualRevenue: 34500000, predictedRevenue: 33800000, actualSalesVolumeKg: 52000, predictedSalesVolumeKg: 50800, grossProfit: 10350000, voucherRevenueShare: 18200000 },
    { period: "Jun", actualRevenue: 41200000, predictedRevenue: 40500000, actualSalesVolumeKg: 61500, predictedSalesVolumeKg: 60200, grossProfit: 12360000, voucherRevenueShare: 22400000 },
    { period: "Jul", actualRevenue: 49800000, predictedRevenue: 48600000, actualSalesVolumeKg: 73200, predictedSalesVolumeKg: 71500, grossProfit: 14940000, voucherRevenueShare: 27800000 },
    { period: "Aug", actualRevenue: 58600000, predictedRevenue: 57400000, actualSalesVolumeKg: 85400, predictedSalesVolumeKg: 83800, grossProfit: 17580000, voucherRevenueShare: 33600000 },
    { period: "Sep", actualRevenue: 69500000, predictedRevenue: 68100000, actualSalesVolumeKg: 99800, predictedSalesVolumeKg: 97900, grossProfit: 20850000, voucherRevenueShare: 40500000 },
    { period: "Oct", actualRevenue: null, predictedRevenue: 82400000, actualSalesVolumeKg: null, predictedSalesVolumeKg: 116500, grossProfit: 24720000, voucherRevenueShare: 49200000 },
    { period: "Nov", actualRevenue: null, predictedRevenue: 97800000, actualSalesVolumeKg: null, predictedSalesVolumeKg: 137000, grossProfit: 29340000, voucherRevenueShare: 59500000 },
    { period: "Dec", actualRevenue: null, predictedRevenue: 124000000, actualSalesVolumeKg: null, predictedSalesVolumeKg: 172000, grossProfit: 37200000, voucherRevenueShare: 78000000 },
  ],
  seasonal: [
    { period: "Season 2025-A", actualRevenue: 128000000, predictedRevenue: 125000000, actualSalesVolumeKg: 185000, predictedSalesVolumeKg: 180000, grossProfit: 38400000, voucherRevenueShare: 68000000 },
    { period: "Season 2025-B", actualRevenue: 162000000, predictedRevenue: 158000000, actualSalesVolumeKg: 232000, predictedSalesVolumeKg: 226000, grossProfit: 48600000, voucherRevenueShare: 89000000 },
    { period: "Season 2025-C", actualRevenue: 198000000, predictedRevenue: 194000000, actualSalesVolumeKg: 280000, predictedSalesVolumeKg: 274000, grossProfit: 59400000, voucherRevenueShare: 114000000 },
    { period: "Season 2026-A", actualRevenue: 245000000, predictedRevenue: 240000000, actualSalesVolumeKg: 345000, predictedSalesVolumeKg: 338000, grossProfit: 73500000, voucherRevenueShare: 145000000 },
    { period: "Season 2026-B (Pred)", actualRevenue: null, predictedRevenue: 310000000, actualSalesVolumeKg: null, predictedSalesVolumeKg: 425000, grossProfit: 93000000, voucherRevenueShare: 188000000 },
    { period: "Season 2026-C (Pred)", actualRevenue: null, predictedRevenue: 395000000, actualSalesVolumeKg: null, predictedSalesVolumeKg: 535000, grossProfit: 118500000, voucherRevenueShare: 245000000 },
  ],
  yearly: [
    { period: "2023", actualRevenue: 280000000, predictedRevenue: 270000000, actualSalesVolumeKg: 420000, predictedSalesVolumeKg: 405000, grossProfit: 84000000, voucherRevenueShare: 135000000 },
    { period: "2024", actualRevenue: 540000000, predictedRevenue: 525000000, actualSalesVolumeKg: 780000, predictedSalesVolumeKg: 760000, grossProfit: 162000000, voucherRevenueShare: 295000000 },
    { period: "2025", actualRevenue: 920000000, predictedRevenue: 895000000, actualSalesVolumeKg: 1290000, predictedSalesVolumeKg: 1260000, grossProfit: 276000000, voucherRevenueShare: 540000000 },
    { period: "2026 (YTD + Pred)", actualRevenue: 680000000, predictedRevenue: 1450000000, actualSalesVolumeKg: 940000, predictedSalesVolumeKg: 1980000, grossProfit: 435000000, voucherRevenueShare: 890000000 },
    { period: "2027 (Forecast)", actualRevenue: null, predictedRevenue: 2350000000, actualSalesVolumeKg: null, predictedSalesVolumeKg: 3150000, grossProfit: 705000000, voucherRevenueShare: 1480000000 },
  ],
};

// 4. SUPPLY INTELLIGENCE DATA
export const MOCK_AGGREGATOR_STATUS: AggregatorSupplyStatus[] = [
  {
    id: "agg-1",
    name: "Jean-Paul Habimana",
    phone: "+250 788 123 456",
    district: "Musanze",
    province: "Northern Province",
    primaryCrops: ["Irish Potatoes", "Cabbage", "Carrots"],
    activeFarmersCount: 84,
    monthlyCapacityKg: 50000,
    currentBoughtKg: 38200,
    capacityUtilizationPct: 76.4,
    buyingStatus: "ALLOWED_TO_BUY",
    allowedToBuyMore: true,
    qualityRating: 4.8,
  },
  {
    id: "agg-2",
    name: "Marie Claire Uwase",
    phone: "+250 788 234 567",
    district: "Bugesera",
    province: "Eastern Province",
    primaryCrops: ["Tomatoes", "Watermelon", "Sweet Potatoes"],
    activeFarmersCount: 65,
    monthlyCapacityKg: 40000,
    currentBoughtKg: 37800,
    capacityUtilizationPct: 94.5,
    buyingStatus: "NEAR_LIMIT",
    allowedToBuyMore: true,
    qualityRating: 4.6,
  },
  {
    id: "agg-3",
    name: "Emmanuel Ndayisaba",
    phone: "+250 788 345 678",
    district: "Nyagatare",
    province: "Eastern Province",
    primaryCrops: ["Beef / Meat", "Maize Grain", "Milk"],
    activeFarmersCount: 52,
    monthlyCapacityKg: 35000,
    currentBoughtKg: 35000,
    capacityUtilizationPct: 100.0,
    buyingStatus: "QUOTA_REACHED",
    allowedToBuyMore: false,
    qualityRating: 4.9,
  },
  {
    id: "agg-4",
    name: "Claudine Mukamana",
    phone: "+250 788 456 789",
    district: "Huye",
    province: "Southern Province",
    primaryCrops: ["Beans", "Sweet Potatoes", "Avocados"],
    activeFarmersCount: 48,
    monthlyCapacityKg: 30000,
    currentBoughtKg: 18500,
    capacityUtilizationPct: 61.6,
    buyingStatus: "ALLOWED_TO_BUY",
    allowedToBuyMore: true,
    qualityRating: 4.5,
  },
  {
    id: "agg-5",
    name: "Innocent Twahirwa",
    phone: "+250 788 567 890",
    district: "Rubavu",
    province: "Western Province",
    primaryCrops: ["Onions", "Green Peppers", "Fish"],
    activeFarmersCount: 42,
    monthlyCapacityKg: 28000,
    currentBoughtKg: 14200,
    capacityUtilizationPct: 50.7,
    buyingStatus: "ALLOWED_TO_BUY",
    allowedToBuyMore: true,
    qualityRating: 4.4,
  },
  {
    id: "agg-6",
    name: "Patrick Munyaneza",
    phone: "+250 788 678 901",
    district: "Rwamagana",
    province: "Eastern Province",
    primaryCrops: ["Bananas", "Pineapples", "Tomatoes"],
    activeFarmersCount: 60,
    monthlyCapacityKg: 45000,
    currentBoughtKg: 32000,
    capacityUtilizationPct: 71.1,
    buyingStatus: "ALLOWED_TO_BUY",
    allowedToBuyMore: true,
    qualityRating: 4.7,
  },
];

export const MOCK_LOCATION_SUPPLY_METRICS: LocationSupplyMetric[] = [
  {
    district: "Musanze",
    province: "Northern Province",
    totalFarmerSubmissionsKg: 64500,
    farmerSubmissionsCount: 142,
    offersAcceptedCount: 128,
    offerAcceptanceRatePct: 90.1,
    aggregatorsActive: 4,
    abundantCrops: ["Irish Potatoes", "Cabbage", "Carrots"],
    scarceCrops: ["Tomatoes", "Fish"],
    supplyRiskLevel: "LOW",
    recommendation: "High farmer offer acceptance. Increase buying quota by +15T to absorb abundant potato harvest.",
  },
  {
    district: "Bugesera",
    province: "Eastern Province",
    totalFarmerSubmissionsKg: 48200,
    farmerSubmissionsCount: 110,
    offersAcceptedCount: 78,
    offerAcceptanceRatePct: 70.9,
    aggregatorsActive: 3,
    abundantCrops: ["Tomatoes", "Watermelon", "Cassava"],
    scarceCrops: ["Beef", "Irish Potatoes"],
    supplyRiskLevel: "MODERATE",
    recommendation: "Lower offer acceptance rate (70.9%) due to tomato price volatility. Re-align aggregator offer pricing to improve retention.",
  },
  {
    district: "Nyagatare",
    province: "Eastern Province",
    totalFarmerSubmissionsKg: 39500,
    farmerSubmissionsCount: 88,
    offersAcceptedCount: 84,
    offerAcceptanceRatePct: 95.4,
    aggregatorsActive: 2,
    abundantCrops: ["Beef Cuts", "Maize Grain", "Milk"],
    scarceCrops: ["Leafy Vegetables", "Fruits"],
    supplyRiskLevel: "LOW",
    recommendation: "Aggregators reached 100% capacity limit. Onboard 1 additional aggregator to handle excess beef/grain supply.",
  },
  {
    district: "Huye",
    province: "Southern Province",
    totalFarmerSubmissionsKg: 28400,
    farmerSubmissionsCount: 74,
    offersAcceptedCount: 65,
    offerAcceptanceRatePct: 87.8,
    aggregatorsActive: 2,
    abundantCrops: ["Beans", "Sweet Potatoes", "Avocados"],
    scarceCrops: ["Tomatoes", "Onions"],
    supplyRiskLevel: "LOW",
    recommendation: "Stable supply with steady legume inflows. Sourcing route operates with 96% punctuality.",
  },
  {
    district: "Rubavu",
    province: "Western Province",
    totalFarmerSubmissionsKg: 24100,
    farmerSubmissionsCount: 62,
    offersAcceptedCount: 39,
    offerAcceptanceRatePct: 62.9, // Low offer acceptance
    aggregatorsActive: 2,
    abundantCrops: ["Onions", "Green Peppers", "Lake Fish"],
    scarceCrops: ["Irish Potatoes", "Beef"],
    supplyRiskLevel: "HIGH",
    recommendation: "CRITICAL: Low offer acceptance (62.9%). Farmers are rejecting aggregator purchase bids and selling across border. Increase purchase offer by 8% to match local competition.",
  },
  {
    district: "Rwamagana",
    province: "Eastern Province",
    totalFarmerSubmissionsKg: 36800,
    farmerSubmissionsCount: 95,
    offersAcceptedCount: 86,
    offerAcceptanceRatePct: 90.5,
    aggregatorsActive: 3,
    abundantCrops: ["Cooking Bananas", "Pineapples", "Papaya"],
    scarceCrops: ["Irish Potatoes", "Meat"],
    supplyRiskLevel: "LOW",
    recommendation: "Excellent fruit and banana supply. Route ready for multi-ton restaurant bundle allocation.",
  },
  {
    district: "Gicumbi",
    province: "Northern Province",
    totalFarmerSubmissionsKg: 21500,
    farmerSubmissionsCount: 54,
    offersAcceptedCount: 47,
    offerAcceptanceRatePct: 87.0,
    aggregatorsActive: 1,
    abundantCrops: ["Carrots", "Peas", "Dairy"],
    scarceCrops: ["Bananas", "Tomatoes"],
    supplyRiskLevel: "LOW",
    recommendation: "High-grade pea and carrot yields. Aggregator operates with top freshness rating.",
  },
  {
    district: "Kigali Urban / Peri-Urban",
    province: "Kigali City",
    totalFarmerSubmissionsKg: 14200,
    farmerSubmissionsCount: 38,
    offersAcceptedCount: 36,
    offerAcceptanceRatePct: 94.7,
    aggregatorsActive: 2,
    abundantCrops: ["Spinach", "Poultry Eggs", "Mushrooms"],
    scarceCrops: ["Maize", "Irish Potatoes", "Beef"],
    supplyRiskLevel: "LOW",
    recommendation: "Specialized micro-greens and poultry collection center directly servicing Kigali hospitality.",
  },
];

// 5. MARKET PRICE INTELLIGENCE & 30% MARGIN ENGINE
export const MOCK_MARKET_BENCHMARK_TABLE: MarketPriceComparisonItem[] = [
  {
    id: "item-1",
    productName: "Tomatoes (Plum Fresh)",
    category: "Vegetables",
    unit: "kg",
    farmerPurchasePrice: 850,
    marginPct: 30,
    ourSellingPrice: 1105, // 850 * 1.30
    profitMarginRwf: 255,
    marketPrices: {
      Kimironko: 1350,
      Nyabugogo: 1250,
      Musanze: 1100,
      Mahoko: 1050,
      Huye: 1200,
      Rwamagana: 1000,
    },
    historicalTrend: [
      { date: "01 Sep", ourPrice: 1105, kimironko: 1300, nyabugogo: 1220, musanze: 1080, mahoko: 1020 },
      { date: "08 Sep", ourPrice: 1105, kimironko: 1320, nyabugogo: 1240, musanze: 1090, mahoko: 1040 },
      { date: "15 Sep", ourPrice: 1105, kimironko: 1350, nyabugogo: 1250, musanze: 1100, mahoko: 1050 },
      { date: "22 Sep", ourPrice: 1105, kimironko: 1350, nyabugogo: 1250, musanze: 1100, mahoko: 1050 },
    ],
  },
  {
    id: "item-2",
    productName: "Irish Potatoes (Kinigi)",
    category: "Roots & Tubers",
    unit: "kg",
    farmerPurchasePrice: 380,
    marginPct: 30,
    ourSellingPrice: 494, // 380 * 1.30
    profitMarginRwf: 114,
    marketPrices: {
      Kimironko: 560,
      Nyabugogo: 520,
      Musanze: 450,
      Mahoko: 460,
      Huye: 510,
      Rwamagana: 530,
    },
    historicalTrend: [
      { date: "01 Sep", ourPrice: 494, kimironko: 580, nyabugogo: 540, musanze: 470, mahoko: 480 },
      { date: "08 Sep", ourPrice: 494, kimironko: 570, nyabugogo: 530, musanze: 460, mahoko: 470 },
      { date: "15 Sep", ourPrice: 494, kimironko: 560, nyabugogo: 520, musanze: 450, mahoko: 460 },
      { date: "22 Sep", ourPrice: 494, kimironko: 560, nyabugogo: 520, musanze: 450, mahoko: 460 },
    ],
  },
  {
    id: "item-3",
    productName: "Red Dry Onions",
    category: "Vegetables",
    unit: "kg",
    farmerPurchasePrice: 750,
    marginPct: 30,
    ourSellingPrice: 975, // 750 * 1.30
    profitMarginRwf: 225,
    marketPrices: {
      Kimironko: 1050,
      Nyabugogo: 980,
      Musanze: 920,
      Mahoko: 890,
      Huye: 990,
      Rwamagana: 900,
    },
    historicalTrend: [
      { date: "01 Sep", ourPrice: 975, kimironko: 1000, nyabugogo: 950, musanze: 890, mahoko: 860 },
      { date: "08 Sep", ourPrice: 975, kimironko: 1020, nyabugogo: 960, musanze: 900, mahoko: 870 },
      { date: "15 Sep", ourPrice: 975, kimironko: 1050, nyabugogo: 980, musanze: 920, mahoko: 890 },
      { date: "22 Sep", ourPrice: 975, kimironko: 1050, nyabugogo: 980, musanze: 920, mahoko: 890 },
    ],
  },
  {
    id: "item-4",
    productName: "Fresh Beef Cuts (Grade A)",
    category: "Meat & Poultry",
    unit: "kg",
    farmerPurchasePrice: 3500,
    marginPct: 30,
    ourSellingPrice: 4550, // 3500 * 1.30
    profitMarginRwf: 1050,
    marketPrices: {
      Kimironko: 4900,
      Nyabugogo: 4750,
      Musanze: 4600,
      Mahoko: 4500,
      Huye: 4700,
      Rwamagana: 4400,
    },
    historicalTrend: [
      { date: "01 Sep", ourPrice: 4550, kimironko: 4800, nyabugogo: 4650, musanze: 4500, mahoko: 4400 },
      { date: "08 Sep", ourPrice: 4550, kimironko: 4850, nyabugogo: 4700, musanze: 4550, mahoko: 4450 },
      { date: "15 Sep", ourPrice: 4550, kimironko: 4900, nyabugogo: 4750, musanze: 4600, mahoko: 4500 },
      { date: "22 Sep", ourPrice: 4550, kimironko: 4900, nyabugogo: 4750, musanze: 4600, mahoko: 4500 },
    ],
  },
  {
    id: "item-5",
    productName: "Green Cabbage (Head)",
    category: "Vegetables",
    unit: "kg",
    farmerPurchasePrice: 180,
    marginPct: 30,
    ourSellingPrice: 234, // 180 * 1.30
    profitMarginRwf: 54,
    marketPrices: {
      Kimironko: 320,
      Nyabugogo: 280,
      Musanze: 220,
      Mahoko: 210,
      Huye: 270,
      Rwamagana: 250,
    },
    historicalTrend: [
      { date: "01 Sep", ourPrice: 234, kimironko: 340, nyabugogo: 300, musanze: 240, mahoko: 230 },
      { date: "08 Sep", ourPrice: 234, kimironko: 330, nyabugogo: 290, musanze: 230, mahoko: 220 },
      { date: "15 Sep", ourPrice: 234, kimironko: 320, nyabugogo: 280, musanze: 220, mahoko: 210 },
      { date: "22 Sep", ourPrice: 234, kimironko: 320, nyabugogo: 280, musanze: 220, mahoko: 210 },
    ],
  },
  {
    id: "item-6",
    productName: "Whole Local Chicken",
    category: "Meat & Poultry",
    unit: "kg",
    farmerPurchasePrice: 3000,
    marginPct: 30,
    ourSellingPrice: 3900, // 3000 * 1.30
    profitMarginRwf: 900,
    marketPrices: {
      Kimironko: 4200,
      Nyabugogo: 4000,
      Musanze: 3800,
      Mahoko: 3750,
      Huye: 3950,
      Rwamagana: 3700,
    },
    historicalTrend: [
      { date: "01 Sep", ourPrice: 3900, kimironko: 4100, nyabugogo: 3950, musanze: 3750, mahoko: 3700 },
      { date: "08 Sep", ourPrice: 3900, kimironko: 4150, nyabugogo: 3980, musanze: 3780, mahoko: 3720 },
      { date: "15 Sep", ourPrice: 3900, kimironko: 4200, nyabugogo: 4000, musanze: 3800, mahoko: 3750 },
      { date: "22 Sep", ourPrice: 3900, kimironko: 4200, nyabugogo: 4000, musanze: 3800, mahoko: 3750 },
    ],
  },
  {
    id: "item-7",
    productName: "Fresh Orange Carrots",
    category: "Vegetables",
    unit: "kg",
    farmerPurchasePrice: 380,
    marginPct: 30,
    ourSellingPrice: 494, // 380 * 1.30
    profitMarginRwf: 114,
    marketPrices: {
      Kimironko: 580,
      Nyabugogo: 530,
      Musanze: 480,
      Mahoko: 470,
      Huye: 520,
      Rwamagana: 500,
    },
    historicalTrend: [
      { date: "01 Sep", ourPrice: 494, kimironko: 560, nyabugogo: 510, musanze: 460, mahoko: 450 },
      { date: "08 Sep", ourPrice: 494, kimironko: 570, nyabugogo: 520, musanze: 470, mahoko: 460 },
      { date: "15 Sep", ourPrice: 494, kimironko: 580, nyabugogo: 530, musanze: 480, mahoko: 470 },
      { date: "22 Sep", ourPrice: 494, kimironko: 580, nyabugogo: 530, musanze: 480, mahoko: 470 },
    ],
  },
  {
    id: "item-8",
    productName: "Cooking Bananas (Ibitoki)",
    category: "Fruits & Bananas",
    unit: "kg",
    farmerPurchasePrice: 320,
    marginPct: 30,
    ourSellingPrice: 416, // 320 * 1.30
    profitMarginRwf: 96,
    marketPrices: {
      Kimironko: 480,
      Nyabugogo: 450,
      Musanze: 420,
      Mahoko: 400,
      Huye: 430,
      Rwamagana: 360,
    },
    historicalTrend: [
      { date: "01 Sep", ourPrice: 416, kimironko: 470, nyabugogo: 440, musanze: 410, mahoko: 390 },
      { date: "08 Sep", ourPrice: 416, kimironko: 475, nyabugogo: 445, musanze: 415, mahoko: 395 },
      { date: "15 Sep", ourPrice: 416, kimironko: 480, nyabugogo: 450, musanze: 420, mahoko: 400 },
      { date: "22 Sep", ourPrice: 416, kimironko: 480, nyabugogo: 450, musanze: 420, mahoko: 400 },
    ],
  },
  {
    id: "item-9",
    productName: "Dry Yellow Beans",
    category: "Grains & Pulses",
    unit: "kg",
    farmerPurchasePrice: 900,
    marginPct: 30,
    ourSellingPrice: 1170, // 900 * 1.30
    profitMarginRwf: 270,
    marketPrices: {
      Kimironko: 1350,
      Nyabugogo: 1280,
      Musanze: 1200,
      Mahoko: 1180,
      Huye: 1150,
      Rwamagana: 1220,
    },
    historicalTrend: [
      { date: "01 Sep", ourPrice: 1170, kimironko: 1320, nyabugogo: 1250, musanze: 1180, mahoko: 1160 },
      { date: "08 Sep", ourPrice: 1170, kimironko: 1340, nyabugogo: 1270, musanze: 1190, mahoko: 1170 },
      { date: "15 Sep", ourPrice: 1170, kimironko: 1350, nyabugogo: 1280, musanze: 1200, mahoko: 1180 },
      { date: "22 Sep", ourPrice: 1170, kimironko: 1350, nyabugogo: 1280, musanze: 1200, mahoko: 1180 },
    ],
  },
  {
    id: "item-10",
    productName: "Green Bell Pepper (Poivron)",
    category: "Vegetables",
    unit: "kg",
    farmerPurchasePrice: 650,
    marginPct: 30,
    ourSellingPrice: 845, // 650 * 1.30
    profitMarginRwf: 195,
    marketPrices: {
      Kimironko: 980,
      Nyabugogo: 920,
      Musanze: 850,
      Mahoko: 780, // Mahoko is 780 < ourSellingPrice 845!
      Huye: 890,
      Rwamagana: 860,
    },
    historicalTrend: [
      { date: "01 Sep", ourPrice: 845, kimironko: 950, nyabugogo: 900, musanze: 830, mahoko: 760 },
      { date: "08 Sep", ourPrice: 845, kimironko: 965, nyabugogo: 910, musanze: 840, mahoko: 770 },
      { date: "15 Sep", ourPrice: 845, kimironko: 980, nyabugogo: 920, musanze: 850, mahoko: 780 },
      { date: "22 Sep", ourPrice: 845, kimironko: 980, nyabugogo: 920, musanze: 850, mahoko: 780 },
    ],
  },
];

// =========================================================================
// 6. VIRTUAL STOCK INTELLIGENCE (FARMERS OFFERS ACCEPTED & PAID)
// =========================================================================
export interface VirtualStockItem {
  id: string;
  cropName: string;
  category: string;
  unit: string;
  submittedKg: number;
  acceptedKg: number;
  paidKg: number;
  inTransitKg: number;
  allocatedToOrdersKg: number;
  availableVirtualStockKg: number;
  unitPurchasePriceAvg: number;
  virtualStockValueRwf: number;
  primaryLocation: string;
  topAggregator: string;
  fulfillmentDays: number;
  stockStatus: "SURPLUS" | "OPTIMAL" | "LOW_BUFFER" | "CRITICAL";
  recommendation: string;
}

export interface VirtualStockPipelineSummary {
  totalSubmittedKg: number;
  totalAcceptedKg: number;
  totalPaidKg: number;
  totalInTransitKg: number;
  totalAllocatedKg: number;
  netAvailableVirtualStockKg: number;
  totalVirtualStockValueRwf: number;
  acceptedConversionRatePct: number;
  paidExecutionRatePct: number;
}

export const MOCK_VIRTUAL_STOCK_ITEMS: VirtualStockItem[] = [
  {
    id: "vs-1",
    cropName: "Fresh Plum Tomatoes",
    category: "Vegetables",
    unit: "kg",
    submittedKg: 24500,
    acceptedKg: 19800,
    paidKg: 16500,
    inTransitKg: 8500,
    allocatedToOrdersKg: 12400,
    availableVirtualStockKg: 7400, // (19800 accepted) - 12400 allocated
    unitPurchasePriceAvg: 850,
    virtualStockValueRwf: 6290000,
    primaryLocation: "Bugesera / Rwamagana",
    topAggregator: "Marie Claire Uwase",
    fulfillmentDays: 6.2,
    stockStatus: "OPTIMAL",
    recommendation: "Adequate virtual buffer. 16.5T paid offers ensure order fulfillment for the next 6 days.",
  },
  {
    id: "vs-2",
    cropName: "Irish Potatoes (Kinigi)",
    category: "Roots & Tubers",
    unit: "kg",
    submittedKg: 52000,
    acceptedKg: 46500,
    paidKg: 41200,
    inTransitKg: 22000,
    allocatedToOrdersKg: 28000,
    availableVirtualStockKg: 18500,
    unitPurchasePriceAvg: 380,
    virtualStockValueRwf: 7030000,
    primaryLocation: "Musanze / Nyabihu",
    topAggregator: "Jean-Paul Habimana",
    fulfillmentDays: 14.5,
    stockStatus: "SURPLUS",
    recommendation: "High surplus virtual buffer (+18.5T unallocated). Ready for multi-ton restaurant bundle distribution.",
  },
  {
    id: "vs-3",
    cropName: "Red Dry Onions",
    category: "Vegetables",
    unit: "kg",
    submittedKg: 11200,
    acceptedKg: 6800,
    paidKg: 5200,
    inTransitKg: 2100,
    allocatedToOrdersKg: 5800,
    availableVirtualStockKg: 1000,
    unitPurchasePriceAvg: 750,
    virtualStockValueRwf: 750000,
    primaryLocation: "Rubavu / Rwamagana",
    topAggregator: "Innocent Twahirwa",
    fulfillmentDays: 1.8,
    stockStatus: "CRITICAL",
    recommendation: "CRITICAL DEFICIT: Only 1,000 kg virtual buffer remaining (1.8 days). Urge aggregators to accept pending farmer offers in Rubavu immediately.",
  },
  {
    id: "vs-4",
    cropName: "Fresh Beef Cuts (Grade A)",
    category: "Meat & Poultry",
    unit: "kg",
    submittedKg: 18500,
    acceptedKg: 17200,
    paidKg: 16800,
    inTransitKg: 6400,
    allocatedToOrdersKg: 11500,
    availableVirtualStockKg: 5700,
    unitPurchasePriceAvg: 3500,
    virtualStockValueRwf: 19950000,
    primaryLocation: "Nyagatare / Gatsibo",
    topAggregator: "Emmanuel Ndayisaba",
    fulfillmentDays: 7.0,
    stockStatus: "OPTIMAL",
    recommendation: "97.6% offer payment rate. 5.7T virtual reserve safely covers upcoming hotel weekend orders.",
  },
  {
    id: "vs-5",
    cropName: "Green Cabbage",
    category: "Vegetables",
    unit: "kg",
    submittedKg: 22000,
    acceptedKg: 19500,
    paidKg: 17200,
    inTransitKg: 9000,
    allocatedToOrdersKg: 10200,
    availableVirtualStockKg: 9300,
    unitPurchasePriceAvg: 180,
    virtualStockValueRwf: 1674000,
    primaryLocation: "Musanze / Gicumbi",
    topAggregator: "Jean-Paul Habimana",
    fulfillmentDays: 11.2,
    stockStatus: "SURPLUS",
    recommendation: "Healthy cabbage reserves. Inflow rate exceeds daily restaurant consumption by +35%.",
  },
  {
    id: "vs-6",
    cropName: "Whole Local Chicken",
    category: "Meat & Poultry",
    unit: "kg",
    submittedKg: 8500,
    acceptedKg: 7400,
    paidKg: 6900,
    inTransitKg: 3200,
    allocatedToOrdersKg: 5400,
    availableVirtualStockKg: 2000,
    unitPurchasePriceAvg: 3000,
    virtualStockValueRwf: 6000000,
    primaryLocation: "Bugesera / Kigali Peri-Urban",
    topAggregator: "Marie Claire Uwase",
    fulfillmentDays: 4.1,
    stockStatus: "LOW_BUFFER",
    recommendation: "Virtual buffer at 4 days. Approve additional smallholder poultry submissions to maintain weekend buffer.",
  },
  {
    id: "vs-7",
    cropName: "Fresh Orange Carrots",
    category: "Vegetables",
    unit: "kg",
    submittedKg: 14200,
    acceptedKg: 12500,
    paidKg: 11000,
    inTransitKg: 4800,
    allocatedToOrdersKg: 7800,
    availableVirtualStockKg: 4700,
    unitPurchasePriceAvg: 380,
    virtualStockValueRwf: 1786000,
    primaryLocation: "Gicumbi / Musanze",
    topAggregator: "Jean-Paul Habimana",
    fulfillmentDays: 8.5,
    stockStatus: "OPTIMAL",
    recommendation: "Steady virtual pipeline from Gicumbi with consistent high quality.",
  },
  {
    id: "vs-8",
    cropName: "Cooking Bananas (Ibitoki)",
    category: "Fruits & Bananas",
    unit: "kg",
    submittedKg: 28000,
    acceptedKg: 25400,
    paidKg: 22800,
    inTransitKg: 11500,
    allocatedToOrdersKg: 16500,
    availableVirtualStockKg: 8900,
    unitPurchasePriceAvg: 320,
    virtualStockValueRwf: 2848000,
    primaryLocation: "Rwamagana / Ngoma",
    topAggregator: "Patrick Munyaneza",
    fulfillmentDays: 9.8,
    stockStatus: "OPTIMAL",
    recommendation: "Strong banana pipeline. Aggregators are expediting transport to Kigali distribution hub.",
  },
  {
    id: "vs-9",
    cropName: "Dry Yellow Beans",
    category: "Grains & Pulses",
    unit: "kg",
    submittedKg: 19500,
    acceptedKg: 17200,
    paidKg: 15400,
    inTransitKg: 7200,
    allocatedToOrdersKg: 11000,
    availableVirtualStockKg: 6200,
    unitPurchasePriceAvg: 900,
    virtualStockValueRwf: 5580000,
    primaryLocation: "Huye / Gisagara",
    topAggregator: "Claudine Mukamana",
    fulfillmentDays: 12.0,
    stockStatus: "SURPLUS",
    recommendation: "Dry grain pipeline is well-established with 15.4T secured and ready for long-term dispatch.",
  },
  {
    id: "vs-10",
    cropName: "Green Bell Pepper (Poivron)",
    category: "Vegetables",
    unit: "kg",
    submittedKg: 9200,
    acceptedKg: 6200,
    paidKg: 4800,
    inTransitKg: 1900,
    allocatedToOrdersKg: 4600,
    availableVirtualStockKg: 1600,
    unitPurchasePriceAvg: 650,
    virtualStockValueRwf: 1040000,
    primaryLocation: "Rubavu / Musanze",
    topAggregator: "Innocent Twahirwa",
    fulfillmentDays: 3.2,
    stockStatus: "LOW_BUFFER",
    recommendation: "Low acceptance in Western Province. Review aggregator price offers to secure farmer commitments.",
  },
];

export const MOCK_VIRTUAL_STOCK_PIPELINE: VirtualStockPipelineSummary = {
  totalSubmittedKg: 207600,
  totalAcceptedKg: 177500,
  totalPaidKg: 158000,
  totalInTransitKg: 76600,
  totalAllocatedKg: 113200,
  netAvailableVirtualStockKg: 64300,
  totalVirtualStockValueRwf: 52943000,
  acceptedConversionRatePct: 85.5,
  paidExecutionRatePct: 89.0,
};

