"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function DeliveryForm() {
  const [formData, setFormData] = useState({
    fullName: "John Doe",
    phoneNumber: "(123) 456-7890",
    deliveryAddress: "123 Main St, Apt 4B",
    deliveryInstructions: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Delivery Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => handleChange("fullName", e.target.value)}
              placeholder="Enter your full name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deliveryAddress">Delivery Address</Label>
            <Input
              id="deliveryAddress"
              value={formData.deliveryAddress}
              onChange={(e) => handleChange("deliveryAddress", e.target.value)}
              placeholder="Enter delivery address"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              value={formData.phoneNumber}
              onChange={(e) => handleChange("phoneNumber", e.target.value)}
              placeholder="Enter phone number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deliveryInstructions">
              Delivery Instructions (Optional)
            </Label>
            <Textarea
              id="deliveryInstructions"
              value={formData.deliveryInstructions}
              onChange={(e) =>
                handleChange("deliveryInstructions", e.target.value)
              }
              placeholder="E.g. Leave at the door"
              rows={3}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
