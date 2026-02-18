/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type React from "react";
import {
  createContext,
  useContext,
  useCallback,
  useMemo,
} from "react";
import { adminsService } from "@/app/services/adminsService";

export interface Admin {
  id: string;
  username: string;
  email: string;
  role: string;
  phone?: string;
  location?: string;
  province?: string;
  district?: string;
  sector?: string;
  cell?: string;
  village?: string;
  createdAt: string;
  status?: "active" | "inactive" | "suspended";
}

export interface AdminsResponse {
  success: boolean;
  data: Admin[];
  message?: string;
}

interface AdminsContextType {
  getAllAdmins: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => Promise<AdminsResponse & { pagination?: any }>;
  getAdminById: (id: string) => Promise<any>;
  createAdmin: (data: any) => Promise<any>;
  updateAdmin: (id: string, data: any) => Promise<any>;
  deleteAdmin: (id: string) => Promise<any>;
}

const AdminsContext = createContext<AdminsContextType | undefined>(undefined);

export function AdminsProvider({ children }: { children: React.ReactNode }) {
  const getAllAdmins = useCallback(async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<AdminsResponse & { pagination?: any }> => {
    try {
      const response = await adminsService.getAllAdmins(params);

      if (response.success && response.data?.admins) {
        return {
          success: true,
          data: response.data.admins,
          pagination: response.data.pagination,
        };
      }

      return {
        success: false,
        data: [],
        message: "Failed to fetch admins",
      };
    } catch (error) {
      console.error("Failed to fetch admins:", error);
      return {
        success: false,
        data: [],
        message: "Failed to fetch admins",
      };
    }
  }, []);

  const getAdminById = useCallback(async (id: string) => {
    try {
      const response = await adminsService.getAdminById(id);
      return response;
    } catch (err: any) {
      console.error("Failed to fetch admin:", err);
      throw err;
    }
  }, []);

  const createAdmin = useCallback(async (data: any) => {
    try {
      const response = await adminsService.createAdmin(data);
      return response;
    } catch (err: any) {
      console.error("Failed to create admin:", err);
      throw err;
    }
  }, []);

  const updateAdmin = useCallback(async (id: string, data: any) => {
    try {
      const response = await adminsService.updateAdmin(id, data);
      return response;
    } catch (err: any) {
      console.error("Failed to update admin:", err);
      throw err;
    }
  }, []);

  const deleteAdmin = useCallback(async (id: string) => {
    try {
      const response = await adminsService.deleteAdmin(id);
      return response;
    } catch (err: any) {
      console.error("Failed to delete admin:", err);
      throw err;
    }
  }, []);

  const contextValue: AdminsContextType = useMemo(() => ({
    getAllAdmins,
    getAdminById,
    createAdmin,
    updateAdmin,
    deleteAdmin,
  }), [getAllAdmins, getAdminById, createAdmin, updateAdmin, deleteAdmin]);

  return (
    <AdminsContext.Provider value={contextValue}>
      {children}
    </AdminsContext.Provider>
  );
}

export function useAdmins() {
  const context = useContext(AdminsContext);
  if (!context) {
    throw new Error("useAdmins must be used within an AdminsProvider");
  }
  return context;
}
