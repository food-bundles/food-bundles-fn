"use client";

import { useState, useRef } from "react";
import { Plus, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const FOOD_BUNDLES_LOGO =
  "https://res.cloudinary.com/dzxyelclu/image/upload/v1760111270/Food_bundle_logo_cfsnsw.png";

interface WalletCardProps {
  balance: number;
  isActive: boolean;
  showDepositForm: boolean;
  onShowDepositForm: () => void;
  children?: React.ReactNode;
  holderName?: string;
}

export function WalletCard({
  balance,
  isActive,
  showDepositForm,
  onShowDepositForm,
  children,
  holderName,
}: WalletCardProps) {
  const [showBack, setShowBack] = useState(false);
  const flipRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* ── Physical card ── */}
      <div className="relative" style={{ width: 320, height: 202, perspective: 1200 }}>
        <div
          ref={flipRef}
          className="relative h-full w-full"
          style={{
            transformStyle: "preserve-3d",
            transition: "transform 0.6s cubic-bezier(0.4, 0.2, 0.2, 1)",
            transform: showBack ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* ── Front ── */}
          <div
            className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-600 to-green-800 text-white shadow-2xl overflow-hidden select-none"
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
                  <p className="text-[9px] uppercase tracking-widest text-white/90 leading-none">Food Bundles</p>
                  <p className="text-[7px] text-white/60 whitespace-nowrap leading-none mt-1">Prepaid Wallet Card</p>
                </div>
              </div>
              {/* Contactless + EMV chip */}
              <div className="flex items-center gap-1.5">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"
                  className="w-5 h-5 text-white/70 rotate-180">
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

            {/* Balance — centre of card */}
            <div className="absolute left-5 right-5" style={{ top: "40%" }}>
              <p className="text-[8px] uppercase tracking-widest text-white/60 mb-0.5">Available Balance</p>
              <p className="font-mono text-[22px] font-bold tracking-wide drop-shadow leading-none">
                {balance?.toLocaleString() ?? "0"}
                <span className="text-[12px] font-normal text-white/70 ml-1.5">RWF</span>
              </p>
            </div>

            {/* Bottom row */}
            <div className="absolute bottom-4 left-5 right-5 flex justify-between items-end">
              <div>
                <p className="text-[8px] uppercase text-white/60 mb-0.5">Card Holder</p>
                <p className="text-[11px] font-semibold truncate max-w-[160px]">
                  {holderName ?? "Restaurant Account"}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${isActive ? "bg-green-400/30 text-green-200" : "bg-red-400/30 text-red-200"}`}>
                  {isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>

          {/* ── Back ── */}
          <div
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
                Your prepaid balance is secured and ready for instant use on the Food Bundles platform.
              </p>
              <p className="text-[8px] text-white/70 mt-[4px] leading-[1.55]">
                This card is property of Food Bundles Limited, for use exclusively on the Food Bundles platform and with authorized partners. Not a bank card.
              </p>
            </div>

            {/* Signature strip */}
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
                  <p className="text-[9px] uppercase tracking-widest text-gray-900 leading-none font-semibold">Food Bundles</p>
                  <p className="text-[7px] text-gray-500 whitespace-nowrap leading-none mt-1">Prepaid Wallet Card</p>
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-md px-2.5 py-1 text-center">
                <p className="text-[6px] uppercase tracking-widest text-gray-400">Type</p>
                <p className="font-mono text-[10px] font-bold tracking-wide text-gray-900 leading-none">PREPAID</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Flip control */}
      <div className="w-80 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => setShowBack((p) => !p)}
        >
          <RotateCw className="w-3 h-3 mr-1.5" />
          {showBack ? "View Front" : "View Back"}
        </Button>
        {!showDepositForm && (
          <Button
            size="sm"
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            onClick={onShowDepositForm}
          >
            <Plus className="w-3 h-3 mr-1.5" />
            Deposit Funds
          </Button>
        )}
      </div>

      {/* Deposit form slot */}
      {showDepositForm && children}
    </div>
  );
}
