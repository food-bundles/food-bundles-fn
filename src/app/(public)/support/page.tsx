"use client";

import React, { useState } from "react";
import { LifeBuoy } from "lucide-react";
import { TicketForm } from "./_components/ticket-form";
import { SupportAIChat } from "./_components/support-ai-chat";
import { SupportFAQ } from "./_components/support-faq";
import {
  SupportSidebar,
  type SupportSection,
} from "./_components/support-sidebar";

export default function SupportPage() {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [activeSection, setActiveSection] =
    useState<SupportSection>("ticket");

  const handleCategorySelect = (id: string) => {
    setSelectedCategory(id);
    setActiveSection("ticket");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Green hero */}
      <div className="bg-green-700 text-white">
        <div className="max-w-6xl mx-auto px-4 pt-12 pb-12 md:pt-16 md:pb-16">
          <span className="inline-flex items-center gap-2 bg-white/10 text-green-100 text-xs font-medium px-3 py-1 rounded-full">
            <LifeBuoy className="h-3.5 w-3.5" />
            Help Center
          </span>
          <h1 className="text-3xl md:text-4xl font-bold mt-4 leading-tight">
            How can we help you today?
          </h1>
          <p className="text-green-100 mt-3 text-sm md:text-base max-w-2xl">
            Get instant answers from our AI assistant, browse guides, or submit
            a support ticket — our team responds within 24 hours.
          </p>
        </div>
      </div>

      {/* Support area — sidebar + content */}
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <aside className="w-full lg:w-56 shrink-0">
            <div className="lg:sticky lg:top-6">
              <SupportSidebar
                active={activeSection}
                onSelect={setActiveSection}
              />
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            {activeSection === "ai" && <SupportAIChat />}

            {activeSection === "ticket" && (
              <TicketForm
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
              />
            )}

            {activeSection === "faq" && <SupportFAQ />}
          </main>
        </div>
      </div>
    </div>
  );
}