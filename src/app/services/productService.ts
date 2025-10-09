/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import type { ProductFormData } from "../(private)/dashboard/inventory/_components/create-product-modal";
import createAxiosClient from "../hooks/axiosClient";

export interface CreateProductData {
  productName: string;
  unitPrice: number;
  purchasePrice: number; // Added missing purchasePrice field
  categoryId: string; // Changed from category to categoryId to match backend expectation
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

    console.log("[v0] FormData contents:"); // Debug logging
    for (const [key, value] of formData.entries()) {
      console.log(`[v0] ${key}:`, value);
    }

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

  getAllProductsRoleBased: async () => {
    try {
      const axiosClient = createAxiosClient();
      const response = await axiosClient.get("/products/role-based");
      return response.data;
    } catch (error: any) {
      console.error("Error fetching role-based products:", error);
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
      console.error("Error fetching role-based products:", error);
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

  updateProduct: async (
    productId: string,
    productData: Partial<ProductFormData>
  ) => {
    const axiosClient = createAxiosClient();

    const formData = new FormData();

    // Add updated product data
    if (productData.productName)
      formData.append("productName", productData.productName);
    if (productData.unitPrice)
      formData.append("unitPrice", productData.unitPrice.toString());
    if (productData.purchasePrice)
      formData.append("purchasePrice", productData.purchasePrice.toString());
    if (productData.categoryId)
      formData.append("categoryId", productData.categoryId); // Changed from category to categoryId
    if (productData.bonus !== undefined)
      formData.append("bonus", productData.bonus.toString());
    if (productData.sku) formData.append("sku", productData.sku);
    if (productData.quantity)
      formData.append("quantity", productData.quantity.toString());
    if (productData.unit) formData.append("unit", productData.unit);
    if (productData.expiryDate)
      formData.append("expiryDate", productData.expiryDate.toISOString());

    // Add new images if any
    if (productData.images) {
      productData.images.forEach((image) => {
        formData.append("images", image);
      });
    }

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
