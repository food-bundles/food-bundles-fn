/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRestaurants } from "@/app/contexts/RestaurantContext";
import { RestaurantManagement } from "./_components/restaurant-management";
import type { Restaurant } from "@/app/contexts/RestaurantContext";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Store, Activity, Ban, AlertCircle, ChevronRight, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExportButton } from "@/components/ExportButton";

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [paginationLoading, setPaginationLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states lifted up for server-side filtering
  const [searchValue, setSearchValue] = useState("");
  const [statusValue, setStatusValue] = useState("all");
  
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 0,
  });
  
  // KPI states
  const [metrics, setMetrics] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    suspended: 0,
  });

  const { getAllRestaurants } = useRestaurants();

  const fetchRestaurants = useCallback(async (
    page = 1, 
    limit = 5, 
    isPagination = false,
    search = searchValue,
    status = statusValue
  ) => {
    try {
      setError(null);
      if (isPagination) {
        setPaginationLoading(true);
      } else {
        setLoading(true);
      }
      
      const response = await getAllRestaurants({ 
        page, 
        limit,
        search: search || undefined,
        status: status !== "all" ? status : undefined
      });

      if (response?.success && Array.isArray(response?.data)) {
        setRestaurants(response.data);
        
        if (response.pagination) {
          setPagination({
            page: response.pagination.page,
            limit: response.pagination.limit,
            total: response.pagination.total,
            totalPages: response.pagination.totalPages,
          });
        }
        
        // Calculate basic metrics from current data or use API metrics if available
        // Ideally the API would return these globally, but we'll approximate for now
        const activeCount = response.data.filter(r => r.status === "active").length;
        const inactiveCount = response.data.filter(r => r.status === "inactive").length;
        const suspendedCount = response.data.filter(r => r.status === "suspended").length;
        
        setMetrics({
          total: response.pagination?.total || response.data.length,
          active: activeCount,
          inactive: inactiveCount,
          suspended: suspendedCount,
        });
      } else {
        setError(response?.message || "Failed to load restaurants.");
      }
    } catch (err: any) {
      console.error("Failed to fetch restaurants:", err);
      setError(err.message || "An unexpected error occurred while fetching data.");
    } finally {
      setLoading(false);
      setPaginationLoading(false);
    }
  }, [getAllRestaurants, searchValue, statusValue]);

  // Debounced fetch when search or status changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRestaurants(1, pagination.limit, false, searchValue, statusValue);
    }, 400); // 400ms debounce
    return () => clearTimeout(timer);
  }, [searchValue, statusValue, pagination.limit, fetchRestaurants]);

  const handlePaginationChange = (page: number, limit: number) => {
    fetchRestaurants(page, limit, true);
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        <Spinner variant="ring" className="w-10 h-10" />
      </div>
    );
  if (error) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center p-6 space-y-4">
        <div className="p-4 rounded-full bg-red-100 mb-4">
          <AlertCircle className="w-12 h-12 text-red-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">Failed to load restaurants</h2>
        <p className="text-gray-500 max-w-md text-center">{error}</p>
        <Button 
          onClick={() => fetchRestaurants(pagination.page, pagination.limit, false, searchValue, statusValue)}
          className="mt-4 flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700"
        >
          <RefreshCcw className="w-4 h-4" />
          Retry Connection
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Breadcrumbs & Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center text-sm text-gray-500 font-medium space-x-1">
          <span>Dashboard</span>
          <ChevronRight className="w-4 h-4" />
          <span>Users</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900">Restaurants</span>
        </div>
        <div className="flex justify-between items-end">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Restaurants Management</h1>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg border bg-emerald-50 transition-all duration-200 hover:shadow-md">
          <div className="flex items-center justify-between mb-2">
            <Store className="w-5 h-5 text-emerald-600" />
            <div className="flex items-center gap-1 text-xs text-emerald-600">
              <div className="w-3 h-3">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 14l5-5 5 5z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-600 font-medium">Total Restaurants</p>
            <p className="text-sm font-bold text-emerald-600">
              {metrics.total}
            </p>
          </div>
        </div>
        
        <div className="p-4 rounded-lg border bg-green-50 transition-all duration-200 hover:shadow-md">
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-5 h-5 text-green-600" />
            <div className="flex items-center gap-1 text-xs text-green-600">
              <div className="w-3 h-3">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 14l5-5 5 5z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-600 font-medium">Active</p>
            <p className="text-sm font-bold text-green-600">
              {metrics.active}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-lg border bg-amber-50 transition-all duration-200 hover:shadow-md">
          <div className="flex items-center justify-between mb-2">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            <div className="flex items-center gap-1 text-xs text-amber-500">
              <div className="w-3 h-3">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17 10l-5 5-5-5z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-600 font-medium">Inactive</p>
            <p className="text-sm font-bold text-amber-600">
              {metrics.inactive}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-lg border bg-red-50 transition-all duration-200 hover:shadow-md">
          <div className="flex items-center justify-between mb-2">
            <Ban className="w-5 h-5 text-red-500" />
            <div className="flex items-center gap-1 text-xs text-red-500">
              <div className="w-3 h-3">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17 10l-5 5-5-5z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-600 font-medium">Suspended</p>
            <p className="text-sm font-bold text-red-600">
              {metrics.suspended}
            </p>
          </div>
        </div>
      </div>

      <RestaurantManagement 
        restaurants={restaurants} 
        onRefresh={() => fetchRestaurants(pagination.page, pagination.limit, true, searchValue, statusValue)}
        pagination={pagination}
        onPaginationChange={handlePaginationChange}
        isLoading={paginationLoading}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        statusValue={statusValue}
        onStatusChange={setStatusValue}
      />
    </div>
  );
}
