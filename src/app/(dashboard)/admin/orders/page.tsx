"use client";

import { useState, useMemo } from "react";
import { Filters } from "./_components/filters";
import { Order, ordersColumns } from "./_components/order-colmuns";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

// Sample data
const sampleOrders: Order[] = [
  {
    id: "1",
    orderId: "ORD-001",
    restaurantName: "The Green Kitchen",
    orderedDate: "2024-01-15",
    qty: "25 items",
    payables: 450.0,
    logisticUser: "John Delivery",
    status: "pending",
  },
  {
    id: "2",
    orderId: "ORD-002",
    restaurantName: "Pasta Palace",
    orderedDate: "2024-01-14",
    qty: "18 items",
    payables: 320.5,
    logisticUser: "Sarah Transport",
    status: "confirmed",
  },
  {
    id: "3",
    orderId: "ORD-003",
    restaurantName: "Burger Barn",
    orderedDate: "2024-01-14",
    qty: "42 items",
    payables: 680.75,
    logisticUser: "Mike Logistics",
    status: "processing",
  },
  {
    id: "4",
    orderId: "ORD-004",
    restaurantName: "Sushi Spot",
    orderedDate: "2024-01-13",
    qty: "15 items",
    payables: 275.0,
    logisticUser: "Lisa Courier",
    status: "ready",
  },
  {
    id: "5",
    orderId: "ORD-005",
    restaurantName: "Pizza Corner",
    orderedDate: "2024-01-13",
    qty: "30 items",
    payables: 520.25,
    logisticUser: "Tom Express",
    status: "delivered",
  },
  {
    id: "6",
    orderId: "ORD-006",
    restaurantName: "Taco Time",
    orderedDate: "2024-01-12",
    qty: "22 items",
    payables: 385.5,
    logisticUser: "Anna Delivery",
    status: "cancelled",
  },
  {
    id: "7",
    orderId: "ORD-007",
    restaurantName: "Salad Station",
    orderedDate: "2024-01-12",
    qty: "12 items",
    payables: 180.0,
    logisticUser: "Chris Transport",
    status: "refunded",
  },
  {
    id: "8",
    orderId: "ORD-008",
    restaurantName: "Steakhouse Supreme",
    orderedDate: "2024-01-11",
    qty: "8 items",
    payables: 720.0,
    logisticUser: "David Logistics",
    status: "delivered",
  },
  {
    id: "9",
    orderId: "ORD-009",
    restaurantName: "Cafe Central",
    orderedDate: "2024-01-11",
    qty: "35 items",
    payables: 295.75,
    logisticUser: "Emma Courier",
    status: "processing",
  },
  {
    id: "10",
    orderId: "ORD-010",
    restaurantName: "Noodle House",
    orderedDate: "2024-01-10",
    qty: "28 items",
    payables: 410.5,
    logisticUser: "Ryan Express",
    status: "confirmed",
  },
];

export default function OrdersPage() {
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);

  const filteredData = useMemo(() => {
    return sampleOrders.filter((order) => {
      const matchesSearch =
        order.orderId.toLowerCase().includes(searchValue.toLowerCase()) ||
        order.restaurantName
          .toLowerCase()
          .includes(searchValue.toLowerCase()) ||
        order.logisticUser.toLowerCase().includes(searchValue.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || order.status === statusFilter;

      const matchesDate =
        !dateFilter ||
        order.orderedDate === dateFilter.toISOString().split("T")[0];

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [searchValue, statusFilter, dateFilter]);

  return (
    <div className="space-y-6 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Restaurant Orders</h1>
        <Button className="bg-green-600 hover:bg-green-700 text-white">
          <Download className="mr-2 h-4 w-4" />
          Export Data
        </Button>
      </div>

      <Filters
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        dateFilter={dateFilter}
        onDateChange={setDateFilter}
      />

      <DataTable
        columns={ordersColumns}
        data={filteredData}
        showSearch={false}
        showColumnVisibility={false}
      />
    </div>
  );
}
