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
    console.log("Login response:", response);

    if (response.data.success && response.data.token) {
      if (typeof window !== "undefined") {
        setToken(response.data.token);
        document.cookie = `auth-token=${response.data.token}; path=/; max-age=86400; secure; samesite=strict`;
        
        // Store restaurantId for affiliators
        const user = response.data.user || response.data.data?.user;
        if (user?.restaurantId) {
          localStorage.setItem('restaurantId', user.restaurantId);
        }
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
  registerRestaurantByAdmin: async (restaurantData: ICreateRestaurantData) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.post("/admin/create", restaurantData);
    return response.data;
  },

  verifyRestaurant: async (phone: string, otp: string) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.post("/restaurants/verify", {
      phone,
      otp,
    });
    return response.data;
  },

  acceptAgreement: async (identifier: string) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.post("/restaurants/accept", {
      identifier,
    });
    return response.data;
  },

  resendOTP: async (phone: string) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.post("/restaurants/resend-otp", {
      phone,
    });
    return response.data;
  },

  getCurrentUser: async () => {
    try {
      const axiosClient = createAxiosClient();
      const response = await axiosClient.get("/me");
      return response.data;
    } catch (error) {
      console.warn("getCurrentUser failed, user may not be authenticated");
      return null;
    }
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

  forgotPassword: async (email: string) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.post("/forgot-password", { email });
    return response.data;
  },

  resetPassword: async (token: string, newPassword: string) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.post("/reset-password", {
      token,
      newPassword,
    });
    return response.data;
  },
};
