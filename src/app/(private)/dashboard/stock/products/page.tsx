/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState, useCallback } from "react";
import { useProducts } from "@/app/contexts/product-context";
import { InventoryManagement } from "./_components/inventory-management";
import type { Product } from "@/app/contexts/product-context";
import { Spinner } from "@/components/ui/shadcn-io/spinner";

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [paginationLoading, setPaginationLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    search: "",
    category: "",
  });
  const { getAllProductsRoleBased } = useProducts();

  const fetchProducts = useCallback(async (page = 1, limit = 10, filterParams = filters, isPagination = false, isSearch = false) => {
    try {
      if (isPagination) {
        setPaginationLoading(true);
      } else if (!isSearch) {
        setLoading(true); // Only show main loading for initial load, not for search
      }
      
      const params: any = { page, limit };
      if (filterParams.search.trim()) params.search = filterParams.search.trim();
      if (filterParams.category && filterParams.category !== "all") params.categoryId = filterParams.category;
      
      const response = await getAllProductsRoleBased(params);

      if (response?.success && Array.isArray(response?.data)) {
        const mappedProducts = response.data.map((product: Product) => ({
          id: product.id,
          productName: product.productName,
          unitPrice: product.unitPrice,
          restaurantPrice: product.restaurantPrice,
          hotelPrice: product.hotelPrice,
          purchasePrice: product.purchasePrice,
          category: {
            id: product.category?.id || "",
            name: product.category?.name,
            description: product.category?.description || undefined,
          },
          sku: product.sku,
          quantity: product.quantity,
          images: product.images || [],
          unit: product.unit,
          status: product.status,
          expiryDate: product.expiryDate,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
          createdBy: product.updatedAt,
          admin: {
            id: product.admin?.id || "",
            username: product.admin?.username || "",
            email: product.admin?.email || "",
          },
          bonus: product.bonus || 0,
          discountedPrice: product.bonus || 0,
        }));

        setProducts(mappedProducts);
        
        if (response.pagination) {
          setPagination({
            page: response.pagination.page,
            limit: response.pagination.limit,
            total: response.pagination.total,
            totalPages: response.pagination.totalPages,
          });
        }
      } else {
        console.warn("Unexpected API response format:", response);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
      setPaginationLoading(false);
    }
  }, [getAllProductsRoleBased, filters]);

  const handlePaginationChange = useCallback((page: number, limit: number) => {
    fetchProducts(page, limit, filters, true);
  }, [filters]);

  const handleFiltersChange = useCallback((newFilters: { search: string; categoryId?: string }) => {
    const updatedFilters = { search: newFilters.search, category: newFilters.categoryId || "" };
    setFilters(updatedFilters);
    fetchProducts(1, pagination.limit, updatedFilters, false, true); // Pass true for isSearch
  }, [pagination.limit]);

  // ✅ Use effect (correct spelling)
  useEffect(() => {
    fetchProducts(1, 10, filters);
  }, []);

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        <Spinner variant="ring" className="w-10 h-10" />
      </div>
    );
  return (
    <div className="p-6">
      <InventoryManagement 
        products={products} 
        onRefresh={() => fetchProducts(pagination.page, pagination.limit, filters)}
        pagination={pagination}
        onPaginationChange={handlePaginationChange}
        onFiltersChange={handleFiltersChange}
        isLoading={paginationLoading}
      />
    </div>
  );
}
