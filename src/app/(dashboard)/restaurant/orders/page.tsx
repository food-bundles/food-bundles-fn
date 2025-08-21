"use client";

import { useState, useMemo } from "react";
import { DataTable } from "@/components/data-table";
import { Order, ordersColumns } from "./_components/orders-columns";
import {
  createCommonFilters,
  TableFilters,
} from "../../../../components/filters";

// Sample restaurant orders data
const sampleOrders: Order[] = [
  {
    id: "1",
    orderId: "ORD-001",
    customerName: "John Smith",
    orderedDate: "2024-01-15",
    items: "2x Margherita Pizza, 1x Caesar Salad",
    totalAmount: 28.5,
    deliveryAddress: "123 Main St, Downtown",
    status: "pending",
  },
  {
    id: "2",
    orderId: "ORD-002",
    customerName: "Sarah Johnson",
    orderedDate: "2024-01-14",
    items: "1x Chicken Burger, 1x Fries, 1x Coke",
    totalAmount: 15.75,
    deliveryAddress: "456 Oak Ave, Midtown",
    status: "confirmed",
  },
  {
    id: "3",
    orderId: "ORD-003",
    customerName: "Mike Chen",
    orderedDate: "2024-01-14",
    items: "3x Sushi Rolls, 1x Miso Soup",
    totalAmount: 42.0,
    deliveryAddress: "789 Pine St, Uptown",
    status: "processing",
  },
  {
    id: "4",
    orderId: "ORD-004",
    customerName: "Lisa Rodriguez",
    orderedDate: "2024-01-13",
    items: "1x Pasta Carbonara, 1x Garlic Bread",
    totalAmount: 18.25,
    deliveryAddress: "321 Elm St, Westside",
    status: "ready",
  },
  {
    id: "5",
    orderId: "ORD-005",
    customerName: "David Wilson",
    orderedDate: "2024-01-13",
    items: "2x Fish Tacos, 1x Guacamole",
    totalAmount: 22.5,
    deliveryAddress: "654 Maple Dr, Eastside",
    status: "delivered",
  },
  {
    id: "6",
    orderId: "ORD-006",
    customerName: "Emma Davis",
    orderedDate: "2024-01-12",
    items: "1x Veggie Wrap, 1x Smoothie",
    totalAmount: 12.75,
    deliveryAddress: "987 Cedar Ln, Southside",
    status: "cancelled",
  },
  {
    id: "7",
    orderId: "ORD-007",
    customerName: "Robert Brown",
    orderedDate: "2024-01-12",
    items: "1x Steak Dinner, 1x Wine",
    totalAmount: 65.0,
    deliveryAddress: "147 Birch St, Northside",
    status: "refunded",
  },
  {
    id: "8",
    orderId: "ORD-008",
    customerName: "Anna Taylor",
    orderedDate: "2024-01-11",
    items: "2x Chicken Wings, 1x Beer",
    totalAmount: 19.5,
    deliveryAddress: "258 Spruce Ave, Central",
    status: "delivered",
  },
  {
    id: "9",
    orderId: "ORD-009",
    customerName: "Chris Martinez",
    orderedDate: "2024-01-11",
    items: "1x BBQ Ribs, 1x Coleslaw, 1x Cornbread",
    totalAmount: 32.75,
    deliveryAddress: "369 Willow St, Harbor",
    status: "processing",
  },
  {
    id: "10",
    orderId: "ORD-010",
    customerName: "Jessica Lee",
    orderedDate: "2024-01-10",
    items: "1x Poke Bowl, 1x Green Tea",
    totalAmount: 16.25,
    deliveryAddress: "741 Ash Rd, Riverside",
    status: "confirmed",
  },
];

const statusOptions = [
  { label: "All Status", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Processing", value: "processing" },
  { label: "Ready", value: "ready" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Refunded", value: "refunded" },
];

export default function RestaurantOrdersPage() {
  const [searchValue, setSearchValue] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  const filteredData = useMemo(() => {
    return sampleOrders.filter((order) => {
      if (
        searchValue &&
        !order.orderId.toLowerCase().includes(searchValue.toLowerCase()) &&
        !order.customerName.toLowerCase().includes(searchValue.toLowerCase()) &&
        !order.items.toLowerCase().includes(searchValue.toLowerCase())
      ) {
        return false;
      }

      if (selectedStatus !== "all" && order.status !== selectedStatus) {
        return false;
      }

      if (
        selectedDate &&
        order.orderedDate !== selectedDate.toISOString().split("T")[0]
      ) {
        return false;
      }

      return true;
    });
  }, [searchValue, selectedStatus, selectedDate]);

  const filters = [
    createCommonFilters.search(
      searchValue,
      setSearchValue,
      "Search orders, customers, or items..."
    ),
    createCommonFilters.status(
      selectedStatus,
      setSelectedStatus,
      statusOptions
    ),
    createCommonFilters.date(selectedDate, setSelectedDate, "Order Date"),
  ];

  const handleExport = async () => {
    try {
      console.log("Exporting restaurant orders data...", {
        filters: {
          search: searchValue,
          status: selectedStatus,
          date: selectedDate,
        },
        totalRecords: filteredData.length,
      });
      alert("Export functionality will be handled by backend");
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <DataTable
            columns={ordersColumns}
            data={filteredData}
            title="Orders Management"
            descrption="Manage and track all your restaurant orders"
            showExport={true}
            onExport={handleExport}
            customFilters={<TableFilters filters={filters} />}
            showSearch={false}
            showColumnVisibility={true}
            showPagination={true}
            showRowSelection={true}
          />
        </div>
      </main>
    </div>
  );
}
