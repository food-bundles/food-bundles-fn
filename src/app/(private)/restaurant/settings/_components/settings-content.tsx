"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Edit3,
  Save,
  X,
  MapPin,
  Clock,
  Users,
  Settings,
  ShoppingCart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type RestaurantSettings = {
  accountInfo: {
    restaurantName: string;
    ownerName: string;
    email: string;
    phone: string;
    profilePhoto: string;
  };
  restaurantDetails: {
    type: string;
    operatingHours: {
      [key: string]: { open: string; close: string; isOpen: boolean };
    };
    address: {
      street: string;
      suite: string;
      city: string;
      state: string;
      zipCode: string;
    };
    location: {
      lat: number;
      lng: number;
    };
  };
  shoppingPreferences: {
    preferredProducts: Array<{
      id: string;
      name: string;
      category: string;
      isCustom: boolean;
    }>;
    deliveryPreferences: {
      timeSlot: "morning" | "afternoon" | "evening";
      specialInstructions: string;
    };
  };
  availableProducts: Array<{
    id: string;
    name: string;
    category: string;
  }>;
};

type Props = {
  settings: RestaurantSettings;
};

export function SettingsContent({ settings: initialSettings }: Props) {
  const [settings, setSettings] = useState(initialSettings);
  const [editingSections, setEditingSections] = useState<{
    accountInfo: boolean;
    restaurantDetails: boolean;
    shoppingPreferences: boolean;
  }>({
    accountInfo: false,
    restaurantDetails: false,
    shoppingPreferences: false,
  });

  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [otherProductName, setOtherProductName] = useState("");

  const toggleEdit = (section: keyof typeof editingSections) => {
    if (section === "shoppingPreferences" && !editingSections[section]) {
      const currentProductIds =
        settings.shoppingPreferences.preferredProducts.map((p) => p.id);
      setSelectedProductIds(currentProductIds);
      setShowOtherInput(false);
      setOtherProductName("");
    }

    setEditingSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleSave = (section: keyof typeof editingSections) => {
    if (section === "shoppingPreferences") {
      const newPreferredProducts: {
        id: string;
        name: string;
        category: string;
        isCustom: boolean;
      }[] = [];

      selectedProductIds.forEach((id) => {
        const product = settings.availableProducts.find((p) => p.id === id);
        if (product) {
          newPreferredProducts.push({
            ...product,
            isCustom: false,
          });
        }
      });

      if (showOtherInput && otherProductName.trim()) {
        newPreferredProducts.push({
          id: `custom-${Date.now()}`,
          name: otherProductName.trim(),
          category: "VEGETABLES",
          isCustom: true,
        });
      }

      setSettings((prev: RestaurantSettings) => ({
        ...prev,
        shoppingPreferences: {
          ...prev.shoppingPreferences,
          preferredProducts: newPreferredProducts,
        },
      }));
    }

    console.log(`Saving ${section}:`, settings[section]);
    toggleEdit(section);
  };

  const handleCancel = (section: keyof typeof editingSections) => {
    setSettings(initialSettings);
    setSelectedProductIds([]);
    setShowOtherInput(false);
    setOtherProductName("");
    toggleEdit(section);
  };

  const updateAccountInfo = (field: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      accountInfo: { ...prev.accountInfo, [field]: value },
    }));
  };

  const updateRestaurantDetails = (field: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      restaurantDetails: { ...prev.restaurantDetails, [field]: value },
    }));
  };

  const updateAddress = (field: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      restaurantDetails: {
        ...prev.restaurantDetails,
        address: { ...prev.restaurantDetails.address, [field]: value },
      },
    }));
  };

  const updateDeliveryPreferences = (field: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      shoppingPreferences: {
        ...prev.shoppingPreferences,
        deliveryPreferences: {
          ...prev.shoppingPreferences.deliveryPreferences,
          [field]: value,
        },
      },
    }));
  };

  const handleProductToggle = (productId: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleOtherToggle = () => {
    setShowOtherInput(!showOtherInput);
    if (showOtherInput) {
      setOtherProductName("");
    }
  };

  const days = [
    { key: "monday", label: "Mon" },
    { key: "tuesday", label: "Tue" },
    { key: "wednesday", label: "Wed" },
    { key: "thursday", label: "Thu" },
    { key: "friday", label: "Fri" },
    { key: "saturday", label: "Sat" },
    { key: "sunday", label: "Sun" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      {/* Profile Header */}
      <div className="text-center mb-8">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 mx-auto mb-4">
          <Image
            src={settings.accountInfo.profilePhoto || "/placeholder.svg"}
            alt="Restaurant Profile"
            width={96}
            height={96}
            className="w-full h-full object-cover"
          />
        </div>
        <h1 className="text-xl font-bold text-gray-900">
          {settings.accountInfo.restaurantName}
        </h1>
        <p className="text-gray-600">{settings.restaurantDetails.type}</p>
        <Button variant="outline" size="sm" className="mt-2">
          Change Photo
        </Button>
      </div>

      {/* Account Information Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5" />
            Account Information
          </CardTitle>
          {!editingSections.accountInfo ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleEdit("accountInfo")}
              className="flex items-center gap-2"
            >
              <Edit3 className="h-4 w-4" />
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => handleSave("accountInfo")}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Save
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCancel("accountInfo")}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-600">
                Owner Name
              </label>
              {editingSections.accountInfo ? (
                <Input
                  value={settings.accountInfo.ownerName}
                  onChange={(e) =>
                    updateAccountInfo("ownerName", e.target.value)
                  }
                />
              ) : (
                <p className="text-gray-900 py-2">
                  {settings.accountInfo.ownerName}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-600">
                Restaurant Name
              </label>
              {editingSections.accountInfo ? (
                <Input
                  value={settings.accountInfo.restaurantName}
                  onChange={(e) =>
                    updateAccountInfo("restaurantName", e.target.value)
                  }
                />
              ) : (
                <p className="text-gray-900 py-2">
                  {settings.accountInfo.restaurantName}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-600">
                Email Address
              </label>
              {editingSections.accountInfo ? (
                <Input
                  type="email"
                  value={settings.accountInfo.email}
                  onChange={(e) => updateAccountInfo("email", e.target.value)}
                />
              ) : (
                <p className="text-gray-900 py-2">
                  {settings.accountInfo.email}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-600">
                Phone Number
              </label>
              {editingSections.accountInfo ? (
                <Input
                  type="tel"
                  value={settings.accountInfo.phone}
                  onChange={(e) => updateAccountInfo("phone", e.target.value)}
                />
              ) : (
                <p className="text-gray-900 py-2">
                  {settings.accountInfo.phone}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Restaurant Details Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Settings className="h-5 w-5" />
            Restaurant Details
          </CardTitle>
          {!editingSections.restaurantDetails ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleEdit("restaurantDetails")}
              className="flex items-center gap-2"
            >
              <Edit3 className="h-4 w-4" />
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => handleSave("restaurantDetails")}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Save
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCancel("restaurantDetails")}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Restaurant Type & Hours */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">
                Restaurant Type
              </label>
              {editingSections.restaurantDetails ? (
                <Select
                  value={settings.restaurantDetails.type}
                  onValueChange={(value) =>
                    updateRestaurantDetails("type", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fine Dining">Fine Dining</SelectItem>
                    <SelectItem value="Casual Dining">Casual Dining</SelectItem>
                    <SelectItem value="Fast Food">Fast Food</SelectItem>
                    <SelectItem value="Cafe">Cafe</SelectItem>
                    <SelectItem value="Bakery">Bakery</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-gray-900 py-2">
                  {settings.restaurantDetails.type}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">
                Operating Hours
              </label>
              <div className="flex items-center gap-2 py-1">
                <Clock className="h-4 w-4 text-gray-400" />
                {editingSections.restaurantDetails ? (
                  <div className="flex items-center gap-2">
                    <Input type="time" value="09:00" className="w-24" />
                    <span>to</span>
                    <Input type="time" value="22:00" className="w-24" />
                  </div>
                ) : (
                  <span className="text-gray-900">09:00 to 22:00</span>
                )}
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {days.map((day) => (
                  <span
                    key={day.key}
                    className={`px-2 py-1 text-xs rounded ${
                      settings.restaurantDetails.operatingHours[day.key]?.isOpen
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {day.label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-600">Address</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                {editingSections.restaurantDetails ? (
                  <Input
                    placeholder="Street Address"
                    value={settings.restaurantDetails.address.street}
                    onChange={(e) => updateAddress("street", e.target.value)}
                  />
                ) : (
                  <p className="text-gray-900 py-2">
                    {settings.restaurantDetails.address.street}
                  </p>
                )}
              </div>
              <div>
                {editingSections.restaurantDetails ? (
                  <Input
                    placeholder="Suite/Unit"
                    value={settings.restaurantDetails.address.suite}
                    onChange={(e) => updateAddress("suite", e.target.value)}
                  />
                ) : (
                  <p className="text-gray-900 py-2">
                    {settings.restaurantDetails.address.suite}
                  </p>
                )}
              </div>
              <div>
                {editingSections.restaurantDetails ? (
                  <Input
                    placeholder="City"
                    value={settings.restaurantDetails.address.city}
                    onChange={(e) => updateAddress("city", e.target.value)}
                  />
                ) : (
                  <p className="text-gray-900 py-2">
                    {settings.restaurantDetails.address.city}
                  </p>
                )}
              </div>
              <div>
                {editingSections.restaurantDetails ? (
                  <Input
                    placeholder="State"
                    value={settings.restaurantDetails.address.state}
                    onChange={(e) => updateAddress("state", e.target.value)}
                  />
                ) : (
                  <p className="text-gray-900 py-2">
                    {settings.restaurantDetails.address.state}
                  </p>
                )}
              </div>
              <div>
                {editingSections.restaurantDetails ? (
                  <Input
                    placeholder="ZIP Code"
                    value={settings.restaurantDetails.address.zipCode}
                    onChange={(e) => updateAddress("zipCode", e.target.value)}
                  />
                ) : (
                  <p className="text-gray-900 py-2">
                    {settings.restaurantDetails.address.zipCode}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Location Preview */}
          <div className="w-full h-40 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <MapPin className="h-6 w-6 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">
                {settings.restaurantDetails.address.city},{" "}
                {settings.restaurantDetails.address.state}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shopping Preferences Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ShoppingCart className="h-5 w-5" />
            Shopping Preferences
          </CardTitle>
          {!editingSections.shoppingPreferences ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleEdit("shoppingPreferences")}
              className="flex items-center gap-2"
            >
              <Edit3 className="h-4 w-4" />
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => handleSave("shoppingPreferences")}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Save
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCancel("shoppingPreferences")}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Preferred Products */}
          <div>
            <label className="text-sm font-medium text-gray-600 mb-3 block">
              Preferred Products
            </label>
            {editingSections.shoppingPreferences ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {settings.availableProducts.map((product) => (
                  <label
                    key={product.id}
                    className="flex items-center gap-2 p-2 border rounded hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={selectedProductIds.includes(product.id)}
                      onChange={() => handleProductToggle(product.id)}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-900">
                      {product.name}
                    </span>
                  </label>
                ))}
                <label className="flex items-center gap-2 p-2 border rounded hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={showOtherInput}
                    onChange={handleOtherToggle}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-900">Other</span>
                </label>
                {showOtherInput && (
                  <div className="col-span-full">
                    <Input
                      placeholder="Specify other product..."
                      value={otherProductName}
                      onChange={(e) => setOtherProductName(e.target.value)}
                      className="w-full"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {settings.shoppingPreferences.preferredProducts.map(
                  (product) => (
                    <span
                      key={product.id}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {product.name} {product.isCustom && "(Custom)"}
                    </span>
                  )
                )}
                {settings.shoppingPreferences.preferredProducts.length ===
                  0 && (
                  <p className="text-gray-500 text-sm">
                    No preferred products selected
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Delivery Preferences */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-600 mb-3 block">
                Preferred Delivery Time
              </label>
              <div className="space-y-2">
                {["morning", "afternoon", "evening"].map((timeSlot) => (
                  <label key={timeSlot} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="deliveryTime"
                      value={timeSlot}
                      checked={
                        settings.shoppingPreferences.deliveryPreferences
                          .timeSlot === timeSlot
                      }
                      onChange={(e) =>
                        updateDeliveryPreferences("timeSlot", e.target.value)
                      }
                      disabled={!editingSections.shoppingPreferences}
                      className="text-green-600"
                    />
                    <span className="text-sm text-gray-900">
                      {timeSlot.charAt(0).toUpperCase() + timeSlot.slice(1)} (
                      {timeSlot === "morning"
                        ? "9am-12pm"
                        : timeSlot === "afternoon"
                        ? "1pm-5pm"
                        : "6pm-9pm"}
                      )
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 mb-3 block">
                Special Instructions
              </label>
              {editingSections.shoppingPreferences ? (
                <Textarea
                  value={
                    settings.shoppingPreferences.deliveryPreferences
                      .specialInstructions
                  }
                  onChange={(e) =>
                    updateDeliveryPreferences(
                      "specialInstructions",
                      e.target.value
                    )
                  }
                  placeholder="Any special delivery instructions..."
                  className="w-full h-24"
                />
              ) : (
                <p className="text-gray-900 text-sm bg-gray-50 p-3 rounded border min-h-[96px]">
                  {settings.shoppingPreferences.deliveryPreferences
                    .specialInstructions || "No special instructions"}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
