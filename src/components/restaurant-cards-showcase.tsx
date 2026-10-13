"use client";

import { useCallback, useEffect, useState } from "react";
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

const ROTATE_MS = 4500;
const CARD_W = 290;
const CARD_H = 172;

// Card swap: how long it takes and how far apart the two cards fly before meeting
const SWAP_S = 0.9;
const SPREAD_X = 150;
const SPREAD_Y = 34;

// First-load starting points, one corner per card
const ENTRY_CORNERS = [
  { x: -260, y: -90, rotateZ: -25 }, // top-left
  { x: 260, y: 90, rotateZ: 25 }, // bottom-right
  { x: 260, y: -90, rotateZ: 20 }, // top-right
];

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

export default function RestaurantCardsShowcase() {
  const reduce = useReducedMotion();
  const { wallet, getMyWallet } = useWallet();
  const [voucherCard, setVoucherCard] = useState<IVoucherCard | null>(null);
  const [front, setFront] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!wallet) getMyWallet().catch(() => {});
    voucherService
      .getMyVoucherCard()
      .then((res) => setVoucherCard(res?.data ?? null))
      .catch(() => setVoucherCard(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Card that was in front before the last switch; it flies out to one corner while
  // the new front card flies out to the opposite corner, then they meet in the middle.
  const [leaving, setLeaving] = useState<number | null>(null);

  // Stagger only the first fly-in, not later hovers/swaps
  const [intro, setIntro] = useState(true);
  useEffect(() => {
    const id = setTimeout(() => setIntro(false), 1500);
    return () => clearTimeout(id);
  }, []);

  const goTo = useCallback((target: number) => {
    setFront((f) => {
      if (target === f) return f;
      setLeaving(f);
      return target;
    });
  }, []);

  const next = useCallback(() => {
    setFront((f) => {
      setLeaving(f);
      return (f + 1) % ORDER.length;
    });
  }, []);

  // Drop the keyframes once the swap is done so hover/re-renders don't replay it
  useEffect(() => {
    if (leaving === null) return;
    const id = setTimeout(() => setLeaving(null), SWAP_S * 1000 + 50);
    return () => clearTimeout(id);
  }, [leaving, front]);

  useEffect(() => {
    if (paused || reduce) return;
    const id = setInterval(next, ROTATE_MS);
    return () => clearInterval(id);
  }, [paused, reduce, next]);

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
      <div
        className="relative"
        style={{ width: CARD_W + 28, height: CARD_H + 14, perspective: 1200 }}
      >
        {ORDER.map((key, i) => {
          // 0 = front, 1 = middle, 2 = back
          const depth = (i - front + ORDER.length) % ORDER.length;
          const isFront = depth === 0;
          const rest = {
            x: depth * 14,
            y: depth * 7,
            rotateZ: depth * 2,
            zIndex: ORDER.length - depth,
          };

          const swapping = leaving !== null && !reduce;
          const isLeaving = swapping && i === leaving;
          const isEntering = swapping && isFront;

          // Leaving card exits to the top-left corner, entering card to the bottom-right,
          // then both slide back and meet in the middle with the new card on top.
          const position = isLeaving
            ? {
                x: [0, -SPREAD_X, rest.x],
                y: [0, -SPREAD_Y, rest.y],
                rotateZ: [0, -12, rest.rotateZ],
                zIndex: [ORDER.length, ORDER.length - 1, rest.zIndex],
              }
            : isEntering
              ? {
                  x: [14, SPREAD_X, 0],
                  y: [7, SPREAD_Y, 0],
                  rotateZ: [2, 12, 0],
                  zIndex: [ORDER.length - 1, ORDER.length, ORDER.length],
                }
              : rest;

          const corner = ENTRY_CORNERS[i % ENTRY_CORNERS.length];

          return (
            <motion.div
              key={key}
              className="absolute top-0 left-0 rounded-2xl shadow-xl"
              style={{ width: CARD_W, height: CARD_H, transformStyle: "preserve-3d" }}
              // On first load every card flies in from its own corner and meets in the stack
              initial={reduce ? false : { ...corner, opacity: 0, scale: 0.8 }}
              animate={{
                ...position,
                scale: 1 - depth * 0.06,
                rotateY: isFront ? 0 : -8,
                opacity: depth === 2 ? 0.75 : 1,
                filter: isFront ? "brightness(1)" : "brightness(0.85)",
              }}
              whileHover={isFront ? { y: -4, rotateX: 6, rotateY: -6, scale: 1.02 } : { x: rest.x + 6 }}
              transition={
                isLeaving || isEntering
                  ? { duration: SWAP_S, times: [0, 0.45, 1], ease: "easeInOut" }
                  : {
                      type: "spring",
                      stiffness: 260,
                      damping: 26,
                      delay: intro ? (ORDER.length - 1 - i) * 0.15 : 0,
                    }
              }
            >
              {isFront ? (
                <Link href={HREF[key]} aria-label={`Open ${LABEL[key]}`} className="block h-full w-full">
                  {renderFace(key, true)}
                </Link>
              ) : (
                <button
                  type="button"
                  aria-label={`Show ${LABEL[key]}`}
                  onClick={() => goTo(i)}
                  className="block h-full w-full text-left cursor-pointer"
                >
                  {renderFace(key, false)}
                </button>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Indicators */}
      <div className="flex items-center gap-2">
        {ORDER.map((key, i) => (
          <button
            key={key}
            type="button"
            aria-label={`Show ${LABEL[key]}`}
            onClick={() => goTo(i)}
            className="relative h-1.5 rounded-full bg-gray-300 overflow-hidden transition-all"
            style={{ width: i === front ? 28 : 8 }}
          >
            <AnimatePresence>
              {i === front && (
                <motion.span
                  key={`${front}-${paused}`}
                  className="absolute inset-y-0 left-0 bg-green-600 rounded-full"
                  initial={{ width: paused || reduce ? "100%" : "0%" }}
                  animate={{ width: "100%" }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: paused || reduce ? 0 : ROTATE_MS / 1000, ease: "linear" }}
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
