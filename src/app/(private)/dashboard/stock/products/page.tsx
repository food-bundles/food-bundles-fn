/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState } from "react";
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

  // ✅ Fetch products based on user role with pagination and filters
  const fetchProducts = async (page = 1, limit = 10, filterParams = filters, isPagination = false) => {
    try {
      if (isPagination) {
        setPaginationLoading(true);
      } else {
        setLoading(true);
      }
      
      const params: any = { page, limit };
      if (filterParams.search.trim()) params.search = filterParams.search.trim();
      if (filterParams.category && filterParams.category !== "all") params.category = filterParams.category;
      
      const response = await getAllProductsRoleBased(params);

      // Check if API returned data correctly
      if (response?.success && Array.isArray(response?.data)) {
        const mappedProducts = response.data.map((product: Product) => ({
          id: product.id,
          productName: product.productName,
          unitPrice: product.unitPrice,
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
        
        // Update pagination from API response
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
  };

  const handlePaginationChange = (page: number, limit: number) => {
    fetchProducts(page, limit, filters, true);
  };

  const handleFiltersChange = (newFilters: { search: string; category: string }) => {
    setFilters(newFilters);
    fetchProducts(1, pagination.limit, newFilters, false);
  };

  // ✅ Use effect (correct spelling)
  useEffect(() => {
    fetchProducts(1, 10, filters);
  }, []);

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        <Spinner variant="ring" />
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
