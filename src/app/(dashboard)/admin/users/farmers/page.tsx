/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useMemo } from "react";
import { DataTable } from "@/components/data-table";
import { farmerColumns, type Farmer } from "./_components/farmer-columns";
import { createCommonFilters, TableFilters } from "@/components/filters";

// Mock data for farmers
const mockFarmers: Farmer[] = [
  {
    id: "f1a2b3c4-d5e6-7f8g-9h0i-j1k2l3m4n5o6",
    location: "Nakuru County",
    role: "FARMER",
    phone: "+254712345678",
    email: "john.farmer@example.com",
    createdAt: "2024-01-15T08:30:00Z",
    submissionsCount: 12,
    status: "active",
  },
  {
    id: "g2h3i4j5-k6l7-8m9n-0o1p-q2r3s4t5u6v7",
    location: "Kiambu County",
    role: "FARMER",
    phone: "+254723456789",
    email: "mary.grower@example.com",
    createdAt: "2024-01-20T10:15:00Z",
    submissionsCount: 8,
    status: "active",
  },
  {
    id: "h3i4j5k6-l7m8-9n0o-1p2q-r3s4t5u6v7w8",
    location: "Meru County",
    role: "FARMER",
    phone: "+254734567890",
    createdAt: "2024-02-01T14:20:00Z",
    submissionsCount: 5,
    status: "pending",
  },
  {
    id: "i4j5k6l7-m8n9-0o1p-2q3r-s4t5u6v7w8x9",
    location: "Nyeri County",
    role: "FARMER",
    phone: "+254745678901",
    email: "peter.harvest@example.com",
    createdAt: "2024-02-10T09:45:00Z",
    submissionsCount: 15,
    status: "active",
  },
  {
    id: "j5k6l7m8-n9o0-1p2q-3r4s-t5u6v7w8x9y0",
    location: "Machakos County",
    role: "FARMER",
    phone: "+254756789012",
    createdAt: "2024-02-15T16:30:00Z",
    submissionsCount: 0,
    status: "inactive",
  },
];

export default function FarmersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState<Date | undefined>(undefined);

  const filteredData = useMemo(() => {
    return mockFarmers.filter((farmer) => {
      const matchesSearch =
        farmer.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        farmer.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        farmer.email?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || farmer.status === statusFilter;

      const matchesDate = !dateRange || new Date(farmer.createdAt) >= dateRange;

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [searchTerm, statusFilter, dateRange, mockFarmers]);

  const filters = useMemo(() => {
    return [
      createCommonFilters.search(
        searchTerm,
        setSearchTerm,
        "Search farmers..."
      ),
      createCommonFilters.status(statusFilter, setStatusFilter, [
        { label: "All Statuses", value: "all" },
        { label: "Active", value: "active" },
        { label: "Pending", value: "pending" },
        { label: "Inactive", value: "inactive" },
      ]),
      createCommonFilters.date(dateRange, setDateRange, "Joined Date"),
    ];
  }, [searchTerm, statusFilter, dateRange]);

  const handleExport = () => {
    console.log("Exporting farmers data...");
  };

  return (
    <div className="p-6">
      <DataTable
        columns={farmerColumns}
        data={filteredData}
        title="Farmers Management"
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
