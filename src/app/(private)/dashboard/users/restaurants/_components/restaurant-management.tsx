/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo } from "react";
import { DataTable } from "@/components/data-table";
import { getRestaurantColumns } from "./restaurant-columns";
import { createCommonFilters, TableFilters } from "@/components/filters";
import { RestaurantManagementModal } from "./restaurant-management-modal";
import { CreateRestaurantModal } from "./create-restaurant-modal";
import type { Restaurant } from "@/app/contexts/RestaurantContext";
import { toast } from "sonner";
import { restaurantService } from "@/app/services/restaurantService";

interface RestaurantManagementProps {
  restaurants: Restaurant[];
  onRefresh: () => void;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  onPaginationChange?: (page: number, limit: number) => void;
  isLoading?: boolean;
}

const statusOptions = [
  { label: "All Statuses", value: "all" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Suspended", value: "suspended" },
];

export function RestaurantManagement({
  restaurants,
  onRefresh,
  pagination,
  onPaginationChange,
  isLoading = false,
}: RestaurantManagementProps) {
  // Filter states
  const [searchValue, setSearchValue] = useState("");
  const [statusValue, setStatusValue] = useState("all");
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});

  // Modal states
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<Restaurant | null>(null);
  const [isManagementOpen, setIsManagementOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Modal handlers
  const handleManageRestaurant = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setIsManagementOpen(true);
  };

  const handleEditRestaurant = async (restaurantId: string, data: any) => {
    try {
      await restaurantService.updateRestaurant(restaurantId, data);
      toast.success("Restaurant updated successfully");
      onRefresh();
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to update restaurant"
      );
    }
  };

  const handleDeleteRestaurant = async (restaurantId: string) => {
    try {
      await restaurantService.deleteRestaurant(restaurantId);
      toast.success("Restaurant deleted successfully");
      onRefresh();
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to delete restaurant"
      );
    }
  };

  const handleCreateRestaurant = async (data: any) => {
    try {
      await restaurantService.createRestaurantByAdmin(data);
      toast.success("Restaurant created successfully. Password sent via SMS.");
      onRefresh();
      setIsCreateOpen(false);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to create restaurant"
      );
    }
  };

  // Get columns with handlers
  const columns = useMemo(() => {
    return getRestaurantColumns(handleManageRestaurant);
  }, []);

  // Filter data (client-side filtering for date range only)
  const filteredData = useMemo(() => {
    return restaurants.filter((restaurant) => {
      // Date range filter (client-side)
      if (dateRange.from || dateRange.to) {
        const createdDate = new Date(restaurant.createdAt);

        if (dateRange.from) {
          const startOfDay = new Date(dateRange.from);
          startOfDay.setHours(0, 0, 0, 0);
          if (createdDate < startOfDay) return false;
        }

        if (dateRange.to) {
          const endOfDay = new Date(dateRange.to);
          endOfDay.setHours(23, 59, 59, 999);
          if (createdDate > endOfDay) return false;
        }
      }

      return true;
    });
  }, [restaurants, dateRange]);

  // Create filters
  const filters = [
    createCommonFilters.search(
      searchValue,
      setSearchValue,
      "Search restaurants..."
    ),
    createCommonFilters.status(statusValue, setStatusValue, statusOptions),
    createCommonFilters.dateRange(dateRange, setDateRange, "Joined Date Range"),
  ];

  const handleExport = () => {
    toast.info("Export functionality coming soon");
  };

  return (
    <>
      <DataTable
        columns={columns}
        data={filteredData}
        title="Restaurants Management"
        description={
          pagination ? `Total: ${pagination.total} restaurants` : undefined
        }
        showExport={true}
        onExport={handleExport}
        showAddButton={true}
        addButtonLabel="Add Restaurant"
        onAddButton={() => setIsCreateOpen(true)}
        customFilters={
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full">
            <div className="flex flex-wrap items-center gap-2 flex-1">
              <TableFilters filters={filters} />
            </div>
          </div>
        }
        showSearch={false}
        showColumnVisibility={true}
        showPagination={true}
        showRowSelection={true}
        pagination={pagination}
        onPaginationChange={onPaginationChange}
        isLoading={isLoading}
      />

      {/* Modals */}
      <RestaurantManagementModal
        restaurant={selectedRestaurant}
        open={isManagementOpen}
        onOpenChange={setIsManagementOpen}
        onUpdate={onRefresh}
        onEdit={handleEditRestaurant}
        onDelete={handleDeleteRestaurant}
      />

      <CreateRestaurantModal
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onCreate={handleCreateRestaurant}
      />
    </>
  );
}
