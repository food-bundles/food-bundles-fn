/* eslint-disable react/no-unescaped-entities */
// app/not-found.tsx
"use client";

import Link from "next/link";
import { Backpack } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-6">
      <h1 className="text-4xl font-bold mb-4 text-gray-800">
        404 - Page Not Found
      </h1>
      <p className="text-gray-600 mb-6 text-lg">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Button asChild className="bg-yellow-600 hover:bg-yellow-700 text-white">
        <Link href="/">
          <Backpack />
          Back to Home
        </Link>
      </Button>
    </div>
  );
}
