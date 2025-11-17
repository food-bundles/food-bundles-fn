/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo, useEffect } from "react";
import { DataTable } from "@/components/data-table";
import {
  getRestaurantColumns,
  type Restaurant,
} from "./_components/restaurant-columns";
import { createCommonFilters, TableFilters } from "@/components/filters";
import { RestaurantManagementModal } from "./_components/restaurant-management-modal";
import { CreateRestaurantModal } from "./_components/create-restaurant-modal";
import { restaurantService } from "@/app/services/restaurantService";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/shadcn-io/spinner";



export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState<Date | undefined>(undefined);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [isManagementOpen, setIsManagementOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Fetch restaurants from API
  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const response = await restaurantService.getAllRestaurants();
      console.log("Restaurant API Response:", response);
      if (response.success) {
        const restaurantsData = response.data.restaurants || response.data;
        console.log("Restaurants Data:", restaurantsData);
        const mappedRestaurants = restaurantsData.map((restaurant: any) => {
          const location = restaurant.location || "Not specified";
          
          const ordersCount = restaurant.orders?.length || 0;
          const totalSpent = restaurant.orders?.reduce((sum: number, order: any) => {
            return order.status === "DELIVERED" ? sum + order.totalAmount : sum;
          }, 0) || 0;

          return {
            id: restaurant.id,
            name: restaurant.name,
            email: restaurant.email,
            phone: restaurant.phone,
            location: location,
            role: restaurant.role || "RESTAURANT",
            createdAt: restaurant.createdAt,
            ordersCount: ordersCount,
            totalSpent: totalSpent,
            status: "active", // Default to active since API doesn't have verified field
          };
        });
        console.log("Mapped Restaurants:", mappedRestaurants);
        setRestaurants(mappedRestaurants);
      }
    } catch (error) {
      console.error("Failed to fetch restaurants:", error);
      toast.error("Failed to fetch restaurants");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  // Modal handlers
  const handleManageRestaurant = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setIsManagementOpen(true);
  };

  const handleEditRestaurant = async (restaurantId: string, data: any) => {
    try {
      await restaurantService.updateRestaurant(restaurantId, data);
      toast.success("Restaurant updated successfully");
      fetchRestaurants();
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to update restaurant");
    }
  };

  const handleDeleteRestaurant = async (restaurantId: string) => {
    try {
      await restaurantService.deleteRestaurant(restaurantId);
      toast.success("Restaurant deleted successfully");
      fetchRestaurants();
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to delete restaurant");
    }
  };

  const handleCreateRestaurant = async (data: any) => {
    try {
      await restaurantService.createRestaurantByAdmin(data);
      toast.success("Restaurant created successfully. Password sent via SMS.");
      fetchRestaurants();
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to create restaurant");
    }
  };

  const filteredData = useMemo(() => {
    return restaurants.filter((restaurant) => {
      const matchesSearch =
        restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        restaurant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        restaurant.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        restaurant.phone?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || restaurant.status === statusFilter;

      const matchesDate =
        !dateRange || new Date(restaurant.createdAt) >= dateRange;

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [searchTerm, statusFilter, dateRange, restaurants]);

  const columns = useMemo(() => {
    return getRestaurantColumns(handleManageRestaurant);
  }, []);

  const filters = useMemo(() => {
    return [
      createCommonFilters.search(
        searchTerm,
        setSearchTerm,
        "Search restaurants..."
      ),
      createCommonFilters.status(statusFilter, setStatusFilter, [
        { label: "All Statuses", value: "all" },
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
        { label: "Suspended", value: "suspended" },
      ]),
      createCommonFilters.date(dateRange, setDateRange, "Joined Date"),
    ];
  }, [searchTerm, statusFilter, dateRange]);

  const handleExport = () => {
    toast.info("Export functionality coming soon");
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Spinner variant="ring" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <DataTable
        columns={columns}
        data={filteredData}
        title="Restaurants Management"
        showExport={true}
        onExport={handleExport}
        showAddButton={true}
        addButtonLabel="Add Restaurant"
        onAddButton={() => setIsCreateOpen(true)}
        customFilters={<TableFilters filters={filters} />}
        showSearch={false}
        showColumnVisibility={true}
        showPagination={true}
        showRowSelection={true}
      />

      <RestaurantManagementModal
        restaurant={selectedRestaurant}
        open={isManagementOpen}
        onOpenChange={setIsManagementOpen}
        onUpdate={fetchRestaurants}
        onEdit={handleEditRestaurant}
        onDelete={handleDeleteRestaurant}
      />

      <CreateRestaurantModal
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onCreate={handleCreateRestaurant}
      />
    </div>
  );
}
