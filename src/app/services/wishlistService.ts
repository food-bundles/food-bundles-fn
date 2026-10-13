/* eslint-disable @typescript-eslint/no-explicit-any */
import createAxiosClient from "@/app/hooks/axiosClient";

// Saved products for the signed-in restaurant / hotel / affiliator
export const wishlistService = {
  // { productIds: string[], products: raw products (same shape as /products) }
  getWishlist: async (): Promise<{ productIds: string[]; products: any[] }> => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get("/wishlist");
    return response.data?.data ?? { productIds: [], products: [] };
  },

  add: async (productId: string) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.post(`/wishlist/${productId}`);
    return response.data;
  },

  remove: async (productId: string) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.delete(`/wishlist/${productId}`);
    return response.data;
  },
};
