import createAxiosClient from "../hooks/axiosClient";

export const restaurantService = {
  getAllRestaurants: async () => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get("/restaurants");
    return response.data;
  },

  getRestaurantById: async (id: string) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get(`/restaurants/${id}`);
    return response.data;
  },

  acceptAgreement: async (identifier: string) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.post("/restaurants/accept", {
      identifier,
    });
    return response.data;
  },
};