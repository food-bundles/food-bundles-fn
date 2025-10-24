import { useState, useCallback } from "react";
import { voucherService } from "@/app/services/voucherService";
import { IVoucher, ILoanApplication, VoucherType, LoanStatus } from "@/lib/types";

export const useVoucherOperations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = useCallback((error: any, defaultMessage: string) => {
    const message = error?.response?.data?.message || error?.message || defaultMessage;
    setError(message);
    console.error(defaultMessage, error);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  // Voucher operations
  const getVoucherById = useCallback(async (id: string): Promise<IVoucher | null> => {
    try {
      setLoading(true);
      clearError();
      const response = await voucherService.getVoucherById(id);
      return response.data;
    } catch (error) {
      handleError(error, "Failed to get voucher");
      return null;
    } finally {
      setLoading(false);
    }
  }, [clearError, handleError]);

  const getVoucherByCode = useCallback(async (code: string): Promise<IVoucher | null> => {
    try {
      setLoading(true);
      clearError();
      const response = await voucherService.getVoucherByCode(code);
      return response.data;
    } catch (error) {
      handleError(error, "Failed to get voucher by code");
      return null;
    } finally {
      setLoading(false);
    }
  }, [clearError, handleError]);

  const getAvailableVouchers = useCallback(async (amount: number): Promise<IVoucher[]> => {
    try {
      setLoading(true);
      clearError();
      const response = await voucherService.getAvailableVouchers(amount);
      return response.data || [];
    } catch (error) {
      handleError(error, "Failed to get available vouchers");
      return [];
    } finally {
      setLoading(false);
    }
  }, [clearError, handleError]);

  const processVoucherPayment = useCallback(async (paymentData: {
    voucherId: string;
    orderId: string;
    originalAmount: number;
  }) => {
    try {
      setLoading(true);
      clearError();
      const response = await voucherService.processVoucherPayment(paymentData);
      return response.data;
    } catch (error) {
      handleError(error, "Failed to process voucher payment");
      throw error;
    } finally {
      setLoading(false);
    }
  }, [clearError, handleError]);

  // Loan operations
  const applyForLoan = useCallback(async (loanData: {
    requestedAmount: number;
    purpose?: string;
    terms?: string;
  }): Promise<ILoanApplication | null> => {
    try {
      setLoading(true);
      clearError();
      const response = await voucherService.applyForLoan(loanData);
      return response.data;
    } catch (error) {
      handleError(error, "Failed to apply for loan");
      return null;
    } finally {
      setLoading(false);
    }
  }, [clearError, handleError]);

  const getLoanApplications = useCallback(async (): Promise<ILoanApplication[]> => {
    try {
      setLoading(true);
      clearError();
      const response = await voucherService.getMyLoanApplications();
      return response.data || [];
    } catch (error) {
      handleError(error, "Failed to get loan applications");
      return [];
    } finally {
      setLoading(false);
    }
  }, [clearError, handleError]);

  const makeRepayment = useCallback(async (voucherId: string, repaymentData: {
    amount: number;
    paymentMethod: string;
    paymentReference?: string;
    loanId: string;
  }) => {
    try {
      setLoading(true);
      clearError();
      const response = await voucherService.makeRepayment(voucherId, repaymentData);
      return response.data;
    } catch (error) {
      handleError(error, "Failed to make repayment");
      throw error;
    } finally {
      setLoading(false);
    }
  }, [clearError, handleError]);

  const getOutstandingBalance = useCallback(async (voucherId: string) => {
    try {
      setLoading(true);
      clearError();
      const response = await voucherService.getOutstandingBalance(voucherId);
      return response.data;
    } catch (error) {
      handleError(error, "Failed to get outstanding balance");
      return null;
    } finally {
      setLoading(false);
    }
  }, [clearError, handleError]);

  const getCreditSummary = useCallback(async () => {
    try {
      setLoading(true);
      clearError();
      const response = await voucherService.getRestaurantCreditSummary();
      return response.data;
    } catch (error) {
      handleError(error, "Failed to get credit summary");
      return null;
    } finally {
      setLoading(false);
    }
  }, [clearError, handleError]);

  const getVoucherTransactions = useCallback(async (voucherId: string) => {
    try {
      setLoading(true);
      clearError();
      const response = await voucherService.getVoucherTransactions(voucherId);
      return response.data || [];
    } catch (error) {
      handleError(error, "Failed to get voucher transactions");
      return [];
    } finally {
      setLoading(false);
    }
  }, [clearError, handleError]);

  return {
    loading,
    error,
    clearError,
    
    // Voucher operations
    getVoucherById,
    getVoucherByCode,
    getAvailableVouchers,
    processVoucherPayment,
    getVoucherTransactions,
    
    // Loan operations
    applyForLoan,
    getLoanApplications,
    makeRepayment,
    getOutstandingBalance,
    getCreditSummary,
  };
};

// Utility functions for voucher calculations
export const useVoucherUtils = () => {
  const calculateDiscount = useCallback((amount: number, voucherType: VoucherType): number => {
    switch (voucherType) {
      case VoucherType.DISCOUNT_10:
        return amount * 0.1;
      case VoucherType.DISCOUNT_20:
        return amount * 0.2;
      case VoucherType.DISCOUNT_50:
        return amount * 0.5;
      case VoucherType.DISCOUNT_80:
        return amount * 0.8;
      case VoucherType.DISCOUNT_100:
        return amount * 1.0;
      default:
        return 0;
    }
  }, []);

  const calculateFinalAmount = useCallback((originalAmount: number, voucherType: VoucherType): number => {
    const discount = calculateDiscount(originalAmount, voucherType);
    return originalAmount - discount;
  }, [calculateDiscount]);

  const getDiscountPercentage = useCallback((voucherType: VoucherType): number => {
    switch (voucherType) {
      case VoucherType.DISCOUNT_10:
        return 10;
      case VoucherType.DISCOUNT_20:
        return 20;
      case VoucherType.DISCOUNT_50:
        return 50;
      case VoucherType.DISCOUNT_80:
        return 80;
      case VoucherType.DISCOUNT_100:
        return 100;
      default:
        return 0;
    }
  }, []);

  const formatVoucherType = useCallback((voucherType: VoucherType): string => {
    return `${getDiscountPercentage(voucherType)}% Discount`;
  }, [getDiscountPercentage]);

  const formatLoanStatus = useCallback((status: LoanStatus): string => {
    switch (status) {
      case LoanStatus.PENDING:
        return "Pending Review";
      case LoanStatus.APPROVED:
        return "Approved";
      case LoanStatus.REJECTED:
        return "Rejected";
      case LoanStatus.DISBURSED:
        return "Disbursed";
      case LoanStatus.REPAID:
        return "Fully Repaid";
      case LoanStatus.DEFAULTED:
        return "Defaulted";
      default:
        return status;
    }
  }, []);

  const isVoucherEligible = useCallback((voucher: IVoucher, orderAmount: number): boolean => {
    if (voucher.status !== VoucherStatus.ACTIVE) return false;
    if (voucher.remainingCredit <= 0) return false;
    if (voucher.expiryDate && new Date(voucher.expiryDate) < new Date()) return false;
    if (voucher.minTransactionAmount && orderAmount < voucher.minTransactionAmount) return false;
    if (voucher.maxTransactionAmount && orderAmount > voucher.maxTransactionAmount) return false;
    
    const discountAmount = calculateDiscount(orderAmount, voucher.voucherType);
    return discountAmount <= voucher.remainingCredit;
  }, [calculateDiscount]);

  return {
    calculateDiscount,
    calculateFinalAmount,
    getDiscountPercentage,
    formatVoucherType,
    formatLoanStatus,
    isVoucherEligible,
  };
};