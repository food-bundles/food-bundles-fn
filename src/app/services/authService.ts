// Frontend Auth Service - Token-Based
import {
  ICreateFarmerData,
  ICreateRestaurantData,
  ILoginData,
} from "@/lib/types";
import createAxiosClient, { setToken, removeToken } from "../hooks/axiosClient";

export const authService = {
  login: async (loginData: ILoginData) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.post("/login", loginData);

    if (response.data.success && response.data.token) {
      if (typeof window !== "undefined") {
        setToken(response.data.token);
        document.cookie = `auth-token=${response.data.token}; path=/; max-age=86400; secure; samesite=strict`;
      }
    }

    return response.data;
  },

  registerFarmer: async (farmerData: ICreateFarmerData) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.post("/farmers", farmerData);
    return response.data;
  },

  registerRestaurant: async (restaurantData: ICreateRestaurantData) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.post("/restaurants", restaurantData);
    return response.data;
  },

  getCurrentUser: async () => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get("/me");
    return response.data;
  },

  logout: async () => {
    removeToken();
    return { success: true, message: "Logged out successfully" };
  },

  healthCheck: async () => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get("/health");
    return response.data;
  },
};
