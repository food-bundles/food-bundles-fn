"use client";

import { useAuth } from "@/app/contexts/auth-context";
import { SupportCenter, SupportContactCards } from "@/app/(public)/support/_components/support-center";

/** Help inside the farmer portal: farmer topics and answers, name and phone already filled in */
export default function FarmerHelpPage() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        <div>
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Help &amp; support</h1>
          <p className="mt-0.5 text-sm text-gray-500">Call or WhatsApp us, or send a message. We answer within 24 hours.</p>
        </div>
        <SupportContactCards />
        <SupportCenter
          audience="farmer"
          defaults={{ name: user?.name || user?.username, phone: user?.phone, email: user?.email || undefined }}
        />
      </main>
    </div>
  );
}
