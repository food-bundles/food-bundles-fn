/* eslint-disable @typescript-eslint/no-explicit-any */
import createAxiosClient from "@/app/hooks/axiosClient";

const axiosClient = createAxiosClient();

export const restaurantService = {
  // Get all restaurants
  getAllRestaurants: async (params?: any) => {
    try {
      const response = await axiosClient.get("/restaurants", { params });
      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination,
      };
    } catch (error: any) {
      console.error("Get restaurants error:", error);
      throw error;
    }
  },

  // Get restaurant by ID
  getRestaurantById: async (restaurantId: string) => {
    try {
      const response = await axiosClient.get(`/restaurants/${restaurantId}`);
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error: any) {
      console.error("Get restaurant error:", error);
      throw error;
    }
  },

  // Update restaurant
  updateRestaurant: async (restaurantId: string, data: any) => {
    try {
      const response = await axiosClient.put(`/restaurants/${restaurantId}`, data);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error: any) {
      console.error("Update restaurant error:", error);
      throw error;
    }
  },

  // Delete restaurant
  deleteRestaurant: async (restaurantId: string) => {
    try {
      const response = await axiosClient.delete(`/restaurants/${restaurantId}`);
      return {
        success: true,
        message: response.data.message,
      };
    } catch (error: any) {
      console.error("Delete restaurant error:", error);
      throw error;
    }
  },

  // Create restaurant
  createRestaurant: async (data: any) => {
    try {
      const response = await axiosClient.post("/restaurants", data);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error: any) {
      console.error("Create restaurant error:", error);
      throw error;
    }
  },

  // Accept agreement
  acceptAgreement: async (identifier: string) => {
    try {
      const response = await axiosClient.post("/restaurants/accept", { identifier });
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error: any) {
      console.error("Accept agreement error:", error);
      throw error;
    }
  },
};