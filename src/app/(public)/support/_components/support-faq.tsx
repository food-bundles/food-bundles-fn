"use client";

import React, { useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { faqData } from "@/data/faqData";
import { cn } from "@/lib/utils";

export function SupportFAQ() {
  const [query, setQuery] = useState("");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const entries = Object.entries(faqData).filter(([question]) =>
    question.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl flex-1">
        <Search className="h-5 w-5 text-green-600 shrink-0" />
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpenIndex(null);
          }}
          placeholder="Search frequently asked questions..."
          className="border-0 bg-transparent shadow-none focus-visible:ring-0 text-sm"
        />
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-10 bg-white border border-gray-200 rounded-xl">
          <p className="text-gray-500 text-sm">
            No results for &quot;{query}&quot;.
          </p>
          <p className="text-gray-400 text-xs mt-1">
            Try different keywords or contact our team directly.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {entries.map(([question, answer], index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={question}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() =>
                    setOpenIndex(isOpen ? null : index)
                  }
                  className="w-full flex items-center justify-between gap-4 px-4 py-3.5 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm font-semibold text-gray-800">
                    {question}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-gray-400 shrink-0 transition-transform",
                      isOpen && "rotate-180 text-green-600"
                    )}
                  />
                </button>
                <div
                  className={cn(
                    "grid transition-all duration-200",
                    isOpen
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  )}
                >
                  <div className="overflow-hidden">
                    <p className="px-4 pb-4 text-sm text-gray-600 leading-relaxed">
                      {answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
