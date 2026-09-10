"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  subscriptionService,
  SubscriptionPlan,
  RestaurantSubscription,
  LoanProvider,
} from "@/app/services/subscriptionService";
import {
  BadgeCheck,
  Clock,
  ShieldCheck,
  ShieldOff,
  Loader2,
  Zap,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

interface LoanAccessCardProps {
  onSuccess?: () => void;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; icon: React.ReactNode }
> = {
  ACTIVE: {
    label: "Loan Access Active",
    color: "text-green-700",
    bg: "bg-gradient-to-tr from-green-500 to-lime-500",
    icon: <ShieldCheck className="w-3 h-3" />,
  },
  PENDING: {
    label: "Loan Access Pending",
    color: "text-yellow-700",
    bg: "bg-gradient-to-tr from-yellow-500 to-orange-500",
    icon: <Clock className="w-3 h-3" />,
  },
  SUSPENDED: {
    label: "Loan Access Disabled",
    color: "text-gray-700",
    bg: "bg-gradient-to-tr from-gray-500 to-gray-600",
    icon: <ShieldOff className="w-3 h-3" />,
  },
  CANCELLED: {
    label: "Loan Access Rejected",
    color: "text-red-700",
    bg: "bg-gradient-to-tr from-red-500 to-rose-500",
    icon: <ShieldOff className="w-3 h-3" />,
  },
};

export default function LoanAccessCard({ onSuccess }: LoanAccessCardProps) {
  const [loading, setLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState<RestaurantSubscription[]>([]);
  const [providers, setProviders] = useState<LoanProvider[]>([]);
  const [loanPlans, setLoanPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [notes, setNotes] = useState("");
  const [requesting, setRequesting] = useState(false);

  const current =
    subscriptions[0] ??
    (subscriptions.length > 0 ? subscriptions[subscriptions.length - 1] : null);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      subscriptionService.getMyLoanAccess().catch(() => null),
      subscriptionService.getAllLoanProviders().catch(() => null),
      subscriptionService.getAllSubscriptionPlans({ isActive: true }).catch(() => null),
    ])
      .then(([subRes, provRes, planRes]) => {
        setSubscriptions(subRes?.data ?? []);
        setProviders(provRes?.data ?? []);
        const plans = (planRes?.data ?? []).filter(
          (p) => p.loanAccess && p.isActive
        );
        setLoanPlans(plans);
        if (!selectedPlanId && plans.length > 0) setSelectedPlanId(plans[0].id);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const availableProviderIds = new Set(
    providers.filter((p) => p.isActive).map((p) => p.id)
  );

  const requestAccess = async () => {
    if (!selectedPlanId) {
      toast.error("Please select a loan-enabled plan");
      return;
    }
    setRequesting(true);
    try {
      await subscriptionService.requestLoanAccess({
        planId: selectedPlanId,
        notes: notes || undefined,
      });
      toast.success("Loan access request submitted for admin approval");
      setNotes("");
      load();
      onSuccess?.();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to request loan access";
      toast.error(msg);
    } finally {
      setRequesting(false);
    }
  };

  if (loading) {
    return (
      <Card className="w-full p-5 border-gray-200 shadow-none rounded">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="h-8 w-56 mb-2" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-3/4" />
      </Card>
    );
  }

  const cfg = current
    ? STATUS_CONFIG[current.status] ?? STATUS_CONFIG.CANCELLED
    : null;

  return (
    <Card className="w-full p-5 border-gray-200 shadow-none rounded mb-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-green-100">
            <Zap className="w-4 h-4 text-green-600" />
          </div>
          <h2 className="text-[15px] font-semibold text-gray-900">
            Loan Access (Subscription)
          </h2>
        </div>
        {cfg && (
          <span
            className={`flex items-center gap-1 px-3 h-6 text-white text-[12px] rounded ${cfg.bg}`}
          >
            {cfg.icon}
            {cfg.label}
          </span>
        )}
      </div>

      {current ? (
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Plan</span>
            <span className="font-semibold text-gray-800">{current.plan?.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Provider</span>
            <span className="font-semibold text-gray-800 flex items-center gap-1">
              {current.plan?.loanProvider?.name ?? "—"}
              {current.plan?.loanProvider?.isActive === false && (
                <Badge className="bg-gray-100 text-gray-500 text-[10px] rounded">
                  inactive
                </Badge>
              )}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Period</span>
            <span className="text-gray-800">
              {new Date(current.startDate).toLocaleDateString()} —{" "}
              {new Date(current.endDate).toLocaleDateString()}
            </span>
          </div>
          {current.loanAccessApprovedAt && (
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Approved</span>
              <span className="text-gray-800">
                {new Date(current.loanAccessApprovedAt).toLocaleDateString()}
              </span>
            </div>
          )}
          {current.loanAccessNotes && (
            <p className="text-xs text-blue-600 bg-blue-50 rounded px-2 py-1.5">
              {current.loanAccessNotes}
            </p>
          )}
          <div className="flex items-center gap-1.5 pt-1 text-xs">
            {current.status === "ACTIVE" ? (
              <span className="text-green-600 flex items-center gap-1">
                <BadgeCheck className="w-3.5 h-3.5" />
                You can request financing with your voucher card
              </span>
            ) : current.status === "PENDING" ? (
              <span className="text-yellow-600 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Awaiting admin approval for loan access
              </span>
            ) : (
              <span className="text-gray-500 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Loan access is not active — request it below
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="mb-3 flex items-center gap-2 text-sm text-gray-500">
          <ShieldOff className="w-4 h-4 text-gray-400" />
          No loan access yet — financing is granted through a loan-enabled subscription plan.
        </div>
      )}

      {/* Request loan access */}
      {(!current || current.status !== "ACTIVE") && (
        <div className="mt-4 border-t border-gray-100 pt-4 space-y-3">
          <Label className="text-xs text-gray-500">
            Request loan access (select a loan-enabled plan)
          </Label>
          {loanPlans.length === 0 ? (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              No loan-enabled plans are currently available
            </p>
          ) : (
            <>
              <select
                value={selectedPlanId}
                onChange={(e) => setSelectedPlanId(e.target.value)}
                className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500"
              >
                {loanPlans.map((plan) => {
                  const providerAvailable = plan.loanProviderId
                    ? availableProviderIds.has(plan.loanProviderId)
                    : false;
                  return (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} — {plan.price.toLocaleString()} RWF / {plan.duration} days
                      {plan.loanProvider?.name ? ` (${plan.loanProvider.name})` : ""}
                      {!providerAvailable && " [provider inactive]"}
                    </option>
                  );
                })}
              </select>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notes for the admin (optional)"
                className="w-full rounded text-sm h-10"
              />
              <Button
                onClick={requestAccess}
                disabled={requesting}
                className="w-full bg-green-600 hover:bg-green-700 h-10 text-sm"
              >
                {requesting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  "Request Loan Access"
                )}
              </Button>
            </>
          )}
        </div>
      )}
    </Card>
  );
}