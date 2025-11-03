/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { authService } from "@/app/services/authService";

interface User {
  id: string;
  name?: string;
  username?: string;
  email: string;
  phone?: string;
  role: string;
  profileImage?: string;
  location?: string;
  restaurantId?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (loginData: any) => Promise<any>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  getUserProfileImage: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialCheckDone, setIsInitialCheckDone] = useState(false);
  const checkingRef = useRef(false);

  const checkAuth = useCallback(async () => {
    // Prevent multiple simultaneous auth checks
    if (checkingRef.current) {
      return;
    }

    checkingRef.current = true;

    try {
      setIsLoading(true);
      const response = await authService.getCurrentUser();

      if (response.success && response.user) {
        setUser(response.user);
        setIsAuthenticated(true);
      setIsLoading(false);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
      setIsAuthenticated(false);
      
    } finally {
      setIsLoading(false);
      setIsInitialCheckDone(true);
      checkingRef.current = false;
    }
  }, []);

  const login = useCallback(
    async (loginData: any) => {
      try {
        const response = await authService.login(loginData);

        if (response.success) {
          // Immediately check auth after successful login
          await checkAuth();

          // Dispatch a custom event to notify other components
          window.dispatchEvent(new CustomEvent("loginSuccess"));

          // Small delay to ensure all state updates are processed
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent("userDataLoaded"));
          }, 100);
        }

        return response;
      } catch (error) {
        console.error("Login failed:", error);
        throw error;
      }
    },
    [checkAuth]
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);

      // Clear any cached data
      if (typeof window !== "undefined") {
        localStorage.removeItem("pendingCartProduct");
        localStorage.removeItem("returnUrl");
      }
    } catch (error) {
      console.error("Logout failed:", error);
      // Even if logout fails, clear local state
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  const getUserProfileImage = useCallback((): string | null => {
    if (!user?.profileImage) return null;

    // Handle different image URL formats
    if (user.profileImage.startsWith("http")) {
      return user.profileImage;
    }

    // If it's a relative path, construct the full URL
    return `${process.env.NEXT_PUBLIC_BACKEND_URL}${user.profileImage}`;
  }, [user]);

  // Check if there's a token in storage without making API call
  const hasTokenInStorage = useCallback(() => {
    if (typeof window === "undefined") return false;

    // Check localStorage
    const token = localStorage.getItem("auth-token");
    if (token) return true;

    // Check cookies
    const cookies = document.cookie.split(";");
    const authCookie = cookies.find((cookie) =>
      cookie.trim().startsWith("auth-token=")
    );
    return !!authCookie;
  }, []);

  // Initial auth check on mount - only if token exists
  useEffect(() => {
    if (!isInitialCheckDone) {
      if (hasTokenInStorage()) {
        checkAuth();
      } else {
        // No token found, set initial state without API call
        setUser(null);
        setIsAuthenticated(false);
        setIsLoading(false);
        setIsInitialCheckDone(true);
      }
    }
  }, [isInitialCheckDone]); 

  useEffect(() => {
    let debounceTimer: NodeJS.Timeout;
    
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "auth-token") {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          if (e.newValue && !isAuthenticated) {
            // Token added, check auth only if not already authenticated
            checkAuth();
          } else if (!e.newValue && isAuthenticated) {
            // Token removed, logout only if currently authenticated
            setUser(null);
            setIsAuthenticated(false);
          }
        }, 100);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearTimeout(debounceTimer);
    };
  }, [isAuthenticated]); 



  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuth,
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
