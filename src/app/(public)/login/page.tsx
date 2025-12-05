/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { ILoginData, UserRole } from "@/lib/types";
import { authService } from "@/app/services/authService";
import { getRedirectPath } from "@/lib/navigations";

function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [identifierError, setIdentifierError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isBackendAvailable, setIsBackendAvailable] = useState(true);
  const [backendMessage, setBackendMessage] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // Load saved credentials on mount
  useEffect(() => {
    const savedIdentifier = localStorage.getItem('loginIdentifier');
    const savedPassword = localStorage.getItem('loginPassword');
    const savedRememberMe = localStorage.getItem('rememberMe') === 'true';
    
    if (savedIdentifier && savedRememberMe) {
      setIdentifier(savedIdentifier);
      setRememberMe(true);
    }
    if (savedPassword && savedRememberMe) {
      setPassword(savedPassword);
    }
  }, []);

  // Save credentials when remember me is checked
  useEffect(() => {
    if (rememberMe) {
      localStorage.setItem('loginIdentifier', identifier);
      localStorage.setItem('loginPassword', password);
      localStorage.setItem('rememberMe', 'true');
    } else {
      localStorage.removeItem('loginIdentifier');
      localStorage.removeItem('loginPassword');
      localStorage.removeItem('rememberMe');
    }
  }, [identifier, password, rememberMe]);


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
    // Don't clear error immediately - let it persist until success

    function isValidTIN(tin: string) {
      return /^[0-9]{9}$/.test(tin); // adjust length if needed
    }

    // Validate identifier
    if (
      !identifier.includes("@") &&
      !isValidPhone(identifier) &&
      !isValidTIN(identifier)
    ) {
      setIdentifierError("Must be email, phone (10–15 digits), or 9-digit TIN");
      setIsLoading(false);
      return;
    }

    // Validate password
    if (!password.trim()) {
      setPasswordError("Password is required");
      setIsLoading(false);
      return;
    }

    const loginPayload: ILoginData = identifier.includes("@")
      ? { email: identifier.toLowerCase(), password }
      : isValidPhone(identifier)
      ? { phone: identifier, password }
      : { tin: identifier, password };

    try {
      // Clear all errors when attempting login
      setError("");
      setIdentifierError("");
      setPasswordError("");
      const response = await authService.login(loginPayload);
      
      const pendingRedirect = localStorage.getItem("pendingRedirect");
      if (pendingRedirect) {
        localStorage.removeItem("pendingRedirect");
        window.location.href = pendingRedirect;
        return;
      }

      // Clear credentials from localStorage on successful login if not remembering
      if (!rememberMe) {
        localStorage.removeItem('loginIdentifier');
        localStorage.removeItem('loginPassword');
        localStorage.removeItem('rememberMe');
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
      const errorMessage = err.response?.data?.message || err.message || "Login failed";
      
      // Show field-specific errors or general error
      if (errorMessage.toLowerCase().includes("email") || errorMessage.toLowerCase().includes("identifier")) {
        setIdentifierError(errorMessage);
      } else if (errorMessage.toLowerCase().includes("password")) {
        setPasswordError(errorMessage);
      } else {
        setError(errorMessage);
      }
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-3xl flex">
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
              value={identifier}
              onChange={(e) => {
                setIdentifier(e.target.value);
                if (identifierError) setIdentifierError(""); // Clear error when user types
              }}
              placeholder="Email/Tin number/Phone"
              className={`pl-10 h-10 text-[13px] focus:border-green-500 focus:ring-green-500 rounded-none text-gray-900 ${
                identifierError ? "border-red-500" : "border-gray-300"
              }`}
              disabled={!isBackendAvailable || isLoading}
            />
            {identifierError && (
              <p className="text-red-600 text-xs mt-1">{identifierError}</p>
            )}
          </div>

          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              name="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordError) setPasswordError(""); // Clear error when user types
              }}
              placeholder="Password"
              className={`pl-10 h-10 text-[13px] focus:border-green-500 focus:ring-green-500 rounded-none text-gray-900 ${
                passwordError ? "border-red-500" : "border-gray-300"
              }`}
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
            {passwordError && (
              <p className="text-red-600 text-xs mt-1">{passwordError}</p>
            )}
          </div>

          <div className="flex justify-between items-center">
            <label className="flex items-center text-[13px] text-gray-600">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
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
      <div className="md:h-32 h-20 mt-12 w-full flex items-center justify-center bg-gray-100">
        <h1 className="text-2xl font-bold text-black">My Account</h1>
      </div>
      <div className="flex items-center justify-center py-6  px-6 lg:px-8">
        <LoginForm />
      </div>
    </div>
  );
}
