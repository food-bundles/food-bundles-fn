/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/data-table";
import { createSubscriptionColumns } from "./subscription-columns";
import {
  subscriptionService,
  RestaurantSubscription,
} from "@/app/services/subscriptionService";

export default function SubscriptionTable() {
  const [subscriptions, setSubscriptions] = useState<RestaurantSubscription[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await subscriptionService.getMySubscriptions({
        page: 1,
        limit: 10,
      });
      const completedPaymentSubscriptions = (response.data || []).filter(
        (subscription) => subscription.paymentStatus === "COMPLETED"
      );
      setSubscriptions(completedPaymentSubscriptions);
    } catch (error: any) {
      console.error("Failed to load subscriptions:", error);
      setError(error.message || "Failed to load subscriptions");
    } finally {
      setLoading(false);
    }
  };

  const columns = createSubscriptionColumns();

  return (
    <div className="">
      <div className="my-10 border-b border-gray-200 py-4 px-2 bg-gray-50 rounded-full">
        <h3 className="text-[20px] font-bold text-center text-green-600 ">
          My Subscriptions
        </h3>
        <p className="text-center text-gray-500 text-[14px]">View and manage your subscription plans</p>
      </div>

      {loading ? (
        <div className="p-4 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="animate-pulse h-16 bg-gray-100 rounded"
            ></div>
          ))}
        </div>
      ) : error ? (
        <div className="p-4 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadSubscriptions}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Retry
          </button>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={subscriptions}
          title=""
          description=""
          showPagination={true}
          showColumnVisibility={false}
          showRowSelection={false}
        />
      )}
    </div>
  );
}
