"use client";

import { useState, useEffect, useMemo } from "react";
import { DataTable } from "@/components/data-table";
import { TableFilters } from "@/components/filters";
import { createVoucherColumns } from "./_components/voucher-columns";
import { traderService, type Voucher } from "@/app/services/traderService";
import { Skeleton } from "@/components/ui/skeleton";
import { createCommonFilters } from "./_components/filter-helpers";

export default function VouchersPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchVouchers = async (page = 1, limit = 10) => {
    try {
      const response = await traderService.getVouchers({ page, limit });
      setVouchers(response.data.vouchers);
      // Note: Add pagination from response if available
    } catch (error) {
      console.error("Failed to fetch vouchers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (voucher: Voucher) => {
    console.log("View voucher details:", voucher);
    // Implement voucher details modal or navigation
  };

  const voucherFilters = useMemo(() => {
    return [
      createCommonFilters.search(searchQuery, setSearchQuery, "Search vouchers..."),
      createCommonFilters.status(statusFilter, setStatusFilter, [
        { label: "All Status", value: "all" },
        { label: "Active", value: "ACTIVE" },
        { label: "Used", value: "USED" },
        { label: "Expired", value: "EXPIRED" },
        { label: "Matured", value: "MATURED" },
      ]),
    ];
  }, [searchQuery, statusFilter]);

  const voucherColumns = useMemo(() => {
    return createVoucherColumns({
      onViewDetails: handleViewDetails,
      currentPage: pagination.page,
      pageSize: pagination.limit,
    });
  }, [pagination.page, pagination.limit]);

  const filteredVouchers = useMemo(() => {
    let filtered = vouchers;
    
    if (searchQuery) {
      filtered = filtered.filter(voucher => 
        voucher.voucherCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        voucher.restaurant.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (statusFilter !== "all") {
      filtered = filtered.filter(voucher => voucher.status === statusFilter);
    }
    
    return filtered;
  }, [vouchers, searchQuery, statusFilter]);

  useEffect(() => {
    fetchVouchers();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Voucher Management</h1>
        <p className="text-gray-600">Manage vouchers you've approved for restaurants</p>
      </div>

      <DataTable
        columns={voucherColumns}
        data={filteredVouchers}
        customFilters={<TableFilters filters={voucherFilters} />}
        showSearch={false}
        showExport={true}
        showColumnVisibility={true}
        showPagination={true}
        showRowSelection={false}
        showAddButton={false}
        onRefresh={() => fetchVouchers(pagination.page, pagination.limit)}
      />
    </div>
  );
}