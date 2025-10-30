"use client";

import { useState } from "react";
import {  CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LuTicketCheck } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useVoucherOperations } from "@/hooks/useVoucher";

interface LoanApplicationFormProps {
  onSuccess: () => void;
}

export default function LoanApplicationForm({ onSuccess }: LoanApplicationFormProps) {
  const [formData, setFormData] = useState({
    requestedAmount: "",
    purpose: "",
    terms: ""
  });
  const { applyForLoan, loading, error } = useVoucherOperations();

  const handleSubmit = async () => {
    if (!formData.requestedAmount) return;

    const result = await applyForLoan({
      requestedAmount: parseFloat(formData.requestedAmount),
      purpose: formData.purpose,
      terms: formData.terms
    });

    if (result) {
      setFormData({ requestedAmount: "", purpose: "", terms: "" });
      onSuccess();
    }
  };

  return (
    <div className="my-0 md:my-8">
      <CardContent>
          <div className="space-y-4 rounded p-4 shadow-lg ">
            <CardHeader className="">
              <CardTitle className="flex items-start gap-2 font-medium text-[14px]">
                <LuTicketCheck className="h-5 w-5 text-orange-400" />
                Purchase Voucher
              </CardTitle>
            </CardHeader>
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
                className="w-full"
                suppressHydrationWarning
              />
            </div>
            <div>
              <label className="block text-[14px] font-medium text-gray-700 mb-2">
                Purpose
              </label>
              <Textarea
                value={formData.purpose}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, purpose: e.target.value }))
                }
                placeholder="What will you use this loan for?"
                className="w-full"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-[14px] font-medium text-gray-700 mb-2">
                Preferred Terms
              </label>
              <Textarea
                value={formData.terms}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, terms: e.target.value }))
                }
                placeholder="Any specific repayment preferences?"
                className="w-full"
                rows={2}
              />
            </div>
            {error && <div className="text-red-600 text-sm">{error}</div>}
            <div className="flex gap-3">
              <Button
                onClick={handleSubmit}
                disabled={loading || !formData.requestedAmount}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? "Applying..." : "Apply Loan"}
              </Button>
              {/* <Button onClick={() => setShowForm(false)} variant="outline">
                Cancel
              </Button> */}
            </div>
          </div>
      </CardContent>
    </div>
  );
}