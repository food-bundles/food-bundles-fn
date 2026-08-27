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
import { exportService, type ExportModuleType } from "@/app/services/exportService";
import UserDetailsSheet from "../../farmers/_components/UserDetailsSheet";
import { GenericExportModal, type GenericExportConfig, type ExportColumnDef } from "@/components/generic-export-modal";

export const RESTAURANT_COLUMNS: ExportColumnDef[] = [
  { id: "name", label: "Restaurant Name", description: "Business name" },
  { id: "email", label: "Email Address", description: "Primary email" },
  { id: "phone", label: "Phone Number", description: "Contact number" },
  { id: "tin", label: "TIN / Tax ID", description: "Tax Identification Number" },
  { id: "location", label: "Location / Address", description: "Street location" },
  { id: "province", label: "Province", description: "Regional province" },
  { id: "district", label: "District", description: "Administrative district" },
  { id: "verified", label: "Verification Status", description: "Verified or unverified" },
  { id: "createdAt", label: "Joined Date", description: "Registration timestamp" },
  { id: "totalOrders", label: "Total Orders", description: "Lifetime orders count" },
  { id: "totalSubscriptions", label: "Total Subscriptions", description: "Active & past subscriptions" },
];
import { Plus } from "lucide-react";

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
  searchValue: string;
  onSearchChange: (value: string) => void;
  statusValue: string;
  onStatusChange: (value: string) => void;
}

export function RestaurantManagement({
  restaurants,
  onRefresh,
  pagination,
  onPaginationChange,
  isLoading = false,
  searchValue,
  onSearchChange,
  statusValue,
  onStatusChange,
}: RestaurantManagementProps) {
  // Filter states
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [isExporting, setIsExporting] = useState(false);
  const [exportModule, setExportModule] = useState<"restaurants" | "users">("restaurants");

  // Modal states
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<Restaurant | null>(null);
  const [isManagementOpen, setIsManagementOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDetailsSheetOpen, setIsDetailsSheetOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportSelectedRows, setExportSelectedRows] = useState<Restaurant[]>([]);

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
    return getRestaurantColumns(
      handleManageRestaurant,
      (restaurantId: string) => {
        setSelectedUserId(restaurantId);
        setIsDetailsSheetOpen(true);
      }
    );
  }, []);

  const handleRowClick = (restaurant: Restaurant) => {
    setSelectedUserId(restaurant.id);
    setIsDetailsSheetOpen(true);
  };

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
      onSearchChange,
      "Search restaurants..."
    ),
    createCommonFilters.dateRange(dateRange, setDateRange, "Joined Date Range"),
  ];

  const handleOpenExportModal = (selectedRows: Restaurant[], module: "restaurants" | "users") => {
    setExportModule(module);
    setExportSelectedRows(selectedRows);
    setIsExportModalOpen(true);
  };

  const handleExportSubmit = async (config: GenericExportConfig) => {
    try {
      setIsExporting(true);
      toast.info(`Generating Restaurants ${config.format.toUpperCase()} export...`);
      
      const idsToExport =
        config.scope === "selected" && exportSelectedRows.length > 0
          ? exportSelectedRows.map((r) => r.id).join(",")
          : undefined;

      await exportService.downloadExport(config.module as ExportModuleType, config.format, {
        search: searchValue || undefined,
        status: statusValue !== "all" ? statusValue : undefined,
        startDate: config.startDate,
        endDate: config.endDate,
        columns: config.columns.join(","),
        ids: idsToExport,
      });
      toast.success(`Restaurants export downloaded successfully!`);
    } catch (error: any) {
      console.error("Export error:", error);
      toast.error(error?.response?.data?.message || "Failed to download restaurants export");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Tabs value={statusValue} onValueChange={onStatusChange} className="w-full sm:w-auto">
          <TabsList className="bg-gray-100/80 p-1 w-full sm:w-auto">
            <TabsTrigger value="all" className="flex-1 sm:flex-none">All</TabsTrigger>
            <TabsTrigger value="active" className="flex-1 sm:flex-none">Active</TabsTrigger>
            <TabsTrigger value="inactive" className="flex-1 sm:flex-none">Inactive</TabsTrigger>
            <TabsTrigger value="suspended" className="flex-1 sm:flex-none">Suspended</TabsTrigger>
          </TabsList>
        </Tabs>
      </div> */}

      <DataTable
        columns={columns}
        data={filteredData}
        title="Restaurants Management"
        description={
          <div className="flex items-center gap-4 mt-2">
            <button
              onClick={() => setIsCreateOpen(true)}
              className="bg-green-700 hover:bg-green-600 text-xs px-2 sm:px-3 py-2 text-white rounded cursor-pointer flex items-center gap-1 sm:gap-2 whitespace-nowrap"
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Add Restaurant</span>
            </button>
            
          </div>
        }
        showExport={true}
        onExport={(selectedRows) => handleOpenExportModal(selectedRows, "restaurants")}
        isExporting={isExporting}
        showAddButton={false}
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
        onRowClick={handleRowClick}
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
      
      <UserDetailsSheet
        isOpen={isDetailsSheetOpen}
        onClose={() => setIsDetailsSheetOpen(false)}
        userId={selectedUserId}
      />

      <GenericExportModal
        open={isExportModalOpen}
        onOpenChange={setIsExportModalOpen}
        selectedRowsCount={exportSelectedRows.length}
        exportModule={exportModule}
        moduleName="Restaurants"
        columns={RESTAURANT_COLUMNS}
        onExport={handleExportSubmit}
        isLoading={isExporting}
      />
    </div>
  );
}
