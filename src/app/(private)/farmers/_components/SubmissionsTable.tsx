"use client";

import { useState } from "react";
import { Plus, LayoutGrid, Table2, List as ListIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { productColumns } from "./product-columns";
import { DataTable } from "@/components/data-table";
import { Product } from "./product-context";
import { SubmissionCardGrid } from "./submission-card-grid";
import { SubmissionList } from "./submission-list";
import { ViewModeToggle } from "@/components/view-mode-toggle";
import {
  TableFilters,
  FilterConfig,
  createCommonFilters,
} from "@/components/filters";

type ViewMode = "cards" | "table" | "list";

const VIEW_MODE_OPTIONS = [
  { value: "table" as const, label: "Table", icon: Table2 },
  { value: "cards" as const, label: "Cards", icon: LayoutGrid },
  { value: "list" as const, label: "List", icon: ListIcon },
];

const STATUS_OPTIONS = [
  { label: "All", value: "All" },
  { label: "PENDING", value: "PENDING" },
  { label: "VERIFIED", value: "VERIFIED" },
  { label: "APPROVED", value: "APPROVED" },
  { label: "REJECTED", value: "REJECTED" },
  { label: "PAID", value: "PAID" },
];

interface SubmissionsTableProps {
  products: Product[];
  loading: boolean;
  onViewDetails: (product: Product | null) => void;
  onCreateSubmission?: () => void;
  showCreateButton?: boolean;
  title?: string;
}

export function SubmissionsTable({
  products,
  loading,
  onViewDetails,
  onCreateSubmission,
  showCreateButton = false,
  title = "Your submissions",
}: SubmissionsTableProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  const filteredProducts = products.filter((product) => {
    const matchesStatus =
      selectedStatus === "All" || product.status === selectedStatus;
    const matchesDate =
      !dateFilter ||
      product.submittedDate.includes(dateFilter.toLocaleDateString());
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (typeof product.category === "string"
        ? product.category
        : product.category.name
      )
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      product.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesDate && matchesSearch;
  });

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedStatus("All");
    setDateFilter(undefined);
  };

  const filters: FilterConfig[] = [
    createCommonFilters.search(
      searchTerm,
      setSearchTerm,
      "Search products, categories, or locations..."
    ),
    createCommonFilters.status(selectedStatus, setSelectedStatus, STATUS_OPTIONS),
    createCommonFilters.date(dateFilter, setDateFilter, "Date Filter"),
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        <div className="flex items-center gap-2">
          <ViewModeToggle
            value={viewMode}
            onChange={setViewMode}
            options={VIEW_MODE_OPTIONS}
          />
          {showCreateButton && onCreateSubmission && (
            <Button
              onClick={onCreateSubmission}
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={loading}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Submission
            </Button>
          )}
        </div>
      </div>

      <div>
        <TableFilters
          filters={filters}
          className="flex-col sm:flex-row items-stretch sm:items-center"
        />
        {(searchTerm || selectedStatus !== "All" || dateFilter) && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearFilters}
            className="mt-4 text-red-600 hover:text-red-700 w-full sm:w-auto"
          >
            Clear Filters
          </Button>
        )}
      </div>

      {viewMode === "table" && (
        <DataTable
          columns={productColumns(onViewDetails)}
          data={filteredProducts}
          title=""
          showExport={false}
          showSearch={false}
          showColumnVisibility={true}
          showPagination={true}
          showRowSelection={false}
        />
      )}
      {viewMode === "cards" && (
        <SubmissionCardGrid products={filteredProducts} onViewDetails={onViewDetails} />
      )}
      {viewMode === "list" && (
        <SubmissionList products={filteredProducts} onViewDetails={onViewDetails} />
      )}

      {filteredProducts.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-gray-600">No products found.</p>
          <Button onClick={handleClearFilters} variant="outline" className="mt-4">
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}
