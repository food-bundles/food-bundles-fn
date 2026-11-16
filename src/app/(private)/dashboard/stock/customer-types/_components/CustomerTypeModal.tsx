"use client";

import { useState, useEffect, useRef } from "react";
import { Camera, Trash2 } from "lucide-react";
import { CustomerTypeAvatar } from "@/components/customer-type-avatar";
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
  onSubmit: (data: CustomerTypeFormData, categoryIds: string[], image: CustomerTypeImageChange) => Promise<void>;
}

/** The picture shown on sign-up: a new file, removing the current one, or no change */
export type CustomerTypeImageChange = { file?: File; remove?: boolean };

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

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
  const [errors, setErrors] = useState<{ name?: string; image?: string }>({});
  const { activeCategories } = useActiveCategories();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Preview of a newly chosen picture
  useEffect(() => {
    if (!imageFile) {
      setImagePreview(null);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const pickImage = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({ ...prev, image: "Choose an image (JPG, PNG or WebP)" }));
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setErrors((prev) => ({ ...prev, image: "The picture must be 5 MB or less" }));
      return;
    }
    setErrors((prev) => ({ ...prev, image: undefined }));
    setImageFile(file);
    setRemoveImage(false);
  };

  const shownImage = imagePreview ?? (removeImage ? null : customerType?.imageUrl ?? null);

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
    setImageFile(null);
    setRemoveImage(false);
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
        { file: imageFile ?? undefined, remove: removeImage && !imageFile },
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
          {/* Picture shown in a circle on sign-up, so people recognise their business type */}
          <div className="flex items-center gap-4 rounded-xl border border-[#DCE6DF] bg-[#F6F9F7] p-3">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="relative shrink-0 rounded-full ring-2 ring-white transition-transform hover:scale-[1.03] cursor-pointer"
              aria-label="Choose a picture"
            >
              <CustomerTypeAvatar name={formData.name || "Customer"} imageUrl={shownImage} size={84} />
              <span className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#0B2E1F] text-white ring-2 ring-white">
                <Camera className="h-4 w-4" />
              </span>
            </button>
            <div className="min-w-0 flex-1">
              <p className="m-0 text-sm font-bold text-[#0B2E1F]">Picture on sign-up</p>
              <p className="m-0 mt-0.5 text-xs text-[#4A6358]">
                A real photo of this kind of business (a restaurant kitchen, a hotel, a school canteen…). Shown in a circle;
                without one, an icon is used.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="rounded-full border border-[#DCE6DF] bg-white px-3 py-1 text-xs font-bold text-[#0B2E1F] hover:border-[#00A43A] cursor-pointer"
                >
                  {shownImage ? "Change picture" : "Add picture"}
                </button>
                {shownImage && (
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setRemoveImage(true);
                    }}
                    className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold text-red-600 hover:bg-red-50 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Remove
                  </button>
                )}
              </div>
              {errors.image && <p className="m-0 mt-1 text-xs text-red-600">{errors.image}</p>}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                pickImage(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </div>

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
