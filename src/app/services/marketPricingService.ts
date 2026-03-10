/* eslint-disable @typescript-eslint/no-explicit-any */
import createAxiosClient from "@/app/hooks/axiosClient";

const axiosClient = createAxiosClient();

// ─────────────────────────────────────────────────────────────────────────────
// Request / Response types
// ─────────────────────────────────────────────────────────────────────────────

export interface Market {
  id: string;
  name: string;
  location?: string | null;
  province?: string | null;
  district?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MarketPriceHistory {
  id: string;
  productId: string;
  marketId: string;
  ourPrice: number;
  marketPrice: number;
  recordedBy: string;
  recordedDate: string;
  createdAt: string;
  product: { id: string; productName: string; unitPrice: number };
  market: {
    id: string;
    name: string;
    province?: string | null;
    district?: string | null;
  };
}

/** Shape returned by /markets/prices/by-product */
export interface PriceByProduct {
  id: string;
  product: { id: string; name: string };
  market: {
    id: string;
    name: string;
    province?: string | null;
    district?: string | null;
  };
  ourPrice: number;
  marketPrice: number;
  difference: number;
  recordedDate: string;
}

export interface ProductOption {
  id: string;
  productName: string;
  unitPrice: number;
  unit: string;
  sku: string;
}

export interface PriceAnalysisResult {
  product: { id: string; name: string; currentPrice: number };
  period: { startDate: string; endDate: string };
  analysis: {
    totalRecords: number;
    avgOurPrice: number;
    avgMarketPrice: number;
    avgDifference: number;
    minMarketPrice: number;
    maxMarketPrice: number;
    priceStatus: "HIGHER" | "LOWER" | "EQUAL";
    profitLoss: "PROFIT" | "LOSS" | "BREAK_EVEN";
    percentageDifference: number;
    message?: string;
  };
  marketBreakdown: Array<{
    market: {
      id: string;
      name: string;
      location?: string | null;
      province?: string | null;
      district?: string | null;
    };
    recordCount: number;
    avgMarketPrice: number;
    avgOurPrice: number;
    avgDifference: number;
    priceStatus: "HIGHER" | "LOWER" | "EQUAL";
    profitLoss: "PROFIT" | "LOSS" | "BREAK_EVEN";
    percentageDifference: number;
  }>;
  priceHistory: Array<{
    id: string;
    ourPrice: number;
    marketPrice: number;
    difference: number;
    recordedDate: string;
    market: { id: string; name: string };
  }>;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: Pagination;
}

// ─────────────────────────────────────────────────────────────────────────────
// Service
// ─────────────────────────────────────────────────────────────────────────────

export const marketPricingService = {
  // ── MARKETS ────────────────────────────────────────────────────────────────

  /**
   * GET /markets
   * Retrieve all external markets with optional filtering and pagination.
   */
  getAllMarkets: async (params?: {
    page?: number;
    limit?: number;
    province?: string;
    district?: string;
    isActive?: boolean;
  }): Promise<ApiResponse<Market[]>> => {
    try {
      const response = await axiosClient.get("/markets", { params });
      return response.data;
    } catch (error: any) {
      console.error("getAllMarkets error:", error);
      throw error;
    }
  },

  /**
   * GET /markets/:marketId
   * Retrieve a single market including its recent price history.
   */
  getMarketById: async (
    marketId: string,
  ): Promise<ApiResponse<Market & { priceHistory: MarketPriceHistory[] }>> => {
    try {
      const response = await axiosClient.get(`/markets/${marketId}`);
      return response.data;
    } catch (error: any) {
      console.error("getMarketById error:", error);
      throw error;
    }
  },

  /**
   * POST /markets
   * Register a new external market for price comparison tracking.
   */
  createMarket: async (data: {
    name: string;
    location?: string;
    province?: string;
    district?: string;
  }): Promise<ApiResponse<Market>> => {
    try {
      const response = await axiosClient.post("/markets", data);
      return response.data;
    } catch (error: any) {
      console.error("createMarket error:", error);
      throw error;
    }
  },

  /**
   * PUT /markets/:marketId
   * Update market information (name, location, province, district, isActive).
   */
  updateMarket: async (
    marketId: string,
    data: {
      name?: string;
      location?: string;
      province?: string;
      district?: string;
      isActive?: boolean;
    },
  ): Promise<ApiResponse<Market>> => {
    try {
      const response = await axiosClient.put(`/markets/${marketId}`, data);
      return response.data;
    } catch (error: any) {
      console.error("updateMarket error:", error);
      throw error;
    }
  },

  /**
   * DELETE /markets/:marketId
   * Remove a market and all its associated price history records.
   */
  deleteMarket: async (
    marketId: string,
  ): Promise<ApiResponse<{ message: string }>> => {
    try {
      const response = await axiosClient.delete(`/markets/${marketId}`);
      return response.data;
    } catch (error: any) {
      console.error("deleteMarket error:", error);
      throw error;
    }
  },

  // ── PRICE RECORDING ────────────────────────────────────────────────────────

  /**
   * POST /markets/prices
   * Record a product price from an external market for comparison.
   */
  recordMarketPrice: async (data: {
    productId: string;
    marketId: string;
    marketPrice: number;
    recordedDate?: string;
  }): Promise<ApiResponse<MarketPriceHistory>> => {
    try {
      const response = await axiosClient.post("/markets/prices", data);
      return response.data;
    } catch (error: any) {
      console.error("recordMarketPrice error:", error);
      throw error;
    }
  },

  // ── PRICE HISTORY ──────────────────────────────────────────────────────────

  /**
   * GET /markets/prices/history
   * Retrieve price history with optional product/market/date filtering.
   */
  getPriceHistory: async (params?: {
    productId?: string;
    marketId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<MarketPriceHistory[]>> => {
    try {
      const response = await axiosClient.get("/markets/prices/history", {
        params,
      });
      return response.data;
    } catch (error: any) {
      console.error("getPriceHistory error:", error);
      throw error;
    }
  },

  /**
   * GET /markets/prices/by-product
   * Retrieve market prices grouped/filtered by product, with optional date range.
   * If productId is omitted, returns prices for all products.
   */
  getPricesByProduct: async (params?: {
    productId?: string;
    marketId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<PriceByProduct[]>> => {
    try {
      const response = await axiosClient.get("/markets/prices/by-product", {
        params,
      });
      return response.data;
    } catch (error: any) {
      console.error("getPricesByProduct error:", error);
      throw error;
    }
  },

  /**
   * PUT /markets/prices/:historyId
   * Correct the marketPrice and/or recordedDate of an existing price record.
   */
  updatePriceHistory: async (
    historyId: string,
    data: {
      marketPrice?: number;
      recordedDate?: string;
    },
  ): Promise<ApiResponse<MarketPriceHistory>> => {
    try {
      const response = await axiosClient.put(
        `/markets/prices/${historyId}`,
        data,
      );
      return response.data;
    } catch (error: any) {
      console.error("updatePriceHistory error:", error);
      throw error;
    }
  },

  /**
   * DELETE /markets/prices/:historyId
   * Remove a single price history record from the system.
   */
  deletePriceHistory: async (
    historyId: string,
  ): Promise<ApiResponse<{ message: string }>> => {
    try {
      const response = await axiosClient.delete(`/markets/prices/${historyId}`);
      return response.data;
    } catch (error: any) {
      console.error("deletePriceHistory error:", error);
      throw error;
    }
  },

  // ── ANALYSIS ───────────────────────────────────────────────────────────────

  /**
   * POST /markets/prices/analyze
   * Comprehensive price analysis: averages, min/max, profit/loss indicator,
   * per-market breakdown, and full price history for the period.
   */
  analyzePrice: async (data: {
    productId: string;
    startDate: string;
    endDate: string;
    marketIds?: string[];
  }): Promise<ApiResponse<PriceAnalysisResult>> => {
    try {
      const response = await axiosClient.post("/markets/prices/analyze", data);
      return response.data;
    } catch (error: any) {
      console.error("analyzePrice error:", error);
      throw error;
    }
  },
};
