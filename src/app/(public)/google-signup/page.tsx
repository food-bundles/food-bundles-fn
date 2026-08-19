/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, Suspense } from "react";
import { Input } from "@/components/ui/input";
import { Loader2, UserRoundCheck, MapPin } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { authService } from "@/app/services/authService";
import { getRedirectPath } from "@/lib/navigations";
import { UserRole } from "@/lib/types";

function GoogleSignupForm() {
  const searchParams = useSearchParams();
  const email = searchParams?.get("email") || "";
  const name = searchParams?.get("name") || "";

  const [selectedRole, setSelectedRole] = useState<"FARMER" | "RESTAURANT" | "HOTEL">("FARMER");
  const [phone, setPhone] = useState("");
  const [tin, setTin] = useState("");
  const [location, setLocation] = useState("");
  const [restaurantName, setRestaurantName] = useState(name);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState<{
    phone?: string;
    tin?: string;
    location?: string;
    name?: string;
  }>({});

  useEffect(() => {
    if (!email) {
      setError("No email provided. Please sign in with Google again.");
    }
  }, [email]);

  function validatePhone(phone: string): string | null {
    if (!phone.trim()) return "Phone number is required";
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");
    if (!/^\+?[0-9]{10,15}$/.test(cleanPhone)) {
      return "Please enter a valid phone number (10-15 digits)";
    }
    return null;
  }

  function validateTIN(tin: string): string | null {
    if (!tin.trim()) return "TIN is required for restaurant/hotel accounts";
    if (!/^[0-9]{9}$/.test(tin) || /^0+$/.test(tin)) {
      return "TIN must be a valid 9-digit number (not all zeros)";
    }
    return null;
  }

  function validateName(name: string): string | null {
    if (!name.trim()) return "Restaurant/Hotel name is required";
    if (name.trim().length < 2) return "Name must be at least 2 characters";
    if (name.trim().length > 100) return "Name is too long (max 100 characters)";
    return null;
  }

  function validateLocation(location: string): string | null {
    if (!location.trim()) return "Location is required";
    if (location.trim().length < 3) return "Please provide a more specific location";
    if (location.trim().length > 255) return "Location is too long";
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) {
      setError("No email provided. Please sign in with Google again.");
      return;
    }

    // Validate based on role
    const errors: typeof validationErrors = {};

    if (selectedRole === "RESTAURANT" || selectedRole === "HOTEL") {
      const nameError = validateName(restaurantName);
      if (nameError) errors.name = nameError;

      const tinError = validateTIN(tin);
      if (tinError) errors.tin = tinError;
    }

    const phoneError = validatePhone(phone);
    if (phoneError) errors.phone = phoneError;

    const locationError = validateLocation(location);
    if (locationError) errors.location = locationError;

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setIsLoading(true);
    setError("");
    setValidationErrors({});

    try {
      const response = await authService.googleSignup({
        email,
        name: selectedRole === "FARMER" ? name : restaurantName,
        role: selectedRole,
        phone,
        tin: selectedRole === "RESTAURANT" || selectedRole === "HOTEL" ? tin : undefined,
        location,
      });

      const user = response.data?.user;
      const token = response.token;
      const userRole = user?.role;

      // Store token and user data
      if (token) {
        document.cookie = `auth-token=${token}; path=/; max-age=86400; secure; samesite=strict`;
      }

      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
        if (user.role) {
          document.cookie = `user-role=${user.role}; path=/; max-age=86400; secure; samesite=strict`;
        }
        if (user.restaurantId) {
          localStorage.setItem("restaurantId", user.restaurantId);
        }
      }

      // Redirect based on role
      if (userRole) {
        const redirectPath = getRedirectPath(userRole as UserRole);
        window.location.href = redirectPath;
      } else {
        window.location.href = "/login";
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md bg-white p-8 shadow">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm mb-4">
          {error}
        </div>
      )}

      <h2 className="text-[18px] font-bold text-gray-900 mb-2">
        Complete Your Registration
      </h2>
      
      <p className="text-[14px] text-gray-600 mb-1">
        Signing up as: <span className="font-medium text-gray-900">{email}</span>
      </p>
      {name && (
        <p className="text-[14px] text-gray-600 mb-6">
          Name: <span className="font-medium text-gray-900">{name}</span>
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Role Selection */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-700">
            I am a
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setSelectedRole("FARMER")}
              className={`flex-1 h-12 border flex items-center justify-center gap-1.5 transition-all rounded px-1 text-[13px] sm:text-[14px] cursor-pointer ${
                selectedRole === "FARMER"
                  ? "border-green-500 bg-green-50 text-green-700 font-medium"
                  : "border-gray-200 hover:border-green-300 text-gray-700"
              }`}
              disabled={isLoading}
            >
              <span>Farmer</span>
              {selectedRole === "FARMER" && (
                <UserRoundCheck className="h-4 w-4 text-green-600 shrink-0" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setSelectedRole("RESTAURANT")}
              className={`flex-1 h-12 border flex items-center justify-center gap-1.5 transition-all rounded px-1 text-[13px] sm:text-[14px] cursor-pointer ${
                selectedRole === "RESTAURANT"
                  ? "border-green-500 bg-green-50 text-green-700 font-medium"
                  : "border-gray-200 hover:border-green-300 text-gray-700"
              }`}
              disabled={isLoading}
            >
              <span>Restaurant</span>
              {selectedRole === "RESTAURANT" && (
                <UserRoundCheck className="h-4 w-4 text-green-600 shrink-0" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setSelectedRole("HOTEL")}
              className={`flex-1 h-12 border flex items-center justify-center gap-1.5 transition-all rounded px-1 text-[13px] sm:text-[14px] cursor-pointer ${
                selectedRole === "HOTEL"
                  ? "border-green-500 bg-green-50 text-green-700 font-medium"
                  : "border-gray-200 hover:border-green-300 text-gray-700"
              }`}
              disabled={isLoading}
            >
              <span>Hotel</span>
              {selectedRole === "HOTEL" && (
                <UserRoundCheck className="h-4 w-4 text-green-600 shrink-0" />
              )}
            </button>
          </div>
        </div>

        {/* Restaurant/Hotel Name */}
        {(selectedRole === "RESTAURANT" || selectedRole === "HOTEL") && (
          <div className="relative">
            <Input
              type="text"
              value={restaurantName}
              onChange={(e) => {
                setRestaurantName(e.target.value);
                if (validationErrors.name) setValidationErrors(prev => ({ ...prev, name: undefined }));
              }}
              placeholder={`${selectedRole === "RESTAURANT" ? "Restaurant" : "Hotel"} Name`}
              className={`h-10 text-[13px] border-gray-300 focus:border-green-500 focus:ring-green-500 text-gray-900 ${
                validationErrors.name ? "border-red-500" : ""
              }`}
              disabled={isLoading}
            />
            {validationErrors.name && (
              <p className="text-red-600 text-xs mt-1">{validationErrors.name}</p>
            )}
          </div>
        )}

        {/* Phone Number */}
        <div className="relative">
          <Input
            type="tel"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              if (validationErrors.phone) setValidationErrors(prev => ({ ...prev, phone: undefined }));
            }}
            placeholder="Phone Number"
            className={`h-10 text-[13px] border-gray-300 focus:border-green-500 focus:ring-green-500 text-gray-900 ${
              validationErrors.phone ? "border-red-500" : ""
            }`}
            disabled={isLoading}
          />
          {validationErrors.phone && (
            <p className="text-red-600 text-xs mt-1">{validationErrors.phone}</p>
          )}
        </div>

        {/* TIN Number for Restaurant/Hotel */}
        {(selectedRole === "RESTAURANT" || selectedRole === "HOTEL") && (
          <div className="relative">
            <Input
              type="text"
              value={tin}
              onChange={(e) => {
                setTin(e.target.value);
                if (validationErrors.tin) setValidationErrors(prev => ({ ...prev, tin: undefined }));
              }}
              placeholder="TIN Number (9 digits)"
              className={`h-10 text-[13px] border-gray-300 focus:border-green-500 focus:ring-green-500 text-gray-900 ${
                validationErrors.tin ? "border-red-500" : ""
              }`}
              disabled={isLoading}
              maxLength={9}
            />
            {validationErrors.tin && (
              <p className="text-red-600 text-xs mt-1">{validationErrors.tin}</p>
            )}
          </div>
        )}

        {/* Location */}
        <div className="relative">
          <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-900" />
          <Input
            type="text"
            value={location}
            onChange={(e) => {
              setLocation(e.target.value);
              if (validationErrors.location) setValidationErrors(prev => ({ ...prev, location: undefined }));
            }}
            placeholder="Location (Province, District, Sector...)"
            className={`pl-10 h-10 text-[13px] border-gray-300 focus:border-green-500 focus:ring-green-500 text-gray-900 ${
              validationErrors.location ? "border-red-500" : ""
            }`}
            disabled={isLoading}
          />
          {validationErrors.location && (
            <p className="text-red-600 text-xs mt-1">{validationErrors.location}</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full h-10 bg-green-700 hover:bg-green-800 text-white text-[14px] font-medium flex items-center justify-center gap-2"
          disabled={isLoading || !email}
        >
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          {isLoading ? "Creating Account..." : "Complete Registration"}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link
          href="/login"
          className="text-green-600 hover:text-green-700 text-[13px] font-medium"
        >
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}

export default function GoogleSignupPage() {
  return (
    <div className="bg-white">
      <div className="md:h-32 h-20 mt-12 w-full flex items-center justify-center bg-gray-100">
        <h1 className="text-2xl font-bold text-black">Complete Registration</h1>
      </div>
      
      <div className="flex items-center justify-center py-6 px-6 lg:px-8">
        <Suspense
          fallback={
            <div className="w-full max-w-md bg-white p-8 shadow">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-6"></div>
                <div className="h-10 bg-gray-200 rounded mb-4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </div>
          }
        >
          <GoogleSignupForm />
        </Suspense>
      </div>
    </div>
  );
}
