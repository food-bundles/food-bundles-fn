"use client";

import { RequestedProducts } from "../_components/dashboard/requested-products";

// Products customers (schools, hotels…) need, posted by Food Bundles aggregators
export default function ProductsNeededPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Products needed</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Food Bundles customers need these products. Tap Supply to send what you have; you can supply one
            product, several, or all.
          </p>
        </div>
        <RequestedProducts showEmpty />
      </main>
    </div>
  );
}
