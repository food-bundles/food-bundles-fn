/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRestaurants } from "@/app/contexts/RestaurantContext";
import { RestaurantManagement } from "./_components/restaurant-management";
import type { Restaurant } from "@/app/contexts/RestaurantContext";
import { Spinner } from "@/components/ui/shadcn-io/spinner";

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [paginationLoading, setPaginationLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 0,
  });
  const { getAllRestaurants } = useRestaurants();

  // Fetch restaurants with pagination
  const fetchRestaurants = async (page = 1, limit = 5, isPagination = false) => {
    try {
      if (isPagination) {
        setPaginationLoading(true);
      } else {
        setLoading(true);
      }
      const response = await getAllRestaurants({ page, limit });

      if (response?.success && Array.isArray(response?.data)) {
        setRestaurants(response.data);
        
        // Update pagination from API response
        if (response.pagination) {
          setPagination({
            page: response.pagination.page,
            limit: response.pagination.limit,
            total: response.pagination.total,
            totalPages: response.pagination.totalPages,
          });
        }
      } else {
        console.warn("Unexpected API response format:", response);
      }
    } catch (error) {
      console.error("Failed to fetch restaurants:", error);
    } finally {
      setLoading(false);
      setPaginationLoading(false);
    }
  };

  const handlePaginationChange = (page: number, limit: number) => {
    fetchRestaurants(page, limit, true);
  };

  useEffect(() => {
    fetchRestaurants(1, 10);
  }, []);

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        <Spinner variant="ring" />
      </div>
    );
  return (
    <div className="p-6">
      <RestaurantManagement 
        restaurants={restaurants} 
        onRefresh={() => fetchRestaurants(pagination.page, pagination.limit)}
        pagination={pagination}
        onPaginationChange={handlePaginationChange}
        isLoading={paginationLoading}
      />
    </div>
  );
}
