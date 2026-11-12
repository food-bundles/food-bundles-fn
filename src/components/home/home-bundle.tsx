"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { PRODUCE } from "./produce-icons";
import { restaurantShowcaseService } from "@/app/services/restaurantShowcaseService";

// Produce that drops into the crate, left to right: [produce index, x, y, rotation]
const DROPS: [number, number, number, number][] = [
  [0, 222, 118, -8],
  [6, 268, 112, 10],
  [3, 314, 116, -4],
  [8, 358, 104, 6],
  [4, 398, 116, 22],
];

function BundleCrate({ paused }: { paused: boolean }) {
  return (
    <svg
      viewBox="0 0 640 330"
      role="img"
      aria-label="Tomatoes, avocados, cabbage, a pineapple and carrots drop one by one into a green Food Bundles crate, the lid closes and the crate rides off to the kitchen"
      className={`fb-crate h-auto w-full ${paused ? "fb-paused" : ""}`}
    >
      <defs>
        <linearGradient id="fbCrateBody" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#00B843" />
          <stop offset="1" stopColor="#007A35" />
        </linearGradient>
        <linearGradient id="fbCrateLid" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#0F5C36" />
          <stop offset="1" stopColor="#0B2E1F" />
        </linearGradient>
      </defs>
      <path d="M0 296 H640" stroke="#FFFFFF" strokeOpacity="0.25" strokeWidth="2" strokeDasharray="10 10" />
      <g className="fb-cscene">
        <g className="fb-cride">
          <ellipse cx="320" cy="298" rx="150" ry="8" fill="#000000" opacity="0.25" />
          {DROPS.map(([p, x, y, r], i) => (
            <g key={i} className={`fb-citem fb-ci${i + 1}`}>
              <svg x={x - 4} y={y + 22} width="58" height="58" viewBox="0 0 32 32" overflow="visible">
                <g transform={`rotate(${r} 16 16)`}>{PRODUCE[p].svg}</g>
              </svg>
            </g>
          ))}
          {/* crate front, drawn after the produce so items sit inside it */}
          <path d="M196 158 H444 L428 290 H212 Z" fill="url(#fbCrateBody)" />
          <path d="M204 192 H436 M208 226 H432 M210 260 H430" stroke="#006B2E" strokeWidth="3" opacity="0.55" />
          <path d="M196 158 H444" stroke="#7CF2A6" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
          <rect x="262" y="206" width="116" height="36" rx="18" fill="#FFFFFF" />
          <text x="320" y="230" textAnchor="middle" fontSize="16" fontWeight="700" fill="#0B2E1F" className="fb-display">Food Bundles</text>
          <g className="fb-clid">
            <rect x="188" y="140" width="264" height="24" rx="8" fill="url(#fbCrateLid)" />
            <path d="M296 140 a24 18 0 0 1 48 0" fill="none" stroke="#0B2E1F" strokeWidth="6" strokeLinecap="round" />
            <circle cx="320" cy="152" r="5" fill="#00D048" />
          </g>
        </g>
      </g>
    </svg>
  );
}

const STEPS = [
  { title: "Order", text: "Order on the web or in the Buyer app, from fresh produce to meat and drinks." },
  { title: "We source and check", text: "We buy from the farm gate, grade every lot and pay farmers by mobile money." },
  { title: "One bundle, delivered", text: "Everything arrives together in one delivery, traced back to the farm." },
];

export function BundleSection() {
  const [paused, setPaused] = useState(false);

  return (
    <section id="bundle" aria-labelledby="bundle-h" className="mx-auto max-w-[1240px] px-4 py-16 sm:px-8">
      <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_1fr]">
        <div className="flex flex-col items-center gap-3.5">
          <div className="flex w-full justify-center overflow-hidden rounded-[28px] bg-[#0B2E1F] px-4 pb-2 pt-6">
            <BundleCrate paused={paused} />
          </div>
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            className="min-h-11 rounded-full border border-[#0B2E1F] px-[18px] text-[15px] font-medium text-[#0B2E1F]"
          >
            {paused ? "Play" : "Pause"}
          </button>
        </div>

        <div className="flex flex-col gap-5">
          <span className="text-sm font-bold uppercase tracking-[0.12em] text-[#4A6358]">How ordering works</span>
          <h2 id="bundle-h" className="fb-display m-0 text-[clamp(34px,4vw,50px)] font-bold leading-[1.05] tracking-[-1.2px]">
            Many farms. <span className="text-[#00A43A]">One bundle.</span>
          </h2>
          <p className="m-0 max-w-[36em] text-lg leading-relaxed text-[#4A6358]">
            Your whole order, from many farmers, packed and delivered together.
          </p>
          <ol className="m-0 flex list-none flex-col gap-4 p-0">
            {STEPS.map((s, i) => (
              <li key={s.title} className="flex gap-4">
                <span className="fb-display flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#0B2E1F] text-lg font-bold">
                  {i + 1}
                </span>
                <div className="flex flex-col gap-1">
                  <h3 className="m-0 text-lg font-bold">{s.title}</h3>
                  <p className="m-0 text-base leading-normal text-[#4A6358]">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="flex flex-wrap gap-3 pt-1">
            <Link href="/shop" className="fb-arrow inline-flex min-h-12 items-center gap-1 rounded-full bg-[#0B2E1F] px-6 text-[17px] font-bold text-white">
              Start an order <span className="fb-chev">›</span>
            </Link>
            <Link href="/price-comparison" className="inline-flex min-h-12 items-center rounded-full border border-[#0B2E1F] px-6 text-[17px] font-bold text-[#0B2E1F]">
              Compare prices
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// Stand-in photos for featured customers who have not uploaded a business
// photo yet: people cooking, kitchen tools and food in kitchens (free photos,
// Unsplash License) kept in public/home/kitchens. Never another restaurant's picture.
const STOCK_PHOTOS = Array.from({ length: 10 }, (_, i) => `/home/kitchens/kitchen-${i + 1}.jpg`);

// The ring reads as a ring from about this many cards; fewer customers repeat
const MIN_RING_CARDS = 10;

type Kitchen = { id: string; name: string; photo: string | null; stock: string };

// Distance from the ring's centre: at least the original ring's size, wider
// when many cards need room to clear each other
const ringRadius = (count: number, cardWidth: number, min: number, max: number) =>
  Math.min(max, Math.max(min, Math.round((cardWidth + 28) / (2 * Math.tan(Math.PI / count)))));

function KitchenCard({ k }: { k: Kitchen }) {
  return (
    <>
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-white shadow-[0_20px_40px_-20px_#0B2E1F80]">
        <Image src={k.photo || k.stock} alt="" fill sizes="150px" className="object-cover" />
      </div>
      <figcaption className="line-clamp-2 text-sm font-bold text-[#0B2E1F]">{k.name}</figcaption>
    </>
  );
}

// Customers an admin featured, on a slowly turning 3D ring like the Harvest
// Line carousel. Hidden until at least one customer is featured.
export function PartnerRing() {
  const [paused, setPaused] = useState(false);
  const [kitchens, setKitchens] = useState<Kitchen[]>([]);

  useEffect(() => {
    restaurantShowcaseService
      .getFeatured()
      .then((list) =>
        setKitchens(
          list.map((r, i) => ({
            id: r.id,
            name: r.name,
            photo: r.businessImage,
            stock: STOCK_PHOTOS[i % STOCK_PHOTOS.length],
          }))
        )
      )
      .catch(() => setKitchens([]));
  }, []);

  if (!kitchens.length) return null;

  // Few customers: repeat them around the ring so it turns like before
  const cards = Array.from(
    { length: Math.max(MIN_RING_CARDS, kitchens.length) },
    (_, i) => ({ ...kitchens[i % kitchens.length], stock: STOCK_PHOTOS[i % STOCK_PHOTOS.length] }),
  );
  const count = cards.length;
  const step = 360 / count;
  const ringVars = {
    "--fb-r-sm": `${ringRadius(count, 118, 250, 300)}px`,
    "--fb-r-lg": `${ringRadius(count, 150, 380, 430)}px`,
  } as React.CSSProperties;

  return (
    <section aria-labelledby="partners-h" className="overflow-hidden bg-[#F6F9F7] px-4 py-16 sm:px-8">
      <div className="mx-auto flex max-w-[1180px] flex-col items-center gap-4 text-center">
        <span className="text-base font-bold text-[#00A43A]">Our kitchens</span>
        <h2 id="partners-h" className="fb-display m-0 text-[clamp(30px,3.6vw,46px)] font-bold leading-[1.05] tracking-[-1px]">
          Trusted by Kigali’s kitchens
        </h2>
        <p className="m-0 max-w-[34em] text-lg text-[#4A6358]">
          Restaurants, hotels and cafés that stock their kitchens with Food Bundles.
        </p>

        <div
          className="fb-ring relative mt-4 h-[230px] w-full max-w-[900px] [--fb-r:var(--fb-r-sm)] [--fb-w:118px] sm:h-[270px] sm:[--fb-r:var(--fb-r-lg)] sm:[--fb-w:150px]"
          style={ringVars}
        >
          <div
            className="fb-ring-spin absolute inset-0 [transform-style:preserve-3d]"
            style={{ animationPlayState: paused ? "paused" : "running" }}
          >
            {cards.map((k, i) => (
              <figure
                key={`${k.id}-${i}`}
                className="fb-ring-item m-0 flex flex-col items-center gap-2 [backface-visibility:hidden]"
                style={{
                  width: "var(--fb-w)",
                  marginLeft: "calc(var(--fb-w) / -2)",
                  transform: `rotateY(${i * step}deg) translateZ(var(--fb-r))`,
                }}
              >
                <KitchenCard k={k} />
              </figure>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          className="min-h-11 rounded-full border border-[#0B2E1F] px-[18px] text-[15px] font-medium text-[#0B2E1F]"
        >
          {paused ? "Play" : "Pause"}
        </button>
        <p className="sr-only">Customers: {kitchens.map((k) => k.name).join(", ")}.</p>
      </div>
    </section>
  );
}
