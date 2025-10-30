/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type React from "react";
import {
  createContext,
  useContext,
  useCallback,
  useState,
  useEffect,
  useMemo,
} from "react";
import { productService } from "@/app/services/productService";
import { categoryService } from "@/app/services/categoryService";

export interface Category {
  id: string;
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface Product {
  id: string;
  productName: string;
  purchasePrice: number;
  unitPrice: number;
  unit: string;
  bonus: number;
  admin: {
    id: string;
    username: string;
    email: string;
  };
  expiryDate: Date | null;
  images: string[];
  quantity: number;
  sku: string;
  category: {
    id: string;
    name: string;
    description?: string;
  };
  rating?: number;
  soldCount?: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductsResponse {
  success: boolean;
  data: Product[];
  message?: string;
}

interface ProductContextType {
  categories: Category[];
  getAllProducts: () => Promise<ProductsResponse>;
  getAllProductsRoleBased: () => Promise<ProductsResponse>;
  getAllProductsByCategoryId: (categoryId: string) => Promise<ProductsResponse>;
  getProductById: (productId: string) => Promise<{ data: Product }>;
  refreshCategories: () => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);

  const refreshCategories = useCallback(async () => {
    try {
      const response = await categoryService.getActiveCategories();
      if (response.success && response.data) {
        setCategories(response.data);
      } else {
        setCategories(response.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      setCategories([]);
    }
  }, []);

  useEffect(() => {
    refreshCategories();
  }, []); // Remove dependency to prevent loops

  const getAllProducts = useCallback(async (): Promise<ProductsResponse> => {
    try {
      const response = await productService.getAllProducts();

      const transformedProducts = response.data.map((product: any) => ({
        ...product,
        expiryDate: product.expiryDate ? new Date(product.expiryDate) : null,
        category:
          categories.find((cat) => cat.id === product.categoryId) || null,
        rating: product.rating || Math.random() * 2 + 3,
        soldCount: product.soldCount || Math.floor(Math.random() * 100),
      }));

      return {
        success: true,
        data: transformedProducts,
      };
    } catch (error) {
      console.error("Failed to fetch products:", error);
      return { success: false, data: [], message: "Failed to fetch products" };
    }
  }, [categories]);

  const getAllProductsRoleBased =
    useCallback(async (): Promise<ProductsResponse> => {
      try {
        const response = await productService.getAllProductsRoleBased();

        const transformedProducts = response.data.map((product: any) => ({
          ...product,
          expiryDate: product.expiryDate ? new Date(product.expiryDate) : null,
          category:
            categories.find((cat) => cat.id === product.categoryId) || null,
          rating: product.rating || Math.random() * 2 + 3,
          soldCount: product.soldCount || Math.floor(Math.random() * 100),
        }));

        return {
          success: true,
          data: transformedProducts,
        };
      } catch (error) {
        console.error("Failed to fetch role-based products:", error);
        return {
          success: false,
          data: [],
          message: "Failed to fetch role-based products",
        };
      }
    }, [categories]);

  const getAllProductsByCategoryId = useCallback(
    async (categoryId: string): Promise<ProductsResponse> => {
      try {
        const response = await productService.getAllProductsByCategoryId(
          categoryId
        );

        const transformedProducts = response.data.map((product: any) => ({
          ...product,
          expiryDate: product.expiryDate ? new Date(product.expiryDate) : null,
          category:
            categories.find((cat) => cat.id === product.categoryId) || null,
          rating: product.rating || Math.random() * 2 + 3,
          soldCount: product.soldCount || Math.floor(Math.random() * 100),
        }));

        return {
          success: true,
          data: transformedProducts,
        };
      } catch (error) {
        console.error("Failed to fetch products by category ID:", error);
        return {
          success: false,
          data: [],
          message: "Failed to fetch products by category ID",
        };
      }
    },
    [categories]
  );

  const getProductById = useCallback(async (productId: string) => {
    return await productService.getProductById(productId);
  }, []);

  const contextValue: ProductContextType = useMemo(() => ({
    categories,
    getAllProducts,
    getAllProductsRoleBased,
    getAllProductsByCategoryId,
    getProductById,
    refreshCategories,
  }), [categories, getAllProducts, getAllProductsRoleBased, getAllProductsByCategoryId, getProductById, refreshCategories]);

  return (
    <ProductContext.Provider value={contextValue}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error("useProducts must be used within a ProductProvider");
  }
  return context;
}
