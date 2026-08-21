/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { restaurantService } from "@/app/services/restaurantService";
import { productService } from "@/app/services/productService";
import { paymentMethodService } from "@/app/services/paymentMethodService";
import { checkoutService } from "@/app/services/checkoutService";
import { toast } from "sonner";
import {
  Store,
  Search,
  Plus,
  Trash2,
  Loader2,
  CreditCard,
  Smartphone,
  Banknote,
  Wallet,
} from "lucide-react";

interface Restaurant {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

interface Product {
  id: string;
  productName: string;
  unitPrice: number;
  unit: string;
  images: string[];
  quantity: number;
  status: string;
  category?: { name: string };
}

interface PaymentMethodOption {
  id: string;
  name: string;
  description?: string;
}

interface OrderItem {
  tempId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  unit: string;
  images: string[];
  stock: number;
}

interface CreateAdminOrderModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const paymentMethodLabels: Record<string, string> = {
  MOBILE_MONEY: "Mobile Money (MoMo)",
  CARD: "Card Payment",
  BANK_TRANSFER: "Bank Transfer",
  CASH: "Prepaid (Wallet)",
  VOUCHER: "Voucher",
};

const paymentMethodIcons: Record<string, React.ReactNode> = {
  MOBILE_MONEY: <Smartphone className="w-4 h-4" />,
  CARD: <CreditCard className="w-4 h-4" />,
  BANK_TRANSFER: <Banknote className="w-4 h-4" />,
  CASH: <Wallet className="w-4 h-4" />,
  VOUCHER: <Wallet className="w-4 h-4" />,
};

export function CreateAdminOrderModal({
  open,
  onClose,
  onCreated,
}: CreateAdminOrderModalProps) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loadingRestaurants, setLoadingRestaurants] = useState(false);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState("");
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [productResults, setProductResults] = useState<Product[]>([]);
  const [searchingProducts, setSearchingProducts] = useState(false);
  const [showProductSearch, setShowProductSearch] = useState(false);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodOption[]>([]);
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [showVoucherInput, setShowVoucherInput] = useState(false);
  const [voucherCode, setVoucherCode] = useState("");
  const [saving, setSaving] = useState(false);

  // Load restaurants on open
  useEffect(() => {
    if (open) {
      fetchRestaurants();
      fetchPaymentMethods();
      // Reset state
      setSelectedRestaurantId("");
      setItems([]);
      setSelectedPaymentMethod("");
      setPhoneNumber("");
      setNotes("");
      setVoucherCode("");
      setShowVoucherInput(false);
      setProductSearchQuery("");
      setProductResults([]);
      setShowProductSearch(false);
    }
  }, [open]);

  const fetchRestaurants = async () => {
    try {
      setLoadingRestaurants(true);
      const response = await restaurantService.getAllRestaurants({
        limit: 100,
        status: "ACTIVE",
      });
      const data = response.data || response.restaurants || [];
      setRestaurants(data);
    } catch (error) {
      console.error("Failed to load restaurants:", error);
      toast.error("Failed to load restaurants");
    } finally {
      setLoadingRestaurants(false);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      setLoadingPaymentMethods(true);
      const response = await paymentMethodService.getActivePaymentMethods();
      if (response.data) {
        setPaymentMethods(response.data);
      }
    } catch (error) {
      console.error("Failed to load payment methods:", error);
    } finally {
      setLoadingPaymentMethods(false);
    }
  };

  // Debounced product search
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (showProductSearch && productSearchQuery.trim()) {
        searchProducts(productSearchQuery);
      } else if (!productSearchQuery.trim()) {
        setProductResults([]);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [productSearchQuery, showProductSearch]);

  const searchProducts = async (query: string) => {
    try {
      setSearchingProducts(true);
      const response = await productService.getAllProducts({
        search: query,
        limit: 10,
      });
      const products = (response?.data || []).filter(
        (p: Product) => p.status === "ACTIVE"
      );
      setProductResults(products);
    } catch (error) {
      console.error("Product search failed:", error);
      setProductResults([]);
    } finally {
      setSearchingProducts(false);
    }
  };

  const addProductToOrder = (product: Product) => {
    const exists = items.find((i) => i.productId === product.id);
    if (exists) {
      toast.warning(`${product.productName} is already added`);
      return;
    }
    setItems((prev) => [
      ...prev,
      {
        tempId: `item_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        productId: product.id,
        productName: product.productName,
        quantity: 1,
        unitPrice: product.unitPrice,
        unit: product.unit,
        images: product.images,
        stock: product.quantity,
      },
    ]);
    setShowProductSearch(false);
    setProductSearchQuery("");
    setProductResults([]);
  };

  const updateQuantity = (tempId: string, quantity: number) => {
    if (quantity < 1) return;
    const item = items.find((i) => i.tempId === tempId);
    if (item && quantity > item.stock) {
      toast.error(`Only ${item.stock} ${item.unit} available in stock`);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.tempId === tempId ? { ...i, quantity } : i))
    );
  };

  const removeItem = (tempId: string) => {
    setItems((prev) => prev.filter((i) => i.tempId !== tempId));
  };

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  const handlePaymentMethodChange = (methodId: string) => {
    setSelectedPaymentMethod(methodId);
    const method = paymentMethods.find((m) => m.id === methodId);
    setShowVoucherInput(method?.name.toUpperCase() === "VOUCHER");
  };

  const handleCreateOrder = async () => {
    if (!selectedRestaurantId) {
      toast.error("Please select a restaurant");
      return;
    }
    if (items.length === 0) {
      toast.error("Please add at least one product");
      return;
    }
    if (!selectedPaymentMethod) {
      toast.error("Please select a payment method");
      return;
    }

    const method = paymentMethods.find((m) => m.id === selectedPaymentMethod);
    if (!method) {
      toast.error("Invalid payment method");
      return;
    }

    if (method.name.toUpperCase() === "MOBILE_MONEY" && !phoneNumber.trim()) {
      toast.error("Mobile money payment requires a phone number");
      return;
    }

    if (method.name.toUpperCase() === "VOUCHER" && !voucherCode.trim()) {
      toast.error("Voucher payment requires a voucher code");
      return;
    }

    try {
      setSaving(true);
      const payload: any = {
        restaurantId: selectedRestaurantId,
        products: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        paymentMethod: method.name.toUpperCase(),
        notes: notes || undefined,
      };

      if (phoneNumber) payload.phoneNumber = phoneNumber;
      if (method.name.toUpperCase() === "VOUCHER") payload.voucherCode = voucherCode;

      const result = await checkoutService.createAdminOrder(payload);

      if (result.success) {
        // Handle redirect if payment needs redirect
        if (result.data?.requiresRedirect && result.data?.redirectUrl) {
          toast.success("Order created. Opening payment link...");
          window.open(result.data.redirectUrl, "_blank");
        } else if (result.data?.transferDetails) {
          toast.success("Order created. Bank transfer details generated.");
        } else {
          toast.success("Order created successfully");
        }
        onCreated();
        onClose();
      } else {
        toast.error(result.message || "Failed to create order");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.error || error?.response?.data?.message || "Failed to create order");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold flex items-center gap-2">
            <Store className="h-4 w-4 text-green-600" />
            Create Order on Behalf of Restaurant
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Step 1: Select Restaurant */}
          <div>
            <h3 className="text-sm font-semibold mb-3">1. Select Restaurant</h3>
            <Select
              value={selectedRestaurantId}
              onValueChange={setSelectedRestaurantId}
              disabled={loadingRestaurants}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={loadingRestaurants ? "Loading restaurants..." : "Choose a restaurant..."} />
              </SelectTrigger>
              <SelectContent>
                {restaurants.map((restaurant) => (
                  <SelectItem key={restaurant.id} value={restaurant.id}>
                    {restaurant.name}
                    {restaurant.phone ? ` - ${restaurant.phone}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Step 2: Add Products */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">2. Add Products</h3>
              {selectedRestaurantId && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowProductSearch(!showProductSearch)}
                  className="h-8 text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Product
                </Button>
              )}
            </div>

            {!selectedRestaurantId && (
              <p className="text-sm text-gray-500 border rounded-lg p-4 text-center bg-gray-50">
                Select a restaurant first to add products
              </p>
            )}

            {showProductSearch && selectedRestaurantId && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg border">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    value={productSearchQuery}
                    onChange={(e) => setProductSearchQuery(e.target.value)}
                    placeholder="Search products..."
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
                {productResults.length > 0 && (
                  <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
                    {productResults.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between p-2 hover:bg-white rounded cursor-pointer border border-transparent hover:border-gray-200"
                        onClick={() => addProductToOrder(product)}
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
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-green-600">
                            {product.unitPrice.toLocaleString()} RWF
                          </span>
                          <Plus className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {productSearchQuery && !searchingProducts && productResults.length === 0 && (
                  <p className="text-xs text-gray-500 mt-2">No products found</p>
                )}
              </div>
            )}

            {/* Items list */}
            {items.length > 0 && (
              <div className="space-y-2">
                {items.map((item) => (
                  <div
                    key={item.tempId}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-white"
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
                        {item.unitPrice.toLocaleString()} RWF / {item.unit}
                      </p>
                    </div>
                    <div className="flex flex-col items-center">
                      <Label className="text-[10px] text-gray-500 mb-1">Qty</Label>
                      <Input
                        type="number"
                        min={1}
                        max={item.stock}
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.tempId, parseInt(e.target.value) || 1)}
                        className="w-16 h-8 text-center text-sm"
                      />
                    </div>
                    <div className="w-24 text-right">
                      <p className="text-sm font-medium text-green-600">
                        {(item.quantity * item.unitPrice).toLocaleString()} RWF
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(item.tempId)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Step 3: Payment Method */}
          <div>
            <h3 className="text-sm font-semibold mb-3">3. Payment Method</h3>
            {loadingPaymentMethods ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-green-600 mr-2" />
                <span className="text-sm text-gray-500">Loading payment methods...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {paymentMethods.map((method) => (
                  <label
                    key={method.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedPaymentMethod === method.id
                        ? "border-green-500 bg-green-50 ring-1 ring-green-200"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={selectedPaymentMethod === method.id}
                      onChange={() => handlePaymentMethodChange(method.id)}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                    />
                    <div className={`p-1.5 rounded ${
                      selectedPaymentMethod === method.id
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}>
                      {paymentMethodIcons[method.name.toUpperCase()] || <CreditCard className="w-4 h-4" />}
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {paymentMethodLabels[method.name.toUpperCase()] || method.name}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Mobile money phone + voucher inputs */}
          {selectedPaymentMethod &&
            paymentMethods.find((m) => m.id === selectedPaymentMethod)?.name.toUpperCase() === "MOBILE_MONEY" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs mb-1">Phone Number</Label>
                  <Input
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="078XXXXXXX"
                    className="text-sm"
                  />
                </div>
              </div>
            )}

          {showVoucherInput && (
            <div>
              <Label className="text-xs mb-1">Voucher Code</Label>
              <Input
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value)}
                placeholder="Enter voucher code"
                className="text-sm"
              />
            </div>
          )}

          {/* Notes */}
          <div>
            <Label className="text-xs mb-1">Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes for this order..."
              className="text-sm"
            />
          </div>

          {/* Summary */}
          <div className="bg-gray-50 p-4 rounded-lg border">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold">
                Total ({items.length} items)
              </span>
              <span className="text-lg font-bold text-green-600">
                {subtotal.toLocaleString()} RWF
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4">
          <Button size="sm" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleCreateOrder}
            disabled={saving}
            className="bg-green-600 hover:bg-green-700"
          >
            {saving && <Loader2 className="h-3 w-3 animate-spin mr-2" />}
            {saving ? "Creating Order..." : "Create Order"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}