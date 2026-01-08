/* eslint-disable @typescript-eslint/no-explicit-any */
import createAxiosClient from "@/app/hooks/axiosClient";

export const affiliatorService = {
    // Create Affiliator
    createAffiliator: async (data: { name: string; email?: string; phone?: string }) => {
        try {
            const axiosClient = createAxiosClient();
            const response = await axiosClient.post("/affiliators", data);
            return {
                success: true,
                data: response.data.data,
                message: response.data.message,
            };
        } catch (error: any) {
            console.error("Create affiliator error:", error);
            throw error;
        }
    },

    // Get My Affiliators
    getMyAffiliators: async () => {
        try {
            const axiosClient = createAxiosClient();
            const response = await axiosClient.get("/affiliators/my-affiliators");
            return {
                success: true,
                data: response.data.data,
                message: response.data.message,
            };
        } catch (error: any) {
            console.error("Get my affiliators error:", error);
            throw error;
        }
    },

    // Get Affiliator by ID
    getAffiliator: async (id: string) => {
        try {
            const axiosClient = createAxiosClient();
            const response = await axiosClient.get(`/affiliators/${id}`);
            return {
                success: true,
                data: response.data.data,
                message: response.data.message,
            };
        } catch (error: any) {
            console.error("Get affiliator error:", error);
            throw error;
        }
    },

    // Update Affiliator
    updateAffiliator: async (id: string, data: { name?: string; email?: string; phone?: string }) => {
        try {
            const axiosClient = createAxiosClient();
            const response = await axiosClient.patch(`/affiliators/${id}`, data);
            return {
                success: true,
                data: response.data.data,
                message: response.data.message,
            };
        } catch (error: any) {
            console.error("Update affiliator error:", error);
            throw error;
        }
    },

    // Delete Affiliator
    deleteAffiliator: async (id: string) => {
        try {
            const axiosClient = createAxiosClient();
            const response = await axiosClient.delete(`/affiliators/${id}`);
            return {
                success: true,
                message: response.data.message,
            };
        } catch (error: any) {
            console.error("Delete affiliator error:", error);
            throw error;
        }
    },

    // Get All Affiliators (Admin only)
    getAllAffiliators: async (params?: { restaurantId?: string; page?: number; limit?: number }) => {
        try {
            const axiosClient = createAxiosClient();
            const response = await axiosClient.get("/affiliators", { params });
            return {
                success: true,
                data: response.data.data,
                pagination: response.data.pagination,
                message: response.data.message,
            };
        } catch (error: any) {
            console.error("Get all affiliators error:", error);
            throw error;
        }
    },
};
