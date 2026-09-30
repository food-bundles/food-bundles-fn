/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RolePicker, toRolePayload } from "../../../_components/role-picker";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";

interface CreateAdminModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
  onCreate: (data: any) => Promise<void>;
}

export function CreateAdminModal({
  open,
  onOpenChange,
  onUpdate,
  onCreate,
}: CreateAdminModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    location: "",
    password: "",
    role: "",
  });

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      newErrors.email = "Enter a valid email address";
    if (formData.phone && !formData.phone.match(/^\+?[0-9]{9,15}$/))
      newErrors.phone = "Enter a valid phone number (9-15 digits)";
    if (formData.password.length < 8)
      newErrors.password = "Password must be at least 8 characters";
    else if (!/[A-Z]/.test(formData.password))
      newErrors.password = "Password must contain at least one uppercase letter";
    else if (!/[0-9]/.test(formData.password))
      newErrors.password = "Password must contain at least one number";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.username ||
      !formData.email ||
      !formData.password ||
      !formData.role
    ) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (!validate()) return;

    setIsLoading(true);
    try {
      // A dashboard role is sent as adminRoleId; built-in types as role
      const { role, ...rest } = formData;
      await onCreate({ ...rest, ...toRolePayload(role) });
      toast.success("Admin created successfully");
      setFormData({
        username: "",
        email: "",
        phone: "",
        location: "",
        password: "",
        role: "",
      });
      onOpenChange(false);
      onUpdate();
    } catch (error: any) {
      console.error("Failed to create admin:", error);
      toast.error(error.message || "Failed to create admin");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({ username: "", email: "", phone: "", location: "", password: "", role: "" });
    setErrors({});
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] bg-white text-gray-900 border-gray-200 flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="flex items-center gap-2 text-gray-900">
            <UserPlus className="h-5 w-5" />
            Create New Admin
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Add a new administrator to the system
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto scrollbar-thin px-6 flex-1">
          <form onSubmit={handleSubmit} className="py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-gray-900">
                    Username <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        username: e.target.value,
                      }))
                    }
                    disabled={isLoading}
                    className="bg-white border-gray-300 text-gray-900"
                    placeholder="Enter username"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-900">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, email: e.target.value }));
                      setErrors((prev) => ({ ...prev, email: "" }));
                    }}
                    disabled={isLoading}
                    className={`bg-white border-gray-300 text-gray-900 ${errors.email ? "border-red-500" : ""}`}
                    placeholder="Enter email address"
                  />
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-gray-900">
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, phone: e.target.value }));
                      setErrors((prev) => ({ ...prev, phone: "" }));
                    }}
                    disabled={isLoading}
                    className={`bg-white border-gray-300 text-gray-900 ${errors.phone ? "border-red-500" : ""}`}
                    placeholder="Enter phone number"
                  />
                  {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-gray-900">
                    Location
                  </Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        location: e.target.value,
                      }))
                    }
                    disabled={isLoading}
                    className="bg-white border-gray-300 text-gray-900"
                    placeholder="Enter location"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-900">
                    Password <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, password: e.target.value }));
                      setErrors((prev) => ({ ...prev, password: "" }));
                    }}
                    disabled={isLoading}
                    className={`bg-white border-gray-300 text-gray-900 ${errors.password ? "border-red-500" : ""}`}
                    placeholder="Enter password"
                  />
                  {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role" className="text-gray-900">
                    Role <span className="text-red-500">*</span>
                  </Label>
                  <RolePicker
                    value={formData.role}
                    onChange={(value) =>
                      setFormData((prev) => ({ ...prev, role: value }))
                    }
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        <DialogFooter className="px-6 pb-6 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
            className="bg-white border-gray-300 text-gray-900 hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isLoading ? "Creating..." : "Create User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
