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
} from "lucide-react";
import { useCart } from "@/app/contexts/cart-context";
import { useAuth } from "@/app/contexts/auth-context";
import {
  checkoutService,
  CheckoutRequest,
} from "@/app/services/checkoutService";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Spinner } from "@/components/ui/shadcn-io/spinner";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
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

type PaymentMethod = "wallet" | "momo" | "card";

export function Checkout() {
  const { cart, totalItems, totalQuantity, totalAmount, isLoading } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [showFlutterwaveInfo, setShowFlutterwaveInfo] = useState(false);
  const [flutterwaveRedirectUrl, setFlutterwaveRedirectUrl] =
    useState<string>("");

  const [method, setMethod] = useState<PaymentMethod>("momo");

  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    deliveryAddress: "",
    deliveryInstructions: "",
    location: null as LocationData | null,
    hasSelectedLocationOnMap: false,
    useMapLocation: false,
    cardNumber: "",
    cardCvv: "",
    cardExpiryMonth: "",
    cardExpiryYear: "",
  });

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [tempLocation, setTempLocation] = useState<LocationData | null>(null);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isAuthenticated && user) {
      const fullAddress = getUserFullAddress(user);

      setFormData((prev) => ({
        ...prev,
        fullName: user.name || "",
        phoneNumber: user.phone || "",
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
  }, [isAuthenticated, user]);

  const summaryData = {
    totalItems,
    totalQuantity,
    subtotal: totalAmount,
    discount: 0,
    deliveryFee: 0,
    total: totalAmount,
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

  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        setTempLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
      },
    });
    return tempLocation ? (
      <Marker position={[tempLocation.lat, tempLocation.lng]} />
    ) : null;
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

    if (!formData.useMapLocation && !formData.deliveryAddress.trim()) {
      newErrors.deliveryAddress =
        "Please select location on map or enter address";
    }

    // Card validation
    if (method === "card") {
      if (!formData.cardNumber.trim()) {
        newErrors.cardNumber = "Card number is required";
      }
      if (!formData.cardCvv.trim()) {
        newErrors.cardCvv = "CVV is required";
      }
      if (!formData.cardExpiryMonth.trim() || !formData.cardExpiryYear.trim()) {
        newErrors.cardExpiry = "Card expiry is required";
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
        wallet: "CASH" as const,
        momo: "MOBILE_MONEY" as const,
        card: "CARD" as const,
      };

      const checkoutPayload: CheckoutRequest = {
        cartId: cart!.id,
        paymentMethod: paymentMethodMap[method],
        billingName: formData.fullName,
        billingEmail: method === "card" ? user?.email || "" : undefined,
        billingPhone:
          method === "card" ? formData.phoneNumber : formData.phoneNumber,
        billingAddress:
          formData.useMapLocation && formData.location
            ? `${formData.location.lat},${formData.location.lng}`
            : formData.deliveryAddress.trim(),
        notes: formData.deliveryInstructions,
        deliveryDate: new Date().toISOString().split("T")[0],
        currency: "RWF",
      };

      if (method === "card") {
        checkoutPayload.cardDetails = {
          cardNumber: formData.cardNumber.replace(/\s/g, ""),
          cvv: formData.cardCvv,
          expiryMonth: formData.cardExpiryMonth.padStart(2, "0"),
          expiryYear: formData.cardExpiryYear,
        };
      }

      const response = await checkoutService.createCheckout(checkoutPayload);

      if (response.success) {
        localStorage.setItem("selectedPaymentMethod", paymentMethodMap[method]);

        if (method === "momo") {
          const responseData = response.data as any;
          const paymentProvider = responseData?.checkout?.paymentProvider;
          const requiresRedirect = responseData?.requiresRedirect;
          const redirectUrl = responseData?.redirectUrl;

          if (paymentProvider === "PAYPACK") {
            window.location.href = "/restaurant/updates";
          } else if (
            paymentProvider === "FLUTTERWAVE" &&
            requiresRedirect &&
            redirectUrl
          ) {
            setFlutterwaveRedirectUrl(redirectUrl);
            setShowFlutterwaveInfo(true);
          } else {
            window.location.href = "/restaurant/updates";
          }
        } else {
          window.location.href = "/restaurant/updates";
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

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Spinner />
      </div>
    );
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
              <span>Rwf {summaryData.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-900">
              <span>Delivery fee</span>
              <span>Free</span>
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between font-medium text-gray-900">
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
                      className={`w-full pl-10 h-10 border text-gray-900 focus:border-green-500 focus:ring-green-500 focus:ring-1 focus:outline-none rounded-none text-[14px] ${
                        errors.deliveryAddress
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                          : "border-gray-300"
                      } ${
                        formData.hasSelectedLocationOnMap ? "bg-green-50" : ""
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

              {/* Payment Method Section */}
              <div className="space-y-3">
                <div className="flex items-center">
                  <h3 className="text-[14px] mr-5 font-medium text-gray-900">
                    Payment Method
                  </h3>

                  <div className="flex flex-wrap justify-center gap-2 ">
                    <button
                      type="button"
                      onClick={() => setMethod("wallet")}
                      className={`rounded flex-1 sm:flex-initial h-7 text-[13px] font-normal px-4 border transition-colors cursor-pointer ${
                        method === "wallet"
                          ? "bg-green-700 text-white border-green-700"
                          : "bg-white text-gray-900 border-gray-300 hover:border-green-500"
                      }`}
                      disabled={isSubmitting}
                    >
                      Wallet
                    </button>
                    <button
                      type="button"
                      onClick={() => setMethod("momo")}
                      className={`rounded flex-1 sm:flex-initial h-7 text-[13px] font-normal px-4 border transition-colors cursor-pointer ${
                        method === "momo"
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
                      className={`rounded flex-1 sm:flex-initial h-7 text-[13px] font-normal px-4 border transition-colors cursor-pointer ${
                        method === "card"
                          ? "bg-green-700 text-white border-green-700"
                          : "bg-white text-gray-900 border-gray-300 hover:border-green-500"
                      }`}
                      disabled={isSubmitting}
                    >
                      Card
                    </button>
                  </div>
                </div>
              </div>

              {/* Dynamic Payment Inputs */}
              {method === "momo" && (
                <div className="relative mt-3">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-900" />
                  <input
                    type="tel"
                    placeholder="Enter MoMo Phone Number"
                    value={formData.phoneNumber}
                    onChange={(e) =>
                      handleInputChange("phoneNumber", e.target.value)
                    }
                    className="w-full pl-10 h-10 border text-gray-900 focus:border-green-500 focus:ring-green-500 focus:ring-1 focus:outline-none rounded-none text-[14px] border-gray-300"
                    disabled={isSubmitting}
                  />
                </div>
              )}

              {method === "card" && (
                <div className="space-y-2 mt-3">
                  <input
                    type="text"
                    placeholder="Card Number"
                    value={formData.cardNumber}
                    onChange={(e) =>
                      handleInputChange("cardNumber", e.target.value)
                    }
                    className={`w-full h-8 px-3 placeholder:text-[12px] border text-gray-900 focus:border-green-500 focus:ring-green-500 focus:ring-1 focus:outline-none text-[14px] ${
                      errors.cardNumber ? "border-red-500" : "border-gray-300"
                    }`}
                    disabled={isSubmitting}
                  />
                  {errors.cardNumber && (
                    <p className="text-red-600 text-xs">{errors.cardNumber}</p>
                  )}
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <div className="flex gap-1">
                        <input
                          type="text"
                          placeholder="MM"
                          maxLength={2}
                          value={formData.cardExpiryMonth}
                          onChange={(e) =>
                            handleInputChange("cardExpiryMonth", e.target.value)
                          }
                          className={`flex-1 h-8 px-3 placeholder:text-[12px] border text-gray-900 focus:border-green-500 focus:ring-green-500 focus:ring-1 focus:outline-none text-[14px] ${
                            errors.cardExpiry
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          disabled={isSubmitting}
                        />
                        <input
                          type="text"
                          placeholder="YY"
                          maxLength={2}
                          value={formData.cardExpiryYear}
                          onChange={(e) =>
                            handleInputChange("cardExpiryYear", e.target.value)
                          }
                          className={`flex-1 h-8 px-3 placeholder:text-[12px] border text-gray-900 focus:border-green-500 focus:ring-green-500 focus:ring-1 focus:outline-none text-[14px] ${
                            errors.cardExpiry
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          disabled={isSubmitting}
                        />
                      </div>
                      {errors.cardExpiry && (
                        <p className="text-red-600 text-xs mt-1">
                          {errors.cardExpiry}
                        </p>
                      )}
                    </div>
                    <div className="w-20">
                      <input
                        type="text"
                        placeholder="CVV"
                        maxLength={3}
                        value={formData.cardCvv}
                        onChange={(e) =>
                          handleInputChange("cardCvv", e.target.value)
                        }
                        className={`w-full h-8 px-3 placeholder:text-[12px] border text-gray-900 focus:border-green-500 focus:ring-green-500 focus:ring-1 focus:outline-none text-[14px] ${
                          errors.cardCvv ? "border-red-500" : "border-gray-300"
                        }`}
                        disabled={isSubmitting}
                      />
                      {errors.cardCvv && (
                        <p className="text-red-600 text-xs mt-1">
                          {errors.cardCvv}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {method === "wallet" && (
                <div className="space-y-2 mt-3">
                  <input
                    type="text"
                    placeholder="Wallet ID"
                    value={""}
                    onChange={(e) =>
                      handleInputChange("walletId", e.target.value)
                    }
                    className="w-full h-10 px-3 border text-gray-900 focus:border-green-500 
                 focus:ring-green-500 focus:ring-1 focus:outline-none  
                 text-[14px] border-gray-300"
                    disabled={isSubmitting}
                  />
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

                    <div className="flex-1 rounded border border-gray-300 overflow-hidden">
                      <MapContainer
                        center={[
                          tempLocation?.lat || -1.9577,
                          tempLocation?.lng || 30.0619,
                        ]}
                        zoom={15}
                        style={{ height: "100%", width: "100%" }}
                      >
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <LocationMarker />
                      </MapContainer>
                    </div>

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
      {showFlutterwaveInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
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
              <div className="p-4">
                <ul className="text-[13px] text-gray-900 space-y-1 list-decimal">
                  <li>Click Continue</li>
                  <li>Enter the OTP sent to your WhatsApp</li>
                  <li>Press *182*7*1# then Track your Order</li>
                </ul>
              </div>

              <button
                onClick={handleFlutterwaveRedirect}
                className="w-full h-10 bg-green-600 hover:bg-green-700 text-white text-[14px] font-medium cursor-pointer flex items-center justify-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Continue to Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
