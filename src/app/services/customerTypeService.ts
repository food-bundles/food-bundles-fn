import createAxiosClient from "../hooks/axiosClient";

export interface CustomerTypeFormData {
  name: string;
  description?: string;
}

export interface CustomerType {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

export const customerTypeService = {
  createCustomerType: async (data: CustomerTypeFormData) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.post("/customer-types", data);
    return response.data;
  },

  getAllCustomerTypes: async () => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get("/customer-types");
    return response.data;
  },

  getCustomerTypeById: async (id: string) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get(`/customer-types/${id}`);
    return response.data;
  },

  updateCustomerType: async (id: string, data: CustomerTypeFormData) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.patch(`/customer-types/${id}`, data);
    return response.data;
  },

  deleteCustomerType: async (id: string) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.delete(`/customer-types/${id}`);
    return response.data;
  },

  toggleCustomerTypeStatus: async (id: string) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.patch(`/customer-types/${id}/status`);
    return response.data;
  },
};
