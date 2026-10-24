"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DeliveryConfig,
  DeliverySettings,
  deliverySettingsService,
  timingLabel,
} from "@/lib/delivery-fee";

const errorMessage = (error: unknown, fallback: string) =>
  (error as { response?: { data?: { message?: string } } })?.response?.data?.message || fallback;

const summary = (rules: DeliverySettings) =>
  !rules.enabled
    ? "Free delivery"
    : `${rules.deliveryFee.toLocaleString()} RWF · free from ${rules.freeDeliveryMinOrder.toLocaleString()} RWF, ${
        rules.freeDeliveryMinDaysAhead <= 0 ? "any day" : `${timingLabel(rules.freeDeliveryMinDaysAhead)} or later`
      }`;

/**
 * Delivery fees by customer type (schools, hotels…): each type pays the default
 * rules unless it has its own.
 */
export function CustomerTypeFees({ canEdit, refreshKey }: { canEdit: boolean; refreshKey: number }) {
  const [config, setConfig] = useState<DeliveryConfig | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ enabled: true, deliveryFee: "", freeDeliveryMinOrder: "", freeDeliveryMinDaysAhead: "1" });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      setConfig(await deliverySettingsService.getConfig());
    } catch (error) {
      toast.error(errorMessage(error, "Failed to load fees by customer type"));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  if (!config) return <Skeleton className="h-40 w-full" />;

  const startEditing = (customerTypeId: string) => {
    const rules = config.byCustomerType[customerTypeId] ?? config.default;
    setForm({
      enabled: rules.enabled,
      deliveryFee: String(rules.deliveryFee),
      freeDeliveryMinOrder: String(rules.freeDeliveryMinOrder),
      freeDeliveryMinDaysAhead: String(rules.freeDeliveryMinDaysAhead),
    });
    setEditing(customerTypeId);
  };

  const save = async (customerTypeId: string) => {
    setSaving(true);
    try {
      await deliverySettingsService.update({
        customerTypeId,
        enabled: form.enabled,
        deliveryFee: Number(form.deliveryFee) || 0,
        freeDeliveryMinOrder: Number(form.freeDeliveryMinOrder) || 0,
        freeDeliveryMinDaysAhead: Number(form.freeDeliveryMinDaysAhead) || 0,
      });
      toast.success("Fees saved for this customer type");
      setEditing(null);
      await load();
    } catch (error) {
      toast.error(errorMessage(error, "Failed to save fees"));
    } finally {
      setSaving(false);
    }
  };

  const switchToDefault = async (customerTypeId: string) => {
    setSaving(true);
    try {
      await deliverySettingsService.useDefaultFor(customerTypeId);
      toast.success("This customer type now pays the default fees");
      setEditing(null);
      await load();
    } catch (error) {
      toast.error(errorMessage(error, "Failed to update fees"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl border bg-white">
      <div className="border-b px-4 py-3">
        <p className="text-sm font-semibold text-gray-900">Fees by customer type</p>
        <p className="text-xs text-gray-500">
          Every customer type pays the default fees above, unless you set its own.
        </p>
      </div>
      {config.customerTypes.length === 0 ? (
        <p className="px-4 py-6 text-center text-sm text-gray-500">
          No customer types yet. Add them in Stock → Customer types.
        </p>
      ) : (
        <div className="divide-y">
          {config.customerTypes.map((type) => {
            const own = config.byCustomerType[type.id];
            const isEditing = editing === type.id;
            return (
              <div key={type.id} className="px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium capitalize text-gray-900">
                      {type.name.toLowerCase()}
                      {!type.isActive && <span className="ml-2 text-xs font-normal text-gray-400">(inactive)</span>}
                    </p>
                    <p className="text-xs text-gray-600">
                      {own ? (
                        <span className="text-green-700">Own fees: {summary(own)}</span>
                      ) : (
                        <>Default: {summary(config.default)}</>
                      )}
                    </p>
                  </div>
                  {canEdit && !isEditing && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => startEditing(type.id)}>
                        <Pencil className="mr-1 h-3.5 w-3.5" />
                        {own ? "Edit fees" : "Set own fees"}
                      </Button>
                      {own && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 text-xs text-gray-600"
                          disabled={saving}
                          onClick={() => switchToDefault(type.id)}
                        >
                          Use default
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {isEditing && (
                  <div className="mt-3 space-y-3 rounded-lg border bg-gray-50 p-3">
                    <label className="flex items-center justify-between gap-3 text-sm text-gray-800">
                      Charge delivery fees
                      <Switch
                        checked={form.enabled}
                        onCheckedChange={(checked) => setForm((f) => ({ ...f, enabled: checked }))}
                        disabled={saving}
                      />
                    </label>
                    <div className={`grid gap-3 sm:grid-cols-3 ${form.enabled ? "" : "opacity-50"}`}>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-700">Fee (RWF)</label>
                        <Input
                          type="number"
                          min={0}
                          value={form.deliveryFee}
                          onChange={(e) => setForm((f) => ({ ...f, deliveryFee: e.target.value }))}
                          disabled={saving}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-700">Free from (RWF)</label>
                        <Input
                          type="number"
                          min={0}
                          value={form.freeDeliveryMinOrder}
                          onChange={(e) => setForm((f) => ({ ...f, freeDeliveryMinOrder: e.target.value }))}
                          disabled={saving}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-700">Free when delivered</label>
                        <select
                          className="h-9 w-full rounded-md border border-gray-300 bg-white px-2 text-sm"
                          value={form.freeDeliveryMinDaysAhead}
                          onChange={(e) => setForm((f) => ({ ...f, freeDeliveryMinDaysAhead: e.target.value }))}
                          disabled={saving}
                        >
                          <option value="0">Any day</option>
                          <option value="1">Next day or later</option>
                          <option value="2">2 days later or more</option>
                          <option value="3">3 days later or more</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => setEditing(null)} disabled={saving}>
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => save(type.id)}
                        disabled={saving}
                      >
                        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save for {type.name.toLowerCase()}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
