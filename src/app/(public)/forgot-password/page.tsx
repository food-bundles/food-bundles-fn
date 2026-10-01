/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Loader2, Mail, Phone } from "lucide-react";
import Link from "next/link";
import { authService } from "@/app/services/authService";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [method, setMethod] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await authService.forgotPassword(email);
      setMessage(response.message);
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send reset email");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      await authService.forgotPasswordPhone(phone);
      router.push(`/reset-password-phone?phone=${encodeURIComponent(phone)}`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white">
      <div className="md:h-32 h-20 mt-12 w-full flex items-center justify-center bg-gray-100">
        <h1 className="text-2xl font-bold text-black">Forgot Password</h1>
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
          
          <p className="text-[14px] text-gray-600 mb-6">
            Choose how you&apos;d like to reset your password.
          </p>

          {/* Method tabs */}
          <div className="flex border border-gray-200 rounded-lg mb-6 overflow-hidden">
            <button
              type="button"
              onClick={() => { setMethod("email"); setError(""); setMessage(""); setIsSuccess(false); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-[13px] font-medium transition-colors ${
                method === "email"
                  ? "bg-green-700 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Mail className="w-4 h-4" />
              Email
            </button>
            <button
              type="button"
              onClick={() => { setMethod("phone"); setError(""); setMessage(""); setIsSuccess(false); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-[13px] font-medium transition-colors ${
                method === "phone"
                  ? "bg-green-700 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Phone className="w-4 h-4" />
              Phone
            </button>
          </div>

          {method === "email" ? (
            !isSuccess ? (
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-10 text-[13px] border-gray-300 focus:border-green-500 focus:ring-green-500 text-gray-900"
                    disabled={isLoading}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full h-10 bg-green-700 hover:bg-green-800 text-white text-[14px] font-medium flex items-center justify-center gap-2"
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>
            ) : (
              <div className="text-center">
                <p className="text-[14px] text-gray-600 mb-4">
                  Check your email for the password reset link.
                </p>
              </div>
            )
          ) : (
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div>
                <Input
                  type="tel"
                  placeholder="Enter your phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-10 text-[13px] border-gray-300 focus:border-green-500 focus:ring-green-500 text-gray-900"
                  disabled={isLoading}
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full h-10 bg-green-700 hover:bg-green-800 text-white text-[14px] font-medium flex items-center justify-center gap-2"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {isLoading ? "Sending OTP..." : "Send OTP"}
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
