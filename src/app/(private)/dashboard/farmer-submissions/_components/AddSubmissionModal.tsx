"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { farmersService } from "@/app/services/farmersService";
import { productService } from "@/app/services/productService";
import { submissionService } from "@/app/services/submissionServices";

interface AddSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

interface FarmerOption {
  id: string;
  name?: string;
  phone?: string;
  email?: string;
}

interface ProductOption {
  id: string;
  productName: string;
}

export function AddSubmissionModal({
  isOpen,
  onClose,
  onCreated,
}: AddSubmissionModalProps) {
  const [farmers, setFarmers] = useState<FarmerOption[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [farmerId, setFarmerId] = useState("");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [wishedPrice, setWishedPrice] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    setFarmerId("");
    setProductId("");
    setQuantity("");
    setWishedPrice("");
    setError("");

    const loadOptions = async () => {
      try {
        setLoadingOptions(true);
        const [farmersRes, productsRes] = await Promise.all([
          farmersService.getAllFarmers({ limit: 200 }),
          productService.getAllProducts({ limit: 200 }),
        ]);

        setFarmers(farmersRes.success ? farmersRes.data : []);
        setProducts(productsRes.success ? productsRes.data : productsRes.data ?? []);
      } catch (err) {
        console.error("Failed to load farmers/products:", err);
        toast.error("Failed to load farmers or products");
      } finally {
        setLoadingOptions(false);
      }
    };

    loadOptions();
  }, [isOpen]);

  const handleSubmit = async () => {
    setError("");

    if (!farmerId) {
      setError("Please select a farmer");
      return;
    }
    if (!productId) {
      setError("Please select a product");
      return;
    }
    const qty = parseFloat(quantity);
    const price = parseFloat(wishedPrice);
    if (!qty || qty <= 0) {
      setError("Please enter a valid quantity");
      return;
    }
    if (!price || price <= 0) {
      setError("Please enter a valid wished price");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await submissionService.adminCreateSubmission({
        farmerId,
        productId,
        quantity: qty,
        wishedPrice: price,
      });

      if (!response.success) {
        setError(response.message || "Failed to create submission");
        return;
      }

      toast.success("Submission created successfully");
      onCreated();
      onClose();
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Failed to create submission"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Submission</DialogTitle>
          <DialogDescription>
            Create a submission on behalf of a farmer (e.g. reported by
            phone).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="add-submission-farmer">Farmer</Label>
            <select
              id="add-submission-farmer"
              className="border-input w-full rounded border bg-transparent px-3 py-2 text-sm"
              value={farmerId}
              disabled={loadingOptions || isSubmitting}
              onChange={(e) => setFarmerId(e.target.value)}
            >
              <option value="">Select a farmer...</option>
              {farmers.map((farmer) => (
                <option key={farmer.id} value={farmer.id}>
                  {farmer.name || farmer.phone || farmer.email || farmer.id}
                  {farmer.phone ? ` (${farmer.phone})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="add-submission-product">Product</Label>
            <select
              id="add-submission-product"
              className="border-input w-full rounded border bg-transparent px-3 py-2 text-sm"
              value={productId}
              disabled={loadingOptions || isSubmitting}
              onChange={(e) => setProductId(e.target.value)}
            >
              <option value="">Select a product...</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.productName}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="add-submission-quantity">Quantity</Label>
              <Input
                id="add-submission-quantity"
                type="number"
                min="0"
                step="0.01"
                value={quantity}
                disabled={isSubmitting}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g. 100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-submission-price">
                Wished Price (RWF)
              </Label>
              <Input
                id="add-submission-price"
                type="number"
                min="0"
                step="0.01"
                value={wishedPrice}
                disabled={isSubmitting}
                onChange={(e) => setWishedPrice(e.target.value)}
                placeholder="e.g. 500"
              />
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || loadingOptions}
          >
            {isSubmitting ? "Creating..." : "Create Submission"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
