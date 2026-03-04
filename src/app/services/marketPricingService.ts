/* eslint-disable @typescript-eslint/no-explicit-any */
import createAxiosClient from "@/app/hooks/axiosClient";

const axiosClient = createAxiosClient();

export const marketPricingService = {
  // Get prices by product
  getPricesByProduct: async (params?: {
    startDate?: string;
    endDate?: string;
    limit?: number;
    productId?: string;
    marketId?: string;
  }) => {
    try {
      const response = await axiosClient.get("/markets/prices/by-product", {
        params,
      });
      return response.data;
    } catch (error: any) {
      console.error("Get prices by product error:", error);
      throw error;
    }
  },

  // Get all markets
  getAllMarkets: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
  }) => {
    try {
      const response = await axiosClient.get("/markets", { params });
      return response.data;
    } catch (error: any) {
      console.error("Get markets error:", error);
      throw error;
    }
  },

  // Analyze price
  analyzePrice: async (data: {
    productId: string;
    startDate: string;
    endDate: string;
  }) => {
    try {
      const response = await axiosClient.post("/markets/prices/analyze", data);
      return response.data;
    } catch (error: any) {
      console.error("Analyze price error:", error);
      throw error;
    }
  },
};
