"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Banknote,
  CheckCircle2,
  Copy,
  CreditCard,
  HelpCircle,
  ImagePlus,
  Loader2,
  Mail,
  MessageCircle,
  Package,
  Phone,
  RotateCcw,
  Send,
  Sprout,
  Truck,
  UserRound,
  Warehouse,
  Wrench,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { showToast } from "@/lib/toast";

export type SupportAudience = "farmer" | "general";

type Category = { value: string; label: string; icon: React.ComponentType<{ className?: string }> };

/** Farmers sell and get paid; buyers order and pay. Each sees the topics that are theirs. */
const CATEGORIES: Record<SupportAudience, Category[]> = {
  farmer: [
    { value: "selling", label: "Selling my harvest", icon: Sprout },
    { value: "farmer_payments", label: "Getting paid", icon: Banknote },
    { value: "aggregator", label: "Aggregator & drop-off", icon: Warehouse },
    { value: "account", label: "My account", icon: UserRound },
    { value: "technical", label: "App problem", icon: Wrench },
    { value: "other", label: "Something else", icon: HelpCircle },
  ],
  general: [
    { value: "orders", label: "Orders", icon: Package },
    { value: "delivery", label: "Delivery", icon: Truck },
    { value: "payments", label: "Payments", icon: CreditCard },
    { value: "account", label: "My account", icon: UserRound },
    { value: "technical", label: "App problem", icon: Wrench },
    { value: "other", label: "Something else", icon: HelpCircle },
  ],
};

const URGENCY = [
  { value: "low", label: "Not urgent", hint: "A question" },
  { value: "medium", label: "Soon", hint: "Something doesn't work" },
  { value: "high", label: "Urgent", hint: "It blocks me" },
];

const CONTACT = [
  { value: "phone", label: "Call me", icon: Phone },
  { value: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { value: "email", label: "Email", icon: Mail },
];

const MAX_SCREENSHOTS = 6;

interface TicketFormProps {
  audience?: SupportAudience;
  /** Prefilled from the signed-in account */
  defaults?: { name?: string; phone?: string; email?: string };
}

const emptyForm = (audience: SupportAudience, defaults: TicketFormProps["defaults"] = {}) => ({
  name: defaults.name ?? "",
  phone: defaults.phone ?? "",
  email: defaults.email ?? "",
  subject: "",
  category: "",
  severity: "",
  // Farmers mostly answer the phone; others usually read email
  preferredContact: audience === "farmer" || (!defaults.email && defaults.phone) ? "phone" : "email",
  description: "",
});

export function TicketForm({ audience = "general", defaults }: TicketFormProps) {
  const [form, setForm] = useState(() => emptyForm(audience, defaults));
  const [screenshots, setScreenshots] = useState<{ file: File; url: string }[]>([]);
  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [ticket, setTicket] = useState<{ number: string | null } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // The account loads after the first render; fill only what the person has not typed yet
  useEffect(() => {
    if (!defaults) return;
    setForm((prev) => ({
      ...prev,
      name: prev.name || defaults.name || "",
      phone: prev.phone || defaults.phone || "",
      email: prev.email || defaults.email || "",
    }));
  }, [defaults?.name, defaults?.phone, defaults?.email]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    const key = field === "phone" || field === "email" ? "contact" : field;
    if (errors[key])
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
  };

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const added = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .map((file) => ({ file, url: URL.createObjectURL(file) }));
    setScreenshots((prev) => {
      const next = [...prev, ...added];
      next.slice(MAX_SCREENSHOTS).forEach((s) => URL.revokeObjectURL(s.url));
      return next.slice(0, MAX_SCREENSHOTS);
    });
  };

  const removeScreenshot = (index: number) =>
    setScreenshots((prev) => {
      URL.revokeObjectURL(prev[index].url);
      return prev.filter((_, i) => i !== index);
    });

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Enter your name";
    const phone = form.phone.replace(/[\s-]/g, "");
    if (!phone && !form.email.trim()) e.contact = "Give a phone number or an email so we can answer you";
    else if (phone && !/^\+?\d{9,13}$/.test(phone)) e.contact = "Enter a valid phone number, e.g. 0788 123 456";
    else if (form.email.trim() && !/^\S+@\S+\.\S+$/.test(form.email)) e.contact = "Enter a valid email";
    if (!form.category) e.category = "Choose what it is about";
    if (form.description.trim().length < 10) e.description = "Tell us a bit more (at least 10 characters)";
    if (form.preferredContact === "email" && !form.email.trim() && phone)
      e.preferredContact = "Add an email, or choose Call me or WhatsApp";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setSending(true);

    const categoryLabel = CATEGORIES[audience].find((c) => c.value === form.category)?.label ?? "Support";
    const fields: Record<string, string> = {
      ...form,
      phone: form.phone.replace(/[\s-]/g, ""),
      // The subject is optional for people; the team still needs one
      subject: form.subject.trim() || `${categoryLabel}: ${form.description.trim().slice(0, 60)}`,
    };

    let body: BodyInit;
    const headers: HeadersInit = {};
    if (screenshots.length) {
      const data = new FormData();
      Object.entries(fields).forEach(([k, v]) => v && data.append(k, v));
      screenshots.forEach((s) => data.append("screenshots", s.file));
      body = data;
    } else {
      body = JSON.stringify(Object.fromEntries(Object.entries(fields).filter(([, v]) => v)));
      headers["Content-Type"] = "application/json";
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/support-tickets`, { method: "POST", body, headers });
      if (!res.ok) throw new Error(String(res.status));
      const payload = await res.json().catch(() => null);
      setTicket({ number: payload?.data?.ticketNumber ?? null });
      screenshots.forEach((s) => URL.revokeObjectURL(s.url));
      setScreenshots([]);
      setForm(emptyForm(audience, defaults));
    } catch {
      showToast("error", "We could not send it. Check your connection and try again, or call us.");
    } finally {
      setSending(false);
    }
  };

  if (ticket) {
    const answer =
      form.preferredContact === "email" ? "by email" : form.preferredContact === "whatsapp" ? "on WhatsApp" : "by phone";
    return (
      <div className="flex flex-col items-center px-4 py-10 text-center" role="status">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600">
          <CheckCircle2 className="h-8 w-8" />
        </span>
        <h3 className="mt-4 text-xl font-bold text-gray-900">We got your message</h3>
        <p className="mt-1 max-w-sm text-sm text-gray-600">
          Our team will answer you {answer} within 24 hours.
        </p>
        {ticket.number && (
          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText(ticket.number!);
              showToast("success", "Ticket number copied");
            }}
            className="mt-5 inline-flex items-center gap-2 rounded-lg border border-dashed border-green-300 bg-green-50 px-4 py-2 font-mono text-sm font-semibold text-green-800 hover:bg-green-100"
          >
            {ticket.number}
            <Copy className="h-4 w-4" />
          </button>
        )}
        {ticket.number && <p className="mt-1 text-xs text-gray-500">Your ticket number. Keep it if you call us.</p>}
        <Button variant="outline" className="mt-6" onClick={() => setTicket(null)}>
          <RotateCcw className="mr-2 h-4 w-4" /> Send another message
        </Button>
      </div>
    );
  }

  const fieldError = (key: string) =>
    errors[key] ? (
      <p className="text-xs text-red-600" role="alert">
        {errors[key]}
      </p>
    ) : null;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-7">
      {/* 1. What it is about */}
      <fieldset className="space-y-3">
        <legend className="mb-3 text-sm font-semibold text-gray-900">What do you need help with?</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {CATEGORIES[audience].map(({ value, label, icon: Icon }) => {
            const on = form.category === value;
            return (
              <button
                key={value}
                type="button"
                aria-pressed={on}
                onClick={() => set("category", value)}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl border px-3 py-3 text-left text-sm font-medium transition-colors",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500",
                  on
                    ? "border-green-600 bg-green-50 text-green-800 ring-1 ring-green-600"
                    : "border-gray-200 bg-white text-gray-700 hover:border-green-300 hover:bg-green-50/50"
                )}
              >
                <Icon className={cn("h-5 w-5 shrink-0", on ? "text-green-600" : "text-gray-400")} />
                {label}
              </button>
            );
          })}
        </div>
        {fieldError("category")}
      </fieldset>

      {/* 2. The problem */}
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="description" className="text-sm font-semibold text-gray-900">
            Tell us what happened
          </Label>
          <Textarea
            id="description"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            rows={5}
            maxLength={2000}
            placeholder={
              audience === "farmer"
                ? "For example: I brought 200 kg of beans on Monday and I have not been paid yet."
                : "What did you try, what did you expect, and what happened instead?"
            }
            className={cn("resize-none bg-white", errors.description && "border-red-500")}
          />
          <div className="flex justify-between gap-2">
            {fieldError("description") ?? <span />}
            <span className="text-xs text-gray-400">{form.description.length}/2000</span>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="subject" className="text-sm font-medium text-gray-700">
            Short title <span className="font-normal text-gray-400">(optional)</span>
          </Label>
          <Input
            id="subject"
            value={form.subject}
            onChange={(e) => set("subject", e.target.value)}
            placeholder={audience === "farmer" ? "Not paid for my beans" : "Short summary"}
            className="bg-white"
          />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">
            Photos or screenshots <span className="font-normal text-gray-400">(optional, up to {MAX_SCREENSHOTS})</span>
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              addFiles(e.target.files);
              e.target.value = "";
            }}
          />
          <div className="flex flex-wrap gap-2">
            {screenshots.map((s, i) => (
              <div key={s.url} className="relative h-20 w-20 overflow-hidden rounded-lg border border-gray-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.url} alt={`Attachment ${i + 1}`} className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeScreenshot(i)}
                  className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
                  aria-label={`Remove attachment ${i + 1}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {screenshots.length < MAX_SCREENSHOTS && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-gray-300 text-gray-500 transition-colors hover:border-green-500 hover:text-green-600"
              >
                <ImagePlus className="h-5 w-5" />
                <span className="text-[11px] font-medium">Add photo</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. How urgent */}
      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-gray-900">How urgent is it?</legend>
        <div className="grid grid-cols-3 gap-2">
          {URGENCY.map((u) => {
            const on = form.severity === u.value;
            return (
              <button
                key={u.value}
                type="button"
                aria-pressed={on}
                onClick={() => set("severity", on ? "" : u.value)}
                className={cn(
                  "rounded-xl border px-3 py-2.5 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500",
                  on ? "border-green-600 bg-green-50 ring-1 ring-green-600" : "border-gray-200 bg-white hover:bg-gray-50"
                )}
              >
                <span className={cn("block text-sm font-semibold", on ? "text-green-800" : "text-gray-800")}>{u.label}</span>
                <span className="block text-xs text-gray-500">{u.hint}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* 4. Who to answer, and how */}
      <fieldset className="space-y-4 rounded-xl bg-gray-50 p-4">
        <legend className="sr-only">How we answer you</legend>
        <p className="text-sm font-semibold text-gray-900">How should we answer you?</p>
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-sm font-medium text-gray-700">
            Your name
          </Label>
          <Input
            id="name"
            autoComplete="name"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            className={cn("bg-white", errors.name && "border-red-500")}
          />
          {fieldError("name")}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
              Phone number
            </Label>
            <Input
              id="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="0788 123 456"
              className={cn("bg-white", errors.contact && "border-red-500")}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email <span className="font-normal text-gray-400">(optional)</span>
            </Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="you@example.com"
              className={cn("bg-white", errors.contact && "border-red-500")}
            />
          </div>
        </div>
        {fieldError("contact") ?? <p className="text-xs text-gray-500">A phone number or an email is enough.</p>}

        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Preferred way to answer">
          {CONTACT.map(({ value, label, icon: Icon }) => {
            const on = form.preferredContact === value;
            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => set("preferredContact", value)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                  on ? "border-green-600 bg-green-600 text-white" : "border-gray-200 bg-white text-gray-700 hover:bg-gray-100"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            );
          })}
        </div>
        {fieldError("preferredContact")}
      </fieldset>

      <Button
        type="submit"
        disabled={sending}
        className="h-11 w-full bg-green-600 text-base font-semibold text-white hover:bg-green-700 sm:w-auto sm:px-8"
      >
        {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
        {sending ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
