/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Menu, X, ChevronDown } from "lucide-react";
import { useState, useCallback, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { LoginModal } from "./loginModel";
import { SignupModal } from "./signupModel";
import { useCategory } from "@/app/contexts/category-context";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [isShopDropdownOpen, setIsShopDropdownOpen] = useState(false);
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
    userCount: 1250,
  });

  const lastScrollY = useRef(0);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  const dropdownTimeout = useRef<NodeJS.Timeout | null>(null);
  const searchParams = useSearchParams();
  const { activeCategories, isLoading } = useCategory();

  const navigationItems = [
    { label: "Home", href: "#home", id: "home" },
    { label: "Shop", href: "#products", id: "products", hasDropdown: true },
    { label: "Ask help", href: "#ask-help", id: "ask-help" },
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

  const handleCategoryClick = useCallback(
    (categoryName: string) => {
      // Close dropdown
      setIsShopDropdownOpen(false);

      // Scroll to products section
      scrollToSection("products");

      // Set the selected category in the products section
      const event = new CustomEvent("categorySelected", {
        detail: categoryName,
      });
      window.dispatchEvent(event);

      // Update URL with category parameter
      const url = new URL(window.location.href);
      if (categoryName === "ALL CATEGORIES") {
        url.searchParams.delete("category");
      } else {
        url.searchParams.set("category", categoryName);
      }
      window.history.replaceState({}, "", url.toString());
    },
    [scrollToSection]
  );

  const handleShopMouseEnter = () => {
    if (dropdownTimeout.current) {
      clearTimeout(dropdownTimeout.current);
    }
    setIsShopDropdownOpen(true);
  };

  const handleShopMouseLeave = () => {
    dropdownTimeout.current = setTimeout(() => {
      setIsShopDropdownOpen(false);
    }, 150); // Small delay to prevent flickering
  };

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
        if (dropdownTimeout.current) {
          clearTimeout(dropdownTimeout.current);
        }
      };
    }
  }, [handleScroll, detectActiveSection]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="bg-green-700 border-b border-green-600 shadow-lg">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between h-12">
              <div className="flex items-center gap-2 bg-green-50 px-2 sm:px-3 py-1 rounded-full border-2 border-primary flex-shrink-0">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202025-08-26%20at%2017.19.27_37ef906c.jpg-5w6VIINuFETMhj8U6ktDEnUViMPQod.jpeg"
                  alt="FoodBundle Logo"
                  width={32}
                  height={32}
                  className="rounded-full object-cover w-5 h-5"
                />
                <span className="text-2sm font-bold text-black whitespace-nowrap">
                  FoodBundles
                </span>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-4 lg:gap-6">
                {navigationItems.map((item) => (
                  <div
                    key={item.id}
                    className="relative"
                    onMouseEnter={
                      item.hasDropdown ? handleShopMouseEnter : undefined
                    }
                    onMouseLeave={
                      item.hasDropdown ? handleShopMouseLeave : undefined
                    }
                  >
                    <a
                      href={item.href}
                      onClick={(e) => handleNavClick(e, item.id)}
                      className={`hover:text-secondary transition-colors text-sm font-medium cursor-pointer flex items-center gap-1 ${
                        activeSection === item.id
                          ? "text-white border-b-2 border-orange-400"
                          : "text-primary-foreground"
                      }`}
                    >
                      {item.label}
                      {item.hasDropdown && (
                        <ChevronDown
                          className={`w-4 h-4 transition-transform duration-200 ${
                            isShopDropdownOpen ? "rotate-180" : ""
                          }`}
                        />
                      )}
                    </a>

                    {/* Shop Dropdown */}
                    {item.hasDropdown && (
                      <div
                        className={`absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 transition-all duration-200 ${
                          isShopDropdownOpen
                            ? "opacity-100 visible transform translate-y-0"
                            : "opacity-0 invisible transform -translate-y-2"
                        }`}
                        onMouseEnter={handleShopMouseEnter}
                        onMouseLeave={handleShopMouseLeave}
                      >
                        <div className="py-2">
                          <div className="px-4 py-2 text-sm font-semibold text-gray-700 border-b border-gray-100">
                            Shop by Category
                          </div>
                          {isLoading ? (
                            <div className="px-4 py-3 text-sm text-gray-500">
                              Loading categories...
                            </div>
                          ) : activeCategories.length > 0 ? (
                            <>
                              <button
                                onClick={() =>
                                  handleCategoryClick("ALL CATEGORIES")
                                }
                                className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
                              >
                                All Products
                              </button>
                              {activeCategories.map((category) => (
                                <button
                                  key={category.id}
                                  onClick={() =>
                                    handleCategoryClick(category.name)
                                  }
                                  className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
                                >
                                  {category.name.replace(/_/g, " ")}
                                </button>
                              ))}
                            </>
                          ) : (
                            <div className="px-4 py-3 text-sm text-gray-500">
                              No categories available
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </nav>

              {/* Right actions */}
              <div className="flex items-center gap-2">
                <div className="hidden md:block">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="bg-green-50 text-sm text-black hover:bg-green-100 px-3 sm:px-4 rounded-full py-0"
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
                    <div key={item.id}>
                      <a
                        href={item.href}
                        onClick={(e) => {
                          if (item.hasDropdown) {
                            e.preventDefault();
                            setIsShopDropdownOpen(!isShopDropdownOpen);
                          } else {
                            handleNavClick(e, item.id);
                          }
                        }}
                        className={`hover:text-secondary transition-colors cursor-pointer px-2 py-1 rounded flex items-center justify-between ${
                          activeSection === item.id
                            ? "text-yellow-300 bg-green-800/50"
                            : "text-primary-foreground"
                        }`}
                      >
                        <span>{item.label}</span>
                        {item.hasDropdown && (
                          <ChevronDown
                            className={`w-4 h-4 transition-transform ${
                              isShopDropdownOpen ? "rotate-180" : ""
                            }`}
                          />
                        )}
                      </a>

                      {/* Mobile Shop Categories */}
                      {item.hasDropdown && isShopDropdownOpen && (
                        <div className="ml-4 mt-2 space-y-1">
                          <button
                            onClick={() => {
                              handleCategoryClick("ALL CATEGORIES");
                              setIsMenuOpen(false);
                            }}
                            className="block w-full text-left px-2 py-1 text-sm text-green-200 hover:text-white transition-colors"
                          >
                            All Products
                          </button>
                          {activeCategories.map((category) => (
                            <button
                              key={category.id}
                              onClick={() => {
                                handleCategoryClick(category.name);
                                setIsMenuOpen(false);
                              }}
                              className="block w-full text-left px-2 py-1 text-sm text-green-200 hover:text-white transition-colors"
                            >
                              {category.name.replace(/_/g, " ")}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
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
