"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { DeliveryTruck, ProduceIcon, PRODUCE } from "./produce-icons";
import { useKigaliClock, useTick } from "./use-tick";

const ORDER_STEPS: [string, string][] = [
  ["Order placed", "20%"],
  ["Packed at hub", "45%"],
  ["Out for delivery", "75%"],
  ["Delivered", "100%"],
];
const PAYEES = ["Musanze cooperative", "Gakenke farmer", "Rwamagana cooperative", "Huye farmer", "Nyagatare dairy group"];

export function HomeHero() {
  const t = useTick(1000);
  const clock = useKigaliClock();
  const [status, pct] = ORDER_STEPS[Math.floor(t / 3) % ORDER_STEPS.length];
  const payee = PAYEES[Math.floor(t / 4) % PAYEES.length];

  return (
    <div id="home" className="relative">
      <div
        aria-hidden="true"
        className="fb-mesh absolute inset-x-0 top-0 h-[760px] [clip-path:polygon(0_0,100%_0,100%_62%,0_100%)]"
      />
      <section className="relative mx-auto flex max-w-[1180px] flex-wrap items-start gap-12 px-4 pb-20 pt-32 sm:px-8 sm:pt-36">
        <div className="flex min-w-0 flex-[1_1_460px] flex-col gap-6 text-white">
          <h1 className="fb-display m-0 text-[clamp(44px,6.6vw,88px)] font-bold leading-[0.98] tracking-[-2.5px]">
            Global fresh food infrastructure
          </h1>
          <p className="m-0 max-w-[500px] text-[19px] leading-normal text-[#E4F5EA] sm:text-[21px]">
            Built at the farm gate to empower farmers and answer food price inflation — connecting them to
            restaurants, hotels and schools through distribution, instant payment and contract farming.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/signup" className="fb-arrow inline-flex min-h-12 items-center gap-1 rounded-full bg-[#0B2E1F] px-6 text-[17px] font-bold text-white">
              Apply for access <span className="fb-chev">›</span>
            </Link>
            <Link href="/shop" className="fb-arrow inline-flex min-h-12 items-center gap-1.5 rounded-full bg-white px-6 text-[17px] font-bold text-[#0B2E1F]">
              Shop today&apos;s market <span className="fb-chev">›</span>
            </Link>
          </div>
        </div>

        <div className="relative h-[400px] min-w-0 flex-[1_1_440px] sm:h-[470px]" aria-hidden="true">
          <div className="fb-f1 absolute right-0 top-0 flex w-[330px] max-w-[92%] flex-col gap-3 rounded-[14px] bg-white p-5 shadow-[0_50px_100px_-20px_#0B2E1F55,0_30px_60px_-30px_#00000055]">
            <div className="flex justify-between text-[13px] text-[#4A6358]">
              <span>Agreed price · Tomatoes</span>
              <span className="font-bold text-[#007A35]">Stable</span>
            </div>
            <svg viewBox="0 0 300 90" className="h-[90px] w-full">
              <path d="M0 50 L25 30 L50 62 L75 22 L100 70 L125 35 L150 58 L175 18 L200 66 L225 28 L250 60 L275 34 L300 52" fill="none" stroke="#C7D3CB" strokeWidth="2" strokeDasharray="4 4" />
              <path className="fb-draw" d="M0 46 L300 44" fill="none" stroke="#00A43A" strokeWidth="3" strokeLinecap="round" />
            </svg>
            <div className="flex gap-4 text-xs text-[#4A6358]">
              <span>— Food Bundles</span>
              <span>- - Open market</span>
            </div>
          </div>

          <div className="fb-f2 absolute left-0 top-[190px] flex w-[290px] max-w-[86%] items-center gap-3.5 rounded-[14px] bg-white px-5 py-[18px] shadow-[0_50px_100px_-20px_#0B2E1F55]">
            <span className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full bg-[#FFF3D1]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9A6B00" strokeWidth="2">
                <circle cx="12" cy="12" r="8" />
                <path d="M12 8v8M9.5 10.5h4a1.5 1.5 0 0 1 0 3h-3" />
              </svg>
            </span>
            <div className="flex flex-col gap-0.5">
              <span className="text-[15px] font-bold">MoMo payout sent</span>
              <span className="text-[13px] text-[#4A6358]">{payee}</span>
            </div>
          </div>

          <div className="fb-f3 absolute bottom-0 right-[30px] flex w-[270px] max-w-[84%] flex-col gap-2.5 rounded-[14px] bg-[#0B2E1F] px-5 py-[18px] text-white shadow-[0_50px_100px_-20px_#0B2E1F77]">
            <div className="flex justify-between text-[13px] text-[#A9C2B3]">
              <span>Order · Kigali hotel</span>
              <span>{clock}</span>
            </div>
            <span className="text-[17px] font-bold">{status}</span>
            <div className="h-1 overflow-hidden rounded bg-[#1F4A35]">
              <div className="h-full bg-[#00D048] transition-[width] duration-700" style={{ width: pct }} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

type Buyer = {
  title: string;
  text: string;
  gradient: string;
  icon: ReactNode;
  badge?: string;
};

const ICON_PROPS = {
  width: 32,
  height: 32,
  viewBox: "0 0 24 24",
  stroke: "#FFFFFF",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  fill: "none",
  "aria-hidden": true,
};

const BUYERS: Buyer[] = [
  {
    title: "Schools",
    text: "Schools and school feeding programmes",
    gradient: "linear-gradient(135deg, #0A5A4A 0%, #0E7A64 55%, #12A08A 100%)",
    icon: (
      <svg {...ICON_PROPS} className="fb-bob">
        <path d="M2 9l10-5 10 5-10 5z" />
        <path d="M6 11v5c2 2 10 2 12 0v-5" />
        <path d="M22 9v6" />
      </svg>
    ),
  },
  {
    title: "Restaurants",
    text: "Restaurants, cafés and food court kitchens",
    gradient: "linear-gradient(135deg, #0B2E1F 0%, #0F5C36 55%, #147A42 100%)",
    icon: (
      <svg {...ICON_PROPS}>
        <g className="fb-tilt">
          <path d="M6 3v8a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V3" />
          <path d="M8 13v8" />
        </g>
        <path d="M17 21V3c-2 1.5-3 4-3 7s1 4 3 4" />
      </svg>
    ),
  },
  {
    title: "Bars",
    text: "Bars, lounges and rooftops — drinks and draft delivered",
    gradient: "linear-gradient(135deg, #4A2E00 0%, #6E4600 55%, #8F5E0A 100%)",
    badge: "Truck bar · drinks delivery",
    icon: (
      <svg {...ICON_PROPS}>
        <path d="M5 8h10v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z" />
        <path d="M15 11h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2" />
        <path d="M5 8a2 2 0 0 1 2-3 2.5 2.5 0 0 1 4.5-1A2 2 0 0 1 15 8" />
        <circle className="fb-bub" cx="8" cy="17" r="0.9" fill="#FFFFFF" stroke="none" />
        <circle className="fb-bub fb-bub2" cx="10.5" cy="18" r="0.9" fill="#FFFFFF" stroke="none" />
        <circle className="fb-bub fb-bub3" cx="12.5" cy="17" r="0.9" fill="#FFFFFF" stroke="none" />
      </svg>
    ),
  },
  {
    title: "Event Catering",
    text: "Weddings, conferences and events — food plus our draft truck bar",
    gradient: "linear-gradient(135deg, #5E2210 0%, #7A2E14 55%, #9A3F1C 100%)",
    badge: "Truck bar · drinks delivery",
    icon: (
      <svg {...ICON_PROPS}>
        <path d="M3 18h18" />
        <path d="M5 18a7 7 0 0 1 14 0" />
        <path d="M12 11V10" />
        <path d="M2 21h20" />
        <path className="fb-steam" d="M9 7c-1-1 1-2 0-3" />
        <path className="fb-steam fb-steam2" d="M15 7c-1-1 1-2 0-3" />
      </svg>
    ),
  },
  {
    title: "Hotels",
    text: "Hotels, lodges and guest houses",
    gradient: "linear-gradient(135deg, #12263A 0%, #1B3A55 55%, #24506F 100%)",
    icon: (
      <svg {...ICON_PROPS} className="fb-bob">
        <path d="M3 19V6" />
        <path d="M3 15h18v4" />
        <path d="M3 11h7v4" />
        <path d="M10 11h8a3 3 0 0 1 3 3v1" />
        <circle cx="6.5" cy="9" r="1.5" />
        <path className="fb-steam" d="M15 4h3l-3 3h3" />
      </svg>
    ),
  },
];

// The belt holds the produce twice so its -50% loop is seamless.
const BELT = [...PRODUCE, ...PRODUCE].map((_, i) => i % PRODUCE.length);

function LiveMarketStrip({ delay }: { delay: number }) {
  return (
    <span aria-hidden="true" className="relative -mx-5 -mb-5 mt-1.5 block h-[104px] overflow-hidden bg-black/20">
      <span className="absolute left-3 top-2 inline-flex items-center gap-1.5 text-[11px] font-bold tracking-[1px] text-white">
        <span className="fb-live h-[7px] w-[7px] rounded-full bg-[#00D048]" />
        LIVE MARKET
      </span>
      <span className="fb-belt absolute left-0 top-[26px] flex w-max gap-3.5 pl-3" style={{ animationDelay: `-${delay}s` }}>
        {BELT.map((p, i) => (
          <span key={i} className="fb-bob inline-flex" style={{ animationDelay: `-${(i % 5) * 0.4}s` }}>
            <ProduceIcon index={p} />
          </span>
        ))}
      </span>
      <span className="fb-road absolute inset-x-0 bottom-[9px] h-0.5" />
      <span className="fb-truck absolute bottom-1.5 left-[-80px] block" style={{ animationDelay: `-${delay}s` }}>
        <DeliveryTruck />
      </span>
    </span>
  );
}

export function BuyerCategories() {
  return (
    <section id="connect" aria-labelledby="join-h" className="relative mx-auto -mt-10 max-w-[1240px] px-4 pb-10 sm:px-8">
      <div className="flex flex-col gap-5 rounded-[22px] bg-white p-5 shadow-[0_40px_80px_-30px_#0B2E1F66] sm:p-7">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-col gap-1.5">
            <span className="self-start rounded-full bg-[#E3F3E8] px-3 py-1.5 text-[13px] font-bold tracking-[1.2px] text-[#007A35]">
              REQUEST ACCESS
            </span>
            <span className="inline-flex items-center gap-2 text-sm font-bold text-[#007A35]">
              <span className="fb-live h-2 w-2 rounded-full bg-[#00A43A]" />
              Live market — fresh produce, meat and drinks moving every day
            </span>
            <h2 id="join-h" className="fb-display m-0 text-[clamp(26px,2.8vw,36px)] font-bold tracking-[-0.8px]">
              Who are you buying for?
            </h2>
          </div>
          <div className="flex flex-col items-start gap-1 sm:items-end">
            <Link href="/signup?role=restaurant" className="fb-arrow py-1.5 text-base font-bold text-[#007A35] hover:text-[#0B2E1F]">
              Start your application <span className="fb-chev">›</span>
            </Link>
            <Link href="/signup?role=farmer" className="fb-arrow py-1.5 text-[15px] font-bold text-[#4A6358] hover:text-[#0B2E1F]">
              Are you a farmer? Sell your harvest <span className="fb-chev">›</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3.5">
          {BUYERS.map((b, i) => (
            <Link
              key={b.title}
              href="/signup?role=restaurant"
              className="fb-cat fb-rise relative flex min-h-[210px] flex-col gap-3 overflow-hidden rounded-[18px] p-5 text-white shadow-[0_12px_30px_-18px_#0B2E1F80]"
              style={{ background: b.gradient, animationDelay: `${i * 0.08}s` }}
            >
              <span aria-hidden="true" className="fb-orb absolute -right-[50px] -top-[50px] h-[140px] w-[140px] rounded-full bg-white/[0.08]" />
              <span aria-hidden="true" className="fb-orb2 absolute -bottom-10 -left-[30px] h-[100px] w-[100px] rounded-full bg-white/[0.06]" />
              <span aria-hidden="true" className="fb-sheen pointer-events-none absolute inset-0" style={{ animationDelay: `-${i}s` }} />
              <span className="relative flex h-14 w-14 items-center justify-center rounded-[15px] bg-white/15">{b.icon}</span>
              <span className="fb-display relative text-[21px] font-bold tracking-[-0.3px]">{b.title}</span>
              <span className="relative text-[15px] leading-snug text-[#E4F5EA]">{b.text}</span>
              {b.badge && (
                <span className="relative inline-flex items-center gap-1.5 self-start rounded-full bg-[#FFF6DE] px-2.5 py-1 text-[13px] font-bold text-[#5C3A00]">
                  <svg className="fb-drive" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5C3A00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M2 6h11v10H2z" />
                    <path d="M13 9h4l4 4v3h-8" />
                    <circle cx="6" cy="17.5" r="1.8" />
                    <circle cx="17" cy="17.5" r="1.8" />
                  </svg>
                  {b.badge}
                </span>
              )}
              <span className="relative mt-auto text-[15px] font-bold text-[#7CF2A6]">Request access ›</span>
              <LiveMarketStrip delay={i * 1.3} />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
