/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";
import { Plus } from "lucide-react";
import { useCategory, Category } from "@/app/contexts/category-context";
import { createCategoryColumns } from "./_components/category-columns";
import { CategoryModal } from "./_components/CategoryModal";
import { DeleteConfirmDialog } from "./_components/DeleteConfirmDialog";
import { toast } from "sonner";

interface CategoryFormData {
  name: string;
  description?: string;
  isActive: boolean;
}

export default function StockCategoriesPage() {
  const {
    categories,
    isLoading,
    createCategory,
    updateCategory,
    deleteCategory,
    refreshCategories,
  } = useCategory();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (categoryId: string) => {
    setCategoryToDelete(categoryId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (categoryToDelete) {
      try {
        await deleteCategory(categoryToDelete);
        toast.success("Category deleted successfully");
        await refreshCategories();
      } catch (error) {
        toast.error("Failed to delete category");
      }
      setCategoryToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const handleSubmit = async (data: CategoryFormData) => {
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, data);
        toast.success("Category updated successfully");
        await refreshCategories();
      } else {
        await createCategory(data);
        toast.success("Category created successfully");
        await refreshCategories();
      }
      setEditingCategory(null);
    } catch (error) {
      toast.error(editingCategory ? "Failed to update category" : "Failed to create category");
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const columns = createCategoryColumns(handleEdit, handleDeleteClick);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Categories</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={categories}
        title=""
        description=""
        showPagination={true}
        showColumnVisibility={false}
        showRowSelection={false}
        isLoading={isLoading}
      />

      <CategoryModal
        open={isModalOpen}
        onOpenChange={handleModalClose}
        category={editingCategory}
        onSubmit={handleSubmit}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}