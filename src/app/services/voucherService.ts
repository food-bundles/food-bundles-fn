import createAxiosClient from "../hooks/axiosClient";

export interface IVoucherData {
  restaurantId: string;
  voucherType: "DISCOUNT_10" | "DISCOUNT_20" | "DISCOUNT_50" | "DISCOUNT_80" | "DISCOUNT_100";
  creditLimit: number;
  repaymentDays: number;
  minTransactionAmount?: number;
  maxTransactionAmount?: number;
  expiryDate?: string;
  loanId?: string;
}

export interface ILoanApplicationData {
  requestedAmount: number;
  purpose?: string;
  voucherDays?: number;
}

export interface IVoucherPaymentData {
  voucherId: string;
  orderId: string;
  originalAmount: number;
}

export interface IRepaymentData {
  amount: number;
  paymentMethod: string;
  paymentReference?: string;
  loanId: string;
  allocatedToPrincipal?: number;
  allocatedToServiceFee?: number;
  allocatedToPenalty?: number;
}

export interface ILoanApprovalData {
  approvedAmount: number;
  repaymentDays?: number;
  voucherType: string;
  notes?: string;
}

export const voucherService = {
  // Voucher Management
  createVoucher: async (voucherData: IVoucherData) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.post("/vouchers", voucherData);
    return response.data;
  },

  getAllVouchers: async (params?: {
    status?: string;
    restaurantId?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get("/vouchers", { params });
    return response.data;
  },

  getVoucherById: async (id: string) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get(`/vouchers/${id}`);
    return response.data;
  },

  getVoucherByCode: async (voucherCode: string) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get(`/vouchers/code/${voucherCode}`);
    return response.data;
  },

  getMyVouchers: async (params?: { status?: string; activeOnly?: boolean }) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get("/vouchers/my-vouchers", { params });
    return response.data;
  },

  getRestaurantVouchers: async (
    restaurantId: string,
    params?: { status?: string; activeOnly?: boolean },
  ) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get(
      `/vouchers/restaurant/${restaurantId}`,
      { params },
    );
    return response.data;
  },

  getAvailableVouchers: async (amount: number) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get("/vouchers/available", {
      params: { amount },
    });
    return response.data;
  },

  updateVoucher: async (
    id: string,
    updateData: {
      status?: string;
      voucherType?: string;
      discountPercentage?: number;
      creditLimit?: number;
    },
  ) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.patch(`/vouchers/${id}`, updateData);
    return response.data;
  },

  deactivateVoucher: async (id: string, reason?: string) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.delete(`/vouchers/${id}`, {
      data: { reason },
    });
    return response.data;
  },

  getVoucherTransactions: async (id: string) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get(`/vouchers/${id}/transactions`);
    return response.data;
  },

  // Loan Management
  applyForLoan: async (loanData: ILoanApplicationData) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.post("/vouchers/loans/apply", loanData);
    return response.data;
  },

  getMyLoanApplications: async () => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get("/vouchers/loans/my-applications");
    return response.data;
  },

  getAllLoanApplications: async (params?: {
    status?: string;
    restaurantId?: string;
  }) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get("/vouchers/loans/applications", {
      params,
    });
    return response.data;
  },

  getLoanApplicationById: async (id: string) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get(`/vouchers/loans/${id}`);
    return response.data;
  },

  approveLoan: async (id: string, approvalData: ILoanApprovalData) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.patch(
      `/vouchers/loans/${id}/approve`,
      approvalData,
    );
    return response.data;
  },

  disburseLoan: async (id: string) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.post(`/vouchers/loans/${id}/disburse`);
    return response.data;
  },

  rejectLoan: async (id: string, reason?: string) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.patch(`/vouchers/loans/${id}/reject`, {
      reason,
    });
    return response.data;
  },

  acceptLoan: async (
    id: string,
    data: { acceptedAmount: number; paymentDays: number },
  ) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.patch(
      `/vouchers/loans/${id}/accept`,
      data,
    );
    return response.data;
  },

  deleteLoanApplication: async (id: string) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.delete(`/vouchers/loans/${id}`);
    return response.data;
  },

  // Voucher Payments
  processVoucherPayment: async (paymentData: IVoucherPaymentData) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.post(
      "/vouchers/checkout/voucher",
      paymentData,
    );
    return response.data;
  },

  // Repayment & Penalties
  makeRepayment: async (voucherId: string, repaymentData: IRepaymentData) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.post(
      `/vouchers/${voucherId}/repay`,
      repaymentData,
    );
    return response.data;
  },

  // Voucher Credit Repayment
  repayVoucherCredit: async (
    voucherId: string,
    paymentData: {
      amount: number;
      paymentMethod: "MOBILE_MONEY" | "CARD" | "BANK_TRANSFER";
      paymentReference?: string;
      phoneNumber?: string;
    },
  ) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.post(
      `/vouchers/${voucherId}/repay`,
      paymentData,
    );
    return response.data;
  },

  getOutstandingBalance: async (voucherId: string) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get(
      `/vouchers/${voucherId}/outstanding`,
    );
    return response.data;
  },

  getVoucherPenalties: async (voucherId: string) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get(`/vouchers/${voucherId}/penalties`);
    return response.data;
  },

  calculatePenalties: async (loanId?: string, penaltyRatePerMonth?: number) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.post("/vouchers/penalties/calculate", {
      loanId,
      penaltyRatePerMonth,
    });
    return response.data;
  },

  waivePenalty: async (penaltyId: string, reason?: string) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.post(
      `/vouchers/penalties/${penaltyId}/waive`,
      { reason },
    );
    return response.data;
  },

  // Credit Analytics
  getRestaurantCreditSummary: async () => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get("/vouchers/credit-summary");
    return response.data;
  },

  // New voucher card system (PAN-based)
  getMyVoucherCard: async () => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get("/vouchers/card/my-card");
    return response.data;
  },

  requestVoucherCard: async () => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.post("/vouchers/card/request");
    return response.data;
  },

  getMyCardEnrollmentRequest: async () => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get("/vouchers/card/my-request");
    return response.data;
  },

  issueVoucherCard: async (data: { restaurantId: string; loanLimit?: number }) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.post("/vouchers/card/issue", data);
    return response.data;
  },

  getMyLoanSessions: async () => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get("/vouchers/sessions/my-sessions");
    return response.data;
  },

  requestLoanSession: async (data: {
    requestedAmount: number;
    purpose?: string;
    repaymentDays?: number;
  }) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.post("/vouchers/sessions/request", data);
    return response.data;
  },

  payUnlockFee: async (sessionId: string, paymentData: {
    paymentMethod: string;
    paymentReference?: string;
    phoneNumber?: string;
  }) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.post(`/vouchers/sessions/${sessionId}/pay-unlock-fee`, paymentData);
    return response.data;
  },

  getAllLoanSessions: async (params?: {
    status?: string;
    restaurantId?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get("/vouchers/sessions", { params });
    return response.data;
  },

  approveLoanSession: async (sessionId: string, data: {
    approvedAmount: number;
    approvalPercentage?: number;
    repaymentDays: number;
    notes?: string;
    fundingTraderId?: string;
  }) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.patch(`/vouchers/sessions/${sessionId}/approve`, data);
    return response.data;
  },

  rejectLoanSession: async (sessionId: string, reason: string) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.patch(`/vouchers/sessions/${sessionId}/reject`, { reason });
    return response.data;
  },

  getVoucherCardByPan: async (pan: string) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get(`/vouchers/card/pan/${pan}`);
    return response.data;
  },

  getAllVoucherCards: async (params?: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get("/vouchers/cards", { params });
    return response.data;
  },

  getCardEnrollmentRequests: async () => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get("/vouchers/card/enrollment-requests");
    return response.data;
  },
};