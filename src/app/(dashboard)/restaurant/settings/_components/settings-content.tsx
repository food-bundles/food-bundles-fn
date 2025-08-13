"use client";

import { useState } from "react";
import Image from "next/image";
import { Edit3, Save, X, MapPin, Clock, Users, Settings } from "lucide-react";
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
    preferredSuppliers: Array<{
      id: string;
      name: string;
      category: string;
      logo: string;
    }>;
    deliveryPreferences: {
      timeSlot: "morning" | "afternoon" | "evening";
      specialInstructions: string;
    };
  };
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

  const toggleEdit = (section: keyof typeof editingSections) => {
    setEditingSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleSave = (section: keyof typeof editingSections) => {
    // Here you would typically save to backend
    console.log(`Saving ${section}:`, settings[section]);
    toggleEdit(section);
  };

  const handleCancel = (section: keyof typeof editingSections) => {
    // Reset to original values
    setSettings(initialSettings);
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
    <div className="space-y-8">
      {/* Account Information Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
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
                  Update Information
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
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600 mb-1 block">
                  Restaurant Name
                </label>
                {editingSections.accountInfo ? (
                  <Input
                    value={settings.accountInfo.restaurantName}
                    onChange={(e) =>
                      updateAccountInfo("restaurantName", e.target.value)
                    }
                    className="w-full"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">
                    {settings.accountInfo.restaurantName}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 mb-1 block">
                  Owner Name
                </label>
                {editingSections.accountInfo ? (
                  <Input
                    value={settings.accountInfo.ownerName}
                    onChange={(e) =>
                      updateAccountInfo("ownerName", e.target.value)
                    }
                    className="w-full"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">
                    {settings.accountInfo.ownerName}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 mb-1 block">
                  Email Address
                </label>
                {editingSections.accountInfo ? (
                  <Input
                    type="email"
                    value={settings.accountInfo.email}
                    onChange={(e) => updateAccountInfo("email", e.target.value)}
                    className="w-full"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">
                    {settings.accountInfo.email}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 mb-1 block">
                  Phone Number
                </label>
                {editingSections.accountInfo ? (
                  <Input
                    type="tel"
                    value={settings.accountInfo.phone}
                    onChange={(e) => updateAccountInfo("phone", e.target.value)}
                    className="w-full"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">
                    {settings.accountInfo.phone}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Photo */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">
                Restaurant Profile Photo
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 mb-4">
                <Image
                  src={settings.accountInfo.profilePhoto || "/placeholder.svg"}
                  alt="Restaurant Profile"
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              </div>
              <Button variant="outline" size="sm">
                Change Photo
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Restaurant Details Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
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
              Save Details
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
          {/* Restaurant Type */}
          <div>
            <label className="text-sm font-medium text-gray-600 mb-2 block">
              Restaurant Type
            </label>
            {editingSections.restaurantDetails ? (
              <Select
                value={settings.restaurantDetails.type}
                onValueChange={(value) =>
                  updateRestaurantDetails("type", value)
                }
              >
                <SelectTrigger className="w-full">
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
              <p className="text-gray-900 font-medium">
                {settings.restaurantDetails.type}
              </p>
            )}
          </div>

          {/* Operating Hours */}
          <div>
            <label className="text-sm font-medium text-gray-600 mb-3 block">
              Operating Hours
            </label>
            <div className="flex flex-wrap gap-2 mb-4">
              {days.map((day) => (
                <Button
                  key={day.key}
                  variant={
                    settings.restaurantDetails.operatingHours[day.key]?.isOpen
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  className="min-w-[60px]"
                  disabled={!editingSections.restaurantDetails}
                >
                  {day.label}
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400" />
                {editingSections.restaurantDetails ? (
                  <>
                    <Input type="time" value="09:00" className="w-24" />
                    <span className="text-gray-500">to</span>
                    <Input type="time" value="22:00" className="w-24" />
                  </>
                ) : (
                  <span className="text-gray-900 font-medium">
                    09:00 to 22:00
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="text-sm font-medium text-gray-600 mb-3 block">
              Address
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                {editingSections.restaurantDetails ? (
                  <Input
                    placeholder="Street Address"
                    value={settings.restaurantDetails.address.street}
                    onChange={(e) => updateAddress("street", e.target.value)}
                  />
                ) : (
                  <p className="text-gray-900 font-medium">
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
                  <p className="text-gray-900 font-medium">
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
                  <p className="text-gray-900 font-medium">
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
                  <p className="text-gray-900 font-medium">
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
                  <p className="text-gray-900 font-medium">
                    {settings.restaurantDetails.address.zipCode}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Restaurant Location Map */}
          <div>
            <label className="text-sm font-medium text-gray-600 mb-3 block">
              Restaurant Location
            </label>
            <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Interactive Map</p>
                <p className="text-sm text-gray-400">
                  Location: {settings.restaurantDetails.address.city},{" "}
                  {settings.restaurantDetails.address.state}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shopping Preferences Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Shopping Preferences</CardTitle>
          {!editingSections.shoppingPreferences ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleEdit("shoppingPreferences")}
              className="flex items-center gap-2"
            >
              <Edit3 className="h-4 w-4" />
              Save Preferences
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
          {/* Preferred Suppliers */}
          <div>
            <label className="text-sm font-medium text-gray-600 mb-3 block">
              Preferred Suppliers
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {settings.shoppingPreferences.preferredSuppliers.map(
                (supplier) => (
                  <div
                    key={supplier.id}
                    className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg"
                  >
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Image
                        src={supplier.logo || "/placeholder.svg"}
                        alt={supplier.name}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {supplier.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {supplier.category}
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Delivery Preferences */}
          <div>
            <label className="text-sm font-medium text-gray-600 mb-3 block">
              Delivery Preferences
            </label>
            <div className="space-y-4">
              <div className="flex gap-4">
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
                      className="text-blue-600"
                    />
                    <span className="capitalize text-gray-900">
                      {timeSlot} (
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

              <div>
                <label className="text-sm font-medium text-gray-600 mb-2 block">
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
                    className="w-full"
                  />
                ) : (
                  <p className="text-gray-900">
                    {
                      settings.shoppingPreferences.deliveryPreferences
                        .specialInstructions
                    }
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
