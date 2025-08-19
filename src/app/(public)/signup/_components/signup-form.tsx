/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  MapPin,
  Phone,
  Building2,
  Tractor,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ICreateFarmerData,
  ICreateRestaurantData,
  UserRole,
} from "@/lib/types";
import { authService } from "@/app/services/authService";

type Props = {
  signupData: {
    isBackendAvailable: boolean;
    message?: string;
    userCount?: number;
  };
};

export function SignupForm({ signupData }: Props) {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  function isValidPhone(phone: string) {
    return /^\+?[0-9]{10,15}$/.test(phone);
  }

async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  setIsLoading(true);
  setError("");
  setSuccess("");

  const formData = new FormData(e.currentTarget);
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const name = formData.get("name") as string;
  const location = formData.get("location") as string;
  

//  if (!name) {
//    setError("Name is required");
//    setIsLoading(false);
//    return;
//  }
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

 if (!location) {
   setError("Location is required");
   setIsLoading(false);
   return;
 }

 if (password !== confirmPassword) {
   setError("Passwords do not match");
   setIsLoading(false);
   return;
 }

 if (!password) {
   setError("Password is required");
   setIsLoading(false);
   return;
 }

 if (selectedRole === "restaurant") {
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
    if (selectedRole === "farmer") {
      const farmerData: ICreateFarmerData = {
        email,
        password,
        location,
        phone,
      };
      await authService.registerFarmer(farmerData);
    } else if (selectedRole === "restaurant") {
      const restaurantData: ICreateRestaurantData = {
        name,
        email,
        password,
        location,
        phone,
      };
      await authService.registerRestaurant(restaurantData);
    }

    setSuccess("Account created successfully! Redirecting to login...");
    setTimeout(() => {
      router.push("/login");
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

  if (!selectedRole) {
    return (
      <Card className="w-full shadow-xl border-0">
        <CardHeader className="text-center pb-2">
          <h2 className="text-2xl font-bold text-gray-900">Choose Your Role</h2>
          <p className="text-gray-600 text-sm">
            Select how you want to use Food Bundle
          </p>
        </CardHeader>

        <CardContent className="p-6 space-y-4">
          <Button
            onClick={() => setSelectedRole("farmer")}
            variant="outline"
            className="w-full h-20 border-2 border-gray-200 hover:border-green-500 hover:bg-green-50 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-full">
                <Tractor className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">
                  I m a Farmer
                </h3>
                <p className="text-sm text-gray-600">
                  Sell fresh produce to restaurants
                </p>
              </div>
            </div>
          </Button>

          <Button
            onClick={() => setSelectedRole("restaurant")}
            variant="outline"
            className="w-full h-20 border-2 border-gray-200 hover:border-green-500 hover:bg-green-50 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-full">
                <Building2 className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">
                  I m a Restaurant
                </h3>
                <p className="text-sm text-gray-600">
                  Source fresh ingredients from local farms
                </p>
              </div>
            </div>
          </Button>

          <div className="text-center pt-4">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-green-600 hover:text-green-700 font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Registration form based on selected role
  return (
    <Card className="w-full shadow-xl border-0">
      <CardHeader className="text-center pb-2">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Button
            onClick={() => setSelectedRole(null)}
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-gray-700"
          >
            ← Back
          </Button>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          Create {selectedRole === "farmer" ? "Farmer" : "Restaurant"} Account
        </h2>
        <p className="text-gray-600 text-sm">Join our community today</p>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {!signupData.isBackendAvailable && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md text-sm">
            {signupData.message}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {selectedRole === "restaurant" && (
            <div className="relative">
              <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                name="name"
                placeholder="Restaurant Name"
                className="pl-10 h-12 border-gray-300 focus:border-green-500 focus:ring-green-500"
                disabled={!signupData.isBackendAvailable}
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              type="email"
              name="email"
              placeholder={
                selectedRole === "farmer"
                  ? "Email Address (Optional)"
                  : "Email Address"
              }
              className="pl-10 h-12 border-gray-300 focus:border-green-500 focus:ring-green-500"
              disabled={!signupData.isBackendAvailable}
            />
          </div>

          <div className="relative">
            <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              type="tel"
              name="phone"
              placeholder ="Phone Number"
              className="pl-10 h-12 border-gray-300 focus:border-green-500 focus:ring-green-500"
              disabled={!signupData.isBackendAvailable}
            />
          </div>

          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              name="location"
              placeholder="Location (e.g., Kigali, Nyarugenge)"
              className="pl-10 h-12 border-gray-300 focus:border-green-500 focus:ring-green-500"
              disabled={!signupData.isBackendAvailable}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              className="pl-10 pr-10 h-12 border-gray-300 focus:border-green-500 focus:ring-green-500"
              disabled={!signupData.isBackendAvailable}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              disabled={!signupData.isBackendAvailable}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
              className="pl-10 pr-10 h-12 border-gray-300 focus:border-green-500 focus:ring-green-500"
              disabled={!signupData.isBackendAvailable}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              disabled={!signupData.isBackendAvailable}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-green-600 hover:bg-green-700"
            disabled={isLoading || !signupData.isBackendAvailable}
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>

        <div className="relative">
          <Separator />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-sm text-gray-500">
            or continue with
          </span>
        </div>

        <Button
          variant="outline"
          className="w-full h-12 border-gray-300"
          type="button"
          disabled={!signupData.isBackendAvailable}
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </Button>

        <p className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-green-600 hover:text-green-700 font-medium"
          >
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
