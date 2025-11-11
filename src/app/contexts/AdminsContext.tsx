"use client";

import React, { createContext, useContext, useCallback, useState } from "react";
import { adminsService } from "@/app/services/adminsService";

export interface Admin {
  id: string;
  username: string;
  email: string;
  role: string;
  phone?: string;
  province?: string;
  district?: string;
  sector?: string;
  cell?: string;
  village?: string;
  createdAt: string;
  status?: "active" | "inactive" | "suspended";
}

interface AdminsContextType {
  admins: Admin[];
  loading: boolean;
  error: string | null;
  getAllAdmins: () => Promise<any>;
  getAdminById: (id: string) => Promise<any>;
  createAdmin: (data: any) => Promise<any>;
  updateAdmin: (id: string, data: any) => Promise<any>;
  deleteAdmin: (id: string) => Promise<any>;
  clearError: () => void;
}

const AdminsContext = createContext<AdminsContextType | undefined>(undefined);

interface AdminsProviderProps {
  children: React.ReactNode;
}

export function AdminsProvider({ children }: AdminsProviderProps) {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const getAllAdmins = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminsService.getAllAdmins();
      if (response && response.data) {
        setAdmins(response.data.admins || response.data || []);
      }
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch admins");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getAdminById = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const response = await adminsService.getAdminById(id);
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch admin");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createAdmin = useCallback(async (data: any) => {
    try {
      setLoading(true);
      const response = await adminsService.createAdmin(data);
      if (response.success) {
        await getAllAdmins(); // Refresh the list
      }
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create admin");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getAllAdmins]);

  const updateAdmin = useCallback(async (id: string, data: any) => {
    try {
      setLoading(true);
      const response = await adminsService.updateAdmin(id, data);
      if (response.success) {
        await getAllAdmins(); // Refresh the list
      }
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update admin");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getAllAdmins]);

  const deleteAdmin = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const response = await adminsService.deleteAdmin(id);
      if (response.success) {
        await getAllAdmins(); // Refresh the list
      }
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete admin");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getAllAdmins]);

  const contextValue: AdminsContextType = {
    admins,
    loading,
    error,
    getAllAdmins,
    getAdminById,
    createAdmin,
    updateAdmin,
    deleteAdmin,
    clearError,
  };

  return (
    <AdminsContext.Provider value={contextValue}>
      {children}
    </AdminsContext.Provider>
  );
}

export function useAdmins() {
  const context = useContext(AdminsContext);
  if (context === undefined) {
    throw new Error("useAdmins must be used within an AdminsProvider");
  }
  return context;
}