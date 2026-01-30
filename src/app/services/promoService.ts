import createAxiosClient from "../hooks/axiosClient";

export interface IPromoCode {
    id: string;
    code: string;
    name: string;
    description: string;
    type: "PUBLIC" | "PRIVATE" | "SUBSCRIBERS" | "EXCEPTIONAL";
    discountType: "PERCENTAGE" | "FIXED_AMOUNT";
    discountValue: number;
    isReusable: boolean;
    maxUsageCount: number;
    currentUsageCount: number;
    maxUsagePerUser: number;
    minOrderAmount: number;
    minItemQuantity: number;
    applyToAllProducts: boolean;
    applicableProductIds: string[];
    applicableCategoryIds: string[];
    includedRestaurants: Array<{
        restaurantId: string;
        reason: string;
        includedBy: string;
        includedAt: string;
    }>;
    excludedRestaurants: Array<{
        restaurantId: string;
        reason: string;
        excludedBy: string;
        excludedAt: string;
    }>;
    isActive: boolean;
    startDate: string;
    expiryDate: string;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    admin: {
        id: string;
        username: string;
        email: string;
    };
}

export interface ICreatePromoData {
    code: string;
    name: string;
    description: string;
    type: "PUBLIC" | "PRIVATE" | "SUBSCRIBERS" | "EXCEPTIONAL";
    discountType: "PERCENTAGE" | "FIXED_AMOUNT";
    discountValue: number;
    isReusable: boolean;
    maxUsageCount: number;
    maxUsagePerUser: number;
    minOrderAmount: number;
    minItemQuantity: number;
    applyToAllProducts: boolean;
    applicableProductIds?: string[];
    applicableCategoryIds?: string[];
    includedRestaurants?: Array<{
        restaurantId: string;
        reason: string;
    }>;
    excludedRestaurants?: Array<{
        restaurantId: string;
        reason: string;
    }>;
    startDate: string;
    expiryDate: string;
    isActive?: boolean;
}

export const promoService = {
    createPromo: async (promoData: ICreatePromoData) => {
        const axiosClient = createAxiosClient();
        const response = await axiosClient.post("/promo", promoData);
        return response.data;
    },

    getActivePromos: async () => {
        const axiosClient = createAxiosClient();
        const response = await axiosClient.get("/promo/active");
        return response.data;
    },

    calculateCart: async (cartId: string, promoCode: string) => {
        const axiosClient = createAxiosClient();
        const response = await axiosClient.post("/promo/calculate-cart", {
            cartId,
            promoCode
        });
        return response.data;
    },

    getAllPromos: async () => {
        const axiosClient = createAxiosClient();
        const response = await axiosClient.get("/promo");
        return response.data;
    },

    getPromoById: async (id: string) => {
        const axiosClient = createAxiosClient();
        const response = await axiosClient.get(`/promo/${id}`);
        return response.data;
    },

    updatePromo: async (id: string, updateData: Partial<ICreatePromoData>) => {
        const axiosClient = createAxiosClient();
        const response = await axiosClient.put(`/promo/${id}`, updateData);
        return response.data;
    },

    deletePromo: async (id: string) => {
        const axiosClient = createAxiosClient();
        const response = await axiosClient.delete(`/promo/${id}`);
        return response.data;
    },

    excludeRestaurant: async (promoId: string, data: { restaurantId: string; reason: string }) => {
        const axiosClient = createAxiosClient();
        const response = await axiosClient.post(`/promo/${promoId}/exclude`, data);
        return response.data;
    },

    includeRestaurant: async (promoId: string, data: { restaurantId: string; reason: string }) => {
        const axiosClient = createAxiosClient();
        const response = await axiosClient.post(`/promo/${promoId}/include`, data);
        return response.data;
    },

    removeExclusion: async (promoId: string, restaurantId: string) => {
        const axiosClient = createAxiosClient();
        const response = await axiosClient.delete(`/promo/${promoId}/exclude/${restaurantId}`);
        return response.data;
    },

    removeInclusion: async (promoId: string, restaurantId: string) => {
        const axiosClient = createAxiosClient();
        const response = await axiosClient.delete(`/promo/${promoId}/include/${restaurantId}`);
        return response.data;
    },

    validatePromo: async (code: string, data: { orderAmount: number }) => {
        const axiosClient = createAxiosClient();
        const response = await axiosClient.post(`/promo/validate/${code}`, data);
        return response.data;
    },

    applyPromo: async (code: string, data: { orderId: string; items: { productId: string; quantity: number }[] }) => {
        const axiosClient = createAxiosClient();
        const response = await axiosClient.post(`/promo/apply/${code}`, data);
        return response.data;
    }
};
