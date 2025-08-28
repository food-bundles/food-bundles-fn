/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useMemo } from "react";
import {
  farmerSubmissionsColumns,
  type FarmerSubmission,
} from "./_components/farmer-submissions-columns";
import {
  createCommonFilters,
  TableFilters,
} from "../../../../components/filters";
import { DataTable } from "@/components/data-table";
import { toast } from "sonner";

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

// Filter options
const statusOptions = [
  { label: "All Status", value: "all" },
  { label: "Pending", value: "Pending" },
  { label: "Accepted", value: "Accepted" },
  { label: "Rejected", value: "Rejected" },
];

const categoryOptions = [
  { label: "All Categories", value: "all" },
  { label: "Organic Vegetables", value: "organic" },
  { label: "Fresh Produce", value: "fresh" },
  { label: "Grains", value: "grains" },
  { label: "Fruits", value: "fruits" },
];

export default function FarmerSubmissionsPage() {
  const [searchValue, setSearchValue] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  const filteredData = useMemo(() => {
    return farmerSubmissions.filter((submission) => {
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

      if (selectedStatus !== "all" && submission.status !== selectedStatus) {
        return false;
      }

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

      return true;
    });
  }, [searchValue, selectedStatus, selectedCategory, selectedDate]);

  const filters = [
    createCommonFilters.search(searchValue, setSearchValue, "Search offers..."),
    createCommonFilters.status(
      selectedStatus,
      setSelectedStatus,
      statusOptions
    ),
    createCommonFilters.category(
      selectedCategory,
      setSelectedCategory,
      categoryOptions
    ),
    createCommonFilters.date(selectedDate, setSelectedDate, "Date"),
  ];

  const handleExport = async () => {
    try {
      console.log("Exporting data...", {
        filters: {
          search: searchValue,
          status: selectedStatus,
          category: selectedCategory,
          date: selectedDate,
        },
        totalRecords: filteredData.length,
      });

      toast("Export functionality will be handled by backend");
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  return (
    <div className="p-6">
      <DataTable
        columns={farmerSubmissionsColumns}
        data={filteredData}
        title="Farmer Submissions"
        showExport={true}
        onExport={handleExport}
        customFilters={<TableFilters filters={filters} />}
        showSearch={false}
        showColumnVisibility={true}
        showPagination={true}
        showRowSelection={true}
      />
    </div>
  );
}
