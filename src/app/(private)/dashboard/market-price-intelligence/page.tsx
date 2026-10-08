"use client";

import MarketPriceIntelligence from "../markets/_components/market-price-intelligence";

export default function MarketPriceIntelligencePage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 text-xs text-gray-400 mb-6"
        >
          <span className="flex items-center gap-1.5">
            <a
              href="/dashboard"
              className="hover:text-gray-700 transition-colors font-medium"
            >
              Dashboard
            </a>
            <span className="text-gray-300">›</span>
          </span>
          <span className="text-gray-700 font-semibold">Market Price Intelligence</span>
        </nav>

        {/* Intelligence Content */}
        <MarketPriceIntelligence />
      </div>
    </div>
  );
}
