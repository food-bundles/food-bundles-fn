"use client";

import React, { useState } from "react";
import { BookOpen, Bot, Clock, Headphones, MessageCircle, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { TicketForm, type SupportAudience } from "./ticket-form";
import { SupportAIChat } from "./support-ai-chat";
import { SupportFAQ } from "./support-faq";
import { faqData } from "@/data/faqData";

/** The support line, shown as tappable call and WhatsApp links */
export const SUPPORT_PHONE = { display: "+250 788 963 267", tel: "+250788963267", whatsapp: "250788963267" };

const FARMER_FAQ: Record<string, string> = {
  "How do I sell my harvest?":
    "Open Submit Product (or Sell this crop on Wanted & Prices), choose the crop, the quantity and your price, and send it. Food Bundles checks it and answers with a price.",
  "When and how do I get paid?":
    "Once your harvest is weighed and approved, you are paid by Mobile Money (MoMo) to the number on your account, or in cash at the site. You get an SMS when the money is sent. Sales report shows every payment.",
  "Food Bundles offered a different price. What do I do?":
    "Open the harvest in Submissions. You can accept the offer, refuse it, or propose your own price before the deadline shown.",
  "Where do I bring my harvest?":
    "To your aggregation site. Profile shows the site, how far it is, and the aggregators there with their phone numbers. Each harvest also shows the aggregator who receives it.",
  "How do I see what buyers need?":
    "Choose the crops you grow in Profile → My crops. Wanted & Prices then shows what buyers need for them and what Food Bundles pays.",
  "How do I change the language of my SMS?":
    "Open Settings and choose Kinyarwanda, English or Français under Language for SMS and messages.",
};

const AI_QUESTIONS: Record<SupportAudience, string[]> = {
  farmer: [
    "When will I be paid for my harvest?",
    "How do I change my price?",
    "Where do I bring my harvest?",
    "How do I choose my crops?",
  ],
  general: [
    "How do I place an order?",
    "What payment methods do you accept?",
    "How can I track my deliveries?",
    "What is your refund policy?",
  ],
};

type Section = "ticket" | "faq" | "ai";

const SECTIONS: { id: Section; label: string; hint: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "ticket", label: "Send us a message", hint: "Our team answers within 24 h", icon: Headphones },
  { id: "faq", label: "Common questions", hint: "Quick answers", icon: BookOpen },
  { id: "ai", label: "AI assistant", hint: "Instant answers, any time", icon: Bot },
];

/** Ways to reach a person right now */
export function SupportContactCards({ tone = "light" }: { tone?: "light" | "dark" }) {
  const dark = tone === "dark";
  const card = cn(
    "flex items-center gap-3 rounded-xl px-4 py-3 transition-colors",
    dark ? "bg-white/10 text-white hover:bg-white/20" : "border border-gray-200 bg-white hover:border-green-300 hover:bg-green-50"
  );
  const iconBox = cn(
    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
    dark ? "bg-white/15" : "bg-green-100 text-green-700"
  );
  const sub = cn("text-xs", dark ? "text-green-100" : "text-gray-500");
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <a href={`tel:${SUPPORT_PHONE.tel}`} className={card}>
        <span className={iconBox}>
          <Phone className="h-5 w-5" />
        </span>
        <span>
          <span className="block text-sm font-semibold">Call us</span>
          <span className={sub}>{SUPPORT_PHONE.display}</span>
        </span>
      </a>
      <a href={`https://wa.me/${SUPPORT_PHONE.whatsapp}`} target="_blank" rel="noopener noreferrer" className={card}>
        <span className={iconBox}>
          <MessageCircle className="h-5 w-5" />
        </span>
        <span>
          <span className="block text-sm font-semibold">WhatsApp</span>
          <span className={sub}>Chat with our team</span>
        </span>
      </a>
      <div className={cn(card, "cursor-default", dark ? "hover:bg-white/10" : "hover:border-gray-200 hover:bg-white")}>
        <span className={iconBox}>
          <Clock className="h-5 w-5" />
        </span>
        <span>
          <span className="block text-sm font-semibold">Mon – Sat, 8:00 – 18:00</span>
          <span className={sub}>Messages answered within 24 h</span>
        </span>
      </div>
    </div>
  );
}

interface SupportCenterProps {
  audience?: SupportAudience;
  defaults?: { name?: string; phone?: string; email?: string };
}

/** Message form, common questions and the AI assistant, as tabs */
export function SupportCenter({ audience = "general", defaults }: SupportCenterProps) {
  const [section, setSection] = useState<Section>("ticket");
  const faq = audience === "farmer" ? FARMER_FAQ : (faqData as Record<string, string>);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-2 rounded-2xl bg-gray-100 p-1.5" role="tablist" aria-label="Ways to get help">
        {SECTIONS.map(({ id, label, hint, icon: Icon }) => {
          const on = section === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              id={`support-tab-${id}`}
              aria-selected={on}
              aria-controls="support-panel"
              onClick={() => setSection(id)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl px-2 py-2.5 text-center transition-all sm:flex-row sm:gap-3 sm:px-4 sm:text-left",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500",
                on ? "bg-white shadow-sm" : "text-gray-600 hover:bg-white/60"
              )}
            >
              <span
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                  on ? "bg-green-600 text-white" : "bg-white text-gray-500"
                )}
              >
                <Icon className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className={cn("block text-xs font-semibold sm:text-sm", on ? "text-gray-900" : "text-gray-700")}>
                  {label}
                </span>
                <span className="hidden text-xs text-gray-500 sm:block">{hint}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div
        id="support-panel"
        role="tabpanel"
        aria-labelledby={`support-tab-${section}`}
        className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6 lg:p-8"
      >
        {section === "ticket" && <TicketForm audience={audience} defaults={defaults} />}
        {section === "faq" && <SupportFAQ items={faq} onAsk={() => setSection("ticket")} />}
        {section === "ai" && <SupportAIChat questions={AI_QUESTIONS[audience]} />}
      </div>
    </div>
  );
}
