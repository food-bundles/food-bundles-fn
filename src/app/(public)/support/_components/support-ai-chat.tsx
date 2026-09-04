"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Bot,
  Sparkles,
  MessageSquare,
  ArrowRight,
  Zap,
} from "lucide-react";

declare global {
  interface Window {
    chatbase: any;
  }
}

const CHATBOT_ID = "oVtdXXauW9F6SW6q1JSir";

const sampleQuestions = [
  "How do I place an order?",
  "What payment methods do you accept?",
  "How can I track my deliveries?",
  "What is your refund policy?",
];

export function SupportAIChat() {
  const [ready, setReady] = useState(false);

  // Ensure the Chatbase embed script is loaded so window.chatbase('open') works
  useEffect(() => {
    if (window.chatbase && window.chatbase("getState") === "initialized") {
      setReady(true);
      return;
    }

    const loadScript = () => {
      const existing = document.getElementById(CHATBOT_ID);
      if (!existing) {
        const script = document.createElement("script");
        script.src = "https://www.chatbase.co/embed.min.js";
        script.id = CHATBOT_ID;
        script.setAttribute("domain", "www.chatbase.co");
        script.setAttribute("data-chatbot-id", CHATBOT_ID);
        script.defer = true;
        script.async = true;
        script.onload = () => setReady(true);
        document.body.appendChild(script);
      } else {
        setReady(true);
      }
    };

    if (document.readyState === "complete") {
      loadScript();
    } else {
      window.addEventListener("load", loadScript);
      return () => window.removeEventListener("load", loadScript);
    }
  }, []);

  const openChat = () => {
    if (window.chatbase) {
      window.chatbase("open");
    } else {
      setReady(false);
      // Re-trigger loading if the script wasn't ready yet
      window.location.reload();
    }
  };

  return (
    <div className="flex flex-col">
      {/* Hero panel describing the AI agent */}
      <div className="bg-gradient-to-br from-green-600 to-green-700 text-white rounded-2xl p-6 md:p-8 relative overflow-hidden">
        <div className="absolute -top-6 -right-6 w-40 h-40 rounded-full bg-white/10" />
        <div className="absolute -bottom-10 -left-6 w-32 h-32 rounded-full bg-white/5" />

        <div className="relative">
          <div className="flex items-center gap-2 text-green-100 text-xs font-medium">
            <span className="inline-flex items-center gap-1.5 bg-white/15 px-2.5 py-1 rounded-full">
              <Sparkles className="h-3 w-3 text-amber-300" />
              AI Powered
            </span>
          </div>

          <h3 className="text-xl md:text-2xl font-bold mt-4">
            Chat with our AI Assistant
          </h3>
          <p className="text-green-100 text-sm mt-2 max-w-lg">
            Get instant answers to your questions — anytime, anywhere. Our AI
            agent can help you with orders, deliveries, payments, refunds and
            more.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
            <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2.5">
              <Zap className="h-4 w-4 text-amber-300 shrink-0" />
              <span className="text-xs text-green-100">
                Instant responses
              </span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2.5">
              <MessageSquare className="h-4 w-4 text-amber-300 shrink-0" />
              <span className="text-xs text-green-100">24/7 availability</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2.5">
              <Bot className="h-4 w-4 text-amber-300 shrink-0" />
              <span className="text-xs text-green-100">Trained on FoodBundles</span>
            </div>
          </div>

          <Button
            onClick={openChat}
            className="mt-6 bg-white text-green-700 hover:bg-green-50 font-semibold px-5 py-2.5 shadow"
          >
            Start a chat
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Suggested questions */}
      <div className="mt-6">
        <p className="text-sm font-semibold text-gray-800 mb-3">
          Popular questions
        </p>
        <div className="flex flex-wrap gap-2">
          {sampleQuestions.map((q) => (
            <button
              key={q}
              onClick={openChat}
              className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-full px-3 py-2 hover:bg-green-100 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-center gap-2 text-xs text-gray-400">
        <span className="inline-block h-2 w-2 rounded-full bg-green-500 animate-pulse" />
        AI agent is online right now
      </div>
    </div>
  );
}