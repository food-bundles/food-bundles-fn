"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import {
  customerTypeService,
  CustomerType,
  CustomerTypeUsageProduct,
} from "@/app/services/customerTypeService";

interface SwapPricingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

export function SwapPricingDialog({
  open,
  onOpenChange,
  onComplete,
}: SwapPricingDialogProps) {
  const [customerTypes, setCustomerTypes] = useState<CustomerType[]>([]);
  const [products, setProducts] = useState<CustomerTypeUsageProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sourceId, setSourceId] = useState<string>("");
  const [targetId, setTargetId] = useState<string>("");
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [step, setStep] = useState<"select" | "preview" | "success">("select");

  useEffect(() => {
    if (open) {
      fetchData();
      setSourceId("");
      setTargetId("");
      setSelectedProductIds([]);
      setStep("select");
    }
  }, [open]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [typesResponse, usageResponse] = await Promise.all([
        customerTypeService.getAllCustomerTypes(),
        customerTypeService.getCustomerTypeUsage(),
      ]);
      setCustomerTypes(typesResponse.data || []);
      setProducts(usageResponse.data?.products || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  const sourceProducts = products.filter((p) =>
    p.customerTypePrices.some(
      (ctp) => ctp.customerType.id === sourceId
    )
  );

  const toggleProduct = (productId: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const selectAllProducts = () => {
    setSelectedProductIds(sourceProducts.map((p) => p.id));
  };

  const clearAllProducts = () => {
    setSelectedProductIds([]);
  };

  const handleApplySwap = async () => {
    if (!sourceId || !targetId || selectedProductIds.length === 0) return;

    try {
      setIsSubmitting(true);
      const result = await customerTypeService.swapCustomerTypePricing({
        sourceCustomerTypeId: sourceId,
        targetCustomerTypeId: targetId,
        productIds: selectedProductIds,
      });
      toast.success(result.message);
      setStep("success");
      setTimeout(() => {
        onComplete();
      }, 1500);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to swap pricing");
    } finally {
      setIsSubmitting(false);
    }
  };

  const sourceTypeName = customerTypes.find((ct) => ct.id === sourceId)?.name || "";
  const targetTypeName = customerTypes.find((ct) => ct.id === targetId)?.name || "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Swap Customer Type Pricing</DialogTitle>
          <DialogDescription>
            Copy pricing from one customer type to another across selected products.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-green-600" />
            <span className="ml-2 text-sm text-gray-500">Loading...</span>
          </div>
        ) : step === "success" ? (
          <div className="flex flex-col items-center justify-center py-12">
            <CheckCircle2 className="h-12 w-12 text-green-600 mb-4" />
            <p className="text-lg font-medium text-gray-900">Pricing Copied Successfully</p>
            <p className="text-sm text-gray-500 mt-1">
              {sourceTypeName} pricing has been copied to {targetTypeName}
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-4">
            {/* Source and Target Selection */}
            <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-end">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Source (copy FROM)</Label>
                <select
                  value={sourceId}
                  onChange={(e) => {
                    setSourceId(e.target.value);
                    setSelectedProductIds([]);
                  }}
                  className="w-full p-2 border rounded-md text-sm bg-white"
                >
                  <option value="">Select source</option>
                  {customerTypes.map((ct) => (
                    <option key={ct.id} value={ct.id}>
                      {ct.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pb-2">
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Target (copy TO)</Label>
                <select
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  className="w-full p-2 border rounded-md text-sm bg-white"
                >
                  <option value="">Select target</option>
                  {customerTypes
                    .filter((ct) => ct.id !== sourceId)
                    .map((ct) => (
                      <option key={ct.id} value={ct.id}>
                        {ct.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* Product Selection */}
            {sourceId && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">
                    Products ({sourceProducts.length} available)
                  </Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={selectAllProducts}
                      className="text-xs h-7"
                    >
                      Select All
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={clearAllProducts}
                      className="text-xs h-7"
                    >
                      Clear All
                    </Button>
                  </div>
                </div>

                <div className="border rounded-lg max-h-60 overflow-y-auto">
                  {sourceProducts.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-500">
                      No products found for this customer type
                    </div>
                  ) : (
                    sourceProducts.map((product) => {
                      const sourceCtp = product.customerTypePrices.find(
                        (ctp) => ctp.customerType.id === sourceId
                      );
                      const targetCtp = product.customerTypePrices.find(
                        (ctp) => ctp.customerType.id === targetId
                      );

                      return (
                        <label
                          key={product.id}
                          className="flex items-center gap-3 p-3 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
                        >
                          <Checkbox
                            checked={selectedProductIds.includes(product.id)}
                            onCheckedChange={() => toggleProduct(product.id)}
                          />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">
                              {product.productName}
                            </div>
                            <div className="text-xs text-gray-500 flex gap-4 mt-0.5">
                              <span>
                                {sourceTypeName}: {sourceCtp?.price.toLocaleString() || "—"}
                              </span>
                              {targetCtp && (
                                <span>
                                  Current {targetTypeName}: {targetCtp.price.toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>
                          {targetCtp && sourceCtp && (
                            <Badge variant="outline" className="text-xs">
                              {targetCtp.price < sourceCtp.price ? "↓" : "↑"}{" "}
                              {Math.abs(targetCtp.price - sourceCtp.price).toLocaleString()}
                            </Badge>
                          )}
                        </label>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* Preview */}
            {sourceId && targetId && selectedProductIds.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm font-medium text-blue-800">
                  Preview: {selectedProductIds.length} product(s) will be updated
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  {sourceTypeName} pricing will be copied to {targetTypeName}
                </p>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            {step === "success" ? "Close" : "Cancel"}
          </Button>
          {step === "select" && (
            <Button
              onClick={handleApplySwap}
              disabled={!sourceId || !targetId || selectedProductIds.length === 0 || isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Applying...
                </>
              ) : (
                "Apply Copy"
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
