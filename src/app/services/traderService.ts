/* eslint-disable @typescript-eslint/no-explicit-any */
import createAxiosClient from "../hooks/axiosClient";

export interface TraderWallet {
  id: string;
  traderId: string;
  balance: number;
  currency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  trader?: {
    id: string;
    username: string;
    email: string;
  };
  _count?: {
    transactions: number;
  };
}

export interface LoanApplication {
  id: string;
  restaurantId: string;
  requestedAmount: number;
  purpose: string;
  repaymentDays: number;
  status: string;
  approvedAmount?: number;
  approvedBy?: string;
  disbursementDate?: string;
  repaymentDueDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  restaurant: {
    id: string;
    name: string;
    email: string;
  };
  approver?: any;
  vouchers: any[];
}

export interface Voucher {
  id: string;
  voucherCode: string;
  voucherType: string;
  discountPercentage: number;
  creditLimit: number;
  currency: string;
  totalCredit: number;
  usedCredit: number;
  remainingCredit: number;
  status: string;
  expiryDate: string;
  issuedDate: string;
  approvedBy: string;
  restaurantId: string;
  loanId: string;
  repaymentDays: number;
  serviceFeeRate: number;
  createdAt: string;
  updatedAt: string;
  restaurant: {
    id: string;
    name: string;
    email: string;
  };
  loan: LoanApplication;
  transactions: any[];
  approver: any;
}

export interface TraderOrder {
  id: string;
  restaurantId: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  voucherCode?: string;
  voucherId?: string;
  billingName: string;
  billingEmail: string;
  billingPhone: string;
  createdAt: string;
  updatedAt: string;
  restaurant: {
    id: string;
    name: string;
  };
  Voucher?: {
    id: string;
    voucherCode: string;
    discountPercentage: number;
  };
  orderItems: {
    id: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    unit: string;
    images: string[];
    category: string;
  }[];
}

export interface CommissionDetails {
  totalCommission: number;
  totalPaid: number;
  pendingCommission: number;
  commissionDetails: any[];
}

export interface TraderStats {
  totalTransactions: number;
  loanApprovals: number;
  commissionsEarned: number;
  commissionsPaid: number;
  totalCommissionEarned: number;
  totalCommissionPaid: number;
  totalLoansApproved: number;
}

export interface TraderTransaction {
  id: string;
  traderId: string;
  type: string;
  amount: number;
  orderId?: string;
  voucherId?: string;
  loanId?: string;
  reference?: string;
  isCommissionPaid: boolean;
  commissionRate?: number;
  description: string;
  metadata?: any;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface TraderDashboard {
  walletBalance: number;
  totalVouchersApproved: number;
  activeVouchers: number;
  totalOrdersProcessed: number;
  totalCommissionEarned: number;
  pendingCommission: number;
}

export const traderService = {
  // Wallet Management
  createWallet: async () => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.post("/traders/wallet");
    return response.data;
  },

  getWallet: async (): Promise<{ success: boolean; data: TraderWallet }> => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get("/traders/wallet");
    return response.data;
  },

  topUpWallet: async (data: {
    amount: number;
    paymentMethodId: string;
    phoneNumber?: string;
    description?: string;
  }) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.post("/traders/wallet/topup", data);
    return response.data;
  },

  // Loan Management
  getLoans: async (params?: {
    status?: string;
    restaurantId?: string;
    page?: number;
    limit?: number;
  }): Promise<{ success: boolean; data: LoanApplication[] }> => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get("/traders/loans", { params });
    return response.data;
  },

  approveLoan: async (loanId: string, data: {
    approvedAmount: number;
    repaymentDays: number;
    voucherType: string;
    notes?: string;
  }) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.post(`/traders/loans/${loanId}/approve`, data);
    return response.data;
  },

  // Voucher Management
  getVouchers: async (params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ success: boolean; data: { vouchers: Voucher[] } }> => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get("/traders/vouchers", { params });
    return response.data;
  },

  // Commission Management
  getCommission: async (): Promise<{ success: boolean; data: CommissionDetails }> => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get("/traders/commission");
    return response.data;
  },

  processCommission: async () => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.post("/traders/commission/process");
    return response.data;
  },

  // Order Management
  getOrders: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<{ success: boolean; data: TraderOrder[] }> => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get("/traders/orders", { params });
    return {
      success: response.data.success,
      data: response.data.data || response.data
    };
  },

  // Transaction Management
  getTransactions: async (params?: {
    type?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<{ success: boolean; data: TraderTransaction[]; pagination: any }> => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get("/traders/transactions", { params });
    return response.data;
  },

  // Statistics
  getTransactionStats: async (): Promise<{ success: boolean; data: TraderStats }> => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get("/traders/transactions/stats");
    return response.data;
  },

  getDashboardStats: async (): Promise<{ success: boolean; data: TraderDashboard }> => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get("/traders/dashboard");
    return response.data;
  },
};