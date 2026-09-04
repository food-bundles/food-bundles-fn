/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { Input } from "@/components/ui/input";
import { Loader2, Eye, EyeOff, Check, X } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { authService } from "@/app/services/authService";
import { OTPInput } from "@/components/ui/otp-input";

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

function ResetPasswordPhoneForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phoneParam = searchParams?.get("phone") || "";

  const [phone, setPhone] = useState(phoneParam);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [otpSent, setOtpSent] = useState(!!phoneParam);

  const passwordChecks = useMemo(() => ({
    length: newPassword.length >= 8,
    lowercase: /(?=.*[a-z])/.test(newPassword),
    uppercase: /(?=.*[A-Z])/.test(newPassword),
    number: /(?=.*\d)/.test(newPassword),
    special: /(?=.*[@$!%*?&])/.test(newPassword),
  }), [newPassword]);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewPassword(value);
    if (passwordError) {
      setPasswordError("");
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) {
      setError("Phone number is required");
      return;
    }

    setIsSendingOTP(true);
    setError("");
    setMessage("");

    try {
      await authService.forgotPasswordPhone(phone);
      setOtpSent(true);
      setMessage("OTP sent to your phone number");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setIsSendingOTP(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      setError("Please enter the 6-digit OTP");
      return;
    }

    const validationError = validatePassword(newPassword);
    if (validationError) {
      setPasswordError(validationError);
      return;
    }

    if (newPassword !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      await authService.resetPasswordPhone(phone, otp, newPassword);
      setMessage("Password has been reset successfully");
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white">
      <div className="md:h-32 h-20 mt-12 w-full flex items-center justify-center bg-gray-100">
        <h1 className="text-2xl font-bold text-black">Reset Password</h1>
      </div>
      
      <div className="flex items-center justify-center py-6 px-6 lg:px-8">
        <div className="w-full max-w-md bg-white p-8 shadow">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm mb-4">
              {error}
            </div>
          )}

          {message && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 text-sm mb-4">
              {message}
            </div>
          )}

          <h2 className="text-[18px] font-bold text-gray-900 mb-4">
            Reset your password
          </h2>

          {isSuccess ? (
            <div className="text-center">
              <p className="text-[14px] text-gray-600 mb-4">
                Your password has been reset successfully.
              </p>
              <Link
                href="/login"
                className="inline-block w-full h-10 bg-green-700 hover:bg-green-800 text-white text-[14px] font-medium flex items-center justify-center gap-2"
              >
                Sign In
              </Link>
            </div>
          ) : !otpSent ? (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <p className="text-[14px] text-gray-600 mb-4">
                Enter your phone number to receive a one-time password (OTP).
              </p>
              <div>
                <Input
                  type="tel"
                  placeholder="Enter your phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-10 text-[13px] border-gray-300 focus:border-green-500 focus:ring-green-500 text-gray-900"
                  disabled={isSendingOTP}
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full h-10 bg-green-700 hover:bg-green-800 text-white text-[14px] font-medium flex items-center justify-center gap-2"
                disabled={isSendingOTP}
              >
                {isSendingOTP && <Loader2 className="h-4 w-4 animate-spin" />}
                {isSendingOTP ? "Sending OTP..." : "Send OTP"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <p className="text-[14px] text-gray-600">
                Enter the 6-digit OTP sent to <span className="font-medium text-gray-900">{phone}</span> and your new password.
              </p>

              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-2">
                  OTP Code
                </label>
                <OTPInput
                  length={6}
                  value={otp}
                  onChange={setOtp}
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={handlePasswordChange}
                    className="h-10 text-[13px] border-gray-300 focus:border-green-500 focus:ring-green-500 text-gray-900 pr-10"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {passwordError && (
                  <p className="text-[12px] text-red-600 mt-1">{passwordError}</p>
                )}

                {newPassword.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {[
                      { key: "length", label: "At least 8 characters" },
                      { key: "lowercase", label: "One lowercase letter" },
                      { key: "uppercase", label: "One uppercase letter" },
                      { key: "number", label: "One number" },
                      { key: "special", label: "One special character (@$!%*?&)" },
                    ].map(({ key, label }) => (
                      <div key={key} className="flex items-center gap-1.5">
                        {passwordChecks[key as keyof typeof passwordChecks] ? (
                          <Check className="h-3 w-3 text-green-600" />
                        ) : (
                          <X className="h-3 w-3 text-gray-400" />
                        )}
                        <span className={`text-[11px] ${
                          passwordChecks[key as keyof typeof passwordChecks]
                            ? "text-green-600"
                            : "text-gray-500"
                        }`}>
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setConfirmPasswordError(""); }}
                    className={`h-10 text-[13px] border-gray-300 focus:border-green-500 focus:ring-green-500 text-gray-900 pr-10 ${confirmPasswordError ? "border-red-500" : ""}`}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {confirmPasswordError && (
                  <p className="text-[12px] text-red-600 mt-1">{confirmPasswordError}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full h-10 bg-green-700 hover:bg-green-800 text-white text-[14px] font-medium flex items-center justify-center gap-2"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {isLoading ? "Resetting..." : "Reset Password"}
              </button>

              <button
                type="button"
                onClick={() => { setOtpSent(false); setOtp(""); setError(""); setMessage(""); setNewPassword(""); setConfirmPassword(""); setPasswordError(""); setConfirmPasswordError(""); }}
                className="w-full text-[13px] text-gray-500 hover:text-gray-700"
              >
                Change phone number
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-green-600 hover:text-green-700 text-[13px] font-medium"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPhonePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-green-700" />
      </div>
    }>
      <ResetPasswordPhoneForm />
    </Suspense>
  );
}
