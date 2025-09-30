/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { User, Phone, MapPin, Navigation, X, Loader2 } from "lucide-react";
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

  const [method, setMethod] = useState<PaymentMethod>("momo");

  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    deliveryAddress: "",
    deliveryInstructions: "",
    location: { lat: -1.9577, lng: 30.0619 },
    hasSelectedLocationOnMap: false,
  });

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [tempLocation, setTempLocation] = useState<LocationData>({
    lat: -1.9577,
    lng: 30.0619,
  });

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-fill user data on mount
  useEffect(() => {
    if (isAuthenticated && user) {
      const userLocation = parseLocationString(user.location as string);
      const fullAddress = getUserFullAddress(user);

      setFormData({
        fullName: user.name || "",
        phoneNumber: user.phone || "",
        deliveryAddress: fullAddress,
        deliveryInstructions: "",
        location: userLocation,
        hasSelectedLocationOnMap: !!user.location,
      });

      setTempLocation(userLocation);
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
    setFormData((prev) => ({ ...prev, [field]: value }));
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
    return <Marker position={[tempLocation.lat, tempLocation.lng]} />;
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
    }));

    if (errors.deliveryAddress) {
      setErrors((prev) => ({ ...prev, deliveryAddress: "" }));
    }

    setIsLocationModalOpen(false);
  };

  const handleOpenLocationModal = () => {
    setTempLocation(formData.location);
    getCurrentLocation();
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
    if (
      !formData.hasSelectedLocationOnMap &&
      !formData.deliveryAddress.trim()
    ) {
      newErrors.deliveryAddress = "Delivery address is required";
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
        billingEmail: user?.email || "",
        billingPhone: formData.phoneNumber,
        billingAddress: formData.hasSelectedLocationOnMap
          ? `${formData.location.lat},${formData.location.lng}${
              formData.deliveryAddress.trim()
                ? ` - ${formData.deliveryAddress.trim()}`
                : ""
            }`
          : formData.deliveryAddress.trim(),
        notes: formData.deliveryInstructions,
        deliveryDate: new Date().toISOString(),
        clientIp: "192.168.1.1",
        deviceFingerprint: "web-checkout",
        narration: `Order from ${formData.fullName}`,
        currency: "RWF",
      };

      const response = await checkoutService.createCheckout(checkoutPayload);

      if (response.success) {
        localStorage.setItem("selectedPaymentMethod", paymentMethodMap[method]);
        window.location.href = "/restaurant/updates";
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

              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-900" />
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  readOnly
                  className="w-full pl-10 h-10 border text-gray-900 focus:border-green-500 focus:ring-green-500 focus:ring-1 focus:outline-none rounded-none text-[14px] border-gray-300"
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
                          : "Delivery Address"
                      }
                      value={formData.deliveryAddress}
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
                    Location pinned: {formData.location.lat.toFixed(4)},{" "}
                    {formData.location.lng.toFixed(4)}
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
                        center={[tempLocation.lat, tempLocation.lng]}
                        zoom={15}
                        style={{ height: "100%", width: "100%" }}
                      >
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <LocationMarker />
                      </MapContainer>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                      <div className="text-[13px] text-gray-600">
                        Selected: {tempLocation.lat.toFixed(6)},{" "}
                        {tempLocation.lng.toFixed(6)}
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
    </div>
  );
}
