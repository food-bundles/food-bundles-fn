/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Loader2, Eye, EyeOff, Check, X } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { authService } from "@/app/services/authService";

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

function ResetPasswordForm() {
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [token, setToken] = useState("");

  const searchParams = useSearchParams();

  useEffect(() => {
    const tokenParam = searchParams?.get("token");
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setError("Invalid or missing reset token");
    }
  }, [searchParams]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("Invalid reset token");
      return;
    }

    const validationError = validatePassword(newPassword);
    if (validationError) {
      setPasswordError(validationError);
      return;
    }

    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await authService.resetPassword(token, newPassword);
      setMessage(response.message);
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
      
      <p className="text-[14px] text-gray-600 mb-6">
        Enter your new password below.
      </p>

      {!isSuccess ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Enter new password"
              value={newPassword}
              onChange={handlePasswordChange}
              className={`h-10 text-[13px] border-gray-300 focus:border-green-500 focus:ring-green-500 text-gray-900 pr-10 ${
                passwordError
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : ""
              }`}
              disabled={isLoading || !token}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-900 hover:text-gray-800"
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

          {newPassword && (
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-[12px] font-medium text-gray-700 mb-2">
                Password Requirements:
              </p>
              <ul className="space-y-1">
                <li className="flex items-center gap-2 text-[11px]">
                  {passwordChecks.length ? (
                    <Check className="h-3 w-3 text-green-600" />
                  ) : (
                    <X className="h-3 w-3 text-gray-400" />
                  )}
                  <span className={passwordChecks.length ? "text-green-600" : "text-gray-500"}>
                    At least 8 characters
                  </span>
                </li>
                <li className="flex items-center gap-2 text-[11px]">
                  {passwordChecks.lowercase ? (
                    <Check className="h-3 w-3 text-green-600" />
                  ) : (
                    <X className="h-3 w-3 text-gray-400" />
                  )}
                  <span className={passwordChecks.lowercase ? "text-green-600" : "text-gray-500"}>
                    One lowercase letter
                  </span>
                </li>
                <li className="flex items-center gap-2 text-[11px]">
                  {passwordChecks.uppercase ? (
                    <Check className="h-3 w-3 text-green-600" />
                  ) : (
                    <X className="h-3 w-3 text-gray-400" />
                  )}
                  <span className={passwordChecks.uppercase ? "text-green-600" : "text-gray-500"}>
                    One uppercase letter
                  </span>
                </li>
                <li className="flex items-center gap-2 text-[11px]">
                  {passwordChecks.number ? (
                    <Check className="h-3 w-3 text-green-600" />
                  ) : (
                    <X className="h-3 w-3 text-gray-400" />
                  )}
                  <span className={passwordChecks.number ? "text-green-600" : "text-gray-500"}>
                    One number
                  </span>
                </li>
                <li className="flex items-center gap-2 text-[11px]">
                  {passwordChecks.special ? (
                    <Check className="h-3 w-3 text-green-600" />
                  ) : (
                    <X className="h-3 w-3 text-gray-400" />
                  )}
                  <span className={passwordChecks.special ? "text-green-600" : "text-gray-500"}>
                    One special character (@$!%*?&)
                  </span>
                </li>
              </ul>
            </div>
          )}

          <button
            type="submit"
            className="w-full h-10 bg-green-700 hover:bg-green-800 text-white text-[14px] font-medium flex items-center justify-center gap-2"
            disabled={isLoading || !token}
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isLoading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      ) : (
        <div className="text-center">
          <p className="text-[14px] text-gray-600 mb-4">
            Your password has been reset successfully.
          </p>
          <Link
            href="/login"
            className="w-full h-10 bg-green-700 hover:bg-green-800 text-white text-[14px] font-medium flex items-center justify-center"
          >
            Sign In
          </Link>
        </div>
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
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="bg-white">
      <div className="md:h-32 h-20 mt-12 w-full flex items-center justify-center bg-gray-100">
        <h1 className="text-2xl font-bold text-black">Reset Password</h1>
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
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}