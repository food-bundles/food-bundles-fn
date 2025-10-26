"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Trash2, Edit, Calendar, CreditCard } from "lucide-react";
import { voucherService } from "@/app/services/voucherService";
import { IVoucher, VoucherStatus, VoucherType } from "@/lib/types";

export default function VouchersTable() {
  const [vouchers, setVouchers] = useState<IVoucher[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadVouchers();
  }, []);

  const loadVouchers = async () => {
    setLoading(true);
    try {
      const response = await voucherService.getAllVouchers();
      setVouchers(response.data || []);
    } catch (error) {
      console.error("Failed to load vouchers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (id: string) => {
    try {
      await voucherService.deactivateVoucher(id, "Deactivated by admin");
      loadVouchers();
    } catch (error) {
      console.error("Failed to deactivate voucher:", error);
    }
  };

  const getStatusBadge = (status: VoucherStatus) => {
    switch (status) {
      case VoucherStatus.ACTIVE:
        return <Badge className="bg-green-500">Active</Badge>;
      case VoucherStatus.USED:
        return <Badge className="bg-blue-500">Used</Badge>;
      case VoucherStatus.EXPIRED:
        return <Badge className="bg-red-500">Expired</Badge>;
      case VoucherStatus.SUSPENDED:
        return <Badge className="bg-yellow-500">Suspended</Badge>;
      case VoucherStatus.SETTLED:
        return <Badge className="bg-gray-500">Settled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getVoucherTypeLabel = (type: VoucherType) => {
    switch (type) {
      case VoucherType.DISCOUNT_10:
        return "10% Discount";
      case VoucherType.DISCOUNT_20:
        return "20% Discount";
      case VoucherType.DISCOUNT_50:
        return "50% Discount";
      case VoucherType.DISCOUNT_80:
        return "80% Discount";
      case VoucherType.DISCOUNT_100:
        return "100% Discount";
      default:
        return type;
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Vouchers</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3">Code</th>
                <th className="text-left p-3">Restaurant</th>
                <th className="text-left p-3">Type</th>
                <th className="text-left p-3">Credit Limit</th>
                <th className="text-left p-3">Used/Remaining</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Issued</th>
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vouchers.map((voucher) => (
                <tr key={voucher.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-blue-600" />
                      <span className="font-mono text-sm">{voucher.voucherCode}</span>
                    </div>
                  </td>
                  <td className="p-3">{voucher.restaurantId}</td>
                  <td className="p-3">
                    <Badge variant="outline">{getVoucherTypeLabel(voucher.voucherType)}</Badge>
                  </td>
                  <td className="p-3">{voucher.creditLimit.toLocaleString()} RWF</td>
                  <td className="p-3">
                    <div className="text-sm">
                      <div className="text-orange-600">Used: {voucher.usedCredit.toLocaleString()} RWF</div>
                      <div className="text-green-600">Remaining: {voucher.remainingCredit.toLocaleString()} RWF</div>
                    </div>
                  </td>
                  <td className="p-3">{getStatusBadge(voucher.status)}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Calendar className="h-3 w-3" />
                      {new Date(voucher.issuedDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      {voucher.status === VoucherStatus.ACTIVE && (
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleDeactivate(voucher.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Deactivate
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}