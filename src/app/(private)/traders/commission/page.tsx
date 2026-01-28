"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign, Clock, CheckCircle } from "lucide-react";
import { traderService, type CommissionDetails, type TraderStats } from "@/app/services/traderService";
import { Skeleton } from "@/components/ui/skeleton";

export default function CommissionPage() {
  const [commission, setCommission] = useState<CommissionDetails | null>(null);
  const [stats, setStats] = useState<TraderStats | null>(null);
  const [loading, setLoading] = useState(true);

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
        <h1 className="text-xl font-bold text-gray-900">Commission Tracking</h1>
        <p className="text-gray-600 text-sm">
          Track and manage your Digital Food Store commissions
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {commissionStats.map((stat, index) => {
          const cardColors = [
            { bg: "bg-green-50", text: "text-green-600", percent: "text-green-600" },
            { bg: "bg-blue-50", text: "text-blue-600", percent: "text-blue-600" },
            { bg: "bg-yellow-50", text: "text-yellow-600", percent: "text-yellow-600" },
            { bg: "bg-purple-50", text: "text-purple-600", percent: "text-purple-600" },
          ];
          const colors = cardColors[index % cardColors.length];
          
          return (
            <div key={index} className={`p-4 rounded-lg border ${colors.bg} transition-all duration-200 hover:shadow-md`}>
              <div className="flex items-center justify-between mb-2">
                <stat.icon className={`w-5 h-5 ${colors.text}`} />
                <div className={`flex items-center gap-1 text-xs ${colors.percent}`}>
                  <div className="w-3 h-3">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7 14l5-5 5 5z" />
                    </svg>
                  </div>
                  +{(Math.random() * 15).toFixed(1)}%
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-600 font-medium">{stat.title}</p>
                <p className={`text-sm font-bold ${colors.text}`}>{stat.value}</p>
              </div>
            </div>
          );
        })}
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
                <span className="text-sm text-green-800">Total Earned</span>
                <span className=" text-green-600">
                  {(commission?.totalCommission || 0).toLocaleString()} RWF
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-sm text-blue-800">Already Paid</span>
                <span className=" text-blue-600">
                  {(commission?.totalPaid || 0).toLocaleString()} RWF
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                <span className="text-sm text-yellow-800">Pending Payment</span>
                <span className=" text-yellow-600">
                  {(commission?.pendingCommission || 0).toLocaleString()} RWF
                </span>
              </div>
            </div>
            
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-purple-600" />
              Digital Food Store Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-xl font-bold text-gray-900">
                  {stats?.loanApprovals || 0}
                </p>
                <p className="text-sm text-gray-600">Loans Approved</p>
              </div>

              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-xl font-bold text-gray-900">
                  {stats?.totalTransactions || 0}
                </p>
                <p className="text-sm text-gray-600">Total Transactions</p>
              </div>

              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-xl font-bold text-gray-900">
                  {stats?.commissionsEarned || 0}
                </p>
                <p className="text-sm text-gray-600">Commissions Earned</p>
              </div>

              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-xl font-bold text-gray-900">
                  {stats?.commissionsPaid || 0}
                </p>
                <p className="text-sm text-gray-600">Commissions Paid</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {commission?.commissionDetails &&
        commission.commissionDetails.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Commission Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {commission.commissionDetails.map((detail, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">
                        {detail.description || "Commission"}
                      </p>
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