/* eslint-disable @typescript-eslint/no-explicit-any */
import createAxiosClient from "@/app/hooks/axiosClient";

const axiosClient = createAxiosClient();

export const farmersService = {
  // Get all farmers
  getAllFarmers: async (params?: any) => {
    try {
      const response = await axiosClient.get("/farmers", { params });
      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination,
      };
    } catch (error: any) {
      console.error("Get farmers error:", error);
      throw error;
    }
  },

  // Get farmer by ID
  getFarmerById: async (farmerId: string) => {
    try {
      const response = await axiosClient.get(`/farmers/${farmerId}`);
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error: any) {
      console.error("Get farmer error:", error);
      throw error;
    }
  },

  // Create farmer
  createFarmer: async (data: any) => {
    try {
      const response = await axiosClient.post("/farmers", data);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error: any) {
      console.error("Create farmer error:", error);
      throw error;
    }
  },
  createFarmerByAdmin: async (data: any) => {
    try {
      const response = await axiosClient.post("/farmers/admin/create", data);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error: any) {
      console.error("Create farmer error:", error);
      throw error;
    }
  },

  // Update farmer
  updateFarmer: async (farmerId: string, data: any) => {
    try {
      const response = await axiosClient.put(`/farmers/${farmerId}`, data);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error: any) {
      console.error("Update farmer error:", error);
      throw error;
    }
  },

  // Delete farmer
  deleteFarmer: async (farmerId: string) => {
    try {
      const response = await axiosClient.delete(`/farmers/${farmerId}`);
      return {
        success: true,
        message: response.data.message,
      };
    } catch (error: any) {
      console.error("Delete farmer error:", error);
      throw error;
    }
  },
};