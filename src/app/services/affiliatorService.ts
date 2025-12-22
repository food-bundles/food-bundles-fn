/* eslint-disable @typescript-eslint/no-explicit-any */
import createAxiosClient from "@/app/hooks/axiosClient";

const axiosClient = createAxiosClient();
const BASE_URL = "https://server.food.rw";

export const affiliatorService = {
    // Create Affiliator
    createAffiliator: async (data: { name: string; email: string }) => {
        try {
            const response = await axiosClient.post(`${BASE_URL}/affiliators`, data);
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
            const response = await axiosClient.get(`${BASE_URL}/affiliators/my-affiliators`);
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
            const response = await axiosClient.get(`${BASE_URL}/affiliators/${id}`);
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
    updateAffiliator: async (id: string, data: { name?: string; email?: string }) => {
        try {
            // Trying PATCH as it is common for partial updates
            const response = await axiosClient.patch(`${BASE_URL}/affiliators/${id}`, data);
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
            const response = await axiosClient.delete(`${BASE_URL}/affiliators/${id}`);
            return {
                success: true,
                message: response.data.message,
            };
        } catch (error: any) {
            console.error("Delete affiliator error:", error);
            throw error;
        }
    },
};
