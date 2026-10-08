/* eslint-disable @typescript-eslint/no-explicit-any */
import createAxiosClient from "@/app/hooks/axiosClient";

const axiosClient = createAxiosClient();

export interface WfpPriceRecord {
  id: string;
  date: string;
  province?: string | null;
  district?: string | null;
  marketName: string;
  marketId?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  category: string;
  commodity: string;
  commodityId?: number | null;
  unit: string;
  priceFlag?: string | null;
  priceType?: string | null;
  currency: string;
  price: number;
  usdPrice?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface WfpAnalyticsData {
  kpis: {
    totalRecords: number;
    totalMarkets: number;
    totalCommodities: number;
    earliestDate: string | null;
    latestDate: string | null;
    selectedDataPoints: number;
    selectedAvgPrice: number;
    minPrice: number;
    maxPrice: number;
    priceSpread: number;
  };
  timeSeries: Array<{
    date: string;
    avgPrice: number;
    minPrice: number;
    maxPrice: number;
    [marketName: string]: any;
  }>;
  marketComparisons: Array<{
    market: string;
    province: string;
    district?: string;
    latitude?: number | null;
    longitude?: number | null;
    avgPrice: number;
    latestPrice?: number;
    dataPoints: number;
  }>;
  topCommodities: Array<{
    commodity: string;
    category: string;
    unit: string;
    records: number;
    avgPrice: number;
  }>;
}

export interface WfpFilterOptions {
  categories: string[];
  commodities: Array<{
    name: string;
    category: string;
    unit: string;
  }>;
  markets: Array<{
    name: string;
    province?: string;
    district?: string;
  }>;
  provinces: string[];
  districts: string[];
  priceTypes: string[];
}

export interface WfpPricesResponse {
  success: boolean;
  data: WfpPriceRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface WfpUploadResponse {
  success: boolean;
  message: string;
  data: {
    totalRows: number;
    insertedCount: number;
    marketsDiscovered: number;
    marketsCreated: number;
    dateRange: {
      earliest: string;
      latest: string;
    };
    durationSeconds: string;
  };
}

export const wfpMarketService = {
  // Upload CSV File with progress callback
  uploadCsv: async (
    file: File,
    onProgress?: (percent: number) => void
  ): Promise<WfpUploadResponse> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axiosClient.post("/markets/wfp/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
      timeout: 300000, // 5 min timeout for large file ingestion
    });

    return response.data;
  },

  // Trigger import from server local path
  importLocalCsv: async (filePath?: string): Promise<WfpUploadResponse> => {
    const response = await axiosClient.post(
      "/markets/wfp/upload",
      { filePath },
      { timeout: 300000 }
    );
    return response.data;
  },

  // Get paginated price records
  getPrices: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    commodity?: string;
    market?: string;
    province?: string;
    district?: string;
    priceType?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: "date" | "price" | "commodity" | "marketName";
    sortOrder?: "asc" | "desc";
  }): Promise<WfpPricesResponse> => {
    const response = await axiosClient.get("/markets/wfp/prices", { params });
    return response.data;
  },

  // Get Analytics & Chart Data
  getAnalytics: async (params?: {
    commodity?: string;
    category?: string;
    market?: string;
    province?: string;
    priceType?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{ success: boolean; data: WfpAnalyticsData }> => {
    const response = await axiosClient.get("/markets/wfp/analytics", {
      params,
    });
    return response.data;
  },

  // Get Dropdown Filter Options
  getFilterOptions: async (): Promise<{
    success: boolean;
    data: WfpFilterOptions;
  }> => {
    const response = await axiosClient.get("/markets/wfp/filter-options");
    return response.data;
  },

  // Clear dataset
  clearPrices: async (): Promise<{ success: boolean; message: string }> => {
    const response = await axiosClient.delete("/markets/wfp/clear");
    return response.data;
  },
};
