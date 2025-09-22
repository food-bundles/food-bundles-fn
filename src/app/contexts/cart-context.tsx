/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import {
  cartService,
  type Cart,
  type CartItem,
} from "@/app/services/cartService";
import { useAuth } from "./auth-context";

interface CartContextType {
  cart: Cart | null;
  cartItems: CartItem[];
  isLoading: boolean;
  error: string | null;
  totalItems: number;
  totalQuantity: number;
  totalAmount: number;
  refreshCart: () => Promise<void>;
  addToCart: (productId: string, quantity: number) => Promise<boolean>;
  updateCartItem: (cartItemId: string, quantity: number) => Promise<boolean>;
  removeCartItem: (cartItemId: string) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: React.ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  // const lastAuthState = useRef<boolean>(false);
  const refreshingRef = useRef(false);
  const lastAuthState: { current: boolean | null } = { current: false };
  

  const refreshCart = useCallback(async () => {
    // Don't fetch if auth is still loading or user is not authenticated
    if (authLoading || !isAuthenticated || !user) {
      setCart(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    // Prevent multiple simultaneous refreshes
    if (refreshingRef.current) {
      return;
    }

    refreshingRef.current = true;

    try {
      setIsLoading(true);
      setError(null);

      const response = await cartService.getMyCart();

      if (response.success && response.data) {
        setCart(response.data);
      } else {
        setCart(null);
        if (response.message && !response.message.includes("not found")) {
          setError(response.message);
        }
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      setError("Failed to load cart");
      setCart(null);
    } finally {
      setIsLoading(false);
      refreshingRef.current = false;
    }
  }, [isAuthenticated, user, authLoading]);

  const addToCart = useCallback(
    async (productId: string, quantity: number): Promise<boolean> => {
      if (!isAuthenticated || !user) {
        setError("Please log in to add items to cart");
        return false;
      }

      try {
        setError(null);
        const response = await cartService.addToCart(productId, quantity);

        if (response.success) {
          await refreshCart();
          return true;
        } else {
          setError(response.message || "Failed to add item to cart");
          return false;
        }
      } catch (error) {
        console.error("Error adding to cart:", error);
        setError("Failed to add item to cart");
        return false;
      }
    },
    [isAuthenticated, user, refreshCart]
  );

  const updateCartItem = useCallback(
    async (cartItemId: string, quantity: number): Promise<boolean> => {
      if (!isAuthenticated || !user) {
        setError("Please log in to update cart items");
        return false;
      }

      try {
        setError(null);
        const response = await cartService.updateCartItem(cartItemId, quantity);

        if (response.success) {
          await refreshCart();
          return true;
        } else {
          setError(response.message || "Failed to update cart item");
          return false;
        }
      } catch (error) {
        console.error("Error updating cart item:", error);
        setError("Failed to update cart item");
        return false;
      }
    },
    [isAuthenticated, user, refreshCart]
  );

  const removeCartItem = useCallback(
    async (cartItemId: string): Promise<boolean> => {
      if (!isAuthenticated || !user) {
        setError("Please log in to remove cart items");
        return false;
      }

      try {
        setError(null);
        const response = await cartService.removeCartItem(cartItemId);

        if (response.success) {
          await refreshCart();
          return true;
        } else {
          setError(response.message || "Failed to remove cart item");
          return false;
        }
      } catch (error) {
        console.error("Error removing cart item:", error);
        setError("Failed to remove cart item");
        return false;
      }
    },
    [isAuthenticated, user, refreshCart]
  );

  const clearCart = useCallback(async (): Promise<boolean> => {
    if (!isAuthenticated || !user) {
      setError("Please log in to clear cart");
      return false;
    }

    try {
      setError(null);
      const response = await cartService.clearCart();

      if (response.success) {
        await refreshCart();
        return true;
      } else {
        setError(response.message || "Failed to clear cart");
        return false;
      }
    } catch (error) {
      console.error("Error clearing cart:", error);
      setError("Failed to clear cart");
      return false;
    }
  }, [isAuthenticated, user, refreshCart]);

  // Effect to handle auth state changes - but only when it actually changes
  useEffect(() => {
    const wasAuthenticated = lastAuthState.current;
    const isNowAuthenticated = isAuthenticated && user && !authLoading;

    // Only act on actual state changes
    if (wasAuthenticated !== isNowAuthenticated) {
      if (!wasAuthenticated && isNowAuthenticated) {
        // User just logged in
        console.log("User authenticated, refreshing cart...");
        refreshCart();
      } else if (wasAuthenticated && !isNowAuthenticated) {
        // User logged out
        console.log("User logged out, clearing cart...");
        setCart(null);
        setError(null);
        setIsLoading(false);
      }

      lastAuthState.current = isNowAuthenticated;
    }
    // Only refresh cart if user is authenticated but we don't have cart data yet
    else if (
      isNowAuthenticated &&
      !cart &&
      !isLoading &&
      !refreshingRef.current &&
      !authLoading
    ) {
      console.log("User authenticated but cart not loaded, refreshing...");
      refreshCart();
    }
  }, [isAuthenticated, user, authLoading]); // Removed cart and isLoading from dependencies to prevent loops

  // Listen for login success events - but only trigger once
  useEffect(() => {
    let hasHandledLogin = false;

    const handleLoginSuccess = () => {
      if (hasHandledLogin) return;
      console.log(
        "Login success event received, will refresh cart when auth updates..."
      );
      hasHandledLogin = true;
    };

    const handleUserDataLoaded = () => {
      if (hasHandledLogin) return;
      console.log("User data loaded event received, refreshing cart...");
      if (isAuthenticated && user) {
        refreshCart();
        hasHandledLogin = true;
      }
    };

    window.addEventListener("loginSuccess", handleLoginSuccess);
    window.addEventListener("userDataLoaded", handleUserDataLoaded);

    return () => {
      window.removeEventListener("loginSuccess", handleLoginSuccess);
      window.removeEventListener("userDataLoaded", handleUserDataLoaded);
    };
  }, [isAuthenticated, user, refreshCart]);

  // Calculate derived values from cart data
  const cartItems = cart?.cartItems || [];
  const totalItems = cart?.totalItems ?? cartItems.length;
  const totalQuantity =
    cart?.totalQuantity ??
    cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cart?.totalAmount || 0;

  const value: CartContextType = {
    cart,
    cartItems,
    isLoading: isLoading || authLoading,
    error,
    totalItems,
    totalQuantity,
    totalAmount,
    refreshCart,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

// Hook to check if a product is in cart
export function useCartItem(productId: string) {
  const { cartItems } = useCart();
  return cartItems.find((item) => item.productId === productId) || null;
}

// Hook to get cart summary for header/navigation
export function useCartSummary() {
  const { totalItems, totalQuantity, totalAmount, isLoading } = useCart();
  return { totalItems, totalQuantity, totalAmount, isLoading };
}
