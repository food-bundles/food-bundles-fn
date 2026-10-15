"use client";

import { useEffect, useState } from "react";
import { Loader2, Truck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAdminAccess } from "@/app/hooks/useAdminAccess";
import {
  calculateDeliveryFee,
  DeliverySettings,
  deliverySettingsService,
  timingLabel,
} from "@/lib/delivery-fee";

const TIMING_OPTIONS = [
  { value: 0, label: "Same day" },
  { value: 1, label: "Next day" },
  { value: 2, label: "2 days later" },
  { value: 3, label: "3 days later" },
];

// Example orders shown under the form, so the effect of the rules is clear
const EXAMPLES = [
  { amount: 50000, daysAhead: 0 },
  { amount: 200000, daysAhead: 0 },
  { amount: 50000, daysAhead: 1 },
  { amount: 200000, daysAhead: 1 },
  { amount: 200000, daysAhead: 3 },
];

export default function DeliveryFeesPage() {
  const { can } = useAdminAccess();
  const canEdit = can("delivery_settings", "manage");
  const [settings, setSettings] = useState<DeliverySettings | null>(null);
  const [form, setForm] = useState({
    enabled: true,
    deliveryFee: "",
    freeDeliveryMinOrder: "",
    freeDeliveryMinDaysAhead: "1",
  });
  const [saving, setSaving] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const fillForm = (data: DeliverySettings) =>
    setForm({
      enabled: data.enabled,
      deliveryFee: String(data.deliveryFee),
      freeDeliveryMinOrder: String(data.freeDeliveryMinOrder),
      freeDeliveryMinDaysAhead: String(data.freeDeliveryMinDaysAhead),
    });

  useEffect(() => {
    deliverySettingsService.get().then((data) => {
      setSettings(data);
      fillForm(data);
    });
  }, []);

  const draft: DeliverySettings = {
    enabled: form.enabled,
    deliveryFee: Number(form.deliveryFee) || 0,
    freeDeliveryMinOrder: Number(form.freeDeliveryMinOrder) || 0,
    freeDeliveryMinDaysAhead: Number(form.freeDeliveryMinDaysAhead) || 0,
  };
  const isCustomTiming = !TIMING_OPTIONS.some((o) => o.value === draft.freeDeliveryMinDaysAhead);

  const save = async () => {
    setSaving(true);
    try {
      const saved = await deliverySettingsService.update(draft);
      setSettings(saved);
      toast.success("Delivery settings saved. New orders use them right away.");
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to save delivery settings";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const reset = async () => {
    setConfirmReset(false);
    setSaving(true);
    try {
      const defaults = await deliverySettingsService.reset();
      setSettings(defaults);
      fillForm(defaults);
      toast.success("Delivery settings reset to the defaults");
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to reset delivery settings";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  if (!settings) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-6 w-56" />
        <Skeleton className="h-64 w-full max-w-2xl" />
      </div>
    );
  }

  const placedAt = new Date();
  const dayLater = (days: number) => {
    const d = new Date(placedAt);
    d.setDate(d.getDate() + days);
    return d;
  };

  return (
    <div className="p-4 space-y-4 max-w-3xl">
      <div>
        <h1 className="text-[16px] font-medium flex items-center gap-2">
          <Truck className="h-4 w-4 text-green-600" />
          Delivery Fees
        </h1>
        <p className="text-xs text-gray-600">
          The delivery fee depends on the order amount and when the customer wants delivery.
        </p>
      </div>

      <div className="rounded-xl border bg-white p-5 space-y-5">
        <div className="flex items-center justify-between gap-4 rounded-lg border px-4 py-3">
          <div>
            <p className="text-sm font-medium text-gray-900">Charge delivery fees</p>
            <p className="text-[11px] text-gray-500">
              {form.enabled
                ? "On: the rules below decide the fee for each order."
                : "Off: delivery is free on every order. Your values below are kept for when you turn it back on."}
            </p>
          </div>
          <Switch
            checked={form.enabled}
            onCheckedChange={(checked) => setForm((f) => ({ ...f, enabled: checked }))}
            disabled={!canEdit || saving}
            aria-label="Charge delivery fees"
          />
        </div>

        <div className={`space-y-5 ${form.enabled ? "" : "opacity-50"}`}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Delivery fee (RWF)</label>
            <Input
              type="number"
              min={0}
              value={form.deliveryFee}
              onChange={(e) => setForm((f) => ({ ...f, deliveryFee: e.target.value }))}
              disabled={!canEdit || saving}
            />
            <p className="mt-1 text-[11px] text-gray-500">Charged when free delivery does not apply.</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Free delivery minimum order (RWF)
            </label>
            <Input
              type="number"
              min={0}
              value={form.freeDeliveryMinOrder}
              onChange={(e) => setForm((f) => ({ ...f, freeDeliveryMinOrder: e.target.value }))}
              disabled={!canEdit || saving}
            />
            <p className="mt-1 text-[11px] text-gray-500">
              Orders below this always pay the delivery fee.
            </p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Free delivery timing: delivery must be at least
          </label>
          <div className="flex flex-wrap gap-2">
            {TIMING_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setForm((f) => ({ ...f, freeDeliveryMinDaysAhead: String(option.value) }))}
                disabled={!canEdit || saving}
                className={`h-9 px-4 rounded-lg border text-sm transition-colors cursor-pointer disabled:cursor-not-allowed ${
                  draft.freeDeliveryMinDaysAhead === option.value
                    ? "border-green-500 bg-green-50 text-green-700 font-medium"
                    : "border-gray-300 text-gray-700 hover:border-green-300"
                }`}
              >
                {option.label}
              </button>
            ))}
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={0}
                max={30}
                value={isCustomTiming ? form.freeDeliveryMinDaysAhead : ""}
                placeholder="Other"
                onChange={(e) => setForm((f) => ({ ...f, freeDeliveryMinDaysAhead: e.target.value }))}
                disabled={!canEdit || saving}
                className={`h-9 w-20 ${isCustomTiming ? "border-green-500" : ""}`}
              />
              <span className="text-xs text-gray-500">days later</span>
            </div>
          </div>
          <p className="mt-1 text-[11px] text-gray-500">
            Deliveries sooner than this always pay the delivery fee, whatever the amount.
          </p>
        </div>

        </div>

        {!form.enabled ? (
          <div className="rounded-lg bg-green-50 border border-green-100 px-4 py-3 text-[13px] text-green-900">
            Delivery fees are <strong>off</strong>: delivery is <strong>free on every order</strong>.
          </div>
        ) : (
        <div className="rounded-lg bg-green-50 border border-green-100 px-4 py-3 text-[13px] text-green-900">
          Delivery is <strong>free</strong> when the order is{" "}
          <strong>{draft.freeDeliveryMinOrder.toLocaleString()} RWF or more</strong> and delivered{" "}
          <strong>
            {draft.freeDeliveryMinDaysAhead <= 0
              ? "any day"
              : `${timingLabel(draft.freeDeliveryMinDaysAhead)} or later`}
          </strong>
          . Otherwise it costs <strong>{draft.deliveryFee.toLocaleString()} RWF</strong>. Customers
          whose subscription includes free delivery never pay it.
        </div>
        )}

        {canEdit ? (
          <div className="flex flex-wrap justify-between gap-2">
            <Button variant="outline" onClick={() => setConfirmReset(true)} disabled={saving}>
              Reset to defaults
            </Button>
            <Button onClick={save} disabled={saving} className="bg-green-600 hover:bg-green-700">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save settings
            </Button>
          </div>
        ) : (
          <p className="text-xs text-gray-500">You can view these settings but not change them.</p>
        )}
      </div>

      <div className="rounded-xl border bg-white">
        <p className="px-4 py-3 text-xs font-semibold text-gray-700 border-b">Examples with these settings</p>
        <div className="divide-y text-sm">
          {EXAMPLES.map((example) => {
            const fee = calculateDeliveryFee({
              orderAmount: example.amount,
              placedAt,
              requestedDelivery: dayLater(example.daysAhead),
              settings: draft,
            });
            return (
              <div key={`${example.amount}-${example.daysAhead}`} className="flex justify-between px-4 py-2">
                <span className="text-gray-700">
                  {example.amount.toLocaleString()} RWF order, delivered {timingLabel(example.daysAhead)}
                </span>
                <span className={fee > 0 ? "font-medium text-gray-900" : "font-medium text-green-700"}>
                  {fee > 0 ? `${fee.toLocaleString()} RWF` : "Free"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <AlertDialog open={confirmReset} onOpenChange={setConfirmReset}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset delivery settings?</AlertDialogTitle>
            <AlertDialogDescription>
              This deletes your saved delivery settings and goes back to the defaults: fees on,
              5,000 RWF, free from 150,000 RWF delivered next day or later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={reset} className="bg-red-600 hover:bg-red-700">
              Reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
