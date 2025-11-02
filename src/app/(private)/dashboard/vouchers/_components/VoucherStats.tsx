/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Ticket, CreditCard, TrendingUp, AlertCircle } from "lucide-react";
import { voucherService } from "@/app/services/voucherService";

export default function VoucherStats() {
  const [stats, setStats] = useState({
    totalVouchers: 0,
    activeVouchers: 0,
    totalCreditIssued: 0,
    pendingLoans: 0
  });
  const [loading, setLoading] = useState(false);

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

  if (loading) return <div className="p-6">Loading stats...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Total Vouchers</p>
              <p className="text-2xl font-bold text-blue-900">{stats.totalVouchers}</p>
            </div>
            <Ticket className="h-8 w-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Active Vouchers</p>
              <p className="text-2xl font-bold text-green-900">{stats.activeVouchers}</p>
            </div>
            <CreditCard className="h-8 w-8 text-green-600" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-purple-50 border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Total Credit Issued</p>
              <p className="text-2xl font-bold text-purple-900">
                {stats.totalCreditIssued.toLocaleString()} RWF
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-600" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-orange-50 border-orange-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm font-medium">Pending Loans</p>
              <p className="text-2xl font-bold text-orange-900">{stats.pendingLoans}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-orange-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}