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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  
  // Verification modal states
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationPhone, setVerificationPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [verificationError, setVerificationError] = useState("");
  
  // Terms agreement modal states
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneForTerms, setPhoneForTerms] = useState("");
  const [phoneError, setPhoneError] = useState("");

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

  const handleVerify = async () => {
    if (!otp.trim()) {
      setVerificationError("Please enter the OTP");
      return;
    }

    setIsVerifying(true);
    setVerificationError("");

    try {
      await authService.verifyRestaurant(verificationPhone, otp);
      setShowVerificationModal(false);
      setOtp("");
      setError("Account verified successfully! Please login again.");
    } catch (err: any) {
      setVerificationError(err.response?.data?.message || "Verification failed");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    setVerificationError("");

    try {
      await authService.resendOTP(verificationPhone);
      setVerificationError("");
      setError("OTP resent successfully!");
    } catch (err: any) {
      setVerificationError(err.response?.data?.message || "Failed to resend OTP");
    } finally {
      setIsResending(false);
    }
  };

  const handlePhoneSubmit = () => {
    if (!phoneForTerms.trim() || !isValidPhone(phoneForTerms)) {
      setPhoneError("Please enter a valid phone number");
      return;
    }
    localStorage.setItem("pending_agreement_phone", phoneForTerms);
    window.location.href = "/terms-agreement";
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isBackendAvailable) return;
    setIsLoading(true);

    function isValidTIN(tin: string) {
      return /^[0-9]{9}$/.test(tin);
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
      
      // Handle both old and new response structures
      const user = response.data?.user || response.data?.data?.user;
      const userRole = user?.role;
      
      if (userRole) {
        const redirectPath = getRedirectPath(userRole as UserRole);
        window.location.href = redirectPath;
      } else {
        setError("User role not found. Please contact support.");
        setIsLoading(false);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Login failed";
      
      // Check if error is about unverified account
      if (errorMessage.toLowerCase().includes("not verified")) {
        const phone = isValidPhone(identifier) ? identifier : "";
        setVerificationPhone(phone);
        setShowVerificationModal(true);
        setError("");
      } 
      // Check if error is about terms agreement
      else if (errorMessage.toLowerCase().includes("terms and conditions") || errorMessage.toLowerCase().includes("must agree")) {
        // If identifier is email or phone, store it and redirect
        if (identifier.includes("@")) {
          localStorage.setItem("pending_agreement_email", identifier.toLowerCase());
          window.location.href = "/terms-agreement";
        } else if (isValidPhone(identifier)) {
          localStorage.setItem("pending_agreement_phone", identifier);
          window.location.href = "/terms-agreement";
        } else {
          // If TIN, ask for phone number
          setShowPhoneModal(true);
          setError("");
        }
      } 
      else if (errorMessage.toLowerCase().includes("email") || errorMessage.toLowerCase().includes("identifier")) {
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
    <>
      <div className="w-full max-w-3xl flex">
        <div className="hidden lg:flex w-1/2 bg-white p-8 flex-col justify-center rounded-none shadow">
          <h2 className="text-ms font-medium text-gray-900 mb-4">
            Welcome Back!
          </h2>
          <p className="text-xs text-gray-900">
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

          <h2 className="text-ms font-bold text-gray-900 mb-4">
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
                  if (identifierError) setIdentifierError("");
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
                  if (passwordError) setPasswordError("");
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
                <span className="ml-2 text-xs">Remember me</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-green-600 hover:text-green-700 text-xs"
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
            <p className="text-xs text-gray-900">
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

      {/* Verification Modal */}
      <Dialog open={showVerificationModal} onOpenChange={setShowVerificationModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Verify Your Account</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Your account is not verified yet. Please enter the OTP sent to your phone number.
            </p>
            
            {verificationError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
                {verificationError}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <Input
                type="text"
                value={verificationPhone}
                onChange={(e) => setVerificationPhone(e.target.value)}
                placeholder="Enter phone number"
                className="h-10 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                OTP Code
              </label>
              <Input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP"
                className="h-10 text-sm"
                maxLength={6}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleVerify}
                disabled={isVerifying}
                className="flex-1 h-10 bg-green-700 hover:bg-green-800 text-white text-sm font-medium flex items-center justify-center gap-2"
              >
                {isVerifying && <Loader2 className="h-4 w-4 animate-spin" />}
                {isVerifying ? "Verifying..." : "Verify"}
              </button>
              
              <button
                onClick={handleResendOTP}
                disabled={isResending || !verificationPhone}
                className="flex-1 h-10 bg-gray-200 hover:bg-gray-300 text-gray-900 text-sm font-medium flex items-center justify-center gap-2"
              >
                {isResending && <Loader2 className="h-4 w-4 animate-spin" />}
                {isResending ? "Resending..." : "Resend OTP"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Phone Number Modal for Terms Agreement */}
      <Dialog open={showPhoneModal} onOpenChange={setShowPhoneModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Phone Number Required</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Please provide your phone number to proceed with accepting the terms and conditions.
            </p>
            
            {phoneError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
                {phoneError}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <Input
                type="text"
                value={phoneForTerms}
                onChange={(e) => {
                  setPhoneForTerms(e.target.value);
                  if (phoneError) setPhoneError("");
                }}
                placeholder="Enter phone number"
                className="h-10 text-sm"
              />
            </div>

            <button
              onClick={handlePhoneSubmit}
              className="w-full h-10 bg-green-700 hover:bg-green-800 text-white text-sm font-medium"
            >
              Continue
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function LoginPage() {
  return (
    <div className=" bg-white">
      <div className="md:h-32 h-20 mt-12 w-full flex items-center justify-center bg-gray-100">
        <h1 className="text-xl font-bold text-black">My Account</h1>
      </div>
      <div className="flex items-center justify-center py-6  px-6 lg:px-8">
        <LoginForm />
      </div>
    </div>
  );
}
