"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, AlertCircle } from "lucide-react";
import { paymentMethodService, PaymentMethod } from "@/app/services/paymentMethodService";

interface DepositFormProps {
  amount: string;
  paymentMethodId: string;
  phoneNumber: string;
  isLoading: boolean;
  onAmountChange: (amount: string) => void;
  onPaymentMethodChange: (methodId: string, methodName: string) => void;
  onPhoneNumberChange: (phone: string) => void;
  onCancel: () => void;
  onSubmit: () => void;
}

export function DepositForm({
  amount,
  paymentMethodId,
  phoneNumber,
  isLoading,
  onAmountChange,
  onPaymentMethodChange,
  onPhoneNumberChange,
  onCancel,
  onSubmit,
}: DepositFormProps) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loadingMethods, setLoadingMethods] = useState(true);

  useEffect(() => {
    paymentMethodService
      .getActivePaymentMethods()
      .then((res) => {
        const methods: PaymentMethod[] = (res.data ?? []).filter((pm: PaymentMethod) =>
          ["MOBILE_MONEY", "CARD"].includes(pm.name)
        );
        setPaymentMethods(methods);
        // Auto-select first method
        if (methods.length > 0 && !paymentMethodId) {
          onPaymentMethodChange(methods[0].id, methods[0].name);
        }
      })
      .catch(() => setPaymentMethods([]))
      .finally(() => setLoadingMethods(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedMethod = paymentMethods.find((m) => m.id === paymentMethodId);

  const methodLabel = (name: string) => {
    const map: Record<string, string> = {
      MOBILE_MONEY: "Mobile Money (MoMo)",
      CARD: "Card",
    };
    return map[name] ?? name;
  };

  const methodColor = (name: string) => {
    const map: Record<string, string> = {
      MOBILE_MONEY: "bg-green-100 text-green-800",
      CARD: "bg-purple-100 text-purple-800",
    };
    return map[name] ?? "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-4 mt-6">
      <div>
        <label className="block text-gray-800 text-sm mb-2">Amount (RWF)</label>
        <input
          type="number"
          placeholder="0000"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:border-green-500 focus:outline-none text-gray-800"
        />
      </div>

      <div>
        <Label className="block text-gray-800 text-sm mb-2">Payment Method</Label>
        {loadingMethods ? (
          <div className="h-10 flex items-center gap-2 text-gray-400 text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading payment methods...
          </div>
        ) : paymentMethods.length === 0 ? (
          <div className="flex items-start gap-2 border border-red-200 bg-red-50 rounded px-3 py-2">
            <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
            <p className="text-xs text-red-600">
              No payment methods available. Please contact the administrator.
            </p>
          </div>
        ) : (
          <Select value={paymentMethodId} onValueChange={(id) => {
              const m = paymentMethods.find((p) => p.id === id);
              onPaymentMethodChange(id, m?.name ?? "");
            }}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select payment method" />
            </SelectTrigger>
            <SelectContent>
              {paymentMethods.map((method) => (
                <SelectItem key={method.id} value={method.id}>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${methodColor(method.name)}`}>
                    {methodLabel(method.name)}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {selectedMethod?.name === "MOBILE_MONEY" && (
        <div>
          <label className="block text-gray-800 text-sm mb-2">Phone Number</label>
          <input
            type="tel"
            placeholder="250788123456"
            value={phoneNumber}
            onChange={(e) => onPhoneNumberChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:border-green-500 focus:outline-none text-gray-800"
          />
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded"
        >
          Cancel
        </button>
        <button
          onClick={onSubmit}
          disabled={isLoading || paymentMethods.length === 0}
          className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 font-semibold text-white py-2 px-4 rounded flex items-center justify-center"
        >
          {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          Deposit Now
        </button>
      </div>
    </div>
  );
}
