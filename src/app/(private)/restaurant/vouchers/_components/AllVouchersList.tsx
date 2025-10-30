"use client";

import { useEffect, useState } from "react";
import { IVoucher } from "@/lib/types";
import { CreditCard, Calendar, DollarSign, AlertCircle } from "lucide-react";
import { useVouchers } from "@/app/contexts/VoucherContext";

export default function AllVouchersList() {
  const { myVouchers, getMyVouchers, loading } = useVouchers();
  const [payingVoucherId, setPayingVoucherId] = useState<string | null>(null);

  useEffect(() => {
    getMyVouchers();
  }, [getMyVouchers]);

  const handlePayment = async (voucherId: string) => {
    setPayingVoucherId(voucherId);
    // Simulate payment process
    setTimeout(() => {
      setPayingVoucherId(null);
      // You can add actual payment logic here
    }, 2000);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      ACTIVE: "bg-green-100 text-green-800 border-green-200",
      USED: "bg-blue-100 text-blue-800 border-blue-200",
      EXPIRED: "bg-red-100 text-red-800 border-red-200",
      SUSPENDED: "bg-yellow-100 text-yellow-800 border-yellow-200",
      SETTLED: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">All Vouchers</h3>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">All Vouchers</h3>
        <span className="text-sm text-gray-500">{myVouchers.length} total</span>
      </div>

      {myVouchers.length === 0 ? (
        <div className="text-center py-8">
          <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">No vouchers found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {myVouchers.map((voucher: IVoucher) => (
            <div
              key={voucher.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900 text-sm">
                      {voucher.voucherCode}
                    </h4>
                    <span
                      className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getStatusColor(
                        voucher.status
                      )}`}
                    >
                      {voucher.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">
                    {voucher.voucherType.replace("DISCOUNT_", "")}% Discount
                  </p>
                </div>
                
                {voucher.status === "ACTIVE" && (
                  <button
                    onClick={() => handlePayment(voucher.id)}
                    disabled={payingVoucherId === voucher.id}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                      payingVoucherId === voucher.id
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-green-600 text-white hover:bg-green-700"
                    }`}
                  >
                    {payingVoucherId === voucher.id ? "Processing..." : "Pay"}
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-green-500" />
                  <span className="text-gray-600">
                    Credit: <span className="font-semibold text-gray-900">
                      {voucher.remainingCredit.toLocaleString()} RWF
                    </span>
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-blue-500" />
                  <span className="text-gray-600">
                    Used: <span className="font-semibold text-gray-900">
                      {voucher.usedCredit.toLocaleString()} RWF
                    </span>
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-orange-500" />
                  <span className="text-gray-600">
                    Issued: <span className="font-semibold text-gray-900">
                      {formatDate(voucher.issuedDate)}
                    </span>
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                  <span className="text-gray-600">
                    Expires: <span className="font-semibold text-gray-900">
                      {voucher.expiryDate ? formatDate(voucher.expiryDate) : "Never"}
                    </span>
                  </span>
                </div>
              </div>
{/* 
              {voucher.transactions && voucher.transactions.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    {voucher.transactions.length} transaction{voucher.transactions.length !== 1 ? 's' : ''}
                  </p>
                </div>
              )} */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}