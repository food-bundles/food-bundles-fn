/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type React from "react";
import { createContext, useContext, useCallback } from "react";
import { productService } from "@/app/services/productService";

export type ProductCategory =
  | "VEGETABLES"
  | "FRUITS"
  | "GRAINS"
  | "TUBERS"
  | "LEGUMES"
  | "HERBS_SPICES"
  | "ANIMAL_PRODUCTS"
  | "OTHER";

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
  category: ProductCategory;
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
  getAllProducts: () => Promise<ProductsResponse>;
  getAllProductsRoleBased: () => Promise<ProductsResponse>;
  getProductById: (productId: string) => Promise<{ data: Product }>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const getAllProducts = useCallback(async (): Promise<ProductsResponse> => {
    try {
      const response = await productService.getAllProducts();

      // Transform API response to match component expectations
      const transformedProducts = response.data.map((product: any) => ({
        ...product,
        expiryDate: product.expiryDate ? new Date(product.expiryDate) : null,
        // Add default values for missing fields
        rating: product.rating || Math.random() * 2 + 3, // Random rating between 3-5 for demo
        soldCount: product.soldCount || Math.floor(Math.random() * 100),
      }));

      return {
        success: true,
        data: transformedProducts,
      };
    } catch (error) {
      console.error("Failed to fetch products:", error);
      return {
        success: false,
        data: [],
        message: "Failed to fetch products",
      };
    }
  }, []);

  const getAllProductsRoleBased =
    useCallback(async (): Promise<ProductsResponse> => {
      try {
        const response = await productService.getAllProductsRoleBased();

        // Transform response just like in getAllProducts
        const transformedProducts = response.data.map((product: any) => ({
          ...product,
          expiryDate: product.expiryDate ? new Date(product.expiryDate) : null,
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
    }, []);

  const getProductById = useCallback(async (productId: string) => {
    return await productService.getProductById(productId);
  }, []);

  const contextValue: ProductContextType = {
    getAllProducts,
    getAllProductsRoleBased,
    getProductById,
  };

  return (
    <ProductContext.Provider value={contextValue}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error("useProducts must be used within a ProductProvider");
  }
  return context;
}
