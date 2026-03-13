import createAxiosClient from "../hooks/axiosClient";

export interface UserLookupResult {
  id: string;
  userType: "FARMER" | "RESTAURANT" | "AFFILIATOR" | "ADMIN";
  name: string;
  email?: string;
  phone?: string;
  [key: string]: any;
}

export const userLookupService = {
  getUserById: async (id: string) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get(`/users/id/${id}`);
    return response.data;
  },

  getUserByEmail: async (email: string) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get(`/users/email/${email}`);
    return response.data;
  },

  getUserByPhone: async (phone: string) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get(`/users/phone/${phone}`);
    return response.data;
  },
};
