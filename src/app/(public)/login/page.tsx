/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { ILoginData, UserRole } from "@/lib/types";
import { authService } from "@/app/services/authService";
import { getPostLoginPath, sanitizeRedirect } from "@/lib/navigations";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GoogleLogin } from "@react-oauth/google";
import { AuthPanel, authInput, authPrimaryButton, authSecondaryButton } from "@/components/home/auth-panel";

function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [identifierError, setIdentifierError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isBackendAvailable, setIsBackendAvailable] = useState(true);
  const [backendMessage, setBackendMessage] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [redirectTarget, setRedirectTarget] = useState("");
  
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

  // Explain why the user landed here (set by middleware / axios 401 handler)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reason = params.get("reason");
    const redirect = sanitizeRedirect(params.get("redirect"));

    if (redirect) setRedirectTarget(redirect);
    if (reason === "expired") {
      setInfoMessage("Your session has expired. Please log in again to continue.");
    } else if (redirect) {
      setInfoMessage("Please log in to continue.");
    }
  }, []);

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

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      setError("");
      setIsLoading(true);

      const response = await authService.googleLogin(credentialResponse.credential);

      // If user not found, redirect to Google signup page
      if (response.userNotFound) {
        const params = new URLSearchParams({
          email: response.email,
          name: response.name || "",
        });
        window.location.href = `/google-signup?${params.toString()}`;
        return;
      }

      // If user has not accepted the terms yet, take them to the agreement page
      if (response.needsTermsAgreement) {
        localStorage.setItem("pending_agreement_email", response.email || "");
        window.location.href = "/terms-agreement";
        return;
      }

      // User found, store token and redirect
      const user = response.data?.user;
      const token = response.token;
      const userRole = user?.role;

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

      if (userRole) {
        if (userRole === "TRADER") {
          const traderUrl = `${process.env.NEXT_PUBLIC_TRADER_APP_URL}?token=${encodeURIComponent(token)}`;
          window.location.href = traderUrl;
        } else {
          const pendingRedirect = localStorage.getItem("pendingRedirect");
          if (pendingRedirect) localStorage.removeItem("pendingRedirect");
          const redirectPath = getPostLoginPath(
            userRole as UserRole,
            new URLSearchParams(window.location.search).get("redirect") ||
              pendingRedirect
          );
          window.location.href = redirectPath;
        }
      } else {
        setError("User role not found. Please contact support.");
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Google login failed";
      
      // Check if error is about unverified account
      if (errorMessage.toLowerCase().includes("not verified")) {
        setError("Your account is not verified yet. Please verify your account first.");
      } 
      // Check if error is about terms agreement
      else if (errorMessage.toLowerCase().includes("terms and conditions") || errorMessage.toLowerCase().includes("must agree")) {
        setError("Please accept the Terms and Conditions first.");
      } 
      else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("Google sign-in failed. Please try again.");
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
      
      // Clear credentials from localStorage on successful login if not remembering
      if (!rememberMe) {
        localStorage.removeItem('loginIdentifier');
        localStorage.removeItem('loginPassword');
        localStorage.removeItem('rememberMe');
      }
      
      // Handle both old and new response structures
      const user = response.data?.user || response.data?.data?.user;
      const userRole = user?.role;
      let token = response.data?.token;
      
      // Fallback: get token from cookies if not in response
      if (!token) {
        const cookies = document.cookie.split(";");
        for (const cookie of cookies) {
          const [name, value] = cookie.trim().split("=");
          if (name === "auth-token") {
            token = decodeURIComponent(value);
            break;
          }
        }
      }
      
      if (userRole) {
        if (userRole === "TRADER") {
          const traderUrl = `${process.env.NEXT_PUBLIC_TRADER_APP_URL}?token=${encodeURIComponent(token)}`;
          window.location.href = traderUrl;
        } else {
          const pendingRedirect = localStorage.getItem("pendingRedirect");
          if (pendingRedirect) localStorage.removeItem("pendingRedirect");
          const redirectPath = getPostLoginPath(
            userRole as UserRole,
            new URLSearchParams(window.location.search).get("redirect") ||
              pendingRedirect
          );
          window.location.href = redirectPath;
        }
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
      <div className="grid w-full max-w-[1040px] overflow-hidden rounded-[24px] bg-white shadow-[0_40px_80px_-30px_#0B2E1F66] lg:grid-cols-2">
        <div className="hidden lg:flex">
          <AuthPanel
            kicker="MEMBERS MARKET"
            title="Welcome back."
            text="Sign in to order, track deliveries and manage your Food Bundles account."
            points={[
              "Fresh produce, meat and drinks from the farm gate",
              "Pay by mobile money or your Food Bundles Card",
              "Track every order from hub to kitchen",
            ]}
          />
        </div>

        {/* Right form section */}
        <div className="w-full p-6 sm:p-10">
          {!isBackendAvailable && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-xl text-sm mb-4">
              {backendMessage}
            </div>
          )}
          {infoMessage && !error && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-xl text-sm mb-4">
              {infoMessage}
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-4">
              {error}
            </div>
          )}

          <h2 className="fb-display text-[28px] font-bold tracking-[-0.6px] text-[#0B2E1F] mb-1">
            Sign in
          </h2>
          <p className="text-[15px] text-[#4A6358] mb-6">Use your email, TIN number or phone.</p>
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
                className={`${authInput} ${
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
                className={`${authInput} ${
                  passwordError ? "border-red-500" : "border-gray-300"
                }`}
                disabled={!isBackendAvailable || isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-1 top-1 flex h-10 w-10 items-center justify-center rounded-full text-[#4A6358] hover:text-[#0B2E1F] cursor-pointer"
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
              <label className="flex items-center text-[15px] text-[#4A6358] cursor-pointer">
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
                className="text-[15px] font-bold text-[#007A35] hover:text-[#0B2E1F]"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className={`w-full flex items-center justify-center gap-2 ${authPrimaryButton}`}
              disabled={isLoading || !isBackendAvailable}
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-[#4A6358]">Or continue with</span>
            </div>
          </div>

          <div className="flex justify-center">
            <div className={isLoading || !isBackendAvailable ? "pointer-events-none opacity-50" : ""}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="outline"
                size="large"
                text="signin_with"
                shape="rectangular"
              />
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-[15px] text-[#4A6358]">
              Don't have an account?{" "}
              <Link
                href={
                  redirectTarget
                    ? `/signup?redirect=${encodeURIComponent(redirectTarget)}${
                        redirectTarget.startsWith("/restaurant") ? "&role=restaurant" : ""
                      }`
                    : "/signup"
                }
                className="font-bold text-[#007A35] hover:text-[#0B2E1F]"
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
                className={`flex-1 flex items-center justify-center gap-2 ${authPrimaryButton}`}
              >
                {isVerifying && <Loader2 className="h-4 w-4 animate-spin" />}
                {isVerifying ? "Verifying..." : "Verify"}
              </button>
              
              <button
                onClick={handleResendOTP}
                disabled={isResending || !verificationPhone}
                className={`flex-1 flex items-center justify-center gap-2 ${authSecondaryButton}`}
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
              className={`w-full ${authPrimaryButton}`}
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
    <div>
      <div className="flex items-center justify-center px-4 py-10 sm:px-8 sm:py-16">
        <LoginForm />
      </div>
    </div>
  );
}
