/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState, useEffect, Suspense } from "react";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { ILoginData, UserRole } from "@/lib/types";
import { authService } from "@/app/services/authService";
import { getRedirectPath } from "@/lib/navigations";
import { useAuth } from "@/app/contexts/auth-context";
import { useSearchParams } from "next/navigation";

function LoginSearchParamsHandler() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const redirect = searchParams?.get("redirect");
    const reason = searchParams?.get("reason");

    if (redirect) {
      localStorage.setItem("pendingRedirect", redirect);
    }

    if (reason === "expired") {
    }
  }, [searchParams]);

  return null; 
}

function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isBackendAvailable, setIsBackendAvailable] = useState(true);
  const [backendMessage, setBackendMessage] = useState("");

  const { login: authLogin } = useAuth();

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/health`,
          { cache: "no-store", signal: controller.signal }
        );
        clearTimeout(timeoutId);
        if (res.ok) setIsBackendAvailable(true);
        else {
          setIsBackendAvailable(false);
          setBackendMessage(
            "Service temporarily unavailable. Please try later."
          );
        }
      } catch {
        setIsBackendAvailable(false);
        setBackendMessage("Service temporarily unavailable. Please try later.");
      }
    };
    checkBackend();
  }, []);

  function isValidPhone(phone: string) {
    return /^\+?[0-9]{10,15}$/.test(phone);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isBackendAvailable) return;
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const identifier = formData.get("identifier") as string;
    const password = formData.get("password") as string;

    if (!identifier.includes("@") && !isValidPhone(identifier)) {
      setError("Invalid phone number. Must be 10–15 digits or start with '+'.");
      setIsLoading(false);
      return;
    }

    const loginPayload: ILoginData = identifier.includes("@")
      ? { email: identifier.toLowerCase(), password }
      : { phone: identifier, password };

    try {
      const response = await authService.login(loginPayload);
      authLogin(response);

      const pendingRedirect = localStorage.getItem("pendingRedirect");
      if (pendingRedirect) {
        localStorage.removeItem("pendingRedirect");
        window.location.href = pendingRedirect;
        return;
      }

      const userRole = response.data?.user?.role;
      if (userRole) {
        const redirectPath = getRedirectPath(userRole as UserRole);
        window.location.href = redirectPath;
      } else {
        setError("User role not found. Please contact support.");
        setIsLoading(false);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Login failed");
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-3xl flex">
      {/* Left image / info section (optional) */}
      <div className="hidden lg:flex w-1/2 bg-white p-8 flex-col justify-center rounded-none shadow">
        <h2 className="text-[16px] font-medium text-gray-900 mb-4">
          Welcome Back!
        </h2>
        <p className="text-[14px] text-gray-900">
          Sign in to access your Food Bundles account.
        </p>
      </div>

      {/* Right form section */}
      <div className="w-full lg:w-1/2 bg-white p-8  shadow">
        {!isBackendAvailable && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 text-sm mb-4">
            {backendMessage}
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3  text-sm mb-4">
            {error}
          </div>
        )}

        <h2 className="text-[18px] font-bold text-gray-900 mb-4">
          Sign in to your account
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Input
              type="text"
              name="identifier"
              placeholder="Email or Phone"
              className="pl-10 h-10 text-[13px] border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-none text-gray-900"
              disabled={!isBackendAvailable || isLoading}
            />
          </div>

          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              className="pl-10 h-10 text-[13px] border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-none text-gray-900"
              disabled={!isBackendAvailable || isLoading}
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
          </div>

          <div className="flex justify-between items-center">
            <label className="flex items-center text-[13px] text-gray-600">
              <input
                type="checkbox"
                className="w-4 h-4 text-green-700 border-gray-300 rounded focus:ring-green-700"
              />
              <span className="ml-2">Remember me</span>
            </label>
            <Link
              href="/forgot-password"
              className="text-green-600 hover:text-green-700 text-[13px]"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className="w-full h-10 bg-green-700 hover:bg-green-800 text-white text-[14px] font-medium flex items-center justify-center gap-2"
            disabled={isLoading || !isBackendAvailable}
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-[13px] text-gray-900">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="text-green-600 hover:text-green-700 font-medium"
            >
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className=" bg-white">
      <div className="md:h-[8rem] h-[5rem] mt-12 w-full flex items-center justify-center bg-gray-100">
        <h1 className="text-2xl font-bold text-black">My Account</h1>
      </div>
      <div className="flex items-center justify-center py-6  px-6 lg:px-8">
        <Suspense
          fallback={
            <div className="w-full max-w-3xl flex">
              <div className="hidden lg:flex w-1/2 bg-white p-8 flex-col justify-center rounded-none shadow">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
              <div className="w-full lg:w-1/2 bg-white p-8 shadow">
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="space-y-4">
                    <div className="h-10 bg-gray-200 rounded"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          }
        >
          <LoginForm />
        </Suspense>

        <Suspense fallback={null}>
          <LoginSearchParamsHandler />
        </Suspense>
      </div>
    </div>
  );
}
