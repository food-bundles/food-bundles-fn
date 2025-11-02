/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { createContext, useContext, useCallback, useState } from "react";
import { walletService, ICreateWalletData, ITopUpData, IWalletUpdateData, IWalletAdjustmentData } from "@/app/services/walletService";

interface WalletContextType {
  // State
  myWallet: any;
  transactions: any[];
  allWallets: any[];
  loading: boolean;
  error: string | null;

  // Wallet Methods
  createWallet: (walletData: ICreateWalletData) => Promise<any>;
  getMyWallet: () => Promise<any>;
  topUpWallet: (topUpData: ITopUpData) => Promise<any>;
  refreshMyWallet: () => Promise<void>;

  // Transaction Methods
  getTransactions: (params?: { page?: number; limit?: number }) => Promise<any>;
  getTransactionById: (transactionId: string) => Promise<any>;
  verifyTopUp: (transactionId: string) => Promise<any>;
  refreshTransactions: () => Promise<void>;

  // Admin Methods
  getAllWallets: (params?: { page?: number; limit?: number }) => Promise<any>;
  getWalletById: (walletId: string) => Promise<any>;
  updateWalletStatus: (walletId: string, updateData: IWalletUpdateData) => Promise<any>;
  adjustWalletBalance: (walletId: string, adjustmentData: IWalletAdjustmentData) => Promise<any>;

  // Utility Methods
  clearError: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

interface WalletProviderProps {
  children: React.ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [myWallet, setMyWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [allWallets, setAllWallets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ==================== WALLET METHODS ====================

  const createWallet = useCallback(async (walletData: ICreateWalletData) => {
    try {
      setLoading(true);
      const response = await walletService.createWallet(walletData);
      if (response && response.data) {
        setMyWallet(response.data);
      }
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create wallet");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getMyWallet = useCallback(async () => {
    try {
      setLoading(true);
      const response = await walletService.getMyWallet();
      if (response && response.data) {
        setMyWallet(response.data);
      }
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch wallet");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const topUpWallet = useCallback(async (topUpData: ITopUpData) => {
    try {
      setLoading(true);
      const response = await walletService.topUpWallet(topUpData);
      if (response.success) {
        await refreshMyWallet();
        await refreshTransactions();
      }
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to top up wallet");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshMyWallet = useCallback(async () => {
    await getMyWallet();
  }, [getMyWallet]);

  // ==================== TRANSACTION METHODS ====================

  const getTransactions = useCallback(async (params?: { page?: number; limit?: number }) => {
    try {
      setLoading(true);
      const response = await walletService.getTransactions(params);
      if (response && response.data) {
        setTransactions(response.data || []);
      }
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch transactions");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getTransactionById = useCallback(async (transactionId: string) => {
    try {
      setLoading(true);
      const response = await walletService.getTransactionById(transactionId);
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch transaction");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyTopUp = useCallback(async (transactionId: string) => {
    try {
      setLoading(true);
      const response = await walletService.verifyTopUp(transactionId);
      if (response.success) {
        await refreshMyWallet();
        await refreshTransactions();
      }
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to verify top up");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshTransactions = useCallback(async () => {
    await getTransactions();
  }, [getTransactions]);

  // ==================== ADMIN METHODS ====================

  const getAllWallets = useCallback(async (params?: { page?: number; limit?: number }) => {
    try {
      setLoading(true);
      const response = await walletService.getAllWallets(params);
      if (response && response.data) {
        setAllWallets(response.data || []);
      }
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch all wallets");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getWalletById = useCallback(async (walletId: string) => {
    try {
      setLoading(true);
      const response = await walletService.getWalletById(walletId);
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch wallet");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateWalletStatus = useCallback(async (walletId: string, updateData: IWalletUpdateData) => {
    try {
      setLoading(true);
      const response = await walletService.updateWalletStatus(walletId, updateData);
      if (response.success) {
        await getAllWallets();
      }
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update wallet status");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const adjustWalletBalance = useCallback(async (walletId: string, adjustmentData: IWalletAdjustmentData) => {
    try {
      setLoading(true);
      const response = await walletService.adjustWalletBalance(walletId, adjustmentData);
      if (response.success) {
        await getAllWallets();
      }
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to adjust wallet balance");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const contextValue: WalletContextType = {
    // State
    myWallet,
    transactions,
    allWallets,
    loading,
    error,

    // Wallet Methods
    createWallet,
    getMyWallet,
    topUpWallet,
    refreshMyWallet,

    // Transaction Methods
    getTransactions,
    getTransactionById,
    verifyTopUp,
    refreshTransactions,

    // Admin Methods
    getAllWallets,
    getWalletById,
    updateWalletStatus,
    adjustWalletBalance,

    // Utility Methods
    clearError,
  };

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}