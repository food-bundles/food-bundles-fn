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

<<<<<<< HEAD
export interface CustomerTypeUsageProduct {
  id: string;
  productName: string;
  unitPrice: number;
  purchasePrice: number;
  customerTypePrices: {
    id: string;
    price: number;
    purchasePrice: number;
    customerType: {
      id: string;
      name: string;
    };
  }[];
}

export interface CustomerTypeUsageData {
  products: CustomerTypeUsageProduct[];
  customerTypes: { id: string; name: string; isActive: boolean }[];
}

export interface SwapPricingData {
  sourceCustomerTypeId: string;
  targetCustomerTypeId: string;
  productIds: string[];
}

export interface SwapPricingResult {
  message: string;
  updatedCount: number;
  products: {
    productId: string;
    productName: string;
    newPrice: number;
    newPurchasePrice: number;
  }[];
}

export interface PriceUsageEntry {
  id: string;
  name: string;
  role: string;
  phone: string | null;
  email: string | null;
  location: string | null;
  assignedCustomerType: { id: string; name: string; isActive: boolean } | null;
  isExplicitAssignment: boolean;
  isUsingOwnPricing: boolean;
}

export interface PriceUsageData {
  restaurants: PriceUsageEntry[];
  customerTypes: { id: string; name: string; isActive: boolean }[];
}

=======
>>>>>>> de818a5 (dec: this is the customer type feature which will need to make a change on the drawer of create a product and on the productcontroler, model)
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
<<<<<<< HEAD

  toggleCustomerTypeStatus: async (id: string) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.patch(`/customer-types/${id}/status`);
    return response.data;
  },

  getCustomerTypeUsage: async () => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get("/customer-types/usage");
    return response.data;
  },

  swapCustomerTypePricing: async (data: SwapPricingData) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.post("/customer-types/swap-pricing", data);
    return response.data;
  },

  getPriceUsage: async () => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get("/customer-types/price-usage");
    return response.data;
  },

  assignCustomerType: async (restaurantId: string, customerTypeId: string | null) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.patch("/customer-types/assign-customer-type", { restaurantId, customerTypeId });
    return response.data;
  },
=======
>>>>>>> de818a5 (dec: this is the customer type feature which will need to make a change on the drawer of create a product and on the productcontroler, model)
};
