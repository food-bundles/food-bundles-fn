/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
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
  X,
  ArrowLeft,
} from "lucide-react";
import {
  ICreateFarmerData,
  ICreateRestaurantData,
  UserRole,
} from "@/lib/types";
import { authService } from "@/app/services/authService";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onBackToLogin: () => void;
  signupData: {
    isBackendAvailable: boolean;
    message?: string;
    userCount?: number;
  };
};

export function SignupModal({
  isOpen,
  onClose,
  onBackToLogin,
  signupData,
}: Props) {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);

  const [locationData, setLocationData] = useState({
    textAddress: "",
  });

  React.useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      setSelectedRole(null);
      setError("");
      setSuccess("");
      setShowPassword(false);
      setLocationData({ textAddress: "" });
    }
  }, [isOpen]);

  function isValidPhone(phone: string) {
    return /^\+?[0-9]{10,15}$/.test(phone);
  }

  const handleLocationChange = (value: string) => {
    setLocationData({ textAddress: value });
  };

  const handleClose = () => {
    if (isLoading) return;
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
      setSelectedRole(null);
      setError("");
      setSuccess("");
      setShowPassword(false);
      setLocationData({ textAddress: "" });
    }, 300);
  };

  const handleBackToLogin = () => {
    if (isLoading) return;
    setIsAnimating(false);
    setTimeout(() => {
      onBackToLogin();
      setSelectedRole(null);
      setError("");
      setSuccess("");
      setLocationData({ textAddress: "" });
    }, 300);
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const name = formData.get("name") as string;
    const locationToSave = locationData.textAddress.trim();

    if (!phone) {
      setError("Phone number is required");
      setIsLoading(false);
      return;
    }
    if (!isValidPhone(phone)) {
      setError("Invalid phone number. Format should be like +250783456789.");
      setIsLoading(false);
      return;
    }
    if (!locationToSave) {
      setError("Location is required");
      setIsLoading(false);
      return;
    }
    if (!password) {
      setError("Password is required");
      setIsLoading(false);
      return;
    }
    if (selectedRole === UserRole.RESTAURANT) {
      if (!email) {
        setError("Email is required for restaurants");
        setIsLoading(false);
        return;
      }
      if (!name) {
        setError("Restaurant name is required");
        setIsLoading(false);
        return;
      }
    }

    try {
      if (selectedRole === UserRole.FARMER) {
        const farmerData: ICreateFarmerData = {
          email,
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
        handleBackToLogin();
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

  if (!isOpen) return null;

  if (!selectedRole) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div
          className={`absolute inset-0 bg-black transition-opacity duration-300 ${
            isAnimating ? "opacity-50" : "opacity-0"
          }`}
          onClick={handleClose}
        />
        <div
          className={`relative bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 overflow-hidden transition-all duration-300 ease-out ${
            isAnimating
              ? "opacity-100 scale-100 translate-x-0"
              : "opacity-0 scale-95 -translate-x-full"
          }`}
          style={{ maxHeight: "90vh" }}
        >
          <div className="flex">
            <div className="w-1/2 bg-green-700 text-white p-8 flex flex-col justify-center relative">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-4">Join Us</h2>
                <p className="text-green-100 text-lg mb-6">
                  Connect with local producers
                  <br />
                  and grow your business.
                </p>
              </div>
            </div>
            <div className="w-1/2 p-8 relative">
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
              <div className="mt-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Choose Your Role
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Select how you want to use Food Bundle
                  </p>
                </div>
                <div className="space-y-4">
                  <Button
                    onClick={() => setSelectedRole(UserRole.FARMER)}
                    variant="outline"
                    className="w-full h-20 border-2 border-gray-200 hover:border-green-500 hover:bg-green-50 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-green-100 p-3 rounded-full">
                        <Tractor className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-gray-900">
                          I'm a Farmer
                        </h3>
                        <p className="text-sm text-gray-600">
                          Sell fresh produce to restaurants
                        </p>
                      </div>
                    </div>
                  </Button>
                  <Button
                    onClick={() => setSelectedRole(UserRole.RESTAURANT)}
                    variant="outline"
                    className="w-full h-20 border-2 border-gray-200 hover:border-green-500 hover:bg-green-50 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-green-100 p-3 rounded-full">
                        <Building2 className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-gray-900">
                          I'm a Restaurant
                        </h3>
                        <p className="text-sm text-gray-600">
                          Source fresh ingredients from local farms
                        </p>
                      </div>
                    </div>
                  </Button>
                </div>
                <div className="mt-8 text-center">
                  <p className="text-sm text-gray-600">
                    Already have an account?{" "}
                    <button
                      onClick={handleBackToLogin}
                      className="text-green-700 hover:text-green-800 font-medium"
                    >
                      Sign in
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Registration Form
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isAnimating ? "opacity-50" : "opacity-0"
        }`}
        onClick={isLoading ? undefined : handleClose}
      />
      <div
        className={`relative bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 overflow-hidden transition-all duration-300 ease-out ${
          isAnimating
            ? "opacity-100 scale-100 translate-x-0"
            : "opacity-0 scale-95 -translate-x-full"
        }`}
        style={{ maxHeight: "90vh" }}
      >
        <div className="flex">
          <div className="w-1/2 bg-green-700 text-white p-8 flex flex-col justify-center relative">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">
                Create{" "}
                {selectedRole === UserRole.FARMER ? "Farmer" : "Restaurant"}{" "}
                Account
              </h2>
              <p className="text-green-100 text-lg">
                Join our community and start
                <br />
                growing your business today.
              </p>
            </div>
          </div>
          <div
            className="w-1/2 p-8 relative overflow-y-auto"
            style={{ maxHeight: "90vh" }}
          >
            <button
              onClick={isLoading ? undefined : handleClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
              disabled={isLoading}
            >
              <X className="h-6 w-6" />
            </button>
            <button
              onClick={isLoading ? undefined : () => setSelectedRole(null)}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4 mt-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">Back to role selection</span>
            </button>

            <div className="mt-4">
              {!signupData.isBackendAvailable && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md text-sm mb-4">
                  {signupData.message}
                </div>
              )}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm mb-4">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm mb-4">
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {selectedRole === UserRole.RESTAURANT && (
                  <div className="relative">
                    <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      name="name"
                      placeholder="Restaurant Name"
                      className="pl-10 h-12 border-gray-300 focus:border-green-500 focus:ring-green-500"
                      disabled={!signupData.isBackendAvailable || isLoading}
                      required
                    />
                  </div>
                )}
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type="email"
                    name="email"
                    placeholder={
                      selectedRole === UserRole.FARMER
                        ? "Email Address (Optional)"
                        : "Email Address"
                    }
                    className="pl-10 h-12 border-gray-300 focus:border-green-500 focus:ring-green-500"
                    disabled={!signupData.isBackendAvailable || isLoading}
                    required={selectedRole === UserRole.RESTAURANT}
                  />
                </div>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    className="pl-10 h-12 border-gray-300 focus:border-green-500 focus:ring-green-500"
                    disabled={!signupData.isBackendAvailable || isLoading}
                    required
                  />
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    value={locationData.textAddress}
                    onChange={(e) => handleLocationChange(e.target.value)}
                    placeholder="Location (e.g. Street, House number)"
                    className="pl-10 h-12 border-gray-300 focus:border-green-700 focus:ring-1 focus:ring-green-700"
                    disabled={!signupData.isBackendAvailable || isLoading}
                    required
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    className="pl-10 pr-12 h-12 border-gray-300 focus:border-green-700 focus:ring-1 focus:ring-green-700"
                    disabled={!signupData.isBackendAvailable || isLoading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={!signupData.isBackendAvailable || isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 bg-green-700 hover:bg-green-800 text-white font-medium rounded-md"
                  disabled={isLoading || !signupData.isBackendAvailable}
                >
                  {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <button
                    onClick={isLoading ? undefined : handleBackToLogin}
                    className="text-green-700 hover:text-green-800 font-medium"
                    disabled={isLoading}
                  >
                    Sign in
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
