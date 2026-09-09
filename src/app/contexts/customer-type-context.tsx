"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { customerTypeService } from "@/app/services/customerTypeService";

export interface CustomerType {
  id: string;
  name: string;
  description?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface CustomerTypeContextType {
  customerTypes: CustomerType[];
  isLoading: boolean;
  error: string | null;
  refreshCustomerTypes: () => Promise<void>;
}

const CustomerTypeContext = createContext<CustomerTypeContextType | undefined>(
  undefined
);

interface CustomerTypeProviderProps {
  children: React.ReactNode;
}

export function CustomerTypeProvider({ children }: CustomerTypeProviderProps) {
  const [customerTypes, setCustomerTypes] = useState<CustomerType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshCustomerTypes = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await customerTypeService.getAllCustomerTypes();
      if (response.data) {
        setCustomerTypes(response.data);
      } else {
        setCustomerTypes([]);
      }
    } catch (error) {
      console.error("Error fetching customer types:", error);
      setError("Failed to load customer types");
      setCustomerTypes([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCustomerTypes();
  }, []);

  return (
    <CustomerTypeContext.Provider
      value={{ customerTypes, isLoading, error, refreshCustomerTypes }}
    >
      {children}
    </CustomerTypeContext.Provider>
  );
}

export function useCustomerTypes() {
  const context = useContext(CustomerTypeContext);
  if (context === undefined) {
    throw new Error(
      "useCustomerTypes must be used within a CustomerTypeProvider"
    );
  }
  return context;
}
