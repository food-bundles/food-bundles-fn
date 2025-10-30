"use client";

import React, { createContext, useContext, useCallback, useState } from "react";
import { voucherService } from "@/app/services/voucherService";
import { IVoucher, ILoanApplication } from "@/lib/types";

interface VoucherContextType {
  // State
  myVouchers: IVoucher[];
  myLoanApplications: ILoanApplication[];
  loading: boolean;
  error: string | null;

  // Voucher Methods
  getMyVouchers: (params?: { status?: string; activeOnly?: boolean }) => Promise<any>;
  refreshMyVouchers: () => Promise<void>;

  // Loan Methods
  getMyLoanApplications: () => Promise<any>;
  applyForLoan: (loanData: any) => Promise<any>;
  refreshMyLoanApplications: () => Promise<void>;

  // Utility Methods
  clearError: () => void;
}

const VoucherContext = createContext<VoucherContextType | undefined>(undefined);

interface VoucherProviderProps {
  children: React.ReactNode;
}

export function VoucherProvider({ children }: VoucherProviderProps) {
  const [myVouchers, setMyVouchers] = useState<IVoucher[]>([]);
  const [myLoanApplications, setMyLoanApplications] = useState<ILoanApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ==================== VOUCHER METHODS ====================

  const getMyVouchers = useCallback(
    async (params?: { status?: string; activeOnly?: boolean }) => {
      try {
        setLoading(true);
        const response = await voucherService.getMyVouchers(params);
        if (response && response.data) {
          setMyVouchers(response.data || []);
        }
        return response;
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch vouchers");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const refreshMyVouchers = useCallback(async () => {
    await getMyVouchers();
  }, [getMyVouchers]);

  // ==================== LOAN METHODS ====================

  const getMyLoanApplications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await voucherService.getMyLoanApplications();
      if (response && response.data) {
        setMyLoanApplications(response.data || []);
      }
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch loan applications");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const applyForLoan = useCallback(async (loanData: any) => {
    try {
      setLoading(true);
      const response = await voucherService.applyForLoan(loanData);
      if (response.success) {
        await refreshMyLoanApplications();
      }
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to apply for loan");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshMyLoanApplications = useCallback(async () => {
    await getMyLoanApplications();
  }, [getMyLoanApplications]);

  const contextValue: VoucherContextType = {
    // State
    myVouchers,
    myLoanApplications,
    loading,
    error,

    // Voucher Methods
    getMyVouchers,
    refreshMyVouchers,

    // Loan Methods
    getMyLoanApplications,
    applyForLoan,
    refreshMyLoanApplications,

    // Utility Methods
    clearError,
  };

  return (
    <VoucherContext.Provider value={contextValue}>
      {children}
    </VoucherContext.Provider>
  );
}

export function useVouchers() {
  const context = useContext(VoucherContext);
  if (context === undefined) {
    throw new Error("useVouchers must be used within a VoucherProvider");
  }
  return context;
}