"use client";

import React, { useState, useEffect, Suspense } from "react";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Loader2, UserCheck } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { invitationService, AcceptInvitationData } from "@/app/services/invitationService";
import { toast } from "sonner";

interface ValidationErrors {
  username?: string;
  phone?: string;
  password?: string;
}

function AcceptInvitationForm() {
  const [formData, setFormData] = useState({
    username: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [token, setToken] = useState("");
  
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const tokenParam = searchParams?.get("token");
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      toast.error("Invalid invitation link");
      router.push("/login");
    }
  }, [searchParams, router]);

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\+?[0-9]{10,15}$/.test(formData.phone)) {
      newErrors.phone = "Invalid phone number format";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.password = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    if (!token) {
      toast.error("Invalid invitation token");
      return;
    }

    setIsLoading(true);

    try {
      const acceptData: AcceptInvitationData = {
        token,
        username: formData.username.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
      };

      await invitationService.acceptInvitation(acceptData);
      toast.success("Account created successfully! Please login.");
      router.push("/login");
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to create account";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof ValidationErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="w-full max-w-3xl flex">
      <div className="hidden lg:flex w-1/2 bg-white p-8 flex-col justify-center rounded-none shadow">
        <h2 className="text-[16px] font-medium text-gray-900 mb-4">
          Complete Your Registration
        </h2>
        <p className="text-[14px] text-gray-900">
          You've been invited to join Food Bundles. Complete your account setup to get started.
        </p>
      </div>

      <div className="w-full lg:w-1/2 bg-white p-8 shadow">
        <div className="flex items-center gap-2 mb-6">
          <UserCheck className="h-6 w-6 text-green-600" />
          <h2 className="text-[18px] font-bold text-gray-900">
            Accept Invitation
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="text"
              value={formData.username}
              onChange={(e) => handleInputChange("username", e.target.value)}
              placeholder="Username"
              className={`h-10 text-[13px] focus:border-green-500 focus:ring-green-500 rounded-none text-gray-900 ${
                errors.username ? "border-red-500" : "border-gray-300"
              }`}
              disabled={isLoading}
            />
            {errors.username && (
              <p className="text-red-600 text-xs mt-1">{errors.username}</p>
            )}
          </div>

          <div>
            <Input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              placeholder="Phone number (+250788123456)"
              className={`h-10 text-[13px] focus:border-green-500 focus:ring-green-500 rounded-none text-gray-900 ${
                errors.phone ? "border-red-500" : "border-gray-300"
              }`}
              disabled={isLoading}
            />
            {errors.phone && (
              <p className="text-red-600 text-xs mt-1">{errors.phone}</p>
            )}
          </div>

          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              placeholder="Password"
              className={`h-10 text-[13px] focus:border-green-500 focus:ring-green-500 rounded-none text-gray-900 pr-10 ${
                errors.password ? "border-red-500" : "border-gray-300"
              }`}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-900 hover:text-gray-800"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <div className="relative">
            <Input
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
              placeholder="Confirm Password"
              className={`h-10 text-[13px] focus:border-green-500 focus:ring-green-500 rounded-none text-gray-900 pr-10 ${
                errors.password ? "border-red-500" : "border-gray-300"
              }`}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-3 text-gray-900 hover:text-gray-800"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
            {errors.password && (
              <p className="text-red-600 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full h-10 bg-green-700 hover:bg-green-800 text-white text-[14px] font-medium flex items-center justify-center gap-2"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isLoading ? "Creating Account..." : "Complete Registration"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AcceptInvitationPage() {
  return (
    <div className="bg-white">
      <div className="md:h-32 h-20 mt-12 w-full flex items-center justify-center bg-gray-100">
        <h1 className="text-2xl font-bold text-black">Complete Registration</h1>
      </div>
      <div className="flex items-center justify-center py-6 px-6 lg:px-8">
        <Suspense fallback={<div>Loading...</div>}>
          <AcceptInvitationForm />
        </Suspense>
      </div>
    </div>
  );
}