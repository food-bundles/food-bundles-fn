/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import { useProducts } from "@/app/contexts/product-context";
import { InventoryManagement } from "./_components/inventory-management";
import type { Product } from "@/app/contexts/product-context";

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { getAllProductsRoleBased } = useProducts();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await getAllProductsRoleBased();
      if (response.success) {
        setProducts(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="p-6">
      <InventoryManagement products={products} onRefresh={fetchProducts} />
    </div>
  );
}
