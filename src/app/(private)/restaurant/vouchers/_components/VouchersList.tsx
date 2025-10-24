"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Ticket, Eye, Calendar, CreditCard } from "lucide-react";
import { useVoucherOperations, useVoucherUtils } from "@/hooks/useVoucher";
import { IVoucher, VoucherStatus } from "@/lib/types";

export default function VouchersList() {
  const { getAvailableVouchers, loading, error } = useVoucherOperations();
  const { formatVoucherType, getDiscountPercentage } = useVoucherUtils();
  const [vouchers, setVouchers] = useState<IVoucher[]>([]);

  useEffect(() => {
    loadVouchers();
  }, []);

  const loadVouchers = async () => {
    const voucherList = await getAvailableVouchers(1000); // Get vouchers for orders up to 1000 RWF
    setVouchers(voucherList);
  };

  const getStatusBadge = (status: VoucherStatus) => {
    switch (status) {
      case VoucherStatus.ACTIVE:
        return <Badge className="bg-green-500 text-white">Active</Badge>;
      case VoucherStatus.USED:
        return <Badge className="bg-blue-500 text-white">Used</Badge>;
      case VoucherStatus.EXPIRED:
        return <Badge className="bg-red-500 text-white">Expired</Badge>;
      case VoucherStatus.SUSPENDED:
        return <Badge className="bg-yellow-500 text-white">Suspended</Badge>;
      case VoucherStatus.SETTLED:
        return <Badge className="bg-gray-500 text-white">Settled</Badge>;
      default:
        return <Badge className="bg-gray-500 text-white">{status}</Badge>;
    }
  };

  if (loading) return <div className="p-6">Loading vouchers...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ticket className="h-5 w-5" />
          My Vouchers
        </CardTitle>
      </CardHeader>
      <CardContent>
        {vouchers.length === 0 ? (
          <div className="text-center py-8">
            <Ticket className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No vouchers available</p>
            <p className="text-gray-500 text-sm">Apply for a loan to get vouchers</p>
          </div>
        ) : (
          <div className="space-y-4">
            {vouchers.map((voucher) => (
              <div key={voucher.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                    <div>
                      <h3 className="font-semibold text-lg">{voucher.voucherCode}</h3>
                      <p className="text-sm text-gray-600">{formatVoucherType(voucher.voucherType)}</p>
                    </div>
                  </div>
                  {getStatusBadge(voucher.status)}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-gray-500">Credit Limit</p>
                    <p className="font-semibold">{voucher.creditLimit.toLocaleString()} RWF</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Used Credit</p>
                    <p className="font-semibold text-orange-600">{voucher.usedCredit.toLocaleString()} RWF</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Remaining</p>
                    <p className="font-semibold text-green-600">{voucher.remainingCredit.toLocaleString()} RWF</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Discount</p>
                    <p className="font-semibold text-blue-600">{getDiscountPercentage(voucher.voucherType)}%</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Issued: {new Date(voucher.issuedDate).toLocaleDateString()}
                    </span>
                    {voucher.expiryDate && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Expires: {new Date(voucher.expiryDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                </div>

                {voucher.minTransactionAmount > 0 && (
                  <div className="mt-2 text-xs text-gray-500">
                    Min transaction: {voucher.minTransactionAmount.toLocaleString()} RWF
                    {voucher.maxTransactionAmount && (
                      <span> | Max transaction: {voucher.maxTransactionAmount.toLocaleString()} RWF</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}