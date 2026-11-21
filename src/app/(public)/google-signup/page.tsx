/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Loader2, Sprout, Store } from "lucide-react";
import { authService } from "@/app/services/authService";
import { customerTypeService, type CustomerType } from "@/app/services/customerTypeService";
import { getPostLoginPath } from "@/lib/navigations";
import { UserRole } from "@/lib/types";
import { AuthPanel, authInput, authPrimaryButton } from "@/components/home/auth-panel";
import { CustomerTypeAvatar } from "@/components/customer-type-avatar";
import { LocationFields, type LocationValue } from "@/components/location-fields";

type Pass = { token: string; email: string; name: string };
type Kind = "RESTAURANT" | "FARMER";

const EMPTY_PLACE: LocationValue = { province: "", district: "", sector: "", cell: "", village: "" };
const formatTypeName = (name: string) => name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

/** The pass Google login left for this tab (it proves the email); null when there is none */
const readPass = (): Pass | null => {
  try {
    const raw = sessionStorage.getItem("googleSignup");
    const pass = raw ? (JSON.parse(raw) as Pass) : null;
    return pass?.token && pass.email ? pass : null;
  } catch {
    return null;
  }
};

/**
 * Finishing a sign-up started with "Continue with Google": Google already
 * confirmed the email, so only the business details are left. Same choices
 * as the normal sign-up: customer (with its business type) or farmer.
 */
export default function GoogleSignupPage() {
  const [pass, setPass] = useState<Pass | null>(null);
  const [checked, setChecked] = useState(false);
  const [kind, setKind] = useState<Kind>("RESTAURANT");
  const [customerTypes, setCustomerTypes] = useState<CustomerType[]>([]);
  const [customerTypeId, setCustomerTypeId] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [tin, setTin] = useState("");
  const [place, setPlace] = useState<LocationValue>(EMPTY_PLACE);
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const p = readPass();
    setPass(p);
    if (p) setName(p.name);
    setChecked(true);
    customerTypeService
      .getAllCustomerTypes()
      .then((res) => {
        const list: CustomerType[] = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setCustomerTypes(list.filter((t) => t.isActive));
      })
      .catch(() => setCustomerTypes([]));
  }, []);

  const clear = (key: string) => errors[key] && setErrors((e) => ({ ...e, [key]: "" }));

  const validate = () => {
    const e: Record<string, string> = {};
    const cleanPhone = phone.replace(/[\s\-()]/g, "");
    if (!name.trim() || name.trim().length < 2) e.name = kind === "FARMER" ? "Enter your name" : "Enter your business name";
    if (!/^\+?[0-9]{10,15}$/.test(cleanPhone)) e.phone = "Enter a valid phone number (e.g. 0788 123 456)";
    if (kind === "RESTAURANT") {
      if (customerTypes.length > 0 && !customerTypeId) e.customerTypeId = "Choose your kind of business";
      if (!/^[0-9]{9}$/.test(tin) || /^0+$/.test(tin)) e.tin = "TIN must be 9 digits";
    }
    if (!place.province || !place.district || !place.sector) e.place = "Choose at least your province, district and sector";
    if (!agreed) e.agreed = "Please accept the Terms and Conditions";
    setErrors(e);
    if (Object.keys(e).length) {
      setTimeout(() => document.querySelector("[data-field-error]")?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
    }
    return Object.keys(e).length === 0;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!pass || !validate()) return;
    setIsLoading(true);
    setError("");
    try {
      const location = [place.village, place.cell, place.sector, place.district, place.province].filter(Boolean).join(", ");
      const response = await authService.googleSignup({
        signupToken: pass.token,
        name: name.trim(),
        role: kind,
        phone: phone.replace(/[\s\-()]/g, ""),
        tin: kind === "RESTAURANT" ? tin : undefined,
        location,
        agreed,
        customerTypeId: kind === "RESTAURANT" ? customerTypeId || undefined : undefined,
      });
      sessionStorage.removeItem("googleSignup");

      const user = response.data?.user;
      const token = response.token;
      if (token) document.cookie = `auth-token=${token}; path=/; max-age=86400; secure; samesite=strict`;
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
        if (user.role) document.cookie = `user-role=${user.role}; path=/; max-age=86400; secure; samesite=strict`;
        if (user.restaurantId) localStorage.setItem("restaurantId", user.restaurantId);
      }
      if (user?.role) {
        const pendingRedirect = localStorage.getItem("pendingRedirect");
        if (pendingRedirect) localStorage.removeItem("pendingRedirect");
        window.location.href = getPostLoginPath(user.role as UserRole, pendingRedirect);
      } else {
        window.location.href = "/login";
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Registration failed. Please try again.");
      setIsLoading(false);
    }
  };

  const fieldError = (key: string) =>
    errors[key] ? (
      <p data-field-error className="m-0 mt-1 text-[13px] font-bold text-red-600">
        {errors[key]}
      </p>
    ) : null;

  const kindCard = (value: Kind, title: string, text: string, Icon: typeof Store) => {
    const on = kind === value;
    return (
      <button
        type="button"
        role="radio"
        aria-checked={on}
        onClick={() => {
          setKind(value);
          setErrors({});
        }}
        className={`flex items-start gap-3 rounded-2xl border p-3.5 text-left transition-colors cursor-pointer ${
          on ? "border-[#00A43A] bg-[#EFFAF3] ring-2 ring-[#00A43A]" : "border-[#DCE6DF] bg-white hover:border-[#00A43A]"
        }`}
      >
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${on ? "bg-[#00A43A] text-white" : "bg-[#F6F9F7] text-[#0B2E1F]"}`}>
          <Icon className="h-5 w-5" />
        </span>
        <span>
          <span className="block text-[15px] font-bold text-[#0B2E1F]">{title}</span>
          <span className="block text-[13px] text-[#4A6358]">{text}</span>
        </span>
      </button>
    );
  };

  return (
    <div className="flex w-full justify-center px-4 py-10 sm:px-8">
      <div className="grid w-full max-w-[1040px] overflow-hidden rounded-[24px] bg-white shadow-[0_40px_80px_-30px_#0B2E1F66] lg:grid-cols-2">
        <div className="hidden lg:flex">
          <AuthPanel
            kicker="ALMOST DONE"
            title="One step left."
            text="Google confirmed your email. Tell us about your business and you can start ordering or selling."
            points={["Your Google account signs you in", "Prices for your kind of business", "Pay by mobile money or your Food Bundles Card"]}
          />
        </div>

        <div className="p-6 sm:p-10">
          <h2 className="m-0 text-[28px] font-bold tracking-[-0.6px] text-[#0B2E1F] [font-family:var(--font-inter-tight),sans-serif]">
            Complete your account
          </h2>

          {!checked ? (
            <div className="flex h-40 items-center justify-center text-[#4A6358]">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : !pass ? (
            <div className="mt-4 flex flex-col gap-4">
              <p className="m-0 rounded-xl bg-[#FFF4DD] p-4 text-[15px] text-[#7A5200]">
                Your Google sign-in has expired or was opened in another tab. Please choose “Continue with Google” again.
              </p>
              <Link href="/signup" className={`flex items-center justify-center ${authPrimaryButton}`}>
                Back to sign up
              </Link>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="mt-1 flex flex-col gap-5">
              <p className="m-0 flex items-center gap-2 text-[15px] text-[#4A6358]">
                <Check className="h-4 w-4 shrink-0 text-[#00A43A]" /> Signed in with Google as{" "}
                <b className="truncate text-[#0B2E1F]">{pass.email}</b>
              </p>

              {error && <p className="m-0 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[14px] text-red-700">{error}</p>}

              <div className="flex flex-col gap-2">
                <p className="m-0 text-[15px] font-bold text-[#0B2E1F]">I am…</p>
                <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Account type">
                  {kindCard("RESTAURANT", "A customer", "Restaurant, hotel, school… buying supply", Store)}
                  {kindCard("FARMER", "A farmer", "Farmer or cooperative selling a harvest", Sprout)}
                </div>
              </div>

              {kind === "RESTAURANT" && customerTypes.length > 0 && (
                <div>
                  <p className="m-0 mb-2.5 text-[15px] font-bold text-[#0B2E1F]">What kind of business are you?</p>
                  <div role="radiogroup" aria-label="Business type" className="grid grid-cols-3 gap-2 sm:gap-3">
                    {customerTypes.map((type) => {
                      const on = type.id === customerTypeId;
                      return (
                        <button
                          key={type.id}
                          type="button"
                          role="radio"
                          aria-checked={on}
                          onClick={() => {
                            setCustomerTypeId(type.id);
                            clear("customerTypeId");
                          }}
                          className={`group flex flex-col items-center gap-2 rounded-2xl border px-1.5 pb-3 pt-3.5 text-center transition-all cursor-pointer ${
                            on ? "border-[#00A43A] bg-[#EFFAF3] ring-2 ring-[#00A43A]" : "border-[#DCE6DF] bg-white hover:border-[#00A43A]"
                          }`}
                        >
                          <span className="relative">
                            <CustomerTypeAvatar
                              name={type.name}
                              imageUrl={type.imageUrl}
                              size={72}
                              className={`ring-4 transition-transform group-hover:scale-[1.04] ${on ? "ring-[#00A43A]/40" : "ring-white"}`}
                            />
                            {on && (
                              <span className="absolute -right-0.5 -top-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-[#00A43A] text-white ring-2 ring-white">
                                <Check className="h-3.5 w-3.5" />
                              </span>
                            )}
                          </span>
                          <span className="text-[14px] font-bold leading-tight text-[#0B2E1F]">{formatTypeName(type.name)}</span>
                        </button>
                      );
                    })}
                  </div>
                  {fieldError("customerTypeId")}
                </div>
              )}

              <div>
                <input
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    clear("name");
                  }}
                  placeholder={kind === "FARMER" ? "Your name" : "Business name"}
                  aria-label={kind === "FARMER" ? "Your name" : "Business name"}
                  autoComplete={kind === "FARMER" ? "name" : "organization"}
                  className={`${authInput} ${errors.name ? "border-red-500" : ""}`}
                />
                {fieldError("name")}
              </div>

              <div className={`grid gap-4 ${kind === "RESTAURANT" ? "sm:grid-cols-2" : ""}`}>
                <div>
                  <input
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      clear("phone");
                    }}
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="Phone number (07…)"
                    aria-label="Phone number"
                    className={`${authInput} ${errors.phone ? "border-red-500" : ""}`}
                  />
                  {fieldError("phone")}
                </div>
                {kind === "RESTAURANT" && (
                  <div>
                    <input
                      value={tin}
                      onChange={(e) => {
                        setTin(e.target.value.replace(/\D/g, "").slice(0, 9));
                        clear("tin");
                      }}
                      inputMode="numeric"
                      placeholder="TIN number (9 digits)"
                      aria-label="TIN number"
                      className={`${authInput} ${errors.tin ? "border-red-500" : ""}`}
                    />
                    {fieldError("tin")}
                  </div>
                )}
              </div>

              <div>
                <p className="m-0 mb-2 text-[15px] font-bold text-[#0B2E1F]">{kind === "FARMER" ? "Where is your farm?" : "Where is your business?"}</p>
                <LocationFields
                  value={place}
                  onChange={(v) => {
                    setPlace(v);
                    clear("place");
                  }}
                  disabled={isLoading}
                />
                {fieldError("place")}
              </div>

              <div>
                <label className="flex cursor-pointer items-start gap-3 text-[14px] text-[#2E4A3B]">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => {
                      setAgreed(e.target.checked);
                      clear("agreed");
                    }}
                    className="mt-0.5 h-5 w-5 shrink-0 accent-[#00A43A]"
                  />
                  <span>
                    I have read and agree to the{" "}
                    <Link href="/terms" target="_blank" className="font-bold text-[#007A35] underline underline-offset-2">
                      Terms &amp; Conditions
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy-policy" target="_blank" className="font-bold text-[#007A35] underline underline-offset-2">
                      Privacy Policy
                    </Link>
                    .
                  </span>
                </label>
                {fieldError("agreed")}
              </div>

              <button type="submit" disabled={isLoading} className={`flex w-full items-center justify-center gap-2 ${authPrimaryButton}`}>
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {isLoading ? "Creating your account…" : "Create my account"}
              </button>

              <p className="m-0 text-center text-[14px] text-[#4A6358]">
                Not you?{" "}
                <Link href="/login" className="font-bold text-[#007A35] hover:text-[#0B2E1F]">
                  Back to sign in
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
