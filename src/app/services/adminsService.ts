/* eslint-disable @typescript-eslint/no-explicit-any */
import createAxiosClient from "@/app/hooks/axiosClient";

const axiosClient = createAxiosClient();

export const adminsService = {
  // Get all admins
  getAllAdmins: async (params?: any) => {
    try {
      const response = await axiosClient.get("/admins", { params });
      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination,
      };
    } catch (error: any) {
      console.error("Get admins error:", error);
      throw error;
    }
  },

  // Get admin by ID
  getAdminById: async (adminId: string) => {
    try {
      const response = await axiosClient.get(`/admins/${adminId}`);
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error: any) {
      console.error("Get admin error:", error);
      throw error;
    }
  },

  // Create admin
  createAdmin: async (data: any) => {
    try {
      const response = await axiosClient.post("/admins", data);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error: any) {
      console.error("Create admin error:", error);
      throw error;
    }
  },

  // Update admin
  updateAdmin: async (adminId: string, data: any) => {
    try {
      const response = await axiosClient.put(`/admins/${adminId}`, data);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error: any) {
      console.error("Update admin error:", error);
      throw error;
    }
  },

  // Delete admin
  deleteAdmin: async (adminId: string) => {
    try {
      const response = await axiosClient.delete(`/admins/${adminId}`);
      return {
        success: true,
        message: response.data.message,
      };
    } catch (error: any) {
      console.error("Delete admin error:", error);
      throw error;
    }
  },
};