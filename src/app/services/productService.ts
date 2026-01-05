/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { toast } from "sonner";
import createAxiosClient from "../hooks/axiosClient";
import { ProductFormData } from "../(private)/dashboard/stock/products/_components/CreateProductDrawer";

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
    // Set default limit to 30 if not provided
    const requestParams = {
      ...params,
      limit: params?.limit || 30
    };
    const response = await axiosClient.get("/products", { params: requestParams });
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
      // Set default limit to 30 if not provided
      const requestParams = {
        ...params,
        limit: params?.limit || 30
      };
      const response = await axiosClient.get("/products/role-based", { params: requestParams });
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

  // update product category
  updateProductCategory: async (categoryId: string, data: { name: string; description: string; isActive: boolean }) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.patch(`/category/${categoryId}`, data);
    return response.data;
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

  updateProductStatus: async (productId: string, status: string, reason?: string) => {
    const axiosClient = createAxiosClient();
    const requestBody: any = { status };
    
    // Only add reason for INACTIVE status
    if (status === "INACTIVE" && reason) {
      requestBody.reason = reason;
    }
    
    const response = await axiosClient.patch(
      `/products/${productId}/status`,
      requestBody
    );
    return response.data;
  },

  getDiscountedProducts: async () => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get("/products/discounted");
    return response.data;
  },
};
