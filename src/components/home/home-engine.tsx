"use client";

import { useEffect, useState, type ReactNode } from "react";
import { GLOBE_LAND_PATH } from "./globe-land";
import { useTick } from "./use-tick";

type Station = { key: string; label: string; text: string; farmer: string; buyer: string; x: number; y: number; icon: ReactNode };

const STATIONS: Station[] = [
  {
    key: "farm", label: "Farmers", x: 40, y: 88,
    text: "Farmers post harvests in the app and receive offers at agreed prices.",
    farmer: "A guaranteed buyer before harvest.", buyer: "Early visibility of what’s coming.",
    icon: <path d="M12 21v-9M12 12c0-4 3-6 7-6 0 4-3 6-7 6zm0 0c0-3-2-5-6-5 0 3 2 5 6 5zM4 21h16" />,
  },
  {
    key: "check", label: "Quality check", x: 62, y: 58,
    text: "Each lot is graded, weighed and tagged, so its origin travels with it.",
    farmer: "Fair grading, on record.", buyer: "Consistent, traceable quality.",
    icon: (<><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4h6v3H9zM9 14l2 2 4-4" /></>),
  },
  {
    key: "hub", label: "Food Bundles", x: 95, y: 78,
    text: "Lots are aggregated at our hubs, and farmers are paid instantly by mobile money.",
    farmer: "Instant payment and a growing credit history.", buyer: "A lower cost per kilo.",
    icon: (<><path d="M3 10l9-5 9 5v10H3z" /><path d="M8 20v-6h8v6" /></>),
  },
  {
    key: "truck", label: "Delivery", x: 122, y: 55,
    text: "Consolidated routes deliver fresh produce to kitchens every morning.",
    farmer: "No transport to arrange.", buyer: "On-time, predictable supply.",
    icon: (<><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7" /><circle cx="7" cy="17.5" r="1.6" /><circle cx="17" cy="17.5" r="1.6" /></>),
  },
  {
    key: "kitchen", label: "Kitchens", x: 145, y: 92,
    text: "Order and consumption data flow back to plan the next season.",
    farmer: "Planting to real demand, not guesswork.", buyer: "Stable prices and planned menus.",
    icon: <path d="M7 21V12M5 3v6a2 2 0 0 0 4 0V3M7 3v6M17 21V3c-2 1-3 4-3 7h3" />,
  },
];

const ROUTE = "M40 88 Q48 62 62 58 Q80 54 95 78 Q106 52 122 55 Q138 60 145 92";
const ROUTE_BACK = "M145 92 Q138 60 122 55 Q106 52 95 78 Q80 54 62 58 Q48 62 40 88";

function Globe({ active }: { active: number }) {
  return (
    <svg
      viewBox="0 0 180 180"
      role="img"
      aria-label="Turning globe showing fresh food moving from farmers through quality check and Food Bundles to delivery and kitchens, with payments flowing back to farmers"
      className="h-auto w-full max-w-[400px]"
    >
      <defs>
        <clipPath id="fbGlobeClip"><circle cx="90" cy="90" r="86" /></clipPath>
        <radialGradient id="fbGlobeShade" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.16" />
          <stop offset="60%" stopColor="#000000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.55" />
        </radialGradient>
        <path id="fbLand" d={GLOBE_LAND_PATH} stroke="#3FA36B" strokeWidth="1.7" strokeLinecap="round" fill="none" />
      </defs>
      <circle cx="90" cy="90" r="89" fill="#00D048" opacity="0.10" />
      <circle cx="90" cy="90" r="86" fill="#0B2E1F" />
      <g clipPath="url(#fbGlobeClip)">
        <g className="fb-spin"><use href="#fbLand" /><use href="#fbLand" x="360" /></g>
        <ellipse cx="90" cy="90" rx="30" ry="86" fill="none" stroke="#FFFFFF" strokeOpacity="0.07" />
        <ellipse cx="90" cy="90" rx="62" ry="86" fill="none" stroke="#FFFFFF" strokeOpacity="0.07" />
        <path d="M4 60 H176 M4 120 H176 M2 90 H178" stroke="#FFFFFF" strokeOpacity="0.07" />
        <circle cx="90" cy="90" r="86" fill="url(#fbGlobeShade)" />
      </g>
      <path d={ROUTE} fill="none" stroke="#FFFFFF" strokeOpacity="0.75" strokeWidth="1" strokeDasharray="2.5 2.5" />
      {["0s", "-2.4s", "-4.8s"].map((begin) => (
        <g key={begin}>
          <circle r="4.6" fill="#00D048" stroke="#FFFFFF" strokeWidth="0.8" />
          <rect x="-1.8" y="-1.8" width="3.6" height="3.6" rx="0.8" fill="#FFFFFF" />
          <animateMotion dur="7s" begin={begin} repeatCount="indefinite" path={ROUTE} />
        </g>
      ))}
      {["-1s", "-4s"].map((begin) => (
        <g key={begin}>
          <circle r="4.6" fill="#E9B949" stroke="#FFFFFF" strokeWidth="0.8" />
          <text y="2.2" textAnchor="middle" fontSize="6.4" fontWeight="700" fill="#0B2E1F">$</text>
          <animateMotion dur="6s" begin={begin} repeatCount="indefinite" path={ROUTE_BACK} />
        </g>
      ))}
      {STATIONS.map((s, i) => {
        const on = i === active;
        const hub = s.key === "hub";
        return (
          <g key={s.key}>
            <circle cx={s.x} cy={s.y} r={on ? 10 : 0} fill="#00D048" opacity="0.25" style={{ transition: "r .4s" }} />
            <circle cx={s.x} cy={s.y} r={hub ? 4 : 3} fill={on ? "#00D048" : "#0F5C36"} stroke="#FFFFFF" strokeWidth="1" />
            <text
              x={s.x}
              y={s.y + (hub ? 12 : 11)}
              textAnchor="middle"
              fontSize={hub ? 6.4 : 5.6}
              fontWeight="700"
              fill="#FFFFFF"
              stroke="#0B2E1F"
              strokeWidth="1.6"
              paintOrder="stroke"
              className="fb-display"
            >
              {s.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function DistributionEngine() {
  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(true);

  useEffect(() => {
    if (!auto) return;
    const id = setInterval(() => setActive((a) => (a + 1) % STATIONS.length), 2800);
    return () => clearInterval(id);
  }, [auto]);

  const station = STATIONS[active];

  return (
    <section id="flow" className="mx-auto flex max-w-[1240px] flex-col gap-6 px-4 pb-16 pt-10 sm:px-8">
      <div className="flex flex-col gap-2">
        <h2 className="fb-display m-0 text-[clamp(48px,8vw,116px)] font-bold leading-[0.92] tracking-[-3.5px]">
          We are a
          <br />
          <span className="bg-gradient-to-r from-[#00A43A] via-[#00D048] to-[#18A0A0] bg-clip-text text-transparent">
            distribution engine.
          </span>
        </h2>
        <p className="fb-display mt-2 max-w-[760px] text-[clamp(20px,2vw,26px)] font-medium leading-snug text-[#1F5A3C]">
          As food moves from the farm, money moves into the farmer’s wallet.
        </p>
      </div>

      <div className="relative overflow-hidden rounded-[20px] bg-[#F6F9F7] px-5 pb-6 sm:px-7">
        <div className="-mx-5 mb-6 flex flex-wrap items-center justify-between gap-3 bg-[#0B2E1F] px-5 py-[22px] sm:-mx-7 sm:px-7">
          <h3 className="fb-display m-0 flex items-center gap-3.5 text-[clamp(22px,3vw,40px)] font-bold tracking-[-0.8px] text-white">
            <span className="fb-dot h-3.5 w-3.5 shrink-0 rounded-full bg-[#00D048] shadow-[0_0_0_6px_#00D04833]" />
            Global fresh food infrastructure
          </h3>
          <span className="text-sm font-bold tracking-[1px] text-[#7CF2A6]">LIVE · FARM TO KITCHEN</span>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          <div className="flex min-w-0 flex-[1_1_340px] justify-center">
            <Globe active={active} />
          </div>

          <div className="flex flex-[0_1_230px] flex-col gap-0.5">
            <div className="flex flex-wrap gap-x-3.5 gap-y-1.5 pb-2 pl-1 text-[13px] font-bold">
              <span className="flex items-center gap-1.5 text-[#007A35]"><span className="h-3 w-3 rounded-full bg-[#00D048]" />Fresh food</span>
              <span className="flex items-center gap-1.5 text-[#8A6000]"><span className="h-3 w-3 rounded-full bg-[#E9B949]" />$ to farmers</span>
            </div>
            {STATIONS.map((s, i) => {
              const on = i === active;
              return (
                <button
                  key={s.key}
                  type="button"
                  aria-pressed={on}
                  onClick={() => { setActive(i); setAuto(false); }}
                  className={`relative flex items-center gap-3.5 rounded-2xl py-1.5 pl-1.5 pr-3 text-left transition-colors ${on ? "bg-[#E3F3E8]" : "bg-transparent hover:bg-white"}`}
                >
                  <span className="relative h-11 w-11 shrink-0">
                    {on && <span className="fb-ping absolute inset-0 rounded-2xl bg-[#00D048]" />}
                    <span
                      className="absolute inset-0 flex items-center justify-center rounded-2xl border-[1.5px] transition-colors"
                      style={{ background: on ? "#0B2E1F" : "#FFFFFF", borderColor: on ? "#0B2E1F" : "#DCE6DF" }}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={on ? "#00D048" : "#0B2E1F"} strokeWidth="1.8" aria-hidden="true">
                        {s.icon}
                      </svg>
                    </span>
                  </span>
                  <span className="text-base font-bold">{s.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex min-w-0 flex-[1_1_320px] flex-col gap-4 rounded-[18px] border border-[#DCE6DF] bg-white p-6 shadow-[0_30px_60px_-30px_#0B2E1F40]" aria-live="polite">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[13px] font-bold tracking-[1px] text-[#4A6358]">STEP 0{active + 1} / 05</span>
              <div className="flex gap-[5px]" aria-hidden="true">
                {STATIONS.map((s, i) => (
                  <span
                    key={s.key}
                    className="h-1.5 rounded-md transition-all duration-500"
                    style={{ width: i === active ? 22 : 6, background: i <= active ? "#00A43A" : "#C5D1C6" }}
                  />
                ))}
              </div>
            </div>
            <h3 className="fb-display m-0 text-[26px] font-bold tracking-[-0.5px] text-[#007A35]">{station.label}</h3>
            <p className="m-0 text-[17px] leading-normal">{station.text}</p>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-2.5">
              <div className="flex flex-col gap-1.5 rounded-xl bg-[#EFFAF3] p-3.5">
                <span className="text-xs font-bold tracking-[1px] text-[#007A35]">FOR FARMERS</span>
                <span className="text-[15px] leading-snug">{station.farmer}</span>
              </div>
              <div className="flex flex-col gap-1.5 rounded-xl bg-[#FFF7E0] p-3.5">
                <span className="text-xs font-bold tracking-[1px] text-[#8A6000]">FOR BUYERS</span>
                <span className="text-[15px] leading-snug">{station.buyer}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const PAYEES = ["Musanze cooperative", "Gakenke farmer", "Rwamagana cooperative", "Huye farmer", "Nyagatare dairy group"];

export function ValuesSection() {
  const t = useTick(1000);
  const k = Math.floor(t / 3);
  const payee = PAYEES[k % PAYEES.length];
  const credit = `${30 + (k % 8) * 9}%`;

  return (
    <section id="values" className="bg-[#0A2418] px-4 py-[72px] text-white [clip-path:polygon(0_3%,100%_0,100%_97%,0_100%)] sm:px-8">
      <div className="mx-auto flex max-w-[1180px] flex-col gap-11 py-8">
        <div className="flex max-w-[680px] flex-col gap-3.5">
          <span className="text-base font-bold text-[#00D048]">Our value</span>
          <h2 className="fb-display m-0 text-[clamp(32px,4vw,52px)] font-bold leading-[1.05] tracking-[-1.2px]">
            Better for the farmer. Better for the kitchen.
          </h2>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-5">
          <article className="fb-lift flex flex-col gap-[22px] rounded-2xl border border-[#1F4A35] bg-[#11301F] p-7">
            <div className="h-[200px] overflow-hidden rounded-[10px] bg-[#0A2418] p-3.5" aria-hidden="true">
              <svg viewBox="0 0 300 172" className="h-full w-full overflow-hidden">
                <g className="fb-wave1"><path d="M0 80 q37.5 -100 75 0 t75 0 t75 0 t75 0 t75 0 t75 0 t75 0 t75 0" fill="none" stroke="#5E8A72" strokeWidth="2" /></g>
                <g className="fb-wave2"><path d="M0 80 q25 70 50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0" fill="none" stroke="#8FA89A" strokeWidth="2" strokeDasharray="5 4" /></g>
                <path d="M0 80 L300 80" stroke="#00D048" strokeWidth="4" strokeLinecap="round" />
                <circle cx="292" cy="80" r="5" fill="#00D048" />
                <path d="M0 10 h14" stroke="#5E8A72" strokeWidth="2" />
                <text x="18" y="14" fill="#C9DCD0" fontSize="11">Kimironko, Kigali</text>
                <path d="M150 10 h14" stroke="#8FA89A" strokeWidth="2" strokeDasharray="5 4" />
                <text x="168" y="14" fill="#C9DCD0" fontSize="11">Mile 12, Lagos</text>
                <text x="300" y="166" fill="#00D048" fontSize="11" textAnchor="end" fontWeight="700">Food Bundles — stable</text>
              </svg>
            </div>
            <h3 className="fb-display m-0 text-2xl font-bold">Competitive prices</h3>
            <div className="flex flex-col gap-2 text-base leading-normal text-[#C9DCD0]">
              <span>Prices swing in markets like Kimironko and Lagos. We buy directly from farmers, who submit their harvests through our Farmer Partner app — so our prices stay steady and competitive.</span>
              <span><b className="text-white">Farmers</b> get a fair price and a guaranteed buyer. <b className="text-white">Kitchens</b> buy from the source at prices that stay competitive.</span>
            </div>
          </article>

          <article className="fb-lift flex flex-col gap-[22px] rounded-2xl border border-[#1F4A35] bg-[#11301F] p-7">
            <div className="flex h-[200px] items-center gap-[18px] rounded-[10px] bg-[#0A2418] px-4 py-1" aria-hidden="true">
              <div className="relative h-[188px] w-[108px] shrink-0 overflow-hidden rounded-[22px] border-[3px] border-[#3C6B52] bg-[#0F3A27]">
                <span className="absolute left-1/2 top-1.5 -ml-[15px] h-1 w-[30px] rounded bg-[#3C6B52]" />
                <div className="absolute inset-x-2 top-4 rounded-lg bg-[#00D048] py-1 text-center text-[10px] font-bold text-[#0B2E1F]">Food Bundles</div>
                <span className="fb-drop fb-display absolute left-[22px] text-xl font-bold text-[#E9B949]">$</span>
                <span className="fb-drop fb-dd1 fb-display absolute left-12 text-2xl font-bold text-[#E9B949]">$</span>
                <svg viewBox="0 0 90 80" preserveAspectRatio="none" className="absolute left-1.5 top-[50px] h-[82px] w-[calc(100%-12px)]">
                  <path d="M0 76 L0 70 L10 64 L18 67 L28 55 L36 58 L46 44 L54 48 L64 32 L72 36 L82 18 L90 12 L90 80 L0 80Z" fill="#00D048" opacity="0.15" />
                  <path className="fb-stock" d="M0 70 L10 64 L18 67 L28 55 L36 58 L46 44 L54 48 L64 32 L72 36 L82 18 L90 12" fill="none" stroke="#00D048" strokeWidth="2.2" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                </svg>
                <span className="absolute right-2.5 top-11 text-[9px] font-bold text-[#00D048]">▲</span>
                <span className="fb-drop fb-dd2 fb-display absolute left-[72px] text-lg font-bold text-[#E9B949]">$</span>
                <div className="absolute inset-x-2 bottom-2.5 flex flex-col gap-px rounded-lg bg-white px-1 py-1.5 text-center text-[#0B2E1F]">
                  <span className="text-[9px] text-[#4A6358]">Farmer wallet</span>
                  <span className="text-[11px] font-bold">Growing ▲</span>
                </div>
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-3">
                <div key={payee} className="fb-in text-[13px] leading-snug text-white">
                  {payee}
                  <br />
                  <span className="text-[#E9B949]">paid to phone ✓</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs text-[#A9C2B3]">Digital financial record</span>
                  <div className="h-1.5 overflow-hidden rounded-md bg-[#1F4A35]">
                    <div className="h-full bg-[#E9B949] transition-[width] duration-1000" style={{ width: credit }} />
                  </div>
                </div>
              </div>
            </div>
            <h3 className="fb-display m-0 text-2xl font-bold">Digital inclusion</h3>
            <div className="flex flex-col gap-2 text-base leading-normal text-[#C9DCD0]">
              <span>Money moves through phones, not pockets. Every payment is digital, instant and recorded.</span>
              <span><b className="text-white">Farmers</b> build a financial record that opens access to savings and cheaper loans. <b className="text-white">Kitchens</b> order, pay and reconcile in one place.</span>
            </div>
          </article>

          <article className="fb-lift flex flex-col gap-[22px] rounded-2xl border border-[#1F4A35] bg-[#11301F] p-7">
            <div className="flex h-[200px] items-center rounded-[10px] bg-[#0A2418] px-3.5 py-3" aria-hidden="true">
              <svg viewBox="0 0 300 116" className="h-full w-full">
                <rect x="200" y="0" width="100" height="104" fill="#00D048" opacity="0.08" />
                <path d="M200 0 V104" stroke="#A9C2B3" strokeWidth="1" strokeDasharray="3 3" />
                <text x="206" y="12" fill="#A9C2B3" fontSize="10">Forecast</text>
                <path d="M0 40 L30 25 L60 55 L90 20 L120 60 L150 30 L180 50 L200 28" fill="none" stroke="#5E8A72" strokeWidth="1.6" />
                <path d="M0 70 L30 52 L60 82 L90 48 L120 80 L150 58 L180 76 L200 60" fill="none" stroke="#8FA89A" strokeWidth="1.6" />
                <path className="fb-draw" d="M0 62 L50 60 L100 62 L150 58 L200 60" fill="none" stroke="#00D048" strokeWidth="3" strokeLinecap="round" />
                <path d="M200 60 L250 57 L300 59" fill="none" stroke="#00D048" strokeWidth="3" strokeDasharray="5 4" strokeLinecap="round" />
                <text x="0" y="114" fill="#A9C2B3" fontSize="10">Markets monitored daily</text>
              </svg>
            </div>
            <h3 className="fb-display m-0 text-2xl font-bold">Ahead of the curve</h3>
            <div className="flex flex-col gap-2 text-base leading-normal text-[#C9DCD0]">
              <span>We monitor markets wherever we operate to predict price changes and manage each season as it happens.</span>
              <span><b className="text-white">Farmers</b> plant and harvest to real demand. <b className="text-white">Kitchens</b> face no surprises when seasons turn.</span>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
