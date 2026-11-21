"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Clock, Copy, Info, Loader2, Lock, MapPin, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { voucherService, type CardApplicationDraft } from "@/app/services/voucherService";
import { EMPTY_LOCATION, RwLocation, RwLocationFields } from "@/components/rw-location-fields";

/**
 * Voucher card application, in 2 steps:
 * 1. Business & owner: RDB certificate, business and owner details, a code to
 *    the owner's phone (a manager asks the owner for it), type and location.
 * 2. Credit check: MoMo number, the 3-month statement sent by USSD, consent.
 * Then "Application received".
 */

const BUSINESS_TYPES: [string, string][] = [
  ["RESTAURANT", "Restaurant"],
  ["HOTEL", "Hotel"],
  ["BAR", "Bar"],
  ["CAFE", "Café"],
  ["CATERER", "Caterer"],
  ["SCHOOL", "School"],
  ["OTHER", "Other"],
];

const apiMessage = (err: unknown, fallback: string) =>
  (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? fallback;

const inputCls =
  "h-12 w-full min-w-0 rounded-[10px] border border-[#C9D1CC] bg-white px-3.5 text-[15px] text-[#1C2321] focus:border-[#2E7D32] focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/30";

function Why({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2.5 rounded-[10px] bg-[#F3F7F4] px-3 py-2.5 text-[12.5px] leading-snug text-[#3E4943]">
      <Info className="mt-px h-4 w-4 shrink-0 text-[#2E7D32]" aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}

function Field({ id, label, hint, children }: { id: string; label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[12.5px] text-[#5B6660]">
        {label}
      </label>
      {children}
      {hint && <span className="text-[11.5px] text-[#6B7570]">{hint}</span>}
    </div>
  );
}

export default function CardApplicationWizard({ onClose, onSubmitted }: { onClose: () => void; onSubmitted: () => void }) {
  const [step, setStep] = useState<1 | 2 | "done">(1);
  const [draft, setDraft] = useState<CardApplicationDraft | null>(null);

  // Step 1
  const [rdbFile, setRdbFile] = useState<File | null>(null);
  const [businessName, setBusinessName] = useState("");
  const [tin, setTin] = useState("");
  const [registeredSince, setRegisteredSince] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [code, setCode] = useState("");
  const [codeSentTo, setCodeSentTo] = useState<string | null>(null);
  const [sendingCode, setSendingCode] = useState(false);
  const [businessType, setBusinessType] = useState("");
  const [pin, setPin] = useState<{ lat: number; lng: number } | null>(null);
  const [showPlace, setShowPlace] = useState(false);
  const [location, setLocation] = useState<RwLocation>(EMPTY_LOCATION);

  // Step 2
  const [momoPhone, setMomoPhone] = useState("");
  const [momoName, setMomoName] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    voucherService
      .getCardApplicationDraft()
      .then((res) => {
        const d = res.data;
        setDraft(d);
        setBusinessName(d.businessName);
        setTin(d.tin);
        setRegisteredSince(d.registeredSince ? d.registeredSince.slice(0, 10) : "");
        setOwnerName(d.ownerName);
        setNationalId(d.nationalId);
        setOwnerPhone(d.ownerPhone);
        setBusinessType(d.businessType ?? "");
        setLocation({ province: d.province, district: d.district, sector: d.sector, cell: d.cell, village: d.village });
        setShowPlace(!!d.district);
        if (d.latitude != null && d.longitude != null) setPin({ lat: d.latitude, lng: d.longitude });
        setMomoPhone(d.momoPhone);
        setMomoName(d.momoPhoneOwnerName);
      })
      .catch((err) => {
        toast.error(apiMessage(err, "Couldn't open the application"));
        onClose();
      });
  }, [onClose]);

  const top = () => bodyRef.current?.scrollTo({ top: 0, behavior: "smooth" });

  const sendCode = async () => {
    if (!/^(\+?250|0)?7[2389]\d{7}$/.test(ownerPhone.replace(/[\s-]/g, ""))) {
      setErrors((e) => ({ ...e, ownerPhone: "Enter the owner's phone number (07…)" }));
      return;
    }
    setSendingCode(true);
    try {
      const res = await voucherService.sendCardOwnerCode(ownerPhone);
      setCodeSentTo(res.data.sentTo);
      setErrors((e) => ({ ...e, ownerPhone: "", code: "" }));
      toast.success(res.message);
    } catch (err) {
      toast.error(apiMessage(err, "We couldn't send the code"));
    } finally {
      setSendingCode(false);
    }
  };

  const pinMyLocation = () => {
    if (!navigator.geolocation) return toast.error("Your browser can't share your location");
    navigator.geolocation.getCurrentPosition(
      (p) => setPin({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => toast.error("Allow location access, or choose your district and sector"),
      { enableHighAccuracy: true, timeout: 15000 },
    );
  };

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!rdbFile && !draft?.hasRdbCertificate) e.rdb = "Upload your RDB certificate";
    if (businessName.trim().length < 2) e.businessName = "Required";
    if (!/^\d{9}$/.test(tin.replace(/\s+/g, ""))) e.tin = "The 9-digit TIN";
    if (ownerName.trim().length < 3) e.ownerName = "Required";
    if (!/^\d{16}$/.test(nationalId.replace(/\s+/g, ""))) e.nationalId = "The 16-digit National ID";
    if (!ownerPhone.trim()) e.ownerPhone = "Required";
    if (!/^\d{6}$/.test(code)) e.code = codeSentTo ? "Enter the 6-digit code" : "Send the code to the owner's phone first";
    if (!businessType) e.businessType = "Choose one";
    if (!pin && !(location.province && location.district && location.sector)) e.location = "Share your location, or choose district and sector";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const goStep2 = () => {
    if (!validateStep1()) {
      toast.error("Check the highlighted details");
      return;
    }
    if (!momoPhone) setMomoPhone(ownerPhone);
    if (!momoName) setMomoName(ownerName);
    setStep(2);
    top();
  };

  const submit = async () => {
    if (!consent) return;
    setSubmitting(true);
    try {
      const fd = new FormData();
      const fields: Record<string, string> = {
        businessName: businessName.trim(),
        tin: tin.replace(/\s+/g, ""),
        registeredSince,
        businessType,
        ownerName: ownerName.trim(),
        nationalId: nationalId.replace(/\s+/g, ""),
        ownerPhone,
        ownerCode: code,
        ...location,
        momoPhone: momoPhone || ownerPhone,
        momoPhoneOwnerName: momoName.trim() || ownerName.trim(),
        consent: "true",
      };
      if (pin) {
        fields.latitude = String(pin.lat);
        fields.longitude = String(pin.lng);
      }
      Object.entries(fields).forEach(([k, v]) => fd.append(k, v));
      if (rdbFile) fd.append("rdbCertificate", rdbFile);
      await voucherService.requestVoucherCard(fd);
      setStep("done");
      top();
      onSubmitted();
    } catch (err) {
      const msg = apiMessage(err, "Submission failed");
      toast.error(msg);
      // Back to where it can be fixed
      if (!/MoMo|agree/i.test(msg)) {
        setStep(1);
        if (/code/i.test(msg)) {
          setCode("");
          setErrors((e) => ({ ...e, code: msg }));
        }
        top();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const err = (k: string) => (errors[k] ? <span className="text-[11.5px] text-red-600">{errors[k]}</span> : null);
  const ussd = draft?.momoStatementUssd ?? "*182*6*8*4*1#";
  const salesEmail = draft?.momoStatementEmail ?? "sales@food.rw";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-0 sm:p-4" role="dialog" aria-modal="true" aria-labelledby="card-app-title">
      <div className="flex h-full w-full flex-col bg-white font-[Inter,system-ui,sans-serif] [-webkit-text-size-adjust:100%] [text-size-adjust:100%] text-[#1C2321] sm:h-auto sm:max-h-[92vh] sm:max-w-[440px] sm:rounded-2xl sm:shadow-2xl">
        {step !== "done" && (
          <div className="flex flex-col gap-3.5 border-b border-[#E6EAE7] px-5 pb-3 pt-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 id="card-app-title" className="m-0 text-[19px] font-bold">
                  Voucher Card Application
                </h2>
                <p className="m-0 mt-1 text-[13px] text-[#5B6660]">Step {step} of 2 · about 2 minutes</p>
              </div>
              <button type="button" onClick={onClose} aria-label="Close" className="-mr-2.5 -mt-2 flex h-11 w-11 items-center justify-center rounded-[10px] text-[#5B6660] hover:bg-[#F3F5F4]">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-1.5" aria-label="Progress">
              {["1. Business & owner", "2. Credit check"].map((label, i) => {
                const on = i === 0 || step === 2;
                return (
                  <div key={label} className={`flex flex-col gap-1.5 text-xs ${on ? "font-semibold text-[#1B5E20]" : "font-medium text-[#6B7570]"}`}>
                    <div className={`h-1 rounded-sm ${on ? "bg-[#2E7D32]" : "bg-[#E1E6E2]"}`} />
                    <span>{label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div ref={bodyRef} className="flex flex-1 flex-col gap-[22px] overflow-y-auto overflow-x-hidden p-5">
          {!draft ? (
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-[10px]" />
              ))}
            </div>
          ) : step === 1 ? (
            <>
              {/* 1. RDB certificate */}
              <section className="flex flex-col gap-2.5">
                <h3 className="m-0 text-sm font-semibold">1. Upload your RDB certificate</h3>
                <label className={`flex cursor-pointer items-center gap-3 rounded-xl border-[1.5px] border-dashed p-4 text-[13.5px] text-[#3E4943] ${errors.rdb ? "border-red-400" : "border-[#A9C7AC] bg-[#FBFDFB]"}`}>
                  <Upload className="h-6 w-6 shrink-0 text-[#2E7D32]" aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <b className="break-all text-[#1C2321]">{rdbFile ? rdbFile.name : draft.hasRdbCertificate ? "Certificate on file" : "Upload certificate or company extract"}</b>
                    <br />
                    {rdbFile || draft.hasRdbCertificate ? "Tap to choose another file" : "PDF or photo, up to 10 MB."}
                  </span>
                  <input type="file" accept="application/pdf,image/*" className="sr-only" onChange={(e) => setRdbFile(e.target.files?.[0] ?? null)} />
                  {(rdbFile || draft.hasRdbCertificate) && <Check className="ml-auto h-5 w-5 shrink-0 text-[#2E7D32]" aria-label="Added" />}
                </label>
                {err("rdb")}
              </section>

              {/* 2. Details */}
              <section className="flex flex-col gap-2.5">
                <h3 className="m-0 text-sm font-semibold">2. Business and owner details</h3>
                <p className="m-0 text-[12.5px] text-[#5B6660]">As written on the RDB certificate.</p>
                <div className="flex flex-col gap-3 rounded-xl border border-[#E1E6E2] bg-[#FAFBFA] p-3.5">
                  <Field id="ca-name" label="Business name">
                    <input id="ca-name" className={inputCls} value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
                    {err("businessName")}
                  </Field>
                  <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-2.5">
                    <Field id="ca-tin" label="TIN">
                      <input id="ca-tin" className={inputCls} inputMode="numeric" value={tin} onChange={(e) => setTin(e.target.value)} placeholder="9 digits" />
                      {err("tin")}
                    </Field>
                    <Field id="ca-since" label="Registered since">
                      <input id="ca-since" type="date" className={inputCls} value={registeredSince} max={new Date().toISOString().slice(0, 10)} onChange={(e) => setRegisteredSince(e.target.value)} />
                    </Field>
                  </div>
                  <Field id="ca-owner" label="Owner / director full name">
                    <input id="ca-owner" className={inputCls} value={ownerName} onChange={(e) => setOwnerName(e.target.value)} />
                    {err("ownerName")}
                  </Field>
                  <Field id="ca-nid" label="Owner National ID">
                    <input id="ca-nid" className={inputCls} inputMode="numeric" value={nationalId} onChange={(e) => setNationalId(e.target.value)} placeholder="16 digits" />
                    {err("nationalId")}
                  </Field>
                  <Field id="ca-phone" label="Owner phone">
                    <input
                      id="ca-phone"
                      className={inputCls}
                      inputMode="tel"
                      value={ownerPhone}
                      onChange={(e) => {
                        setOwnerPhone(e.target.value);
                        setCodeSentTo(null);
                        setCode("");
                      }}
                      placeholder="07…"
                    />
                    {err("ownerPhone")}
                  </Field>
                </div>
              </section>

              {/* 3. Owner code */}
              <section className="flex flex-col gap-2.5">
                <h3 className="m-0 text-sm font-semibold">3. Confirm you are the owner</h3>
                {codeSentTo ? (
                  <p className="m-0 text-[13px] text-[#5B6660]">Enter the 6-digit code we sent to {codeSentTo}</p>
                ) : (
                  <p className="m-0 text-[13px] text-[#5B6660]">We send a 6-digit code to the owner&apos;s phone.</p>
                )}
                <div className="flex gap-2">
                  <input
                    aria-label="6-digit code"
                    className={`${inputCls} text-center font-mono text-xl tracking-[0.5em]`}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="••••••"
                  />
                  <button
                    type="button"
                    onClick={sendCode}
                    disabled={sendingCode}
                    className="flex min-h-12 shrink-0 items-center gap-1.5 rounded-[10px] border border-[#2E7D32] bg-white px-3.5 text-sm font-semibold text-[#1B5E20] hover:bg-[#E8F5E9] disabled:opacity-60"
                  >
                    {sendingCode && <Loader2 className="h-4 w-4 animate-spin" />}
                    {codeSentTo ? "Send again" : "Send code"}
                  </button>
                </div>
                {err("code")}
                <p className="m-0 text-[13px] text-[#2E7D32]">I&apos;m a manager: the code goes to the owner&apos;s phone, so ask the owner for it.</p>
                <Why>
                  <b>Why we ask:</b> Rwandan law requires us to verify the business and its owner before giving credit. The code also stops anyone from applying in your name.
                </Why>
              </section>

              {/* 4. Type and location */}
              <section className="flex flex-col gap-2.5">
                <h3 className="m-0 text-sm font-semibold">4. Business type and location</h3>
                <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Business type">
                  {BUSINESS_TYPES.map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      role="radio"
                      aria-checked={businessType === value}
                      onClick={() => setBusinessType(value)}
                      className={`min-h-11 rounded-full border px-4 text-sm ${businessType === value ? "border-[#2E7D32] bg-[#E8F5E9] font-semibold text-[#1B5E20]" : "border-[#C9D1CC] bg-white text-[#1C2321]"}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                {err("businessType")}
                <button
                  type="button"
                  onClick={pinMyLocation}
                  className="flex min-h-12 items-center justify-center gap-2 rounded-[10px] border border-[#2E7D32] bg-white text-[14.5px] font-semibold text-[#1B5E20] hover:bg-[#E8F5E9]"
                >
                  <MapPin className="h-[18px] w-[18px]" aria-hidden="true" />
                  {pin ? `Location shared (${pin.lat.toFixed(4)}, ${pin.lng.toFixed(4)})` : "Use my current location"}
                </button>
                {!showPlace ? (
                  <button type="button" onClick={() => setShowPlace(true)} className="self-start text-[13px] text-[#2E7D32] underline-offset-2 hover:underline">
                    Or choose district and sector
                  </button>
                ) : (
                  <RwLocationFields value={location} onChange={setLocation} selectClassName={inputCls} />
                )}
                {err("location")}
              </section>
            </>
          ) : step === 2 ? (
            <>
              {/* MoMo number */}
              <section className="flex flex-col gap-2.5">
                <label htmlFor="ca-momo" className="text-sm font-semibold">
                  MTN MoMo number
                </label>
                <input id="ca-momo" className={inputCls} inputMode="tel" value={momoPhone} onChange={(e) => setMomoPhone(e.target.value)} />
                <Field id="ca-momo-name" label="Registered name on MTN" hint="Should match the owner. If it doesn't, we check it by hand.">
                  <input id="ca-momo-name" className={inputCls} value={momoName} onChange={(e) => setMomoName(e.target.value)} />
                </Field>
              </section>

              {/* MoMo history */}
              <section className="flex flex-col gap-2.5">
                <h3 className="m-0 text-sm font-semibold">Share your last 3 months of MoMo history</h3>
                <ol className="m-0 list-decimal pl-5 text-[13.5px] leading-[1.7] text-[#3E4943]">
                  <li>On that phone, dial the code below</li>
                  <li>
                    Enter the email <b>{salesEmail}</b>
                  </li>
                  <li>Confirm with your MoMo PIN</li>
                </ol>
                <div className="flex items-center justify-between rounded-[10px] border border-[#E1E6E2] bg-white py-1.5 pl-3.5 pr-1.5 font-mono text-base font-semibold">
                  <span>{ussd}</span>
                  <span className="flex gap-1.5">
                    <button
                      type="button"
                      aria-label="Copy code"
                      onClick={() => navigator.clipboard.writeText(ussd).then(() => toast.success("Code copied"))}
                      className="inline-flex min-h-10 items-center rounded-lg bg-[#E8F5E9] px-3.5 text-[13px] text-[#1B5E20]"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <a href={`tel:${ussd.replace(/#/g, "%23")}`} className="inline-flex min-h-10 items-center rounded-lg bg-[#E8F5E9] px-3.5 font-sans text-[13px] font-semibold text-[#1B5E20] no-underline">
                      Dial now
                    </a>
                  </span>
                </div>
                <div className="flex items-center gap-2.5 rounded-[10px] border border-[#F1DFA8] bg-[#FFF8E6] p-3 text-[13px] text-[#5C4A12]">
                  <Clock className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                  <span>
                    <b>MTN emails your statement to us.</b>
                    <br />
                    Our team adds it to your application; you don&apos;t need to send anything else.
                  </span>
                </div>
                <Why>
                  <b>Why we ask:</b> Your MoMo history shows your real cash flow, so we can give you a fair limit without asking for collateral.
                </Why>
              </section>

              {/* Consent */}
              <section className="flex flex-col gap-2.5">
                <h3 className="m-0 text-sm font-semibold">Your consent</h3>
                <div className="flex flex-col gap-2 rounded-xl border border-[#E1E6E2] p-3.5 text-[12.5px] leading-[1.55] text-[#3E4943] [&_p]:text-[12.5px] [&_p]:leading-[1.55]">
                  <p className="m-0">By submitting, I confirm the information above is true and that I am authorised to apply for this business.</p>
                  <p className="m-0">I allow Food Bundles Ltd to:</p>
                  <ul className="m-0 list-disc pl-[18px]">
                    <li>verify my identity with the national ID system;</li>
                    <li>review my MTN MoMo statement for the last 3 months;</li>
                    <li>check my business registration and, if needed, my credit history with a licensed credit bureau;</li>
                  </ul>
                  <p className="m-0">only to assess this application and manage my voucher account.</p>
                  <p className="m-0">
                    Food Bundles may share the minimum data needed with its licensed financing and payment partners. Every partner is bound by contract to protect your data and use it only for this purpose. <b>We never sell your data.</b>
                  </p>
                  <p className="m-0">
                    Your data is processed under Law No. 058/2021 on the Protection of Personal Data and Privacy. You can ask to see, correct or delete it, or withdraw consent, by writing to {salesEmail}. Withdrawing stops future credit but does not cancel amounts already owed.
                  </p>
                </div>
                <label className="flex cursor-pointer items-start gap-3 py-1 text-sm leading-snug">
                  <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 h-[22px] w-[22px] shrink-0 accent-[#2E7D32]" />
                  <span>
                    I have read and agree to this and to the{" "}
                    <a href="/privacy-policy" target="_blank" rel="noreferrer" className="text-[#2E7D32]">
                      Privacy Policy
                    </a>
                  </span>
                </label>
              </section>
            </>
          ) : (
            <div className="flex flex-col items-center gap-4 pt-16 text-center">
              <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[#E8F5E9] text-[#2E7D32]">
                <Check className="h-9 w-9" aria-hidden="true" />
              </div>
              <h2 className="m-0 text-[22px] font-bold">Application received</h2>
              <p className="m-0 max-w-[300px] text-[14.5px] text-[#5B6660]">We&apos;ll send our decision by SMS within 48 hours.</p>
              <div className="mt-3 flex w-full flex-col gap-2.5 rounded-xl border border-[#E1E6E2] bg-[#FAFBFA] p-3.5 text-left text-sm">
                <div className="flex justify-between">
                  <span>1. Details and owner confirmed</span>
                  <Check className="h-4 w-4 text-[#1B5E20]" aria-label="Done" />
                </div>
                <div className="flex justify-between">
                  <span>2. Credit review</span>
                  <span className="text-[12.5px] text-[#5B6660]">In progress</span>
                </div>
                <div className="flex justify-between">
                  <span>3. Card activated in Vouchers</span>
                  <span className="text-[12.5px] text-[#5B6660]">Next</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2.5 border-t border-[#E6EAE7] px-5 pb-6 pt-4">
          {step === 1 && (
            <button type="button" onClick={goStep2} disabled={!draft} className="min-h-[50px] rounded-xl bg-[#2E7D32] text-[15px] font-semibold text-white hover:bg-[#1B5E20] disabled:opacity-60">
              Continue
            </button>
          )}
          {step === 2 && (
            <>
              <div className="flex gap-2.5">
                <button type="button" onClick={() => setStep(1)} className="min-h-[50px] w-[110px] rounded-xl border border-[#C9D1CC] bg-white text-[15px] font-semibold hover:bg-[#F3F5F4]">
                  Back
                </button>
                <button
                  type="button"
                  onClick={submit}
                  disabled={!consent || submitting}
                  className="flex min-h-[50px] flex-1 items-center justify-center gap-2 rounded-xl bg-[#2E7D32] text-[15px] font-semibold text-white hover:bg-[#1B5E20] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Submit &amp; request card
                </button>
              </div>
              <p className="m-0 flex items-center justify-center gap-2 text-xs text-[#5B6660]">
                <Lock className="h-3.5 w-3.5" aria-hidden="true" /> Your data is encrypted and never sold
              </p>
            </>
          )}
          {step === "done" && (
            <button type="button" onClick={onClose} className="min-h-[50px] rounded-xl bg-[#2E7D32] text-[15px] font-semibold text-white hover:bg-[#1B5E20]">
              Back to Vouchers
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
