"use client";

import React, { createContext, useContext, useCallback, useState } from "react";
import { farmersService } from "@/app/services/farmersService";

export interface Farmer {
  id: string;
  province: string;
  district: string;
  sector: string;
  cell: string;
  village: string;
  role: string;
  phone?: string;
  email?: string;
  createdAt: string;
  submissions: any[];
  status?: "active" | "inactive" | "pending";
}

interface FarmersContextType {
  farmers: Farmer[];
  loading: boolean;
  error: string | null;
  getAllFarmers: () => Promise<any>;
  getFarmerById: (id: string) => Promise<any>;
  createFarmer: (data: any) => Promise<any>;
  updateFarmer: (id: string, data: any) => Promise<any>;
  deleteFarmer: (id: string) => Promise<any>;
  clearError: () => void;
}

const FarmersContext = createContext<FarmersContextType | undefined>(undefined);

interface FarmersProviderProps {
  children: React.ReactNode;
}

export function FarmersProvider({ children }: FarmersProviderProps) {
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const getAllFarmers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await farmersService.getAllFarmers();
      if (response && response.data) {
        setFarmers(response.data.farmers || response.data || []);
      }
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch farmers");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getFarmerById = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const response = await farmersService.getFarmerById(id);
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch farmer");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createFarmer = useCallback(async (data: any) => {
    try {
      setLoading(true);
      const response = await farmersService.createFarmer(data);
      if (response.success) {
        await getAllFarmers(); // Refresh the list
      }
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create farmer");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getAllFarmers]);

  const updateFarmer = useCallback(async (id: string, data: any) => {
    try {
      setLoading(true);
      const response = await farmersService.updateFarmer(id, data);
      if (response.success) {
        await getAllFarmers(); // Refresh the list
      }
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update farmer");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getAllFarmers]);

  const deleteFarmer = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const response = await farmersService.deleteFarmer(id);
      if (response.success) {
        await getAllFarmers(); // Refresh the list
      }
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete farmer");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getAllFarmers]);

  const contextValue: FarmersContextType = {
    farmers,
    loading,
    error,
    getAllFarmers,
    getFarmerById,
    createFarmer,
    updateFarmer,
    deleteFarmer,
    clearError,
  };

  return (
    <FarmersContext.Provider value={contextValue}>
      {children}
    </FarmersContext.Provider>
  );
}

export function useFarmers() {
  const context = useContext(FarmersContext);
  if (context === undefined) {
    throw new Error("useFarmers must be used within a FarmersProvider");
  }
  return context;
}