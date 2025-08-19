"use client";

import { useState, useMemo } from "react";
import { DataTable } from "@/components/data-table";
import {
  inventoryColumns,
  type InventoryItem,
} from "./_components/inventory-columns";
import {
  createCommonFilters,
  TableFilters,
} from "../../../../components/filters";

// Sample inventory data
const sampleInventoryData: InventoryItem[] = [
  {
    id: "1",
    name: "Essential Grocery Box",
    image: "/filled-grocery-box.png",
    category: "Vegetable",
    quantity: 500,
    price: 130,
    expiryDate: "2024-02-28",
    status: "In Stock",
  },
  {
    id: "2",
    name: "Essential Grocery Box",
    image: "/filled-grocery-box.png",
    category: "Vegetable",
    quantity: 500,
    price: 130,
    expiryDate: "2024-02-28",
    status: "In Stock",
  },
  {
    id: "3",
    name: "Essential Grocery Box",
    image: "/filled-grocery-box.png",
    category: "Vegetable",
    quantity: 500,
    price: 130,
    expiryDate: "2024-02-28",
    status: "In Stock",
  },
  {
    id: "4",
    name: "Essential Grocery Box",
    image: "/filled-grocery-box.png",
    category: "Vegetable",
    quantity: 500,
    price: 130,
    expiryDate: "2024-02-28",
    status: "Low Stock",
  },
  {
    id: "5",
    name: "Essential Grocery Box",
    image: "/filled-grocery-box.png",
    category: "Vegetable",
    quantity: 500,
    price: 130,
    expiryDate: "2024-02-28",
    status: "Out of Stock",
  },
];

const statusOptions = [
  { label: "All Status", value: "all" },
  { label: "In Stock", value: "In Stock" },
  { label: "Low Stock", value: "Low Stock" },
  { label: "Out of Stock", value: "Out of Stock" },
];

export default function InventoryPage() {
  const [searchValue, setSearchValue] = useState("");
  const [statusValue, setStatusValue] = useState("all");
  const [dateValue, setDateValue] = useState<Date | undefined>(undefined);

  const filteredData = useMemo(() => {
    return sampleInventoryData.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        item.category.toLowerCase().includes(searchValue.toLowerCase());
      const matchesStatus =
        statusValue === "all" || item.status === statusValue;

      return matchesSearch && matchesStatus;
    });
  }, [searchValue, statusValue]);

  const filters = [
    createCommonFilters.search(
      searchValue,
      setSearchValue,
      "Search products..."
    ),
    createCommonFilters.status(statusValue, setStatusValue, statusOptions),
    createCommonFilters.date(dateValue, setDateValue, "Date Range"),
  ];

  const handleAddProduct = () => {
    // Handle add product action
    console.log("Add product clicked");
  };

  const handleExport = () => {
    // Handle export action
    console.log("Export clicked");
  };

  return (
    <div className="p-6">
      <DataTable
        columns={inventoryColumns}
        data={filteredData}
        title="Inventory Management"
        showExport={true}
        onExport={handleExport}
        showAddButton={true}
        addButtonLabel="Add Product"
        onAddButton={handleAddProduct}
        customFilters={<TableFilters filters={filters} />}
        showSearch={false}
        showColumnVisibility={true}
        showPagination={true}
        showRowSelection={true}
      />
    </div>
  );
}
