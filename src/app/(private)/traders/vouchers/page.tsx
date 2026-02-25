/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState, useEffect, useMemo } from "react";
import { DataTable } from "@/components/data-table";
import { TableFilters } from "@/components/filters";
import { createVoucherColumns } from "./_components/voucher-columns";
import { traderService, type Voucher } from "@/app/services/traderService";
import { Skeleton } from "@/components/ui/skeleton";
import { createCommonFilters } from "./_components/filter-helpers";
import { VoucherDetailsDialog } from "./_components/voucher-details-dialog";

type VoucherTab = "active"  | "expired";

export default function VouchersPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<VoucherTab>("active");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const getStatusForTab = (tab: VoucherTab) => {
    switch (tab) {
      case "active":
        return "ACTIVE,USED,SETTLED,MATURED";
      case "expired":
        return "EXPIRED";
      default:
        return "";
    }
  };

  const fetchVouchers = async (page = 1, limit = 10, tab: VoucherTab = activeTab) => {
    try {
      setLoading(true);
      const status = getStatusForTab(tab);
      const response = await traderService.getVouchers({ page, limit, status });
      const vouchersData = Array.isArray(response.data) ? response.data : response.data?.vouchers || [];
      setVouchers(vouchersData);
      if ((response as any).pagination) {
        setPagination((response as any).pagination);
      }
    } catch (error) {
      console.error("Failed to fetch vouchers:", error);
      setVouchers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (voucher: Voucher) => {
    setSelectedVoucher(voucher);
    setDetailsOpen(true);
  };

  const handleTabChange = (tab: VoucherTab) => {
    setActiveTab(tab);
    setPagination({ page: 1, limit: 10, total: 0, totalPages: 0 });
    fetchVouchers(1, 10, tab);
  };

  const voucherFilters = useMemo(() => {
    return [
      createCommonFilters.search(searchQuery, setSearchQuery, "Search vouchers..."),
    ];
  }, [searchQuery]);

  const voucherColumns = useMemo(() => {
    return createVoucherColumns({
      onViewDetails: handleViewDetails,
      currentPage: pagination.page,
      pageSize: pagination.limit,
    });
  }, [pagination.page, pagination.limit]);

  const filteredVouchers = useMemo(() => {
    if (!Array.isArray(vouchers)) {
      return [];
    }
    
    let filtered = vouchers;
    
    if (searchQuery) {
      filtered = filtered.filter(voucher => 
        voucher?.voucherCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        voucher?.restaurant?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  }, [vouchers, searchQuery]);

  useEffect(() => {
    fetchVouchers();
  }, []);

  if (loading && vouchers.length === 0) {
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
    <div className="p-2">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900">Voucher Management</h1>
        <p className="text-gray-600 text-sm">Manage vouchers you've approved for restaurants</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-400 mb-4">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => handleTabChange("active")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "active"
                ? "border-green-500 text-green-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Approved Vouchers
          </button>
          <button
            onClick={() => handleTabChange("expired")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "expired"
                ? "border-green-500 text-green-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Expired Vouchers
          </button>
        </nav>
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
        isLoading={loading}
      />
      <VoucherDetailsDialog
        voucher={selectedVoucher}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />
    </div>
  );
}