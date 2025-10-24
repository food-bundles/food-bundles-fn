/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { voucherService } from "../services/voucherService";
import { IVoucher, ILoanApplication, ICreditSummary} from "@/lib/types";

interface VoucherContextType {
  // State
  vouchers: IVoucher[];
  availableVouchers: IVoucher[];
  loanApplications: ILoanApplication[];
  creditSummary: ICreditSummary | null;
  loading: boolean;
  error: string | null;

  // Voucher Management
  fetchVouchers: () => Promise<void>;
  fetchAvailableVouchers: (amount: number) => Promise<void>;
  getVoucherById: (id: string) => Promise<IVoucher | null>;
  getVoucherByCode: (code: string) => Promise<IVoucher | null>;
  createVoucher: (voucherData: any) => Promise<void>;
  updateVoucher: (id: string, updateData: any) => Promise<void>;
  deactivateVoucher: (id: string, reason?: string) => Promise<void>;

  // Loan Management
  fetchLoanApplications: () => Promise<void>;
  applyForLoan: (loanData: any) => Promise<void>;
  approveLoan: (id: string, approvalData: any) => Promise<void>;
  rejectLoan: (id: string, reason?: string) => Promise<void>;
  disburseLoan: (id: string) => Promise<void>;

  // Payments & Repayments
  processVoucherPayment: (paymentData: any) => Promise<any>;
  makeRepayment: (voucherId: string, repaymentData: any) => Promise<void>;
  getOutstandingBalance: (voucherId: string) => Promise<any>;

  // Credit Summary
  fetchCreditSummary: () => Promise<void>;

  // Utilities
  clearError: () => void;
  refreshData: () => Promise<void>;
}

const VoucherContext = createContext<VoucherContextType | undefined>(undefined);

export const useVoucher = () => {
  const context = useContext(VoucherContext);
  if (!context) {
    throw new Error("useVoucher must be used within a VoucherProvider");
  }
  return context;
};

interface VoucherProviderProps {
  children: ReactNode;
}

export const VoucherProvider: React.FC<VoucherProviderProps> = ({ children }) => {
  const [vouchers, setVouchers] = useState<IVoucher[]>([]);
  const [availableVouchers, setAvailableVouchers] = useState<IVoucher[]>([]);
  const [loanApplications, setLoanApplications] = useState<ILoanApplication[]>([]);
  const [creditSummary, setCreditSummary] = useState<ICreditSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = (error: any, defaultMessage: string) => {
    const message = error?.response?.data?.message || error?.message || defaultMessage;
    setError(message);
    console.error(defaultMessage, error);
  };

  const clearError = () => setError(null);

  // Voucher Management
  const fetchVouchers = async () => {
    try {
      setLoading(true);
      clearError();
      // Get current user's restaurant ID from context or auth
      const response = await voucherService.getRestaurantVouchers("current"); // Backend will use authenticated user's ID
      setVouchers(response.data || []);
    } catch (error) {
      handleError(error, "Failed to fetch vouchers");
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableVouchers = async (amount: number) => {
    try {
      setLoading(true);
      clearError();
      const response = await voucherService.getAvailableVouchers(amount);
      setAvailableVouchers(response.data || []);
    } catch (error) {
      handleError(error, "Failed to fetch available vouchers");
    } finally {
      setLoading(false);
    }
  };

  const getVoucherById = async (id: string): Promise<IVoucher | null> => {
    try {
      clearError();
      const response = await voucherService.getVoucherById(id);
      return response.data;
    } catch (error) {
      handleError(error, "Failed to get voucher");
      return null;
    }
  };

  const getVoucherByCode = async (code: string): Promise<IVoucher | null> => {
    try {
      clearError();
      const response = await voucherService.getVoucherByCode(code);
      return response.data;
    } catch (error) {
      handleError(error, "Failed to get voucher by code");
      return null;
    }
  };

  const createVoucher = async (voucherData: any) => {
    try {
      setLoading(true);
      clearError();
      await voucherService.createVoucher(voucherData);
      await fetchVouchers(); // Refresh list
    } catch (error) {
      handleError(error, "Failed to create voucher");
    } finally {
      setLoading(false);
    }
  };

  const updateVoucher = async (id: string, updateData: any) => {
    try {
      setLoading(true);
      clearError();
      await voucherService.updateVoucher(id, updateData);
      await fetchVouchers(); // Refresh list
    } catch (error) {
      handleError(error, "Failed to update voucher");
    } finally {
      setLoading(false);
    }
  };

  const deactivateVoucher = async (id: string, reason?: string) => {
    try {
      setLoading(true);
      clearError();
      await voucherService.deactivateVoucher(id, reason);
      await fetchVouchers(); // Refresh list
    } catch (error) {
      handleError(error, "Failed to deactivate voucher");
    } finally {
      setLoading(false);
    }
  };

  // Loan Management
  const fetchLoanApplications = async () => {
    try {
      setLoading(true);
      clearError();
      const response = await voucherService.getMyLoanApplications();
      setLoanApplications(response.data || []);
    } catch (error) {
      handleError(error, "Failed to fetch loan applications");
    } finally {
      setLoading(false);
    }
  };

  const applyForLoan = async (loanData: any) => {
    try {
      setLoading(true);
      clearError();
      await voucherService.applyForLoan(loanData);
      await fetchLoanApplications(); // Refresh list
    } catch (error) {
      handleError(error, "Failed to apply for loan");
    } finally {
      setLoading(false);
    }
  };

  const approveLoan = async (id: string, approvalData: any) => {
    try {
      setLoading(true);
      clearError();
      await voucherService.approveLoan(id, approvalData);
      await fetchLoanApplications(); // Refresh list
    } catch (error) {
      handleError(error, "Failed to approve loan");
    } finally {
      setLoading(false);
    }
  };

  const rejectLoan = async (id: string, reason?: string) => {
    try {
      setLoading(true);
      clearError();
      await voucherService.rejectLoan(id, reason);
      await fetchLoanApplications(); // Refresh list
    } catch (error) {
      handleError(error, "Failed to reject loan");
    } finally {
      setLoading(false);
    }
  };

  const disburseLoan = async (id: string) => {
    try {
      setLoading(true);
      clearError();
      await voucherService.disburseLoan(id);
      await fetchLoanApplications(); // Refresh list
      await fetchVouchers(); // Refresh vouchers as new voucher might be created
    } catch (error) {
      handleError(error, "Failed to disburse loan");
    } finally {
      setLoading(false);
    }
  };

  // Payments & Repayments
  const processVoucherPayment = async (paymentData: any) => {
    try {
      clearError();
      const response = await voucherService.processVoucherPayment(paymentData);
      await fetchVouchers(); // Refresh vouchers to update used amounts
      return response.data;
    } catch (error) {
      handleError(error, "Failed to process voucher payment");
      throw error;
    }
  };

  const makeRepayment = async (voucherId: string, repaymentData: any) => {
    try {
      setLoading(true);
      clearError();
      await voucherService.makeRepayment(voucherId, repaymentData);
      await fetchVouchers(); // Refresh data
      await fetchCreditSummary();
    } catch (error) {
      handleError(error, "Failed to make repayment");
    } finally {
      setLoading(false);
    }
  };

  const getOutstandingBalance = async (voucherId: string) => {
    try {
      clearError();
      const response = await voucherService.getOutstandingBalance(voucherId);
      return response.data;
    } catch (error) {
      handleError(error, "Failed to get outstanding balance");
      return null;
    }
  };

  // Credit Summary
  const fetchCreditSummary = async () => {
    try {
      setLoading(true);
      clearError();
      const response = await voucherService.getRestaurantCreditSummary();
      setCreditSummary(response.data);
    } catch (error) {
      handleError(error, "Failed to fetch credit summary");
    } finally {
      setLoading(false);
    }
  };

  // Utilities
  const refreshData = async () => {
    await Promise.all([
      fetchVouchers(),
      fetchLoanApplications(),
      fetchCreditSummary(),
    ]);
  };

  const contextValue: VoucherContextType = {
    // State
    vouchers,
    availableVouchers,
    loanApplications,
    creditSummary,
    loading,
    error,

    // Voucher Management
    fetchVouchers,
    fetchAvailableVouchers,
    getVoucherById,
    getVoucherByCode,
    createVoucher,
    updateVoucher,
    deactivateVoucher,

    // Loan Management
    fetchLoanApplications,
    applyForLoan,
    approveLoan,
    rejectLoan,
    disburseLoan,

    // Payments & Repayments
    processVoucherPayment,
    makeRepayment,
    getOutstandingBalance,

    // Credit Summary
    fetchCreditSummary,

    // Utilities
    clearError,
    refreshData,
  };

  return (
    <VoucherContext.Provider value={contextValue}>
      {children}
    </VoucherContext.Provider>
  );
};