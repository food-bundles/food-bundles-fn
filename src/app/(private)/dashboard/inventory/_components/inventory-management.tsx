/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useMemo } from "react";
import { DataTable } from "@/components/data-table";
import { getInventoryColumns } from "./inventory-columns";
import { createCommonFilters, TableFilters } from "@/components/filters";
import {
  CreateProductModal,
  type ProductFormData,
} from "./create-product-modal";
import { ProductDetailsModal } from "./product-details-modal";
import { EditProductModal } from "./edit-product-modal";
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog";
import type { Product } from "@/app/contexts/product-context";
import { toast } from "sonner";

interface InventoryManagementProps {
  products: Product[];
  onRefresh: () => void;
}

const statusOptions = [
  { label: "All Status", value: "all" },
  { label: "In Stock", value: "in-stock" },
  { label: "Low Stock", value: "low-stock" },
  { label: "Out of Stock", value: "out-of-stock" },
];

const categoryOptions = [
  { label: "All Categories", value: "all" },
  { label: "Vegetables", value: "VEGETABLES" },
  { label: "Fruits", value: "FRUITS" },
  { label: "Grains", value: "GRAINS" },
  { label: "Tubers", value: "TUBERS" },
  { label: "Legumes", value: "LEGUMES" },
  { label: "Herbs & Spices", value: "HERBS_SPICES" },
  { label: "Animal Products", value: "ANIMAL_PRODUCTS" },
  { label: "Other", value: "OTHER" },
];

export function InventoryManagement({
  products,
  onRefresh,
}: InventoryManagementProps) {
  // Filter states
  const [searchValue, setSearchValue] = useState("");
  const [statusValue, setStatusValue] = useState("all");
  const [categoryValue, setCategoryValue] = useState("all");
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  // Modal handlers
  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsDetailsOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsEditOpen(true);
  };

  const handleDeleteProduct = (productId: string) => {
    setProductToDelete(productId);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (productToDelete) {
      try {
        // Add delete logic here when backend is ready
        toast.success("Product deleted successfully");
        onRefresh();
      } catch (error) {
        toast.error("Failed to delete product");
      }
    }
    setIsDeleteOpen(false);
    setProductToDelete(null);
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

  const handleProductUpdate = async (productData: ProductFormData) => {
    try {
      // Add update logic here when backend is ready
      toast.success("Product updated successfully");
      onRefresh();
      setIsEditOpen(false);
    } catch (error) {
      toast.error("Failed to update product");
    }
  };

  // Get columns with handlers
  const columns = useMemo(() => {
    return getInventoryColumns(
      handleViewProduct,
      handleEditProduct,
      handleDeleteProduct
    );
  }, []);

  // Filter data
  const filteredData = useMemo(() => {
    return products.filter((product) => {
      // Search filter
      if (searchValue) {
        const searchLower = searchValue.toLowerCase();
        const matchesSearch =
          product.productName.toLowerCase().includes(searchLower) ||
          product.sku.toLowerCase().includes(searchLower) ||
          (product.category &&
            product.category.name.toLowerCase().includes(searchLower));

        if (!matchesSearch) return false;
      }

      // Status filter
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

      // Category filter
      if (categoryValue !== "all" && product.category?.name !== categoryValue) {
        return false;
      }

      // Date range filter (expiry date)
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
  }, [products, searchValue, statusValue, categoryValue, dateRange]);

  // Create filters
  const filters = [
    createCommonFilters.search(
      searchValue,
      setSearchValue,
      "Search products, SKU, category..."
    ),
    createCommonFilters.status(statusValue, setStatusValue, statusOptions),
    createCommonFilters.category(
      categoryValue,
      setCategoryValue,
      categoryOptions
    ),
    createCommonFilters.dateRange(dateRange, setDateRange, "Expiry Date Range"),
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
        title="Inventory Management"
        descrption={""}
        showExport={true}
        onExport={handleExport}
        showAddButton={true}
        addButtonLabel="Add Product"
        onAddButton={() => setIsCreateOpen(true)}
        customFilters={
          <div className="flex items-center gap-4 flex-wrap">
            <TableFilters filters={filters} />
            {(dateRange.from || dateRange.to) && (
              <button
                onClick={clearDateRange}
                className="text-sm text-gray-500 hover:text-gray-700 underline ml-2"
              >
                Clear Date Filter
              </button>
            )}
          </div>
        }
        showSearch={false}
        showColumnVisibility={true}
        showPagination={true}
        showRowSelection={true}
      />

      {/* Modals */}
      <CreateProductModal
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={handleProductCreate}
      />

      <ProductDetailsModal
        product={selectedProduct}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
      />

      <EditProductModal
        product={selectedProduct}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        onSubmit={handleProductUpdate}
      />

      <DeleteConfirmationDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleConfirmDelete}
        productName={
          products.find((p) => p.id === productToDelete)?.productName || ""
        }
      />
    </>
  );
}
