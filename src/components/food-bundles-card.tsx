"use client";

import Image from "next/image";

export const FOOD_BUNDLES_LOGO =
  "https://res.cloudinary.com/dzxyelclu/image/upload/v1760111270/Food_bundle_logo_cfsnsw.png";

/**
 * Payment-card styled container (logo, contactless icon, chip) used for
 * stat cards across the admin dashboard, vouchers and deposits pages.
 */
export function FoodBundlesCard({
  gradient,
  children,
}: {
  gradient: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`relative h-[150px] rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-2xl overflow-hidden select-none p-4 flex flex-col`}
    >
      <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-white/10" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-white/10" />

      <div className="relative flex justify-between items-start">
        <div className="flex items-center gap-2">
          <Image
            src={FOOD_BUNDLES_LOGO}
            alt="FoodBundles Logo"
            width={20}
            height={20}
            className="rounded-full bg-white object-cover"
            crossOrigin="anonymous"
          />
          <div>
            <p className="text-[9px] uppercase tracking-widest text-white/90 leading-none">FoodBundles Card</p>
            <p className="text-[7px] text-white/60 whitespace-nowrap leading-none mt-1">Your Supply, Always Secured</p>
          </div>
        </div>
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

      {children}
    </div>
  );
}
