/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type React from "react";
import {
  createContext,
  useContext,
  useCallback,
  useMemo,
} from "react";
import { restaurantService } from "@/app/services/restaurantService";

export interface Restaurant {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location: string;
  role: string;
  createdAt: string;
  ordersCount: number;
  totalSpent: number;
  status: "active" | "inactive" | "suspended";
}

export interface RestaurantsResponse {
  success: boolean;
  data: Restaurant[];
  message?: string;
}

interface RestaurantContextType {
  getAllRestaurants: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => Promise<RestaurantsResponse & { pagination?: any }>;
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

export function RestaurantProvider({ children }: { children: React.ReactNode }) {
  const getAllRestaurants = useCallback(async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<RestaurantsResponse & { pagination?: any }> => {
    try {
      const response = await restaurantService.getAllRestaurants(params);

      if (response.success && response.data?.restaurants) {
        const transformedRestaurants = response.data.restaurants.map((restaurant: any) => {
          const ordersCount = restaurant.orders?.length || 0;
          const totalSpent = restaurant.orders?.reduce((sum: number, order: any) => {
            return order.status === "DELIVERED" ? sum + order.totalAmount : sum;
          }, 0) || 0;

          return {
            id: restaurant.id,
            name: restaurant.name,
            email: restaurant.email,
            phone: restaurant.phone,
            location: restaurant.location || "Not specified",
            role: restaurant.role || "RESTAURANT",
            createdAt: restaurant.createdAt,
            ordersCount: ordersCount,
            totalSpent: totalSpent,
            status: "active" as const, // Default to active
          };
        });

        return {
          success: true,
          data: transformedRestaurants,
          pagination: response.data.pagination,
        };
      }

      return {
        success: false,
        data: [],
        message: "Failed to fetch restaurants",
      };
    } catch (error) {
      console.error("Failed to fetch restaurants:", error);
      return {
        success: false,
        data: [],
        message: "Failed to fetch restaurants",
      };
    }
  }, []);

  const contextValue: RestaurantContextType = useMemo(() => ({
    getAllRestaurants,
  }), [getAllRestaurants]);

  return (
    <RestaurantContext.Provider value={contextValue}>
      {children}
    </RestaurantContext.Provider>
  );
}

export function useRestaurants() {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error("useRestaurants must be used within a RestaurantProvider");
  }
  return context;
}