/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { orderService } from "@/app/services/orderService";
import createAxiosClient from "@/app/hooks/axiosClient";
import { toast } from "sonner";
import { Order } from "./order-colmuns";
import { Trash2, Plus, Search, Loader2 } from "lucide-react";

interface EditOrderModalProps {
  open: boolean;
  onClose: () => void;
  order: Order | null;
  onSaved: () => void;
}

interface EditableItem {
  tempId: string;
  orderItemId?: string;
  productId?: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  unit: string;
  images?: string[];
  category?: string;
  isNew?: boolean;
}

interface ProductSearchResult {
  id: string;
  productName: string;
  unitPrice: number;
  unit: string;
  images: string[];
  category?: { name: string };
  quantity: number;
  status: string;
}

export function EditOrderModal({ open, onClose, order, onSaved }: EditOrderModalProps) {
  const [items, setItems] = useState<EditableItem[]>([]);
  const [notes, setNotes] = useState("");
  const [billingName, setBillingName] = useState("");
  const [billingPhone, setBillingPhone] = useState("");
  const [billingEmail, setBillingEmail] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [saving, setSaving] = useState(false);
  const [showProductSearch, setShowProductSearch] = useState(false);
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [productSearchResults, setProductSearchResults] = useState<ProductSearchResult[]>([]);
  const [searchingProducts, setSearchingProducts] = useState(false);

  useEffect(() => {
    if (order && open) {
      const editableItems: EditableItem[] = (order.orderItems || []).map((item: any) => ({
        tempId: item.id,
        orderItemId: item.id,
        productId: item.product?.id || item.productId || undefined,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        unit: item.unit || "unit",
        images: item.images || item.product?.images || [],
        category: item.category || item.product?.category?.name || "",
        isNew: false,
      }));
      setItems(editableItems);
      setNotes(order.notes || "");
      setBillingName(order.billingName || "");
      setBillingPhone(order.billingPhone || "");
      setBillingEmail(order.billingEmail || "");
      setBillingAddress(order.billingAddress || "");
    }
  }, [order, open]);

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const deliveryFee = (order as any)?.deliveryFee || 0;
  const packagingFee = (order as any)?.packagingFee || 0;
  const total = subtotal + deliveryFee + packagingFee;

  const updateItemQuantity = (tempId: string, quantity: number) => {
    if (quantity < 1) return;
    setItems((prev) =>
      prev.map((item) => (item.tempId === tempId ? { ...item, quantity } : item))
    );
  };

  const updateItemPrice = (tempId: string, unitPrice: number) => {
    if (unitPrice < 0) return;
    setItems((prev) =>
      prev.map((item) => (item.tempId === tempId ? { ...item, unitPrice } : item))
    );
  };

  const removeItem = (tempId: string) => {
    setItems((prev) => prev.filter((item) => item.tempId !== tempId));
  };

  const searchProducts = async (query: string) => {
    if (!query.trim()) {
      setProductSearchResults([]);
      return;
    }
    try {
      setSearchingProducts(true);
      const axiosClient = createAxiosClient();
      const response = await axiosClient.get("/products", {
        params: { search: query, status: "ACTIVE", limit: 10 },
      });
      const products = response.data?.data || response.data?.products || [];
      setProductSearchResults(products);
    } catch (error) {
      console.error("Product search failed:", error);
      setProductSearchResults([]);
    } finally {
      setSearchingProducts(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (showProductSearch) {
        searchProducts(productSearchQuery);
      }
    }, 400);
    return () => clearTimeout(timeout);
  }, [productSearchQuery, showProductSearch]);

  const addProduct = (product: ProductSearchResult) => {
    // Check if already added
    const exists = items.find((i) => i.productId === product.id);
    if (exists) {
      toast.warning(`${product.productName} is already in the order`);
      return;
    }

    const newItem: EditableItem = {
      tempId: `new_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      productId: product.id,
      productName: product.productName,
      quantity: 1,
      unitPrice: product.unitPrice,
      unit: product.unit,
      images: product.images,
      category: product.category?.name || "",
      isNew: true,
    };
    setItems((prev) => [...prev, newItem]);
    setShowProductSearch(false);
    setProductSearchQuery("");
    setProductSearchResults([]);
    toast.success(`${product.productName} added to order`);
  };

  const handleSave = async () => {
    if (!order) return;

    if (items.length === 0) {
      toast.error("Order must have at least one item");
      return;
    }

    try {
      setSaving(true);

      const editData = {
        items: items.map((item) => ({
          orderItemId: item.isNew ? undefined : item.orderItemId,
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
        notes,
        billingName,
        billingPhone,
        billingEmail,
        billingAddress,
      };

      await orderService.editOrder(order.id, editData);
      toast.success("Order updated successfully");
      onSaved();
      onClose();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update order");
    } finally {
      setSaving(false);
    }
  };

  if (!order) return null;

  const canEdit = ["PENDING", "CONFIRMED"].includes(order.status);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold flex items-center gap-2">
            Edit Order – {order.orderNumber}
            {!canEdit && (
              <Badge className="bg-orange-100 text-orange-700 text-xs">
                Read Only
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {!canEdit && (
          <div className="bg-orange-50 border border-orange-200 rounded-md p-3 text-sm text-orange-800">
            This order cannot be edited because its status is <strong>{order.status}</strong>.
            Only <strong>PENDING</strong> or <strong>CONFIRMED</strong> orders can be edited.
          </div>
        )}

        <div className="space-y-6">
          {/* Order Items */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">
                Order Items ({items.length})
              </h3>
              {canEdit && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowProductSearch(!showProductSearch)}
                  className="h-8 text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Item
                </Button>
              )}
            </div>

            {/* Product Search */}
            {showProductSearch && canEdit && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg border">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    value={productSearchQuery}
                    onChange={(e) => setProductSearchQuery(e.target.value)}
                    placeholder="Search products by name..."
                    className="pl-9 text-sm"
                    autoFocus
                  />
                </div>
                {searchingProducts && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Searching...
                  </div>
                )}
                {productSearchResults.length > 0 && (
                  <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
                    {productSearchResults.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between p-2 hover:bg-white rounded cursor-pointer border border-transparent hover:border-gray-200"
                        onClick={() => addProduct(product)}
                      >
                        <div className="flex items-center gap-2">
                          {product.images?.[0] && (
                            <img
                              src={product.images[0]}
                              alt={product.productName}
                              className="w-8 h-8 object-cover rounded"
                            />
                          )}
                          <div>
                            <p className="text-sm font-medium">{product.productName}</p>
                            <p className="text-xs text-gray-500">
                              Stock: {product.quantity} {product.unit}
                            </p>
                          </div>
                        </div>
                        <span className="text-sm font-medium text-green-600">
                          {product.unitPrice.toLocaleString()} RWF
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                {productSearchQuery && !searchingProducts && productSearchResults.length === 0 && (
                  <p className="text-xs text-gray-500 mt-2">No products found</p>
                )}
              </div>
            )}

            {/* Items List */}
            <div className="space-y-2">
              {items.length === 0 ? (
                <div className="text-center py-6 text-sm text-gray-500 border rounded-lg">
                  No items in this order. Click &quot;Add Item&quot; to add products.
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.tempId}
                    className={`flex items-center gap-3 p-3 rounded-lg border ${
                      item.isNew ? "bg-green-50 border-green-200" : "bg-white"
                    }`}
                  >
                    {item.images?.[0] && (
                      <img
                        src={item.images[0]}
                        alt={item.productName}
                        className="w-10 h-10 object-cover rounded"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.productName}</p>
                      <p className="text-xs text-gray-500">
                        {item.category}
                        {item.isNew && (
                          <Badge className="ml-2 bg-green-100 text-green-700 text-[10px] px-1">
                            New
                          </Badge>
                        )}
                      </p>
                    </div>

                    {/* Quantity */}
                    <div className="flex flex-col items-center">
                      <Label className="text-[10px] text-gray-500 mb-1">Qty</Label>
                      <Input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) =>
                          updateItemQuantity(item.tempId, parseInt(e.target.value) || 1)
                        }
                        className="w-16 h-8 text-center text-sm"
                        disabled={!canEdit}
                      />
                    </div>

                    {/* Unit Price */}
                    <div className="flex flex-col items-center">
                      <Label className="text-[10px] text-gray-500 mb-1">Price</Label>
                      <Input
                        type="number"
                        min={0}
                        value={item.unitPrice}
                        onChange={(e) =>
                          updateItemPrice(item.tempId, parseFloat(e.target.value) || 0)
                        }
                        className="w-24 h-8 text-center text-sm"
                        disabled={!canEdit}
                      />
                    </div>

                    {/* Subtotal */}
                    <div className="w-24 text-right">
                      <p className="text-sm font-medium text-green-600">
                        {(item.quantity * item.unitPrice).toLocaleString()} RWF
                      </p>
                    </div>

                    {/* Remove */}
                    {canEdit && (
                      <button
                        onClick={() => removeItem(item.tempId)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Customer Info */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Customer Information</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs mb-1">Name</Label>
                <Input
                  value={billingName}
                  onChange={(e) => setBillingName(e.target.value)}
                  className="text-sm"
                  disabled={!canEdit}
                />
              </div>
              <div>
                <Label className="text-xs mb-1">Phone</Label>
                <Input
                  value={billingPhone}
                  onChange={(e) => setBillingPhone(e.target.value)}
                  className="text-sm"
                  disabled={!canEdit}
                />
              </div>
              <div>
                <Label className="text-xs mb-1">Email</Label>
                <Input
                  value={billingEmail}
                  onChange={(e) => setBillingEmail(e.target.value)}
                  className="text-sm"
                  disabled={!canEdit}
                />
              </div>
              <div>
                <Label className="text-xs mb-1">Address</Label>
                <Input
                  value={billingAddress}
                  onChange={(e) => setBillingAddress(e.target.value)}
                  className="text-sm"
                  disabled={!canEdit}
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label className="text-xs mb-1">Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Order notes..."
              className="text-sm"
              disabled={!canEdit}
            />
          </div>

          {/* Price Summary */}
          <div className="bg-gray-50 p-4 rounded-lg border space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal ({items.length} items)</span>
              <span className="font-medium">{subtotal.toLocaleString()} RWF</span>
            </div>
            {deliveryFee > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Delivery Fee</span>
                <span className="font-medium">{deliveryFee.toLocaleString()} RWF</span>
              </div>
            )}
            {packagingFee > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Packaging Fee</span>
                <span className="font-medium">{packagingFee.toLocaleString()} RWF</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t">
              <span className="text-sm font-semibold">Total</span>
              <span className="text-sm font-bold text-green-600">
                {total.toLocaleString()} RWF
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4">
          <Button size="sm" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {canEdit && (
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving || items.length === 0}
              className="bg-green-600 hover:bg-green-700"
            >
              {saving && <Loader2 className="h-3 w-3 animate-spin mr-2" />}
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
