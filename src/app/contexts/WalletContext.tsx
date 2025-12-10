/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { createContext, useContext, useCallback, useState, useEffect } from "react";
import { walletService, TopUpWalletData, WalletTransactionFilters } from "@/app/services/walletService";
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
  loading: boolean;
  error: string | null;

  // Methods
  getMyWallet: () => Promise<any>;
  createWallet: () => Promise<any>;
  topUpWallet: (data: TopUpWalletData) => Promise<any>;
  getTransactions: (filters?: WalletTransactionFilters) => Promise<any>;
  refreshWallet: () => Promise<void>;
  clearError: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

interface WalletProviderProps {
  children: React.ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
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
      
      // Only refresh wallet for completed transactions (mobile money success)
      // Card payments will be updated via webhook/websocket
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

  const refreshWallet = useCallback(async () => {
    await getMyWallet();
  }, [getMyWallet]);

  // Handle WebSocket wallet updates
  useEffect(() => {
    if (walletUpdates.length > 0) {
      const latestUpdate = walletUpdates[walletUpdates.length - 1];
      
      // Refresh wallet and transactions when we receive any wallet update
      if (latestUpdate.action === "TOP_UP") {
        // Refresh wallet balance
        walletService.getMyWallet()
          .then(response => {
            if (response.data) {
              setWallet(response.data);
            }
          })
          .catch(console.error);
        
        // Refresh transactions
        walletService.getWalletTransactions({ limit: 10 })
          .then(response => {
            if (response.data) {
              setTransactions(response.data);
            }
          })
          .catch(console.error);
        
        // Dispatch custom event for deposits page to refresh its transactions
        window.dispatchEvent(new CustomEvent('walletTransactionUpdate'));
      }
    }
  }, [walletUpdates]);

  const contextValue: WalletContextType = {
    // State
    wallet,
    transactions,
    loading,
    error,

    // Methods
    getMyWallet,
    createWallet,
    topUpWallet,
    getTransactions,
    refreshWallet,
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