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
  const { getAllProductsRoleBased } = useProducts();

  // ✅ Fetch products based on user role
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await getAllProductsRoleBased();

      // Check if API returned data correctly
      if (response?.success && Array.isArray(response?.data)) {
        console.log("✅ Products fetched based on role:", response.data);

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
      } else {
        console.warn("Unexpected API response format:", response);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Use effect (correct spelling)
  useEffect(() => {
    fetchProducts();
  }, []);

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        <Spinner variant="ring" />
      </div>
    );
  return (
    <div className="p-6">
      <InventoryManagement products={products} onRefresh={fetchProducts} />
    </div>
  );
}
