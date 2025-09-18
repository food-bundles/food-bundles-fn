/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { MapPin, Navigation, User } from "lucide-react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useCart } from "@/app/contexts/cart-context";
import { useAuth } from "@/app/contexts/auth-context"; // Import useAuth
import {
  checkoutService,
  CheckoutRequest,
} from "@/app/services/checkoutService";
import Image from "next/image";

// Fix default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export interface OrderSummaryData {
  totalItems: number;
  totalQuantity: number;
  subtotal: number;
  discount?: number;
  deliveryFee?: number;
  total?: number;
}

type Props = {
  staticData?: OrderSummaryData;
};

interface LocationData {
  lat: number;
  lng: number;
  address?: string;
}

// Helper function to parse location string
const parseLocationString = (locationString: string | null): LocationData => {
  if (!locationString) {
    return { lat: -1.9577, lng: 30.0619 }; // Default Kigali coordinates
  }

  const coords = locationString.split(",");
  if (coords.length === 2) {
    const lat = parseFloat(coords[0].trim());
    const lng = parseFloat(coords[1].trim());
    if (!isNaN(lat) && !isNaN(lng)) {
      return { lat, lng };
    }
  }

  return { lat: -1.9577, lng: 30.0619 }; // Fallback to Kigali
};

// Helper function to get full address from user
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

export function CheckoutForm({ staticData }: Props) {
  const router = useRouter();
  const { cart, totalItems, totalQuantity, totalAmount, isLoading } = useCart();
  const { user, isAuthenticated } = useAuth(); // Get user from auth context

  // Step management
  const [currentStep, setCurrentStep] = useState(1);

  // Payment method state
  const [selectedMethod, setSelectedMethod] = useState<
    "CASH" | "MOBILE_MONEY" | "BANK_TRANSFER" | "CARD"
  >("CASH");

  // Location modal state
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [tempLocation, setTempLocation] = useState<LocationData>({
    lat: -1.9577,
    lng: 30.0619, // Kigali coordinates
  });

  // Auto-fill button state
  const [isAutoFilled, setIsAutoFilled] = useState(false);

  // Delivery form state
  const [deliveryData, setDeliveryData] = useState({
    fullName: "",
    phoneNumber: "",
    deliveryAddress: "",
    deliveryInstructions: "",
    location: { lat: -1.9577, lng: 30.0619 }, // Kigali coordinates
    hasSelectedLocationOnMap: false, // Track if user used map
  });

  // Checkout state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-fill function
  const handleAutoFillUserData = () => {
    if (!user) return;

    // Parse user location if available
    const userLocation = parseLocationString(user.location);

    // Get full address from user profile
    const fullAddress = getUserFullAddress(user);

    setDeliveryData((prev) => ({
      ...prev,
      fullName: user.name || user.name || "",
      phoneNumber: user.phone || "",
      deliveryAddress: fullAddress,
      location: userLocation,
      hasSelectedLocationOnMap: !!user.location, // Set true if user has saved location
    }));

    // Update temp location for map
    setTempLocation(userLocation);
    setIsAutoFilled(true);

    // Clear any existing errors
    setErrors({});
  };

  // Clear form function
  const handleClearForm = () => {
    setDeliveryData({
      fullName: "",
      phoneNumber: "",
      deliveryAddress: "",
      deliveryInstructions: "",
      location: { lat: -1.9577, lng: 30.0619 },
      hasSelectedLocationOnMap: false,
    });
    setTempLocation({ lat: -1.9577, lng: 30.0619 });
    setIsAutoFilled(false);
    setErrors({});
  };

  // Get user's current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setTempLocation(newLocation);
        },
        (error) => {
          console.error("Error getting location:", error);
          // Fallback to user's saved location or Kigali coordinates
          if (user?.location) {
            setTempLocation(parseLocationString(user.location));
          }
        }
      );
    }
  };

  // Initialize form with user data if available (on component mount)
  useEffect(() => {
    if (isAuthenticated && user && !isAutoFilled) {
      const isEmpty =
        !deliveryData.fullName &&
        !deliveryData.phoneNumber &&
        !deliveryData.deliveryAddress;
      if (isEmpty) {
        handleAutoFillUserData();
      }
    }
  }, [isAuthenticated, user]); 

  const summaryData = (() => {
    if (staticData) {
      return {
        totalItems: staticData.totalItems,
        totalQuantity: staticData.totalQuantity,
        subtotal: staticData.subtotal,
        discount: staticData.discount ?? 0,
        deliveryFee: staticData.deliveryFee ?? 0,
        total:
          staticData.total ??
          staticData.subtotal +
            (staticData.deliveryFee ?? 0) -
            (staticData.discount ?? 0),
      };
    } else {
      return {
        totalItems,
        totalQuantity,
        subtotal: totalAmount,
        discount: 0,
        deliveryFee: 0,
        total: totalAmount,
      };
    }
  })();

  const paymentMethods = [
    {
      id: "CASH" as const,
      name: "Cash",
      image: "/imgs/wallet.jpg",
    },
    {
      id: "MOBILE_MONEY" as const,
      name: "Mobile Money",
      image: "/imgs/MTN.png",
    },
    {
      id: "CARD" as const,
      name: "Card",
      image: "/imgs/card.webp",
    },
  ];

  const handleDeliveryChange = (field: string, value: string) => {
    setDeliveryData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Map click handler inside modal
  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        setTempLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
      },
    });

    return <Marker position={[tempLocation.lat, tempLocation.lng]}></Marker>;
  };

  // Handle location selection from map
  const handleSelectLocation = () => {
    setDeliveryData((prev) => ({
      ...prev,
      location: tempLocation,
      hasSelectedLocationOnMap: true,
    }));

    // Clear address error if it exists, since user selected location on map
    if (errors.deliveryAddress) {
      setErrors((prev) => ({ ...prev, deliveryAddress: "" }));
    }

    setIsLocationModalOpen(false);
  };

  // Handle opening location modal
  const handleOpenLocationModal = () => {
    setTempLocation(deliveryData.location);
    getCurrentLocation();
    setIsLocationModalOpen(true);
  };

  const validateDeliveryForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!deliveryData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }
    if (!deliveryData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    }
    // Only validate address if user hasn't selected location on map AND hasn't entered address
    if (
      !deliveryData.hasSelectedLocationOnMap &&
      !deliveryData.deliveryAddress.trim()
    ) {
      newErrors.deliveryAddress = "Delivery address is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!deliveryData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }
    if (!deliveryData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    }
    // Only validate address if user hasn't selected location on map AND hasn't entered address
    if (
      !deliveryData.hasSelectedLocationOnMap &&
      !deliveryData.deliveryAddress.trim()
    ) {
      newErrors.deliveryAddress = "Delivery address is required";
    }

    if (!cart?.id) {
      newErrors.cart = "No cart found. Please add items to cart first.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveAndContinue = () => {
    if (validateDeliveryForm()) {
      setCurrentStep(2);
    }
  };

  const handleBackToDelivery = () => {
    setCurrentStep(1);
  };

  const handleCheckout = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Determine what to save in billingAddress based on user's choice
      let billingAddressToSave = "";

      if (deliveryData.hasSelectedLocationOnMap) {
        // If user selected location on map, save coordinates
        billingAddressToSave = `${deliveryData.location.lat},${deliveryData.location.lng}`;

        // If user also typed additional text, append it
        if (deliveryData.deliveryAddress.trim()) {
          billingAddressToSave += ` - ${deliveryData.deliveryAddress.trim()}`;
        }
      } else {
        // If user only typed address, save the text
        billingAddressToSave = deliveryData.deliveryAddress.trim();
      }

      const checkoutPayload: CheckoutRequest = {
        cartId: cart!.id,
        paymentMethod: selectedMethod,
        billingName: deliveryData.fullName,
        billingEmail: user?.email || "",
        billingPhone: deliveryData.phoneNumber,
        billingAddress: billingAddressToSave,
        notes: deliveryData.deliveryInstructions,
        deliveryDate: new Date().toISOString(),
        clientIp: "192.168.1.1",
        deviceFingerprint: "web-checkout",
        narration: `Order from ${deliveryData.fullName}`,
        currency: "RWF",
      };

      console.log("Submitting checkout:", checkoutPayload);

      const response = await checkoutService.createCheckout(checkoutPayload);

      if (response.success) {
        console.log("Checkout successful:", response.data);
        router.push("/restaurant/payment");
      } else {
        console.error("Checkout failed:", response.message);
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

  if (isLoading && !staticData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Loading checkout...</p>
      </div>
    );
  }

  // Step 1: Delivery Form with Location Modal
  if (currentStep === 1) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="border-0 shadow-none py-0">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Delivery Information</CardTitle>
              {isAuthenticated && user && (
                <div className="flex gap-2">
                  {!isAutoFilled ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAutoFillUserData}
                      className="flex items-center gap-2"
                    >
                      <User className="h-4 w-4" />
                      Use My Info
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <span className="text-sm text-green-600 flex items-center gap-1">
                        <User className="h-3 w-3" />
                        Auto-filled
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleClearForm}
                        className="text-xs"
                      >
                        Clear
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={deliveryData.fullName}
                  onChange={(e) =>
                    handleDeliveryChange("fullName", e.target.value)
                  }
                  placeholder="Enter your full name"
                  className={errors.fullName ? "border-red-500" : ""}
                />
                {errors.fullName && (
                  <p className="text-red-500 text-sm">{errors.fullName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  value={deliveryData.phoneNumber}
                  onChange={(e) =>
                    handleDeliveryChange("phoneNumber", e.target.value)
                  }
                  placeholder="Enter phone number"
                  className={errors.phoneNumber ? "border-red-500" : ""}
                />
                {errors.phoneNumber && (
                  <p className="text-red-500 text-sm">{errors.phoneNumber}</p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="deliveryAddress">Delivery Address</Label>
                <div className="flex gap-2">
                  <Input
                    id="deliveryAddress"
                    value={deliveryData.deliveryAddress}
                    onChange={(e) =>
                      handleDeliveryChange("deliveryAddress", e.target.value)
                    }
                    placeholder={
                      deliveryData.hasSelectedLocationOnMap
                        ? "Location selected on map (optional: add more details)"
                        : "Enter house/street/apartment number and area"
                    }
                    className={`flex-1 ${
                      errors.deliveryAddress ? "border-red-500" : ""
                    } ${
                      deliveryData.hasSelectedLocationOnMap ? "bg-green-50" : ""
                    }`}
                  />
                  <Dialog
                    open={isLocationModalOpen}
                    onOpenChange={setIsLocationModalOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleOpenLocationModal}
                        className="flex items-center gap-2 px-4"
                      >
                        <MapPin className="h-4 w-4" />
                        {deliveryData.hasSelectedLocationOnMap
                          ? "Update Location"
                          : "Pin Location"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl w-[90vw] h-[80vh]">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <MapPin className="h-5 w-5" />
                          Select Your Delivery Location
                        </DialogTitle>
                      </DialogHeader>
                      <div className="flex flex-col h-full gap-4">
                        <div className="flex gap-2">
                          <Button
                            onClick={getCurrentLocation}
                            variant="outline"
                            className="flex items-center gap-2"
                          >
                            <Navigation className="h-4 w-4" />
                            Use Current Location
                          </Button>
                          <div className="flex-1 text-sm text-gray-600 flex items-center">
                            Click on the map to set your exact delivery location
                          </div>
                        </div>
                        <div className="flex-1 rounded-lg overflow-hidden border">
                          <MapContainer
                            center={[tempLocation.lat, tempLocation.lng]}
                            zoom={15}
                            style={{ height: "100%", width: "100%" }}
                          >
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            <LocationMarker />
                          </MapContainer>
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t">
                          <div className="text-sm text-gray-600">
                            Selected: {tempLocation.lat.toFixed(6)},{" "}
                            {tempLocation.lng.toFixed(6)}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              onClick={() => setIsLocationModalOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={handleSelectLocation}
                              className="bg-green-700 hover:bg-green-800 text-white"
                            >
                              Confirm Location
                            </Button>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                {errors.deliveryAddress && (
                  <p className="text-red-500 text-sm">
                    {errors.deliveryAddress}
                  </p>
                )}
                {deliveryData.hasSelectedLocationOnMap && (
                  <p className="text-green-600 text-sm flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    Location pinned on map:{" "}
                    {deliveryData.location.lat.toFixed(4)},{" "}
                    {deliveryData.location.lng.toFixed(4)}
                  </p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="deliveryInstructions">
                  Delivery Instructions (Optional)
                </Label>
                <Textarea
                  id="deliveryInstructions"
                  value={deliveryData.deliveryInstructions}
                  onChange={(e) =>
                    handleDeliveryChange("deliveryInstructions", e.target.value)
                  }
                  placeholder="E.g. Leave at the door, ring the bell twice, building entrance code"
                  rows={3}
                />
              </div>

              <div className="md:col-span-2">
                <Button
                  onClick={handleSaveAndContinue}
                  className="w-full bg-green-700 hover:bg-green-800 text-white py-3"
                >
                  Save and Continue
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Step 2: Payment Methods and Order Summary
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        {/* Back Button */}
        <div className="flex items-center gap-4">
          <Button
            onClick={handleBackToDelivery}
            variant="outline"
            className="flex items-center gap-2"
          >
            ← Back to Delivery Info
          </Button>
        </div>

        {/* Payment Methods */}
        <Card className="border-0 shadow-none bg-transparent py-0">
          <CardHeader>
            <CardTitle>Select Payment Method</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className={`relative h-32 border-2 rounded-lg cursor-pointer transition-colors overflow-hidden ${
                    selectedMethod === method.id
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setSelectedMethod(method.id)}
                >
                  <Image
                    src={method.image}
                    alt={method.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-green-700 bg-opacity-60 text-white p-2">
                    <h3 className="font-semibold text-sm text-center">
                      {method.name}
                    </h3>
                  </div>
                </div>
              ))}
            </div>

            {selectedMethod === "CASH" && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg max-w-2xl">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Cash Payment
                </h4>
                <p className="text-gray-900 text-sm">
                  You will pay with cash when your order is delivered.
                </p>
              </div>
            )}

            {selectedMethod === "MOBILE_MONEY" && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg max-w-2xl">
                <h4 className="font-semibold text-gray-900 mb-4">
                  Mobile Money Payment
                </h4>
                <p className="text-gray-900 text-sm">
                  You will receive payment instructions after placing your
                  order.
                </p>
              </div>
            )}

            {selectedMethod === "CARD" && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg max-w-2xl">
                <h4 className="font-semibold text-gray-900 mb-4">
                  Card Payment
                </h4>
                <p className="text-gray-900 text-sm">
                  You will be redirected to a secure payment page to complete
                  your card payment.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Order Summary */}
      <div className="lg:col-span-1">
        <Card className="sticky top-6">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Order Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-900">Total Items</span>
                <span className="font-medium">{summaryData.totalItems}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-900">Total Quantity</span>
                <span className="font-medium">{summaryData.totalQuantity}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-900">Subtotal</span>
                <span className="font-medium">
                  Rwf {summaryData.subtotal.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-900">Discount</span>
                <span className="font-medium">
                  {summaryData.discount.toFixed(1)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-900">Delivery fee</span>
                <span className="font-medium">
                  {summaryData.deliveryFee.toFixed(1)} Rwf
                </span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>Rwf {summaryData.total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Delivery Summary */}
            <div className="border-t pt-4">
              <h4 className="font-semibold text-gray-900 mb-2">
                Delivery Details
              </h4>
              <div className="text-sm text-gray-900 space-y-1">
                <p>
                  <strong>Name:</strong> {deliveryData.fullName}
                </p>
                <p>
                  <strong>Phone:</strong> {deliveryData.phoneNumber}
                </p>
                <p>
                  <strong>Address:</strong>{" "}
                  {deliveryData.deliveryAddress || "Location selected on map"}
                </p>
                {deliveryData.hasSelectedLocationOnMap && (
                  <p className="text-green-600 text-xs flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    Precise location selected
                  </p>
                )}
                {deliveryData.deliveryInstructions && (
                  <p>
                    <strong>Instructions:</strong>{" "}
                    {deliveryData.deliveryInstructions}
                  </p>
                )}
              </div>
            </div>

            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-red-600 text-sm">{errors.submit}</p>
              </div>
            )}

            {errors.cart && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-red-600 text-sm">{errors.cart}</p>
              </div>
            )}

            <Button
              onClick={handleCheckout}
              disabled={isSubmitting || summaryData.totalItems === 0}
              className="w-full bg-green-700 hover:bg-green-800 text-white py-3 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Processing..." : "Complete Order"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
