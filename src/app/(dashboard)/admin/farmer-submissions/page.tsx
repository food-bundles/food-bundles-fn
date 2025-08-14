/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useMemo } from "react";
import {
  farmerSubmissionsColumns,
  type FarmerSubmission,
} from "./_components/farmer-submissions-columns";
import { Filters } from "./_components/filters";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { DataTable } from "@/components/data-table";

// Sample data matching the image
const farmerSubmissions: FarmerSubmission[] = [
  {
    id: "1",
    farmerName: "John Smith",
    farmerAvatar: "/placeholder.svg?height=32&width=32",
    location: "Riverside Farm",
    product: "Organic Carrots",
    productIcon: "🥕",
    quantity: "500 kg",
    proposedPrice: "$250.00",
    acceptedQtyPrice: "-",
    aggregatorName: "-",
    status: "Pending",
  },
  {
    id: "2",
    farmerName: "Sarah Johnson",
    farmerAvatar: "/placeholder.svg?height=32&width=32",
    location: "Greenfield Co-op",
    product: "Fresh Lettuce",
    productIcon: "🥬",
    quantity: "300 kg",
    proposedPrice: "$180.00",
    acceptedQtyPrice: "300kg/",
    aggregatorName: "Robert Garcia",
    status: "Accepted",
  },
  {
    id: "3",
    farmerName: "Michael Brown",
    farmerAvatar: "/placeholder.svg?height=32&width=32",
    location: "Sunnyvale Farms",
    product: "Fresh Corn",
    productIcon: "🌽",
    quantity: "400 kg",
    proposedPrice: "$200.00",
    acceptedQtyPrice: "-",
    aggregatorName: "-",
    status: "Rejected",
  },
  {
    id: "4",
    farmerName: "Emma Wilson",
    farmerAvatar: "/placeholder.svg?height=32&width=32",
    location: "Hillside Farm",
    product: "Organic Tomatoes",
    productIcon: "🍅",
    quantity: "600 kg",
    proposedPrice: "$300.00",
    acceptedQtyPrice: "-",
    aggregatorName: "-",
    status: "Pending",
  },
  {
    id: "5",
    farmerName: "David Lee",
    farmerAvatar: "/placeholder.svg?height=32&width=32",
    location: "Valley View Co-op",
    product: "Fresh Cucumbers",
    productIcon: "🥒",
    quantity: "250 kg",
    proposedPrice: "$150.00",
    acceptedQtyPrice: "300kg/",
    aggregatorName: "Maria Lopez",
    status: "Pending",
  },
];

export default function FarmerSubmissionsPage() {
  const [searchValue, setSearchValue] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [columnVisibility, setColumnVisibility] = useState<
    Record<string, boolean>
  >({});

  const handleColumnVisibilityChange = (columnId: string, visible: boolean) => {
    setColumnVisibility((prev) => ({
      ...prev,
      [columnId]: visible,
    }));
  };

  const filteredData = useMemo(() => {
    return farmerSubmissions.filter((submission) => {
      // Search filter
      if (
        searchValue &&
        !submission.farmerName
          .toLowerCase()
          .includes(searchValue.toLowerCase()) &&
        !submission.product.toLowerCase().includes(searchValue.toLowerCase()) &&
        !submission.location.toLowerCase().includes(searchValue.toLowerCase())
      ) {
        return false;
      }

      // Status filter
      if (selectedStatus !== "all" && submission.status !== selectedStatus) {
        return false;
      }

      // Category filter (simplified - in real app would be based on actual product categories)
      if (selectedCategory !== "all") {
        const isOrganic = submission.product.toLowerCase().includes("organic");
        const isFresh = submission.product.toLowerCase().includes("fresh");

        if (selectedCategory === "organic" && !isOrganic) return false;
        if (selectedCategory === "fresh" && !isFresh) return false;
        if (
          selectedCategory === "grains" &&
          !submission.product.toLowerCase().includes("grain")
        )
          return false;
        if (
          selectedCategory === "fruits" &&
          !submission.product.toLowerCase().includes("fruit")
        )
          return false;
      }

      // Date filter would be implemented based on actual submission dates
      // For now, we'll skip date filtering since sample data doesn't have dates

      return true;
    });
  }, [searchValue, selectedStatus, selectedCategory, selectedDate]);

  return (
    <div className="space-y-6 p-6 h-full overflow-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Farmer Submissions</h1>
        <Button className="bg-green-600 hover:bg-green-700 flex-shrink-0">
          <Download className="mr-2 h-4 w-4" />
          Export Data
        </Button>
      </div>
      <Filters
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={handleColumnVisibilityChange}
      />

      <DataTable
        columns={farmerSubmissionsColumns}
        data={filteredData}
        searchKey="farmerName"
        searchPlaceholder="Search offers..."
        showSearch={false}
        showColumnVisibility={false}
      />
    </div>
  );
}
