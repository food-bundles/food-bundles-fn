import createAxiosClient from "../hooks/axiosClient";

export interface Market {
  id: string;
  name: string;
  location: string;
  province: string;
  district: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PriceHistory {
  id: string;
  productId: string;
  marketId: string;
  ourPrice: number;
  marketPrice: number;
  recordedDate: string;
  product: {
    id: string;
    productName: string;
    unitPrice: number;
  };
  market: {
    id: string;
    name: string;
    province: string;
    district: string;
  };
}

export interface PriceAnalysis {
  product: {
    id: string;
    name: string;
    currentPrice: number;
  };
  period: {
    startDate: string;
    endDate: string;
  };
  analysis: {
    totalRecords: number;
    avgOurPrice: number;
    avgMarketPrice: number;
    avgDifference: number;
    minMarketPrice: number;
    maxMarketPrice: number;
    priceStatus: "LOWER" | "HIGHER" | "EQUAL";
    profitLoss: "PROFIT" | "LOSS" | "NEUTRAL";
    percentageDifference: number;
  };
  marketBreakdown: Array<{
    market: {
      id: string;
      name: string;
      location: string;
      province: string;
      district: string;
    };
    recordCount: number;
    avgMarketPrice: number;
    avgOurPrice: number;
    avgDifference: number;
    priceStatus: string;
    profitLoss: string;
    percentageDifference: number;
  }>;
  priceHistory: Array<{
    id: string;
    ourPrice: number;
    marketPrice: number;
    difference: number;
    recordedDate: string;
    market: {
      id: string;
      name: string;
    };
  }>;
}

export const marketService = {
  createMarket: async (data: {
    name: string;
    location: string;
    province: string;
    district: string;
  }) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.post("/markets", data);
    return response.data;
  },

  getAllMarkets: async (page = 1, limit = 10) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get(`/markets?page=${page}&limit=${limit}`);
    return response.data;
  },

  getMarketById: async (id: string) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get(`/markets/${id}`);
    return response.data;
  },

  updateMarket: async (marketId: string, data: Partial<Market>) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.put(`/markets/${marketId}`, data);
    return response.data;
  },

  deleteMarket: async (marketId: string) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.delete(`/markets/${marketId}`);
    return response.data;
  },

  recordPrice: async (data: {
    productId: string;
    marketId: string;
    marketPrice: number;
  }) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.post("/markets/prices", data);
    return response.data;
  },

  getPriceHistory: async (page = 1, limit = 10) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get(
      `/markets/prices/history?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  analyzePrices: async (data: {
    productId: string;
    startDate: string;
    endDate: string;
  }) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.post("/markets/prices/analyze", data);
    return response.data;
  },

  getPricesByProduct: async (page = 1, limit = 50) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get(
      `/markets/prices/by-product?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  updatePriceHistory: async (historyId: string, data: { marketPrice?: number; recordedDate?: string }) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.put(`/markets/prices/${historyId}`, data);
    return response.data;
  },

  deleteMarketPriceHistory: async (historyId: string) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.delete(`/markets/prices/${historyId}`);
    return response.data;
  },

  exportMarkets: async (format: 'csv' | 'excel') => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get(`/markets/export/markets?format=${format}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  exportPriceHistory: async (format: 'csv' | 'excel') => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get(`/markets/export/price-history?format=${format}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  exportComparison: async (format: 'csv' | 'excel') => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get(`/markets/export/comparison?format=${format}`, {
      responseType: 'blob',
    });
    return response.data;
  },
};
