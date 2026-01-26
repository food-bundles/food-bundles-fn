/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { createContext, useContext, useCallback, useState, useEffect } from "react";
import { walletService, TopUpWalletData, WalletTransactionFilters, AdminWalletFilters, AdjustWalletData } from "@/app/services/walletService";
import { paymentMethodService, PaymentMethod } from "@/app/services/paymentMethodService";
import { useWalletWebSocket } from "@/hooks/useWalletWebSocket";
import { useAuth } from "@/app/contexts/auth-context";

export interface Wallet {
  id: string;
  restaurantId: string;
  balance: number;
  currency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  restaurant: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  _count: {
    transactions: number;
  };
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  type: string;
  amount: number;
  previousBalance: number;
  newBalance: number;
  description: string;
  reference?: string;
  status: string;
  paymentMethod?: string;
  flwRef?: string;
  flwStatus?: string;
  externalTxId?: string;
  createdAt: string;
  updatedAt: string;
}

interface WalletContextType {
  // State
  wallet: Wallet | null;
  transactions: WalletTransaction[];
  paymentMethods: PaymentMethod[];
  loading: boolean;
  error: string | null;

  // Methods
  getMyWallet: () => Promise<any>;
  createWallet: () => Promise<any>;
  topUpWallet: (data: TopUpWalletData) => Promise<any>;
  getTransactions: (filters?: WalletTransactionFilters) => Promise<any>;
  getActivePaymentMethods: () => Promise<void>;
  refreshWallet: () => Promise<void>;
  clearError: () => void;

  // Admin methods
  getAllWallets: (filters?: AdminWalletFilters) => Promise<any>;
  getWalletById: (walletId: string) => Promise<any>;
  updateWalletStatus: (walletId: string, isActive: boolean) => Promise<any>;
  adjustWalletBalance: (walletId: string, data: AdjustWalletData) => Promise<any>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

interface WalletProviderProps {
  children: React.ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { walletUpdates } = useWalletWebSocket(user?.id || "", user?.id);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const getMyWallet = useCallback(async () => {
    try {
      setLoading(true);
      const response = await walletService.getMyWallet();
      if (response.data) {
        setWallet(response.data);
      }
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Failed to fetch wallet";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createWallet = useCallback(async () => {
    try {
      setLoading(true);
      const response = await walletService.createWallet({ currency: "RWF" });
      if (response.data) {
        setWallet(response.data);
      }
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Failed to create wallet";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const topUpWallet = useCallback(async (data: TopUpWalletData) => {
    try {
      setLoading(true);
      const response = await walletService.topUpWallet(data);
      
      // Don't refresh wallet for redirect transactions
      // They will be updated via webhook/websocket when payment completes
      if (response.data && !response.data.requiresRedirect) {
        await getMyWallet();
      }
      
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Failed to top up wallet";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getMyWallet]);

  const getTransactions = useCallback(async (filters?: WalletTransactionFilters) => {
    try {
      setLoading(true);
      const response = await walletService.getWalletTransactions(filters);
      if (response.data) {
        setTransactions(response.data);
      }
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Failed to fetch transactions";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getActivePaymentMethods = useCallback(async () => {
    try {
      const response = await paymentMethodService.getActivePaymentMethods();
      if (response.data) {
        // Filter to only show MOBILE_MONEY and CARD
        const filteredMethods = response.data.filter((method: PaymentMethod) => 
          ['MOBILE_MONEY', 'CARD'].includes(method.name)
        );
        setPaymentMethods(filteredMethods);
      }
    } catch (err: any) {
      console.error('Failed to fetch payment methods:', err);
    }
  }, []);

  const refreshWallet = useCallback(async () => {
    await getMyWallet();
  }, [getMyWallet]);

  // Admin functions
  const getAllWallets = useCallback(async (filters?: AdminWalletFilters) => {
    try {
      setLoading(true);
      const response = await walletService.getAllWallets(filters);
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Failed to fetch wallets";
      setError(errorMessage);
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
      const errorMessage = err.response?.data?.message || "Failed to fetch wallet";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateWalletStatus = useCallback(async (walletId: string, isActive: any) => {
    try {
      setLoading(true);
      const response = await walletService.updateWalletStatus(walletId, isActive);
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Failed to update wallet status";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const adjustWalletBalance = useCallback(async (walletId: string, data: AdjustWalletData) => {
    try {
      setLoading(true);
      const response = await walletService.adjustWalletBalance(walletId, data);
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Failed to adjust wallet balance";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (walletUpdates.length > 0) {
      const latestUpdate = walletUpdates[walletUpdates.length - 1];
      
      if (latestUpdate.action === "TOP_UP") {
        walletService.getMyWallet()
          .then(response => {
            if (response.data) {
              setWallet(response.data);
            }
          })
          .catch(console.error);
        
        walletService.getWalletTransactions({ limit: 10 })
          .then(response => {
            if (response.data) {
              setTransactions(response.data);
            }
          })
          .catch(console.error);
        
        window.dispatchEvent(new CustomEvent('walletTransactionUpdate'));
      }
    }
  }, [walletUpdates]);

  const contextValue: WalletContextType = {
    // State
    wallet,
    transactions,
    paymentMethods,
    loading,
    error,

    // Methods
    getMyWallet,
    createWallet,
    topUpWallet,
    getTransactions,
    getActivePaymentMethods,
    refreshWallet,
    clearError,

    // Admin methods
    getAllWallets,
    getWalletById,
    updateWalletStatus,
    adjustWalletBalance,
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