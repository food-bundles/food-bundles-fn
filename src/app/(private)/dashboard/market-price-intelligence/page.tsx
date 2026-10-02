"use client";

import MarketPriceIntelligence from "../markets/_components/market-price-intelligence";

export default function MarketPriceIntelligencePage() {
  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 space-y-6">
      {/* Intelligence Content */}
      <MarketPriceIntelligence />
    </div>
  );
}
