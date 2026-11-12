/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { LocationFields, type LocationValue } from "@/components/location-fields";
import { aggregatorApplicationService } from "@/app/services/aggregatorApplicationService";
import { AggregatorAgreement, AGREEMENT_CONSENT } from "../_components/aggregator-agreement";

const input =
  "h-12 w-full rounded-xl border border-[#DCE6DF] bg-white px-4 text-[16px] text-[#0B2E1F] placeholder:text-[#7A8E83] focus:border-[#00A43A] focus:outline-none focus:ring-2 focus:ring-[#00A43A]/25";

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

const STEPS = ["Amasezerano", "Imyirondoro", "Byoherejwe"];

// The application is saved on this device as it is filled, so a refresh or a
// lost connection never loses what was typed. Cleared once it is sent.
const DRAFT_KEY = "fb-aggregator-application";
const EMPTY_FORM = {
  fullName: "", phone: "", email: "", nationalId: "", mainProduce: "",
  farmersEstimate: "", momoNumber: "", experience: "",
};
const EMPTY_PLACE: LocationValue = { province: "", district: "", sector: "", cell: "", village: "" };

type Draft = { step: number; agreed: boolean; form: typeof EMPTY_FORM; place: LocationValue; submitted?: boolean };

const readDraft = (): Draft | null => {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as Draft) : null;
  } catch {
    return null;
  }
};
const writeDraft = (draft: Draft | null) => {
  try {
    if (draft) localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    else localStorage.removeItem(DRAFT_KEY);
  } catch {
    // storage blocked: the form still works, it just is not kept
  }
};

// Apply to become a Food Bundles aggregator: read and accept the preliminary
// agreement, then send the details an admin needs to approve the application.
export default function ApplyAggregatorPage() {
  const [step, setStep] = useState(0);
  const [agreed, setAgreed] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [place, setPlace] = useState<LocationValue>(EMPTY_PLACE);
  const [restored, setRestored] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);

  // Put back what was filled before a refresh
  useEffect(() => {
    const draft = readDraft();
    if (draft) {
      setForm({ ...EMPTY_FORM, ...draft.form });
      setPlace({ ...EMPTY_PLACE, ...draft.place });
      setAgreed(!!draft.agreed);
      setStep(draft.submitted ? 2 : Math.min(draft.step ?? 0, 1));
      setHasDraft(!draft.submitted);
    }
    setRestored(true);
  }, []);

  // Save every change (not before the saved draft was read back)
  useEffect(() => {
    if (!restored || step === 2) return;
    const empty = !agreed && Object.values(form).every((v) => !v) && !place.province;
    writeDraft(empty ? null : { step, agreed, form, place });
    setHasDraft(!empty);
  }, [restored, step, agreed, form, place]);

  const startOver = () => {
    writeDraft(null);
    setForm(EMPTY_FORM);
    setPlace(EMPTY_PLACE);
    setAgreed(false);
    setStep(0);
    setHasDraft(false);
  };
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!place.district || !place.sector) {
      setError("Hitamo Akarere n'Umurenge (choose your district and sector).");
      return;
    }
    setSending(true);
    try {
      await aggregatorApplicationService.submit({
        ...form,
        farmersEstimate: form.farmersEstimate ? Number(form.farmersEstimate) : undefined,
        ...place,
        agreed: true,
      });
      // Keep only the fact it was sent: a refresh shows the confirmation, not an empty form
      writeDraft({ step: 2, agreed: true, form: EMPTY_FORM, place: EMPTY_PLACE, submitted: true });
      setStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      setError(err?.response?.data?.message || "Ntibyakunze. Ongera ugerageze. (Could not send, please try again.)");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-[860px] flex-col gap-6 px-4 py-10 sm:px-8">
      <header className="flex flex-col gap-2">
        <span className="text-[13px] font-bold uppercase tracking-[1.2px] text-[#00A43A]">Food Bundles · Umukusanyi</span>
        <h1 className="m-0 text-[clamp(28px,4vw,40px)] font-bold leading-tight tracking-[-1px] text-[#0B2E1F] [font-family:var(--font-inter-tight),sans-serif]">
          Ba umukusanyi w&apos;umusaruro wa Food Bundles
        </h1>
        <p className="m-0 text-[16px] text-[#4A6358]">Become a Food Bundles aggregator: collect produce from farmers near you and earn 4% to 7% commission.</p>
        {hasDraft && step < 2 && (
          <p className="m-0 flex flex-wrap items-center gap-x-3 text-[13px] text-[#4A6358]">
            <span>✓ Ibyo wujuje bibitswe kuri iyi telefoni (your progress is saved on this phone).</span>
            <button type="button" onClick={startOver} className="font-bold text-[#007A35] underline underline-offset-2 hover:text-[#0B2E1F] cursor-pointer">
              Tangira bundi bushya (start over)
            </button>
          </p>
        )}
        <ol className="m-0 mt-2 flex list-none gap-2 p-0" aria-label="Steps">
          {STEPS.map((s, i) => (
            <li
              key={s}
              aria-current={i === step ? "step" : undefined}
              className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-[13px] font-bold ${
                i === step ? "bg-[#0B2E1F] text-white" : i < step ? "bg-[#E3F3E8] text-[#007A35]" : "bg-[#F6F9F7] text-[#4A6358]"
              }`}
            >
              <span>{i + 1}</span> {s}
            </li>
          ))}
        </ol>
      </header>

      {step === 0 && (
        <section className="flex flex-col gap-5 rounded-2xl border border-[#DCE6DF] bg-white p-5 sm:p-8">
          <p className="m-0 rounded-xl bg-[#F6F9F7] p-3 text-[14px] text-[#4A6358]">
            Soma izi ngingo mbere yo gutanga imeyili yawe. <i>(Read these terms before giving your email.)</i>
          </p>
          <div className="max-h-[55vh] overflow-y-auto pr-2">
            <AggregatorAgreement />
          </div>
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#BFE6CB] bg-[#EFFAF3] p-4">
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1 h-5 w-5 accent-[#00A43A]" />
            <span className="text-[15px] font-bold text-[#0B2E1F]">{AGREEMENT_CONSENT}</span>
          </label>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link href="/login?for=aggregator" className="text-[15px] font-bold text-[#007A35] hover:text-[#0B2E1F]">
              Usanzwe ufite konti? Injira (Log in)
            </Link>
            <button
              type="button"
              disabled={!agreed}
              onClick={() => {
                setStep(1);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="inline-flex h-12 items-center gap-2 rounded-full bg-[#0B2E1F] px-6 text-[16px] font-bold text-white hover:bg-[#0F5C36] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
            >
              Komeza (Continue) <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      )}

      {step === 1 && (
        <form onSubmit={submit} className="flex flex-col gap-6 rounded-2xl border border-[#DCE6DF] bg-white p-5 sm:p-8">
          <fieldset className="m-0 grid gap-4 border-0 p-0 sm:grid-cols-2">
            <legend className="mb-3 text-[18px] font-bold text-[#0B2E1F]">Umwirondoro wawe (About you)</legend>
            <Field label="Amazina yombi" hint="Full name" required>
              <input className={input} value={form.fullName} onChange={set("fullName")} required autoComplete="name" />
            </Field>
            <Field label="Telefoni" hint="Phone number (07…)" required>
              <input className={input} value={form.phone} onChange={set("phone")} required type="tel" inputMode="tel" autoComplete="tel" placeholder="07…" />
            </Field>
            <Field label="Imeyili" hint="Email: your account invitation is sent here" required>
              <input className={input} value={form.email} onChange={set("email")} required type="email" autoComplete="email" />
            </Field>
            <Field label="Nimero y'indangamuntu" hint="National ID number (optional)">
              <input className={input} value={form.nationalId} onChange={set("nationalId")} inputMode="numeric" />
            </Field>
            <Field label="Nimero ya Mobile Money" hint="To receive your commission (if different from your phone)">
              <input className={input} value={form.momoNumber} onChange={set("momoNumber")} type="tel" inputMode="tel" placeholder="07…" />
            </Field>
          </fieldset>

          <fieldset className="m-0 flex flex-col gap-4 border-0 p-0">
            <legend className="mb-3 text-[18px] font-bold text-[#0B2E1F]">Aho ukorera (Where you work)</legend>
            <p className="m-0 -mt-2 text-[13px] text-[#4A6358]">Intara, Akarere, Umurenge, Akagari n&apos;Umudugudu. District and sector are required.</p>
            <LocationFields value={place} onChange={setPlace} disabled={sending} />
          </fieldset>

          <fieldset className="m-0 grid gap-4 border-0 p-0 sm:grid-cols-2">
            <legend className="mb-3 text-[18px] font-bold text-[#0B2E1F]">Umusaruro n&apos;abahinzi (Produce and farmers)</legend>
            <Field label="Umusaruro wera cyane mu gace kawe" hint="Main produce around you">
              <input className={input} value={form.mainProduce} onChange={set("mainProduce")} placeholder="e.g. potatoes, beans, maize" />
            </Field>
            <Field label="Abahinzi ushobora gukorana na bo" hint="About how many farmers you can work with">
              <input className={input} value={form.farmersEstimate} onChange={set("farmersEstimate")} type="number" min={1} inputMode="numeric" />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Uburambe" hint="Experience with farmers, collecting or trading produce (optional)">
                <textarea
                  value={form.experience}
                  onChange={set("experience")}
                  rows={3}
                  className="w-full rounded-xl border border-[#DCE6DF] bg-white px-4 py-3 text-[16px] text-[#0B2E1F] focus:border-[#00A43A] focus:outline-none focus:ring-2 focus:ring-[#00A43A]/25"
                />
              </Field>
            </div>
          </fieldset>

          {error && <p className="m-0 rounded-xl bg-red-50 p-3 text-[14px] text-red-700">{error}</p>}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setStep(0)}
              className="inline-flex h-12 items-center gap-2 rounded-full border border-[#C5D1C6] px-5 text-[15px] font-bold text-[#0B2E1F] hover:bg-[#F6F9F7] cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" /> Amasezerano
            </button>
            <button
              type="submit"
              disabled={sending}
              className="inline-flex h-12 items-center gap-2 rounded-full bg-[#0B2E1F] px-6 text-[16px] font-bold text-white hover:bg-[#0F5C36] disabled:opacity-60 cursor-pointer"
            >
              {sending && <Loader2 className="h-4 w-4 animate-spin" />} Ohereza ubusabe (Send application)
            </button>
          </div>
        </form>
      )}

      {step === 2 && (
        <section className="flex flex-col items-center gap-3 rounded-2xl border border-[#DCE6DF] bg-white p-8 text-center">
          <CheckCircle2 className="h-12 w-12 text-[#00A43A]" />
          <h2 className="m-0 text-[24px] font-bold text-[#0B2E1F]">Ubusabe bwawe bwakiriwe</h2>
          <p className="m-0 max-w-md text-[16px] text-[#4A6358]">
            Your application was received. Food Bundles will contact you. Once approved, you get an email to create your account,
            then training and onboarding.
          </p>
          <Link href="/" className="mt-2 inline-flex h-12 items-center rounded-full bg-[#0B2E1F] px-6 text-[16px] font-bold text-white hover:bg-[#0F5C36]">
            Subira ahabanza (Home)
          </Link>
          <button type="button" onClick={startOver} className="text-[14px] font-bold text-[#007A35] underline underline-offset-2 hover:text-[#0B2E1F] cursor-pointer">
            Ohereza ubundi busabe (send another application)
          </button>
        </section>
      )}
    </div>
  );
}
