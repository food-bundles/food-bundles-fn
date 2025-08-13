"use client";

import { useState } from "react";
import { ordersColumns, type Order } from "./orders-columns";
import { StatusFilter } from "@/components/status-filter";
import { DataTable } from "@/components/data-table";

type Props = {
  orders: Order[];
};

const statusFilters = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "processing", label: "Processing" },
  { value: "ready", label: "Ready" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
  { value: "refunded", label: "Refunded" },
];

export function OrdersContent({ orders }: Props) {
  const [selectedStatus, setSelectedStatus] = useState("all");

  const filteredOrders =
    selectedStatus === "all"
      ? orders
      : orders.filter((order) => order.status === selectedStatus);

  return (
    <div className="space-y-6">
      <StatusFilter
        filters={statusFilters}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
      />

      <DataTable
        columns={ordersColumns}
        data={filteredOrders}
        searchKey="orderNumber"
        searchPlaceholder="Filter by order number..."
      />
    </div>
  );
}
