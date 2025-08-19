/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useMemo } from "react";
import { DataTable } from "@/components/data-table";
import { Admin, adminColumns } from "./_components/admintration-columns";
import { createCommonFilters, TableFilters } from "@/components/filters";

// Mock data for admin users
const mockAdmins: Admin[] = [
  {
    id: "a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6",
    username: "admin_john",
    email: "john.admin@foodbundle.co.ke",
    role: "ADMIN",
    phone: "+254712345678",
    createdAt: "2024-01-01T08:00:00Z",
    assignmentsCount: 25,
    productsCount: 150,
    status: "active",
    permissions: [
      "USER_MANAGEMENT",
      "PRODUCT_MANAGEMENT",
      "SYSTEM_CONFIG",
      "REPORTS",
    ],
  },
  {
    id: "b2c3d4e5-f6g7-8h9i-0j1k-l2m3n4o5p6q7",
    username: "admin_sarah",
    email: "sarah.admin@foodbundle.co.ke",
    role: "AGGREGATOR",
    phone: "+254723456789",
    createdAt: "2024-01-05T10:30:00Z",
    assignmentsCount: 18,
    productsCount: 89,
    status: "active",
    permissions: ["PRODUCT_MANAGEMENT", "ORDER_MANAGEMENT", "REPORTS"],
  },
  {
    id: "c3d4e5f6-g7h8-9i0j-1k2l-m3n4o5p6q7r8",
    username: "admin_mike",
    email: "mike.admin@foodbundle.co.ke",
    role: "AGGREGATOR",
    createdAt: "2024-01-10T14:15:00Z",
    assignmentsCount: 12,
    productsCount: 45,
    status: "active",
    permissions: ["CONTENT_MODERATION", "USER_SUPPORT"],
  },
  {
    id: "d4e5f6g7-h8i9-0j1k-2l3m-n4o5p6q7r8s9",
    username: "admin_lisa",
    email: "lisa.admin@foodbundle.co.ke",
    role: "LOGISTIC_OFFICER",
    phone: "+254745678901",
    createdAt: "2024-01-15T09:20:00Z",
    assignmentsCount: 8,
    productsCount: 32,
    status: "suspended",
    permissions: ["ORDER_MANAGEMENT", "INVENTORY_MANAGEMENT"],
  },
  {
    id: "e5f6g7h8-i9j0-1k2l-3m4n-o5p6q7r8s9t0",
    username: "admin_david",
    email: "david.admin@foodbundle.co.ke",
    role: "AGGREGATOR",
    phone: "+254756789012",
    createdAt: "2024-02-01T11:45:00Z",
    assignmentsCount: 5,
    productsCount: 18,
    status: "inactive",
    permissions: ["CONTENT_MODERATION"],
  },
];

export default function AdministrationPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState<Date | undefined>(undefined);

  const filteredData = useMemo(() => {
    return mockAdmins.filter((admin) => {
      const matchesSearch =
        admin.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.phone?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || admin.status === statusFilter;

      const matchesDate = !dateRange || new Date(admin.createdAt) >= dateRange;

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [searchTerm, statusFilter, dateRange, mockAdmins]);

  const filters = useMemo(() => {
    return [
      createCommonFilters.search(
        searchTerm,
        setSearchTerm,
        "Search administrators..."
      ),
      createCommonFilters.status(statusFilter, setStatusFilter, [
        { label: "All Statuses", value: "all" },
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
        { label: "Suspended", value: "suspended" },
      ]),
      createCommonFilters.date(dateRange, setDateRange, "Created Date"),
    ];
  }, [searchTerm, statusFilter, dateRange]);

  const handleExport = () => {
    console.log("Exporting administrators data...");
  };

  return (
    <div className="p-6">
      <DataTable
        columns={adminColumns}
        data={filteredData}
        title="Administration Management"
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
