"use client";

import React, { useMemo, useState } from "react";
import { ChevronDown, MessageSquarePlus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SupportFAQProps {
  /** Question → answer */
  items: Record<string, string>;
  /** Shown when nothing answers the question: go to the message form */
  onAsk?: () => void;
}

export function SupportFAQ({ items, onAsk }: SupportFAQProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string | null>(null);

  const entries = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return Object.entries(items).filter(
      ([q, a]) => !needle || q.toLowerCase().includes(needle) || a.toLowerCase().includes(needle)
    );
  }, [items, query]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search questions"
          aria-label="Search questions"
          className="h-11 bg-white pl-9"
        />
      </div>

      {entries.length === 0 ? (
        <div className="rounded-xl bg-gray-50 px-4 py-10 text-center">
          <p className="text-sm font-medium text-gray-700">No answer for &quot;{query}&quot;</p>
          <p className="mt-1 text-xs text-gray-500">Send us your question and our team will answer.</p>
          {onAsk && (
            <Button variant="outline" size="sm" className="mt-4" onClick={onAsk}>
              <MessageSquarePlus className="mr-2 h-4 w-4" /> Ask our team
            </Button>
          )}
        </div>
      ) : (
        <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200">
          {entries.map(([question, answer]) => {
            const isOpen = open === question;
            return (
              <li key={question}>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : question)}
                  className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left transition-colors hover:bg-gray-50"
                >
                  <span className={cn("text-sm font-semibold", isOpen ? "text-green-800" : "text-gray-800")}>
                    {question}
                  </span>
                  <ChevronDown
                    className={cn("h-4 w-4 shrink-0 text-gray-400 transition-transform", isOpen && "rotate-180 text-green-600")}
                  />
                </button>
                <div
                  className={cn(
                    "grid transition-all duration-200",
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  )}
                >
                  <div className="overflow-hidden">
                    <p className="px-4 pb-4 text-sm leading-relaxed text-gray-600">{answer}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
