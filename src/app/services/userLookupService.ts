import createAxiosClient from "../hooks/axiosClient";

export interface UserLookupResult {
  id: string;
  userType: "FARMER" | "RESTAURANT" | "AFFILIATOR" | "ADMIN";
  name: string;
  email?: string;
  phone?: string;
  [key: string]: any;
}

export type UserKind = "FARMER" | "CUSTOMER" | "AFFILIATOR" | "STAFF";

/** One row of the User Lookup search */
export interface UserSearchResult {
  id: string;
  kind: UserKind;
  role: string;
  name: string;
  email: string | null;
  phone: string | null;
  location: string | null;
  createdAt: string;
  deleted: boolean;
  details: { label: string; value: string }[];
  matchedOn: string[];
}

export const userLookupService = {
  /** Any detail someone remembers: name, phone, email, TIN, ID, place, type or role */
  search: async (q: string): Promise<UserSearchResult[]> => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get("/users/search", { params: { q } });
    return response.data?.data ?? [];
  },

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
