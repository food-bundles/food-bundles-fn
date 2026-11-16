/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Loader2, Pencil } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { invitationService, AcceptInvitationData } from "@/app/services/invitationService";
import { toast } from "sonner";
import { AuthPanel, authInput, authPrimaryButton } from "@/components/home/auth-panel";

interface ValidationErrors {
  username?: string;
  phone?: string;
  password?: string;
  loanTermsAndConditions?: string;
}

const ROLE_LABEL: Record<string, string> = {
  AGGREGATOR: "Aggregator",
  LOGISTICS: "Logistics",
  TRADER: "Trader",
  ADMIN: "Admin",
  STAFF: "Staff",
  MARKET_PRICES: "Market prices",
  SUPERUSER: "Super admin",
};

function AcceptInvitationForm() {
  const [formData, setFormData] = useState({
    username: "",
    phone: "",
    password: "",
    confirmPassword: "",
    loanTermsAndConditions: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [token, setToken] = useState("");
  const [invite, setInvite] = useState<{ email: string; role: string } | null>(null);
  const [inviteError, setInviteError] = useState("");
  const [checking, setChecking] = useState(true);
  // Aggregators approved from the QR application: name and phone are already known
  const [prefilled, setPrefilled] = useState(false);
  // The email already has an account: accepting adds the role, no new password
  const [existing, setExisting] = useState<{ name: string | null; roles: string[] } | null>(null);
  const [editDetails, setEditDetails] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteRole = invite?.role ?? null;

  useEffect(() => {
    const tokenParam = searchParams?.get("token");
    if (!tokenParam) {
      setInviteError("This invitation link is incomplete. Open the link from your email again.");
      setChecking(false);
      return;
    }
    setToken(tokenParam);
    invitationService
      .verifyInviteToken(tokenParam)
      .then((res) => {
        setInvite({ email: res.data.email, role: res.data.role });
        if (res.data.existingAccount) setExisting(res.data.existingAccount);
        if (res.data.prefill) {
          setFormData((f) => ({ ...f, username: res.data.prefill!.username, phone: res.data.prefill!.phone }));
          setPrefilled(true);
        }
      })
      .catch((e: any) =>
        setInviteError(e?.response?.data?.message || "This invitation link is not valid any more. Ask Food Bundles to send a new one.")
      )
      .finally(() => setChecking(false));
  }, [searchParams]);

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (existing) {
      if (inviteRole === "TRADER" && !formData.loanTermsAndConditions.trim()) {
        newErrors.loanTermsAndConditions =
          "Loan terms & conditions are required (restaurants will sign them when requesting a loan)";
      }
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    }

    if (!formData.username.trim()) newErrors.username = "Name is required";
    else if (formData.username.trim().length < 3) newErrors.username = "Name must be at least 3 characters";

    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    else if (!/^\+?[0-9]{10,15}$/.test(formData.phone.replace(/\s/g, ""))) newErrors.phone = "Invalid phone number format";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    else if (formData.password !== formData.confirmPassword) newErrors.password = "Passwords do not match";

    if (inviteRole === "TRADER" && !formData.loanTermsAndConditions.trim()) {
      newErrors.loanTermsAndConditions =
        "Loan terms & conditions are required (restaurants will sign them when requesting a loan)";
    }

    setErrors(newErrors);
    // A prefilled detail that fails: open the details so it can be fixed
    if (prefilled && (newErrors.username || newErrors.phone)) setEditDetails(true);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !token) return;

    setIsLoading(true);
    try {
      const acceptData: AcceptInvitationData = {
        token,
        ...(existing
          ? {}
          : {
              username: formData.username.trim(),
              phone: formData.phone.replace(/\s/g, ""),
              password: formData.password,
            }),
        ...(inviteRole === "TRADER" ? { loanTermsAndConditions: formData.loanTermsAndConditions.trim() } : {}),
      };
      await invitationService.acceptInvitation(acceptData);
      toast.success(
        existing
          ? `${roleLabel} role added. Log in with your usual password, then switch to it from your account menu.`
          : "Account created. Please log in.",
      );
      router.push("/login");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof ValidationErrors]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const roleLabel = inviteRole ? ROLE_LABEL[inviteRole] ?? inviteRole : "";
  const showDetailFields = !existing && (!prefilled || editDetails);

  return (
    <div className="grid w-full max-w-[1040px] overflow-hidden rounded-[24px] bg-white shadow-[0_40px_80px_-30px_#0B2E1F66] lg:grid-cols-2">
      <div className="hidden lg:flex">
        <AuthPanel
          kicker="INVITATION"
          title={prefilled ? "Your application was approved." : "Welcome to Food Bundles."}
          text={
            prefilled
              ? "Ubusabe bwawe bwemejwe. Choose a password to open your aggregator account. Training and onboarding follow."
              : "You were invited to join the Food Bundles team. Complete your account to get started."
          }
          points={
            inviteRole === "AGGREGATOR"
              ? ["Receive and weigh farmers' produce", "Pay farmers by Mobile Money", "Earn 4% to 7% commission"]
              : undefined
          }
        />
      </div>

      <div className="w-full p-6 sm:p-10">
        {checking ? (
          <div className="flex h-60 items-center justify-center gap-2 text-[#4A6358]">
            <Loader2 className="h-5 w-5 animate-spin" /> Checking your invitation…
          </div>
        ) : inviteError ? (
          <div className="flex flex-col gap-4">
            <h2 className="m-0 text-[24px] font-bold text-[#0B2E1F] [font-family:var(--font-inter-tight),sans-serif]">Invitation not valid</h2>
            <p className="m-0 rounded-xl bg-red-50 p-4 text-[15px] text-red-700">{inviteError}</p>
            <Link href="/login" className="text-[15px] font-bold text-[#007A35] hover:text-[#0B2E1F]">
              Already have an account? Log in
            </Link>
          </div>
        ) : (
          <>
            <h2 className="mb-1 text-[28px] font-bold tracking-[-0.6px] text-[#0B2E1F] [font-family:var(--font-inter-tight),sans-serif]">
              {existing
                ? `Add the ${roleLabel} role`
                : prefilled
                  ? `Welcome, ${formData.username.split(" ")[0]}`
                  : "Create your account"}
            </h2>
            <p className="mb-6 text-[15px] text-[#4A6358]">
              {existing
                ? `${existing.name ? `${existing.name}, you` : "You"} already have a Food Bundles account${
                    existing.roles.length ? ` (${existing.roles.join(", ")})` : ""
                  }. Accepting adds ${roleLabel} to it: you keep your password and switch roles from your account menu.`
                : prefilled
                  ? "Only your password is left."
                  : `You're joining as ${roleLabel}.`}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="rounded-xl bg-[#F6F9F7] p-4 text-[14px]">
                <div className="flex items-start justify-between gap-3">
                  <dl className="m-0 grid gap-1.5">
                    <div><dt className="inline font-bold text-[#4A6358]">Email: </dt><dd className="inline text-[#0B2E1F]">{invite?.email}</dd></div>
                    <div><dt className="inline font-bold text-[#4A6358]">Role: </dt><dd className="inline text-[#0B2E1F]">{roleLabel}</dd></div>
                    {prefilled && !editDetails && (
                      <>
                        <div><dt className="inline font-bold text-[#4A6358]">Name: </dt><dd className="inline text-[#0B2E1F]">{formData.username}</dd></div>
                        <div><dt className="inline font-bold text-[#4A6358]">Phone: </dt><dd className="inline text-[#0B2E1F]">{formData.phone}</dd></div>
                      </>
                    )}
                  </dl>
                  {prefilled && !editDetails && (
                    <button
                      type="button"
                      onClick={() => setEditDetails(true)}
                      className="inline-flex items-center gap-1 text-[13px] font-bold text-[#007A35] hover:text-[#0B2E1F] cursor-pointer"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </button>
                  )}
                </div>
              </div>

              {showDetailFields && (
                <>
                  <div>
                    <Input
                      type="text"
                      value={formData.username}
                      onChange={(e) => handleInputChange("username", e.target.value)}
                      placeholder="Full name"
                      aria-label="Full name"
                      autoComplete="name"
                      className={`${authInput} ${errors.username ? "border-red-500" : ""}`}
                      disabled={isLoading}
                    />
                    {errors.username && <p className="mt-1 text-xs text-red-600">{errors.username}</p>}
                  </div>
                  <div>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="Phone number (07…)"
                      aria-label="Phone number"
                      autoComplete="tel"
                      className={`${authInput} ${errors.phone ? "border-red-500" : ""}`}
                      disabled={isLoading}
                    />
                    {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
                  </div>
                </>
              )}

              {inviteRole === "TRADER" && (
                <div>
                  <textarea
                    value={formData.loanTermsAndConditions}
                    onChange={(e) => handleInputChange("loanTermsAndConditions", e.target.value)}
                    placeholder="Loan terms & conditions: shown to restaurants and signed when they request a loan from you (interest rate, repayment period, penalties)"
                    className={`min-h-[120px] w-full resize-y rounded-xl border p-3 text-[15px] text-[#0B2E1F] focus:border-[#00A43A] focus:outline-none ${
                      errors.loanTermsAndConditions ? "border-red-500" : "border-[#DCE6DF]"
                    }`}
                    disabled={isLoading}
                  />
                  {errors.loanTermsAndConditions && <p className="mt-1 text-xs text-red-600">{errors.loanTermsAndConditions}</p>}
                </div>
              )}

              {!existing && (
              <>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  placeholder="Choose a password (at least 6 characters)"
                  aria-label="Password"
                  autoComplete="new-password"
                  className={`${authInput} pr-12 ${errors.password ? "border-red-500" : ""}`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-1 top-1 flex h-10 w-10 items-center justify-center rounded-full text-[#4A6358] hover:text-[#0B2E1F] cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <div>
                <Input
                  type={showPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  placeholder="Type the password again"
                  aria-label="Confirm password"
                  autoComplete="new-password"
                  className={`${authInput} ${errors.password ? "border-red-500" : ""}`}
                  disabled={isLoading}
                />
                {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
              </div>
              </>
              )}

              <button type="submit" className={`flex w-full items-center justify-center gap-2 ${authPrimaryButton}`} disabled={isLoading}>
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {isLoading
                  ? existing ? "Adding role…" : "Creating account…"
                  : existing ? `Add ${roleLabel} to my account` : prefilled ? "Open my account" : "Complete registration"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function AcceptInvitationPage() {
  return (
    <div className="flex items-center justify-center px-4 py-10 sm:px-8 sm:py-16">
      <Suspense
        fallback={
          <div className="flex h-60 items-center gap-2 text-[#4A6358]">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading…
          </div>
        }
      >
        <AcceptInvitationForm />
      </Suspense>
    </div>
  );
}
