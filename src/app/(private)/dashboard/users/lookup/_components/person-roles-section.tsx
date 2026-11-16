/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useCallback, useEffect, useState } from "react";
import { Ban, Loader2, Play, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { useAdminAccess } from "@/app/hooks/useAdminAccess";
import { personAdminService, type PersonOfProfile, type PersonRoleDetail } from "@/app/services/roleService";
import { adminRoleService, type AdminRole } from "@/app/services/adminRoleService";
import { LocationFields, type LocationValue } from "@/components/location-fields";

const day = (d: any) => (d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—");
const input =
  "h-10 w-full rounded-xl border border-[#DCE6DF] bg-white px-3 text-[14px] text-[#0B2E1F] focus:border-[#00A43A] focus:outline-none";

const STATUS_TONE: Record<string, string> = {
  ACTIVE: "bg-[#E3F3E8] text-[#007A35]",
  PENDING: "bg-[#FFF4DD] text-[#9A6400]",
  SUSPENDED: "bg-red-50 text-red-700",
};
const STATUS_TEXT: Record<string, string> = { ACTIVE: "Active", PENDING: "Waiting for approval", SUSPENDED: "Suspended" };
const EMPTY_PLACE: LocationValue = { province: "", district: "", sector: "", cell: "", village: "" };

function RoleRow({
  r,
  canManage,
  openedByAdmin,
  onChange,
  userId,
}: {
  r: PersonRoleDetail;
  canManage: boolean;
  openedByAdmin: boolean;
  onChange: () => void;
  userId: string;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const a = r.account;

  const run = async (kind: "suspend" | "activate" | "remove") => {
    setBusy(kind);
    try {
      const res =
        kind === "remove"
          ? await personAdminService.removeRole(userId, r.role)
          : await personAdminService.setStatus(userId, r.role, kind === "suspend" ? "SUSPENDED" : "ACTIVE");
      toast.success(res.message);
      onChange();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Could not change the role");
    } finally {
      setBusy(null);
      setConfirmRemove(false);
    }
  };

  return (
    <li className="flex flex-col gap-2 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[15px] font-bold text-[#0B2E1F]">{r.label}</span>
        {r.dashboardRole && <span className="text-[13px] text-[#4A6358]">· {r.dashboardRole}</span>}
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${STATUS_TONE[r.status] ?? ""}`}>{STATUS_TEXT[r.status] ?? r.status}</span>
        {r.isThisAccount && <span className="rounded-full bg-[#0B2E1F] px-2 py-0.5 text-[11px] font-bold text-white">This account</span>}
        {openedByAdmin && <span className="rounded-full bg-[#EEF3EF] px-2 py-0.5 text-[11px] font-bold text-[#4A6358]">Opened by an admin</span>}
        {a?.deletedAt && <span className="rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-bold text-red-700">In trash</span>}
      </div>
      {a && (
        <p className="m-0 text-[13px] text-[#4A6358]">
          {[a.email, a.phone, a.tin ? `TIN ${a.tin}` : null].filter(Boolean).join(" · ") || "No contact"} · since {day(r.since)}
        </p>
      )}
      {canManage && r.status !== "PENDING" && (
        <div className="flex flex-wrap gap-2">
          {r.status === "ACTIVE" ? (
            <button
              type="button"
              onClick={() => run("suspend")}
              disabled={!!busy}
              className="inline-flex h-8 items-center gap-1.5 rounded-full border border-[#DCE6DF] px-3 text-[13px] font-bold text-[#0B2E1F] hover:border-[#E5402D] disabled:opacity-60 cursor-pointer"
            >
              {busy === "suspend" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Ban className="h-3.5 w-3.5" />} Suspend
            </button>
          ) : (
            <button
              type="button"
              onClick={() => run("activate")}
              disabled={!!busy}
              className="inline-flex h-8 items-center gap-1.5 rounded-full border border-[#DCE6DF] px-3 text-[13px] font-bold text-[#0B2E1F] hover:border-[#00A43A] disabled:opacity-60 cursor-pointer"
            >
              {busy === "activate" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />} Reactivate
            </button>
          )}
          {!confirmRemove ? (
            <button
              type="button"
              onClick={() => setConfirmRemove(true)}
              disabled={!!busy}
              className="inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[13px] font-bold text-red-600 hover:bg-red-50 cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" /> Remove
            </button>
          ) : (
            <span className="flex flex-wrap items-center gap-2 text-[13px] text-[#0B2E1F]">
              Remove {r.label}? Its account goes to the trash; orders stay.
              <button
                type="button"
                onClick={() => run("remove")}
                disabled={!!busy}
                className="inline-flex h-8 items-center gap-1.5 rounded-full bg-red-600 px-3 font-bold text-white hover:bg-red-700 disabled:opacity-60 cursor-pointer"
              >
                {busy === "remove" && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Remove
              </button>
              <button type="button" onClick={() => setConfirmRemove(false)} className="h-8 px-2 font-bold text-[#4A6358] cursor-pointer">
                Cancel
              </button>
            </span>
          )}
        </div>
      )}
    </li>
  );
}

function AddRoleForm({ userId, options, onDone, onCancel }: { userId: string; options: { role: string; label: string }[]; onDone: () => void; onCancel: () => void }) {
  const [role, setRole] = useState("");
  const [form, setForm] = useState({ businessName: "", tin: "", loanTermsAndConditions: "", note: "" });
  const [place, setPlace] = useState<LocationValue>(EMPTY_PLACE);
  const [adminRoleId, setAdminRoleId] = useState("");
  const [staffRoles, setStaffRoles] = useState<AdminRole[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (role !== "STAFF" || staffRoles.length) return;
    adminRoleService.getRoles().then((r) => r.success && setStaffRoles(r.data.filter((x) => !x.isSystem)));
  }, [role, staffRoles.length]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return;
    setBusy(true);
    try {
      const details: Record<string, unknown> = { ...place, note: form.note };
      if (role === "RESTAURANT") Object.assign(details, { businessName: form.businessName, tin: form.tin });
      if (role === "TRADER") details.loanTermsAndConditions = form.loanTermsAndConditions;
      const res = await personAdminService.addRole(userId, { role, details, adminRoleId: role === "STAFF" ? adminRoleId : null });
      toast.success(res.message);
      onDone();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Could not add the role");
    } finally {
      setBusy(false);
    }
  };

  const needsPlace = role === "FARMER" || role === "AGGREGATOR";
  return (
    <form onSubmit={submit} className="flex flex-col gap-3 rounded-xl border border-[#DCE6DF] bg-[#F6F9F7] p-3">
      <div className="flex items-center justify-between">
        <span className="text-[14px] font-bold text-[#0B2E1F]">Add a role</span>
        <button type="button" onClick={onCancel} aria-label="Close" className="flex h-8 w-8 items-center justify-center rounded-full text-[#4A6358] hover:bg-white cursor-pointer">
          <X className="h-4 w-4" />
        </button>
      </div>
      <select className={input} value={role} onChange={(e) => setRole(e.target.value)} required aria-label="Role">
        <option value="">Choose a role…</option>
        {options.map((o) => (
          <option key={o.role} value={o.role}>{o.label}</option>
        ))}
      </select>
      {role === "RESTAURANT" && (
        <div className="grid gap-2 sm:grid-cols-2">
          <input className={input} placeholder="Business name" value={form.businessName} onChange={set("businessName")} required />
          <input className={input} placeholder="TIN (9 digits)" value={form.tin} onChange={set("tin")} required inputMode="numeric" maxLength={9} />
        </div>
      )}
      {(needsPlace || role === "RESTAURANT") && (
        <div className="flex flex-col gap-1">
          <span className="text-[12px] text-[#4A6358]">{needsPlace ? "Province, district and sector are required" : "Location (optional)"}</span>
          <LocationFields value={place} onChange={setPlace} disabled={busy} />
        </div>
      )}
      {role === "TRADER" && (
        <textarea
          className="w-full rounded-xl border border-[#DCE6DF] bg-white px-3 py-2 text-[14px]"
          rows={3}
          placeholder="Loan terms and conditions (can be set later)"
          value={form.loanTermsAndConditions}
          onChange={set("loanTermsAndConditions")}
        />
      )}
      {role === "STAFF" && (
        <select className={input} value={adminRoleId} onChange={(e) => setAdminRoleId(e.target.value)} required aria-label="Dashboard role">
          <option value="">Dashboard role they get…</option>
          {staffRoles.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
      )}
      <p className="m-0 text-[12px] text-[#4A6358]">They keep their password and get an SMS/email saying the role was added.</p>
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={busy || !role}
          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#0B2E1F] px-4 text-[13px] font-bold text-white hover:bg-[#0F5C36] disabled:opacity-60 cursor-pointer"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Add role
        </button>
      </div>
    </form>
  );
}

/** The person behind an account: all their roles, and (with permission) managing them */
export function PersonRolesSection({ profileId }: { profileId: string }) {
  const { can } = useAdminAccess();
  const canManage = can("user_lookup", "manage_roles");
  const [data, setData] = useState<PersonOfProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const load = useCallback(() => {
    personAdminService
      .ofProfile(profileId)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [profileId]);

  useEffect(() => {
    setLoading(true);
    setAdding(false);
    load();
  }, [load]);

  if (loading) {
    return (
      <section className="flex items-center gap-2 rounded-2xl border border-[#DCE6DF] p-4 text-[14px] text-[#4A6358]">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading roles…
      </section>
    );
  }
  if (!data) return null;
  if (!data.person) {
    return (
      <section className="rounded-2xl border border-[#DCE6DF] p-4 text-[14px] text-[#4A6358]">
        <h3 className="m-0 mb-1 text-[15px] font-bold text-[#0B2E1F]">Roles</h3>
        This account isn&apos;t linked to a person yet (run the user import).
      </section>
    );
  }

  const notes = (data.mergeNotes ?? {}) as Record<string, any>;
  const merged = Array.isArray(notes.accounts) && notes.accounts.length > 1;
  const pendingApps = data.applications.filter((a) => a.status === "PENDING");

  return (
    <section className="rounded-2xl border border-[#DCE6DF] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="m-0 text-[15px] font-bold text-[#0B2E1F]">
          Roles <span className="font-normal text-[#4A6358]">· one person, {data.roles.length} role{data.roles.length === 1 ? "" : "s"}</span>
        </h3>
        {canManage && !adding && (data.addable?.length ?? 0) > 0 && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[#DCE6DF] px-3 text-[13px] font-bold text-[#0B2E1F] hover:border-[#00A43A] cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Add a role
          </button>
        )}
      </div>
      <p className="m-0 mt-1 text-[13px] text-[#4A6358]">
        {[data.person.name, data.person.email, data.person.phone].filter(Boolean).join(" · ")}
        {data.person.lastActiveRole ? ` · last used: ${data.roles.find((r) => r.role === data.person!.lastActiveRole)?.label ?? data.person.lastActiveRole}` : ""}
      </p>

      {adding && data.addable && (
        <div className="mt-3">
          <AddRoleForm
            userId={data.person.id}
            options={data.addable}
            onCancel={() => setAdding(false)}
            onDone={() => {
              setAdding(false);
              load();
            }}
          />
        </div>
      )}

      <ul className="m-0 mt-2 list-none divide-y divide-[#EEF3EF] p-0">
        {data.roles.map((r) => (
          <RoleRow
            key={r.role}
            r={r}
            userId={data.person!.id}
            canManage={canManage}
            openedByAdmin={!!notes[`actingAs_${r.role}`]}
            onChange={load}
          />
        ))}
      </ul>

      {pendingApps.length > 0 && (
        <p className="m-0 mt-2 rounded-xl bg-[#FFF4DD] p-2.5 text-[13px] text-[#9A6400]">
          Waiting for approval: {pendingApps.map((a) => a.targetLabel).join(", ")}. Review it in Invitations → Role requests.
        </p>
      )}

      {merged && (
        <div className="mt-3 rounded-xl bg-[#F6F9F7] p-3 text-[13px] text-[#4A6358]">
          <p className="m-0 font-bold text-[#0B2E1F]">Joined from {notes.accounts.length} accounts{notes.mergedAt ? ` on ${day(notes.mergedAt)}` : ""}</p>
          {notes.otherEmails?.length > 0 && <p className="m-0 mt-1">Other emails: {notes.otherEmails.join(", ")}</p>}
          {notes.otherPhones?.length > 0 && <p className="m-0 mt-1">Other phones: {notes.otherPhones.join(", ")}</p>}
          <p className="m-0 mt-1">Check that these accounts really are the same person.</p>
        </div>
      )}
    </section>
  );
}
