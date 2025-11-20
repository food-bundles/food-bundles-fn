/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Ticket, CreditCard, TrendingUp, AlertCircle } from "lucide-react";
import { voucherService } from "@/app/services/voucherService";

export default function VoucherStats() {
  const [stats, setStats] = useState({
    totalVouchers: 0,
    activeVouchers: 0,
    totalCreditIssued: 0,
    pendingLoans: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      // Get all vouchers and loan applications to calculate stats
      const [vouchersResponse, loansResponse] = await Promise.all([
        voucherService.getAllVouchers(),
        voucherService.getAllLoanApplications()
      ]);

      const vouchers = vouchersResponse.data || [];
      const loans = loansResponse.data || [];

      setStats({
        totalVouchers: vouchers.length,
        activeVouchers: vouchers.filter((v: any) => v.status === "ACTIVE").length,
        totalCreditIssued: vouchers.reduce((sum: number, v: any) => sum + v.creditLimit, 0),
        pendingLoans: loans.filter((l: any) => l.status === "PENDING").length
      });
    } catch (error) {
      console.error("Failed to load stats:", error);
    } finally {
      setLoading(false);
    }
  };

  // if (loading) return <div className="p-6">Loading stats...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card className="h-28 border-blue-200 shadow-[4px_4px_8px_rgba(0,0,0,0.1)]">
        <CardContent className="p-4 relative">
          <Ticket className="h-8 w-8 text-blue-600 absolute  -top-5 right-2" />
          <div className="text-center">
            <p className="text-blue-600 text-[13px] font-medium">
              Total Vouchers
            </p>
            {loading ? (
              <Skeleton className="h-7 w-12 mx-auto" />
            ) : (
              <p className="text-xl font-bold text-blue-900">
                {stats.totalVouchers}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="h-28 border-green-200 shadow-[4px_4px_8px_rgba(0,0,0,0.1)]">
        <CardContent className="p-4 relative">
          <CreditCard className="h-8 w-8 text-green-600 absolute  -top-5 right-2" />
          <div className="text-center">
            <p className="text-green-600 text-[13px] font-medium">
              Active Vouchers
            </p>
            {loading ? (
              <Skeleton className="h-7 w-12 mx-auto" />
            ) : (
              <p className="text-xl font-bold text-green-900">
                {stats.activeVouchers}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="h-28 border-purple-200 shadow-[4px_4px_8px_rgba(0,0,0,0.1)]">
        <CardContent className="p-4 relative">
          <TrendingUp className="h-8 w-8 text-purple-600 absolute -top-5 right-2" />
          <div className="text-center">
            <p className="text-purple-600 text-[13px] font-medium">
              Total Credit Issued (RWF)
            </p>
            {loading ? (
              <Skeleton className="h-7 w-20 mx-auto" />
            ) : (
              <p className="text-xl font-bold text-purple-900">
                {stats.totalCreditIssued.toLocaleString()}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="h-28 border-orange-200 shadow-[4px_4px_8px_rgba(0,0,0,0.1)]">
        <CardContent className="p-4 relative">
          <AlertCircle className="h-8 w-8 text-orange-600 absolute  -top-5 right-2" />
          <div className="text-center">
            <p className="text-orange-600 text-[13px] font-medium">
              Pending Loans
            </p>
            {loading ? (
              <Skeleton className="h-7 w-12 mx-auto" />
            ) : (
              <p className="text-xl font-bold text-orange-900">
                {stats.pendingLoans}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}