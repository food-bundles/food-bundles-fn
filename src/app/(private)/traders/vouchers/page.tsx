"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Ticket, Calendar, CreditCard, Building } from "lucide-react";
import { traderService, type Voucher } from "@/app/services/traderService";
import { Skeleton } from "@/components/ui/skeleton";

export default function VouchersPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const response = await traderService.getVouchers();
        setVouchers(response.data.vouchers);
      } catch (error) {
        console.error("Failed to fetch vouchers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVouchers();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "EXPIRED":
        return "bg-red-100 text-red-800";
      case "USED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Voucher Management</h1>
        <p className="text-gray-600">Manage vouchers you've approved for restaurants</p>
      </div>

      {vouchers.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Ticket className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Vouchers Yet</h3>
            <p className="text-gray-500">Vouchers you approve will appear here</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vouchers.map((voucher) => (
            <Card key={voucher.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-blue-600">
                    {voucher.voucherCode}
                  </CardTitle>
                  <Badge className={getStatusColor(voucher.status)}>
                    {voucher.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <Building className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">{voucher.restaurant.name}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Credit Limit</span>
                    <p className="font-semibold text-green-600">
                      {voucher.creditLimit.toLocaleString()} {voucher.currency}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Remaining</span>
                    <p className="font-semibold text-blue-600">
                      {voucher.remainingCredit.toLocaleString()} {voucher.currency}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CreditCard className="h-4 w-4 text-gray-500" />
                    <span>Discount: {voucher.discountPercentage}%</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>Expires: {new Date(voucher.expiryDate).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Issued: {new Date(voucher.issuedDate).toLocaleDateString()}</span>
                    <span>Repayment: {voucher.repaymentDays} days</span>
                  </div>
                </div>

                {/* Progress bar for credit usage */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Credit Used</span>
                    <span>{((voucher.usedCredit / voucher.totalCredit) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${(voucher.usedCredit / voucher.totalCredit) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}