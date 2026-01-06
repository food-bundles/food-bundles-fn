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
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Row 1: Individual Status Cards */}
      <Card className="h-34  border-blue-200 shadow-[4px_4px_8px_rgba(0,0,0,0.1)]">
        <CardContent className="p-4 relative">
          <Ticket className="h-8 w-8 text-yellow-500 absolute -top-5 right-2" />
          <div className="text-center">
            <p className="text-gray-800 text-xs font-bold">
              Total Vouchers
            </p>
            {loading ? (
              <Skeleton className="h-7 w-12 mx-auto" />
            ) : (
              <>
                <p className="text-xl font-bold  text-green-600">
                  {stats.totalVouchers}
                </p>
                <div>
                  <div className="flex items-center justify-center  gap-2">
                    <p className="text-xs font-medium ">
                      Act:{" "}
                      <span className="text-green-500 text-xs">
                        {stats.activeVouchers}
                      </span>
                    </p>
                    <p className="text-xs font-medium ">
                      Susp:{" "}
                      <span className=" text-xs ">
                        {stats.suspendedVouchers}
                      </span>
                    </p>
                    <p className=" text-xs font-medium ">
                      Exp:{" "}
                      <span className="text-red-600 text-xs ">
                        {stats.expiredVouchers}
                      </span>
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Row 2: Amount-based Cards */}
      <Card className="h-34 border-blue-200 shadow-[4px_4px_8px_rgba(0,0,0,0.1)]">
        <CardContent className="p-4 relative">
          <TrendingUp className="h-8 w-8 text-blue-600 absolute -top-5 right-2" />
          <div className="text-center">
            <p className=" text-xs font-semibold">Used Vouchers</p>
            {loading ? (
              <Skeleton className="h-7 w-12 mx-auto" />
            ) : (
              <>
                <p className="text-xl font-bold ">
                  {stats.usedVouchers.count}
                </p>
                <p className="text-xs ">
                  {stats.usedVouchers.totalAmount.toLocaleString()} RWF
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card className="h-34 border-gray-200 shadow-[4px_4px_8px_rgba(0,0,0,0.1)]">
        <CardContent className="relative ">
          <CreditCard className="h-8 w-8 text-green-600 absolute -top-5 right-2" />
          <div className="flex gap-2">
            <div className="text-center">

              <p className="text-xs font-semibold">
                Matured Vouchers
              </p>

              {loading ? (
                <Skeleton className="h-7 w-16 mx-auto mt-2" />
              ) : (
                <>
                  <p className="text-xl font-bold text-red-600">
                    {stats.maturedVouchers.count} 
                  </p>
                  <p className="text-xs ">
                    {stats.maturedVouchers.totalAmount.toLocaleString()} RWF
                  </p>
                </>
              )}
            </div>

            {/* Settled Vouchers */}
            <div className="relative text-center ">
              <p className=" text-xs font-semibold">
                Settled Vouchers
              </p>

              {loading ? (
                <Skeleton className="h-7 w-16 mx-auto mt-2" />
              ) : (
                <>
                  <p className="text-xl font-bold text-green-600">
                    {stats.settledVouchers.count}
                  </p>
                  <p className="text-xs ">
                    {stats.settledVouchers.totalAmount.toLocaleString()} RWF
                  </p>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="h-34 border-orange-200 shadow-[4px_4px_8px_rgba(0,0,0,0.1)]">
        <CardContent className="p-4 relative">
          <AlertCircle className="h-8 w-8 text-orange-600 absolute -top-5 right-2" />
          <div className="text-center">
            <p className="text-orange-600 text-xs font-medium">
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