/* eslint-disable @typescript-eslint/no-explicit-any */
import createAxiosClient from "../hooks/axiosClient";

export interface CheckoutRequest {
  cartId: string;
  paymentMethod: "CASH" | "MOBILE_MONEY" | "BANK_TRANSFER" | "CARD";
  billingName?: string;
  billingEmail?: string;
  billingPhone?: string;
  billingAddress?: string;
  notes?: string;
  deliveryDate?: string; // ISO string
  clientIp?: string;
  deviceFingerprint?: string;
  narration?: string;
  currency?: string;
  cardDetails?: {
    cardNumber: string;
    expiryMonth: string;
    expiryYear: string;
    cvv: string;
  }
  cardholderName?: string;

  phoneNumber?: string;
}

export interface Checkout {
  id: string;
  cartId: string;
  restaurantId: string;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  billingName?: string;
  billingEmail?: string;
  billingPhone?: string;
  billingAddress?: string;
  notes?: string;
  deliveryDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

// --------------------
// Checkout Service Class
// --------------------
class CheckoutService {
  private axiosClient = createAxiosClient();

  // Create a checkout from a cart
  async createCheckout(
    payload: CheckoutRequest
  ): Promise<ApiResponse<Checkout>> {
    try {
      const response = await this.axiosClient.post("/checkouts", payload);
      return {
        success: true,
        message: "Checkout created successfully",
        data: response.data.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to create checkout",
      };
    }
  }

  // Get current restaurant's checkouts
  async getMyCheckouts(): Promise<ApiResponse<Checkout[]>> {
    try {
      const response = await this.axiosClient.get("/checkouts/my-checkouts");
      return {
        success: true,
        message: "Fetched checkouts successfully",
        data: response.data.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch checkouts",
      };
    }
  }

  // Get all checkouts (admin only)
  async getAllCheckouts(query?: {
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<Checkout[]>> {
    try {
      const response = await this.axiosClient.get("/checkouts", {
        params: query,
      });
      return {
        success: true,
        message: "Fetched all checkouts successfully",
        data: response.data.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch checkouts",
      };
    }
  }

  // Get checkout by ID
  async getCheckoutById(checkoutId: string): Promise<ApiResponse<Checkout>> {
    try {
      const response = await this.axiosClient.get(`/checkouts/${checkoutId}`);
      return {
        success: true,
        message: "Fetched checkout successfully",
        data: response.data.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to fetch checkout by ID",
      };
    }
  }

  // Update checkout (before payment completion)
  async updateCheckout(
    checkoutId: string,
    payload: Partial<CheckoutRequest>
  ): Promise<ApiResponse<Checkout>> {
    try {
      const response = await this.axiosClient.patch(
        `/checkouts/${checkoutId}`,
        payload
      );
      return {
        success: true,
        message: "Checkout updated successfully",
        data: response.data.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to update checkout",
      };
    }
  }

  // Process payment for checkout
  async processPayment(
    checkoutId: string,
    paymentData: any
  ): Promise<ApiResponse<any>> {
    try {
      const response = await this.axiosClient.post(
        `/checkouts/${checkoutId}/payment`,
        paymentData
      );
      return {
        success: true,
        message: "Payment processed successfully",
        data: response.data.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to process payment",
      };
    }
  }

  // Cancel checkout
  async cancelCheckout(checkoutId: string): Promise<ApiResponse<any>> {
    try {
      const response = await this.axiosClient.delete(
        `/checkouts/${checkoutId}`
      );
      return {
        success: true,
        message: "Checkout cancelled successfully",
        data: response.data.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to cancel checkout",
      };
    }
  }
}

export const checkoutService = new CheckoutService();
