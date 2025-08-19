/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useMemo } from "react";
import { DataTable } from "@/components/data-table";
import { salesColumns, type Sale } from "./_components/sales-columns";
import { createCommonFilters, TableFilters } from "@/components/filters";

// Mock sales data
const mockSalesData: Sale[] = [
  {
    saleId: "SALE001",
    restaurantId: "REST001",
    restaurantName: "The Garden Bistro",
    orderId: "ORD2024001",
    products: [
      { name: "Organic Tomatoes", quantity: 10, unitPrice: 3.5 },
      { name: "Fresh Basil", quantity: 5, unitPrice: 2.0 },
      { name: "Mozzarella Cheese", quantity: 3, unitPrice: 8.0 },
    ],
    totalAmount: 59.0,
    paymentMethod: "POS",
    paymentStatus: "COMPLETED",
    createdAt: "2024-01-15T10:30:00Z",
    restaurantDetails: {
      phone: "+1-555-0123",
      email: "orders@gardenbistro.com",
      location: "123 Main St, Downtown",
    },
    paymentReference: "TXN123456789",
    deliveryStatus: "DELIVERED",
  },
  {
    saleId: "SALE002",
    restaurantId: "REST002",
    restaurantName: "Coastal Kitchen",
    orderId: "ORD2024002",
    products: [
      { name: "Fresh Salmon", quantity: 8, unitPrice: 15.0 },
      { name: "Lemon", quantity: 12, unitPrice: 0.75 },
      { name: "Asparagus", quantity: 6, unitPrice: 4.5 },
      { name: "Olive Oil", quantity: 2, unitPrice: 12.0 },
      { name: "Sea Salt", quantity: 1, unitPrice: 5.0 },
    ],
    totalAmount: 176.0,
    paymentMethod: "Bank",
    paymentStatus: "PENDING",
    createdAt: "2024-01-14T14:20:00Z",
    restaurantDetails: {
      phone: "+1-555-0456",
      email: "procurement@coastalkitchen.com",
      location: "456 Ocean Ave, Seaside",
    },
    paymentReference: "TXN987654321",
  },
  {
    saleId: "SALE003",
    restaurantId: "REST003",
    restaurantName: "Urban Eats",
    orderId: "ORD2024003",
    products: [
      { name: "Quinoa", quantity: 15, unitPrice: 6.0 },
      { name: "Avocados", quantity: 20, unitPrice: 2.5 },
    ],
    totalAmount: 140.0,
    paymentMethod: "Mobile Money",
    paymentStatus: "COMPLETED",
    createdAt: "2024-01-13T09:15:00Z",
    restaurantDetails: {
      phone: "+1-555-0789",
      email: "orders@urbaneats.com",
      location: "789 City Center, Metro",
    },
    paymentReference: "MM456789123",
    deliveryStatus: "IN_TRANSIT",
  },
  {
    saleId: "SALE004",
    restaurantId: "REST004",
    restaurantName: "Farm Table Restaurant",
    orderId: "ORD2024004",
    products: [
      { name: "Grass-fed Beef", quantity: 5, unitPrice: 25.0 },
      { name: "Sweet Potatoes", quantity: 8, unitPrice: 3.0 },
      { name: "Kale", quantity: 4, unitPrice: 4.5 },
    ],
    totalAmount: 167.0,
    paymentMethod: "POS",
    paymentStatus: "FAILED",
    createdAt: "2024-01-12T16:45:00Z",
    restaurantDetails: {
      phone: "+1-555-0321",
      email: "purchasing@farmtable.com",
      location: "321 Rural Rd, Countryside",
    },
  },
  {
    saleId: "SALE005",
    restaurantId: "REST005",
    restaurantName: "Spice Route",
    orderId: "ORD2024005",
    products: [
      { name: "Basmati Rice", quantity: 25, unitPrice: 4.0 },
      { name: "Turmeric", quantity: 3, unitPrice: 8.0 },
      { name: "Cardamom", quantity: 2, unitPrice: 15.0 },
      { name: "Coconut Oil", quantity: 4, unitPrice: 10.0 },
    ],
    totalAmount: 170.0,
    paymentMethod: "Bank",
    paymentStatus: "COMPLETED",
    createdAt: "2024-01-11T11:30:00Z",
    restaurantDetails: {
      phone: "+1-555-0654",
      email: "orders@spiceroute.com",
      location: "654 Spice St, Cultural District",
    },
    paymentReference: "BNK789456123",
    deliveryStatus: "DELIVERED",
  },
];

export default function SalesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState<Date | undefined>(undefined);

  const filters = useMemo(() => {
    return [
      createCommonFilters.search(searchTerm, setSearchTerm, "Search sales..."),
      createCommonFilters.status(statusFilter, setStatusFilter, [
        { label: "All Statuses", value: "all" },
        { label: "Completed", value: "COMPLETED" },
        { label: "Pending", value: "PENDING" },
        { label: "Failed", value: "FAILED" },
      ]),
      createCommonFilters.date(dateRange, setDateRange, "Sale Date"),
    ];
  }, [searchTerm, statusFilter, dateRange]);

  const filteredData = useMemo(() => {
    return mockSalesData.filter((sale) => {
      const matchesSearch =
        searchTerm === "" ||
        sale.restaurantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.products.some((product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesStatus =
        statusFilter === "all" || sale.paymentStatus === statusFilter;

      const matchesDate =
        !dateRange ||
        new Date(sale.createdAt).toDateString() === dateRange.toDateString();

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [searchTerm, statusFilter, dateRange, mockSalesData]);

  const handleExport = () => {
    console.log("[v0] Exporting sales data:", filteredData);
    // Export functionality would be implemented here
  };

  return (
    <div className="p-6">
      <DataTable
        columns={salesColumns}
        data={filteredData}
        title="Sales Management"
        showExport={true}
        onExport={handleExport}
        customFilters={<TableFilters filters={filters} />}
        showSearch={false}
        showColumnVisibility={true}
        showPagination={true}
        showRowSelection={true}
        showAddButton={false}
      />
    </div>
  );
}
