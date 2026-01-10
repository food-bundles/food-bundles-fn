import createAxiosClient from "../hooks/axiosClient";

export interface CreateWalletData {
  currency: string;
}

export interface TopUpWalletData {
  amount: number;
  paymentMethod: "MOBILE_MONEY" | "CARD";
  phoneNumber?: string;
  description?: string;
  walletId?: string;
}

export interface WalletTransactionFilters {
  type?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface AdminWalletFilters {
  page?: number;
  limit?: number;
  isActive?: boolean;
  restaurantName?: string;
}

export interface AdjustWalletData {
  amount: number;
  type: "credit" | "debit";
  description: string;
}

export interface AdminDepositData {
  restaurantId: string;
  amount: number;
  description: string;
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
    const response = await axiosClient.get("/wallets/my-transactions", {
      params: filters,
    });
    return response.data;
  },

  // Get all wallet transactions (admin only)
  getAllWalletTransactions: async (filters?: WalletTransactionFilters) => {
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

  // Get all wallets (admin)
  getAllWallets: async (filters?: AdminWalletFilters) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get("/wallets", { params: filters });
    return response.data;
  },

  // Get all transactions (admin)
  getAllTransactions: async (filters?: WalletTransactionFilters) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get("/wallets/all-transactions", { params: filters });
    return response.data;
  },

  getWalletById: async (walletId: string) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get(`/wallets/${walletId}`);
    return response.data;
  },

  updateWalletStatus: async (walletId: string, isActive: boolean) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.patch(`/wallets/${walletId}/status`, { isActive });
    return response.data;
  },

  adjustWalletBalance: async (walletId: string, data: AdjustWalletData) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.post(`/wallets/${walletId}/adjust`, data);
    return response.data;
  },

  // Admin deposit to restaurant wallet
  adminDeposit: async (data: AdminDepositData) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.post("/wallets/admin-deposit", data);
    return response.data;
  },
};