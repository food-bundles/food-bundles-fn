import React from "react";
import Link from "next/link";
import { ChevronRight, Mail, MapPin, MessageCircle } from "lucide-react";
import { LegalTabs, LegalToc, PrintButton } from "./legal-page-client";

interface LegalPageProps {
  title: string;
  description?: string;
  /** Leave out on pages that are not legal documents (e.g. About) */
  lastUpdated?: string;
  children: React.ReactNode;
}

// "1. Purpose & Scope" -> "purpose-scope", so every section can be linked to
function slugify(node: React.ReactNode): string | undefined {
  const text = React.Children.toArray(node)
    .map((c) => (typeof c === "string" || typeof c === "number" ? String(c) : ""))
    .join("");
  const slug = text
    .toLowerCase()
    .replace(/^\s*\d+(\.\d+)*\.?\s*/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return slug || undefined;
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  const id = slugify(children);
  return (
    <h2
      id={id}
      data-legal-section
      className="group mt-12 scroll-mt-28 border-t border-[#DCE6DF] pt-8 text-[22px] font-bold leading-snug tracking-[-0.3px] text-[#0B2E1F] first:mt-0 first:border-t-0 first:pt-0 [font-family:var(--font-inter-tight),sans-serif]"
    >
      {children}
      {id && (
        <a
          href={`#${id}`}
          aria-label="Link to this section"
          className="ml-2 text-[#00A43A] no-underline opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100 print:hidden"
        >
          #
        </a>
      )}
    </h2>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-2 mt-7 text-[17px] font-bold text-[#0B2E1F]">{children}</h3>;
}

function Paragraph({ children }: { children: React.ReactNode }) {
  return <p className="mb-4 mt-4 text-[16px] leading-[1.75] text-[#2E4A3B]">{children}</p>;
}

const LETTERS = "abcdefghijklmnopqrstuvwxyz";

/** Clauses are lettered (a), (b), (c) like a contract; use variant="bullets" for plain lists */
function List({ items, variant = "clauses" }: { items: React.ReactNode[]; variant?: "clauses" | "bullets" }) {
  if (variant === "bullets") {
    return (
      <ul className="mb-5 mt-4 space-y-2.5 pl-0">
        {items.map((item, index) => (
          <li key={index} className="flex gap-3 text-[16px] leading-[1.7] text-[#2E4A3B]">
            <span aria-hidden="true" className="mt-[11px] block h-1.5 w-1.5 shrink-0 rounded-full bg-[#00A43A]" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    );
  }
  return (
    <ol className="mb-5 mt-4 list-none space-y-3 pl-0">
      {items.map((item, index) => (
        <li key={index} className="grid grid-cols-[2.25rem_1fr] text-[16px] leading-[1.7] text-[#2E4A3B]">
          <span className="font-bold text-[#007A35]">({LETTERS[index] ?? index + 1})</span>
          <span>{item}</span>
        </li>
      ))}
    </ol>
  );
}

function ContactCard() {
  return (
    <aside className="mt-14 rounded-2xl bg-[#F6F9F7] p-6 sm:p-8 print:border print:border-gray-300 print:bg-white">
      <h2 className="m-0 text-[20px] font-bold text-[#0B2E1F] [font-family:var(--font-inter-tight),sans-serif]">
        Questions about this document?
      </h2>
      <p className="mb-5 mt-2 text-[15px] text-[#4A6358]">Our team will answer within one working day.</p>
      <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-3">
        <li className="flex items-start gap-2.5 text-[15px]">
          <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#00A43A]" />
          <a href="mailto:sales@food.rw" className="font-bold text-[#0B2E1F] hover:text-[#007A35]">sales@food.rw</a>
        </li>
        <li className="flex items-start gap-2.5 text-[15px]">
          <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#00A43A]" />
          <a href="https://wa.me/250796897823" className="font-bold text-[#0B2E1F] hover:text-[#007A35]">WhatsApp 0796 897 823</a>
        </li>
        <li className="flex items-start gap-2.5 text-[15px] text-[#0B2E1F]">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#00A43A]" />
          <span>Food Bundles Ltd, KG 5 Ave, Kigali, Rwanda</span>
        </li>
      </ul>
    </aside>
  );
}

export function LegalPage({ title, description, lastUpdated, children }: LegalPageProps) {
  return (
    <div className="bg-white">
      <section className="relative overflow-hidden bg-[#0B2E1F] text-white print:bg-white print:text-black">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 print:hidden"
          style={{
            background:
              "radial-gradient(circle at 10% 0%, #00D04838 0, transparent 40%), radial-gradient(circle at 90% 100%, #18A0A030 0, transparent 40%)",
          }}
        />
        <div className="relative mx-auto max-w-[1180px] px-4 pt-10 sm:px-8 sm:pt-14">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-[14px] text-white/70 print:hidden">
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <span>Legal</span>
            <ChevronRight className="h-4 w-4" />
            <span aria-current="page" className="font-bold text-white">{title}</span>
          </nav>

          <h1 className="mb-0 mt-4 text-[clamp(34px,4.6vw,56px)] font-bold leading-[1.02] tracking-[-1.6px] [font-family:var(--font-inter-tight),sans-serif]">
            {title}
          </h1>
          {description && (
            <p className="mb-0 mt-4 max-w-[640px] text-[17px] leading-relaxed text-[#C9DCD0] print:text-gray-700">{description}</p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[14px] text-white/75 print:text-gray-700">
            {lastUpdated && (
              <span>
                Last updated <b className="text-white print:text-black">{lastUpdated}</b>
              </span>
            )}
            <span>Food Bundles Ltd · Kigali, Rwanda</span>
            <PrintButton />
          </div>

          <LegalTabs />
        </div>
      </section>

      <div className="mx-auto grid max-w-[1180px] gap-10 px-4 py-10 sm:px-8 sm:py-14 lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-16">
        <aside className="print:hidden">
          <div className="lg:sticky lg:top-24">
            <LegalToc />
          </div>
        </aside>
        <article data-legal-article className="min-w-0 max-w-[760px]">
          {children}
          <ContactCard />
        </article>
      </div>
    </div>
  );
}

export const LegalContent = {
  SectionHeading,
  SubHeading,
  Paragraph,
  List,
};
