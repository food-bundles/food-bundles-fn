/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import createAxiosClient from "@/app/hooks/axiosClient";
import { useAdminAccess } from "@/app/hooks/useAdminAccess";
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

export type AccountType = "farmer" | "restaurant" | "admin";

const MODULE: Record<AccountType, string> = { farmer: "farmers", restaurant: "restaurants", admin: "admins" };

// One request per table page: the switches of the rows on screen ask together
const queue: Record<string, { ids: Set<string>; waiters: Map<string, ((v: boolean) => void)[]>; timer?: ReturnType<typeof setTimeout> }> = {};

const loadStatus = (type: AccountType, id: string) =>
  new Promise<boolean>((resolve) => {
    const q = (queue[type] ??= { ids: new Set(), waiters: new Map() });
    q.ids.add(id);
    q.waiters.set(id, [...(q.waiters.get(id) ?? []), resolve]);
    if (q.timer) return;
    q.timer = setTimeout(async () => {
      const ids = [...q.ids];
      const waiters = new Map(q.waiters);
      delete queue[type];
      let map: Record<string, boolean> = {};
      try {
        map = (await createAxiosClient().post(`/account-status/${type}/lookup`, { ids })).data?.data ?? {};
      } catch {
        // Unknown: shown as active, the switch still works
      }
      for (const [rowId, fns] of waiters) fns.forEach((fn) => fn(map[rowId] ?? true));
    }, 30);
  });

/**
 * Active / deactivated for a farmer, customer or team account. A deactivated
 * account can't log in or be opened ("Your account has been deactivated").
 * Without the change_status permission it's shown read-only.
 */
export function AccountStatusSwitch({ type, id, name }: { type: AccountType; id: string; name?: string | null }) {
  const { can } = useAdminAccess();
  const canChange = can(MODULE[type], "change_status");
  const [active, setActive] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmOff, setConfirmOff] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadStatus(type, id).then((v) => !cancelled && setActive(v));
    return () => {
      cancelled = true;
    };
  }, [type, id]);

  const save = async (next: boolean) => {
    setSaving(true);
    try {
      const res = await createAxiosClient().patch(`/account-status/${type}/${id}`, { active: next });
      setActive(next);
      toast.success(res.data?.message ?? (next ? "Account activated" : "Account deactivated"));
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Could not change the account status");
    } finally {
      setSaving(false);
      setConfirmOff(false);
    }
  };

  if (active === null) return <Loader2 className="h-4 w-4 animate-spin text-[#4A6358]" aria-label="Loading status" />;

  const label = (
    <span
      className={`rounded-full px-2 py-0.5 text-[12px] font-bold ${
        active ? "bg-[#E3F3E8] text-[#007A35]" : "bg-red-50 text-red-700"
      }`}
    >
      {active ? "Active" : "Deactivated"}
    </span>
  );
  if (!canChange) return label;

  return (
    <span className="inline-flex items-center gap-2">
      <Switch
        checked={active}
        disabled={saving}
        onCheckedChange={(on) => (on ? save(true) : setConfirmOff(true))}
        aria-label={active ? "Deactivate account" : "Activate account"}
      />
      {saving ? <Loader2 className="h-4 w-4 animate-spin text-[#4A6358]" /> : label}

      <AlertDialog open={confirmOff} onOpenChange={setConfirmOff}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate {name || "this account"}?</AlertDialogTitle>
            <AlertDialogDescription>
              This deactivates the whole user: they can&apos;t log in or use any of their accounts (farmer, customer, staff) until activated again. They see “Your account has been
              deactivated. Please contact support.” Their data stays.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => save(false)} className="bg-red-600 hover:bg-red-700">
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </span>
  );
}
