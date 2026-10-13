/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle, Loader2, ShieldCheck, Smartphone, Wallet } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { voucherService } from "@/app/services/voucherService";

interface RepaySession {
  id: string;
  rrn: string;
  outstandingAmount: number;
  restaurant: { id: string; name: string; phone?: string };
}

interface AdminRepayVoucherModalProps {
  open: boolean;
  session: RepaySession | null;
  onClose: () => void;
  onPaid: () => void; // reload the table
}

type Method = "MOBILE_MONEY" | "CASH";
const OTP_RESEND_SECONDS = 60;
const POLL_EVERY_MS = 5000;

const errorMessage = (error: any, fallback: string) =>
  error?.response?.data?.message || error?.message || fallback;

/**
 * Admin pays a restaurant's voucher on its behalf.
 * - Mobile money: a payment request (USSD push) goes to the phone typed here;
 *   the restaurant approves it on that phone.
 * - Prepaid wallet: the restaurant gets an OTP, tells it to the admin, and the
 *   amount is taken from the restaurant's wallet.
 */
export default function AdminRepayVoucherModal({
  open,
  session,
  onClose,
  onPaid,
}: AdminRepayVoucherModalProps) {
  const [method, setMethod] = useState<Method>("MOBILE_MONEY");
  const [amount, setAmount] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Mobile money: waiting for the restaurant to approve on the phone
  const [waiting, setWaiting] = useState(false);
  const [waitingNote, setWaitingNote] = useState("");

  // Prepaid wallet OTP
  const [otpSent, setOtpSent] = useState(false);
  const [otpPhone, setOtpPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [resendIn, setResendIn] = useState(0);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const outstanding = session?.outstandingAmount ?? 0;
  const amountNumber = Math.min(parseFloat(amount) || 0, outstanding);
  const amountValid = amountNumber > 0;

  const stopPolling = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = null;
  };

  // Fresh state each time the modal opens for a session
  useEffect(() => {
    if (!open || !session) return;
    setMethod("MOBILE_MONEY");
    setAmount(String(session.outstandingAmount));
    setPhone(session.restaurant.phone || "");
    setSubmitting(false);
    setWaiting(false);
    setWaitingNote("");
    setOtpSent(false);
    setOtpPhone("");
    setOtp("");
    setResendIn(0);
    return stopPolling;
  }, [open, session]);

  // A new amount or method invalidates an OTP that was sent for the old one
  useEffect(() => {
    setOtpSent(false);
    setOtp("");
    setResendIn(0);
  }, [amount, method]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendIn]);

  const finish = (message: string) => {
    stopPolling();
    toast.success(message);
    onPaid();
    onClose();
  };

  const checkStatus = async (manual = false) => {
    if (!session) return;
    try {
      const res = await voucherService.adminVerifyLoanRepayment(session.id);
      const result = res?.data;
      if (result?.verified) {
        finish("Payment received. Voucher updated.");
      } else if (result?.status === "failed") {
        stopPolling();
        setWaiting(false);
        toast.error(result.message || "The payment was not completed");
      } else {
        setWaitingNote(result?.message || "Waiting for the restaurant to approve the payment…");
        if (manual) toast.info("Not paid yet");
      }
    } catch (error: any) {
      if (manual) toast.error(errorMessage(error, "Could not check the payment"));
    }
  };

  const payWithMobileMoney = async () => {
    if (!session) return;
    if (!phone.trim()) {
      toast.error("Enter the phone number to send the payment request to");
      return;
    }
    setSubmitting(true);
    try {
      const res = await voucherService.adminRepayLoanSession(session.id, {
        paymentMethod: "MOBILE_MONEY",
        phoneNumber: phone.trim(),
        amount: amountNumber,
      });
      const result = res?.data;
      if (result?.redirectUrl) {
        // Fallback provider needs its hosted page
        window.open(result.redirectUrl, "_blank");
      }
      setWaiting(true);
      setWaitingNote(res?.message || "Payment request sent. Ask the restaurant to approve it on the phone.");
      stopPolling();
      pollRef.current = setInterval(() => checkStatus(), POLL_EVERY_MS);
    } catch (error: any) {
      toast.error(errorMessage(error, "Failed to send the payment request"));
    } finally {
      setSubmitting(false);
    }
  };

  const sendOtp = async () => {
    if (!session) return;
    setSubmitting(true);
    try {
      const res = await voucherService.requestAdminRepayOTP(session.id, amountNumber);
      setOtpSent(true);
      setOtpPhone(res?.data?.phone || "");
      setOtp("");
      setResendIn(OTP_RESEND_SECONDS);
      toast.success(res?.message || "OTP sent to the restaurant");
    } catch (error: any) {
      toast.error(errorMessage(error, "Failed to send OTP"));
    } finally {
      setSubmitting(false);
    }
  };

  const payWithWallet = async () => {
    if (!session) return;
    setSubmitting(true);
    try {
      const res = await voucherService.adminRepayLoanSession(session.id, {
        paymentMethod: "CASH",
        otp,
        amount: amountNumber,
      });
      finish(res?.message || "Voucher paid from the restaurant's prepaid wallet");
    } catch (error: any) {
      toast.error(errorMessage(error, "Failed to pay from the prepaid wallet"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    stopPolling();
    onClose();
  };

  if (!session) return null;

  const methods: { key: Method; label: string; hint: string; icon: React.ReactNode }[] = [
    {
      key: "MOBILE_MONEY",
      label: "Mobile Money (MoMo)",
      hint: "Send a payment request to a phone",
      icon: <Smartphone className="h-4 w-4" />,
    },
    {
      key: "CASH",
      label: "Prepaid wallet",
      hint: "Use the restaurant's wallet balance",
      icon: <Wallet className="h-4 w-4" />,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={(value) => !value && handleClose()}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold">
            Pay voucher for {session.restaurant.name}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {session.rrn} · Outstanding{" "}
            <span className="font-semibold text-red-600">
              {outstanding.toLocaleString()} RWF
            </span>
          </DialogDescription>
        </DialogHeader>

        {waiting ? (
          // Mobile money: waiting for approval on the phone
          <div className="space-y-4 py-2 text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-green-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                Waiting for payment of {amountNumber.toLocaleString()} RWF
              </p>
              <p className="mt-1 text-xs text-gray-600">{waitingNote}</p>
              <p className="mt-1 text-xs text-gray-500">Sent to {phone}</p>
            </div>
            <div className="flex gap-2">
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={() => checkStatus(true)}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Check payment
              </Button>
              <Button variant="outline" onClick={handleClose}>
                Close
              </Button>
            </div>
            <p className="text-[11px] text-gray-500">
              You can close this. The voucher updates on its own once the payment is approved.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Amount to pay (RWF)
              </label>
              <Input
                type="number"
                min={1}
                max={outstanding}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="h-10 text-sm"
                disabled={submitting}
              />
              {parseFloat(amount) > outstanding && (
                <p className="mt-1 text-xs text-amber-600">
                  More than what is owed. Only {outstanding.toLocaleString()} RWF will be charged.
                </p>
              )}
            </div>

            <div>
              <p className="block text-xs font-medium text-gray-700 mb-1">Payment method</p>
              <div className="grid grid-cols-2 gap-2">
                {methods.map((m) => (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => setMethod(m.key)}
                    disabled={submitting}
                    className={`flex items-start gap-2 rounded-lg border p-3 text-left transition-colors cursor-pointer ${
                      method === m.key
                        ? "border-green-500 bg-green-50 ring-1 ring-green-200"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <span
                      className={`mt-0.5 rounded p-1.5 ${
                        method === m.key ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {m.icon}
                    </span>
                    <span>
                      <span className="block text-sm font-medium text-gray-900">{m.label}</span>
                      <span className="block text-[11px] text-gray-500">{m.hint}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {method === "MOBILE_MONEY" ? (
              <>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Phone number to charge
                  </label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="078XXXXXXX"
                    inputMode="tel"
                    className="h-10 text-sm"
                    disabled={submitting}
                  />
                  <p className="mt-1 text-[11px] text-gray-500">
                    A payment request appears on this phone. The restaurant approves it with their MoMo PIN.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={payWithMobileMoney}
                    disabled={submitting || !amountValid || !phone.trim()}
                  >
                    {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Send payment request
                  </Button>
                  <Button variant="outline" onClick={handleClose} disabled={submitting}>
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 space-y-3">
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-amber-800">
                      The restaurant must agree to use its wallet. Send an OTP to the restaurant&apos;s
                      phone and enter the code they tell you.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={sendOtp}
                      disabled={submitting || !amountValid || resendIn > 0}
                      className="h-9 text-xs bg-white"
                    >
                      {otpSent
                        ? resendIn > 0
                          ? `Resend OTP in ${resendIn}s`
                          : "Resend OTP"
                        : "Send OTP to restaurant"}
                    </Button>
                    {otpSent && (
                      <div className="flex-1">
                        <label className="block text-[11px] text-amber-800 mb-1">
                          OTP sent to {otpPhone || "restaurant phone"}
                        </label>
                        <Input
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                          placeholder="6-digit code"
                          inputMode="numeric"
                          className="h-9 text-sm bg-white tracking-widest"
                          disabled={submitting}
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={payWithWallet}
                    disabled={submitting || !amountValid || !otpSent || otp.length !== 6}
                  >
                    {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Pay {amountValid ? `${amountNumber.toLocaleString()} RWF ` : ""}from wallet
                  </Button>
                  <Button variant="outline" onClick={handleClose} disabled={submitting}>
                    Cancel
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
