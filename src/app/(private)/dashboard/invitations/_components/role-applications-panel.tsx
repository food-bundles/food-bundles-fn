/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Loader2, Mail, Phone, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { useAdminAccess } from "@/app/hooks/useAdminAccess";
import { roleApplicationService, type RoleApplication, type RoleOption, type RoleRule } from "@/app/services/roleService";
import { adminRoleService, type AdminRole } from "@/app/services/adminRoleService";

const day = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";

const STATUS_TABS = [
  { key: "PENDING", label: "Waiting" },
  { key: "APPROVED", label: "Approved" },
  { key: "REJECTED", label: "Rejected" },
] as const;

const DETAIL_LABELS: Record<string, string> = {
  businessName: "Business name",
  tin: "TIN",
  mainProduce: "Produce",
  farmersEstimate: "Farmers they can reach",
  experience: "Experience",
  loanTermsAndConditions: "Loan terms",
  note: "Note",
};

const pill = (on: boolean) =>
  `min-h-10 rounded-full px-4 text-[14px] font-bold transition-colors cursor-pointer ${
    on ? "bg-[#0B2E1F] text-white" : "border border-[#DCE6DF] bg-white text-[#0B2E1F] hover:border-[#00A43A]"
  }`;

function RequestCard({ a, canReview, staffRoles, onDone }: { a: RoleApplication; canReview: boolean; staffRoles: AdminRole[]; onDone: () => void }) {
  const [busy, setBusy] = useState<"approve" | "reject" | null>(null);
  const [rejecting, setRejecting] = useState(false);
  const [note, setNote] = useState("");
  const [adminRoleId, setAdminRoleId] = useState("");
  const d = (a.details ?? {}) as Record<string, any>;
  const place = [d.village, d.cell, d.sector, d.district, d.province].filter(Boolean).join(", ");
  const otherRoles = a.user?.roles.filter((r) => r.role !== a.targetRole && r.status === "ACTIVE") ?? [];

  const run = async (kind: "approve" | "reject") => {
    setBusy(kind);
    try {
      const res =
        kind === "approve"
          ? await roleApplicationService.approve(a.id, { adminRoleId: adminRoleId || null })
          : await roleApplicationService.reject(a.id, note);
      toast.success(res.message);
      onDone();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || `Could not ${kind}`);
    } finally {
      setBusy(null);
    }
  };

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-[#DCE6DF] bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="m-0 text-[18px] font-bold text-[#0B2E1F]">
            {a.user?.name || a.user?.email || a.user?.phone} <span className="font-normal text-[#4A6358]">wants to be</span> {a.targetLabel}
          </h3>
          <p className="m-0 mt-0.5 text-[13px] text-[#4A6358]">
            Asked {day(a.createdAt)}
            {a.fromLabel ? ` from the ${a.fromLabel} dashboard` : ""}
            {a.reviewedAt ? ` · reviewed ${day(a.reviewedAt)}` : ""}
          </p>
        </div>
        {a.status === "APPROVED" && <span className="rounded-full bg-[#E3F3E8] px-3 py-1 text-[12px] font-bold text-[#007A35]">Role added</span>}
        {a.status === "REJECTED" && <span className="rounded-full bg-red-50 px-3 py-1 text-[12px] font-bold text-red-700">Rejected</span>}
      </div>

      <dl className="m-0 grid gap-x-6 gap-y-2.5 text-[14px] sm:grid-cols-2">
        {a.user?.phone && <div className="flex items-start gap-2"><Phone className="mt-0.5 h-4 w-4 shrink-0 text-[#00A43A]" /><dd className="m-0">{a.user.phone}</dd></div>}
        {a.user?.email && <div className="flex items-start gap-2"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#00A43A]" /><dd className="m-0 break-all">{a.user.email}</dd></div>}
        <div><dt className="text-[12px] font-bold uppercase tracking-[0.6px] text-[#4A6358]">Already</dt><dd className="m-0">{otherRoles.map((r) => r.label).join(", ") || "—"}</dd></div>
        {place && <div><dt className="text-[12px] font-bold uppercase tracking-[0.6px] text-[#4A6358]">Location</dt><dd className="m-0">{place}</dd></div>}
        {Object.entries(DETAIL_LABELS).map(([k, label]) =>
          d[k] ? (
            <div key={k} className={k === "experience" || k === "note" || k === "loanTermsAndConditions" ? "sm:col-span-2" : ""}>
              <dt className="text-[12px] font-bold uppercase tracking-[0.6px] text-[#4A6358]">{label}</dt>
              <dd className="m-0 whitespace-pre-line">{String(d[k])}</dd>
            </div>
          ) : null,
        )}
        {a.reviewNote && <div className="sm:col-span-2"><dt className="text-[12px] font-bold uppercase tracking-[0.6px] text-[#4A6358]">Review note</dt><dd className="m-0">{a.reviewNote}</dd></div>}
      </dl>

      {a.status === "PENDING" && canReview && (
        <div className="flex flex-col gap-3 border-t border-[#EEF3EF] pt-4">
          {a.targetRole === "STAFF" && (
            <label className="flex flex-col gap-1 text-[14px] font-bold text-[#0B2E1F]">
              Dashboard role they get
              <select
                value={adminRoleId}
                onChange={(e) => setAdminRoleId(e.target.value)}
                className="h-10 rounded-xl border border-[#DCE6DF] bg-white px-3 text-[14px] font-normal"
              >
                <option value="">Choose…</option>
                {staffRoles.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </label>
          )}
          {rejecting && (
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="Reason (optional; the person sees it)"
              className="w-full rounded-xl border border-[#DCE6DF] px-3 py-2 text-[14px] focus:border-[#00A43A] focus:outline-none"
            />
          )}
          <div className="flex flex-wrap gap-2">
            {!rejecting ? (
              <>
                <button
                  type="button"
                  onClick={() => run("approve")}
                  disabled={!!busy || (a.targetRole === "STAFF" && !adminRoleId)}
                  className="inline-flex h-10 items-center gap-1.5 rounded-full bg-[#0B2E1F] px-4 text-[14px] font-bold text-white hover:bg-[#0F5C36] disabled:opacity-60 cursor-pointer"
                >
                  {busy === "approve" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Approve
                </button>
                <button
                  type="button"
                  onClick={() => setRejecting(true)}
                  disabled={!!busy}
                  className="inline-flex h-10 items-center gap-1.5 rounded-full border border-[#DCE6DF] px-4 text-[14px] font-bold text-red-600 hover:bg-red-50 cursor-pointer"
                >
                  <X className="h-4 w-4" /> Reject
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => run("reject")}
                  disabled={!!busy}
                  className="inline-flex h-10 items-center gap-1.5 rounded-full bg-red-600 px-4 text-[14px] font-bold text-white hover:bg-red-700 disabled:opacity-60 cursor-pointer"
                >
                  {busy === "reject" && <Loader2 className="h-4 w-4 animate-spin" />} Confirm rejection
                </button>
                <button type="button" onClick={() => setRejecting(false)} className="h-10 rounded-full px-4 text-[14px] font-bold text-[#4A6358] cursor-pointer">
                  Cancel
                </button>
              </>
            )}
          </div>
          <p className="m-0 text-[12px] text-[#4A6358]">Approving adds the role to their account right away. They keep their password and switch to it from their account menu.</p>
        </div>
      )}
    </article>
  );
}

/** Signed-in people asking for another role ("Apply to be …") */
export function RoleRequestsPanel({ onChanged }: { onChanged?: () => void }) {
  const { can } = useAdminAccess();
  const canReview = can("role_applications", "review");
  const [tab, setTab] = useState<(typeof STATUS_TABS)[number]["key"]>("PENDING");
  const [rows, setRows] = useState<RoleApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [staffRoles, setStaffRoles] = useState<AdminRole[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRows(await roleApplicationService.list(tab));
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Could not load requests");
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    load();
  }, [load]);

  // Staff requests need a custom dashboard role (system roles map to their own account role)
  useEffect(() => {
    if (!rows.some((r) => r.targetRole === "STAFF" && r.status === "PENDING")) return;
    adminRoleService.getRoles().then((r) => r.success && setStaffRoles(r.data.filter((x) => !x.isSystem)));
  }, [rows]);

  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-2xl border border-[#DCE6DF] bg-white p-5">
        <h2 className="m-0 text-[20px] font-bold text-[#0B2E1F] [font-family:var(--font-inter-tight),sans-serif]">Requests for another role</h2>
        <p className="m-0 mt-1 text-[14px] text-[#4A6358]">
          People who already have an account and asked to also be a customer, farmer, aggregator… from their dashboard.
        </p>
      </section>
      <div className="flex flex-wrap gap-1.5" role="tablist">
        {STATUS_TABS.map((t) => (
          <button key={t.key} type="button" role="tab" aria-selected={t.key === tab} onClick={() => setTab(t.key)} className={pill(t.key === tab)}>
            {t.label}
          </button>
        ))}
      </div>
      {loading ? (
        <div className="flex h-40 items-center justify-center gap-2 text-[#4A6358]">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading…
        </div>
      ) : rows.length === 0 ? (
        <p className="m-0 rounded-2xl border border-dashed border-[#C5D1C6] bg-white p-10 text-center text-[15px] text-[#4A6358]">
          {tab === "PENDING" ? "No requests waiting." : "Nothing here yet."}
        </p>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {rows.map((a) => (
            <RequestCard
              key={a.id}
              a={a}
              canReview={canReview}
              staffRoles={staffRoles}
              onDone={() => {
                load();
                onChanged?.();
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/** Super admin: which roles people can apply for, from each dashboard */
export function RoleRulesPanel() {
  const [rules, setRules] = useState<RoleRule[]>([]);
  const [dashboards, setDashboards] = useState<RoleOption[]>([]);
  const [applicable, setApplicable] = useState<RoleOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [draft, setDraft] = useState({ fromRole: "", targetRole: "", requiresApproval: true });

  const load = useCallback(async () => {
    try {
      const data = await roleApplicationService.getRules();
      setRules(data.rules);
      setDashboards(data.dashboards);
      setApplicable(data.applicable);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Could not load the rules");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const labelOf = useMemo(() => {
    const map = new Map([...dashboards, ...applicable].map((r) => [r.role, r.label]));
    return (role: string) => map.get(role) ?? role;
  }, [dashboards, applicable]);

  const save = async (rule: Omit<RoleRule, "id">, key: string) => {
    setBusy(key);
    try {
      await roleApplicationService.saveRule(rule);
      await load();
      return true;
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Could not save");
      return false;
    } finally {
      setBusy(null);
    }
  };

  const remove = async (id: string) => {
    setBusy(id);
    try {
      await roleApplicationService.deleteRule(id);
      await load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Could not remove");
    } finally {
      setBusy(null);
    }
  };

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.fromRole || !draft.targetRole) return;
    if (await save({ ...draft, enabled: true }, "new")) {
      toast.success(`${labelOf(draft.fromRole)} dashboard: "Apply to be ${labelOf(draft.targetRole)}" added`);
      setDraft((d) => ({ ...d, targetRole: "" }));
    }
  };

  const grouped = dashboards
    .map((d) => ({ ...d, rules: rules.filter((r) => r.fromRole === d.role) }))
    .filter((d) => d.rules.length > 0);
  const select = "h-10 rounded-xl border border-[#DCE6DF] bg-white px-3 text-[14px]";

  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-2xl border border-[#DCE6DF] bg-white p-5">
        <h2 className="m-0 text-[20px] font-bold text-[#0B2E1F] [font-family:var(--font-inter-tight),sans-serif]">Who can apply for which role</h2>
        <p className="m-0 mt-1 text-[14px] text-[#4A6358]">
          People see &quot;Apply to be …&quot; in their account menu for the roles you add to the dashboard they&apos;re using.
          Without approval, the role is added as soon as they apply.
        </p>
        <form onSubmit={add} className="mt-4 flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-[13px] font-bold text-[#0B2E1F]">
            In the dashboard of
            <select className={select} value={draft.fromRole} onChange={(e) => setDraft({ ...draft, fromRole: e.target.value })} required>
              <option value="">Choose…</option>
              {dashboards.map((d) => <option key={d.role} value={d.role}>{d.label}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-[13px] font-bold text-[#0B2E1F]">
            they can apply to be
            <select className={select} value={draft.targetRole} onChange={(e) => setDraft({ ...draft, targetRole: e.target.value })} required>
              <option value="">Choose…</option>
              {applicable.filter((r) => r.role !== draft.fromRole).map((r) => <option key={r.role} value={r.role}>{r.label}</option>)}
            </select>
          </label>
          <label className="flex min-h-10 cursor-pointer items-center gap-2 text-[14px] text-[#0B2E1F]">
            <input
              type="checkbox"
              checked={draft.requiresApproval}
              onChange={(e) => setDraft({ ...draft, requiresApproval: e.target.checked })}
              className="h-4 w-4 accent-[#00A43A]"
            />
            Needs approval
          </label>
          <button
            type="submit"
            disabled={busy === "new"}
            className="inline-flex h-10 items-center gap-1.5 rounded-full bg-[#0B2E1F] px-4 text-[14px] font-bold text-white hover:bg-[#0F5C36] disabled:opacity-60 cursor-pointer"
          >
            {busy === "new" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Add
          </button>
        </form>
      </section>

      {loading ? (
        <div className="flex h-32 items-center justify-center gap-2 text-[#4A6358]">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading…
        </div>
      ) : grouped.length === 0 ? (
        <p className="m-0 rounded-2xl border border-dashed border-[#C5D1C6] bg-white p-10 text-center text-[15px] text-[#4A6358]">
          No one can apply for another role yet. Add the first rule above.
        </p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {grouped.map((g) => (
            <section key={g.role} className="rounded-2xl border border-[#DCE6DF] bg-white p-5">
              <h3 className="m-0 text-[16px] font-bold text-[#0B2E1F]">{g.label} dashboard</h3>
              <ul className="m-0 mt-3 flex list-none flex-col divide-y divide-[#EEF3EF] p-0">
                {g.rules.map((r) => (
                  <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-2.5">
                    <span className={`text-[15px] font-bold ${r.enabled ? "text-[#0B2E1F]" : "text-[#9AA9A0] line-through"}`}>
                      Apply to be {labelOf(r.targetRole)}
                    </span>
                    <span className="flex flex-wrap items-center gap-3 text-[13px] text-[#4A6358]">
                      <label className="flex cursor-pointer items-center gap-1.5">
                        <input
                          type="checkbox"
                          checked={r.requiresApproval}
                          disabled={busy === r.id}
                          onChange={(e) => save({ ...r, requiresApproval: e.target.checked }, r.id)}
                          className="h-4 w-4 accent-[#00A43A]"
                        />
                        Needs approval
                      </label>
                      <label className="flex cursor-pointer items-center gap-1.5">
                        <input
                          type="checkbox"
                          checked={r.enabled}
                          disabled={busy === r.id}
                          onChange={(e) => save({ ...r, enabled: e.target.checked }, r.id)}
                          className="h-4 w-4 accent-[#00A43A]"
                        />
                        Shown
                      </label>
                      <button
                        type="button"
                        onClick={() => remove(r.id)}
                        disabled={busy === r.id}
                        aria-label={`Remove Apply to be ${labelOf(r.targetRole)}`}
                        className="flex h-9 w-9 items-center justify-center rounded-full text-red-600 hover:bg-red-50 cursor-pointer"
                      >
                        {busy === r.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
