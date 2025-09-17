/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { useState, useCallback, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { LoginModal } from "./loginModel";
import { SignupModal } from "./signupModel";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false); // Add state for signup modal
  const [activeSection, setActiveSection] = useState("home");
  const [loginData, setLoginData] = useState<{
    isBackendAvailable: boolean;
    message: string;
  }>({
    isBackendAvailable: true,
    message: "",
  });
  const [signupData, setSignupData] = useState<{
    isBackendAvailable: boolean;
    message: string;
    userCount?: number;
  }>({
    isBackendAvailable: true,
    message: "",
    userCount: 1250, // Default value
  });

  const lastScrollY = useRef(0);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  const searchParams = useSearchParams();

  const navigationItems = [
    { label: "Home", href: "#home", id: "home" },
    { label: "Shop", href: "#products", id: "products" },
    { label: "Quick Talk", href: "#quick-talk", id: "quick-talk" },
  ];

  const scrollToSection = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerHeight = 80;
      const elementPosition = element.offsetTop - headerHeight;

      window.scrollTo({
        top: elementPosition,
        behavior: "smooth",
      });

      setIsMenuOpen(false);
    }
  }, []);

  const handleNavClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
      e.preventDefault();
      scrollToSection(sectionId);
    },
    [scrollToSection]
  );

  const detectActiveSection = useCallback(() => {
    const sections = navigationItems
      .map((item) => document.getElementById(item.id))
      .filter(Boolean);
    const scrollPosition = window.scrollY + 100;

    for (let i = sections.length - 1; i >= 0; i--) {
      const section = sections[i];
      if (section && section.offsetTop <= scrollPosition) {
        setActiveSection(navigationItems[i].id);
        break;
      }
    }
  }, []);

  const checkForLoginRedirect = useCallback(() => {
    const showLogin = searchParams?.get("showLogin");
    const reason = searchParams?.get("reason");

    if (showLogin === "true" && !isLoginModalOpen) {
      let message = "";
      if (reason === "add_to_cart") {
        message = "Please log in to add this item to your cart.";
      } else if (reason === "expired") {
        message = "Your session has expired. Please log in again.";
      } else if (reason === "required") {
        message = "Please log in to access this page.";
      } else {
        message = "Please log in to continue.";
      }

      setLoginData((prev) => ({
        ...prev,
        message,
      }));

      setIsLoginModalOpen(true);

      // Clean up URL without reloading
      if (typeof window !== "undefined") {
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete("showLogin");
        newUrl.searchParams.delete("reason");
        window.history.replaceState({}, "", newUrl.toString());
      }
    }
  }, [searchParams, isLoginModalOpen]);
  useEffect(() => {
    checkForLoginRedirect();
  }, [checkForLoginRedirect]);

  const checkBackendAvailability = useCallback(async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/health`, {
        cache: "no-store",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        setLoginData((prev) => ({ ...prev, isBackendAvailable: true }));
        setSignupData((prev) => ({ ...prev, isBackendAvailable: true }));
      } else {
        const message =
          "Service temporarily unavailable. Please try again later.";
        setLoginData((prev) => ({
          ...prev,
          isBackendAvailable: false,
          message,
        }));
        setSignupData((prev) => ({
          ...prev,
          isBackendAvailable: false,
          message,
        }));
      }
    } catch (error) {
      const message =
        "Service temporarily unavailable. Please try again later.";
      setLoginData((prev) => ({
        ...prev,
        isBackendAvailable: false,
        message,
      }));
      setSignupData((prev) => ({
        ...prev,
        isBackendAvailable: false,
        message,
      }));
    }
  }, []);

  const handleLoginClick = async () => {
    await checkBackendAvailability();
    setIsLoginModalOpen(true);
  };


  const handleCloseLoginModal = () => {
    setIsLoginModalOpen(false);
    setLoginData({ isBackendAvailable: true, message: "" });
    localStorage.removeItem("pendingRedirect");
  };

  const handleCloseSignupModal = () => {
    setIsSignupModalOpen(false);
    setSignupData({ isBackendAvailable: true, message: "", userCount: 1250 });
  };

 const handleBackToLogin = () => {
  setIsLoginModalOpen(true);
  setIsSignupModalOpen(false);
 };
 

  const handleScroll = useCallback(() => {
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }

    scrollTimeout.current = setTimeout(() => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < 10) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY.current) {
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;

      detectActiveSection();
    }, 100);
  }, [detectActiveSection]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.addEventListener("scroll", handleScroll, { passive: true });

      detectActiveSection();

      return () => {
        window.removeEventListener("scroll", handleScroll);
        if (scrollTimeout.current) {
          clearTimeout(scrollTimeout.current);
        }
      };
    }
  }, [handleScroll, detectActiveSection]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ease-in-out ${
          isVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="bg-green-700 border-b border-green-600 shadow-lg">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-2 bg-green-50 px-2 sm:px-3 py-2 rounded border-2 border-primary flex-shrink-0">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202025-08-26%20at%2017.19.27_37ef906c.jpg-5w6VIINuFETMhj8U6ktDEnUViMPQod.jpeg"
                  alt="FoodBundle Logo"
                  width={32}
                  height={32}
                  className="rounded object-cover w-6 h-6 sm:w-8 sm:h-8"
                />
                <span className="text-sm sm:text-lg lg:text-xl font-bold text-black whitespace-nowrap">
                  FoodBundles
                </span>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-4 lg:gap-6">
                {navigationItems.map((item) => (
                  <a
                    key={item.id}
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item.id)}
                    className={`hover:text-secondary transition-colors text-sm lg:text-base font-medium cursor-pointer ${
                      activeSection === item.id
                        ? "text-white border-b-2 border-orange-400 pb-1"
                        : "text-primary-foreground"
                    }`}
                  >
                    {item.label}
                  </a>
                ))}
              </nav>

              {/* Right actions */}
              <div className="flex items-center gap-2">
                <div className="hidden md:block">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="bg-green-50 text-xs sm:text-sm text-black hover:bg-green-100 px-3 sm:px-4"
                    onClick={handleLoginClick}
                  >
                    Login
                  </Button>
                </div>

                {/* Mobile Menu Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden text-primary-foreground hover:bg-green-600 hover:text-primary-foreground p-2"
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
              <div className="md:hidden pb-4 border-t border-green-600 mt-2">
                <nav className="flex flex-col gap-3 pt-4">
                  {navigationItems.map((item) => (
                    <a
                      key={item.id}
                      href={item.href}
                      onClick={(e) => handleNavClick(e, item.id)}
                      className={`hover:text-secondary transition-colors cursor-pointer px-2 py-1 rounded ${
                        activeSection === item.id
                          ? "text-yellow-300 bg-green-800/50"
                          : "text-primary-foreground"
                      }`}
                    >
                      {item.label}
                    </a>
                  ))}
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-fit bg-green-50 text-black hover:bg-green-100 mt-2"
                    onClick={async () => {
                      setIsMenuOpen(false);
                      await handleLoginClick();
                    }}
                  >
                    Login
                  </Button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={handleCloseLoginModal}
        loginData={loginData}
      />

      {/* Signup Modal */}
      <SignupModal
        isOpen={isSignupModalOpen}
        onClose={handleCloseSignupModal}
        signupData={signupData}
        onBackToLogin={handleBackToLogin}
      />
    </>
  );
}
