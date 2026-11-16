"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { useKigaliClock, useTick } from "./use-tick";

const CARDS = [
  { name: "Ubucuti Gorilla Lodge", num: "1234 •••• •••• 29", issued: "10/26/2026", grad: "linear-gradient(135deg, #0E9A63 0%, #147A42 55%, #0F5C36 100%)", grad2: "linear-gradient(135deg, #1F8A5C 0%, #145C3C 100%)" },
  { name: "Your Restaurant", num: "5521 •••• •••• 07", issued: "Member", grad: "linear-gradient(135deg, #1B4D36 0%, #0F3A27 55%, #0A2418 100%)", grad2: "linear-gradient(135deg, #1B4D36 0%, #0A2418 100%)" },
  { name: "Your School", num: "7709 •••• •••• 14", issued: "Member", grad: "linear-gradient(135deg, #12A08A 0%, #0E7A64 55%, #0A5A4A 100%)", grad2: "linear-gradient(135deg, #12A08A 0%, #0A5A4A 100%)" },
];
const SLOTS = [
  "translate(0, 0) rotate(0deg) scale(1)",
  "translate(-16%, -24%) rotate(-9deg) scale(0.86)",
  "translate(16%, -14%) rotate(8deg) scale(0.9)",
];
const BENEFITS = [
  ["Stock now, pay later", "Order the fresh supply your kitchen needs today and settle later on agreed terms."],
  ["Supply, not debt", "The card guarantees supply from our market — not a cash loan."],
  ["One card, our whole market", "Use it on every Food Bundles order, in the app or on the website."],
  ["Build your credit", "On-time repayment builds your kitchen’s credit record."],
];

function CardMark() {
  return (
    <span className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-[#00D048]">
      <svg width="16" height="16" viewBox="0 0 40 40" aria-hidden="true">
        <path d="M8 14h24l-2.5 16a3 3 0 0 1-3 2.5h-13a3 3 0 0 1-3-2.5z" fill="#FFFFFF" />
        <path d="M14 14a6 6 0 0 1 12 0" stroke="#FFFFFF" strokeWidth="3" fill="none" />
      </svg>
    </span>
  );
}

export function CardSection() {
  const [front, setFront] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [auto, setAuto] = useState(true);
  const [applyUrl, setApplyUrl] = useState("");
  const [aggregatorUrl, setAggregatorUrl] = useState("");

  useEffect(() => {
    setApplyUrl(process.env.NEXT_PUBLIC_VOUCHER_APPLY_URL || `${window.location.origin}/apply-voucher`);
    setAggregatorUrl(process.env.NEXT_PUBLIC_AGGREGATOR_APPLY_URL || `${window.location.origin}/become-aggregator`);
  }, []);

  useEffect(() => {
    if (!auto) return;
    const id = setInterval(() => {
      setFront((f) => (f + 1) % CARDS.length);
      setFlipped(false);
    }, 2800);
    return () => clearInterval(id);
  }, [auto]);

  return (
    <section id="card" className="bg-gradient-to-b from-white via-[#E8F6EC] via-[18%] to-[#E8F6EC] px-4 pb-24 pt-[88px] sm:px-8">
      <div id="voucher" className="mx-auto flex max-w-[1240px] flex-col gap-10">
        <div className="flex max-w-[980px] flex-col gap-4">
          <span className="self-start rounded-full bg-[#0B2E1F] px-4 py-2 text-[15px] font-bold tracking-[2px] text-[#00D048]">
            INVENTORY FINANCING
          </span>
          <h2 className="fb-display m-0 text-[clamp(44px,7vw,100px)] font-bold leading-[0.95] tracking-[-3px]">
            Stock today.
            <br />
            <span className="text-[#00A43A]">Pay later.</span>
          </h2>
          <p className="fb-display m-0 text-[clamp(20px,2vw,26px)] font-medium leading-snug text-[#1F5A3C]">
            The Food Bundles Card — credit for your kitchen’s inventory, built for restaurants, hotels and schools.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-10">
          <div className="flex min-w-0 flex-[1_1_500px] flex-col items-center gap-5">
            <div className="box-content w-full max-w-[480px] px-8 pb-5 pt-20 [perspective:1400px] sm:px-14">
              <div className="relative aspect-[1.586] w-full">
                {CARDS.map((c, i) => {
                  const slot = (i - front + CARDS.length) % CARDS.length;
                  const showBack = slot === 0 && flipped;
                  return (
                    <div
                      key={c.name}
                      className="absolute inset-0 transition-[transform,filter] duration-[1100ms] ease-[cubic-bezier(.45,.05,.25,1)]"
                      style={{ zIndex: 3 - slot, transform: SLOTS[slot], filter: slot === 0 ? "none" : "brightness(0.85)" }}
                    >
                      <button
                        type="button"
                        aria-label={slot === 0 ? `Food Bundles Card for ${c.name}: show ${showBack ? "front" : "back"}` : `Show the card for ${c.name}`}
                        onClick={() => {
                          setAuto(false);
                          if (slot === 0) setFlipped((f) => !f);
                          else { setFront(i); setFlipped(false); }
                        }}
                        className="absolute inset-0 cursor-pointer rounded-[20px] border-0 bg-transparent p-0 text-left transition-transform duration-[900ms] ease-[cubic-bezier(.3,.7,.2,1)] [transform-style:preserve-3d]"
                        style={{ transform: showBack ? "rotateY(180deg)" : "rotateY(0deg)" }}
                      >
                        <span
                          className="absolute inset-0 flex flex-col justify-between overflow-hidden rounded-[20px] px-6 py-[22px] text-white shadow-[0_50px_90px_-30px_#0B2E1F99] [backface-visibility:hidden]"
                          style={{ background: c.grad }}
                        >
                          <span aria-hidden="true" className="absolute -right-[60px] -top-[70px] h-60 w-60 rounded-full bg-white/[0.08]" />
                          <span aria-hidden="true" className="absolute -bottom-[90px] -left-[50px] h-[220px] w-[220px] rounded-full bg-white/[0.07]" />
                          <span className="relative flex items-start justify-between">
                            <span className="flex items-center gap-2.5">
                              <CardMark />
                              <span className="flex flex-col gap-0.5">
                                <span className="text-[13px] tracking-[4px]">FOODBUNDLES CARD</span>
                                <span className="text-[10px] text-[#CFEAD9]">Your Supply, Always Secured</span>
                              </span>
                            </span>
                            <span className="flex items-center gap-2.5">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#CFEAD9" strokeWidth="2" aria-hidden="true">
                                <path d="M8 8a6 6 0 0 1 0 8M12 5a10 10 0 0 1 0 14M4 10.5a2.5 2.5 0 0 1 0 3" />
                              </svg>
                              <span className="flex h-[34px] w-11 items-center justify-center rounded-[7px] bg-[#F2D54A]">
                                <span className="h-5 w-[26px] rounded border-[1.5px] border-[#C9A92A]" />
                              </span>
                            </span>
                          </span>
                          <span className="fb-display relative text-[clamp(16px,2.2vw,24px)] font-semibold tracking-[4px]">{c.num}</span>
                          <span className="relative flex items-end justify-between gap-3">
                            <span className="flex flex-col gap-[3px]">
                              <span className="text-[10px] tracking-[1.5px] text-[#CFEAD9]">CARD HOLDER</span>
                              <span className="text-base font-bold">{c.name}</span>
                            </span>
                            <span className="flex flex-col gap-[3px] text-right">
                              <span className="text-[10px] tracking-[1.5px] text-[#CFEAD9]">ISSUED</span>
                              <span className="text-[15px] font-bold">{c.issued}</span>
                            </span>
                          </span>
                        </span>
                        <span
                          className="absolute inset-0 flex flex-col overflow-hidden rounded-[20px] text-white shadow-[0_50px_90px_-30px_#0B2E1F99] [backface-visibility:hidden] [transform:rotateY(180deg)]"
                          style={{ background: c.grad2 }}
                        >
                          <span className="mt-[7%] h-[18%] bg-[#06140E]" />
                          <span className="flex flex-1 flex-col justify-between gap-2 px-6 pb-5 pt-3.5 text-center">
                            <span className="text-[clamp(13px,1.6vw,16px)] font-bold leading-tight">Backed by Food Bundles. Trusted Across Our Market.</span>
                            <span className="text-[11px] text-[#CFEAD9]">This card guarantees supply, not debt. Use it to grow.</span>
                            <span className="flex items-center justify-between rounded-[10px] bg-[#F4EFE6] px-3 py-2.5 text-left text-[#0B2E1F]">
                              <span className="flex items-center gap-2">
                                <CardMark />
                                <span className="text-xs font-bold">sales@food.rw</span>
                              </span>
                              <span className="flex flex-col items-center rounded-md bg-white px-2.5 py-1">
                                <span className="text-[8px] text-[#4A6358]">CVV</span>
                                <span className="text-sm font-bold tracking-[2px]">•••</span>
                              </span>
                            </span>
                          </span>
                        </span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
            <button
              type="button"
              onClick={() => { setFlipped((f) => !f); setAuto(false); }}
              className="min-h-11 rounded-full border border-[#C5D1C6] bg-white px-[18px] text-[15px] text-[#0B2E1F]"
            >
              {flipped ? "Show front" : "Show back"}
            </button>
          </div>

          <div className="flex min-w-0 flex-[1_1_480px] flex-col gap-[22px]">
            <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3.5">
              {BENEFITS.map(([title, text], i) => (
                <div key={title} className="fb-lift flex flex-col gap-2.5 rounded-[18px] bg-white p-[22px] shadow-[0_20px_40px_-24px_#0B2E1F40]">
                  <span className="fb-display text-[15px] font-bold text-[#00A43A]">0{i + 1}</span>
                  <span className="fb-display text-[22px] font-bold tracking-[-0.4px]">{title}</span>
                  <span className="text-base leading-normal text-[#4A6358]">{text}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-5 rounded-[18px] bg-white p-5 shadow-[0_20px_40px_-24px_#0B2E1F40]">
              <div className="rounded-xl border border-[#DCE6DF] p-2">
                {applyUrl ? (
                  <QRCode value={applyUrl} size={104} level="M" fgColor="#0B2E1F" aria-label="QR code to apply for the Food Bundles Card" />
                ) : (
                  <div className="h-[104px] w-[104px] animate-pulse rounded bg-[#EFF4F1]" />
                )}
              </div>
              <div className="flex min-w-[200px] flex-1 flex-col gap-3">
                <span className="text-[15px] leading-snug text-[#4A6358]">
                  Scan with your phone camera, or apply here. Create an account, accept the terms and request financing.
                </span>
                <Link href="/apply-voucher" className="fb-arrow inline-flex min-h-[52px] items-center gap-1 self-start rounded-full bg-[#0B2E1F] px-7 text-lg font-bold text-white">
                  Apply for the card <span className="fb-chev">›</span>
                </Link>
              </div>
            </div>
            <div id="aggregator" className="flex flex-wrap items-center gap-5 rounded-[18px] bg-white p-5 shadow-[0_20px_40px_-24px_#0B2E1F40]">
              <div className="rounded-xl border border-[#DCE6DF] p-2">
                {aggregatorUrl ? (
                  <QRCode value={aggregatorUrl} size={104} level="M" fgColor="#007A35" aria-label="QR code to become a Food Bundles aggregator" />
                ) : (
                  <div className="h-[104px] w-[104px] animate-pulse rounded bg-[#EFF4F1]" />
                )}
              </div>
              <div className="flex min-w-[200px] flex-1 flex-col gap-2">
                <span className="text-[13px] font-bold uppercase tracking-[1px] text-[#00A43A]">Become an aggregator · Ba umukusanyi</span>
                <span className="text-[15px] leading-snug text-[#4A6358]">
                  Live near farmers? Collect produce for Food Bundles and earn 4% to 7% commission. Scan to log in or apply.
                </span>
                <Link href="/become-aggregator" className="fb-arrow inline-flex min-h-[48px] items-center gap-1 self-start rounded-full bg-[#00A43A] px-6 text-[17px] font-bold text-white hover:bg-[#007A35]">
                  Become an aggregator <span className="fb-chev">›</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function FoodCourts() {
  const t = useTick(1000);
  const clock = useKigaliClock();
  const live = Math.floor(t / 2) % 8;

  return (
    <section id="foodcourts" className="mx-auto max-w-[1180px] px-4 pt-[72px] sm:px-8">
      <div className="relative aspect-[1300/731] w-full overflow-hidden rounded-3xl bg-[#DCE6DF]">
        <Image
          src="/home/inzovu-mall.jpg"
          alt="Inzovu Mall, home of a Food Bundles–managed food court"
          fill
          sizes="(max-width: 1180px) 100vw, 1180px"
          className="object-cover"
        />
      </div>
      <div className="relative mx-2 -mt-16 flex flex-wrap items-stretch gap-5 sm:mx-7 sm:-mt-[110px]">
        <div className="flex min-w-0 flex-[1_1_400px] flex-col gap-3.5 rounded-[20px] bg-white p-6 shadow-[0_40px_80px_-24px_#0B2E1F59] sm:p-8">
          <span className="text-base font-bold text-[#00A43A]">Food court management</span>
          <h2 className="fb-display m-0 text-[clamp(32px,4vw,50px)] font-bold leading-[1.05] tracking-[-1.2px] text-[#007A35]">
            Our food courts are the proof.
          </h2>
          <p className="m-0 text-lg leading-relaxed text-[#1F5A3C]">
            We manage food courts to show what our distribution infrastructure can do — many kitchens, one engine,
            fresh supply every morning.
          </p>
        </div>
        <div className="flex min-w-0 flex-[1_1_440px] flex-col gap-[18px] rounded-[20px] bg-white p-6 shadow-[0_40px_80px_-24px_#0B2E1F59]" aria-hidden="true">
          <div className="flex justify-between text-sm text-[#4A6358]">
            <span className="font-bold text-[#007A35]">Food court · live</span>
            <span>Kigali {clock}</span>
          </div>
          <div className="relative h-10">
            <span className="absolute inset-x-0 top-[19px] h-0.5 bg-[repeating-linear-gradient(90deg,#A9D9B9_0_8px,transparent_8px_16px)]" />
            <span className="fb-go absolute top-0.5 flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#0B2E1F]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00D048" strokeWidth="2">
                <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7" />
                <circle cx="7" cy="17.5" r="1.6" />
                <circle cx="17" cy="17.5" r="1.6" />
              </svg>
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {Array.from({ length: 8 }, (_, i) => {
              const on = i === live;
              return (
                <div
                  key={i}
                  className="flex min-h-[76px] flex-col justify-between rounded-xl px-3 py-3.5 transition-colors duration-500"
                  style={{ background: on ? "#00A43A" : "#F6F9F7", color: on ? "#FFFFFF" : "#0B2E1F" }}
                >
                  <span className="text-[13px] font-bold">Kitchen {i + 1}</span>
                  <span className="text-xs">{on ? "Delivery received" : "Stocked"}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

// Store links for the mobile apps. Leave empty until the app is published:
// the badge then reads "Coming soon" instead of linking nowhere.
const APP_LINKS = {
  buyer: { appStore: "", googlePlay: "" },
  farmer: { appStore: "", googlePlay: "" },
};

function StoreBadge({ label, href }: { label: string; href: string }) {
  if (!href) {
    return (
      <span className="rounded-[10px] border border-dashed border-[#C5D1C6] px-[18px] py-3 text-sm font-bold text-[#4A6358]">
        {label} · coming soon
      </span>
    );
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="rounded-[10px] bg-[#0B2E1F] px-[18px] py-3 text-sm font-bold text-white">
      {label}
    </a>
  );
}

export function AppsAndCta() {
  return (
    <>
      <section id="apps" className="mx-auto grid max-w-[1180px] grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-5 px-4 py-[72px] sm:px-8">
        <article className="fb-lift flex flex-col gap-3.5 rounded-2xl border border-[#DCE6DF] p-8">
          <span className="text-[15px] font-bold text-[#007A35]">For restaurants, hotels &amp; schools</span>
          <h3 className="fb-display m-0 text-[30px] font-bold tracking-[-0.6px]">Food Bundles Buyer app</h3>
          <p className="m-0 text-base leading-normal text-[#4A6358]">Order, track and trace every delivery.</p>
          <div className="flex flex-wrap gap-2.5 pt-1.5">
            <Link href="/shop" className="rounded-[10px] bg-[#00A43A] px-[18px] py-3 text-sm font-bold text-white">
              Order on the web
            </Link>
            <StoreBadge label="App Store" href={APP_LINKS.buyer.appStore} />
            <StoreBadge label="Google Play" href={APP_LINKS.buyer.googlePlay} />
          </div>
        </article>
        <article className="fb-lift flex flex-col gap-3.5 rounded-2xl border border-[#DCE6DF] p-8">
          <span className="text-[15px] font-bold text-[#007A35]">For farmers &amp; cooperatives</span>
          <h3 className="fb-display m-0 text-[30px] font-bold tracking-[-0.6px]">Farmer Partner app</h3>
          <p className="m-0 text-base leading-normal text-[#4A6358]">Post your harvest, accept offers and get paid by MoMo.</p>
          <div className="flex flex-wrap gap-2.5 pt-1.5">
            <Link href="/signup?role=farmer" className="rounded-[10px] bg-[#00A43A] px-[18px] py-3 text-sm font-bold text-white">
              Join as a farmer
            </Link>
            <StoreBadge label="App Store" href={APP_LINKS.farmer.appStore} />
            <StoreBadge label="Google Play" href={APP_LINKS.farmer.googlePlay} />
          </div>
        </article>
      </section>

      <section className="mx-auto max-w-[1180px] px-4 pb-24 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-7 rounded-[20px] bg-[#F6F9F7] px-6 py-12 sm:px-12 sm:py-14">
          <div className="flex max-w-[560px] flex-col gap-2.5">
            <h2 className="fb-display m-0 text-[clamp(30px,3.5vw,44px)] font-bold leading-[1.05] tracking-[-1px]">Ready to join the market?</h2>
            <p className="m-0 text-[17px] text-[#4A6358]">Every member is verified. Applying takes about three minutes.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/signup" className="fb-arrow inline-flex min-h-[52px] items-center gap-1 rounded-full bg-[#0B2E1F] px-7 text-[17px] font-bold text-white">
              Apply for access <span className="fb-chev">›</span>
            </Link>
            <Link href="/support" className="inline-flex min-h-[52px] items-center rounded-full border border-[#0B2E1F] px-7 text-[17px] font-bold text-[#0B2E1F]">
              Talk to us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

// Floating contact pill: replaces the old floating WhatsApp / AI buttons.
export function ContactPill() {
  return (
    <div className="fixed bottom-4 right-4 z-40 print:hidden flex items-center gap-2 rounded-full bg-white py-1.5 pl-3.5 pr-1.5 text-[#0B2E1F] shadow-[0_16px_40px_-12px_#0B2E1F80]">
      <Image src="/home/food-bundles-logo.png" alt="" width={30} height={28} className="hidden h-7 w-auto sm:block" />
      <span className="whitespace-nowrap text-sm font-bold text-[#007A35]">Contact us</span>
      <button
        type="button"
        onClick={() => window.chatbase?.("open")}
        aria-label="Ask our AI agent"
        title="Ask our AI agent"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-[#00A43A]"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 5h16v11H9l-5 4z" />
          <path d="M8 10h.01M12 10h.01M16 10h.01" />
        </svg>
      </button>
      <a
        href="mailto:sales@food.rw"
        aria-label="Email sales@food.rw"
        title="sales@food.rw"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0B2E1F]"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M3 7l9 6 9-6" />
        </svg>
      </a>
      <a
        href="https://wa.me/250796897823"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Food Bundles on WhatsApp"
        title="WhatsApp 0796 897 823"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366]"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 20l1.4-4.2A8 8 0 1 1 8.4 18.8z" />
          <path d="M9.2 8.6c.2-.4.5-.4.7-.4h.5c.2 0 .4.1.5.4l.6 1.4c.1.2 0 .4-.1.6l-.4.5c.5 1 1.3 1.8 2.3 2.3l.5-.4c.2-.1.4-.2.6-.1l1.4.6c.3.1.4.3.4.5v.5c0 .2 0 .5-.4.7-.5.3-1.4.4-2.5-.1a8 8 0 0 1-4.2-4.2c-.5-1.1-.4-2-.1-2.5z" fill="#FFFFFF" stroke="none" />
        </svg>
      </a>
    </div>
  );
}
