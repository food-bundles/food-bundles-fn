import createAxiosClient from "../hooks/axiosClient";

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
  // ✅ Create a new category (Admin only)
  createCategory: async (categoryData: CreateCategoryData) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.post("/category", categoryData);
    return response.data;
  },

  // ✅ Get all categories (with filters/pagination — Admin, Aggregator, Logistics)
  getAllCategories: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
  }) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get("/category/active", { params });
    return response.data;
  },

  // ✅ Get only active categories (for dropdowns, etc.)
  getActiveCategories: async () => {
    const axiosClient = createAxiosClient();
      const response = await axiosClient.get("/category/active");
    //   console.log("????? ",response.data.data);
      return response.data;
  },

  // ✅ Get a single category by ID
  getCategoryById: async (categoryId: string) => {
    const axiosClient = createAxiosClient();
    const response = await axiosClient.get(`/category/${categoryId}`);
    return response.data;
  },

  // ✅ Update a category (Admin only)
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
