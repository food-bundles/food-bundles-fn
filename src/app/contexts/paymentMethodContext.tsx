"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { paymentMethodService, PaymentMethod } from '../services/paymentMethodService';

interface PaymentMethodContextType {
  paymentMethods: PaymentMethod[];
  loading: boolean;
  error: string | null;
  getActivePaymentMethods: () => Promise<void>;
  getPaymentMethodById: (id: string) => PaymentMethod | undefined;
}

const PaymentMethodContext = createContext<PaymentMethodContextType | undefined>(undefined);

interface PaymentMethodProviderProps {
  children: React.ReactNode;
}

export function PaymentMethodProvider({ children }: PaymentMethodProviderProps) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getActivePaymentMethods = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await paymentMethodService.getActivePaymentMethods();
      if (response.data) {
        setPaymentMethods(response.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch payment methods");
    } finally {
      setLoading(false);
    }
  }, []);

  const getPaymentMethodById = useCallback((id: string): PaymentMethod | undefined => {
    return paymentMethods.find(method => method.id === id);
  }, [paymentMethods]);

  useEffect(() => {
    getActivePaymentMethods();
  }, [getActivePaymentMethods]);

  const value: PaymentMethodContextType = {
    paymentMethods,
    loading,
    error,
    getActivePaymentMethods,
    getPaymentMethodById,
  };

  return (
    <PaymentMethodContext.Provider value={value}>
      {children}
    </PaymentMethodContext.Provider>
  );
}

export function usePaymentMethods() {
  const context = useContext(PaymentMethodContext);
  if (context === undefined) {
    throw new Error('usePaymentMethods must be used within a PaymentMethodProvider');
  }
  return context;
}