"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { CustomerTypeFormData, CustomerType } from "@/app/services/customerTypeService";
import { useActiveCategories } from "@/app/contexts/category-context";

interface CustomerTypeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerType?: CustomerType | null;
  canManageCategories?: boolean;
  onSubmit: (data: CustomerTypeFormData, categoryIds: string[]) => Promise<void>;
}

export function CustomerTypeModal({
  open,
  onOpenChange,
  customerType,
  canManageCategories = true,
  onSubmit,
}: CustomerTypeModalProps) {
  const [formData, setFormData] = useState<CustomerTypeFormData>({
    name: "",
    description: "",
  });
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ name?: string }>({});
  const { activeCategories } = useActiveCategories();

  useEffect(() => {
    if (customerType) {
      setFormData({
        name: customerType.name,
        description: customerType.description || "",
      });
      setSelectedCategoryIds(customerType.visibleCategoryIds || []);
    } else {
      setFormData({ name: "", description: "" });
      setSelectedCategoryIds(activeCategories.map((category) => category.id));
    }
    setErrors({});
  }, [customerType, open, activeCategories]);

  const toggleCategory = (categoryId: string, checked: boolean) => {
    setSelectedCategoryIds((prev) =>
      checked ? [...new Set([...prev, categoryId])] : prev.filter((id) => id !== categoryId),
    );
  };

  const validate = () => {
    const newErrors: { name?: string } = {};
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setIsSubmitting(true);
      await onSubmit(
        { ...formData, name: formData.name.trim() },
        canManageCategories ? selectedCategoryIds : [],
      );
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-gray-900">
            {customerType ? "Edit Customer Type" : "Create Customer Type"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-700">
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, name: e.target.value }));
                if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              placeholder="e.g. Restaurant, Hotel, School"
              className={`bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.name ? "border-red-500 focus:ring-red-500 focus:border-red-500" : ""}`}
              required
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-700">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="Optional description for this customer type"
              rows={3}
              className="bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          {canManageCategories && (
            <div className="space-y-2">
              <Label className="text-gray-700">Visible product categories</Label>
              <p className="text-xs text-gray-500">
                Customers of this type only see products in the categories you tick.
                Leave all unticked to hide the shop catalogue from them.
              </p>
              <div className="max-h-44 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-3 space-y-2">
                {activeCategories.length === 0 ? (
                  <p className="text-xs text-gray-500">No active categories yet.</p>
                ) : (
                  activeCategories.map((category) => (
                    <label
                      key={category.id}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Checkbox
                        checked={selectedCategoryIds.includes(category.id)}
                        onCheckedChange={(checked) =>
                          toggleCategory(category.id, checked === true)
                        }
                      />
                      <span className="text-sm text-gray-800">{category.name}</span>
                    </label>
                  ))
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? "Saving..." : customerType ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
