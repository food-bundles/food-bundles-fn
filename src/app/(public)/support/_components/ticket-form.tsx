"use client";

import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Upload,
  X,
  CheckCircle2,
  Loader2,
  ImagePlus,
  Paperclip,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { showToast } from "@/lib/toast";

interface TicketFormProps {
  selectedCategory?: string;
  onCategoryChange?: (id: string) => void;
}

const severityOptions = [
  { value: "low", label: "Low - General question" },
  { value: "medium", label: "Medium - Something isn't working" },
  { value: "high", label: "High - Urgent / blocking me" },
  { value: "critical", label: "Critical - Emergency" },
];

const submitOptions = [
  { value: "email", label: "Email (default)" },
  { value: "phone", label: "Phone call" },
  { value: "whatsapp", label: "WhatsApp" },
];

export function TicketForm({
  selectedCategory,
  onCategoryChange,
}: TicketFormProps) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    category: "",
    severity: "",
    preferredContact: "email",
    description: "",
  });

  React.useEffect(() => {
    if (selectedCategory) {
      setForm((prev) => ({ ...prev, category: selectedCategory }));
      setErrors((prev) => {
        const next = { ...prev };
        delete next.category;
        return next;
      });
    }
  }, [selectedCategory]);
  const [screenshots, setScreenshots] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [status, setStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submittedTicket, setSubmittedTicket] = useState<
    string | null
  >(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (
    field: keyof typeof form,
    value: string
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const current = Array.from(files);
    const next = [...screenshots, ...current].slice(0, 6);
    setScreenshots(next);

    const nextPreviews = current.map((file) =>
      URL.createObjectURL(file)
    );
    setPreviews((prev) => [...prev, ...nextPreviews].slice(0, 6));
  };

  const removeScreenshot = (index: number) => {
    setScreenshots((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = "Please enter your name";
    if (!form.email.trim()) {
      newErrors.email = "Please enter your email";
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!form.subject.trim()) newErrors.subject = "Please add a subject";
    if (!form.category) newErrors.category = "Please choose a category";
    if (!form.description.trim() || form.description.trim().length < 10)
      newErrors.description = "Describe your issue (at least 10 characters)";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      showToast("error", "Please fix the highlighted fields");
      return;
    }

    setStatus("sending");

    const hasAttachments = screenshots.length > 0;
    let body: BodyInit;
    let headers: HeadersInit = {};

    if (hasAttachments) {
      const data = new FormData();
      Object.entries(form).forEach(([key, value]) =>
        data.append(key, value)
      );
      screenshots.forEach((file) => data.append("screenshots", file));
      body = data;
    } else {
      body = JSON.stringify(form);
      headers = { "Content-Type": "application/json" };
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/support-tickets`,
        {
          method: "POST",
          body,
          headers,
        }
      );
      if (res.ok) {
        let ticketNumber: string | null = null;
        try {
          const payload = await res.json();
          ticketNumber = payload?.data?.ticketNumber ?? null;
        } catch {
          ticketNumber = null;
        }
        setSubmittedTicket(ticketNumber);
        setStatus("success");
        setForm({
          name: "",
          email: "",
          subject: "",
          category: "",
          severity: "",
          preferredContact: "email",
          description: "",
        });
        setScreenshots([]);
        setPreviews([]);
        showToast("success", "Ticket submitted successfully!");
        setTimeout(() => {
          setStatus("idle");
          setSubmittedTicket(null);
        }, 15000);
      } else {
        setStatus("error");
        showToast("error", "Failed to submit ticket. Please try again.");
        setTimeout(() => setStatus("idle"), 4000);
      }
    } catch {
      setStatus("error");
      showToast("error", "Network error. Please try again.");
      setTimeout(() => setStatus("idle"), 4000);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {status === "success" && (
        <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl p-4">
          <CheckCircle2 className="h-6 w-6 text-green-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-green-900 text-sm">
              Ticket submitted!
            </p>
            {submittedTicket && (
              <p className="text-green-700 text-xs mt-0.5">
                Your ticket number is{" "}
                <span className="font-mono font-semibold">
                  {submittedTicket}
                </span>
                . Keep it for reference.
              </p>
            )}
            <p className="text-green-700 text-xs mt-0.5">
              Our team will get back to you within 24 hours.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-sm font-medium text-gray-700">
            Full Name
          </Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="Your full name"
            className={cn(
              "bg-white",
              errors.name &&
                "border-red-500 focus-visible:ring-red-500/30"
            )}
          />
          {errors.name && (
            <p className="text-xs text-red-600">{errors.name}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="email"
            className="text-sm font-medium text-gray-700"
          >
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            placeholder="you@example.com"
            className={cn(
              "bg-white",
              errors.email && "border-red-500 focus-visible:ring-red-500/30"
            )}
          />
          {errors.email && (
            <p className="text-xs text-red-600">{errors.email}</p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label
          htmlFor="subject"
          className="text-sm font-medium text-gray-700"
        >
          Subject
        </Label>
        <Input
          id="subject"
          value={form.subject}
          onChange={(e) => handleChange("subject", e.target.value)}
          placeholder="Short summary of your issue"
          className={cn(
            "bg-white",
            errors.subject &&
              "border-red-500 focus-visible:ring-red-500/30"
          )}
        />
        {errors.subject && (
          <p className="text-xs text-red-600">{errors.subject}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">
            Category
          </Label>
          <Select
            value={form.category}
            onValueChange={(value) => handleChange("category", value)}
          >
            <SelectTrigger
              className={cn(
                "bg-white",
                errors.category &&
                  "border-red-500 focus-visible:ring-red-500/30"
              )}
            >
              <SelectValue placeholder="Choose category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="orders">Orders & Ordering</SelectItem>
              <SelectItem value="delivery">
                Delivery & Tracking
              </SelectItem>
              <SelectItem value="payments">Payments & Billing</SelectItem>
              <SelectItem value="account">Account & Profile</SelectItem>
              <SelectItem value="products">Products & Suppliers</SelectItem>
              <SelectItem value="refunds">Refunds & Returns</SelectItem>
              <SelectItem value="technical">Technical Issues</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          {errors.category && (
            <p className="text-xs text-red-600">{errors.category}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">
            How urgent?
          </Label>
          <Select
            value={form.severity}
            onValueChange={(value) => handleChange("severity", value)}
          >
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              {severityOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">
            Preferred contact
          </Label>
          <Select
            value={form.preferredContact}
            onValueChange={(value) =>
              handleChange("preferredContact", value)
            }
          >
            <SelectTrigger className="bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {submitOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-gray-700">
          Describe your issue
        </Label>
        <Textarea
          value={form.description}
          onChange={(e) => handleChange("description", e.target.value)}
          rows={5}
          placeholder="Please describe the issue in as much detail as possible. Include steps you took, error messages, and anything else that may help us resolve it quickly."
          className={cn(
            "bg-white resize-none",
            errors.description &&
              "border-red-500 focus-visible:ring-red-500/30"
          )}
        />
        {errors.description && (
          <p className="text-xs text-red-600">{errors.description}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">
          Attach screenshots (max 6)
        </Label>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        {previews.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {previews.map((src, i) => (
              <div
                key={i}
                className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 group"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`screenshot-${i + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeScreenshot(i)}
                  className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full p-0.5 hover:bg-black/80 transition-colors"
                  aria-label="Remove screenshot"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {previews.length < 6 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-green-500 hover:text-green-600 transition-colors"
              >
                <ImagePlus className="h-5 w-5" />
                <span className="text-[10px]">Add</span>
              </button>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-2 text-sm text-green-700 hover:text-green-800 underline-offset-2 hover:underline"
        >
          <Paperclip className="h-4 w-4" />
          Upload screenshot
        </button>
      </div>

      <Button
        type="submit"
        disabled={status === "sending"}
        className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 py-2.5 text-sm"
      >
        {status === "sending" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Submitting ticket...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4" />
            Submit Support Ticket
          </>
        )}
      </Button>

 
    </form>
  );
}
