"use client";

import { useState, useEffect, useMemo } from "react";
import { CardContent} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useVoucherOperations } from "@/hooks/useVoucher";
import { subscriptionService } from "@/app/services/subscriptionService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
        if (response?.data && response.data.status === "ACTIVE") {
          if (response.data.plan?.voucherPaymentDays) {
            setMaxVoucherDays(response.data.plan.voucherPaymentDays);
          }
        }
      } catch (error) {
        console.error("Failed to fetch subscription data:", error);
      }
    };
    fetchSubscriptionData();
  }, []);

  const voucherReasons = [
    "Increase stock",
    "Other",
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

    const finalPurpose = formData.purpose;
    
    const result = await applyForLoan({
      requestedAmount: parseFloat(formData.requestedAmount),
      purpose: finalPurpose,
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
    <div className="mb-2">
      <h2 className="text-[16px] text-center font-medium mb-4">
        Apply for Voucher
      </h2>
      <div className="flex justify-center">
        <div className="w-75 h-86 flex flex-col p-6 border rounded shadow-none bg-white">
          <CardContent className="p-0 flex-1 flex flex-col">
            <div className="space-y-3 flex-1">
              <div>
                <label className="block text-sm text-gray-900 mb-2">
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
                <label className="block text-sm text-gray-900 mb-2">
                  Reason for Voucher
                </label>
                <RadioGroup
                  value={formData.purpose}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, purpose: value }))
                  }
                  className=" text-gray-700 "
                >
                  {voucherReasons.map((reason) => (
                    <div
                      key={reason}
                      className="flex items-center space-x-2 "
                    >
                      <RadioGroupItem value={reason} id={reason} />
                      <Label htmlFor={reason} className=" text-sm p-0">
                        {reason}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div>
                <label className="block text-sm text-gray-900 mb-2">
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

              {error && (
                <div className="text-red-600 text-xs">
                  {error ===
                  "No active subscription. Subscribe to create new vouchers." ? (
                    <>
                      {error}{" "}
                      <a
                        href="/restaurant/vouchers/subscribe"
                        className="text-blue-600 hover:underline"
                      >
                        Subscribe
                      </a>
                    </>
                  ) : (
                    error
                  )}
                </div>
              )}
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
