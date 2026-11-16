/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Loader2, LogIn } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { roleService, type PersonRole } from "@/app/services/roleService";

/**
 * "Which account opens when I log in?" for people with several accounts
 * (customer, farmer, aggregator…). Without a choice, login opens the one used last.
 */

const LAST_USED = "";

/** The signed-in person's accounts and their default; `usable` only when they have two or more */
export function useDefaultAccount() {
  const [roles, setRoles] = useState<PersonRole[]>([]);
  const [defaultRole, setDefault] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(() => {
    roleService
      .getMyRoles()
      .then((r) => {
        setRoles(r.roles.filter((x) => x.status === "ACTIVE" && x.profileId));
        setDefault(r.defaultRole ?? null);
      })
      .catch(() => setRoles([]))
      .finally(() => setLoaded(true));
  }, []);

  useEffect(load, [load]);

  const save = async (role: string | null) => {
    await roleService.setDefaultRole(role);
    setDefault(role);
  };

  return { roles, defaultRole, loaded, usable: roles.length > 1, save };
}

function Choices({
  roles,
  value,
  onChange,
  includeLastUsed,
}: {
  roles: PersonRole[];
  value: string;
  onChange: (v: string) => void;
  includeLastUsed: boolean;
}) {
  const options = [
    ...roles.map((r) => ({ value: r.role, label: `${r.label} account` })),
    ...(includeLastUsed ? [{ value: LAST_USED, label: "The account I used last" }] : []),
  ];
  return (
    <div className="flex flex-col gap-2" role="radiogroup">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value || "last"}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.value)}
            className={`flex min-h-12 items-center justify-between gap-3 rounded-xl border px-4 text-left text-[15px] font-bold transition-colors cursor-pointer ${
              on ? "border-[#00A43A] bg-[#EFFAF3] text-[#0B2E1F]" : "border-[#DCE6DF] bg-white text-[#0B2E1F] hover:border-[#00A43A]"
            }`}
          >
            {o.label}
            {on && <Check className="h-4 w-4 text-[#00A43A]" />}
          </button>
        );
      })}
    </div>
  );
}

/** Card for settings / profile pages; hidden for people with one account */
export function DefaultAccountSetting({ className = "" }: { className?: string }) {
  const { roles, defaultRole, usable, save } = useDefaultAccount();
  const [value, setValue] = useState(LAST_USED);
  const [saving, setSaving] = useState(false);

  useEffect(() => setValue(defaultRole ?? LAST_USED), [defaultRole]);
  if (!usable) return null;

  const dirty = value !== (defaultRole ?? LAST_USED);
  const submit = async () => {
    setSaving(true);
    try {
      await save(value || null);
      toast.success("Saved: this account opens when you log in");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Could not save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className={`rounded-2xl border border-[#DCE6DF] bg-white p-5 ${className}`}>
      <h2 className="m-0 flex items-center gap-2 text-[17px] font-bold text-[#0B2E1F]">
        <LogIn className="h-5 w-5 text-[#00A43A]" /> Account opened at login
      </h2>
      <p className="m-0 mb-4 mt-1 text-[14px] text-[#4A6358]">
        You have {roles.length} accounts with one email and password. Choose which one opens every time you log in;
        you can switch to the others from your account menu.
      </p>
      <Choices roles={roles} value={value} onChange={setValue} includeLastUsed />
      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={submit}
          disabled={!dirty || saving}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-[#0B2E1F] px-5 text-[15px] font-bold text-white hover:bg-[#0F5C36] disabled:opacity-50 cursor-pointer"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save
        </button>
      </div>
    </section>
  );
}

/** The same choice in a dialog, opened from an account menu */
export function DefaultAccountDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { roles, defaultRole, save } = useDefaultAccount();
  const [value, setValue] = useState(LAST_USED);
  const [saving, setSaving] = useState(false);

  useEffect(() => setValue(defaultRole ?? LAST_USED), [defaultRole, open]);

  const submit = async () => {
    setSaving(true);
    try {
      await save(value || null);
      toast.success("Saved: this account opens when you log in");
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Could not save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Account opened at login</DialogTitle>
          <DialogDescription>Choose which of your accounts opens every time you log in.</DialogDescription>
        </DialogHeader>
        <Choices roles={roles} value={value} onChange={setValue} includeLastUsed />
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={() => onOpenChange(false)} className="h-11 rounded-full px-4 text-[15px] font-bold text-[#4A6358] cursor-pointer">
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={saving}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-[#0B2E1F] px-5 text-[15px] font-bold text-white hover:bg-[#0F5C36] disabled:opacity-50 cursor-pointer"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Asked once, right after the first login of someone with several accounts:
 * which one should always open. They can skip it (login then opens the one used last).
 */
export function FirstLoginAccountChooser({
  roles,
  activeRole,
  onDone,
}: {
  roles: { role: string; label: string; status: string; profileId?: string | null }[];
  activeRole: string;
  /** chosen = the account to open now (null = stay on the one login opened) */
  onDone: (chosen: string | null) => void;
}) {
  const usable = roles.filter((r) => r.status === "ACTIVE" && r.profileId !== null) as PersonRole[];
  const [value, setValue] = useState(activeRole);
  const [busy, setBusy] = useState<"save" | "skip" | null>(null);

  const choose = async () => {
    setBusy("save");
    try {
      await roleService.setDefaultRole(value);
      onDone(value === activeRole ? null : value);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Could not save");
      setBusy(null);
    }
  };
  const skip = async () => {
    setBusy("skip");
    await roleService.skipDefaultRole().catch(() => undefined);
    onDone(null);
  };

  return (
    <Dialog open onOpenChange={(o) => !o && !busy && skip()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Which account should open when you log in?</DialogTitle>
          <DialogDescription>
            You have {usable.length} accounts with this email and password. Pick the one you use most; you can always switch from
            your account menu, and change this later.
          </DialogDescription>
        </DialogHeader>
        <Choices roles={usable} value={value} onChange={setValue} includeLastUsed={false} />
        <div className="flex flex-wrap justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={skip}
            disabled={!!busy}
            className="inline-flex h-11 items-center gap-2 rounded-full px-4 text-[15px] font-bold text-[#4A6358] hover:text-[#0B2E1F] disabled:opacity-50 cursor-pointer"
          >
            {busy === "skip" && <Loader2 className="h-4 w-4 animate-spin" />} Skip
          </button>
          <button
            type="button"
            onClick={choose}
            disabled={!!busy}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-[#0B2E1F] px-5 text-[15px] font-bold text-white hover:bg-[#0F5C36] disabled:opacity-50 cursor-pointer"
          >
            {busy === "save" && <Loader2 className="h-4 w-4 animate-spin" />} Always open this one
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
