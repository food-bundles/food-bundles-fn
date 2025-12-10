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
    suspendedVouchers: 0,
    expiredVouchers: 0,
    usedVouchers: { count: 0, totalAmount: 0 },
    maturedVouchers: { count: 0, totalAmount: 0 },
    settledVouchers: { count: 0, totalAmount: 0 },
    pendingLoans: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const [vouchersResponse, loansResponse] = await Promise.all([
        voucherService.getAllVouchers({ page: 1, limit: 1 }), // Get statistics from API
        voucherService.getAllLoanApplications()
      ]);

      const voucherStats = vouchersResponse.statistics || {};
      const loans = loansResponse.data || [];

      setStats({
        totalVouchers: voucherStats.totalVouchers || 0,
        activeVouchers: voucherStats.activeVouchers || 0,
        suspendedVouchers: voucherStats.suspendedVouchers || 0,
        expiredVouchers: voucherStats.expiredVouchers || 0,
        usedVouchers: voucherStats.usedVouchers || { count: 0, totalAmount: 0 },
        maturedVouchers: voucherStats.maturedVouchers || { count: 0, totalAmount: 0 },
        settledVouchers: voucherStats.settledVouchers || { count: 0, totalAmount: 0 },
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
      {/* Row 1: Individual Status Cards */}
      <Card className="h-40  border-blue-200 shadow-[4px_4px_8px_rgba(0,0,0,0.1)]">
        <CardContent className="p-4 relative">
          <Ticket className="h-8 w-8 text-blue-600 absolute -top-5 right-2" />
          <div className="text-center">
            <p className="text-blue-600 text-[13px] font-medium">
              Total Vouchers
            </p>
            {loading ? (
              <Skeleton className="h-7 w-12 mx-auto" />
            ) : (
              <>
                <p className="text-xl font-bold text-blue-900">
                  {stats.totalVouchers}
                </p>
                <div>
                  <div className="flex items-center justify-center  gap-2">
                    <p className="text-[13px] font-medium text-blue-900">
                      Active {" "}
                      <span className="text-green-500">
                        {stats.activeVouchers}
                      </span>
                    </p>
                    <p className="text-[13px] font-medium text-blue-900">
                      Suspended {" "}
                      <span className="text-yellow-600">
                        {stats.suspendedVouchers}
                      </span>
                    </p>
                    <p className="text-[13px] font-medium text-blue-900">
                      Expired <span className="text-red-600">{stats.expiredVouchers}</span>
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>


      {/* Row 2: Amount-based Cards */}
      <Card className="h-28 border-blue-200 shadow-[4px_4px_8px_rgba(0,0,0,0.1)]">
        <CardContent className="p-4 relative">
          <TrendingUp className="h-8 w-8 text-blue-600 absolute -top-5 right-2" />
          <div className="text-center">
            <p className="text-blue-600 text-[13px] font-medium">
              Used Vouchers
            </p>
            {loading ? (
              <Skeleton className="h-7 w-12 mx-auto" />
            ) : (
              <>
                <p className="text-xl font-bold text-blue-900">
                  {stats.usedVouchers.count}
                </p>
                <p className="text-xs text-blue-700">
                  {stats.usedVouchers.totalAmount.toLocaleString()} RWF
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="h-28 border-purple-200 shadow-[4px_4px_8px_rgba(0,0,0,0.1)]">
        <CardContent className="p-4 relative">
          <TrendingUp className="h-8 w-8 text-purple-600 absolute -top-5 right-2" />
          <div className="text-center">
            <p className="text-purple-600 text-[13px] font-medium">
              Matured Vouchers
            </p>
            {loading ? (
              <Skeleton className="h-7 w-12 mx-auto" />
            ) : (
              <>
                <p className="text-xl font-bold text-purple-900">
                  {stats.maturedVouchers.count}
                </p>
                <p className="text-xs text-purple-700">
                  {stats.maturedVouchers.totalAmount.toLocaleString()} RWF
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="h-28 border-emerald-200 shadow-[4px_4px_8px_rgba(0,0,0,0.1)]">
        <CardContent className="p-4 relative">
          <CreditCard className="h-8 w-8 text-emerald-600 absolute -top-5 right-2" />
          <div className="text-center">
            <p className="text-emerald-600 text-[13px] font-medium">
              Settled Vouchers
            </p>
            {loading ? (
              <Skeleton className="h-7 w-12 mx-auto" />
            ) : (
              <>
                <p className="text-xl font-bold text-emerald-900">
                  {stats.settledVouchers.count}
                </p>
                <p className="text-xs text-emerald-700">
                  {stats.settledVouchers.totalAmount.toLocaleString()} RWF
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>
{/* 
      <Card className="h-28 border-orange-200 shadow-[4px_4px_8px_rgba(0,0,0,0.1)]">
        <CardContent className="p-4 relative">
          <AlertCircle className="h-8 w-8 text-orange-600 absolute -top-5 right-2" />
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
      </Card> */}
    </div>
  );
}