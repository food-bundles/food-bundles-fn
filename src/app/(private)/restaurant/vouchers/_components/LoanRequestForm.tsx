"use client";

import { useState, useEffect } from "react";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { voucherService } from "@/app/services/voucherService";
import { toast } from "sonner";
import { Loader2, User, Building2, CheckCircle } from "lucide-react";

interface LoanRequestFormProps {
  onSuccess: () => void;
}

interface Trader {
  id: string;
  name: string;
  termsAndConditions?: string | null;
}

export default function LoanRequestForm({ onSuccess }: LoanRequestFormProps) {
  const [step, setStep] = useState<"form" | "terms">("form");
  const [requestedAmount, setRequestedAmount] = useState("");
  const [providerType, setProviderType] = useState<"TRADER" | "FOOD_BUNDLES" | "">("");
  const [traders, setTraders] = useState<Trader[]>([]);
  const [selectedTraderId, setSelectedTraderId] = useState("");
  const [loadingTraders, setLoadingTraders] = useState(false);
  const [termsData, setTermsData] = useState<{ terms: string; alreadyAccepted: boolean; providerId: string; providerName: string } | null>(null);
  const [loadingTerms, setLoadingTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load traders when TRADER provider type is selected
  useEffect(() => {
    if (providerType === "TRADER") {
      setLoadingTraders(true);
      voucherService
        .getLoanTraders()
        .then((res) => setTraders(res?.data ?? []))
        .catch(() => setTraders([]))
        .finally(() => setLoadingTraders(false));
    } else {
      setTraders([]);
      setSelectedTraderId("");
    }
  }, [providerType]);

  const selectedTrader = traders.find((t) => t.id === selectedTraderId);

  const canProceed =
    !!requestedAmount &&
    !!providerType &&
    (providerType === "FOOD_BUNDLES" || !!selectedTraderId);

  const handleProceed = async () => {
    if (!canProceed) return;
    setError(null);
    setLoadingTerms(true);
    try {
      const params: Parameters<typeof voucherService.getLoanTerms>[0] = {
        providerType: providerType as "TRADER" | "FOOD_BUNDLES",
        ...(providerType === "TRADER" && selectedTraderId ? { fundingTraderId: selectedTraderId } : {}),
      };
      const res = await voucherService.getLoanTerms(params);
      const data = res?.data;

      // If already accepted before, skip T&C modal and submit directly
      if (data?.alreadyAccepted) {
        await submitLoan();
      } else {
        setTermsData({
          terms: data?.terms ?? "No specific terms provided.",
          alreadyAccepted: false,
          providerId: data?.providerId ?? (providerType === "FOOD_BUNDLES" ? "food-bundles" : selectedTraderId),
          providerName: data?.providerName ?? (providerType === "FOOD_BUNDLES" ? "Food Bundles" : selectedTrader?.name ?? ""),
        });
        setStep("terms");
      }
    } catch {
      // If terms endpoint fails, just submit directly
      await submitLoan();
    } finally {
      setLoadingTerms(false);
    }
  };

  const handleAcceptTerms = async () => {
    if (!termsData) return;
    setLoading(true);
    try {
      await voucherService.acceptLoanTerms({
        providerType,
        providerId: termsData.providerId,
        providerName: termsData.providerName,
      });
      await submitLoan();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Failed to accept terms";
      setError(msg);
      setLoading(false);
    }
  };

  const submitLoan = async () => {
    setLoading(true);
    try {
      await voucherService.requestLoanSession({
        requestedAmount: parseFloat(requestedAmount),
        loanProviderType: providerType as "TRADER" | "FOOD_BUNDLES",
        ...(providerType === "TRADER" && selectedTraderId ? { fundingTraderId: selectedTraderId } : {}),
      });
      toast.success("Loan request submitted successfully");
      setRequestedAmount("");
      setProviderType("");
      setSelectedTraderId("");
      setStep("form");
      setTermsData(null);
      onSuccess();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Failed to submit loan request";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-2">
      <h2 className="text-[16px] text-center font-medium mb-4">Finance on Voucher</h2>
      <div className="flex justify-center">
        <div className="w-80 flex flex-col p-6 border rounded shadow-none bg-white">
          <CardContent className="p-0 flex-1 flex flex-col">
            <div className="space-y-4 flex-1">
              {/* Amount */}
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
                />
              </div>

              {/* Loan Provider */}
              <div>
                <label className="block text-sm text-gray-900 mb-2">Loan Provider *</label>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setProviderType("FOOD_BUNDLES")}
                    className={`w-full flex items-center gap-3 p-3 border rounded-lg text-left transition-all ${
                      providerType === "FOOD_BUNDLES"
                        ? "border-green-600 bg-green-50"
                        : "border-gray-200 hover:border-green-300"
                    }`}
                  >
                    <Building2 className="h-4 w-4 text-green-600 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Food Bundles</p>
                      <p className="text-xs text-gray-400">Financed by Food Bundles</p>
                    </div>
                    {providerType === "FOOD_BUNDLES" && (
                      <CheckCircle className="h-4 w-4 text-green-600 ml-auto" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setProviderType("TRADER")}
                    className={`w-full flex items-center gap-3 p-3 border rounded-lg text-left transition-all ${
                      providerType === "TRADER"
                        ? "border-green-600 bg-green-50"
                        : "border-gray-200 hover:border-green-300"
                    }`}
                  >
                    <User className="h-4 w-4 text-green-600 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Trader</p>
                      <p className="text-xs text-gray-400">Financed by a trader</p>
                    </div>
                    {providerType === "TRADER" && (
                      <CheckCircle className="h-4 w-4 text-green-600 ml-auto" />
                    )}
                  </button>
                </div>
              </div>

              {/* Trader picker */}
              {providerType === "TRADER" && (
                <div>
                  <label className="block text-sm text-gray-900 mb-2">Select Trader *</label>
                  {loadingTraders ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-5 w-5 animate-spin text-green-600" />
                    </div>
                  ) : traders.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-3">No traders available</p>
                  ) : (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {traders.map((trader) => (
                        <button
                          key={trader.id}
                          type="button"
                          onClick={() => setSelectedTraderId(trader.id)}
                          className={`w-full flex items-center gap-3 p-2.5 border rounded-lg text-left transition-all ${
                            selectedTraderId === trader.id
                              ? "border-green-600 bg-green-50"
                              : "border-gray-200 hover:border-green-300"
                          }`}
                        >
                          <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                            <User className="h-3.5 w-3.5 text-green-600" />
                          </div>
                          <span className="text-sm font-medium">{trader.name}</span>
                          {selectedTraderId === trader.id && (
                            <CheckCircle className="h-4 w-4 text-green-600 ml-auto" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {error && <p className="text-red-600 text-xs">{error}</p>}
            </div>

            <div className="mt-4">
              <Button
                onClick={handleProceed}
                disabled={!canProceed || loadingTerms}
                className="w-full bg-green-600 hover:bg-green-700 h-10 text-sm"
              >
                {loadingTerms && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {loadingTerms ? "Checking..." : "Request Financing"}
              </Button>
            </div>
          </CardContent>
        </div>
      </div>

      {/* T&C Modal */}
      <Dialog open={step === "terms"} onOpenChange={(open) => { if (!open) { setStep("form"); setTermsData(null); } }}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>Terms & Conditions — {termsData?.providerName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-xs text-gray-500">
              Please read and accept the terms and conditions before proceeding with your loan request.
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-60 overflow-y-auto text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
              {termsData?.terms}
            </div>
            <div className="flex gap-2 pt-1">
              <Button
                onClick={handleAcceptTerms}
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {loading ? "Submitting..." : "Accept & Submit"}
              </Button>
              <Button
                variant="outline"
                onClick={() => { setStep("form"); setTermsData(null); }}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
