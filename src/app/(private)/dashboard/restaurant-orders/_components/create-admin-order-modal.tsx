/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef } from "react";
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
  Wallet,
  Check,
  X,
  ShieldCheck,
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

// A restaurant "voucher" is an unlocked loan session with credit left
interface RestaurantVoucher {
  id: string;
  rrn: string;
  approvedAmount: number;
  amountUsed: number;
  availableCredit: number;
  dueDate?: string | null;
  status: string;
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
  CASH: "Prepaid (Wallet)",
  VOUCHER: "Voucher",
};

const paymentMethodIcons: Record<string, React.ReactNode> = {
  MOBILE_MONEY: <Smartphone className="w-4 h-4" />,
  CARD: <CreditCard className="w-4 h-4" />,
  CASH: <Wallet className="w-4 h-4" />,
  VOUCHER: <Wallet className="w-4 h-4" />,
};

// Not yet implemented — hidden from the admin order flow
const HIDDEN_PAYMENT_METHODS = ["BANK_TRANSFER"];

// Restaurant must confirm these with an OTP sent to its phone
const OTP_PAYMENT_METHODS = ["VOUCHER", "CASH"];

const PRODUCTS_PAGE_SIZE = 20;
const OTP_RESEND_SECONDS = 60;

export function CreateAdminOrderModal({
  open,
  onClose,
  onCreated,
}: CreateAdminOrderModalProps) {
  // Restaurant search
  const [restaurantQuery, setRestaurantQuery] = useState("");
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loadingRestaurants, setLoadingRestaurants] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);

  // Product browsing (search + infinite scroll)
  const [productQuery, setProductQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [productPage, setProductPage] = useState(1);
  const [productTotalPages, setProductTotalPages] = useState(1);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const productRequestId = useRef(0);

  const [items, setItems] = useState<OrderItem[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodOption[]>([]);
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [loanSessionRrn, setLoanSessionRrn] = useState("");
  const [vouchers, setVouchers] = useState<RestaurantVoucher[]>([]);
  const [loadingVouchers, setLoadingVouchers] = useState(false);

  // OTP confirmation for voucher / prepaid
  const [otpSent, setOtpSent] = useState(false);
  const [otpPhone, setOtpPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [resendIn, setResendIn] = useState(0);

  const [saving, setSaving] = useState(false);

  const selectedMethodName =
    paymentMethods.find((m) => m.id === selectedPaymentMethod)?.name.toUpperCase() || "";
  const requiresOtp = OTP_PAYMENT_METHODS.includes(selectedMethodName);

  // Reset state on open
  useEffect(() => {
    if (open) {
      fetchPaymentMethods();
      setRestaurantQuery("");
      setSelectedRestaurant(null);
      setItems([]);
      setSelectedPaymentMethod("");
      setPhoneNumber("");
      setNotes("");
      setLoanSessionRrn("");
      setProductQuery("");
      resetOtp();
    }
  }, [open]);

  // Debounced restaurant search
  useEffect(() => {
    if (!open || selectedRestaurant) return;
    const timeout = setTimeout(() => fetchRestaurants(restaurantQuery), 300);
    return () => clearTimeout(timeout);
  }, [restaurantQuery, open, selectedRestaurant]);

  // Debounced product search — reloads from page 1
  useEffect(() => {
    if (!open || !selectedRestaurant) return;
    const timeout = setTimeout(() => fetchProducts(1, productQuery), 300);
    return () => clearTimeout(timeout);
  }, [productQuery, open, selectedRestaurant]);

  // Load the restaurant's usable vouchers when paying by voucher
  useEffect(() => {
    setLoanSessionRrn("");
    setVouchers([]);
    if (open && selectedRestaurant && selectedMethodName === "VOUCHER") {
      fetchVouchers(selectedRestaurant.id);
    }
  }, [open, selectedRestaurant?.id, selectedMethodName]);

  // Any change to what's being paid invalidates a previously sent OTP
  useEffect(() => {
    resetOtp();
  }, [
    selectedRestaurant?.id,
    selectedPaymentMethod,
    loanSessionRrn,
    items.map((i) => `${i.productId}:${i.quantity}`).join(","),
  ]);

  // Resend countdown
  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendIn]);

  const resetOtp = () => {
    setOtpSent(false);
    setOtpPhone("");
    setOtp("");
    setResendIn(0);
  };

  const fetchRestaurants = async (search: string) => {
    try {
      setLoadingRestaurants(true);
      const response = await restaurantService.getAllRestaurants({
        limit: 20,
        search: search.trim() || undefined,
      });
      const payload = response?.data;
      const data = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.restaurants)
          ? payload.restaurants
          : Array.isArray(payload?.data)
            ? payload.data
            : [];
      setRestaurants(data);
    } catch (error) {
      console.error("Failed to load restaurants:", error);
      toast.error("Failed to load restaurants");
    } finally {
      setLoadingRestaurants(false);
    }
  };

  const fetchVouchers = async (restaurantId: string) => {
    try {
      setLoadingVouchers(true);
      // Backend returns only usable sessions (active, unlocked, credit left)
      const response = await checkoutService.getAdminOrderLoanSessions(restaurantId);
      setVouchers(response.success ? response.data || [] : []);
    } catch (error) {
      console.error("Failed to load vouchers:", error);
      toast.error("Failed to load restaurant vouchers");
    } finally {
      setLoadingVouchers(false);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      setLoadingPaymentMethods(true);
      const response = await paymentMethodService.getActivePaymentMethods();
      if (response.data) {
        setPaymentMethods(
          response.data.filter(
            (m: PaymentMethodOption) =>
              !HIDDEN_PAYMENT_METHODS.includes(m.name.toUpperCase())
          )
        );
      }
    } catch (error) {
      console.error("Failed to load payment methods:", error);
    } finally {
      setLoadingPaymentMethods(false);
    }
  };

  const fetchProducts = async (page: number, search: string) => {
    const requestId = ++productRequestId.current;
    try {
      setLoadingProducts(true);
      const response = await productService.getAllProducts({
        search: search.trim() || undefined,
        page,
        limit: PRODUCTS_PAGE_SIZE,
      });
      // Ignore responses from searches that have since been superseded
      if (requestId !== productRequestId.current) return;
      const pageProducts = (response?.data || []).filter(
        (p: Product) => p.status === "ACTIVE"
      );
      setProducts((prev) => (page === 1 ? pageProducts : [...prev, ...pageProducts]));
      setProductPage(page);
      setProductTotalPages(response?.pagination?.totalPages || 1);
    } catch (error) {
      console.error("Failed to load products:", error);
      if (page === 1) setProducts([]);
    } finally {
      if (requestId === productRequestId.current) setLoadingProducts(false);
    }
  };

  const handleProductListScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
    if (nearBottom && !loadingProducts && productPage < productTotalPages) {
      fetchProducts(productPage + 1, productQuery);
    }
  };

  const selectRestaurant = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setItems([]);
  };

  const clearRestaurant = () => {
    setSelectedRestaurant(null);
    setRestaurantQuery("");
    setItems([]);
    setProducts([]);
    setProductQuery("");
  };

  const addProductToOrder = (product: Product) => {
    const existing = items.find((i) => i.productId === product.id);
    if (existing) {
      updateQuantity(existing.tempId, existing.quantity + 1);
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

  // A loan session must cover the whole order — no split payment
  const selectedVoucher = vouchers.find((v) => v.rrn === loanSessionRrn);
  const voucherShortfall =
    selectedMethodName === "VOUCHER" && selectedVoucher && selectedVoucher.availableCredit < subtotal
      ? selectedVoucher.availableCredit
      : null;

  const validateBasics = () => {
    if (!selectedRestaurant) {
      toast.error("Please select a restaurant");
      return false;
    }
    if (items.length === 0) {
      toast.error("Please add at least one product");
      return false;
    }
    if (!selectedPaymentMethod) {
      toast.error("Please select a payment method");
      return false;
    }
    if (selectedMethodName === "MOBILE_MONEY" && !phoneNumber.trim()) {
      toast.error("Mobile money payment requires a phone number");
      return false;
    }
    if (selectedMethodName === "VOUCHER" && !loanSessionRrn) {
      toast.error(
        vouchers.length === 0
          ? "No voucher found on this restaurant"
          : "Please select a voucher"
      );
      return false;
    }
    if (voucherShortfall !== null) {
      toast.error("Voucher credit is not enough for this order");
      return false;
    }
    return true;
  };

  const handleSendOtp = async () => {
    if (!validateBasics()) return;
    try {
      setSendingOtp(true);
      const result = await checkoutService.requestAdminOrderOTP({
        restaurantId: selectedRestaurant!.id,
        products: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        paymentMethod: selectedMethodName,
        loanSessionRrn: selectedMethodName === "VOUCHER" ? loanSessionRrn.trim() : undefined,
      });
      if (result.success) {
        setOtpSent(true);
        setOtpPhone(result.data?.phone || "");
        setOtp("");
        setResendIn(OTP_RESEND_SECONDS);
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } finally {
      setSendingOtp(false);
    }
  };

  const handleCreateOrder = async () => {
    if (!validateBasics()) return;

    if (requiresOtp && (!otpSent || otp.trim().length !== 6)) {
      toast.error("Enter the 6-digit OTP the restaurant received");
      return;
    }

    try {
      setSaving(true);
      const payload: any = {
        restaurantId: selectedRestaurant!.id,
        products: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        paymentMethod: selectedMethodName,
        notes: notes || undefined,
      };

      if (phoneNumber) payload.phoneNumber = phoneNumber;
      if (selectedMethodName === "VOUCHER") payload.loanSessionRrn = loanSessionRrn.trim();
      if (requiresOtp) payload.otp = otp.trim();

      const result = await checkoutService.createAdminOrder(payload);

      if (result.success) {
        if (result.data?.requiresRedirect && result.data?.redirectUrl) {
          toast.success("Order created. Opening payment link...");
          window.open(result.data.redirectUrl, "_blank");
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
            {selectedRestaurant ? (
              <div className="flex items-center justify-between p-3 rounded-lg border border-green-500 bg-green-50">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{selectedRestaurant.name}</p>
                  <p className="text-xs text-gray-600 truncate">
                    {[selectedRestaurant.phone, selectedRestaurant.email].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <Button size="sm" variant="outline" onClick={clearRestaurant} className="h-7 text-xs">
                  <X className="h-3 w-3 mr-1" />
                  Change
                </Button>
              </div>
            ) : (
              <div className="rounded-lg border bg-gray-50 p-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    value={restaurantQuery}
                    onChange={(e) => setRestaurantQuery(e.target.value)}
                    placeholder="Search restaurant by name, email or phone..."
                    className="pl-9 text-sm bg-white"
                  />
                  {loadingRestaurants && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
                  )}
                </div>
                <div className="mt-2 max-h-56 overflow-y-auto space-y-1">
                  {restaurants.map((restaurant) => (
                    <button
                      type="button"
                      key={restaurant.id}
                      onClick={() => selectRestaurant(restaurant)}
                      className="w-full text-left p-2 rounded border border-transparent hover:bg-white hover:border-gray-200"
                    >
                      <p className="text-sm font-medium">{restaurant.name}</p>
                      <p className="text-xs text-gray-500">
                        {[restaurant.phone, restaurant.email].filter(Boolean).join(" · ")}
                      </p>
                    </button>
                  ))}
                  {!loadingRestaurants && restaurants.length === 0 && (
                    <p className="text-xs text-gray-500 p-2">No restaurants found</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Add Products */}
          <div>
            <h3 className="text-sm font-semibold mb-3">2. Add Products</h3>

            {!selectedRestaurant ? (
              <p className="text-sm text-gray-500 border rounded-lg p-4 text-center bg-gray-50">
                Select a restaurant first to add products
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Product catalog: search + scrollable list */}
                <div className="rounded-lg border bg-gray-50 p-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      value={productQuery}
                      onChange={(e) => setProductQuery(e.target.value)}
                      placeholder="Search products..."
                      className="pl-9 text-sm bg-white"
                    />
                  </div>
                  <div
                    className="mt-2 h-72 overflow-y-auto space-y-1 pr-1"
                    onScroll={handleProductListScroll}
                  >
                    {products.map((product) => {
                      const added = items.some((i) => i.productId === product.id);
                      return (
                        <div
                          key={product.id}
                          className={`flex items-center justify-between p-2 rounded cursor-pointer border ${
                            added
                              ? "bg-green-50 border-green-200"
                              : "border-transparent hover:bg-white hover:border-gray-200"
                          }`}
                          onClick={() => addProductToOrder(product)}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {product.images?.[0] && (
                              <img
                                src={product.images[0]}
                                alt={product.productName}
                                className="w-8 h-8 object-cover rounded shrink-0"
                              />
                            )}
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{product.productName}</p>
                              <p className="text-xs text-gray-500">
                                Stock: {product.quantity} {product.unit}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-sm font-medium text-green-600">
                              {product.unitPrice.toLocaleString()} RWF
                            </span>
                            {added ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              <Plus className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {loadingProducts && (
                      <div className="flex items-center justify-center gap-2 py-3 text-xs text-gray-500">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Loading products...
                      </div>
                    )}
                    {!loadingProducts && products.length === 0 && (
                      <p className="text-xs text-gray-500 p-2">No products found</p>
                    )}
                  </div>
                </div>

                {/* Selected items */}
                <div className="rounded-lg border p-3">
                  <p className="text-xs font-semibold text-gray-600 mb-2">
                    Selected ({items.length})
                  </p>
                  {items.length === 0 ? (
                    <p className="text-xs text-gray-500 text-center py-8">
                      Click a product on the left to add it
                    </p>
                  ) : (
                    <div className="h-72 overflow-y-auto space-y-2 pr-1">
                      {items.map((item) => (
                        <div
                          key={item.tempId}
                          className="flex items-center gap-2 p-2 rounded-lg border bg-white"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.productName}</p>
                            <p className="text-xs text-gray-500">
                              {item.unitPrice.toLocaleString()} RWF / {item.unit}
                            </p>
                          </div>
                          <Input
                            type="number"
                            min={1}
                            max={item.stock}
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.tempId, parseInt(e.target.value) || 1)}
                            className="w-16 h-8 text-center text-sm"
                          />
                          <p className="w-24 text-right text-sm font-medium text-green-600">
                            {(item.quantity * item.unitPrice).toLocaleString()} RWF
                          </p>
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
                      onChange={() => setSelectedPaymentMethod(method.id)}
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

          {selectedMethodName === "MOBILE_MONEY" && (
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

          {selectedMethodName === "VOUCHER" && (
            <div>
              <Label className="text-xs mb-2">Select Voucher</Label>
              {loadingVouchers ? (
                <div className="flex items-center gap-2 py-3 text-xs text-gray-500">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Loading vouchers...
                </div>
              ) : vouchers.length === 0 ? (
                <p className="text-sm text-red-600 border border-red-200 bg-red-50 rounded-lg p-3 text-center">
                  No voucher found on this restaurant
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto">
                  {vouchers.map((voucher) => {
                    const selected = loanSessionRrn === voucher.rrn;
                    // A loan must cover the whole order — no split payment
                    const insufficient = voucher.availableCredit < subtotal;
                    return (
                      <label
                        key={voucher.id}
                        className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                          selected
                            ? "border-green-500 bg-green-50 ring-1 ring-green-200"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="voucher"
                          checked={selected}
                          onChange={() => setLoanSessionRrn(voucher.rrn)}
                          className="h-4 w-4 mt-0.5 text-green-600 focus:ring-green-500 border-gray-300"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium font-mono">{voucher.rrn}</p>
                          <p className="text-xs text-gray-600">
                            Available: {voucher.availableCredit.toLocaleString()} /{" "}
                            {voucher.approvedAmount.toLocaleString()} RWF
                          </p>
                          {voucher.dueDate && (
                            <p className="text-xs text-gray-500">
                              Due {new Date(voucher.dueDate).toLocaleDateString()}
                            </p>
                          )}
                          {insufficient && subtotal > 0 && (
                            <p className="text-xs text-amber-600 mt-0.5">Not enough credit</p>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
              {voucherShortfall !== null && (
                <div className="mt-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                  <p className="font-semibold">Voucher credit is not enough</p>
                  <p className="mt-0.5">
                    Available {voucherShortfall.toLocaleString()} RWF, order total{" "}
                    {subtotal.toLocaleString()} RWF. Remove some items or choose another payment method.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* OTP confirmation from restaurant (voucher / prepaid) — for voucher, once a sufficient one is picked */}
          {requiresOtp &&
            (selectedMethodName !== "VOUCHER" || (loanSessionRrn && voucherShortfall === null)) && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 space-y-3">
              <div className="flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-800">
                  {selectedMethodName === "VOUCHER" ? "Voucher" : "Prepaid wallet"} payments must be
                  confirmed by the restaurant owner. Send an OTP to the restaurant&apos;s phone and
                  enter the code they share with you.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-end gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSendOtp}
                  disabled={sendingOtp || resendIn > 0}
                  className="h-9 text-xs bg-white"
                >
                  {sendingOtp && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
                  {otpSent
                    ? resendIn > 0
                      ? `Resend OTP in ${resendIn}s`
                      : "Resend OTP"
                    : "Send OTP to Restaurant"}
                </Button>
                {otpSent && (
                  <div className="flex-1">
                    <Label className="text-xs mb-1">
                      OTP sent to {otpPhone || "restaurant phone"}
                    </Label>
                    <Input
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="6-digit code"
                      inputMode="numeric"
                      className="text-sm bg-white tracking-widest"
                    />
                  </div>
                )}
              </div>
            </div>
          )}


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
            disabled={saving || voucherShortfall !== null || (requiresOtp && otp.length !== 6)}
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
