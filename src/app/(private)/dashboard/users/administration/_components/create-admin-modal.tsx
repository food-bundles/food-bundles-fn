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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    location: "",
    password: "",
    role: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username || !formData.email || !formData.password || !formData.role) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    try {
      await onCreate(formData);
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
    setFormData({
      username: "",
      email: "",
      phone: "",
      location: "",
      password: "",
      role: "",
    });
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
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
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
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    disabled={isLoading}
                    className="bg-white border-gray-300 text-gray-900"
                    placeholder="Enter email address"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-gray-900">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    disabled={isLoading}
                    className="bg-white border-gray-300 text-gray-900"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-gray-900">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
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
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    disabled={isLoading}
                    className="bg-white border-gray-300 text-gray-900"
                    placeholder="Enter password"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role" className="text-gray-900">
                    Role <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN">ADMIN</SelectItem>
                      <SelectItem value="AGGREGATOR">AGGREGATOR</SelectItem>
                      <SelectItem value="LOGISTICS">LOGISTICS</SelectItem>
                    </SelectContent>
                  </Select>
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