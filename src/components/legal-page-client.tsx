"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Printer } from "lucide-react";

const DOCS = [
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Refund Policy", href: "/refund-policy" },
  { label: "About Us", href: "/about" },
];

// Tabs at the bottom of the legal header: the open document sits on the page like a folder tab
export function LegalTabs() {
  const pathname = usePathname();
  return (
    <nav aria-label="Legal documents" className="-mx-4 mt-8 overflow-x-auto px-4 print:hidden sm:mx-0 sm:px-0">
      <ul className="m-0 flex w-max list-none gap-1 p-0">
        {DOCS.map((d) => {
          const on = pathname === d.href;
          return (
            <li key={d.href}>
              <Link
                href={d.href}
                aria-current={on ? "page" : undefined}
                className={`block whitespace-nowrap rounded-t-xl px-4 py-3 text-[14px] font-bold transition-colors ${
                  on ? "bg-white text-[#0B2E1F]" : "text-white/75 hover:bg-white/10 hover:text-white"
                }`}
              >
                {d.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

type TocEntry = { id: string; label: string };

// "On this page": built from the document's section headings, marks the one being read
export function LegalToc() {
  const [entries, setEntries] = useState<TocEntry[]>([]);
  const [active, setActive] = useState("");

  useEffect(() => {
    const headings = Array.from(
      document.querySelectorAll<HTMLHeadingElement>("[data-legal-article] h2[data-legal-section][id]")
    );
    setEntries(
      headings.map((h) => ({ id: h.id, label: (h.textContent || "").replace(/#\s*$/, "").trim() }))
    );
    if (!headings.length) return;

    const observer = new IntersectionObserver(
      (items) => {
        const visible = items.filter((i) => i.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-100px 0px -65% 0px" }
    );
    headings.forEach((h) => observer.observe(h));
    setActive(headings[0].id);
    return () => observer.disconnect();
  }, []);

  if (!entries.length) return null;

  const list = (
    <ol className="m-0 list-none space-y-0.5 border-l border-[#DCE6DF] p-0">
      {entries.map((e) => {
        const on = e.id === active;
        return (
          <li key={e.id}>
            <a
              href={`#${e.id}`}
              aria-current={on ? "location" : undefined}
              className={`-ml-px block border-l-2 py-1.5 pl-4 text-[14px] leading-snug transition-colors ${
                on ? "border-[#00A43A] font-bold text-[#0B2E1F]" : "border-transparent text-[#4A6358] hover:text-[#0B2E1F]"
              }`}
            >
              {e.label}
            </a>
          </li>
        );
      })}
    </ol>
  );

  return (
    <>
      {/* Phones and tablets: folded away above the document */}
      <details className="rounded-2xl border border-[#DCE6DF] p-4 lg:hidden">
        <summary className="cursor-pointer text-[15px] font-bold text-[#0B2E1F]">On this page</summary>
        <div className="mt-3">{list}</div>
      </details>
      <div className="hidden lg:block">
        <p className="mb-3 mt-0 text-[12px] font-bold uppercase tracking-[1.2px] text-[#00A43A]">On this page</p>
        {list}
      </div>
    </>
  );
}

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-white/30 px-3.5 text-[14px] font-bold text-white transition-colors hover:bg-white/10 print:hidden cursor-pointer"
    >
      <Printer className="h-4 w-4" /> Print
    </button>
  );
}
