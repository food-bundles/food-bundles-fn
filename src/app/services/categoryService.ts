/* eslint-disable @typescript-eslint/no-explicit-any */
import createAxiosClient from "../hooks/axiosClient";
import { tableTronicService } from "./tableTronicService";

export interface CreateCategoryData {
  name: string;
  description?: string;
}

export interface UpdateCategoryData {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export const categoryService = {
  createCategory: async (categoryData: CreateCategoryData) => {
    try {
      const tableTronicCategory = await tableTronicService.createCategory({
        name: categoryData.name,
        description: categoryData.description,
      });

      const axiosClient = createAxiosClient();
      const foodBundlesData = {
        ...categoryData,
        tableTronicId: tableTronicCategory.id,
      };
      
      const response = await axiosClient.post("/category", foodBundlesData);
      return response.data;
    } catch (error: any) {
      console.error('Category creation error:', error);
      if (error.message?.includes('Table Tronic')) {
        console.warn('Table Tronic creation failed, creating in Food Bundles only');
        const axiosClient = createAxiosClient();
        const response = await axiosClient.post("/category", categoryData);
        return response.data;
      }
      throw error;
    }
  },

  getAllCategories: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
  }) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get("/category", { params });
    return response.data;
  },

  getActiveCategories: async () => {
    const axiosClient = createAxiosClient();
      const response = await axiosClient.get("/category/active");
      return response.data;
  },

  getCategoryById: async (categoryId: string) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get(`/category/${categoryId}`);
    return response.data;
  },

  updateCategory: async (
    categoryId: string,
    categoryData: UpdateCategoryData
  ) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.patch(
      `/category/${categoryId}`,
      categoryData
    );
    return response.data;
  },

  // ✅ Delete a category (Admin only)
  deleteCategory: async (categoryId: string) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.delete(`/category/${categoryId}`);
    return response.data;
  },

  // ✅ Bulk update category status (Admin only)
  updateCategoryStatus: async (data: { ids: string[]; isActive: boolean }) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.patch("/category/bulk-status", data);
    return response.data;
  },
};
