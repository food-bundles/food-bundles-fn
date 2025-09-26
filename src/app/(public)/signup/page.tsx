/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Lock,
  MapPin,
  Phone,
  Building2,
  Tractor,
  ArrowLeft,
  UserRoundCheck,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ICreateFarmerData,
  ICreateRestaurantData,
  UserRole,
} from "@/lib/types";
import { authService } from "@/app/services/authService";

interface ValidationErrors {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  password?: string;
}

// Component to handle search params
function SignupSearchParamsHandler({
  setSelectedRole,
}: {
  setSelectedRole: (role: UserRole) => void;
}) {
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if role is preselected via query parameter
    const role = searchParams?.get("role");
    if (role === "restaurant") {
      setSelectedRole(UserRole.RESTAURANT);
    } else if (role === "farmer") {
      setSelectedRole(UserRole.FARMER);
    }
  }, [searchParams, setSelectedRole]);

  return null;
}

// Main signup form component
function SignupForm() {
  const [selectedRole, setSelectedRole] = useState(UserRole.RESTAURANT);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );
  const [isBackendAvailable, setIsBackendAvailable] = useState(true);
  const [backendMessage, setBackendMessage] = useState("");

  const [locationData, setLocationData] = useState({
    textAddress: "",
  });

  const router = useRouter();

  useEffect(() => {
    checkBackendAvailability();
  }, []);

  async function checkBackendAvailability() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/health`, {
        cache: "no-store",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        setIsBackendAvailable(true);
      } else {
        setIsBackendAvailable(false);
        setBackendMessage(
          "Service temporarily unavailable. Please try again later."
        );
      }
    } catch (error) {
      setIsBackendAvailable(false);
      setBackendMessage(
        "Service temporarily unavailable. Please try again later."
      );
    }
  }

  // Professional validation functions
  function validateEmail(email: string): string | null {
    if (!email.trim()) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    if (email.length > 254) return "Email address is too long";
    return null;
  }

  function validatePhone(phone: string): string | null {
    if (!phone.trim()) return "Phone number is required";
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");
    if (!/^\+?[0-9]{10,15}$/.test(cleanPhone)) {
      return "Please enter a valid phone number (10-15 digits)";
    }
    return null;
  }

  function validatePassword(password: string): string | null {
    if (!password) return "Password is required";
    if (password.length < 8)
      return "Password must be at least 8 characters long";
    if (!/(?=.*[a-z])/.test(password))
      return "Password must contain at least one lowercase letter";
    if (!/(?=.*[A-Z])/.test(password))
      return "Password must contain at least one uppercase letter";
    if (!/(?=.*\d)/.test(password))
      return "Password must contain at least one number";
    if (!/(?=.*[@$!%*?&])/.test(password))
      return "Password must contain at least one special character (@$!%*?&)";
    return null;
  }

  function validateRestaurantName(name: string): string | null {
    if (!name.trim()) return "Restaurant name is required";
    if (name.trim().length < 2)
      return "Restaurant name must be at least 2 characters";
    if (name.trim().length > 100)
      return "Restaurant name is too long (max 100 characters)";
    if (!/^[a-zA-Z0-9\s\-'&.]+$/.test(name.trim())) {
      return "Restaurant name contains invalid characters";
    }
    return null;
  }

  function validateLocation(location: string): string | null {
    if (!location.trim()) return "Location is required";
    if (location.trim().length < 3)
      return "Please provide a more specific location";
    if (location.trim().length > 255) return "Location is too long";
    return null;
  }

  function validateForm(formData: FormData): ValidationErrors {
    const errors: ValidationErrors = {};

    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;
    const location = locationData.textAddress;

    // Validate restaurant name (only for restaurants)
    if (selectedRole === UserRole.RESTAURANT) {
      const nameError = validateRestaurantName(name);
      if (nameError) errors.name = nameError;
    }

    // Validate email (required for restaurants, optional for farmers)
    if (selectedRole === UserRole.RESTAURANT || (email && email.trim())) {
      const emailError = validateEmail(email);
      if (emailError) errors.email = emailError;
    }

    // Validate phone
    const phoneError = validatePhone(phone);
    if (phoneError) errors.phone = phoneError;

    // Validate location
    const locationError = validateLocation(location);
    if (locationError) errors.location = locationError;

    // Validate password
    const passwordError = validatePassword(password);
    if (passwordError) errors.password = passwordError;

    return errors;
  }

  const handleLocationChange = (value: string) => {
    setLocationData({ textAddress: value });
    // Clear location validation error when user starts typing
    if (validationErrors.location) {
      setValidationErrors((prev) => ({ ...prev, location: undefined }));
    }
  };

  // Clear validation errors when user starts typing
  const handleInputChange = (field: keyof ValidationErrors) => {
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    const formData = new FormData(e.currentTarget);

    // Validate all fields
    const errors = validateForm(formData);

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setIsLoading(false);
      return;
    }

    // Clear validation errors if form is valid
    setValidationErrors({});

    const password = formData.get("password") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const name = formData.get("name") as string;
    const locationToSave = locationData.textAddress.trim();

    try {
      if (selectedRole === UserRole.FARMER) {
        const farmerData: ICreateFarmerData = {
          email: email || undefined, // Make email optional for farmers
          password,
          location: locationToSave,
          phone,
        };
        await authService.registerFarmer(farmerData);
      } else if (selectedRole === UserRole.RESTAURANT) {
        const restaurantData: ICreateRestaurantData = {
          name,
          email,
          password,
          location: locationToSave,
          phone,
        };
        await authService.registerRestaurant(restaurantData);
      }

      setSuccess("Account created successfully! Redirecting to login...");
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } catch (error: any) {
      console.error("Registration error:", error);
      setError(
        error.response?.data?.message || error.message || "Registration failed"
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className=" flex items-center w-full max-w-3xl ">
      {/* Search params handler */}
      <Suspense fallback={null}>
        <SignupSearchParamsHandler setSelectedRole={setSelectedRole} />
      </Suspense>

      {/* Left side: role selection */}
      <div className="w-1/2 p-8 flex flex-col justify-center bg-white">
        <h2 className="text-[16px] font-medium text-black mb-4">
          Choose Your Role
        </h2>

        <div className="flex flex-col space-y-4">
          <button
            onClick={() => setSelectedRole(UserRole.RESTAURANT)}
            className={`w-full h-12 border transition-all relative rounded px-2 text-[14px] cursor-pointer ${
              selectedRole === UserRole.RESTAURANT
                ? "border-green-500 bg-white"
                : "border-gray-200 hover:border-green-500"
            }`}
            disabled={!isBackendAvailable}
          >
            <h3 className="text-left text-gray-900">I'm a Restaurant</h3>
            {selectedRole === UserRole.RESTAURANT && (
              <UserRoundCheck className="absolute top-3 right-3 h-5 w-5 text-green-600" />
            )}
          </button>

          <button
            onClick={() => setSelectedRole(UserRole.FARMER)}
            className={`w-full h-12 border transition-all relative shadow-none rounded px-2 text-[14px] cursor-pointer ${
              selectedRole === UserRole.FARMER
                ? "border-green-500 bg-white"
                : "border-gray-200 hover:border-green-200 "
            }`}
            disabled={!isBackendAvailable}
          >
            <h3 className="text-left text-gray-900">I'm a Farmer</h3>
            {selectedRole === UserRole.FARMER && (
              <UserRoundCheck className="absolute top-3 right-3 h-5 w-5 text-green-600" />
            )}
          </button>
        </div>
      </div>

      {/* Vertical divider */}
      <div className="w-[.5px] bg-gray-300 h-100" />

      {/* Right side: form */}
      <div className="w-1/2 p-8">
        {!isBackendAvailable && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md text-sm mb-4">
            {backendMessage}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm mb-4">
            {success}
          </div>
        )}

        <div>
          <h2 className="text-[18px] font-bold text-gray-900 mb-4">
            Create {selectedRole === UserRole.FARMER ? "Farmer" : "Restaurant"}{" "}
            Account
          </h2>
          <p className="text-gray-900 text-[14px] mb-6">
            Thank you for choosing Food Bundles.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {selectedRole === UserRole.RESTAURANT && (
              <div className="relative">
                <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-900" />
                <Input
                  type="text"
                  name="name"
                  placeholder="Restaurant Name"
                  className={`pl-10 h-10 border-gray-300 text-gray-900 focus:border-green-500 focus:ring-green-500 rounded-none ${
                    validationErrors.name
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : ""
                  }`}
                  disabled={!isBackendAvailable || isLoading}
                  onChange={() => handleInputChange("name")}
                />
                {validationErrors.name && (
                  <p className="text-red-600 text-xs mt-1">
                    {validationErrors.name}
                  </p>
                )}
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-900" />
              <Input
                type="email"
                name="email"
                placeholder={
                  selectedRole === UserRole.FARMER ? "Email " : "Email Address"
                }
                className={`pl-10 h-10 border-gray-300 text-gray-900 focus:border-green-500 focus:ring-green-500 rounded-none ${
                  validationErrors.email
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : ""
                }`}
                disabled={!isBackendAvailable || isLoading}
                onChange={() => handleInputChange("email")}
              />
              {validationErrors.email && (
                <p className="text-red-600 text-xs mt-1">
                  {validationErrors.email}
                </p>
              )}
            </div>

            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-900" />
              <Input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                className={`pl-10 h-10 border-gray-300 text-gray-900 focus:border-green-500 focus:ring-green-500 rounded-none ${
                  validationErrors.phone
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : ""
                }`}
                disabled={!isBackendAvailable || isLoading}
                onChange={() => handleInputChange("phone")}
              />
              {validationErrors.phone && (
                <p className="text-red-600 text-xs mt-1">
                  {validationErrors.phone}
                </p>
              )}
            </div>

            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-900" />
              <Input
                type="text"
                name="location"
                placeholder="Location"
                value={locationData.textAddress}
                onChange={(e) => handleLocationChange(e.target.value)}
                className={`pl-10 h-10 border-gray-300 text-gray-900 focus:border-green-500 focus:ring-green-500 rounded-none ${
                  validationErrors.location
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : ""
                }`}
                disabled={!isBackendAvailable || isLoading}
              />
              {validationErrors.location && (
                <p className="text-red-600 text-xs mt-1">
                  {validationErrors.location}
                </p>
              )}
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-900" />
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                className={`pl-10 h-10 border-gray-300 text-gray-900 focus:border-green-500 focus:ring-green-500 rounded-none ${
                  validationErrors.password
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : ""
                }`}
                disabled={!isBackendAvailable || isLoading}
                onChange={() => handleInputChange("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-900 hover:text-gray-800 cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
              {validationErrors.password && (
                <p className="text-red-600 text-xs mt-1">
                  {validationErrors.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full h-10 bg-green-700 hover:bg-green-800 text-white text-[14px] font-medium cursor-pointer"
              disabled={isLoading || !isBackendAvailable}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating Account...
                </span>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[13px] text-gray-900">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-green-600 hover:text-green-700 font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-6 lg:px-8">
      <Suspense
        fallback={
          <div className="flex items-center w-full max-w-3xl">
            <div className="w-1/2 p-8 flex flex-col justify-center bg-white">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="space-y-4">
                  <div className="h-12 bg-gray-200 rounded"></div>
                  <div className="h-12 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
            <div className="w-[.5px] bg-gray-300 h-100" />
            <div className="w-1/2 p-8">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="space-y-4">
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        }
      >
        <SignupForm />
      </Suspense>
    </div>
  );
}
