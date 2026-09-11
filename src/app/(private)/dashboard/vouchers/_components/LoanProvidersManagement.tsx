/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Building2,
  Plus,
  Loader2,
  PauseCircle,
  PlayCircle,
  Percent,
} from "lucide-react";
import {
  subscriptionService,
  LoanProvider,
} from "@/app/services/subscriptionService";
import { toast } from "sonner";

export default function LoanProvidersManagement() {
  const [providers, setProviders] = useState<LoanProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  // Create modal fee fields
  const [createFeeEnabled, setCreateFeeEnabled] = useState(false);
  const [createFeePct, setCreateFeePct] = useState("");
  // Edit-fee modal state
  const [feeProvider, setFeeProvider] = useState<LoanProvider | null>(null);
  const [feeEnabled, setFeeEnabled] = useState(false);
  const [feePct, setFeePct] = useState("");

  const load = () => {
    setLoading(true);
    subscriptionService
      .getAllLoanProviders()
      .then((res) => setProviders(res?.data ?? []))
      .catch(() => setProviders([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      await subscriptionService.createLoanProvider({
        name: name.trim(),
        description: description.trim() || undefined,
        unlockFeeEnabled: createFeeEnabled,
        unlockFeePercentage: createFeeEnabled ? (parseFloat(createFeePct) || null) : null,
      });
      toast.success("Loan provider created");
      setCreateOpen(false);
      setName("");
      setDescription("");
      setCreateFeeEnabled(false);
      setCreateFeePct("");
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Failed to create loan provider");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (provider: LoanProvider) => {
    setSubmitting(true);
    try {
      await subscriptionService.updateLoanProviderStatus(provider.id, { isActive: !provider.isActive });
      toast.success(`Loan provider ${provider.isActive ? "deactivated" : "activated"}`);
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Failed to update loan provider");
    } finally {
      setSubmitting(false);
    }
  };

  const openFeeEditor = (provider: LoanProvider) => {
    setFeeProvider(provider);
    setFeeEnabled(provider.unlockFeeEnabled ?? false);
    setFeePct(provider.unlockFeePercentage ? String(provider.unlockFeePercentage) : "");
  };

  const handleSaveFee = async () => {
    if (!feeProvider) return;
    setSubmitting(true);
    try {
      const pct = parseFloat(feePct);
      await subscriptionService.updateLoanProviderStatus(feeProvider.id, {
        unlockFeeEnabled: feeEnabled,
        unlockFeePercentage: feeEnabled && !isNaN(pct) && pct > 0 ? pct : null,
      });
      toast.success(feeEnabled ? "Unlock fee configured" : "Unlock fee disabled (no fee applies)");
      setFeeProvider(null);
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Failed to update unlock fee");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-green-600" />
            Loan Providers
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Institutions that fund financing on voucher cards. Plans can link to a provider.
          </p>
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)} className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-1" />
          Add Provider
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8 text-gray-400">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : providers.length === 0 ? (
        <div className="text-center py-8 text-gray-500 border border-dashed border-gray-200 rounded-lg">
          <Building2 className="h-10 w-10 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No loan providers yet</p>
          <p className="text-xs text-gray-400 mt-1">
            Add a provider so loan-enabled subscription plans can be offered
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {providers.map((provider) => (
            <div
              key={provider.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex items-center gap-3">
                <Building2 className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-800 flex items-center gap-2">
                    {provider.name}
                    {provider.isActive ? (
                      <Badge className="bg-green-100 text-green-700 text-[10px] rounded">
                        Active
                      </Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-500 text-[10px] rounded">
                        Inactive
                      </Badge>
                    )}
                  </p>
                  {provider.description && (
                    <p className="text-xs text-gray-500 mt-0.5">{provider.description}</p>
                  )}
                  {provider.unlockFeeEnabled && (provider.unlockFeePercentage ?? 0) > 0 ? (
                    <p className="text-xs mt-0.5 text-amber-600">
                      Unlock fee: {provider.unlockFeePercentage}% applies
                    </p>
                  ) : (
                    <p className="text-xs mt-0.5 text-gray-400">No unlock fee (default)</p>
                  )}
                  {provider.plans && provider.plans.length > 0 && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {provider.plans.length} linked plan{provider.plans.length === 1 ? "" : "s"}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={submitting}
                  onClick={() => openFeeEditor(provider)}
                >
                  <Percent className="w-4 h-4 mr-1" />
                  Unlock Fee
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={submitting}
                  onClick={() => handleToggle(provider)}
                  className={provider.isActive ? "text-gray-500 hover:text-gray-700" : "text-green-600 hover:text-green-700"}
                >
                  {provider.isActive ? (
                    <PauseCircle className="w-4 h-4 mr-1" />
                  ) : (
                    <PlayCircle className="w-4 h-4 mr-1" />
                  )}
                  {provider.isActive ? "Deactivate" : "Activate"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create provider modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-sm bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-green-600" />
              New Loan Provider
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name *</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Bank of Kigali"
                className="h-10 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description (optional)</label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Premier financing partner"
                className="h-10 text-sm"
              />
            </div>
            <div className="rounded-lg border border-gray-200 p-3 space-y-3">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={createFeeEnabled}
                  onChange={(e) => setCreateFeeEnabled(e.target.checked)}
                  className="h-4 w-4 accent-green-600"
                />
                Apply unlock fee for this provider's loans
              </label>
              {createFeeEnabled && (
                <div>
                  <label className="block text-sm font-medium mb-1">Fee percentage (%)</label>
                  <Input
                    type="number"
                    min={0}
                    step="0.1"
                    value={createFeePct}
                    onChange={(e) => setCreateFeePct(e.target.value)}
                    placeholder="e.g. 5"
                    className="h-10 text-sm"
                  />
                </div>
              )}
              <p className="text-xs text-gray-400">
                Leave disabled to apply no unlock fee (no default).
              </p>
            </div>
            <div className="flex gap-2 pt-1">
              <Button
                onClick={handleCreate}
                disabled={submitting || !name.trim()}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                {submitting ? "Creating..." : "Create Provider"}
              </Button>
              <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={submitting}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit unlock fee modal */}
      <Dialog open={feeProvider !== null} onOpenChange={(open) => !open && setFeeProvider(null)}>
        <DialogContent className="sm:max-w-sm bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Percent className="w-4 h-4 text-green-600" />
              Unlock Fee — {feeProvider?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={feeEnabled}
                onChange={(e) => setFeeEnabled(e.target.checked)}
                className="h-4 w-4 accent-green-600"
              />
              Apply unlock fee for this provider's loans
            </label>
            {feeEnabled && (
              <div>
                <label className="block text-sm font-medium mb-1">Fee percentage (%)</label>
                <Input
                  type="number"
                  min={0}
                  step="0.1"
                  value={feePct}
                  onChange={(e) => setFeePct(e.target.value)}
                  placeholder="e.g. 5"
                  className="h-10 text-sm"
                />
              </div>
            )}
            <p className="text-xs text-gray-400">
              No default fee — if disabled, loans from this provider are activated without an
              unlock fee.
            </p>
            <div className="flex gap-2 pt-1">
              <Button
                onClick={handleSaveFee}
                disabled={submitting || (feeEnabled && !(parseFloat(feePct) > 0))}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                {submitting ? "Saving..." : "Save Fee Config"}
              </Button>
              <Button variant="outline" onClick={() => setFeeProvider(null)} disabled={submitting}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}