"use client";

import React, { createContext, useContext, useCallback, useState } from "react";
import { restaurantService } from "@/app/services/restaurantService";

interface Restaurant {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

interface RestaurantContextType {
  restaurants: Restaurant[];
  loading: boolean;
  error: string | null;
  getAllRestaurants: () => Promise<any>;
  clearError: () => void;
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

interface RestaurantProviderProps {
  children: React.ReactNode;
}

export function RestaurantProvider({ children }: RestaurantProviderProps) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const getAllRestaurants = useCallback(async () => {
    try {
      setLoading(true);
      const response = await restaurantService.getAllRestaurants();
      if (response && response.data && response.data.restaurants) {
        setRestaurants(response.data.restaurants || []);
      }
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch restaurants");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const contextValue: RestaurantContextType = {
    restaurants,
    loading,
    error,
    getAllRestaurants,
    clearError,
  };

  return (
    <RestaurantContext.Provider value={contextValue}>
      {children}
    </RestaurantContext.Provider>
  );
}

export function useRestaurants() {
  const context = useContext(RestaurantContext);
  if (context === undefined) {
    throw new Error("useRestaurants must be used within a RestaurantProvider");
  }
  return context;
}