import createAxiosClient from "../hooks/axiosClient";

export interface CreateWalletData {
  currency: string;
}

export interface TopUpWalletData {
  amount: number;
  paymentMethod: "MOBILE_MONEY" | "CARD";
  phoneNumber?: string;
  description?: string;
}

export interface WalletTransactionFilters {
  type?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export const walletService = {
  // Create wallet
  createWallet: async (data: CreateWalletData) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.post("/wallets", data);
    return response.data;
  },

  // Get my wallet
  getMyWallet: async () => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get("/wallets/my-wallet");
    return response.data;
  },

  // Top up wallet
  topUpWallet: async (data: TopUpWalletData) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.post("/wallets/top-up", data);
    return response.data;
  },

  // Get wallet transactions
  getWalletTransactions: async (filters?: WalletTransactionFilters) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get("/wallets/transactions", { params: filters });
    return response.data;
  },

  // Get transaction by ID
  getTransactionById: async (transactionId: string) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get(`/wallets/transactions/${transactionId}`);
    return response.data;
  },

  // Verify top-up payment
  verifyTopUp: async (transactionId: string) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get(`/wallets/verify-topup/${transactionId}`);
    return response.data;
  },
};