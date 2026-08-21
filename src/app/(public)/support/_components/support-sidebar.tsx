"use client";

import React from "react";
import { MessageSquare, Headphones, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

export type SupportSection = "ticket" |  "ai" | "faq";

export const supportNavItems: {
  id: SupportSection;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    id: "ticket",
    label: "Submit a Ticket",
    description: "Get help from our team",
    icon: Headphones,
  },
  {
    id: "ai",
    label: "AI Assistant",
    description: "Instant answers, any time",
    icon: MessageSquare,
  },
  {
    id: "faq",
    label: "FAQs",
    description: "Common questions",
    icon: FileText,
  },
];

export function getSectionMeta(section: SupportSection) {
  const item = supportNavItems.find((n) => n.id === section);
  return item ?? supportNavItems[0];
}

interface SupportSidebarProps {
  active: SupportSection;
  onSelect: (section: SupportSection) => void;
}

export function SupportSidebar({ active, onSelect }: SupportSidebarProps) {
  return (
    <nav>
      <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
        Support
      </p>
      <ul className="space-y-1">
        {supportNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onSelect(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500",
                  isActive
                    ? "bg-green-50 text-green-700 font-semibold"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-green-600" : "text-gray-400")} />
                <span className="text-sm">{item.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}