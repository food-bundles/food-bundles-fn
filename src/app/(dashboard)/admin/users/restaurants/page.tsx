/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useMemo } from "react";
import { DataTable } from "@/components/data-table";
import {
  restaurantColumns,
  type Restaurant,
} from "./_components/restaurant-columns";
import { createCommonFilters, TableFilters } from "@/components/filters";

// Mock data for restaurants
const mockRestaurants: Restaurant[] = [
  {
    id: "r1a2b3c4-d5e6-7f8g-9h0i-j1k2l3m4n5o6",
    name: "Mama Oliech Restaurant",
    email: "info@mamaoliech.co.ke",
    phone: "+254712345678",
    location: "Nairobi CBD",
    role: "RESTAURANT",
    createdAt: "2024-01-10T08:30:00Z",
    ordersCount: 45,
    totalSpent: 125000,
    status: "active",
  },
  {
    id: "r2g3h4i5-j6k7-8l9m-0n1o-p2q3r4s5t6u7",
    name: "Java House",
    email: "orders@javahouse.co.ke",
    phone: "+254723456789",
    location: "Westlands",
    role: "RESTAURANT",
    createdAt: "2024-01-15T10:15:00Z",
    ordersCount: 78,
    totalSpent: 245000,
    status: "active",
  },
  {
    id: "r3h4i5j6-k7l8-9m0n-1o2p-q3r4s5t6u7v8",
    name: "Artcaffe",
    email: "supply@artcaffe.co.ke",
    phone: "+254734567890",
    location: "Karen",
    role: "RESTAURANT",
    createdAt: "2024-01-20T14:20:00Z",
    ordersCount: 32,
    totalSpent: 89000,
    status: "active",
  },
  {
    id: "r4i5j6k7-l8m9-0n1o-2p3q-r4s5t6u7v8w9",
    name: "Carnivore Restaurant",
    email: "procurement@carnivore.co.ke",
    location: "Langata",
    role: "RESTAURANT",
    createdAt: "2024-02-01T09:45:00Z",
    ordersCount: 12,
    totalSpent: 67000,
    status: "suspended",
  },
  {
    id: "r5j6k7l8-m9n0-1o2p-3q4r-s5t6u7v8w9x0",
    name: "Talisman Restaurant",
    email: "orders@talisman.co.ke",
    phone: "+254756789012",
    location: "Karen",
    role: "RESTAURANT",
    createdAt: "2024-02-10T16:30:00Z",
    ordersCount: 8,
    totalSpent: 34000,
    status: "inactive",
  },
];

export default function RestaurantsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState<Date | undefined>(undefined);

  const filteredData = useMemo(() => {
    return mockRestaurants.filter((restaurant) => {
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
  }, [searchTerm, statusFilter, dateRange, mockRestaurants]);

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
    console.log("Exporting restaurants data...");
  };

  return (
    <div className="p-6">
      <DataTable
        columns={restaurantColumns}
        data={filteredData}
        title="Restaurants Management"
        showExport={true}
        onExport={handleExport}
        showAddButton={false}
        customFilters={<TableFilters filters={filters} />}
        showSearch={false}
        showColumnVisibility={true}
        showPagination={true}
        showRowSelection={true}
      />
    </div>
  );
}
