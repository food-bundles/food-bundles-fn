import React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface LegalPageProps {
  title: string;
  description?: string;
  lastUpdated: string;
  children: React.ReactNode;
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mt-10 mb-3 flex items-start gap-2.5">
      <span className="mt-1.5 block h-2.5 w-2.5 shrink-0 rounded-sm bg-green-700" />
      {children}
    </h2>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-base font-semibold text-gray-900 mt-6 mb-2">{children}</h3>
  );
}

function Paragraph({ children }: { children: React.ReactNode }) {
  return <p className="text-gray-700 leading-relaxed mb-3">{children}</p>;
}

function List({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="space-y-2 mb-4">
      {items.map((item, index) => (
        <li key={index} className="flex gap-2.5 text-gray-700 leading-relaxed">
          <span className="mt-2.5 block h-1 w-1 shrink-0 rounded-full bg-green-600" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function LegalPage({
  title,
  description,
  lastUpdated,
  children,
}: LegalPageProps) {
  return (
    <div className="bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <nav
          aria-label="Breadcrumb"
          className="mb-8 flex flex-wrap items-center gap-1 text-sm text-gray-500"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-green-700 hover:text-green-800 transition-colors"
          >
            <Home className="h-4 w-4" />
            Home
          </Link>
          <ChevronRight className="h-4 w-4 text-gray-400" />
          <span className="font-medium text-gray-700">{title}</span>
        </nav>

        <header className="bg-white rounded-xl border border-gray-200 shadow-sm px-6 sm:px-8 lg:px-10 py-8 sm:py-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {title}
          </h1>
          {description && (
            <p className="mt-3 text-sm sm:text-[15px] text-gray-600 leading-relaxed">
              {description}
            </p>
          )}
          <div className="mt-5 flex items-center gap-3 border-t border-gray-100 pt-4 text-xs sm:text-sm text-gray-500">
            <span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 font-medium text-green-700">
              Last updated: {lastUpdated}
            </span>
          </div>
        </header>

        <div className="mt-6 bg-white rounded-xl border border-gray-200 shadow-sm px-6 sm:px-8 lg:px-10 py-8 sm:py-10">
          {children}
        </div>
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
