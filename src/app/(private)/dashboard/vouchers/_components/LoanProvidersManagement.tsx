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
  Loader2,
  PauseCircle,
  Percent,
  PlayCircle,
  Wallet,
} from "lucide-react";
import {
  subscriptionService,
  LoanAccessProvidersData,
  PlatformLoanProvider,
  TraderLoanProvider,
} from "@/app/services/subscriptionService";
import { toast } from "sonner";

type FeeTargetKind = "platform" | "trader";

interface FeeTarget {
  kind: FeeTargetKind;
  id: string;
  name: string;
}

const feeBadge = (enabled: boolean, pct?: number | null) =>
  enabled && (pct ?? 0) > 0 ? (
    <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-[10px] rounded">
      Active — {pct}%
    </Badge>
  ) : (
    <Badge className="bg-gray-100 text-gray-500 text-[10px] rounded">
      Paused — no fee
    </Badge>
  );

type LeftoverPolicy = "USELESS" | "TOPUP_WALLET";

// Admin control for what happens to a loan's unused amount after the voucher is
// used once: credited back to the restaurant's wallet, or recorded as useless.
function LeftoverSelect({
  value,
  saving,
  disabled,
  onChange,
}: {
  value?: string;
  saving: boolean;
  disabled: boolean;
  onChange: (policy: LeftoverPolicy) => void;
}) {
  const policy: LeftoverPolicy = value === "TOPUP_WALLET" ? "TOPUP_WALLET" : "USELESS";
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">
        Leftover
      </span>
      <select
        value={policy}
        disabled={disabled || saving}
        onChange={(e) => onChange(e.target.value as LeftoverPolicy)}
        title="What happens to the unused amount left on a loan once its voucher is used at checkout"
        className="h-7 text-[11px] border border-gray-300 rounded px-1.5 bg-white text-gray-700 disabled:opacity-50"
      >
        <option value="USELESS">Useless (recorded)</option>
        <option value="TOPUP_WALLET">Top up wallet</option>
      </select>
      {saving && <Loader2 className="w-3 h-3 animate-spin text-green-600" />}
    </div>
  );
}

export default function LoanProvidersManagement() {
  const [data, setData] = useState<LoanAccessProvidersData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feeTarget, setFeeTarget] = useState<FeeTarget | null>(null);
  const [feeEnabled, setFeeEnabled] = useState(false);
  const [feePct, setFeePct] = useState("");
  const [leftoverSaving, setLeftoverSaving] = useState<{
    kind: FeeTargetKind;
    id: string;
  } | null>(null);

  const load = () => {
    setLoading(true);
    subscriptionService
      .getLoanAccessProviders()
      .then((res) => setData(res?.data ?? null))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const openFeeEditor = (
    kind: FeeTargetKind,
    id: string,
    name: string,
    enabled: boolean,
    pct?: number | null,
  ) => {
    setFeeTarget({ kind, id, name });
    setFeeEnabled(enabled);
    setFeePct(pct ? String(pct) : "");
  };

  const saveFee = async (
    kind: FeeTargetKind,
    id: string,
    enabled: boolean,
    pct: number | null,
  ) => {
    setSubmitting(true);
    try {
      if (kind === "trader") {
        await subscriptionService.updateTraderUnlockFee(id, {
          unlockFeeEnabled: enabled,
          unlockFeePercentage: pct,
        });
      } else {
        await subscriptionService.updateLoanProviderStatus(id, {
          unlockFeeEnabled: enabled,
          unlockFeePercentage: pct,
        });
      }
      toast.success(
        enabled ? "Unlock fee activated" : "Unlock fee paused",
      );
      setFeeTarget(null);
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Failed to update unlock fee");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveFee = () => {
    if (!feeTarget) return;
    const pct = parseFloat(feePct);
    const validPct = !isNaN(pct) && pct > 0 ? pct : null;
    if (feeEnabled && validPct === null) {
      toast.error("Enter a fee percentage greater than 0");
      return;
    }
    saveFee(feeTarget.kind, feeTarget.id, feeEnabled, feeEnabled ? validPct : null);
  };

  const handleLeftoverPolicy = async (
    kind: FeeTargetKind,
    id: string,
    leftoverPolicy: "USELESS" | "TOPUP_WALLET",
  ) => {
    setLeftoverSaving({ kind, id });
    try {
      if (kind === "trader") {
        await subscriptionService.updateTraderLeftoverPolicy(id, leftoverPolicy);
      } else {
        await subscriptionService.updateLoanProviderStatus(id, { leftoverPolicy });
      }
      toast.success(
        leftoverPolicy === "TOPUP_WALLET"
          ? "Leftover will be topped up to the restaurant's wallet"
          : "Leftover will be useless (recorded but not reusable)",
      );
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Failed to update leftover policy");
    } finally {
      setLeftoverSaving(null);
    }
  };

  // Quick pause/activate. Enabling without a saved percentage opens the editor.
  const toggleFee = (
    kind: FeeTargetKind,
    id: string,
    name: string,
    enabled: boolean,
    pct?: number | null,
  ) => {
    if (!enabled && (!pct || pct <= 0)) {
      openFeeEditor(kind, id, name, true, pct);
      return;
    }
    saveFee(kind, id, !enabled, enabled ? null : pct ?? null);
  };

  const platform = data?.platform;
  const traders = data?.traders ?? [];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <Percent className="w-4 h-4 text-green-600" />
          Loan Providers &amp; Unlock Fees
        </h3>
        <p className="text-xs text-gray-500 mt-0.5">
          Set the unlock fee applied when a loan is approved. Only traders and the Food
          Bundles platform can fund loans. When a fee is active it is applied
          automatically during approval — no need to set it again when sending a loan to a
          trader.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8 text-gray-400">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : !data ? (
        <div className="text-center py-8 text-gray-500 border border-dashed border-gray-200 rounded-lg">
          <Building2 className="h-10 w-10 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">Could not load loan providers</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Platform lender */}
          {platform && (
            <PlatformRow
              platform={platform}
              onConfigure={openFeeEditor}
              onToggle={toggleFee}
              onLeftoverChange={handleLeftoverPolicy}
              leftoverSaving={
                leftoverSaving?.kind === "platform" ? leftoverSaving.id : null
              }
              disabled={submitting}
            />
          )}

          {/* Traders */}
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              Traders ({traders.length})
            </p>
            {traders.length === 0 ? (
              <div className="text-center py-6 text-gray-500 border border-dashed border-gray-200 rounded-lg">
                <p className="text-sm">No traders yet</p>
                <p className="text-xs text-gray-400 mt-1">
                  Traders become loan providers once they self-register or accept an invitation
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {traders.map((trader) => (
                  <TraderRow
                    key={trader.id}
                    trader={trader}
                    onConfigure={openFeeEditor}
                    onToggle={toggleFee}
                    onLeftoverChange={handleLeftoverPolicy}
                    leftoverSaving={
                      leftoverSaving?.kind === "trader" && leftoverSaving.id === trader.id
                        ? trader.id
                        : null
                    }
                    disabled={submitting}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Unlock fee editor */}
      <Dialog open={feeTarget !== null} onOpenChange={(open) => !open && setFeeTarget(null)}>
        <DialogContent className="sm:max-w-sm bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Percent className="w-4 h-4 text-green-600" />
              Unlock Fee — {feeTarget?.name}
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
              {feeTarget?.kind === "trader"
                ? "Apply an unlock fee when this trader funds a loan"
                : "Apply an unlock fee for platform-funded loans"}
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
              No default fee — when paused, loans from this provider activate without an
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
              <Button variant="outline" onClick={() => setFeeTarget(null)} disabled={submitting}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PlatformRow({
  platform,
  onConfigure,
  onToggle,
  onLeftoverChange,
  leftoverSaving,
  disabled,
}: {
  platform: PlatformLoanProvider;
  onConfigure: (
    kind: FeeTargetKind,
    id: string,
    name: string,
    enabled: boolean,
    pct?: number | null,
  ) => void;
  onToggle: (
    kind: FeeTargetKind,
    id: string,
    name: string,
    enabled: boolean,
    pct?: number | null,
  ) => void;
  onLeftoverChange: (kind: FeeTargetKind, id: string, policy: LeftoverPolicy) => void;
  leftoverSaving: string | null;
  disabled: boolean;
}) {
  return (
    <div className="flex items-center justify-between p-3 bg-green-50/50 rounded-lg border border-green-200">
      <div className="flex items-center gap-3">
        <Building2 className="h-4 w-4 text-green-600" />
        <div>
          <p className="text-sm font-medium text-gray-800 flex items-center gap-2">
            {platform.name}
            <Badge className="bg-green-100 text-green-700 text-[10px] rounded">
              Platform lender
            </Badge>
            {feeBadge(platform.unlockFeeEnabled, platform.unlockFeePercentage)}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            Default lender when no trader is selected.
          </p>
        </div>
      </div>
      <div className="flex flex-col items-stretch gap-2">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={() =>
              onConfigure("platform", platform.id, platform.name, platform.unlockFeeEnabled, platform.unlockFeePercentage)
            }
          >
            <Percent className="w-4 h-4 mr-1" />
            Unlock Fee
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={disabled}
            onClick={() =>
              onToggle("platform", platform.id, platform.name, platform.unlockFeeEnabled, platform.unlockFeePercentage)
            }
            className={platform.unlockFeeEnabled ? "text-gray-500 hover:text-gray-700" : "text-green-600 hover:text-green-700"}
          >
            {platform.unlockFeeEnabled ? (
              <PauseCircle className="w-4 h-4 mr-1" />
            ) : (
              <PlayCircle className="w-4 h-4 mr-1" />
            )}
            {platform.unlockFeeEnabled ? "Pause" : "Activate"}
          </Button>
        </div>
        <div className="flex justify-end">
          <LeftoverSelect
            value={platform.leftoverPolicy}
            saving={leftoverSaving === platform.id}
            disabled={disabled}
            onChange={(policy) =>
              onLeftoverChange("platform", platform.id, policy)
            }
          />
        </div>
      </div>
    </div>
  );
}

function TraderRow({
  trader,
  onConfigure,
  onToggle,
  onLeftoverChange,
  leftoverSaving,
  disabled,
}: {
  trader: TraderLoanProvider;
  onConfigure: (
    kind: FeeTargetKind,
    id: string,
    name: string,
    enabled: boolean,
    pct?: number | null,
  ) => void;
  onToggle: (
    kind: FeeTargetKind,
    id: string,
    name: string,
    enabled: boolean,
    pct?: number | null,
  ) => void;
  onLeftoverChange: (kind: FeeTargetKind, id: string, policy: LeftoverPolicy) => void;
  leftoverSaving: string | null;
  disabled: boolean;
}) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center gap-3">
        <Wallet className="h-4 w-4 text-gray-400" />
        <div>
          <p className="text-sm font-medium text-gray-800 flex items-center gap-2">
            {trader.username}
            {feeBadge(trader.unlockFeeEnabled, trader.unlockFeePercentage)}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">{trader.email}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            Balance: {trader.balance.toLocaleString()} RWF
            {trader.requiresSubscription && " · subscription required"}
          </p>
        </div>
      </div>
      <div className="flex flex-col items-stretch gap-2">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={() =>
              onConfigure("trader", trader.id, trader.username, trader.unlockFeeEnabled, trader.unlockFeePercentage)
            }
          >
            <Percent className="w-4 h-4 mr-1" />
            Unlock Fee
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={disabled}
            onClick={() =>
              onToggle("trader", trader.id, trader.username, trader.unlockFeeEnabled, trader.unlockFeePercentage)
            }
            className={trader.unlockFeeEnabled ? "text-gray-500 hover:text-gray-700" : "text-green-600 hover:text-green-700"}
          >
            {trader.unlockFeeEnabled ? (
              <PauseCircle className="w-4 h-4 mr-1" />
            ) : (
              <PlayCircle className="w-4 h-4 mr-1" />
            )}
            {trader.unlockFeeEnabled ? "Pause" : "Activate"}
          </Button>
        </div>
        <div className="flex justify-end">
          <LeftoverSelect
            value={trader.leftoverPolicy}
            saving={leftoverSaving === trader.id}
            disabled={disabled}
            onChange={(policy) =>
              onLeftoverChange("trader", trader.id, policy)
            }
          />
        </div>
      </div>
    </div>
  );
}
