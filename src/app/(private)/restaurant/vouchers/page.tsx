"use client";

import { useState, useEffect } from "react";
import { subscriptionService, RestaurantSubscription } from "@/app/services/subscriptionService";
import LoanApplicationForm from "./_components/LoanApplicationForm";
import LoanApplicationsList from "./_components/LoanApplicationsList";
import VouchersList from "./_components/VouchersList";
import AllVouchersList from "./_components/AllVouchersList";
import { Calendar, Clock, CreditCard, RefreshCcw } from "lucide-react";

export default function VouchersPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [mySubscriptions, setMySubscriptions] = useState<RestaurantSubscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const response = await subscriptionService.getMySubscriptions();
        if (response && response.data) {
          setMySubscriptions(response.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch subscriptions:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSubscriptions();
  }, []);

  const handleLoanSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  const activeSubscription = mySubscriptions.find(sub => sub.status === "ACTIVE");
  
  const formatDuration = (duration: number) => {
    if (duration >= 365) return `${Math.floor(duration / 365)} Year${Math.floor(duration / 365) > 1 ? 's' : ''}`;
    if (duration >= 30) return `${Math.floor(duration / 30)} Month${Math.floor(duration / 30) > 1 ? 's' : ''}`;
    return `${duration} Day${duration > 1 ? 's' : ''}`;
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="p-3 sm:p-4 lg:p-6 max-w-7xl mx-auto bg-gray-100 min-h-screen">
      <div className="mb-4 sm:mb-6 lg:mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div className="flex-1">
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2">
            Voucher System
          </h1>
          <p className="text-gray-700 text-xs sm:text-[14px]">
            Manage vouchers, and credit payments
          </p>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg shadow-sm border p-3 w-full sm:min-w-[280px] sm:max-w-[320px]">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded mb-1"></div>
            </div>
          </div>
        ) : activeSubscription ? (
          <div className="relative bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow p-3 sm:p-4 border border-gray-200 w-full sm:min-w-[280px] sm:max-w-[320px]">
            {/* Status Badge - Absolute positioned */}
            {(() => {
              const plan = activeSubscription?.plan?.name
                ?.split(" ")[0]
                ?.toLowerCase();
              const status = activeSubscription?.status?.toLowerCase();

              // define color map per plan
              const colorMap: Record<string, string> = {
                premium: "yellow",
                standard: "blue",
                basic: "green",
              };

              // fallback color if plan not listed
              const color = colorMap[plan || ""] || "gray";

              return (
                <span
                  className={`absolute -top-2 right-1 px-2 text-[12px] font-medium bg-${color}-100 text-${color}-500 rounded-full border border-${color}-200`}
                >
                  <span className={`text-${color}-700 font-semibold`}>
                    {activeSubscription?.plan?.name?.split(" ")[0]}
                  </span>{" "}
                  <span className={`capitalize text-${color}-900`}>
                    {status}
                  </span>
                </span>
              );
            })()}

            {/* Compact Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1.5">
                <CreditCard className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-green-500 shrink-0" />
                <span className="text-gray-600 truncate">
                  <span className="font-semibold text-gray-900">
                    {activeSubscription.plan.price}
                  </span>{" "}
                  RWF
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-500 shrink-0" />
                <span className="text-gray-600 truncate">
                  <span className="font-semibold text-gray-900">
                    {formatDuration(activeSubscription.plan.duration)}
                  </span>
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-orange-500 shrink-0" />
                <span className="text-gray-600 truncate">
                  <span className="font-semibold text-blue-600">
                    {getDaysRemaining(activeSubscription.endDate)}
                  </span>{" "}
                  days left
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <RefreshCcw className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-purple-500 shrink-0" />
                <span
                  className={`font-semibold truncate ${
                    activeSubscription.autoRenew
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {activeSubscription.autoRenew ? "Auto-renew" : "Manual"}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded shadow-sm border p-3 sm:p-4 w-full sm:min-w-[280px] sm:max-w-[320px]">
            <div className="text-center text-gray-500 text-xs sm:text-sm">
              No active subscription
            </div>
          </div>
        )}
      </div>
      <div className="space-y-6 lg:space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          <LoanApplicationForm onSuccess={handleLoanSuccess} />
          <LoanApplicationsList key={`loans-${refreshKey}`} />
          <VouchersList key={refreshKey} />
        </div>
        
        <AllVouchersList />
      </div>
    </div>
  );
}