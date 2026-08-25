"use client";

import { useState } from "react";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { voucherService } from "@/app/services/voucherService";
import { toast } from "sonner";

interface LoanRequestFormProps {
  onSuccess: () => void;
}

const PURPOSES = ["Increase stock", "Seasonal demand", "Other"];

export default function LoanRequestForm({ onSuccess }: LoanRequestFormProps) {
  const [requestedAmount, setRequestedAmount] = useState("");
  const [purpose, setPurpose] = useState("");
  const [repaymentDays, setRepaymentDays] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!requestedAmount) return;
    setError(null);
    setLoading(true);
    try {
      await voucherService.requestLoanSession({
        requestedAmount: parseFloat(requestedAmount),
        purpose: purpose || undefined,
        repaymentDays: repaymentDays ? parseInt(repaymentDays) : undefined,
      });
      toast.success("Loan request submitted successfully");
      setRequestedAmount("");
      setPurpose("");
      setRepaymentDays("");
      onSuccess();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Failed to submit loan request";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-2">
      <h2 className="text-[16px] text-center font-medium mb-4">Finance on Voucher</h2>
      <div className="flex justify-center">
        <div className="w-75 h-86 flex flex-col p-6 border rounded shadow-none bg-white">
          <CardContent className="p-0 flex-1 flex flex-col">
            <div className="space-y-3 flex-1">
              <div>
                <label className="block text-sm text-gray-900 mb-2">
                  Requested Amount (RWF) *
                </label>
                <Input
                  type="number"
                  value={requestedAmount}
                  onChange={(e) => setRequestedAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full rounded text-sm h-10"
                  suppressHydrationWarning
                />
              </div>

              <div>
                <label className="block text-sm text-gray-900 mb-2">Purpose</label>
                <RadioGroup
                  value={purpose}
                  onValueChange={setPurpose}
                  className="text-gray-700"
                >
                  {PURPOSES.map((p) => (
                    <div key={p} className="flex items-center space-x-2">
                      <RadioGroupItem value={p} id={p} />
                      <Label htmlFor={p} className="text-sm p-0">
                        {p}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div>
                <label className="block text-sm text-gray-900 mb-2">
                  Requested Repayment Days
                </label>
                <Input
                  type="number"
                  value={repaymentDays}
                  onChange={(e) => setRepaymentDays(e.target.value)}
                  placeholder="e.g. 30"
                  className="w-full rounded text-sm h-10"
                  suppressHydrationWarning
                />
              </div>

              {error && <p className="text-red-600 text-xs">{error}</p>}
            </div>

            <div className="mt-4">
              <Button
                onClick={handleSubmit}
                disabled={loading || !requestedAmount}
                className="w-full bg-green-600 hover:bg-green-700 h-10 text-sm"
              >
                {loading ? "Submitting..." : "Request Financing"}
              </Button>
            </div>
          </CardContent>
        </div>
      </div>
    </div>
  );
}
