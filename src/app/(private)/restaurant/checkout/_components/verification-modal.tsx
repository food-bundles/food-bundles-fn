/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Shield, Smartphone, Key, Info } from "lucide-react";
import { OTPInput } from "@/components/ui/otp-input";
import { motion, AnimatePresence } from "framer-motion";

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (code: string, verificationType: "OTP" | "2FA") => Promise<void>;
  isVerifying: boolean;
  error: string;
  userPhone?: string;
}

export function VerificationModal({
  isOpen,
  onClose,
  onVerify,
  isVerifying,
  error,
  userPhone,
}: VerificationModalProps) {
  const [verificationType, setVerificationType] = useState<"OTP" | "2FA" | null>(null);
  const [code, setCode] = useState("");
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    if (error) {
      setLocalError(error);
    }
  }, [error]);

  useEffect(() => {
    if (!isOpen) {
      setVerificationType(null);
      setCode("");
      setLocalError("");
    }
  }, [isOpen]);

  const handleVerify = async () => {
    if (!code.trim() || !verificationType) {
      setLocalError("Please enter the verification code");
      return;
    }

    setLocalError("");
    await onVerify(code, verificationType);
  };

  const maskPhone = (phone?: string) => {
    if (!phone) return "***";
    return phone.slice(0, 3) + "****" + phone.slice(-3);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-lg w-full max-w-md shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Verify Payment</h3>
                  <p className="text-sm text-green-100">Secure your voucher transaction</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded"
                disabled={isVerifying}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {!verificationType ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <div className="text-center mb-6">
                  <p className="text-sm text-gray-600">
                    Choose your preferred verification method
                  </p>
                </div>

                {/* OTP Option */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setVerificationType("OTP")}
                  className="w-full p-4 border-2 border-gray-200 hover:border-green-500 rounded-lg transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-50 group-hover:bg-blue-100 rounded-lg transition-colors">
                      <Smartphone className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className="font-semibold text-gray-900 mb-1">SMS Verification</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        Receive a 6-digit code via SMS
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Info className="h-3 w-3" />
                        <span>Sent to {maskPhone(userPhone)}</span>
                      </div>
                    </div>
                  </div>
                </motion.button>

                {/* 2FA Option */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setVerificationType("2FA")}
                  className="w-full p-4 border-2 border-gray-200 hover:border-green-500 rounded-lg transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-purple-50 group-hover:bg-purple-100 rounded-lg transition-colors">
                      <Key className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className="font-semibold text-gray-900 mb-1">Authenticator App</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        Use your authenticator app code
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Info className="h-3 w-3" />
                        <span>Google Authenticator, Authy, etc.</span>
                      </div>
                    </div>
                  </div>
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* Verification Type Header */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  {verificationType === "OTP" ? (
                    <>
                      <Smartphone className="h-5 w-5 text-blue-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">SMS Verification</p>
                        <p className="text-xs text-gray-600">Code sent to {maskPhone(userPhone)}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <Key className="h-5 w-5 text-purple-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Authenticator App</p>
                        <p className="text-xs text-gray-600">Enter your 6-digit code</p>
                      </div>
                    </>
                  )}
                  <button
                    onClick={() => {
                      setVerificationType(null);
                      setCode("");
                      setLocalError("");
                    }}
                    className="text-xs text-green-600 hover:text-green-700 font-medium"
                    disabled={isVerifying}
                  >
                    Change
                  </button>
                </div>

                {/* 2FA Instructions */}
                {verificationType === "2FA" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-start gap-2">
                      <Info className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                      <div className="text-xs text-purple-900 space-y-2">
                        <p className="font-medium">How to get your code:</p>
                        <ol className="list-decimal list-inside space-y-1 ml-2">
                          <li>Open your authenticator app</li>
                          <li>Find "Food Bundles" account</li>
                          <li>Enter the 6-digit code shown</li>
                        </ol>
                        <p className="text-purple-700 mt-2">
                          Example: If your app shows <span className="font-mono font-bold">123 456</span>, enter <span className="font-mono font-bold">123456</span>
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Error Message */}
                <AnimatePresence>
                  {localError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2"
                    >
                      <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>{localError}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* OTP Input */}
                <div className="flex justify-center py-4">
                  <OTPInput
                    value={code}
                    onChange={(value) => {
                      setCode(value);
                      if (localError) setLocalError("");
                    }}
                    disabled={isVerifying}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={onClose}
                    className="flex-1 h-11 border-2 border-gray-300 hover:border-gray-400 text-gray-700 text-sm font-medium transition-all rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isVerifying}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleVerify}
                    className="flex-1 h-11 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white text-sm font-semibold transition-all rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-green-500/30"
                    disabled={isVerifying || !code.trim() || code.length !== 6}
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <Shield className="h-4 w-4" />
                        <span>Verify & Pay</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Security Note */}
                <div className="text-center pt-2">
                  <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                    <Shield className="h-3 w-3" />
                    Your payment is secured with end-to-end encryption
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
