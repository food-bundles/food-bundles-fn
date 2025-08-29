"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  cartService,
  type Cart,
  type CartItem,
} from "@/app/services/cartService";

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

  const refreshCart = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await cartService.getMyCart();

      if (response.success && response.data) {
        setCart(response.data);
      } else {
        // If no cart exists, create an empty cart state
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
    }
  }, []);

  const addToCart = useCallback(
    async (productId: string, quantity: number): Promise<boolean> => {
      try {
        setError(null);
        const response = await cartService.addToCart(productId, quantity);

        if (response.success) {
          await refreshCart(); // Refresh cart data after adding
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
    [refreshCart]
  );

  const updateCartItem = useCallback(
    async (cartItemId: string, quantity: number): Promise<boolean> => {
      try {
        setError(null);
        const response = await cartService.updateCartItem(cartItemId, quantity);

        if (response.success) {
          await refreshCart(); // Refresh cart data after updating
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
    [refreshCart]
  );

  const removeCartItem = useCallback(
    async (cartItemId: string): Promise<boolean> => {
      try {
        setError(null);
        const response = await cartService.removeCartItem(cartItemId);

        if (response.success) {
          await refreshCart(); // Refresh cart data after removing
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
    [refreshCart]
  );

  const clearCart = useCallback(async (): Promise<boolean> => {
    try {
      setError(null);
      const response = await cartService.clearCart();

      if (response.success) {
        await refreshCart(); // Refresh cart data after clearing
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
  }, [refreshCart]);

  // Load cart data on mount
  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  // Calculate derived values from API response
  const cartItems = cart?.cartItems || [];

  // Use API values if available, fallback to calculations
  const totalItems = cart?.totalItems ?? cartItems.length;
  const totalQuantity =
    cart?.totalQuantity ??
    cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cart?.totalAmount || 0;

  const value: CartContextType = {
    cart,
    cartItems,
    isLoading,
    error,
    totalItems, // Number of different products (2 in your example)
    totalQuantity, // Sum of all quantities (110 in your example)
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
