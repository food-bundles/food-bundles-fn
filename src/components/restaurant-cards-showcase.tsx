"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import { ArrowRight, Crown, Sparkles, Wallet as WalletIcon } from "lucide-react";
import { useWallet } from "@/app/contexts/WalletContext";
import { voucherService } from "@/app/services/voucherService";
import { CardStatus, IVoucherCard } from "@/lib/types";

const FOOD_BUNDLES_LOGO =
  "https://res.cloudinary.com/dzxyelclu/image/upload/v1760111270/Food_bundle_logo_cfsnsw.png";

const ROTATE_MS = 2800;
const CARD_W = 290;
const CARD_H = 172;

type CardKey = "voucher" | "wallet" | "subscribe";
const ORDER: CardKey[] = ["voucher", "wallet", "subscribe"];

// ─── Shared bits ──────────────────────────────────────────────────────────────
function AnimatedAmount({ value }: { value: number }) {
  const spring = useSpring(0, { stiffness: 60, damping: 18 });
  const text = useTransform(spring, (v) => Math.round(v).toLocaleString());

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return <motion.span>{text}</motion.span>;
}

function Shine({ active }: { active: boolean }) {
  const reduce = useReducedMotion();
  if (!active || reduce) return null;
  return (
    <motion.div
      className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 bg-linear-to-r from-transparent via-white/25 to-transparent skew-x-[-20deg]"
      initial={{ x: "0%" }}
      animate={{ x: "350%" }}
      transition={{ duration: 1.6, ease: "easeInOut", repeat: Infinity, repeatDelay: 2.4 }}
    />
  );
}

function Chip() {
  return (
    <div className="w-8 h-6 rounded bg-yellow-300/90 flex items-center justify-center">
      <div className="w-5 h-4 rounded-sm border border-yellow-600/40 grid grid-cols-2 gap-px p-0.5">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-yellow-600/50 rounded-sm" />
        ))}
      </div>
    </div>
  );
}

// ─── Card faces ───────────────────────────────────────────────────────────────
function VoucherFace({ card, active }: { card: IVoucherCard | null; active: boolean }) {
  const last4 = card?.pan?.slice(-4) ?? "••••";
  const available = card ? Math.max(0, (card.loanLimit ?? 0) - (card.totalOutstandingLoans ?? 0)) : 0;
  const inactive = card && card.status !== CardStatus.ACTIVE;

  return (
    <div className="relative h-full w-full rounded-2xl bg-linear-to-br from-emerald-600 to-green-800 text-white overflow-hidden">
      <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-white/10" />
      <div className="absolute -bottom-10 -left-8 w-28 h-28 rounded-full bg-white/10" />
      <Shine active={active} />

      <div className="absolute top-3.5 left-4 right-4 flex justify-between items-start">
        <div className="flex items-center gap-2">
          <Image
            src={FOOD_BUNDLES_LOGO}
            alt="Food Bundles"
            width={18}
            height={18}
            className="rounded-full bg-white object-cover"
          />
          <div>
            <p className="text-[9px] uppercase tracking-widest leading-none">Voucher Card</p>
            <p className="text-[7px] text-white/60 leading-none mt-1">Your Supply, Always Secured</p>
          </div>
        </div>
        <Chip />
      </div>

      <p className="absolute left-4 top-[46%] font-mono text-[14px] tracking-[0.2em] font-semibold drop-shadow">
        •••• •••• •••• {last4}
      </p>

      <div className="absolute bottom-3.5 left-4 right-4 flex justify-between items-end">
        {card ? (
          <div>
            <p className="text-[8px] uppercase text-white/60">Available limit</p>
            <p className="text-[13px] font-bold">
              <AnimatedAmount value={available} /> <span className="text-[9px] font-normal">RWF</span>
            </p>
          </div>
        ) : (
          <p className="text-[11px] font-semibold">Get your card & buy now, pay later</p>
        )}
        <span className="flex items-center gap-1 text-[10px] font-semibold bg-white/15 rounded-full px-2 py-0.5">
          {card ? "Open" : "Apply"} <ArrowRight className="w-3 h-3" />
        </span>
      </div>

      {inactive && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="bg-black/40 text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-widest -rotate-12">
            {card.status}
          </span>
        </div>
      )}
    </div>
  );
}

function WalletFace({
  balance,
  currency,
  hasWallet,
  active,
}: {
  balance: number;
  currency: string;
  hasWallet: boolean;
  active: boolean;
}) {
  return (
    <div className="relative h-full w-full rounded-2xl bg-linear-to-br from-slate-800 via-slate-900 to-black text-white overflow-hidden border border-white/10">
      <div className="absolute -top-16 -left-10 w-44 h-44 rounded-full bg-amber-400/20 blur-2xl" />
      <div className="absolute -bottom-16 -right-10 w-44 h-44 rounded-full bg-emerald-400/20 blur-2xl" />
      <Shine active={active} />

      <div className="absolute top-3.5 left-4 right-4 flex justify-between items-center">
        <div className="flex items-center gap-1.5">
          <WalletIcon className="w-4 h-4 text-amber-300" />
          <p className="text-[9px] uppercase tracking-widest">FoodBundles Wallet</p>
        </div>
        <span className="text-[8px] uppercase tracking-wider text-white/50">Prepaid</span>
      </div>

      <div className="absolute left-4 right-4 top-[38%]">
        <p className="text-[8px] uppercase text-white/50">{hasWallet ? "Balance" : "No wallet yet"}</p>
        <p className="text-[22px] font-bold leading-tight bg-linear-to-r from-amber-200 to-yellow-400 bg-clip-text text-transparent">
          {hasWallet ? <AnimatedAmount value={balance} /> : "Create one"}{" "}
          {hasWallet && <span className="text-[11px] font-medium">{currency}</span>}
        </p>
      </div>

      <div className="absolute bottom-3.5 left-4 right-4 flex justify-between items-end">
        <p className="text-[10px] text-white/60">Pay orders instantly from your balance</p>
        <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-900 bg-amber-300 rounded-full px-2 py-0.5 shrink-0">
          {hasWallet ? "Top up" : "Start"} <ArrowRight className="w-3 h-3" />
        </span>
      </div>
    </div>
  );
}

function SubscribeFace({ active }: { active: boolean }) {
  return (
    <div className="relative h-full w-full rounded-2xl bg-linear-to-br from-yellow-300 via-amber-400 to-orange-500 text-gray-900 overflow-hidden">
      <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-white/25" />
      <Shine active={active} />

      <div className="absolute top-3.5 left-4 right-4 flex justify-between items-center">
        <div className="flex items-center gap-1.5">
          <Crown className="w-4 h-4" />
          <p className="text-[9px] uppercase tracking-widest font-semibold">Premium Membership</p>
        </div>
        <Sparkles className="w-4 h-4" />
      </div>

      <ul className="absolute left-4 top-[34%] space-y-0.5 text-[11px] font-medium">
        <li>✓ Free Delivery</li>
        <li>✓ EBM Orders</li>
        <li>✓ Advertisement & more</li>
      </ul>

      <div className="absolute bottom-3.5 left-4 right-4 flex justify-between items-end">
        <p className="text-[10px] font-semibold text-gray-800">Join 20+ restaurants</p>
        <span className="flex items-center gap-1 text-[10px] font-bold text-white bg-gray-900 rounded-full px-2.5 py-0.5">
          Subscribe <ArrowRight className="w-3 h-3" />
        </span>
      </div>
    </div>
  );
}

// ─── Deck ─────────────────────────────────────────────────────────────────────
// Same motion as the home page's Food Bundles Card stack: the cards rest at
// angles behind each other, rotate on a timer, and the front one flips over.
const HREF: Record<CardKey, string> = {
  voucher: "/restaurant/vouchers",
  wallet: "/restaurant/wallet",
  subscribe: "/restaurant/subscribe",
};

const LABEL: Record<CardKey, string> = {
  voucher: "Voucher card",
  wallet: "Wallet",
  subscribe: "Subscription",
};

// Resting place of each card: front, back-left, back-right (offsets kept small
// so the stack stays the size of one card plus a little room)
const SLOTS = [
  "translate(0, 0) rotate(0deg) scale(1)",
  "translate(-11%, -15%) rotate(-8deg) scale(0.88)",
  "translate(11%, -9%) rotate(7deg) scale(0.92)",
];

const BACK: Record<CardKey, { title: string; text: string; bg: string }> = {
  voucher: {
    title: "Backed by Food Bundles. Trusted across our market.",
    text: "This card guarantees supply, not debt.",
    bg: "linear-gradient(135deg, #1F8A5C 0%, #145C3C 100%)",
  },
  wallet: {
    title: "Top up once, pay every order instantly.",
    text: "Your balance works on the web and in the app.",
    bg: "linear-gradient(135deg, #1E293B 0%, #020617 100%)",
  },
  subscribe: {
    title: "Free delivery, EBM orders and more.",
    text: "Join 20+ restaurants on Premium.",
    bg: "linear-gradient(135deg, #B45309 0%, #78350F 100%)",
  },
};

function BackFace({ k, onFlip }: { k: CardKey; onFlip: () => void }) {
  const b = BACK[k];
  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden rounded-2xl text-white" style={{ background: b.bg }}>
      <span className="mt-[7%] h-[17%] shrink-0 bg-black/70" />
      <div className="flex flex-1 flex-col justify-between gap-1.5 px-4 pb-3 pt-2.5 text-center">
        <p className="text-[12px] font-bold leading-tight">{b.title}</p>
        <p className="text-[10px] text-white/75">{b.text}</p>
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onFlip}
            className="rounded-full px-2 py-1 text-[10px] font-semibold text-white/80 hover:text-white cursor-pointer"
          >
            Show front
          </button>
          <Link
            href={HREF[k]}
            className="flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[11px] font-bold text-gray-900 hover:bg-white/90"
          >
            Open {LABEL[k].toLowerCase()} <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RestaurantCardsShowcase() {
  const reduce = useReducedMotion();
  const { wallet, getMyWallet } = useWallet();
  const [voucherCard, setVoucherCard] = useState<IVoucherCard | null>(null);
  const [front, setFront] = useState(0);
  const [flipped, setFlipped] = useState(false);
  // Rotation stops for good once someone picks or flips a card, and pauses on hover
  const [auto, setAuto] = useState(true);
  const [paused, setPaused] = useState(false);
  const running = auto && !paused && !reduce;

  useEffect(() => {
    if (!wallet) getMyWallet().catch(() => {});
    voucherService
      .getMyVoucherCard()
      .then((res) => setVoucherCard(res?.data ?? null))
      .catch(() => setVoucherCard(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setFront((f) => (f + 1) % ORDER.length);
      setFlipped(false);
    }, ROTATE_MS);
    return () => clearInterval(id);
  }, [running]);

  const goTo = (target: number) => {
    setAuto(false);
    setFlipped(false);
    setFront(target);
  };

  const renderFace = (key: CardKey, active: boolean) => {
    switch (key) {
      case "voucher":
        return <VoucherFace card={voucherCard} active={active} />;
      case "wallet":
        return (
          <WalletFace
            balance={wallet?.balance ?? 0}
            currency={wallet?.currency ?? "RWF"}
            hasWallet={!!wallet}
            active={active}
          />
        );
      case "subscribe":
        return <SubscribeFace active={active} />;
    }
  };

  return (
    <div
      className="flex flex-col items-center gap-2 shrink-0"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="px-9 pt-8" style={{ perspective: 1400 }}>
        <div className="relative" style={{ width: CARD_W, height: CARD_H }}>
          {ORDER.map((key, i) => {
            // 0 = front, 1 = back-left, 2 = back-right
            const slot = (i - front + ORDER.length) % ORDER.length;
            const isFront = slot === 0;
            const showBack = isFront && flipped;
            return (
              <div
                key={key}
                className="absolute inset-0 transition-[transform,filter] duration-[1100ms] ease-[cubic-bezier(.45,.05,.25,1)]"
                style={{
                  zIndex: ORDER.length - slot,
                  transform: SLOTS[slot],
                  filter: isFront ? "none" : "brightness(0.85)",
                }}
              >
                <div
                  className="absolute inset-0 transition-transform duration-[900ms] ease-[cubic-bezier(.3,.7,.2,1)] [transform-style:preserve-3d]"
                  style={{ transform: showBack ? "rotateY(180deg)" : "rotateY(0deg)" }}
                >
                  <button
                    type="button"
                    inert={showBack}
                    aria-label={isFront ? `${LABEL[key]}: show back` : `Show ${LABEL[key]}`}
                    onClick={() => {
                      if (isFront) {
                        setAuto(false);
                        setFlipped(true);
                      } else goTo(i);
                    }}
                    className="absolute inset-0 block cursor-pointer rounded-2xl text-left shadow-xl [backface-visibility:hidden]"
                  >
                    {renderFace(key, isFront)}
                  </button>
                  <div
                    inert={!showBack}
                    className="absolute inset-0 rounded-2xl shadow-xl [backface-visibility:hidden] [transform:rotateY(180deg)]"
                  >
                    <BackFace k={key} onFlip={() => setFlipped(false)} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Indicators */}
      <div className="flex items-center gap-2">
        {ORDER.map((key, i) => (
          <button
            key={key}
            type="button"
            aria-label={`Show ${LABEL[key]}`}
            aria-current={i === front}
            onClick={() => goTo(i)}
            className="relative h-1.5 rounded-full bg-gray-300 overflow-hidden transition-all"
            style={{ width: i === front ? 28 : 8 }}
          >
            <AnimatePresence>
              {i === front && (
                <motion.span
                  key={`${front}-${running}`}
                  className="absolute inset-y-0 left-0 bg-green-600 rounded-full"
                  initial={{ width: running ? "0%" : "100%" }}
                  animate={{ width: "100%" }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: running ? ROTATE_MS / 1000 : 0, ease: "linear" }}
                />
              )}
            </AnimatePresence>
          </button>
        ))}
        <span className="ml-1 text-[11px] text-gray-500 font-medium w-20">{LABEL[ORDER[front]]}</span>
      </div>
    </div>
  );
}
