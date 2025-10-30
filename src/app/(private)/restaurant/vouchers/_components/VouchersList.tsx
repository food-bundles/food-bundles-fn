"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle, XCircle, Clock, AlertCircle, Copy, Check } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useVoucherUtils } from "@/hooks/useVoucher";
import {  VoucherStatus } from "@/lib/types";
import { useVouchers } from "@/app/contexts/VoucherContext";

export default function VouchersList() {
  const { formatVoucherType, getDiscountPercentage } = useVoucherUtils();
  const { myVouchers, getMyVouchers, loading, error } = useVouchers();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getMyVouchers();
  }, [getMyVouchers]);

  const getStatusConfig = (status: VoucherStatus) => {
    switch (status) {
      case VoucherStatus.ACTIVE:
        return { bg: "bg-gradient-to-tr from-green-500 to-lime-500", icon: CheckCircle, text: "Active" };
      case VoucherStatus.USED:
        return { bg: "bg-gradient-to-tr from-blue-500 to-indigo-500", icon: CheckCircle, text: "Used" };
      case VoucherStatus.EXPIRED:
        return { bg: "bg-gradient-to-tr from-red-500 to-rose-500", icon: XCircle, text: "Expired" };
      case VoucherStatus.SUSPENDED:
        return { bg: "bg-gradient-to-tr from-yellow-500 to-orange-500", icon: Clock, text: "Suspended" };
      case VoucherStatus.SETTLED:
        return { bg: "bg-gradient-to-tr from-gray-500 to-gray-600", icon: CheckCircle, text: "Settled" };
      default:
        return { bg: "bg-gradient-to-tr from-gray-500 to-gray-600", icon: AlertCircle, text: status };
    }
  };

  if (loading) return (
    <div className="mb-8">
      <h2 className="text-[16px] font-medium text-center mb-4">My Voucher</h2>
      <div className="flex justify-center">
        <div className="w-[320px] h-[400px] flex flex-col p-6 border rounded relative">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <Skeleton className="h-6 w-20 rounded" />
          </div>
          <div className="text-center mt-4 space-y-3">
            <Skeleton className="h-6 w-24 mx-auto rounded" />
            <Skeleton className="h-6 w-32 mx-auto" />
          </div>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center space-y-2">
                <Skeleton className="h-3 w-12 mx-auto" />
                <Skeleton className="h-4 w-16 mx-auto" />
              </div>
              <div className="text-center space-y-2">
                <Skeleton className="h-3 w-16 mx-auto" />
                <Skeleton className="h-3 w-20 mx-auto" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center space-y-2">
                <Skeleton className="h-3 w-16 mx-auto" />
                <Skeleton className="h-4 w-20 mx-auto" />
              </div>
              <div className="text-center space-y-2">
                <Skeleton className="h-3 w-14 mx-auto" />
                <Skeleton className="h-4 w-18 mx-auto" />
              </div>
            </div>
            <div className="space-y-2 text-center">
              <Skeleton className="h-3 w-24 mx-auto" />
              <Skeleton className="h-3 w-28 mx-auto" />
            </div>
          </div>
          <div className="text-center mt-4">
            <Skeleton className="h-6 w-20 mx-auto rounded" />
          </div>
        </div>
      </div>
    </div>
  );
  if (error) return <div className="p-6 text-red-600">Somenting went wrong</div>;

  return (
    <div className="mb-8">
      <h2 className="text-[16px] font-medium text-center mb-4">My Voucher</h2>
      {!loading && myVouchers.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-700">No vouchers available</p>
          <p className="text-gray-600 text-sm">Apply for a loan to get vouchers</p>
        </div>
      ) : (
        <div className="flex justify-center">
          {myVouchers.slice(0, 1).map((voucher) => {
            const statusConfig = getStatusConfig(voucher.status);
            const isActive = voucher.status === VoucherStatus.ACTIVE;
            
            return (
              <Card
                key={voucher.id}
                className={`w-[320px] h-[400px] flex flex-col p-6 ${
                  isActive
                    ? "border-yellow-300 hover:border-yellow-400"
                    : "border-gray-200"
                } transition-colors relative rounded shadow-none`}
              >
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div
                    className={`w-full h-6 text-white text-[14px] ${statusConfig.bg} rounded px-4 flex items-center justify-center`}
                  >
                    <p>{statusConfig.text}</p>
                  </div>
                </div>

                <div className="text-center mt-4">
                  <Badge
                    className={`${
                      isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    } mb-2 rounded`}
                  >
                    {formatVoucherType(voucher.voucherType)}
                  </Badge>
                  <div
                    className="flex items-center justify-center gap-2 group cursor-pointer "
                    onClick={() => {
                      navigator.clipboard.writeText(voucher.voucherCode);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                  >
                    <div className="text-[14px] text-gray-600 bg-gray-200 font-mono border border-gray-300 rounded px-4 py-1">
                      {voucher.voucherCode}
                    </div>
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500 transition-colors" />
                    ) : (
                      <Copy className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                    )}
                  </div>
                </div>

                <div className="space-y-4 ">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-xs text-gray-700">Credit</p>
                      <p className="font-semibold text-sm">
                        {voucher.creditLimit.toLocaleString()} RWF
                      </p>
                    </div>
                    <div className="">
                      <p className="text-xs text-gray-700">
                        Pay
                        <span className="font-semibold pl-1 text-blue-600 text-sm">
                          {getDiscountPercentage(voucher.voucherType)}%
                        </span>
                      </p>
                      <p className="text-xs text-gray-700">now, rest later</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-xs text-gray-700">Used Credit</p>
                      <p className="font-semibold text-orange-600 text-sm">
                        {voucher.usedCredit.toLocaleString()} RWF
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-700">Remaining</p>
                      <p className="font-semibold text-green-600 text-sm">
                        {voucher.remainingCredit.toLocaleString()} RWF
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-gray-700 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Issued:{" "}
                      {new Date(voucher.issuedDate).toLocaleDateString()}
                    </div>
                    {voucher.expiryDate && (
                      <div className="flex items-center justify-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Expires:{" "}
                        {new Date(voucher.expiryDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  {voucher.minTransactionAmount > 0 && (
                    <div className="text-center text-xs text-gray-700">
                      Min: {voucher.minTransactionAmount.toLocaleString()} RWF
                      {voucher.maxTransactionAmount && (
                        <span>
                          {" "}
                          | Max: {voucher.maxTransactionAmount.toLocaleString()}{" "}
                          RWF
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="text-center">
                  <div
                    className={`text-xs px-3 py-1 rounded ${
                      isActive
                        ? "bg-green-50 text-green-700"
                        : "bg-gray-50 text-gray-700"
                    }`}
                  >
                    Service Fee: {0}%
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}