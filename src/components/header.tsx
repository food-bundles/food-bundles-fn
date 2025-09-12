"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LoginModal } from "./loginModel";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginData, setLoginData] = useState<{
    isBackendAvailable: boolean;
    message: string;
  }>({
    isBackendAvailable: true,
    message: "",
  });

  const router = useRouter();
  const searchParams = useSearchParams();

useEffect(() => {
  const showLogin = searchParams.get("showLogin");
  const redirect = searchParams.get("redirect");
  const reason = searchParams.get("reason");

  if (showLogin === "true") {
    setIsLoginModalOpen(true);

    // Store redirect path for after login
    if (redirect) {
      localStorage.setItem("pendingRedirect", redirect);
    }

    // Set appropriate message based on reason
    let message = "";
    if (reason === "expired") {
      message = "Your session has expired. Please log in again.";
    } else if (reason === "invalid") {
      message = "Please log in to access this page.";
    } else if (redirect) {
      message = `Please log in to access ${redirect}.`;
    } else {
      message = "Please log in to continue.";
    }

    setLoginData((prev) => ({
      ...prev,
      message,
    }));

    // Clean up URL parameters without adding to history
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.delete("showLogin");
    newUrl.searchParams.delete("redirect");
    newUrl.searchParams.delete("reason");

    // Use replaceState to avoid adding to browser history
    window.history.replaceState({}, "", newUrl.toString());
  }
}, [searchParams, router]);
  // Check backend availability
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/health`,
          {
            cache: "no-store",
          }
        );
        if (res.ok) {
          setLoginData((prev) => ({
            ...prev,
            isBackendAvailable: true,
          }));
        } else {
          setLoginData((prev) => ({
            ...prev,
            isBackendAvailable: false,
            message: "Backend unavailable",
          }));
        }
      } catch {
        setLoginData((prev) => ({
          ...prev,
          isBackendAvailable: false,
          message: "Backend unavailable",
        }));
      }
    };

    checkBackend();
  }, []);

  useEffect(() => {
    const controlNavbar = () => {
      const currentScrollY = window.scrollY;

      // Show header when at top of page
      if (currentScrollY < 10) {
        setIsVisible(true);
      }
      // Hide header when scrolling down, show when scrolling up
      else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    // Throttle scroll events for better performance
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          controlNavbar();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY]);

  const handleLoginClick = () => {
    setIsLoginModalOpen(true);
  };

  const handleCloseLoginModal = () => {
    setIsLoginModalOpen(false);
    // Clear any pending redirect message
    setLoginData((prev) => ({
      ...prev,
      message: prev.isBackendAvailable ? "" : prev.message,
    }));
  };

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
                        onClick={() => {
                          setIsMenuOpen(false);
                          handleLoginClick();
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
