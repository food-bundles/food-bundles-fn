"use client";

import { useState } from "react";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { voucherService } from "@/app/services/voucherService";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface LoanRequestFormProps {
  onSuccess: () => void;
}

// What happens after the request, so the customer knows the next step
const STEPS = [
  "Food Bundles reviews your request",
  "A trader takes it and offers the credit",
  "You read and sign their terms",
  "They approve: the credit is on your card at once",
];

/**
 * Ask for credit: just the amount. No provider is chosen here: once Food
 * Bundles accepts the request, traders see it and one takes it; you then sign
 * their terms before they approve.
 */
export default function LoanRequestForm({ onSuccess }: LoanRequestFormProps) {
  const [requestedAmount, setRequestedAmount] = useState("");
  const [purpose, setPurpose] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const amount = parseFloat(requestedAmount);
  const canSubmit = Number.isFinite(amount) && amount > 0 && !loading;

  const submit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    try {
      await voucherService.requestLoanSession({ requestedAmount: amount, purpose: purpose.trim() || undefined });
      toast.success("Loan request sent. We'll tell you when a trader takes it.");
      setRequestedAmount("");
      setPurpose("");
      onSuccess();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Failed to submit loan request";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="loan-request" className="mb-2 scroll-mt-24">
      <h2 className="text-[16px] text-center font-medium mb-4">Finance on Voucher</h2>
      <div className="flex justify-center">
        <div className="w-80 flex flex-col p-6 border rounded shadow-none bg-white">
          <CardContent className="p-0 flex-1 flex flex-col">
            <div className="space-y-4 flex-1">
              <div>
                <label htmlFor="loan-amount" className="block text-sm text-gray-900 mb-2">
                  Requested Amount (RWF) *
                </label>
                <Input
                  id="loan-amount"
                  type="number"
                  min="1"
                  value={requestedAmount}
                  onChange={(e) => setRequestedAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full rounded text-sm h-10"
                />
              </div>

              <ol className="space-y-1.5 rounded-lg bg-gray-50 p-3 text-xs text-gray-600">
                {STEPS.map((s, i) => (
                  <li key={s} className="flex gap-2">
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-green-600 text-[10px] font-semibold text-white">
                      {i + 1}
                    </span>
                    {s}
                  </li>
                ))}
              </ol>

              {error && <p className="text-red-600 text-xs">{error}</p>}
            </div>

            <div className="mt-4">
              <Button onClick={submit} disabled={!canSubmit} className="w-full bg-green-600 hover:bg-green-700 h-10 text-sm">
                {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {loading ? "Sending..." : "Request Credit"}
              </Button>
            </div>
          </CardContent>
        </div>
      </div>
    </div>
  );
}
