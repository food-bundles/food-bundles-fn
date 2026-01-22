/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import {
  User,
  Phone,
  MapPin,
  Navigation,
  X,
  Loader2,
  ExternalLink,
  Info,
  Ticket,
  Gift,
  Tag,
  CheckCircle2,
} from "lucide-react";
import { promoService, IPromoCode } from "@/app/services/promoService";
import { toast } from "sonner";
import RestaurantAvailablePromos from "../../_components/RestaurantAvailablePromos";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCart } from "@/app/contexts/cart-context";
import { useAuth } from "@/app/contexts/auth-context";
import { useVouchers } from "@/app/contexts/VoucherContext";
import { useWallet } from "@/app/contexts/WalletContext";
import {
  checkoutService,
  CheckoutRequest,
} from "@/app/services/checkoutService";
import { paymentMethodService, PaymentMethod as PaymentMethodType } from "@/app/services/paymentMethodService";
import Link from "next/link";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { OTPInput } from "@/components/ui/otp-input";
import { Button } from "@/components/ui/button";

const MapComponent = dynamic(() => import("./MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 rounded border border-gray-300 bg-gray-100 flex items-center justify-center">
      <Spinner variant="ring" />
    </div>
  ),
});

interface LocationData {
  lat: number;
  lng: number;
}

const parseLocationString = (locationString: string | null): LocationData => {
  if (!locationString) return { lat: -1.9577, lng: 30.0619 };
  const coords = locationString.split(",");
  if (coords.length === 2) {
    const lat = parseFloat(coords[0].trim());
    const lng = parseFloat(coords[1].trim());
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
  }
  return { lat: -1.9577, lng: 30.0619 };
};

const getUserFullAddress = (user: any): string => {
  if (!user) return "";
  const addressParts = [
    user.village,
    user.cell,
    user.sector,
    user.district,
    user.province,
  ].filter(Boolean);
  return addressParts.join(", ");
};

type PaymentMethod = "prepaid" | "momo" | "card" | "voucher";

export function Checkout() {
  const { cart, totalItems, totalQuantity, totalAmount, isLoading } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { myVouchers, getMyVouchers } = useVouchers();
  const { wallet, getMyWallet } = useWallet();
  const [showFlutterwaveInfo, setShowFlutterwaveInfo] = useState(false);
  const [flutterwaveRedirectUrl, setFlutterwaveRedirectUrl] =
    useState<string>("");
  const [availableVouchers, setAvailableVouchers] = useState<any[]>([]);
  const [isLoadingVouchers, setIsLoadingVouchers] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodType[]>([]);
  const [isLoadingPaymentMethods, setIsLoadingPaymentMethods] = useState(true);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string>("");
  const [walletBalance, setWalletBalance] = useState(0);

  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    momoPhoneNumber: "",
    deliveryAddress: "",
    deliveryInstructions: "",
    location: null as LocationData | null,
    hasSelectedLocationOnMap: false,
    useMapLocation: false,
    cardNumber: "",
    cardCvv: "",
    cardExpiryMonth: "",
    cardExpiryYear: "",
    voucherCode: "",
  });

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [tempLocation, setTempLocation] = useState<LocationData | null>(null);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showVoucherOTPModal, setShowVoucherOTPModal] = useState(false);
  const [voucherOTP, setVoucherOTP] = useState("");
  const [isVerifyingVoucherOTP, setIsVerifyingVoucherOTP] = useState(false);
  const [checkoutSessionId, setCheckoutSessionId] = useState("");
  const [voucherOTPError, setVoucherOTPError] = useState("");
  const [otherServices, setOtherServices] = useState(false);
  const [method, setMethod] = useState<PaymentMethod>("momo");

  // Promo Code State
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<any | null>(null);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);
  const [promoError, setPromoError] = useState("");

  const handleApplyPromo = async (codeToApply?: string) => {
    const code = codeToApply || promoCode;
    if (!code.trim() || !cart?.id) return;

    setIsValidatingPromo(true);
    setPromoError("");
    try {
      const response = await promoService.calculateCart(cart.id, code);

      if (response.success) {
        setAppliedPromo(response.data);
        setPromoCode(code);
        toast.success(`Promo code applied! Saved ${response.data.savings.toLocaleString()} RWF`);
      } else {
        setPromoError(response.message || "Invalid promo code");
        toast.error(response.message || "Invalid promo code");
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || "Failed to validate promo code";
      setPromoError(msg);
      toast.error(msg);
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const removePromo = () => {
    setAppliedPromo(null);
    setPromoCode("");
    setPromoError("");
  };

  // Fetch payment methods on component mount
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const response = await paymentMethodService.getActivePaymentMethods();
        if (response.data) {
          // Filter out bank transfer methods
          const filteredMethods = response.data.filter(
            (pm: PaymentMethodType) => pm.name !== "BANK_TRANSFER"
          );
          setPaymentMethods(filteredMethods);
          // Set default payment method to first available (preferably CASH for prepaid)
          const cashMethod = filteredMethods.find((pm: PaymentMethodType) => pm.name === "CASH");
          if (cashMethod) {
            setSelectedPaymentMethodId(cashMethod.id);
          } else if (filteredMethods.length > 0) {
            setSelectedPaymentMethodId(filteredMethods[0].id);
          }
        }
      } catch (error) {
        console.error("Error fetching payment methods:", error);
      } finally {
        setIsLoadingPaymentMethods(false);
      }
    };

    fetchPaymentMethods();
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      // Fetch wallet data
      const fetchWallet = async () => {
        try {
          await getMyWallet();
        } catch (error) {
          console.log("No wallet found or error fetching wallet");
        }
      };
      fetchWallet();

      const fullAddress = getUserFullAddress(user);

      setFormData((prev) => ({
        ...prev,
        fullName: user.name || "",
        phoneNumber: user.phone || "",
        momoPhoneNumber: user.phone || "",
        deliveryAddress: fullAddress,
        deliveryInstructions: "",
        location: null,
        hasSelectedLocationOnMap: false,
        useMapLocation: false,
      }));

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userCurrentLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            setFormData((prev) => ({
              ...prev,
              location: userCurrentLocation,
              hasSelectedLocationOnMap: true,
              useMapLocation: true,
              deliveryAddress: "",
            }));
            setTempLocation(userCurrentLocation);
          },
          (error) => {
            console.error("Error getting location:", error);
            setTempLocation(null);
          }
        );
      }
    }
  }, [isAuthenticated, user, getMyWallet]);

  // Update wallet balance when wallet data changes
  useEffect(() => {
    if (wallet) {
      setWalletBalance(wallet.balance);
    }
  }, [wallet]);

  // Update selected payment method ID when payment method changes
  useEffect(() => {
    if (paymentMethods.length > 0) {
      let targetPaymentMethod;

      switch (method) {
        case "prepaid":
          targetPaymentMethod = paymentMethods.find((pm: PaymentMethodType) => pm.name === "CASH");
          break;
        case "momo":
          targetPaymentMethod = paymentMethods.find((pm: PaymentMethodType) => pm.name === "MOBILE_MONEY");
          break;
        case "card":
          targetPaymentMethod = paymentMethods.find((pm: PaymentMethodType) => pm.name === "CARD");
          break;
        case "voucher":
          targetPaymentMethod = paymentMethods.find((pm: PaymentMethodType) => pm.name === "VOUCHER");
          break;
        default:
          targetPaymentMethod = paymentMethods[0];
      }

      if (targetPaymentMethod) {
        setSelectedPaymentMethodId(targetPaymentMethod.id);
      }
    }
  }, [method, paymentMethods]);

  useEffect(() => {
    if (method === "voucher" && isAuthenticated) {
      const fetchVouchers = async () => {
        try {
          setIsLoadingVouchers(true);
          await getMyVouchers();
        } catch (error) {
          console.error("Error fetching vouchers:", error);
          setAvailableVouchers([]);
        } finally {
          setIsLoadingVouchers(false);
        }
      };
      fetchVouchers();
    } else if (method !== "voucher") {
      setAvailableVouchers([]);
      setIsLoadingVouchers(false);
    }
  }, [method, isAuthenticated, getMyVouchers]);

  useEffect(() => {
    if (method === "voucher" && myVouchers && myVouchers.length > 0) {
      const validVouchers = myVouchers.filter((voucher: any) =>
        voucher.status === "ACTIVE" &&
        voucher.remainingCredit > 0 &&
        (!voucher.expiryDate || new Date(voucher.expiryDate) > new Date())
      );
      console.log('Valid vouchers found:', validVouchers);
      setAvailableVouchers(validVouchers);
    }
  }, [myVouchers, method]);

  // Check subscription benefits
  const cartWithRestaurant = cart as any;
  const hasActiveSubscription = cartWithRestaurant?.restaurant?.subscriptions?.some(
    (sub: any) => sub.status === 'ACTIVE' && sub.plan
  );
  const subscriptionPlan = hasActiveSubscription
    ? cartWithRestaurant?.restaurant?.subscriptions?.find((sub: any) => sub.status === 'ACTIVE')?.plan
    : null;

  const hasFreeDelivery = subscriptionPlan?.freeDelivery || false;
  const hasOtherServices = subscriptionPlan?.otherServices || false;

  // Calculate fees
  const deliveryFee = 0; // Currently free for all users
  const packagingFee = hasOtherServices ? 0 : (otherServices ? 15000 : 0);

  // Calculate totals based on promo response
  let subtotalAmount = totalAmount;
  let promoDiscount = 0;
  let finalTotal = totalAmount + packagingFee;

  if (appliedPromo) {
    subtotalAmount = appliedPromo.originalAmount;
    promoDiscount = appliedPromo.discountAmount;
    finalTotal = appliedPromo.finalAmount + packagingFee;
  }

  const summaryData = {
    totalItems,
    totalQuantity,
    subtotal: appliedPromo ? appliedPromo.originalAmount : totalAmount,
    discount: promoDiscount,
    deliveryFee,
    packagingFee,
    total: finalTotal,
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === "deliveryAddress" && value.trim()) {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
        hasSelectedLocationOnMap: false,
        useMapLocation: false,
        location: null,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setTempLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          if (user?.location) {
            setTempLocation(parseLocationString(user.location));
          }
        }
      );
    }
  };

  const handleSelectLocation = () => {
    setFormData((prev) => ({
      ...prev,
      location: tempLocation,
      hasSelectedLocationOnMap: true,
      useMapLocation: true,
      deliveryAddress: "",
    }));

    if (errors.deliveryAddress) {
      setErrors((prev) => ({ ...prev, deliveryAddress: "" }));
    }

    setIsLocationModalOpen(false);
  };

  const handleOpenLocationModal = () => {
    if (formData.location) {
      setTempLocation(formData.location);
    } else {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setTempLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
          },
          (error) => {
            console.error("Error getting location:", error);
          }
        );
      }
    }
    setIsLocationModalOpen(true);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    }

    // MoMo phone validation
    if (method === "momo" && !formData.momoPhoneNumber.trim()) {
      newErrors.momoPhoneNumber = "Phone number is required for MoMo payment";
    }

    if (!formData.useMapLocation && !formData.deliveryAddress.trim()) {
      newErrors.deliveryAddress =
        "Please select location on map or enter address";
    }


    // Voucher validation
    if (method === "voucher") {
      if (!formData.voucherCode.trim()) {
        newErrors.voucherCode = "Voucher code is required";
      }
    }

    if (!cart?.id) {
      newErrors.cart = "No cart found. Please add items to cart first.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCheckout = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const paymentMethodMap = {
        prepaid: "CASH" as const,
        momo: "MOBILE_MONEY" as const,
        card: "CARD" as const,
        voucher: "VOUCHER" as const,
      };

      // Validate prepaid balance
      if (method === "prepaid") {
        if (!wallet) {
          setErrors({ submit: "Prepaid account not found. Please create one first." });
          return;
        }
        if (walletBalance < finalTotal) {
          setErrors({ submit: `Insufficient prepaid balance. Available: ${walletBalance.toLocaleString()} RWF, Required: ${finalTotal.toLocaleString()} RWF` });
          return;
        }
      }

      // Use the selected payment method ID (already updated by useEffect)
      const paymentMethodId = selectedPaymentMethodId;

      if (!paymentMethodId) {
        setErrors({ submit: "Please select a valid payment method." });
        return;
      }

      const checkoutPayload: CheckoutRequest = {
        cartId: cart!.id,
        paymentMethodId: paymentMethodId,
        paymentMethod: paymentMethodMap[method],
        billingName: formData.fullName,
        billingEmail: method === "card" ? user?.email || "" : undefined,
        billingPhone:
          method === "momo" ? formData.momoPhoneNumber : formData.phoneNumber,
        billingAddress:
          formData.useMapLocation && formData.location
            ? `${formData.location.lat},${formData.location.lng}`
            : formData.deliveryAddress.trim(),
        notes: formData.deliveryInstructions,
        deliveryDate: new Date().toISOString().split("T")[0],
        currency: "RWF",
        otherServices,
      };



      if (method === "voucher") {
        checkoutPayload.voucherCode = formData.voucherCode;
      }

      if (appliedPromo) {
        checkoutPayload.promoCode = appliedPromo.promoCode.code;
      }

      const response = await checkoutService.createCheckout(checkoutPayload);

      if (response.success) {
        localStorage.setItem("selectedPaymentMethod", paymentMethodMap[method]);

        // Handle voucher OTP requirement
        if (method === "voucher" && response.requiresOTP) {
          setCheckoutSessionId(response.checkoutSessionId || "");
          setShowVoucherOTPModal(true);
          return;
        }

        // Check payment provider and handle accordingly
        const responseData = response.data as any;
        const requiresRedirect = responseData?.requiresRedirect;
        const redirectUrl = responseData?.redirectUrl;
        const paymentProvider = responseData?.checkout?.paymentProvider;

        if (requiresRedirect && redirectUrl && paymentProvider === "FLUTTERWAVE") {
          // Flutterwave requires redirect - show modal
          setFlutterwaveRedirectUrl(redirectUrl);
          setShowFlutterwaveInfo(true);
        } else if (paymentProvider === "PAYPACK") {
          // Paypack sends USSD to phone - redirect to orders
          window.location.href = "/restaurant";
        } else {
          window.location.href = "/restaurant";
        }
      } else {
        setErrors({
          submit: response.message || "Checkout failed. Please try again.",
        });
      }
    } catch (error) {
      console.error("Checkout error:", error);
      setErrors({ submit: "An unexpected error occurred. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFlutterwaveRedirect = () => {
    if (flutterwaveRedirectUrl) {
      window.location.href = flutterwaveRedirectUrl;
    }
  };

  const handleVerifyVoucherOTP = async () => {
    if (!voucherOTP.trim()) {
      setVoucherOTPError("Please enter the OTP code");
      return;
    }

    setIsVerifyingVoucherOTP(true);
    setVoucherOTPError("");

    try {
      const response = await checkoutService.verifyVoucherOTP(
        voucherOTP,
        checkoutSessionId
      );

      if (response.success) {
        setShowVoucherOTPModal(false);
        window.location.href = "/restaurant";
      } else {
        setVoucherOTPError(response.message || "OTP verification failed");
      }
    } catch (error: any) {
      setVoucherOTPError("OTP verification failed. Please try again.");
    } finally {
      setIsVerifyingVoucherOTP(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Spinner variant="ring" />
      </div>
    );
  }

  if (!cart || !cart.id || totalItems === 0) {
    window.location.href = "/restaurant";
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex flex-col lg:flex-row items-stretch w-full bg-white rounded-md shadow-sm">
        {/* Left side: Order Summary */}
        <div className="w-full lg:w-1/3 p-6 lg:p-8 bg-gray-50">
          <h2 className="text-[16px] font-medium text-black mb-4">
            Order Summary
          </h2>

          <div className="space-y-3 text-[14px]">
            <div className="flex justify-between text-gray-900">
              <span>Items ({summaryData.totalItems})</span>
              <span>Qty: {summaryData.totalQuantity}</span>
            </div>
            <div className="flex justify-between text-gray-900">
              <span>Subtotal</span>
              <div className="flex items-center gap-2">
                {appliedPromo && (
                  <span className="line-through text-gray-400">Rwf {appliedPromo.originalAmount.toLocaleString()}</span>
                )}
                <span>Rwf {summaryData.subtotal.toLocaleString()}</span>
              </div>
            </div>
            <div className="flex justify-between text-gray-900">
              <span>Delivery fee</span>
              <span className="line-through text-gray-400">Rwf 5,000</span>
            </div>
            {packagingFee > 0 && (
              <div className="flex justify-between text-gray-900">
                <span>Other services</span>
                <span>Rwf {packagingFee.toLocaleString()}</span>
              </div>
            )}

            {/* Promo Discount Row */}
            {summaryData.discount > 0 && (
              <div className="flex justify-between text-green-600 font-medium">
                <span className="flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  Discount
                </span>
                <span>- Rwf {summaryData.discount.toLocaleString()}</span>
              </div>
            )}

            <div className="border-t pt-3 space-y-4">
              {/* Promo Code Input */}
              {!appliedPromo ? (
                <div className="space-y-2">
                  <div className="relative flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Promo code"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        className="w-full pl-8 pr-3 h-8 border border-gray-300 text-[12px] focus:border-green-500 focus:outline-none placeholder:text-gray-400"
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleApplyPromo())}
                      />
                    </div>
                    <Button
                      onClick={() => handleApplyPromo()}
                      disabled={isValidatingPromo || !promoCode.trim()}
                      className="h-8 px-3 text-[11px] bg-green-600 hover:bg-green-700 font-bold"
                    >
                      {isValidatingPromo ? <Loader2 className="h-3 w-3 animate-spin" /> : "Apply"}
                    </Button>
                  </div>
                  {promoError && <p className="text-[10px] text-red-500 animate-in fade-in slide-in-from-top-1">{promoError}</p>}
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded p-2 flex items-center justify-between animate-in zoom-in-95 duration-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold text-green-800">{appliedPromo.promoCode.code}</span>
                      <span className="text-[9px] text-green-600">Saved Rwf {summaryData.discount.toLocaleString()}</span>
                    </div>
                  </div>
                  <button
                    onClick={removePromo}
                    className="p-1 hover:bg-green-100 rounded text-green-700 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              <div className="flex justify-between font-bold text-[16px] text-gray-900 pt-1">
                <span>Total</span>
                <span>Rwf {summaryData.total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden lg:block w-[.5px] bg-gray-300" />

        <div className="w-full lg:w-2/3 p-6 lg:p-8">
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mb-4">
              {errors.submit}
            </div>
          )}

          {errors.cart && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mb-4">
              {errors.cart}
            </div>
          )}
          <div>
            <h2 className="text-[18px] font-bold text-gray-900 mb-4">
              Checkout
            </h2>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-900" />
                <input
                  type="text"
                  value={formData.fullName}
                  readOnly
                  className="w-full pl-10 h-10 border text-gray-900 focus:border-green-500 focus:ring-green-500 focus:ring-1 focus:outline-none rounded-none text-[14px] border-gray-300 "
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-900" />
                    <input
                      type="text"
                      placeholder={
                        formData.hasSelectedLocationOnMap
                          ? "Location selected on map"
                          : "Type your delivery address"
                      }
                      value={
                        formData.useMapLocation ? "" : formData.deliveryAddress
                      }
                      onChange={(e) =>
                        handleInputChange("deliveryAddress", e.target.value)
                      }
                      className={`w-full pl-10 h-10 border text-gray-900 focus:border-green-500 focus:ring-green-500 focus:ring-1 focus:outline-none rounded-none text-[14px] ${errors.deliveryAddress
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-300"
                        } ${formData.hasSelectedLocationOnMap ? "bg-green-50" : ""
                        }`}
                      disabled={isSubmitting}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenLocationModal}
                    className="h-10 px-3 border border-gray-300 hover:border-green-500 text-gray-900 hover:text-green-600 text-[13px] font-medium transition-colors cursor-pointer flex items-center gap-1"
                    disabled={isSubmitting}
                  >
                    <MapPin className="h-3 w-3" />
                    {formData.hasSelectedLocationOnMap ? "Update" : "Pin"}
                  </button>
                </div>
                {errors.deliveryAddress && (
                  <p className="text-red-600 text-xs mt-1">
                    {errors.deliveryAddress}
                  </p>
                )}

                {formData.hasSelectedLocationOnMap && (
                  <p className="text-green-600 text-xs flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    Location pinned on map
                  </p>
                )}
              </div>

              <div className="relative">
                <textarea
                  placeholder="Delivery Instructions (Optional)"
                  value={formData.deliveryInstructions}
                  onChange={(e) =>
                    handleInputChange("deliveryInstructions", e.target.value)
                  }
                  rows={1}
                  className="w-full pl-10 pt-3 pb-3 border border-gray-300 text-gray-900 focus:border-green-500 focus:ring-green-500 focus:ring-1 focus:outline-none rounded-none text-[13px] resize-none"
                  disabled={isSubmitting}
                />
              </div>

              {/* Other Services Section */}
              {hasOtherServices ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="otherServices"
                    checked={true}
                    disabled={true}
                    className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <label
                    htmlFor="otherServices"
                    className="text-sm text-gray-700"
                  >
                    <span className="line-through text-gray-400">
                      Add other services: +15,000 RWF
                    </span>
                    <span className="ml-2 text-green-600">Included</span>
                  </label>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="otherServices"
                    checked={otherServices}
                    onChange={(e) => setOtherServices(e.target.checked)}
                    className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    disabled={isSubmitting}
                  />
                  <label
                    htmlFor="otherServices"
                    className="text-sm text-gray-700"
                  >
                    Add other services: +15,000 RWF
                  </label>
                </div>
              )}

              {/* Payment Method Section */}
              <div className="space-y-3">
                <div className="flex items-center">
                  <h3 className="text-[14px] mr-5 font-medium text-gray-900">
                    Payment Method
                  </h3>

                  <div className="flex flex-wrap justify-center gap-2 ">
                    <button
                      type="button"
                      onClick={() => setMethod("prepaid")}
                      className={`rounded flex-1 sm:flex-initial h-7 text-[13px] font-normal px-4 border transition-colors cursor-pointer ${method === "prepaid"
                        ? "bg-green-700 text-white border-green-700"
                        : "bg-white text-gray-900 border-gray-300 hover:border-green-500"
                        } ${!wallet || walletBalance < finalTotal ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={isSubmitting || !wallet || walletBalance < finalTotal}
                    >
                      Prepaid
                    </button>
                    <button
                      type="button"
                      onClick={() => setMethod("momo")}
                      className={`rounded flex-1 sm:flex-initial h-7 text-[13px] font-normal px-4 border transition-colors cursor-pointer ${method === "momo"
                        ? "bg-green-700 text-white border-green-700"
                        : "bg-white text-gray-900 border-gray-300 hover:border-green-500"
                        }`}
                      disabled={isSubmitting}
                    >
                      MoMo
                    </button>
                    <button
                      type="button"
                      onClick={() => setMethod("card")}
                      className={`rounded flex-1 sm:flex-initial h-7 text-[13px] font-normal px-4 border transition-colors cursor-pointer ${method === "card"
                        ? "bg-green-700 text-white border-green-700"
                        : "bg-white text-gray-900 border-gray-300 hover:border-green-500"
                        }`}
                      disabled={isSubmitting}
                    >
                      Card/MoMo
                    </button>
                    <button
                      type="button"
                      onClick={() => setMethod("voucher")}
                      className={`rounded flex-1 sm:flex-initial h-7 text-[13px] font-normal px-4 border transition-colors cursor-pointer ${method === "voucher"
                        ? "bg-green-700 text-white border-green-700"
                        : "bg-white text-gray-900 border-gray-300 hover:border-green-500"
                        }`}
                      disabled={isSubmitting}
                    >
                      Voucher
                    </button>
                  </div>
                </div>
              </div>

              {/* Prepaid Balance Display */}
              {method === "prepaid" && (
                <div className="mt-3 p-3 bg-gray-50 rounded border">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Available Balance:</span>
                    <span className="font-medium text-green-600">
                      {walletBalance.toLocaleString()} RWF
                    </span>
                  </div>
                  {walletBalance < finalTotal && (
                    <p className="text-xs text-red-600 mt-1">
                      Insufficient balance. Need {(finalTotal - walletBalance).toLocaleString()} RWF more.
                    </p>
                  )}
                  {!wallet && (
                    <p className="text-xs text-red-600 mt-1">
                      No prepaid account found. Please create one first.
                    </p>
                  )}
                </div>
              )}

              {method === "momo" && (
                <div className="space-y-2 mt-3">
                  <label className="flex items-center text-sm font-medium text-gray-700">
                    Phone Number (MTN or TIGO)
                  </label>

                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-900" />
                    <input
                      type="tel"
                      placeholder="250788123456"
                      value={formData.momoPhoneNumber}
                      onChange={(e) =>
                        handleInputChange("momoPhoneNumber", e.target.value)
                      }
                      className={`w-full pl-10 h-10 border text-gray-900 focus:border-green-500 focus:ring-green-500 focus:ring-1 focus:outline-none text-[14px] ${errors.momoPhoneNumber
                        ? "border-red-500"
                        : "border-gray-300"
                        }`}
                      disabled={isSubmitting}
                    />
                  </div>
                  {errors.momoPhoneNumber && (
                    <p className="text-red-600 text-xs">
                      {errors.momoPhoneNumber}
                    </p>
                  )}
                </div>
              )}



              {method === "voucher" && (
                <div className="space-y-3 mt-3">
                  {isLoadingVouchers ? (
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-green-600" />
                  ) : availableVouchers.length > 0 ? (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Select Voucher
                      </label>
                      <Select
                        value={formData.voucherCode}
                        onValueChange={(value) =>
                          handleInputChange("voucherCode", value)
                        }
                        disabled={isSubmitting}
                      >
                        <SelectTrigger
                          className={`w-full h-10 text-[14px] ${errors.voucherCode
                            ? "border-red-500"
                            : "border-gray-300"
                            }`}
                        >
                          <SelectValue placeholder="Select a voucher" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableVouchers.map((voucher) => (
                            <SelectItem
                              key={voucher.id}
                              value={voucher.voucherCode}
                            >
                              <span className="block sm:hidden">
                                {voucher.voucherCode} - {voucher.remainingCredit.toLocaleString()} RWF
                              </span>
                              <span className="hidden sm:block">
                                {voucher.voucherCode} - {voucher.remainingCredit.toLocaleString()} RWF available
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.voucherCode && (
                        <p className="text-red-600 text-xs">
                          {errors.voucherCode}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4 border border-gray-200 rounded-lg bg-gray-50">
                      <p className="text-xs text-gray-600 mb-3">
                        You don&rsquo;t have any active vouchers
                      </p>
                      <Link
                        href="/restaurant/vouchers"
                        className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-md transition-colors"
                      >
                        Apply for Voucher
                      </Link>
                    </div>
                  )}
                </div>
              )}

              <button
                type="button"
                onClick={handleCheckout}
                disabled={isSubmitting || summaryData.totalItems === 0}
                className="w-full h-10 bg-green-700 hover:bg-green-800 text-white text-[14px] font-medium cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {isSubmitting ? "Please wait..." : `Checkout`}
              </button>
            </form>

            {isLocationModalOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-md w-full max-w-4xl h-[80vh] flex flex-col">
                  <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h3 className="text-[16px] font-medium text-gray-900 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Select Your Delivery Location
                    </h3>
                    <button
                      onClick={() => setIsLocationModalOpen(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="flex-1 flex flex-col p-4 gap-4">
                    <div className="flex gap-2">
                      <button
                        onClick={getCurrentLocation}
                        className="h-8 px-3 border border-gray-300 hover:border-green-500 text-gray-900 hover:text-green-600 text-[13px] font-medium transition-colors cursor-pointer flex items-center gap-2"
                      >
                        <Navigation className="h-3 w-3" />
                        Use Current Location
                      </button>
                      <div className="flex-1 text-[13px] text-gray-600 flex items-center">
                        Click on the map to set your exact delivery location
                      </div>
                    </div>

                    <MapComponent
                      tempLocation={tempLocation}
                      onLocationSelect={(location) => setTempLocation(location)}
                    />

                    <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                      <div className="text-[13px] text-gray-600">
                        Selected: {tempLocation?.lat?.toFixed(6) ?? ""},{" "}
                        {tempLocation?.lng?.toFixed(6) ?? ""}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setIsLocationModalOpen(false)}
                          className="h-8 px-4 border border-gray-300 hover:border-gray-400 text-gray-900 text-[13px] font-medium transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSelectLocation}
                          className="h-8 px-4 bg-green-700 hover:bg-green-800 text-white text-[13px] font-medium transition-colors cursor-pointer"
                        >
                          Confirm Location
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Available Promos Section */}
      <div className="mt-8">
        <div className="flex items-center gap-2 mb-4">
          <Gift className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-bold text-gray-900">Browse Available Promotions</h3>
        </div>
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <RestaurantAvailablePromos
            onApply={(code) => {
              setPromoCode(code);
              handleApplyPromo(code);
            }}
          />
        </div>
      </div>

      {/* Flutterwave Redirect Modal */}
      {showFlutterwaveInfo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-md w-full max-w-md flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-[16px] font-medium text-gray-900 flex items-center gap-2">
                <Info className="h-4 w-4 text-green-500" />
                Complete Payment
              </h3>
              <button
                onClick={() => setShowFlutterwaveInfo(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <p className="text-xs text-gray-700">
                You will be redirected to complete your payment. Choose your
                preferred payment method:
              </p>
              <div className="bg-gray-50 p-4 rounded-md">
                <ul className="text-[13px] text-gray-900 space-y-2">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 text-xs bg-green-600 rounded-full"></span>
                    Mobile Money (MTN/TIGO)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 text-xs bg-green-600 rounded-full"></span>
                    Card Payment
                  </li>
                </ul>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowFlutterwaveInfo(false)}
                  className="flex-1 h-10 border border-gray-300 hover:border-gray-400 text-gray-900 text-[14px] font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFlutterwaveRedirect}
                  className="flex-1 h-10 bg-green-600 hover:bg-green-700 text-white text-[14px] font-medium cursor-pointer flex items-center justify-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Voucher OTP Verification Modal */}
      {showVoucherOTPModal && (
        <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-md w-full max-w-md flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-[16px] font-medium text-gray-900 flex items-center gap-2">
                Verify Voucher Payment
              </h3>
            </div>

            <div className="p-4 space-y-4">
              <p className="text-sm text-gray-600">
                We&apos;ve sent a verification code to your phone number.
              </p>

              {voucherOTPError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {voucherOTPError}
                </div>
              )}

              <div className="flex justify-center">
                <OTPInput
                  value={voucherOTP}
                  onChange={(value) => {
                    setVoucherOTP(value);
                    if (voucherOTPError) setVoucherOTPError("");
                  }}
                  disabled={isVerifyingVoucherOTP}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowVoucherOTPModal(false)}
                  className="flex-1 h-10 border border-gray-300 hover:border-gray-400 text-gray-900 text-sm font-medium transition-colors cursor-pointer"
                  disabled={isVerifyingVoucherOTP}
                >
                  Cancel
                </button>
                <button
                  onClick={handleVerifyVoucherOTP}
                  className="flex-1 h-10 bg-green-600 hover:bg-green-700 text-white text-sm font-medium cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  disabled={isVerifyingVoucherOTP || !voucherOTP.trim()}
                >
                  {isVerifyingVoucherOTP && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  {isVerifyingVoucherOTP ? "Verifying..." : "Verify & Pay"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
