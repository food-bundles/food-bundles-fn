/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { useState, useCallback, useRef } from "react";
import { LoginModal } from "./loginModel";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginData, setLoginData] = useState<{
    isBackendAvailable: boolean;
    message: string;
  }>({
    isBackendAvailable: true,
    message: "",
  });

  const lastScrollY = useRef(0);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);


  // Check backend availability only when login modal is about to open
  const checkBackendAvailability = useCallback(async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/health`, {
        cache: "no-store",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        setLoginData({ isBackendAvailable: true, message: "" });
      } else {
        setLoginData({
          isBackendAvailable: false,
          message: "Service temporarily unavailable. Please try again later.",
        });
      }
    } catch (error) {
      setLoginData({
        isBackendAvailable: false,
        message: "Service temporarily unavailable. Please try again later.",
      });
    }
  }, []);

  const handleLoginClick = async () => {
    // Check backend only when user clicks login
    await checkBackendAvailability();
    setIsLoginModalOpen(true);
  };

  const handleCloseLoginModal = () => {
    setIsLoginModalOpen(false);
    // Reset backend status for next time
    setLoginData({ isBackendAvailable: true, message: "" });
  };

  // Scroll handling without useEffect - using event listener directly
  const handleScroll = useCallback(() => {
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }

    scrollTimeout.current = setTimeout(() => {
      const currentScrollY = window.scrollY;

      // Show header when at top of page
      if (currentScrollY < 10) {
        setIsVisible(true);
      }
      // Hide header when scrolling down, show when scrolling up
      else if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY.current) {
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
    }, 100); // Throttle to 100ms
  }, []);

  // Add scroll event listener properly
  if (typeof window !== "undefined") {
    window.addEventListener("scroll", handleScroll);
  }

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ease-in-out ${
          isVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="bg-green-700 border-b border-green-600 shadow-lg">
          <div className="container mx-auto px-6">
            <div className="flex items-center justify-between h-16">
              {/* Logo section with green-50 background to match restaurant nav */}
              <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded border-2 border-primary">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202025-08-26%20at%2017.19.27_37ef906c.jpg-5w6VIINuFETMhj8U6ktDEnUViMPQod.jpeg"
                  alt="FoodBundle Logo"
                  width={32}
                  height={32}
                  className="rounded object-cover"
                />
                <span className="text-xl font-bold text-black">
                  FoodBundles
                </span>
              </div>

              <div className="flex-1 flex items-center">
                <div className="flex-1" />

                <nav className="hidden md:flex items-center gap-6">
                  <a
                    href="#home"
                    className="hover:text-secondary transition-colors text-2xs font-medium text-primary-foreground"
                  >
                    Home
                  </a>
                  <a
                    href="#ai-assistant"
                    className="hover:text-secondary transition-colors font-medium text-2xs text-primary-foreground"
                  >
                    Quick Talk
                  </a>
                  <a
                    href="#restaurants"
                    className="hover:text-secondary transition-colors font-medium text-2xs text-primary-foreground"
                  >
                    Shop
                  </a>
                </nav>

                {/* Right actions */}
                <div className="flex-1 flex justify-end items-center gap-2">
                  <div className="hidden md:block">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="bg-green-50 text-2xs text-black hover:bg-green-100"
                      onClick={handleLoginClick}
                    >
                      Login
                    </Button>
                  </div>

                  {/* Mobile Menu Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="md:hidden text-primary-foreground hover:bg-green-600 hover:text-primary-foreground"
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
                <div className="absolute top-full left-0 right-0 bg-green-700 border-t border-green-600">
                  <nav className="md:hidden pb-4 px-6">
                    <div className="flex flex-col gap-3 pt-4">
                      <a
                        href="#home"
                        className="hover:text-secondary transition-colors text-primary-foreground"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Home
                      </a>
                      <a
                        href="#ai-assistant"
                        className="hover:text-secondary transition-colors text-primary-foreground"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Quick Talk
                      </a>
                      <a
                        href="#products"
                        className="hover:text-secondary transition-colors text-primary-foreground"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Shop
                      </a>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-fit bg-green-50 text-black hover:bg-green-100"
                        onClick={async () => {
                          setIsMenuOpen(false);
                          await handleLoginClick();
                        }}
                      >
                        Login
                      </Button>
                    </div>
                  </nav>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={handleCloseLoginModal}
        loginData={loginData}
      />
    </>
  );
}
