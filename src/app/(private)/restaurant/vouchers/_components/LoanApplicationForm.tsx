/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useMemo } from "react";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LuTicketCheck } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useVoucherOperations } from "@/hooks/useVoucher";
import { subscriptionService } from "@/app/services/subscriptionService";

interface LoanApplicationFormProps {
  onSuccess: () => void;
}

export default function LoanApplicationForm({
  onSuccess,
}: LoanApplicationFormProps) {
  const [formData, setFormData] = useState({
    requestedAmount: "",
    purpose: "",
    selectedDays: "",
  });
  const [maxVoucherDays, setMaxVoucherDays] = useState(7);

  useEffect(() => {
    const fetchSubscriptionData = async () => {
      try {
        const response = await subscriptionService.getMySubscriptions();
        if (response?.data && response.data.length > 0) {
          const activeSubscription = response.data.find(
            (sub: any) => sub.status === "ACTIVE"
          );
          if (activeSubscription?.plan?.voucherPaymentDays) {
            setMaxVoucherDays(activeSubscription.plan.voucherPaymentDays);
          }
        }
      } catch (error) {
        console.error("Failed to fetch subscription data:", error);
      }
    };
    fetchSubscriptionData();
  }, []);

  const voucherReasons = [
    "Increase stock inventory",
    "Purchase fresh ingredients",
    "Equipment maintenance and repairs",
    "Seasonal menu preparation",
    "Emergency cash flow support",
  ];

  const paymentDays = useMemo(() => {
    return Array.from({ length: maxVoucherDays }, (_, i) => ({
      value: String(i + 1),
      label: `${i + 1} day${i + 1 > 1 ? "s" : ""}`,
    }));
  }, [maxVoucherDays]);

  const { applyForLoan, loading, error } = useVoucherOperations();

  const handleSubmit = async () => {
    if (!formData.requestedAmount) return;

    const result = await applyForLoan({
      requestedAmount: parseFloat(formData.requestedAmount),
      purpose: formData.purpose,
      voucherDays: parseInt(formData.selectedDays),
    });

    if (result) {
      setFormData({
        requestedAmount: "",
        purpose: "",
        selectedDays: "",
      });
      onSuccess();
    }
  };

  return (
    <div className="mb-8">
      <h2 className="text-[16px] text-center font-medium mb-4">
        Apply for Voucher
      </h2>
      <div className="flex justify-center">
        <div className="w-[300px] h-[400px] flex flex-col p-6 border rounded shadow-none bg-white">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="flex items-center justify-center gap-2 font-medium text-sm">
              <LuTicketCheck className="h-5 w-5 text-orange-400 shrink-0" />
              <span>Apply for Voucher</span>
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0 flex-1 flex flex-col">
            <div className="space-y-3 flex-1">
              <div>
                <label className="block text-[14px] font-medium text-gray-700 mb-2">
                  Requested Amount *
                </label>
                <Input
                  type="number"
                  value={formData.requestedAmount}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      requestedAmount: e.target.value,
                    }))
                  }
                  placeholder="Enter amount"
                  className="w-full rounded text-sm h-10"
                  suppressHydrationWarning
                />
              </div>

              <div>
                <label className="block text-[14px] font-medium text-gray-700 mb-2">
                  Reason for Voucher
                </label>
                <Select
                  value={formData.purpose}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, purpose: value }))
                  }
                >
                  <SelectTrigger className="w-full h-10 text-sm">
                    <SelectValue placeholder="Select reason" />
                  </SelectTrigger>
                  <SelectContent>
                    {voucherReasons.map((reason) => (
                      <SelectItem
                        key={reason}
                        value={reason}
                        className="text-sm"
                      >
                        {reason}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-[14px] font-medium text-gray-700 mb-2">
                  Days for Payment
                </label>
                <Select
                  value={formData.selectedDays}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      selectedDays: value,
                    }))
                  }
                >
                  <SelectTrigger className="w-full h-10 text-sm">
                    <SelectValue placeholder="Select days" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentDays.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        className="text-sm"
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {error==="No active subscription. Subscribe to create new vouchers." && <div className="text-red-600 text-xs">{error}
              <a href="/restaurant/vouchers/subscribe" className="text-blue-600 hover:underline">Subscribe</a>
              </div>}
            </div>

            <div className="mt-4">
              <Button
                onClick={handleSubmit}
                disabled={loading || !formData.requestedAmount}
                className="w-full bg-green-600 hover:bg-green-700 h-10 text-sm"
              >
                {loading ? "Applying..." : "Request Postpayment"}
              </Button>
            </div>
          </CardContent>
        </div>
      </div>
    </div>
  );
}
