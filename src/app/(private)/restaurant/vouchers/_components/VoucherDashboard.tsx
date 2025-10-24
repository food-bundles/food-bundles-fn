/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard, Wallet, TrendingUp, AlertCircle } from "lucide-react";
import { useVoucherOperations } from "@/hooks/useVoucher";
import { ICreditSummary } from "@/lib/types";
import { Spinner } from "@/components/ui/shadcn-io/spinner";

export default function VoucherDashboard() {
  const { getCreditSummary, loading } = useVoucherOperations();
  const [creditSummary, setCreditSummary] = useState<ICreditSummary | null>(null);

  useEffect(() => {
    loadCreditSummary();
  }, []);

  const loadCreditSummary = async () => {
    const summary = await getCreditSummary();
    if (summary) setCreditSummary(summary);
  };

  if (loading) return <div className="p-6"><Spinner/></div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Total Credit Limit</p>
              <p className="text-2xl font-bold text-blue-900">
                {creditSummary?.totalCreditLimit?.toLocaleString() || 0} RWF
              </p>
            </div>
            <CreditCard className="h-8 w-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Available Credit</p>
              <p className="text-2xl font-bold text-green-900">
                {creditSummary?.totalRemainingCredit?.toLocaleString() || 0} RWF
              </p>
            </div>
            <Wallet className="h-8 w-8 text-green-600" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-orange-50 border-orange-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm font-medium">Used Credit</p>
              <p className="text-2xl font-bold text-orange-900">
                {creditSummary?.totalUsedCredit?.toLocaleString() || 0} RWF
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-orange-600" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-red-50 border-red-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 text-sm font-medium">Outstanding Balance</p>
              <p className="text-2xl font-bold text-red-900">
                {creditSummary?.outstandingBalance?.toLocaleString() || 0} RWF
              </p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}