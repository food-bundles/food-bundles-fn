/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { PencilIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Product } from "@/app/contexts/product-context";
import Image from "next/image";

interface ProductManagementModalProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
  onEdit: (productId: string, data: any) => Promise<void>;
  onDelete: (productId: string) => Promise<void>;
}

const units = [
  "kg",
  "g",
  "lbs",
  "pieces",
  "liters",
  "ml",
  "boxes",
  "bags",
  "bunches",
];

export function ProductManagementModal({
  product,
  open,
  onOpenChange,
  onUpdate,
  onEdit,
  onDelete,
}: ProductManagementModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagesToKeep, setImagesToKeep] = useState<string[]>([]);

  // Edit form state
  const [editData, setEditData] = useState({
    productName: "",
    unitPrice: 0,
    purchasePrice: 0,
    categoryId: "",
    bonus: 0,
    sku: "",
    quantity: 0,
    unit: "",
    expiryDate: "",
  });

  useEffect(() => {
    if (product) {
      setEditData({
        productName: product.productName,
        unitPrice: product.unitPrice,
        purchasePrice: product.purchasePrice || 0,
        categoryId: product.category?.id || "",
        bonus: product.bonus || 0,
        sku: product.sku,
        quantity: product.quantity,
        unit: product.unit,
        expiryDate: product.expiryDate
          ? new Date(product.expiryDate).toISOString().split("T")[0]
          : "",
      });
      setImagesToKeep(product.images || []);
    }
  }, [product]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setImageFiles([]);
    if (product) {
      setEditData({
        productName: product.productName,
        unitPrice: product.unitPrice,
        purchasePrice: product.purchasePrice || 0,
        categoryId: product.category?.id || "",
        bonus: product.bonus || 0,
        sku: product.sku,
        quantity: product.quantity,
        unit: product.unit,
        expiryDate: product.expiryDate
          ? new Date(product.expiryDate).toISOString().split("T")[0]
          : "",
      });
      setImagesToKeep(product.images || []);
    }
  };

  const handleSaveEdit = async () => {
    if (!product) return;

    setIsLoading(true);
    try {
      const formData = new FormData();

      // Add text fields
      Object.entries(editData).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          formData.append(key, value.toString());
        }
      });

      // Add images to keep
      imagesToKeep.forEach((imageUrl) => {
        formData.append("keepImages", imageUrl);
      });

      // Add new image files
      imageFiles.forEach((file) => {
        formData.append("images", file);
      });

      await onEdit(product.id, formData);
      toast.success("Product updated successfully");
      setIsEditing(false);
      setImageFiles([]);
      setImagesToKeep([]);
      onUpdate();
    } catch (error: any) {
      console.error("Failed to update product:", error);
      toast.error(error.message || "Failed to update product");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!product) return;

    setIsLoading(true);
    try {
      await onDelete(product.id);
      toast.success("Product deleted successfully");
      setIsDeleting(false);
      setDeleteConfirmText("");
      onOpenChange(false);
      onUpdate();
    } catch (error: any) {
      console.error("Failed to delete product:", error);
      toast.error(error.message || "Failed to delete product");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleting(false);
    setDeleteConfirmText("");
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImageFiles(Array.from(e.target.files));
    }
  };

  const handleRemoveImage = (imageUrl: string) => {
    setImagesToKeep((prev) => prev.filter((img) => img !== imageUrl));
  };

  const isDeleteConfirmValid = deleteConfirmText === product?.productName;

  if (!product) return null;

  const quantity = product.quantity;
  const stockStatus =
    quantity > 50 ? "In Stock" : quantity > 0 ? "Low Stock" : "Out of Stock";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] bg-white text-gray-900 border-gray-200 flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-gray-900">
            Product Management
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {isDeleting
              ? "Confirm deletion of this product"
              : "View and manage product details"}
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto scrollbar-thin px-6 flex-1">
          {isEditing ? (
            <div className="py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="productName" className="text-gray-900">
                    Product Name
                  </Label>
                  <Input
                    id="productName"
                    value={editData.productName}
                    onChange={(e) =>
                      setEditData((prev) => ({
                        ...prev,
                        productName: e.target.value,
                      }))
                    }
                    disabled={isLoading}
                    className="bg-white border-gray-300 text-gray-900"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sku" className="text-gray-900">
                    SKU
                  </Label>
                  <Input
                    id="sku"
                    value={editData.sku}
                    onChange={(e) =>
                      setEditData((prev) => ({ ...prev, sku: e.target.value }))
                    }
                    disabled={isLoading}
                    className="bg-white border-gray-300 text-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity" className="text-gray-900">
                    Quantity
                  </Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={editData.quantity}
                    onChange={(e) =>
                      setEditData((prev) => ({
                        ...prev,
                        quantity: Number(e.target.value),
                      }))
                    }
                    disabled={isLoading}
                    className="bg-white border-gray-300 text-gray-900"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit" className="text-gray-900">
                    Unit
                  </Label>
                  <Select
                    value={editData.unit}
                    onValueChange={(value) =>
                      setEditData((prev) => ({ ...prev, unit: value }))
                    }
                    disabled={isLoading}
                  >
                    <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                      {units.map((unit) => (
                        <SelectItem key={unit} value={unit}>
                          {unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="unitPrice" className="text-gray-900">
                    Unit Price (RWF)
                  </Label>
                  <Input
                    id="unitPrice"
                    type="number"
                    value={editData.unitPrice}
                    onChange={(e) =>
                      setEditData((prev) => ({
                        ...prev,
                        unitPrice: Number(e.target.value),
                      }))
                    }
                    disabled={isLoading}
                    className="bg-white border-gray-300 text-gray-900"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bonus" className="text-gray-900">
                    Bonus (%)
                  </Label>
                  <Input
                    id="bonus"
                    type="number"
                    value={editData.bonus}
                    onChange={(e) =>
                      setEditData((prev) => ({
                        ...prev,
                        bonus: Number(e.target.value),
                      }))
                    }
                    disabled={isLoading}
                    className="bg-white border-gray-300 text-gray-900"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="images" className="text-gray-900">
                  Product Images
                </Label>

                {/* Current Images */}
                {imagesToKeep.length > 0 && (
                  <div className="mb-3">
                    <p className="text-sm text-gray-600 mb-2">
                      Current Images:
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      {imagesToKeep.map((image, index) => (
                        <div
                          key={index}
                          className="relative aspect-square rounded-lg overflow-hidden border group"
                        >
                          <Image
                            src={image || "/placeholder.svg"}
                            alt={`Current ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(image)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Input
                  id="images"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={isLoading}
                  className="bg-white border-gray-300 text-gray-900"
                />
                <p className="text-xs text-gray-500">
                  Select new images to replace current ones
                </p>
                {imageFiles.length > 0 && (
                  <p className="text-sm text-green-600">
                    {imageFiles.length} new file(s) selected
                  </p>
                )}
              </div>
            </div>
          ) : isDeleting ? (
            <div className="py-4 space-y-4">
              <div className="flex justify-center">
                <div className="h-20 w-20 rounded-full bg-red-600/10 flex items-center justify-center">
                  <Trash2Icon className="h-10 w-10 text-red-600" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Delete Product
                  </h3>
                  <p className="text-sm text-gray-600">
                    This action cannot be undone. To confirm deletion, please
                    type the{" "}
                    <span className="font-semibold text-gray-900">
                      product name
                    </span>{" "}
                    below:
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deleteConfirm" className="text-gray-900">
                    Type product name{" "}
                    <span className="font-semibold text-red-500">
                      {product.productName}
                    </span>{" "}
                    to confirm
                  </Label>
                  <Input
                    id="deleteConfirm"
                    placeholder="Type product name"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    disabled={isLoading}
                    className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="py-4 space-y-4">
              {/* Product Images */}
              {product.images && product.images.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {product.images.slice(0, 3).map((image, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-lg overflow-hidden border"
                    >
                      <Image
                        src={image || "/placeholder.svg"}
                        alt={`${product.productName} ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-sm font-medium text-gray-600">
                    Product Name:
                  </div>
                  <div className="text-sm col-span-2 text-gray-900 font-medium">
                    {product.productName}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-sm font-medium text-gray-600">SKU:</div>
                  <div className="text-sm col-span-2 text-gray-900">
                    {product.sku}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-sm font-medium text-gray-600">
                    Category:
                  </div>
                  <div className="text-sm col-span-2">
                    <Badge variant="outline">
                      {product.category?.name || "Unknown"}
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-sm font-medium text-gray-600">
                    Stock Status:
                  </div>
                  <div className="text-sm col-span-2">
                    <Badge
                      className={
                        stockStatus === "In Stock"
                          ? "bg-green-100 text-green-800"
                          : stockStatus === "Low Stock"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }
                    >
                      {stockStatus}
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-sm font-medium text-gray-600">
                    Quantity:
                  </div>
                  <div className="text-sm col-span-2 text-gray-900">
                    {product.quantity} {product.unit}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-sm font-medium text-gray-600">
                    Unit Price:
                  </div>
                  <div className="text-sm col-span-2 text-green-600 font-medium">
                    {product.unitPrice.toLocaleString()} RWF
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-sm font-medium text-gray-600">
                    Bonus:
                  </div>
                  <div className="text-sm col-span-2 text-gray-900">
                    {product.bonus}%
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-sm font-medium text-gray-600">
                    Created:
                  </div>
                  <div className="text-sm col-span-2 text-gray-900">
                    {new Date(product.createdAt).toLocaleDateString()}
                  </div>
                </div>
                {product.status === "INACTIVE" &&
                  (product as any).inactiveReason && (
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-sm font-medium text-gray-600">
                        Inactive Reason:
                      </div>
                      <div className="text-sm col-span-2 text-red-600 font-medium">
                        {(product as any).inactiveReason}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="px-6 pb-6 pt-2">
          {isEditing ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelEdit}
                disabled={isLoading}
                className="bg-white border-gray-300 text-gray-900 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSaveEdit}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </>
          ) : isDeleting ? (
            <>
              <Button
                variant="outline"
                onClick={handleCancelDelete}
                disabled={isLoading}
                className="bg-white border-gray-300 text-gray-900 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isLoading || !isDeleteConfirmValid}
                className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Deleting..." : "I Understand"}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={handleEdit}
                className="flex items-center gap-1 bg-white border-gray-300 text-gray-900 hover:bg-gray-50"
              >
                <PencilIcon className="h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="destructive"
                onClick={() => setIsDeleting(true)}
                className="flex items-center gap-1"
              >
                <Trash2Icon className="h-4 w-4" />
                Delete
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
