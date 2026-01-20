/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState, useEffect, useMemo } from "react";
import { DataTable } from "@/components/data-table";
import { TableFilters } from "@/components/filters";
import { createOrderColumns } from "./_components/order-columns";
import { createCommonFilters } from "./_components/filter-helpers";
import { traderService, type TraderOrder } from "@/app/services/traderService";
import { Skeleton } from "@/components/ui/skeleton";

export default function OrdersPage() {
  const [orders, setOrders] = useState<TraderOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchOrders = async (page = 1, limit = 10) => {
    try {
      const response = await traderService.getOrders({ page, limit });
      
      if (response.success && response.data) {
        setOrders(response.data);
        // Note: Add pagination from response if available
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (order: TraderOrder) => {
    console.log("View order details:", order);
    // Implement order details modal or navigation
  };

  const orderFilters = useMemo(() => {
    return [
      createCommonFilters.search(searchQuery, setSearchQuery, "Search orders..."),
      createCommonFilters.status(statusFilter, setStatusFilter, [
        { label: "All Status", value: "all" },
        { label: "Confirmed", value: "CONFIRMED" },
        { label: "Pending", value: "PENDING" },
        { label: "Delivered", value: "DELIVERED" },
        { label: "Cancelled", value: "CANCELLED" },
      ]),
    ];
  }, [searchQuery, statusFilter]);

  const orderColumns = useMemo(() => {
    return createOrderColumns({
      onViewDetails: handleViewDetails,
      currentPage: pagination.page,
      pageSize: pagination.limit,
    });
  }, [pagination.page, pagination.limit]);

  const filteredOrders = useMemo(() => {
    let filtered = orders;
    
    if (searchQuery) {
      filtered = filtered.filter(order => 
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.billingName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (statusFilter !== "all") {
      filtered = filtered.filter(order => order.status === statusFilter);
    }
    
    return filtered;
  }, [orders, searchQuery, statusFilter]);

  useEffect(() => {
    fetchOrders();
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
        <h1 className="text-xl font-bold text-gray-900">Order Management</h1>
        <p className="text-gray-600">Orders paid with vouchers you've approved</p>
      </div>

      <DataTable
        columns={orderColumns}
        data={filteredOrders}
        customFilters={<TableFilters filters={orderFilters} />}
        showSearch={false}
        showExport={true}
        showColumnVisibility={true}
        showPagination={true}
        showRowSelection={false}
        showAddButton={false}
      />
    </div>
  );
}