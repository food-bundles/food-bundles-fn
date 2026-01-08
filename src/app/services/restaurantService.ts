import createAxiosClient from "../hooks/axiosClient";

export interface RestaurantFilters {
  page?: number;
  limit?: number;
  search?: string;
}

export const restaurantService = {
  getAllRestaurants: async (filters?: RestaurantFilters) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get("/restaurants", { params: filters });
    return response.data;
  },

  getRestaurantById: async (restaurantId: string) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get(`/restaurants/${restaurantId}`);
    return response.data;
  },
};