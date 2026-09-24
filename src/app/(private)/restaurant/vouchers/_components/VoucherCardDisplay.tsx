"use client";

import { useState, useEffect, useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { voucherService } from "@/app/services/voucherService";
import { CardStatus, IVoucherCard } from "@/lib/types";
import {
  CreditCard, Copy, Check, ShieldCheck, ShieldOff,
  AlertCircle, Loader2, X, Building2, RotateCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Image from "next/image";
import createAxiosClient from "@/app/hooks/axiosClient";

const FOOD_BUNDLES_LOGO =
  "https://res.cloudinary.com/dzxyelclu/image/upload/v1760111270/Food_bundle_logo_cfsnsw.png";

// Deterministic 3-digit CVV derived from the PAN (no secret stored on the card)
const deriveCvv = (pan: string) => {
  let hash = 0;
  for (let i = 0; i < pan.length; i++) {
    hash = (hash * 31 + pan.charCodeAt(i)) % 997;
  }
  return String(100 + (hash % 900));
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface RestaurantProfile {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  tin: string;
  location?: string;
  province?: string;
  district?: string;
  sector?: string;
  cell?: string;
  village?: string;
}

const CONSENT_TEXT =
  "Granting access lets Food Bundles verify your payment history and revenue (Vuba Buba), business performance and growth (Kayko), and official tax compliance records (RRA) to assess your creditworthiness.";

// ─── Physical card ────────────────────────────────────────────────────────────
function PhysicalCard({ card }: { card: IVoucherCard }) {
  const [copied, setCopied] = useState(false);
  const [showBack, setShowBack] = useState(false);

  const flipRef = useRef<HTMLDivElement>(null);
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);

  const copyPan = () => {
    navigator.clipboard.writeText(card.pan);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatPan = (pan: string) => pan.replace(/(.{4})/g, "$1 ").trim();

  const gradients: Record<CardStatus, string> = {
    [CardStatus.ACTIVE]: "from-emerald-600 to-green-800",
    [CardStatus.SUSPENDED]: "from-yellow-500 to-orange-600",
    [CardStatus.BLOCKED]: "from-red-600 to-red-900",
    [CardStatus.DEACTIVATED]: "from-gray-500 to-gray-700",
  };

  const gradient = gradients[card.status] ?? gradients[CardStatus.ACTIVE];
  const cvv = deriveCvv(card.pan);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Card — standard credit-card ratio 85.6×53.98 mm = 1.586 */}
      <div
        className="relative"
        style={{ width: 320, height: 202, perspective: 1200 }}
      >
        <div
          ref={flipRef}
          className="relative h-full w-full"
          style={{
            transformStyle: "preserve-3d",
            transition: "transform 0.6s cubic-bezier(0.4, 0.2, 0.2, 1)",
            transform: showBack ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          <div
            ref={frontRef}
            className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-2xl overflow-hidden select-none`}
            style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
          >
        {/* Decorative circles */}
        <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-white/10" />
        <div className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full bg-white/10" />

        {/* Top row */}
        <div className="absolute top-4 left-5 right-5 flex justify-between items-start">
          <div className="flex items-center gap-2">
            <Image
              src={FOOD_BUNDLES_LOGO}
              alt="Food Bundles Logo"
              width={20}
              height={20}
              className="rounded-full bg-white object-cover"
              crossOrigin="anonymous"
            />
            <div>
              <p className="text-[9px] uppercase tracking-widest text-white/90 leading-none">Food Bundles Card</p>
              <p className="text-[7px] text-white/60 whitespace-nowrap leading-none mt-1">Your Supply, Always Secured</p>
            </div>
          </div>
          {/* Contactless waves + EMV chip */}
          <div className="flex items-center gap-1.5">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              className="w-5 h-5 text-white/70 rotate-180"
            >
              <path d="M6 8.32a7.43 7.43 0 0 1 0 7.36" />
              <path d="M9.46 6.21a11.76 11.76 0 0 1 0 11.58" />
              <path d="M12.91 4.1a15.91 15.91 0 0 1 0 15.8" />
              <path d="M16.37 2a20.16 20.16 0 0 1 0 20" />
            </svg>
            <div className="w-9 h-7 rounded bg-yellow-300/90 flex items-center justify-center">
              <div className="w-6 h-5 rounded-sm border border-yellow-600/40 grid grid-cols-2 gap-px p-0.5">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-yellow-600/50 rounded-sm" />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* PAN */}
        <div
          className="absolute left-5 right-5 flex items-center justify-between cursor-pointer group"
          style={{ top: "44%" }}
          onClick={copyPan}
        >
          <span className="font-mono text-[15px] tracking-[0.22em] font-semibold drop-shadow">
            {formatPan(card.pan)}
          </span>
          {copied
            ? <Check className="w-4 h-4 text-white/80" />
            : <Copy className="w-3.5 h-3.5 text-white/40 group-hover:text-white/80 transition-colors" />}
        </div>

        {/* Bottom row */}
        <div className="absolute bottom-4 left-5 right-5 flex justify-between items-end">
          <div>
            <p className="text-[8px] uppercase text-white/60 mb-0.5">Card Holder</p>
            <p className="text-[11px] font-semibold truncate max-w-[140px]">{(card as { restaurant?: { name?: string } }).restaurant?.name ?? card.restaurantName}</p>
          </div>
          <div className="text-right">
            <p className="text-[8px] uppercase text-white/60 mb-0.5">Issued</p>
            <p className="text-[11px] font-semibold">{new Date(card.issuedDate).toLocaleDateString()}</p>
          </div>
       
        </div>

        {/* Status overlay for non-active */}
        {card.status !== CardStatus.ACTIVE && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="bg-black/40 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-widest -rotate-12">
              {card.status}
            </span>
          </div>
        )}
          </div>

          {/* Back face */}
          <div
            ref={backRef}
            className="absolute inset-0 rounded-2xl bg-[linear-gradient(135deg,#268b69_0%,#126044_55%,#0b4935_100%)] text-white shadow-2xl overflow-hidden select-none"
            style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            {/* Magnetic stripe */}
            <div className="absolute top-0 inset-x-0 h-[49px] bg-[rgba(0,0,0,0.82)]" />

            <div className="absolute -right-[60px] -bottom-[90px] h-[180px] w-[180px] rounded-full border border-white/10" />

            {/* Message */}
            <div className="absolute left-[22px] right-[22px] top-[60px] text-center">
              <span className="inline-block max-w-full text-white font-extrabold text-[11px] leading-[1.35] tracking-wide">
                Backed by Food Bundles. Trusted Across Our Market.
              </span>
              <p className="text-[8px] text-white/70 mt-[4px] leading-[1.55]">
                This card guarantees supply not debt. Use it to grow.
              </p>
              <p className="text-[8px] text-white/70 mt-[4px] leading-[1.55]">
                This card is property of Food Bundles Limited, for use exclusively on the Food Bundles platform and with authorized partners. Not a bank card.
              </p>
            </div>

            {/* Signature strip: brand bottom-left + CVV */}
            <div className="absolute left-[26px] right-[26px] bottom-[19px] bg-[#f4f0e7] border border-white/40 rounded-[7.5px] px-[15px] py-[10px] flex items-center justify-between text-gray-900">
              <div className="flex items-center gap-2">
                <Image
                  src={FOOD_BUNDLES_LOGO}
                  alt="Food Bundles Logo"
                  width={20}
                  height={20}
                  className="rounded-full bg-white object-cover border border-gray-200"
                  crossOrigin="anonymous"
                />
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-gray-900 leading-none font-semibold">Food Bundles Card</p>
                  <p className="text-[7px] text-gray-500 whitespace-nowrap leading-none mt-1">Your Supply, Always Secured</p>
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-md px-2.5 py-1 text-center min-w-[42px]">
                <p className="text-[6px] uppercase tracking-widest text-gray-400 text-left">CVV</p>
                <p className="font-mono text-[12px] font-bold tracking-widest text-gray-900 leading-none">{cvv}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Flip control */}
      <div className="w-80 flex items-center justify-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => setShowBack((prev) => !prev)}
        >
          <RotateCw className="w-3 h-3 mr-1.5" />
          {showBack ? "View Front" : "View Back"}
        </Button>
      </div>

      {/* Stats */}
      <div className="w-80 grid grid-cols-2 gap-2 text-xs">
        {[
          { label: "Outstanding", value: `${card.totalOutstandingLoans.toLocaleString()} RWF`, warn: card.totalOutstandingLoans > 0 },
          { label: "Total Loans", value: String(card.totalLoansReceived) },
          { label: "Orders", value: String(card.qualifyingOrders) },
          { label: "Issued", value: new Date(card.issuedDate).toLocaleDateString() },
        ].map(({ label, value, warn }) => (
          <div key={label} className="bg-gray-50 rounded-lg p-3 border">
            <p className="text-gray-400 mb-0.5">{label}</p>
            <p className={`font-semibold ${warn ? "text-orange-600" : "text-gray-800"}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Eligibility */}
      <div className="w-80">
        {card.isEligible ? (
          <div className="flex items-center gap-2 text-green-600 text-xs bg-green-50 border border-green-200 rounded-lg px-3 py-2">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span>Eligible for loan</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-gray-500 text-xs bg-gray-50 border rounded-lg px-3 py-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{card.eligibilityReason ?? "Not yet eligible"}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── KYC Modal ────────────────────────────────────────────────────────────────
function KycModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [profile, setProfile] = useState<RestaurantProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Only 3 user-editable fields
  const [ownerName, setOwnerName] = useState("");
  const [ownerNationalId, setOwnerNationalId] = useState("");
  const [yearsInOperation, setYearsInOperation] = useState("");
  const [businessType, setBusinessType] = useState("RESTAURANT");

  const [consentAllPartners, setConsentAllPartners] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Fetch restaurant profile + existing KYC consent on mount
  useEffect(() => {
    const axiosClient = createAxiosClient();
    Promise.all([
      axiosClient.get("/me"),
      voucherService.getMyKycConsent().catch(() => null),
    ])
      .then(([meRes, kycRes]) => {
        setProfile(meRes.data.user as RestaurantProfile);
        const kyc = kycRes?.data;
        if (kyc) {
          setOwnerName(kyc.ownerName);
          setOwnerNationalId(kyc.ownerNationalId);
          setYearsInOperation(String(kyc.yearsInOperation));
          setBusinessType(kyc.businessType);
          setConsentAllPartners(kyc.consentVubaBuba && kyc.consentKayko && kyc.consentRRA);
        }
      })
      .catch(() => toast.error("Failed to load restaurant profile"))
      .finally(() => setLoadingProfile(false));
  }, []);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!ownerName.trim()) e.ownerName = "Required";
    if (!ownerNationalId.trim()) e.ownerNationalId = "Required";
    if (!yearsInOperation.trim()) e.yearsInOperation = "Required";
    if (!consentAllPartners)
      e.consent = "Grant consent to share your data with our partners";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || !profile) return;
    setSubmitting(true);
    try {
      await voucherService.submitKycConsent({
        restaurantName: profile.name,
        tinNumber: profile.tin,
        phoneNumber: profile.phone ?? "",
        businessAddress: profile.location
          ? profile.location
          : [profile.village, profile.cell, profile.sector, profile.district, profile.province].filter(Boolean).join(", "),
        district: profile.district ?? profile.location ?? "",
        sector: profile.sector ?? "",
        ownerName,
        ownerNationalId,
        businessType,
        yearsInOperation,
        consentVubaBuba: consentAllPartners,
        consentKayko: consentAllPartners,
        consentRRA: consentAllPartners,
      });
      await voucherService.requestVoucherCard();
      toast.success("KYC submitted — card request sent to admin for review");
      onSuccess();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Submission failed";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = (field: string) =>
    `w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 ${errors[field] ? "border-red-400" : "border-gray-300"}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Voucher Card Application</h2>
            <p className="text-xs text-gray-500 mt-0.5">Confirm your details and grant data access for credit scoring</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-5">
          {loadingProfile ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-8 w-full rounded" />)}
            </div>
          ) : (
            <>
              {/* ── Restaurant info from DB (read-only) ── */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="w-4 h-4 text-green-600" />
                  <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Restaurant Information</p>
                  <span className="text-[10px] text-gray-400 ml-1">(from your account)</span>
                </div>
                <div className="grid grid-cols-2 gap-2 bg-gray-50 rounded-xl p-3 border text-xs">
                  {[
                    { label: "Restaurant Name", value: profile?.name },
                    { label: "TIN Number", value: profile?.tin },
                    { label: "Phone", value: profile?.phone },
                    ...(profile?.location
                      ? [{ label: "Location", value: profile.location }]
                      : profile?.district || profile?.province || profile?.sector || profile?.cell || profile?.village
                      ? [
                          { label: "Province", value: profile?.province },
                          { label: "District", value: profile?.district },
                          { label: "Sector", value: profile?.sector },
                          { label: "Cell", value: profile?.cell },
                          { label: "Village", value: profile?.village },
                        ]
                      : [{ label: "Location", value: undefined }]
                    ),
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-gray-400">{label}</p>
                      <p className="font-medium text-gray-800 truncate">{value || <span className="text-gray-300 italic">Not set</span>}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── User-provided fields ── */}
              <div>
                <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">Additional Details</p>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">Owner Full Name *</label>
                    <input className={inputCls("ownerName")} value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)} placeholder="Full legal name" />
                    {errors.ownerName && <p className="text-red-500 text-[10px] mt-0.5">{errors.ownerName}</p>}
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">Owner National ID *</label>
                    <input className={inputCls("ownerNationalId")} value={ownerNationalId}
                      onChange={(e) => setOwnerNationalId(e.target.value)} placeholder="16-digit ID number" />
                    {errors.ownerNationalId && <p className="text-red-500 text-[10px] mt-0.5">{errors.ownerNationalId}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1 block">Years in Operation *</label>
                      <input type="number" min="0" className={inputCls("yearsInOperation")} value={yearsInOperation}
                        onChange={(e) => setYearsInOperation(e.target.value)} placeholder="e.g. 3" />
                      {errors.yearsInOperation && <p className="text-red-500 text-[10px] mt-0.5">{errors.yearsInOperation}</p>}
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1 block">Business Type</label>
                      <select className={inputCls("businessType")} value={businessType}
                        onChange={(e) => setBusinessType(e.target.value)}>
                        <option value="RESTAURANT">Restaurant</option>
                        <option value="HOTEL">Hotel</option>
                        <option value="CATERING">Catering</option>
                        <option value="FOOD_PROCESSING">Food Processing</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Data sharing consent ── */}
              <div>
                <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">Data Sharing Consent</p>
                <p className="text-xs text-gray-500 mb-3">
                  Food Bundles uses data from trusted partners to assess your creditworthiness.
                </p>
                {errors.consent && (
                  <p className="text-red-500 text-xs mb-2 bg-red-50 border border-red-200 rounded px-3 py-1.5">{errors.consent}</p>
                )}
                <div
                  className={`border rounded-xl p-3 transition-colors cursor-pointer ${consentAllPartners ? "border-green-400 bg-green-50" : "border-gray-200 hover:border-gray-300"}`}
                  onClick={() => setConsentAllPartners(!consentAllPartners)}
                >
                  <div className="flex items-start gap-3">
                    <input type="checkbox" checked={consentAllPartners} onChange={() => setConsentAllPartners(!consentAllPartners)}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-0.5 h-4 w-4 accent-green-600 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-gray-800">I agree to share my data with all partners</p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{CONSENT_TEXT}</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button
            className="flex-1 bg-green-600 hover:bg-green-700"
            onClick={handleSubmit}
            disabled={submitting || loadingProfile}
          >
            {submitting
              ? <><Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />Submitting...</>
              : "Submit & Request Card"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function VoucherCardDisplay() {
  const [card, setCard] = useState<IVoucherCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [requestPending, setRequestPending] = useState(false);
  const [showKycModal, setShowKycModal] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([
      voucherService.getMyVoucherCard().catch(() => null),
      voucherService.getMyCardEnrollmentRequest().catch(() => null),
    ])
      .then(([cardRes, reqRes]) => {
        setCard(cardRes?.data ?? null);
        setRequestPending(reqRes?.data?.status === "PENDING");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const statusConfig: Record<CardStatus, { label: string; color: string; icon: React.ReactNode }> = {
    [CardStatus.ACTIVE]: { label: "Active", color: "bg-green-500", icon: <ShieldCheck className="w-3 h-3" /> },
    [CardStatus.SUSPENDED]: { label: "Suspended", color: "bg-yellow-500", icon: <ShieldOff className="w-3 h-3" /> },
    [CardStatus.BLOCKED]: { label: "Blocked", color: "bg-red-500", icon: <ShieldOff className="w-3 h-3" /> },
    [CardStatus.DEACTIVATED]: { label: "Deactivated", color: "bg-gray-500", icon: <ShieldOff className="w-3 h-3" /> },
  };

  if (loading) {
    return (
      <div className="mb-2">
        <h2 className="text-[16px] font-medium text-center mb-4">My Voucher Card</h2>
        <div className="flex justify-center">
          <div className="w-80 space-y-3">
            <Skeleton className="h-[201px] w-full rounded-2xl" />
            <div className="grid grid-cols-2 gap-2">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-2">
      <h2 className="text-[16px] font-medium text-center mb-4">My Voucher Card</h2>

      {showKycModal && (
        <KycModal
          onClose={() => setShowKycModal(false)}
          onSuccess={() => { setShowKycModal(false); setTimeout(load, 800); }}
        />
      )}

      <div className="flex justify-center">
        {card ? (
          <div className="flex flex-col items-center gap-1">
            <span className={`flex items-center gap-1 px-3 h-6 text-white text-[11px] rounded-full mb-1 ${statusConfig[card.status]?.color ?? "bg-green-500"}`}>
              {statusConfig[card.status]?.icon}
              {statusConfig[card.status]?.label}
            </span>
            <PhysicalCard card={card} />
          </div>
        ) : requestPending ? (
          <div className="w-80 flex flex-col items-center justify-center p-8 border-2 border-dashed border-yellow-300 bg-yellow-50 rounded-2xl gap-3 text-center">
            <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-yellow-500" />
            </div>
            <p className="text-yellow-700 text-sm font-semibold">Card Request Pending</p>
            <p className="text-yellow-600 text-xs">
              Your request is under review. Admin will issue your permanent card number shortly.
            </p>
            <p className="text-[10px] text-yellow-400">No action needed — we&apos;ll notify you</p>
          </div>
        ) : (
          <div className="w-80 flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-200 rounded-2xl gap-4 text-center">
            <CreditCard className="w-12 h-12 text-gray-300" />
            <div>
              <p className="text-gray-700 text-sm font-semibold">No voucher card yet</p>
              <p className="text-gray-400 text-xs mt-1">
                Complete KYC verification to request your permanent Food Bundles card
              </p>
            </div>
            <Button
              onClick={() => setShowKycModal(true)}
              className="bg-green-600 hover:bg-green-700 text-sm h-9 px-5 w-full"
            >
              <CreditCard className="w-3.5 h-3.5 mr-2" />
              Apply for Voucher Card
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
