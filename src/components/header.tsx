"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50">
      <div className="flex">
        {/* Logo section with white background */}
        <div className="flex items-center gap-3 bg-green-50 px-4 py-3 border-2 border-primary">
          <div>
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202025-08-26%20at%2017.19.27_37ef906c.jpg-5w6VIINuFETMhj8U6ktDEnUViMPQod.jpeg"
              alt="FoodBundle Logo"
              width={32}
              height={32}
              className="rounded"
            />
          </div>
          <span className="text-xl font-bold text-black">FoodBundles</span>
        </div>

        <div className="flex-1 bg-green-700 text-primary-foreground">
          <div className="container mx-auto px-4 py-4 flex items-center">
            <div className="flex-1" />

            <nav className="hidden md:flex items-center gap-6">
              <a
                href="#home"
                className="hover:text-secondary transition-colors text-2xs"
              >
                Home
              </a>
              <a
                href="#ai-assistant"
                className="hover:text-secondary transition-colors text-2xs"
              >
                Quick Talk
              </a>
              <a
                href="#restaurants"
                className="hover:text-secondary transition-colors text-2xs"
              >
                Shop
              </a>
            </nav>

            {/* Right actions */}
            <div className="flex-1 flex justify-end items-center gap-2">
              <div className="hidden md:block">
                <Link className="text-2xs" href="/login">
                <Button variant="secondary" size="sm" className="bg-green-50 text-2xs">
                  Login
                </Button>
                </Link>
              </div>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <nav className="md:hidden mt-4 pb-4 border-t border-primary-foreground/20 px-4">
              <div className="flex flex-col gap-3 pt-4">
                <a
                  href="#home"
                  className="hover:text-secondary transition-colors"
                >
                  home
                </a>
                <a
                  href="#ai-assistant"
                  className="hover:text-secondary transition-colors"
                >
                  Quick Talk
                </a>
                <a
                  href="#products"
                  className="hover:text-secondary transition-colors"
                >
                  shop
                </a>
                <Button variant="secondary" size="sm" className="w-fit">
                  Login
                </Button>
              </div>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
}
