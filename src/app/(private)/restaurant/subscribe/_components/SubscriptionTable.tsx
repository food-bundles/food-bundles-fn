/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { MdSubdirectoryArrowRight } from "react-icons/md";
import { Button } from "@/components/ui/button";
import { RefreshCw, TrendingUp, MoreHorizontal } from "lucide-react";
import { FaCheckCircle } from "react-icons/fa";
import {
  subscriptionService,
  RestaurantSubscription,
} from "@/app/services/subscriptionService";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import PlanSelectionDrawer from "./PlanSelectionDrawer";

const formatDate = (date: string | Date) =>
  new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export default function SubscriptionTable() {
  const [subscription, setSubscription] =
    useState<RestaurantSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRenewing, setIsRenewing] = useState(false);
  const [planSelectionOpen, setPlanSelectionOpen] = useState(false);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await subscriptionService.getMySubscriptions();
      setSubscription(response.data || null);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message;
      if (errorMessage === "No subscription found for this restaurant") {
        setSubscription(null);
      } else {
        setError(err.message || "Failed to load subscription");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRenew = async () => {
    if (!subscription) return;

    try {
      setIsRenewing(true);
      await subscriptionService.renewSubscription(subscription.id);
      toast.success("Subscription renewed successfully");
      loadSubscription();
    } catch (err: any) {
      toast.error(err.message || "Failed to renew subscription");
    } finally {
      setIsRenewing(false);
    }
  };


  const canRenew = () => {
    if (!subscription) return false;
    return subscription.status === "EXPIRED";
  };

  const canUpgrade = () => {
    if (!subscription) return false;
    return subscription.status === "ACTIVE";
  };

  const getButtonText = () => {
    if (!subscription) return "Manage Plan";
    
    const isPaymentFailed = subscription.paymentStatus === "FAILED" || subscription.paymentStatus === "PENDING";
    const isSubscriptionPending = subscription.status === "PENDING";
    
    if (isPaymentFailed && isSubscriptionPending) {
      return "Try Again";
    }
    
    return canUpgrade() ? "Upgrade Plan" : "Manage Plan";
  };

  const statusColor = {
    ACTIVE: "bg-green-100 text-green-800",
    EXPIRED: "bg-red-100 text-red-800",
    CANCELLED: "bg-gray-100 text-gray-800",
    PENDING: "bg-yellow-100 text-yellow-800",
  };

  if (loading) {
    return <div className="h-24 rounded-lg border bg-gray-100 animate-pulse" />;
  }

  if (error) {
    return (
      <div className="rounded-lg border p-6 text-center">
        <p className="mb-3">Reflesh the page and try again</p>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="rounded-lg border p-6 text-center">
        <p className="text-gray-500 mb-4">No active subscription found</p>
      </div>
    );
  }

  return (
    <div className="mt-2 space-y-3 rounded-lg border bg-white">
      <h3 className="pt-2 px-2  font-semibold">My Subscription</h3>

      <div className=" border ">
        <div className="grid grid-cols-[1.5fr_1fr_1.5fr_1fr] divide-x divide-gray-200 items-center">
          {/* PLAN */}
          <div className="p-4">
            <div className="flex items-center gap-2">
              <MdSubdirectoryArrowRight className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-semibold">{subscription.plan.name}</p>
                <p className="text-xs text-gray-500">
                  {subscription.plan.duration} days plan
                </p>
              </div>
            </div>
          </div>

          {/* STATUS */}
          <div className="p-4">
            <p className="text-xs text-gray-500 mb-1">Status</p>
            <Badge
              className={
                statusColor[subscription.status as keyof typeof statusColor]
              }
            >
              {subscription.status}
            </Badge>
          </div>

       

          {/* PERIOD */}
          <div className="p-4">
            <p className="text-xs text-gray-500 mb-1">Period</p>
            <p className="text-xs text-gray-700">
              {formatDate(subscription.startDate)} –{" "}
              {formatDate(subscription.endDate)}
            </p>
          </div>

          {/* REMAINING */}
          <div className="p-4">
            <p className="text-xs text-gray-500 mb-1">Remaining</p>
            <div className="flex items-center gap-1 text-green-600">
              <FaCheckCircle className="w-4 h-4" />
              <span className="font-semibold">
                {subscription.daysRemaining || 0} days
              </span>
            </div>
          </div>
        </div>
      </div>
  
    </div>
  );
}
