import createAxiosClient from "../hooks/axiosClient";

export const ebmService = {
  getItemsFromApi: async (fromDate?: Date) => {
    const axiosClient = createAxiosClient();
    const params: Record<string, string> = {};
    if (fromDate) params.fromDate = fromDate.toISOString();
    const response = await axiosClient.get("/ebm/items/api", { params });
    return response.data;
  },

  getItemsFromDb: async () => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get("/ebm/items/db");
    return response.data;
  },

  registerItemForProduct: async (
    productId: string,
    payload: { itemType: string; taxType: string; packagingUnit: string; quantityUnit: string }
  ) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.post(`/ebm/items/register/${productId}`, payload);
    return response.data;
  },

  createSale: async (orderId: string, payment_method: string) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.post("/ebm/sales", { orderId, payment_method });
    return response.data;
  },

  resendSale: async (invoice_no: number) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.post("/ebm/sales/resend", { invoice_no });
    return response.data;
  },

  refundSale: async (payload: {
    orderId?: string;
    invoice_no: number;
    original_invoice_no: number;
    refund_reason: string;
    payment_method: string;
    items?: any[];
  }) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.post("/ebm/sales/refund", payload);
    return response.data;
  },

  getSale: async (invoice_no: number) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get(`/ebm/sales/${invoice_no}`);
    return response.data;
  },

  getSalesFromDb: async () => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get("/ebm/sales/db");
    return response.data;
  },

  getSales: async (fromDate?: Date) => {
    const axiosClient = createAxiosClient();
    const params: Record<string, string> = {};
    if (fromDate) params.fromDate = fromDate.toISOString();
    const response = await axiosClient.get("/ebm/sales", { params });
    return response.data;
  },
};
