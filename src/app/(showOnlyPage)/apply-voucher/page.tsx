"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  FileCheck2,
  HandCoins,
  Loader2,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FOOD_BUNDLES_LOGO } from "@/components/food-bundles-card";

const VOUCHER_APPLY_PATH = "/restaurant/vouchers?apply=1";

const steps = [
  {
    icon: UserPlus,
    title: "Create your account",
    description: "Register your restaurant in a few minutes if you are new to Food Bundles.",
  },
  {
    icon: CreditCard,
    title: "Apply for a voucher card",
    description: "Complete your business details and request your permanent voucher card.",
  },
  {
    icon: FileCheck2,
    title: "Accept the terms",
    description: "Review and accept the card and financing terms and conditions.",
  },
  {
    icon: HandCoins,
    title: "Request financing",
    description: "Once your card is set up, request the credit you need from your voucher page.",
  },
];

export default function ApplyVoucherPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const hasToken = document.cookie
      .split(";")
      .some((cookie) => cookie.trim().startsWith("auth-token="));

    if (hasToken) {
      router.replace(VOUCHER_APPLY_PATH);
      return;
    }

    setChecking(false);
  }, [router]);

  if (checking) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-green-700" />
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] bg-linear-to-br from-green-50 via-white to-gray-50 px-4 py-10 sm:py-16">
      <div className="mx-auto grid max-w-5xl items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-green-200 bg-white px-3 py-1 text-xs font-semibold text-green-700">
            <CreditCard className="h-3.5 w-3.5" />
            Food Bundles voucher card
          </div>

          <h1 className="text-3xl font-bold leading-tight text-gray-900 sm:text-4xl">
            Get your voucher card and unlock financing for your restaurant.
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-gray-600 sm:text-base">
            Scan, register, apply for your card, accept the terms, and request the
            credit you need — all from one place.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button
              asChild
              variant="green"
              size="lg"
              className="h-11 rounded-full px-7 text-sm font-semibold"
            >
              <Link
                href={`/signup?role=restaurant&redirect=${encodeURIComponent(
                  VOUCHER_APPLY_PATH
                )}`}
              >
                Create account
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-11 rounded-full px-7 text-sm font-semibold"
            >
              <Link href={`/login?redirect=${encodeURIComponent(VOUCHER_APPLY_PATH)}`}>
                I already have an account
              </Link>
            </Button>
          </div>

          <div className="mt-8 space-y-3">
            {steps.map(({ icon: Icon, title, description }, index) => (
              <div key={title} className="flex gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {index + 1}. {title}
                  </p>
                  <p className="text-xs leading-relaxed text-gray-500">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-green-100 bg-white p-6 shadow-xl shadow-green-900/5 sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <Image
              src={FOOD_BUNDLES_LOGO}
              alt="Food Bundles"
              width={44}
              height={44}
              className="rounded-full bg-white object-cover"
              crossOrigin="anonymous"
            />
            <div>
              <p className="text-base font-bold text-green-800">FoodBundles</p>
              <p className="text-[10px] uppercase tracking-widest text-gray-400">
                Voucher application
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-gray-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              What you will need
            </p>
            <ul className="mt-3 space-y-2.5">
              {[
                "Your restaurant TIN number",
                "Owner full name and national ID",
                "A phone number for verification",
                "Your business location",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-5 text-center text-[11px] leading-relaxed text-gray-400">
            By continuing you agree to the Food Bundles Terms &amp; Conditions.
            Financing is subject to card approval and eligibility.
          </p>
        </div>
      </div>
    </div>
  );
}
