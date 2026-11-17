import { LifeBuoy } from "lucide-react";
import { SupportCenter, SupportContactCards } from "./_components/support-center";

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-br from-green-700 to-green-800 text-white">
        <div className="mx-auto max-w-5xl px-4 py-10 md:py-14">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-green-100">
            <LifeBuoy className="h-3.5 w-3.5" /> Help center
          </span>
          <h1 className="mt-4 text-3xl font-bold leading-tight md:text-4xl">How can we help you?</h1>
          <p className="mt-2 max-w-2xl text-sm text-green-100 md:text-base">
            Call or WhatsApp us now, or send a message and our team answers within 24 hours.
          </p>
          <div className="mt-6">
            <SupportContactCards tone="dark" />
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-5xl px-4 py-8 md:py-10">
        <SupportCenter />
      </div>
    </div>
  );
}
