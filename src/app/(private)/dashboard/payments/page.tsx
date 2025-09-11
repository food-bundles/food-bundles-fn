/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo } from "react";
import { DataTable } from "@/components/data-table";
import { paymentColumns, type Payment } from "./_components/payment-columns";
import { createCommonFilters, TableFilters } from "@/components/filters";

// Mock payment data
const mockPayments: Payment[] = [
  {
    paymentId: "PAY001",
    recipientName: "John Farmer",
    recipientType: "Farmer",
    product: "Organic Tomatoes - 50kg",
    amount: 250.0,
    paymentMethod: "Mobile Money",
    status: "COMPLETED",
    paidDate: "2024-01-15",
    createdAt: "2024-01-10",
    submissionId: "SUB001",
    farmerId: "FARM001",
  },
  {
    paymentId: "PAY002",
    recipientName: "Green Valley Aggregator",
    recipientType: "Aggregator",
    product: "Mixed Vegetables Bundle",
    amount: 1200.0,
    paymentMethod: "Bank Transfer",
    status: "PENDING",
    paidDate: null,
    createdAt: "2024-01-12",
    submissionId: "SUB002",
    aggregatorId: "AGG001",
  },
  {
    paymentId: "PAY003",
    recipientName: "Mary Producer",
    recipientType: "Farmer",
    product: "Fresh Lettuce - 30kg",
    amount: 180.0,
    paymentMethod: "Cash",
    status: "FAILED",
    paidDate: null,
    createdAt: "2024-01-08",
    submissionId: "SUB003",
    farmerId: "FARM002",
  },
  {
    paymentId: "PAY004",
    recipientName: "Farm Fresh Collective",
    recipientType: "Aggregator",
    product: "Seasonal Fruit Mix",
    amount: 850.0,
    paymentMethod: "Mobile Money",
    status: "COMPLETED",
    paidDate: "2024-01-14",
    createdAt: "2024-01-09",
    submissionId: "SUB004",
    aggregatorId: "AGG002",
  },
  {
    paymentId: "PAY005",
    recipientName: "David Grower",
    recipientType: "Farmer",
    product: "Organic Carrots - 40kg",
    amount: 320.0,
    paymentMethod: "Bank Transfer",
    status: "PENDING",
    paidDate: null,
    createdAt: "2024-01-13",
    submissionId: "SUB005",
    farmerId: "FARM003",
  },
];

export default function PaymentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});

  // Create filters for the table
  const filters = useMemo(() => {
    return [
      createCommonFilters.search(
        searchTerm,
        setSearchTerm,
        "Search payments..."
      ),
      createCommonFilters.status(statusFilter, setStatusFilter, [
        { label: "All Statuses", value: "all" },
        { label: "Completed", value: "COMPLETED" },
        { label: "Pending", value: "PENDING" },
        { label: "Failed", value: "FAILED" },
      ]),
      createCommonFilters.date(
        dateRange.from,
        (date:any) => setDateRange((prev) => ({ ...prev, from: date })),
        "Date Range"
      ),
    ];
  }, [searchTerm, statusFilter, dateRange]);

  // Filter the data based on current filters
  const filteredData = useMemo(() => {
    return mockPayments.filter((payment) => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          payment.paymentId.toLowerCase().includes(searchLower) ||
          payment.recipientName.toLowerCase().includes(searchLower) ||
          payment.product.toLowerCase().includes(searchLower) ||
          payment.paymentMethod.toLowerCase().includes(searchLower);

        if (!matchesSearch) return false;
      }

      // Status filter
      if (statusFilter && statusFilter !== "all") {
        if (payment.status !== statusFilter) return false;
      }

      // Date range filter
      if (dateRange.from || dateRange.to) {
        const paymentDate = new Date(payment.createdAt);
        if (dateRange.from && paymentDate < dateRange.from) return false;
        if (dateRange.to && paymentDate > dateRange.to) return false;
      }

      return true;
    });
  }, [mockPayments, searchTerm, statusFilter, dateRange]);

  const handleExport = () => {
    console.log("Exporting payments data...");
    // Export functionality would be implemented here
  };

  return (
    <div className="p-6">
      <DataTable
        columns={paymentColumns}
        data={filteredData}
        title="Payment Management"
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
