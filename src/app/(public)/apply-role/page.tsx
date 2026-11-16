/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeftRight, CheckCircle2, Hourglass, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/app/contexts/auth-context";
import { LocationFields, type LocationValue } from "@/components/location-fields";
import { roleApplicationService, roleService, type RoleApplication, type RoleOption } from "@/app/services/roleService";
import { customerTypeService, type CustomerType } from "@/app/services/customerTypeService";
import { openSession } from "@/components/role-switcher";
import { buildLoginUrl } from "@/lib/navigations";

const input =
  "h-12 w-full rounded-xl border border-[#DCE6DF] bg-white px-4 text-[16px] text-[#0B2E1F] placeholder:text-[#7A8E83] focus:border-[#00A43A] focus:outline-none focus:ring-2 focus:ring-[#00A43A]/25";
const area =
  "w-full rounded-xl border border-[#DCE6DF] bg-white px-4 py-3 text-[16px] text-[#0B2E1F] focus:border-[#00A43A] focus:outline-none focus:ring-2 focus:ring-[#00A43A]/25";

function Field({ label, hint, required, children }: { label: string; hint?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[15px] font-bold text-[#0B2E1F]">
        {label} {required && <span className="text-red-600">*</span>}
      </span>
      {hint && <span className="-mt-1 text-[13px] text-[#4A6358]">{hint}</span>}
      {children}
    </label>
  );
}

const EMPTY_PLACE: LocationValue = { province: "", district: "", sector: "", cell: "", village: "" };

/** What each role is for, shown above its form */
const ABOUT: Record<string, string> = {
  RESTAURANT: "Order produce for your restaurant, hotel, school or shop, at prices for your type of business.",
  FARMER: "Sell your harvest to Food Bundles and get paid by Mobile Money.",
  AGGREGATOR: "Collect produce from farmers near you and earn a commission.",
  LOGISTICS: "Deliver orders to Food Bundles customers.",
  TRADER: "Lend to Food Bundles customers through vouchers.",
};

const STATUS_TEXT: Record<RoleApplication["status"], string> = {
  PENDING: "Waiting for approval",
  APPROVED: "Approved",
  REJECTED: "Not approved",
  CANCELLED: "Cancelled",
};

function ApplyRole() {
  const router = useRouter();
  const params = useSearchParams();
  const { isAuthenticated, isLoading } = useAuth();
  const [loaded, setLoaded] = useState(false);
  const [options, setOptions] = useState<RoleOption[]>([]);
  const [applications, setApplications] = useState<RoleApplication[]>([]);
  const [role, setRole] = useState(params.get("role") ?? "");
  const [form, setForm] = useState({ businessName: "", tin: "", customerTypeId: "", mainProduce: "", farmersEstimate: "", experience: "", loanTermsAndConditions: "", note: "" });
  const [place, setPlace] = useState<LocationValue>(EMPTY_PLACE);
  const [agreed, setAgreed] = useState(false);
  const [types, setTypes] = useState<CustomerType[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<null | { status: "ACTIVE" | "PENDING"; label: string; role: string }>(null);
  const [switching, setSwitching] = useState(false);

  // Signed-in people only: send others to log in, then back here
  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace(buildLoginUrl());
  }, [isLoading, isAuthenticated, router]);

  const load = () =>
    roleApplicationService
      .getOptions()
      .then((o) => {
        setOptions(o.apply);
        setApplications(o.applications);
        setRole((r) => (r && o.apply.some((x) => x.role === r) ? r : o.apply[0]?.role ?? ""));
      })
      .catch(() => setOptions([]))
      .finally(() => setLoaded(true));

  useEffect(() => {
    if (isAuthenticated) load();
  }, [isAuthenticated]);

  useEffect(() => {
    if (role !== "RESTAURANT" || types.length) return;
    customerTypeService
      .getAllCustomerTypes()
      .then((res) => {
        const list: CustomerType[] = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setTypes(list.filter((t) => t.isActive));
      })
      .catch(() => setTypes([]));
  }, [role, types.length]);

  const chosen = useMemo(() => options.find((o) => o.role === role), [options, role]);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chosen) return;
    setError("");
    const needsPlace = role === "FARMER" || role === "AGGREGATOR";
    if (needsPlace && (!place.province || !place.district || !place.sector)) {
      setError("Choose your province, district and sector.");
      return;
    }
    setSending(true);
    try {
      const details: Record<string, unknown> = { note: form.note, ...place };
      if (role === "RESTAURANT") Object.assign(details, { businessName: form.businessName, tin: form.tin, customerTypeId: form.customerTypeId || null, agreed });
      if (role === "FARMER" || role === "AGGREGATOR") details.mainProduce = form.mainProduce;
      if (role === "AGGREGATOR") Object.assign(details, { farmersEstimate: form.farmersEstimate ? Number(form.farmersEstimate) : null, experience: form.experience });
      if (role === "TRADER") details.loanTermsAndConditions = form.loanTermsAndConditions;
      const res = await roleApplicationService.apply(role, details);
      setDone({ status: res.data.status, label: chosen.label, role });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      setError(err?.response?.data?.message || "Could not send your request. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const switchNow = async (target: string) => {
    setSwitching(true);
    try {
      const res = await roleService.switchRole(target);
      openSession(res.token, res.data.user, res.data.activeRole);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Could not switch role");
      setSwitching(false);
    }
  };

  const cancel = async (id: string) => {
    try {
      await roleApplicationService.cancel(id);
      toast.success("Request cancelled");
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Could not cancel");
    }
  };

  if (isLoading || !isAuthenticated || !loaded) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#00A43A]" aria-label="Loading" />
      </div>
    );
  }

  const pending = applications.filter((a) => a.status === "PENDING");
  const history = applications.filter((a) => a.status !== "PENDING").slice(0, 5);

  return (
    <div className="mx-auto flex max-w-[860px] flex-col gap-6 px-4 py-10 sm:px-8">
      <header className="flex flex-col gap-2">
        <span className="text-[13px] font-bold uppercase tracking-[1.2px] text-[#00A43A]">Your Food Bundles account</span>
        <h1 className="m-0 text-[clamp(28px,4vw,40px)] font-bold leading-tight tracking-[-1px] text-[#0B2E1F] [font-family:var(--font-inter-tight),sans-serif]">
          Add a role to your account
        </h1>
        <p className="m-0 text-[16px] text-[#4A6358]">
          One account, one password: once you have the role, switch to it from your account menu.
        </p>
      </header>

      {pending.length > 0 && (
        <section className="flex flex-col gap-2 rounded-2xl border border-[#F2D9A6] bg-[#FFF8EA] p-4">
          {pending.map((a) => (
            <div key={a.id} className="flex flex-wrap items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-[15px] font-bold text-[#0B2E1F]">
                <Hourglass className="h-4 w-4 text-[#B7791F]" /> {a.targetLabel}: waiting for approval
              </span>
              <button type="button" onClick={() => cancel(a.id)} className="text-[14px] font-bold text-[#007A35] underline underline-offset-2 hover:text-[#0B2E1F] cursor-pointer">
                Cancel request
              </button>
            </div>
          ))}
        </section>
      )}

      {done ? (
        <section className="flex flex-col items-center gap-3 rounded-2xl border border-[#DCE6DF] bg-white p-8 text-center">
          <CheckCircle2 className="h-12 w-12 text-[#00A43A]" />
          <h2 className="m-0 text-[24px] font-bold text-[#0B2E1F]">
            {done.status === "ACTIVE" ? `You're now also a ${done.label}` : "Request sent"}
          </h2>
          <p className="m-0 max-w-md text-[16px] text-[#4A6358]">
            {done.status === "ACTIVE"
              ? "The role was added to your account. You can switch to it now, or later from your account menu."
              : `Food Bundles will review your ${done.label} request. Once approved, switch to it from your account menu.`}
          </p>
          {done.status === "ACTIVE" ? (
            <button
              type="button"
              onClick={() => switchNow(done.role)}
              disabled={switching}
              className="mt-2 inline-flex h-12 items-center gap-2 rounded-full bg-[#0B2E1F] px-6 text-[16px] font-bold text-white hover:bg-[#0F5C36] disabled:opacity-60 cursor-pointer"
            >
              {switching ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowLeftRight className="h-4 w-4" />} Switch to {done.label}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => router.back()}
              className="mt-2 inline-flex h-12 items-center rounded-full bg-[#0B2E1F] px-6 text-[16px] font-bold text-white hover:bg-[#0F5C36] cursor-pointer"
            >
              Back
            </button>
          )}
        </section>
      ) : options.length === 0 ? (
        <section className="rounded-2xl border border-[#DCE6DF] bg-white p-8 text-center">
          <p className="m-0 text-[16px] text-[#4A6358]">
            There are no roles to apply for from the account you&apos;re using right now. Contact Food Bundles if you need another role.
          </p>
          <Link href="/" className="mt-4 inline-flex h-12 items-center rounded-full bg-[#0B2E1F] px-6 text-[16px] font-bold text-white hover:bg-[#0F5C36]">
            Home
          </Link>
        </section>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-6 rounded-2xl border border-[#DCE6DF] bg-white p-5 sm:p-8">
          <fieldset className="m-0 flex flex-col gap-3 border-0 p-0">
            <legend className="mb-3 text-[18px] font-bold text-[#0B2E1F]">I want to be</legend>
            <div className="flex flex-wrap gap-2" role="radiogroup">
              {options.map((o) => {
                const on = o.role === role;
                return (
                  <button
                    key={o.role}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => {
                      setRole(o.role);
                      setError("");
                    }}
                    className={`min-h-11 rounded-full px-5 text-[15px] font-bold transition-colors cursor-pointer ${
                      on ? "bg-[#0B2E1F] text-white" : "border border-[#DCE6DF] bg-white text-[#0B2E1F] hover:border-[#00A43A]"
                    }`}
                  >
                    {o.label}
                  </button>
                );
              })}
            </div>
            {chosen && (
              <p className="m-0 text-[14px] text-[#4A6358]">
                {ABOUT[chosen.role] ? `${ABOUT[chosen.role]} ` : ""}
                {chosen.requiresApproval ? "Food Bundles approves new roles before you can use them." : "You can use it right away."}
              </p>
            )}
          </fieldset>

          {role === "RESTAURANT" && (
            <fieldset className="m-0 grid gap-4 border-0 p-0 sm:grid-cols-2">
              <legend className="mb-3 text-[18px] font-bold text-[#0B2E1F]">Your business</legend>
              <Field label="Business name" required>
                <input className={input} value={form.businessName} onChange={set("businessName")} required autoComplete="organization" />
              </Field>
              <Field label="TIN" hint="9 digits" required>
                <input className={input} value={form.tin} onChange={set("tin")} required inputMode="numeric" maxLength={9} />
              </Field>
              {types.length > 0 && (
                <Field label="Type of business">
                  <select className={input} value={form.customerTypeId} onChange={set("customerTypeId")}>
                    <option value="">Choose…</option>
                    {types.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </Field>
              )}
            </fieldset>
          )}

          {(role === "RESTAURANT" || role === "FARMER" || role === "AGGREGATOR") && (
            <fieldset className="m-0 flex flex-col gap-4 border-0 p-0">
              <legend className="mb-3 text-[18px] font-bold text-[#0B2E1F]">
                {role === "RESTAURANT" ? "Where you are (optional)" : role === "FARMER" ? "Where you farm" : "Where you work"}
              </legend>
              <LocationFields value={place} onChange={setPlace} disabled={sending} />
            </fieldset>
          )}

          {(role === "FARMER" || role === "AGGREGATOR") && (
            <fieldset className="m-0 grid gap-4 border-0 p-0 sm:grid-cols-2">
              <legend className="mb-3 text-[18px] font-bold text-[#0B2E1F]">Produce</legend>
              <Field label={role === "FARMER" ? "What you grow" : "Main produce around you"}>
                <input className={input} value={form.mainProduce} onChange={set("mainProduce")} placeholder="e.g. potatoes, beans, maize" />
              </Field>
              {role === "AGGREGATOR" && (
                <>
                  <Field label="Farmers you can work with" hint="About how many">
                    <input className={input} value={form.farmersEstimate} onChange={set("farmersEstimate")} type="number" min={1} inputMode="numeric" />
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label="Experience" hint="With farmers, collecting or trading produce (optional)">
                      <textarea className={area} rows={3} value={form.experience} onChange={set("experience")} />
                    </Field>
                  </div>
                </>
              )}
            </fieldset>
          )}

          {role === "TRADER" && (
            <Field label="Loan terms and conditions" hint="What customers accept when they ask you for a loan (you can change them later)">
              <textarea className={area} rows={5} value={form.loanTermsAndConditions} onChange={set("loanTermsAndConditions")} />
            </Field>
          )}

          <Field label="Anything we should know?" hint="Optional">
            <textarea className={area} rows={3} value={form.note} onChange={set("note")} />
          </Field>

          {role === "RESTAURANT" && (
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#BFE6CB] bg-[#EFFAF3] p-4">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1 h-5 w-5 accent-[#00A43A]" required />
              <span className="text-[15px] text-[#0B2E1F]">
                I accept the{" "}
                <Link href="/terms" target="_blank" className="font-bold text-[#007A35] underline underline-offset-2">
                  Terms and Conditions
                </Link>
              </span>
            </label>
          )}

          {error && <p className="m-0 rounded-xl bg-red-50 p-3 text-[14px] text-red-700">{error}</p>}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={sending || !chosen}
              className="inline-flex h-12 items-center gap-2 rounded-full bg-[#0B2E1F] px-6 text-[16px] font-bold text-white hover:bg-[#0F5C36] disabled:opacity-60 cursor-pointer"
            >
              {sending && <Loader2 className="h-4 w-4 animate-spin" />}
              {chosen?.requiresApproval === false ? `Add ${chosen.label} role` : "Send request"}
            </button>
          </div>
        </form>
      )}

      {history.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="m-0 text-[15px] font-bold text-[#0B2E1F]">Earlier requests</h2>
          <ul className="m-0 flex list-none flex-col gap-1 p-0 text-[14px] text-[#4A6358]">
            {history.map((a) => (
              <li key={a.id}>
                {a.targetLabel}: {STATUS_TEXT[a.status]}
                {a.reviewNote ? ` (${a.reviewNote})` : ""} · {new Date(a.createdAt).toLocaleDateString()}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

// "Apply to be …": a signed-in person asks for another role, from the roles a
// super admin made available for the dashboard they're using
export default function ApplyRolePage() {
  return (
    <Suspense fallback={null}>
      <ApplyRole />
    </Suspense>
  );
}
