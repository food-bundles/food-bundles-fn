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
import { useCartLiveUpdates } from "@/hooks/useCartLiveUpdates";

// ── Guest cart ────────────────────────────────────────────────────────────
// Visitors who are not logged in can still fill a cart. It lives in this
// browser only; when a buyer logs in, it is moved into their account cart.

export interface GuestProductInfo {
  name: string;
  price: number;
  image?: string;
  unit?: string;
}

type GuestCartItem = CartItem & {
  product: { productName: string; images: string[]; unit?: string };
};

const GUEST_CART_KEY = "fb-guest-cart";
// Visitors log in before checkout, then come straight back to it
export const GUEST_CHECKOUT_HREF = "/login?redirect=%2Frestaurant%2Fcheckout";
// Roles that have a server cart (they shop at /restaurant)
const BUYER_ROLES = ["RESTAURANT", "HOTEL", "AFFILIATOR"];

function readGuestCart(): GuestCartItem[] {
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeGuestCart(items: GuestCartItem[]) {
  try {
    if (items.length) localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
    else localStorage.removeItem(GUEST_CART_KEY);
  } catch {
    // storage blocked: the cart just won't survive a reload
  }
}

// Several CartProviders can mount at once (root and restaurant layouts);
// this makes sure the guest cart is sent to the server only once.
let guestMergePromise: Promise<void> | null = null;
function mergeGuestCart(): Promise<void> {
  if (!guestMergePromise) {
    guestMergePromise = (async () => {
      const items = readGuestCart();
      if (!items.length) return;
      for (const item of items) {
        const res = await cartService.addToCart(item.productId, item.quantity);
        if (!res.success) console.error("Could not move guest cart item:", res.message);
      }
      // Cleared after the attempt, so a reload mid-way does not lose the cart
      writeGuestCart([]);
    })().finally(() => {
      guestMergePromise = null;
    });
  }
  return guestMergePromise;
}

function guestCartToCart(items: GuestCartItem[]): Cart | null {
  if (!items.length) return null;
  const now = new Date().toISOString();
  return {
    id: "guest",
    restaurantId: "",
    totalAmount: items.reduce((s, i) => s + i.subtotal, 0),
    status: "GUEST",
    createdAt: now,
    updatedAt: now,
    cartItems: items,
    totalItems: items.length,
    totalQuantity: items.reduce((s, i) => s + i.quantity, 0),
  };
}

interface CartContextType {
  cart: Cart | null;
  cartItems: CartItem[];
  isLoading: boolean;
  error: string | null;
  totalItems: number;
  totalQuantity: number;
  totalAmount: number;
  /** True while the cart only lives in this browser (visitor not logged in) */
  isGuestCart: boolean;
  refreshCart: () => Promise<void>;
  addToCart: (productId: string, quantity: number, product?: GuestProductInfo) => Promise<boolean>;
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
  const refreshingRef = useRef(false);
  const lastAuthState = useRef<boolean | null>(false);

  const isGuest = !authLoading && !isAuthenticated;

  const setGuestItems = useCallback((items: GuestCartItem[]) => {
    writeGuestCart(items);
    setCart(guestCartToCart(items));
  }, []);

  const refreshCart = useCallback(async (silent = false) => {
    if (authLoading) return;
    // Visitors: the cart is the one saved in this browser
    if (!isAuthenticated || !user) {
      setCart(guestCartToCart(readGuestCart()));
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
      // Only show loading spinner on initial/explicit loads, not background syncs
      if (!silent) setIsLoading(true);
      setError(null);

      // A buyer who just logged in: move what they picked as a visitor first
      if (BUYER_ROLES.includes(user.role)) await mergeGuestCart();

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

  // Cart changed on the mobile app or another tab: re-read it quietly, no refresh needed
  useCartLiveUpdates(isAuthenticated ? user?.id : null, () => void refreshCart(true));

  const addToCart = useCallback(
    async (productId: string, quantity: number, product?: GuestProductInfo): Promise<boolean> => {
      if (!isAuthenticated || !user) {
        if (!product) {
          setError("Please log in to add items to cart");
          return false;
        }
        const items = readGuestCart().filter((i) => i.productId !== productId);
        const now = new Date().toISOString();
        items.push({
          id: `guest-${productId}`,
          productId,
          quantity,
          unitPrice: product.price,
          subtotal: product.price * quantity,
          createdAt: now,
          updatedAt: now,
          product: { productName: product.name, images: product.image ? [product.image] : [], unit: product.unit },
        });
        setGuestItems(items);
        return true;
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
    [isAuthenticated, user, refreshCart, setGuestItems]
  );

  const updateCartItem = useCallback(
    async (cartItemId: string, quantity: number): Promise<boolean> => {
      if (!isAuthenticated || !user) {
        setGuestItems(
          readGuestCart().map((i) =>
            i.id === cartItemId ? { ...i, quantity, subtotal: i.unitPrice * quantity, updatedAt: new Date().toISOString() } : i
          )
        );
        return true;
      }

      // Optimistic update: reflect new quantity/total immediately in UI
      setCart((prevCart) => {
        if (!prevCart) return prevCart;
        const newCartItems = prevCart.cartItems.map((item) =>
          item.id === cartItemId
            ? { ...item, quantity, subtotal: item.unitPrice * quantity }
            : item
        );
        const totalQuantity = newCartItems.reduce((s, i) => s + i.quantity, 0);
        const totalAmount = newCartItems.reduce((s, i) => s + i.subtotal, 0);
        return {
          ...prevCart,
          cartItems: newCartItems,
          totalQuantity,
          totalAmount,
          totalItems: newCartItems.length,
        };
      });

      try {
        setError(null);
        const response = await cartService.updateCartItem(cartItemId, quantity);
        if (!response.success) {
          // Revert on failure by re-fetching
          setError(response.message || "Failed to update cart item");
          await refreshCart(true);
          return false;
        }
        return true;
      } catch (error) {
        console.error("Error updating cart item:", error);
        setError("Failed to update cart item");
        await refreshCart(true);
        return false;
      }
    },
    [isAuthenticated, user, refreshCart, setGuestItems]
  );

  const removeCartItem = useCallback(
    async (cartItemId: string): Promise<boolean> => {
      if (!isAuthenticated || !user) {
        setGuestItems(readGuestCart().filter((i) => i.id !== cartItemId));
        return true;
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
    [isAuthenticated, user, refreshCart, setGuestItems]
  );

  const clearCart = useCallback(async (): Promise<boolean> => {
    if (!isAuthenticated || !user) {
      setGuestItems([]);
      return true;
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
  }, [isAuthenticated, user, refreshCart, setGuestItems]);

  // Visitors: show the cart saved in this browser
  useEffect(() => {
    if (isGuest) {
      setCart(guestCartToCart(readGuestCart()));
      setIsLoading(false);
    }
  }, [isGuest]);

  // Effect to handle auth state changes - but only when it actually changes
  useEffect(() => {
    const wasAuthenticated = lastAuthState.current;
    const isNowAuthenticated = isAuthenticated && user && !authLoading;

    // Only act on actual state changes
    if (wasAuthenticated !== isNowAuthenticated) {
      if (!wasAuthenticated && isNowAuthenticated) {
        // User just logged in
        refreshCart();
      } else if (wasAuthenticated && !isNowAuthenticated) {
        // User logged out: back to the cart saved in this browser
        setCart(guestCartToCart(readGuestCart()));
        setError(null);
        setIsLoading(false);
      }
      lastAuthState.current = isNowAuthenticated;
    }
  }, [isAuthenticated, user, authLoading, refreshCart]); // Fixed dependencies

  // Listen for login success events - simplified
  useEffect(() => {
    const handleUserDataLoaded = () => {
      if (isAuthenticated && user && !refreshingRef.current) {
        refreshCart();
      }
    };

    window.addEventListener("userDataLoaded", handleUserDataLoaded);
    return () => window.removeEventListener("userDataLoaded", handleUserDataLoaded);
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
    isGuestCart: isGuest,
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
