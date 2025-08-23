/* eslint-disable @typescript-eslint/no-explicit-any */
// contexts/auth-context.tsx
"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { authService } from "@/app/services/authService";
import { IUser, UserRole, ILoginData } from "@/lib/types";

interface AuthContextType {
  user: IUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (loginData: ILoginData) => Promise<void>;
  checkAuth: () => Promise<void>;
  hasRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

const mapuserRoleToRole = (userRole: string, user: any): UserRole => {
  if (userRole === UserRole.FARMER) return UserRole.FARMER;
  if (userRole === UserRole.RESTAURANT) return UserRole.RESTAURANT;
  if (userRole === UserRole.ADMIN) {
    switch (user?.role) {
      case "ADMIN":
        return UserRole.ADMIN;
      case "LOGISTIC":
        return UserRole.LOGISTIC;
      case "AGGREGATOR":
        return UserRole.AGGREGATOR;
      case "FOOD_BUNDLE":
        return UserRole.FOOD_BUNDLE;
      default:
        return UserRole.ADMIN;
    }
  }
  return UserRole.FARMER;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(false);

  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      const response = await authService.getCurrentUser();

      if (response.user && response.userRole) {
        const userRole = mapuserRoleToRole(response.userRole, response.user);
        setUser({ ...response.user, role: userRole });
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(
    async (loginData: ILoginData) => {
      try {
        setLoading(true);
        const response = await authService.login(loginData);

        if (response.success) {
          await checkAuth();

          return;
        }

        throw new Error(response.message || "Login failed");
      } catch (error: any) {
        console.error("Login error:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [checkAuth]
  );

 

  const hasRole = useCallback(
    (roles: UserRole[]): boolean => {
      if (!user) return false;
      return roles.includes(user.role);
    },
    [user]
  );

  const isAuthenticated = !!user;

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated,
    login,
    checkAuth,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
