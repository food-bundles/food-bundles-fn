/* eslint-disable @typescript-eslint/no-explicit-any */
import createAxiosClient from "../hooks/axiosClient";

export interface AddToCartRequest {
  productId: string;
  quantity: number;
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  createdAt: string;
  updatedAt: string;
}

export interface Cart {
  id: string;
  restaurantId: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  cartItems: CartItem[];
  totalItems: number;
  totalQuantity: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

// --------------------
// Cart Service Functions (consistent with product service)
// --------------------
const axiosClient = createAxiosClient();

export const cartService = {
  // Add item to cart
  addToCart: async (
    productId: string,
    quantity: number
  ): Promise<ApiResponse<Cart>> => {
    try {
      const response = await axiosClient.post("/carts/add", {
        productId,
        quantity,
      });
      return {
        success: true,
        message: "Product added to cart successfully",
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to add product to cart",
      };
    }
  },

  // Get current restaurant's cart
  getMyCart: async (): Promise<ApiResponse<Cart>> => {
    try {
      const response = await axiosClient.get("/carts/my-cart");
      return {
        success: true,
        message: "Fetched cart successfully",
        data: response.data.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch cart",
      };
    }
  },

  // Get cart summary (total items, total amount)
  getCartSummary: async (): Promise<
    ApiResponse<{ totalItems: number; totalAmount: number }>
  > => {
    try {
      const response = await axiosClient.get("/carts/summary");
      return {
        success: true,
        message: "Fetched cart summary",
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch summary",
      };
    }
  },

  // Update quantity of a cart item
  updateCartItem: async (
    cartItemId: string,
    quantity: number
  ): Promise<ApiResponse<Cart>> => {
    try {

       const response = await axiosClient.put(`/carts/items/${cartItemId}`, {
         quantity,
       });
        return {
          success: true,
          message: "Cart item updated successfully",
          data: response.data,
        }; 
    } catch (error: any) {
      console.error("Error updating cart item:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to update cart item",
      };
    }
  },

  // Remove a cart item
  removeCartItem: async (cartItemId: string): Promise<ApiResponse<Cart>> => {
    try {
      const response = await axiosClient.delete(`/carts/items/${cartItemId}`);
      return {
        success: true,
        message: "Cart item removed successfully",
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to remove cart item",
      };
    }
  },

  // Clear entire cart
  clearCart: async (): Promise<ApiResponse<Cart>> => {
    try {
      const response = await axiosClient.delete("/carts/clear");
      return {
        success: true,
        message: "Cart cleared successfully",
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to clear cart",
      };
    }
  },

  // ===========================
  // Admin APIs
  // ===========================

  // Get all carts (with pagination/filtering)
  getAllCarts: async (query?: {
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<Cart[]>> => {
    try {
      const response = await axiosClient.get("/carts", { params: query });
      return {
        success: true,
        message: "Fetched all carts",
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch carts",
      };
    }
  },

  // Get cart by ID
  getCartById: async (cartId: string): Promise<ApiResponse<Cart>> => {
    try {
      const response = await axiosClient.get(`/carts/${cartId}`);
      return {
        success: true,
        message: "Fetched cart successfully",
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch cart by ID",
      };
    }
  },
};
