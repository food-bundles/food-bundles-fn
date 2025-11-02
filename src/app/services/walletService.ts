import createAxiosClient from "../hooks/axiosClient";

export interface ICreateWalletData {
  currency: "RWF";
}

export interface ITopUpData {
  amount: number;
  paymentMethod: "MOBILE_MONEY" | "CARD";
  phoneNumber?: string;
  cardDetails?: {
    cardNumber: string;
    cvv: string;
    expiryMonth: string;
    expiryYear: string;
    pin: string;
  };
  description?: string;
}

export interface IWalletUpdateData {
  isActive: boolean;
}

export interface IWalletAdjustmentData {
  amount: number;
  type: "credit" | "debit";
  description: string;
}

export const walletService = {
  // Wallet Management
  createWallet: async (walletData: ICreateWalletData) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.post("/wallets", walletData);
    return response.data;
  },

  getMyWallet: async () => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get("/wallets/my-wallet");
    return response.data;
  },

  topUpWallet: async (topUpData: ITopUpData) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.post("wallets/top-up", topUpData);
    return response.data;
  },

  // Transactions
  getTransactions: async (params?: { page?: number; limit?: number }) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get("/wallets/transactions", { params });
    return response.data;
  },

  getTransactionById: async (transactionId: string) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get(`/wallets/transactions/${transactionId}`);
    return response.data;
  },

  verifyTopUp: async (transactionId: string) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.post(`/wallets/verify-topup/${transactionId}`);
    return response.data;
  },

  // Admin Only Methods
  getAllWallets: async (params?: { page?: number; limit?: number }) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get("/wallets", { params });
    return response.data;
  },

  getWalletById: async (walletId: string) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get(`/wallets/${walletId}`);
    return response.data;
  },

  updateWalletStatus: async (walletId: string, updateData: IWalletUpdateData) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.put(`/wallets/${walletId}`, updateData);
    return response.data;
  },

  adjustWalletBalance: async (walletId: string, adjustmentData: IWalletAdjustmentData) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.post(`/wallets/${walletId}/adjust`, adjustmentData);
    return response.data;
  },
};