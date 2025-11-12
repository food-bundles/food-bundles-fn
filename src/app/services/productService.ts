/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { toast } from "sonner";
import type { ProductFormData } from "../(private)/dashboard/inventory/_components/create-product-modal";
import createAxiosClient from "../hooks/axiosClient";

export interface CreateProductData {
  productName: string;
  unitPrice: number;
  purchasePrice: number; 
  categoryId: string; 
  bonus: number;
  sku: string;
  quantity: number;
  unit: string;
  expiryDate?: string;
}

export const productService = {
  createProduct: async (productData: ProductFormData) => {
    const axiosClient = createAxiosClient();

    // Create FormData for file upload
    const formData = new FormData();

    // Add product data
    formData.append("productName", productData.productName);
    formData.append("unitPrice", productData.unitPrice.toString());
    formData.append("purchasePrice", productData.purchasePrice.toString());
    formData.append("categoryId", productData.categoryId); // Changed from category to categoryId
    formData.append("bonus", productData.bonus.toString());
    formData.append("sku", productData.sku);
    formData.append("quantity", productData.quantity.toString());
    formData.append("unit", productData.unit);

    if (productData.expiryDate) {
      formData.append("expiryDate", productData.expiryDate.toISOString());
    }

    // Add images
    productData.images.forEach((image, index) => {
      formData.append("images", image);
    });


    const response = await axiosClient.post("/products", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },

  getAllProducts: async (params?: {
    page?: number;
    limit?: number;
    categoryId?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get("/products", { params });
    return response.data;
  },

  getAllProductsRoleBased: async (params?: {
    page?: number;
    limit?: number;
    categoryId?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    try {
      const axiosClient = createAxiosClient();
      const response = await axiosClient.get("/products/role-based", { params });
      return response.data;
    } catch (error: any) {
      toast.error("Error fetching role-based products:", error);
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || "Failed to fetch products",
      };
    }
  },
  getAllProductsByCategoryId: async (categoryId: string) => {
    try {
      const axiosClient = createAxiosClient();
      const response = await axiosClient.get(`/category/${categoryId}`);
      return response.data;
    } catch (error: any) {
      toast.error("Error fetching role-based products:", error);
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || "Failed to fetch products",
      };
    }
  },

  getProductById: async (productId: string) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get(`/products/${productId}`);
    return response.data;
  },

  updateProduct: async (productId: string, formData: FormData) => {
    const axiosClient = createAxiosClient();

    const response = await axiosClient.patch(
      `/products/${productId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  },

  deleteProduct: async (productId: string) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.delete(`/products/${productId}`);
    return response.data;
  },
};
