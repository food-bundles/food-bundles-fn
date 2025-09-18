/* eslint-disable @typescript-eslint/no-explicit-any */
// Frontend Auth Context - Token-Based
"use client";

import type React from "react";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { authService } from "@/app/services/authService";
import { type IUser, UserRole, type ILoginData } from "@/lib/types";
import { getToken, removeToken } from "@/app/hooks/axiosClient";

interface AuthContextType {
  user: IUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (loginData: ILoginData) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  hasRole: (roles: UserRole[]) => boolean;
  getUserProfileImage: () => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

const mapUserRoleToRole = (userRole: string, user: any): UserRole => {
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
      const token = getToken();

      if (!token) {
        setUser(null);
        return;
      }

      const response = await authService.getCurrentUser();

      if (response.user && response.userRole) {
        const userRole = mapUserRoleToRole(response.userRole, response.user);
        setUser({ ...response.user, role: userRole });
      } else {
        setUser(null);
        removeToken();
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
      removeToken();
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

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setLoading(false);
    }
  }, []);

  const hasRole = useCallback(
    (roles: UserRole[]): boolean => {
      if (!user) return false;
      return roles.includes(user.role);
    },
    [user]
  );

const getUserProfileImage = useCallback((): string => {
  if (user?.profileImage) {
    if (user.profileImage.startsWith("http")) {
      return user.profileImage;
    }
    return `${process.env.NEXT_PUBLIC_BACKEND_URL}/uploads/profiles/${user.profileImage}`;
  }

  // 👇 generate initials if no profile image
  if (user?.name) {
    const initials = user.name
      .trim()
      .split(" ")
      .map((part) => part[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();

    // Use a simple SVG with initials encoded as data URI
    return `data:image/svg+xml;utf8,
      <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
        <rect width="100%" height="100%" fill="#4CAF50"/>
        <text x="50%" y="50%" dy=".35em"
          font-family="Arial, sans-serif"
          font-size="40"
          fill="white"
          text-anchor="middle">
          ${initials}
        </text>
      </svg>`;
  }

  // If no name either
  return `data:image/svg+xml;utf8,
    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
      <rect width="100%" height="100%" fill="#4CAF50"/>
    </svg>`;
}, [user]);


  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const isAuthenticated = !!user;

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    checkAuth,
    hasRole,
    getUserProfileImage,
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
