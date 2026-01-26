/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { DataTable } from "@/components/data-table";
import { getInventoryColumns } from "./inventory-columns";
import { createCommonFilters, TableFilters } from "@/components/filters";
import {
  CreateProductDrawer,
  type ProductFormData,
} from "./CreateProductDrawer";
import { ProductManagementModal } from "./product-management-modal";
import { ProductStatusModal } from "./product-status-modal";
import type { Product } from "@/app/contexts/product-context";
import { toast } from "sonner";
import { productService } from "@/app/services/productService";
import { useCategory } from "@/app/contexts/category-context";

interface InventoryManagementProps {
  products: Product[];
  onRefresh: () => Promise<void>;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  onPaginationChange?: (page: number, limit: number) => void;
  onFiltersChange?: (newFilters: { search: string; categoryId?: string }) => void;
  isLoading?: boolean;
}

const statusOptions = [
  { label: "All Status", value: "all" },
  { label: "In Stock", value: "in-stock" },
  { label: "Low Stock", value: "low-stock" },
  { label: "Out of Stock", value: "out-of-stock" },
];

export function InventoryManagement({
  products,
  onRefresh,
  pagination,
  onPaginationChange,
  onFiltersChange,
  isLoading = false,
}: InventoryManagementProps) {
  const { activeCategories } = useCategory();

  // Filter states
  const [searchValue, setSearchValue] = useState("");
  const [statusValue, setStatusValue] = useState("all");
  const [categoryValue, setCategoryValue] = useState("all");
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});

  // Debounced search effect - trigger on both search and clear
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (onFiltersChange) {
        onFiltersChange({ 
          search: searchValue, 
          categoryId: categoryValue === "all" ? undefined : categoryValue 
        });
      }
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [searchValue]);

  // Filter handlers
  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    // Debouncing is handled by useEffect above
  };

  const handleCategoryChange = (value: string) => {
    setCategoryValue(value);
    if (onFiltersChange) {
      onFiltersChange({ 
        search: searchValue, 
        categoryId: value === "all" ? undefined : value 
      });
    }
  };

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isManagementOpen, setIsManagementOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusProduct, setStatusProduct] = useState<Product | null>(null);

  // Modal handlers
  const handleManageProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsManagementOpen(true);
  };

  const handleStatusClick = (product: Product) => {
    setStatusProduct(product);
    setIsStatusModalOpen(true);
  };

  const handleStatusUpdate = async (
    productId: string,
    status: string,
    reason?: string
  ) => {
    try {
      await productService.updateProductStatus(productId, status, reason);
      toast.success("Product status updated successfully");
      onRefresh();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to update product status"
      );
      throw error;
    }
  };

  const handleEditProduct = async (productId: string, formData: FormData) => {
    try {
      await productService.updateProduct(productId, formData);
      toast.success("Product updated successfully");
      onRefresh();
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to update product"
      );
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await productService.deleteProduct(productId);
      toast.success("Product deleted successfully");
      onRefresh();
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to delete product"
      );
    }
  };

  const handleProductCreate = async (productData: ProductFormData) => {
    try {
      // Product creation is handled in the modal
      toast.success("Product created successfully");
      onRefresh();
      setIsCreateOpen(false);
    } catch (error) {
      toast.error("Failed to create product");
    }
  };

  // Get columns with handlers
  const columns = useMemo(() => {
    return getInventoryColumns(handleManageProduct, handleStatusClick);
  }, []);

  // Remove client-side search filtering since we're using backend search
  const filteredData = useMemo(() => {
    return products.filter((product) => {
      // Status filter (client-side)
      if (statusValue !== "all") {
        const quantity = product.quantity;
        const status =
          quantity > 50
            ? "in-stock"
            : quantity > 0
            ? "low-stock"
            : "out-of-stock";
        if (status !== statusValue) return false;
      }

      // Date range filter (client-side)
      if (dateRange.from || dateRange.to) {
        if (!product.expiryDate) return false;

        const expiryDate = new Date(product.expiryDate);

        if (dateRange.from) {
          const startOfDay = new Date(dateRange.from);
          startOfDay.setHours(0, 0, 0, 0);
          if (expiryDate < startOfDay) return false;
        }

        if (dateRange.to) {
          const endOfDay = new Date(dateRange.to);
          endOfDay.setHours(23, 59, 59, 999);
          if (expiryDate > endOfDay) return false;
        }
      }

      return true;
    });
  }, [products, statusValue, dateRange]); // Removed searchValue and categoryValue

  // Create category options from API data
  const categoryOptions = useMemo(() => {
    const options = [{ label: "All Categories", value: "all" }];
    if (activeCategories) {
      activeCategories.forEach(category => {
        options.push({
          label: category.name,
          value: category.id
        });
      });
    }
    return options;
  }, [activeCategories]);

  // Create filters
  const filters = [
    createCommonFilters.search(
      searchValue,
      handleSearchChange,
      "Search products, SKU, category..."
    ),
    createCommonFilters.status(statusValue, setStatusValue, statusOptions),
    {
      type: "select" as const,
      key: "category",
      label: "Category",
      options: categoryOptions,
      value: categoryValue,
      onChange: handleCategoryChange,
    },
    createCommonFilters.dateRange(dateRange, setDateRange, "Expiry Date"),
  ];

  const handleExport = () => {
    // Add export logic here
    toast.info("Export functionality coming soon");
  };

  const clearDateRange = () => {
    setDateRange({});
  };

  return (
    <>
      <DataTable
        columns={columns}
        data={filteredData}
        title="Stock Management"
        description={""}
        showExport={true}
        onExport={handleExport}
        showAddButton={true}
        addButtonLabel="Add Product"
        onAddButton={() => setIsCreateOpen(true)}
        customFilters={
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full">
            <div className="flex flex-wrap items-center gap-2 flex-1">
              <TableFilters filters={filters} />
            </div>
          </div>
        }
        showSearch={false}
        showColumnVisibility={true}
        showPagination={true}
        showRowSelection={true}
        pagination={pagination}
        onPaginationChange={onPaginationChange}
        isLoading={isLoading}
      />

      {/* Modals */}
      <CreateProductDrawer
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleProductCreate}
      />

      <ProductManagementModal
        product={selectedProduct}
        open={isManagementOpen}
        onOpenChange={setIsManagementOpen}
        onUpdate={onRefresh}
        onEdit={handleEditProduct}
        onDelete={handleDeleteProduct}
      />

      <ProductStatusModal
        product={statusProduct}
        open={isStatusModalOpen}
        onOpenChange={setIsStatusModalOpen}
        onStatusUpdate={handleStatusUpdate}
      />
    </>
  );
}
