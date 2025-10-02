"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  categoryService,
  type CreateCategoryData,
  type UpdateCategoryData,
} from "@/app/services/categoryService";

export interface Category {
  id: string;
  name: string;
  description?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface CategoryContextType {
  // State
  categories: Category[];
  activeCategories: Category[];
  isLoading: boolean;
  error: string | null;

  // Actions
  refreshCategories: () => Promise<void>;
  refreshActiveCategories: () => Promise<void>;
  createCategory: (categoryData: CreateCategoryData) => Promise<boolean>;
  updateCategory: (
    categoryId: string,
    categoryData: UpdateCategoryData
  ) => Promise<boolean>;
  deleteCategory: (categoryId: string) => Promise<boolean>;
  getCategoryById: (categoryId: string) => Promise<Category | null>;
  updateCategoryStatus: (ids: string[], isActive: boolean) => Promise<boolean>;

  // Utility functions
  getCategoryNameById: (categoryId: string) => string;
}

const CategoryContext = createContext<CategoryContextType | undefined>(
  undefined
);

interface CategoryProviderProps {
  children: React.ReactNode;
}

export function CategoryProvider({ children }: CategoryProviderProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategories, setActiveCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("Fetching all categories...");
      const response = await categoryService.getAllCategories();
      console.log("All categories response:", response);

      if (response.success && response.data) {
        setCategories(response.data);
      } else if (response.data) {
        // Handle case where success might not be present but data exists
        setCategories(response.data);
      } else {
        setCategories([]);
        if (response.message) {
          setError(response.message);
        }
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setError("Failed to load categories");
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshActiveCategories = useCallback(async () => {
    try {
      setError(null);

      const response = await categoryService.getActiveCategories();

      if (response.success && response.data) {
        setActiveCategories(response.data);
      } else if (response.data) {
        // Handle case where success might not be present but data exists
        setActiveCategories(response.data);
      } else {
        setActiveCategories([]);
        if (response.message) {
          setError(response.message);
        } else {
          setError("No active categories found");
        }
      }
    } catch (error) {
      console.error("Error fetching active categories:", error);
      setError("Failed to load active categories");
      setActiveCategories([]);
    }
  }, []);

  const createCategory = useCallback(
    async (categoryData: CreateCategoryData): Promise<boolean> => {
      try {
        setError(null);
        const response = await categoryService.createCategory(categoryData);

        if (response.success) {
          await refreshCategories();
          await refreshActiveCategories();
          return true;
        } else {
          setError(response.message || "Failed to create category");
          return false;
        }
      } catch (error) {
        console.error("Error creating category:", error);
        setError("Failed to create category");
        return false;
      }
    },
    [refreshCategories, refreshActiveCategories]
  );

  const updateCategory = useCallback(
    async (
      categoryId: string,
      categoryData: UpdateCategoryData
    ): Promise<boolean> => {
      try {
        setError(null);
        const response = await categoryService.updateCategory(
          categoryId,
          categoryData
        );

        if (response.success) {
          await refreshCategories();
          await refreshActiveCategories();
          return true;
        } else {
          setError(response.message || "Failed to update category");
          return false;
        }
      } catch (error) {
        console.error("Error updating category:", error);
        setError("Failed to update category");
        return false;
      }
    },
    [refreshCategories, refreshActiveCategories]
  );

  const deleteCategory = useCallback(
    async (categoryId: string): Promise<boolean> => {
      try {
        setError(null);
        const response = await categoryService.deleteCategory(categoryId);

        if (response.success) {
          await refreshCategories();
          await refreshActiveCategories();
          return true;
        } else {
          setError(response.message || "Failed to delete category");
          return false;
        }
      } catch (error) {
        console.error("Error deleting category:", error);
        setError("Failed to delete category");
        return false;
      }
    },
    [refreshCategories, refreshActiveCategories]
  );

  const getCategoryById = useCallback(
    async (categoryId: string): Promise<Category | null> => {
      try {
        setError(null);
        const response = await categoryService.getCategoryById(categoryId);

        if (response.success && response.data) {
          return response.data;
        } else {
          setError(response.message || "Category not found");
          return null;
        }
      } catch (error) {
        console.error("Error fetching category:", error);
        setError("Failed to fetch category");
        return null;
      }
    },
    []
  );

  const updateCategoryStatus = useCallback(
    async (ids: string[], isActive: boolean): Promise<boolean> => {
      try {
        setError(null);
        const response = await categoryService.updateCategoryStatus({
          ids,
          isActive,
        });

        if (response.success) {
          await refreshCategories();
          await refreshActiveCategories();
          return true;
        } else {
          setError(response.message || "Failed to update category status");
          return false;
        }
      } catch (error) {
        console.error("Error updating category status:", error);
        setError("Failed to update category status");
        return false;
      }
    },
    [refreshCategories, refreshActiveCategories]
  );

  // Utility function to get category name by ID
  const getCategoryNameById = useCallback(
    (categoryId: string): string => {
      const category = [...categories, ...activeCategories].find(
        (cat) => cat.id === categoryId
      );
      return category ? category.name.replace(/_/g, " ") : "Unknown Category";
    },
    [categories, activeCategories]
  );

  // Load categories on mount
  useEffect(() => {
    const initializeCategories = async () => {
      try {
        // First load active categories (most commonly used)
        await refreshActiveCategories();
        // Then load all categories
        await refreshCategories();
      } catch (error) {
        console.error("Error initializing categories:", error);
      }
    };

    initializeCategories();
  }, [refreshCategories, refreshActiveCategories]);

  const value: CategoryContextType = {
    categories,
    activeCategories,
    isLoading,
    error,
    refreshCategories,
    refreshActiveCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
    updateCategoryStatus,
    getCategoryNameById,
  };

  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategory() {
  const context = useContext(CategoryContext);
  if (context === undefined) {
    throw new Error("useCategory must be used within a CategoryProvider");
  }
  return context;
}

// Hook to get only active categories (commonly used in dropdowns)
export function useActiveCategories() {
  const { activeCategories, isLoading, error } = useCategory();
  return { activeCategories, isLoading, error };
}

// Hook to find a specific category by ID
export function useCategoryById(categoryId: string) {
  const { categories, activeCategories } = useCategory();
  const category = [...categories, ...activeCategories].find(
    (cat) => cat.id === categoryId
  );
  return category || null;
}
