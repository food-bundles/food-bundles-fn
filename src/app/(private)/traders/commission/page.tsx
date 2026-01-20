/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, DollarSign, Clock, CheckCircle } from "lucide-react";
import { traderService, type CommissionDetails, type TraderStats } from "@/app/services/traderService";
import { Skeleton } from "@/components/ui/skeleton";
import toast from "react-hot-toast";

export default function CommissionPage() {
  const [commission, setCommission] = useState<CommissionDetails | null>(null);
  const [stats, setStats] = useState<TraderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const fetchData = async () => {
    try {
      const [commissionResponse, statsResponse] = await Promise.all([
        traderService.getCommission(),
        traderService.getTransactionStats(),
      ]);
      setCommission(commissionResponse.data);
      setStats(statsResponse.data);
    } catch (error) {
      console.error("Failed to fetch commission data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessCommission = async () => {
    if (!commission?.pendingCommission || commission.pendingCommission <= 0) {
      toast.error("No pending commission to process");
      return;
    }

    setProcessing(true);
    try {
      const response = await traderService.processCommission();
      if (response.success) {
        toast.success("Commission processed successfully");
        await fetchData();
      } else {
        toast.error("Failed to process commission");
      }
    } catch (error: any) {
      console.error("Commission processing error:", error);
      toast.error(error.response?.data?.message || "Failed to process commission");
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const commissionStats = [
    {
      title: "Total Commission Earned",
      value: `${(commission?.totalCommission || 0).toLocaleString()} RWF`,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Total Paid",
      value: `${(commission?.totalPaid || 0).toLocaleString()} RWF`,
      icon: CheckCircle,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Pending Commission",
      value: `${(commission?.pendingCommission || 0).toLocaleString()} RWF`,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      title: "Total Loans Approved",
      value: `${(stats?.totalLoansApproved || 0).toLocaleString()} RWF`,
      icon: DollarSign,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Commission Tracking</h1>
        <p className="text-gray-600">Track and manage your trading commissions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {commissionStats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.color}`}>
                {stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Commission Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="font-medium text-green-800">Total Earned</span>
                <span className="font-bold text-green-600">
                  {(commission?.totalCommission || 0).toLocaleString()} RWF
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="font-medium text-blue-800">Already Paid</span>
                <span className="font-bold text-blue-600">
                  {(commission?.totalPaid || 0).toLocaleString()} RWF
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                <span className="font-medium text-yellow-800">Pending Payment</span>
                <span className="font-bold text-yellow-600">
                  {(commission?.pendingCommission || 0).toLocaleString()} RWF
                </span>
              </div>
            </div>

            {commission?.pendingCommission && commission.pendingCommission > 0 && (
              <Button
                onClick={handleProcessCommission}
                disabled={processing}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {processing ? "Processing..." : "Process Pending Commission"}
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-purple-600" />
              Trading Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">{stats?.loanApprovals || 0}</p>
                <p className="text-sm text-gray-600">Loans Approved</p>
              </div>
              
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">{stats?.totalTransactions || 0}</p>
                <p className="text-sm text-gray-600">Total Transactions</p>
              </div>
              
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">{stats?.commissionsEarned || 0}</p>
                <p className="text-sm text-gray-600">Commissions Earned</p>
              </div>
              
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">{stats?.commissionsPaid || 0}</p>
                <p className="text-sm text-gray-600">Commissions Paid</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {commission?.commissionDetails && commission.commissionDetails.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Commission Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {commission.commissionDetails.map((detail, index) => (
                <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{detail.description || "Commission"}</p>
                    <p className="text-sm text-gray-500">{detail.date}</p>
                  </div>
                  <span className="font-bold text-green-600">
                    {detail.amount?.toLocaleString()} RWF
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}