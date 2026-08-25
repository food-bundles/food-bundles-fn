"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { voucherService } from "@/app/services/voucherService";
import { CardStatus, IVoucherCard } from "@/lib/types";
import { CreditCard, Copy, Check, ShieldCheck, ShieldOff, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function VoucherCardDisplay() {
  const [card, setCard] = useState<IVoucherCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [requestPending, setRequestPending] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([
      voucherService.getMyVoucherCard().catch(() => null),
      voucherService.getMyCardEnrollmentRequest().catch(() => null),
    ])
      .then(([cardRes, reqRes]) => {
        setCard(cardRes?.data ?? null);
        setRequestPending(reqRes?.data?.status === "PENDING");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const requestCard = async () => {
    setRequesting(true);
    setRequestError(null);
    try {
      await voucherService.requestVoucherCard();
      toast.success("Card request submitted — admin will review shortly");
      setTimeout(load, 800);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Failed to submit card request";
      setRequestError(msg);
    } finally {
      setRequesting(false);
    }
  };

  const copyPan = () => {
    if (!card?.pan) return;
    navigator.clipboard.writeText(card.pan);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatPan = (pan: string) =>
    pan.replace(/(.{4})/g, "$1 ").trim();

  const statusConfig: Record<CardStatus, { label: string; color: string; icon: React.ReactNode }> = {
    [CardStatus.ACTIVE]: {
      label: "Active",
      color: "bg-green-500",
      icon: <ShieldCheck className="w-3 h-3" />,
    },
    [CardStatus.SUSPENDED]: {
      label: "Suspended",
      color: "bg-yellow-500",
      icon: <ShieldOff className="w-3 h-3" />,
    },
    [CardStatus.BLOCKED]: {
      label: "Blocked",
      color: "bg-red-500",
      icon: <ShieldOff className="w-3 h-3" />,
    },
    [CardStatus.DEACTIVATED]: {
      label: "Deactivated",
      color: "bg-gray-500",
      icon: <ShieldOff className="w-3 h-3" />,
    },
  };

  if (loading) {
    return (
      <div className="mb-2">
        <h2 className="text-[16px] font-medium text-center mb-4">My Voucher Card</h2>
        <div className="flex justify-center">
          <div className="w-75 h-86 flex flex-col p-6 border rounded relative bg-white">
            <Skeleton className="h-5 w-32 mx-auto mb-4" />
            <Skeleton className="h-8 w-48 mx-auto mb-2" />
            <Skeleton className="h-4 w-24 mx-auto mb-6" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4 mx-auto" />
              <Skeleton className="h-4 w-1/2 mx-auto" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!card) {
    // Pending state — request submitted, waiting for admin
    if (requestPending) {
      return (
        <div className="mb-2">
          <h2 className="text-[16px] font-medium text-center mb-4">My Voucher Card</h2>
          <div className="flex justify-center">
            <Card className="w-75 h-86 flex flex-col items-center justify-center p-6 border-dashed border-yellow-300 bg-yellow-50 shadow-none rounded gap-3">
              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-yellow-500" />
              </div>
              <div className="text-center">
                <p className="text-yellow-700 text-sm font-semibold">Card Request Pending</p>
                <p className="text-yellow-600 text-xs mt-1">
                  Your request is under review. Admin will issue your permanent card number shortly.
                </p>
              </div>
              <p className="text-[10px] text-yellow-400">No action needed — we&apos;ll notify you</p>
            </Card>
          </div>
        </div>
      );
    }

    // No request yet
    return (
      <div className="mb-2">
        <h2 className="text-[16px] font-medium text-center mb-4">My Voucher Card</h2>
        <div className="flex justify-center">
          <Card className="w-75 h-86 flex flex-col items-center justify-center p-6 border-dashed border-gray-300 shadow-none rounded gap-3">
            <CreditCard className="w-10 h-10 text-gray-300" />
            <div className="text-center">
              <p className="text-gray-600 text-sm font-medium">No voucher card yet</p>
              <p className="text-gray-400 text-xs mt-1">
                Request your permanent card number — admin will issue it
              </p>
            </div>
            <Button
              onClick={requestCard}
              disabled={requesting}
              className="bg-green-600 hover:bg-green-700 text-sm h-9 px-5"
            >
              {requesting ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />Requesting...</>
              ) : (
                <><CreditCard className="w-3.5 h-3.5 mr-2" />Request Voucher Card</>
              )}
            </Button>
            {requestError && (
              <p className="text-red-500 text-xs text-center">{requestError}</p>
            )}
          </Card>
        </div>
      </div>
    );
  }

  const status = statusConfig[card.status] ?? statusConfig[CardStatus.ACTIVE];

  return (
    <div className="mb-2">
      <h2 className="text-[16px] font-medium text-center mb-4">My Voucher Card</h2>
      <div className="flex justify-center">
        <Card className="w-75 h-86 flex flex-col p-5 border-gray-200 shadow-none rounded relative overflow-hidden">
          {/* Status badge */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span
              className={`flex items-center gap-1 px-3 h-6 text-white text-[12px] rounded ${status.color}`}
            >
              {status.icon}
              {status.label}
            </span>
          </div>

          {/* Card header */}
          <div className="mt-3 text-center mb-3">
            <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">
              Food Bundles Voucher Card
            </p>
            <p className="text-sm font-semibold text-gray-800 truncate">{card.restaurantName}</p>
          </div>

          {/* PAN */}
          <div
            className="flex items-center justify-center gap-2 group cursor-pointer mb-4"
            onClick={copyPan}
          >
            <span className="font-mono text-sm tracking-widest bg-gray-100 border border-gray-200 rounded px-3 py-1.5 text-gray-700">
              {formatPan(card.pan)}
            </span>
            {copied ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
            )}
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3 text-center text-xs flex-1">
            <div>
              <p className="text-gray-400">Loan Limit</p>
              <p className="font-semibold text-gray-800">
                {card.loanLimit.toLocaleString()} <span className="text-gray-400">RWF</span>
              </p>
            </div>
            <div>
              <p className="text-gray-400">Outstanding</p>
              <p className={`font-semibold ${card.totalOutstandingLoans > 0 ? "text-orange-600" : "text-gray-800"}`}>
                {card.totalOutstandingLoans.toLocaleString()} <span className="text-gray-400">RWF</span>
              </p>
            </div>
            <div>
              <p className="text-gray-400">Orders</p>
              <p className="font-semibold text-gray-800">{card.qualifyingOrders}</p>
            </div>
            <div>
              <p className="text-gray-400">Total Loans</p>
              <p className="font-semibold text-gray-800">{card.totalLoansReceived}</p>
            </div>
          </div>

          {/* Eligibility */}
          <div className="mt-3 pt-3 border-t border-gray-100">
            {card.isEligible ? (
              <div className="flex items-center justify-center gap-1.5 text-green-600 text-xs">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Eligible for loan</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-1.5 text-gray-400 text-xs">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{card.eligibilityReason ?? "Not yet eligible"}</span>
              </div>
            )}
          </div>

          {/* Issued date */}
          <p className="text-[10px] text-gray-300 text-center mt-2">
            Issued {new Date(card.issuedDate).toLocaleDateString()}
          </p>
        </Card>
      </div>
    </div>
  );
}
