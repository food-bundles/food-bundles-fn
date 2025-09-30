/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Menu, X, UserPlus, User, ShoppingCart, BrickWall } from "lucide-react";
import { useState, useCallback, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/app/contexts/auth-context";
import { UserRole } from "@/lib/types";
import Link from "next/link";
import { getRedirectPath } from "@/lib/navigations";
import { Skeleton } from "./ui/skeleton";
import { toast } from "react-toastify";

// Separate component for search params logic
function SearchParamsHandler() {
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();

  // Check for guest access toast message
  const checkForGuestToast = useCallback(() => {
    const showGuestToast = searchParams?.get("showGuestToast");

    if (showGuestToast === "true") {
      toast.info(
        <div className="flex items-center gap-2">
          <span>Logout first to access guest page</span>
        </div>,
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          className: "toast-guest",
        }
      );

      // Clean up URL immediately to prevent repeat triggers
      if (typeof window !== "undefined") {
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete("showGuestToast");
        window.history.replaceState({}, "", newUrl.toString());
      }
    }
  }, [searchParams]);

  const checkForLoginRedirect = useCallback(() => {
    // Your login redirect logic here if needed
  }, [searchParams, isAuthenticated]);

  // Run checks on mount and when search params change
  useEffect(() => {
    checkForGuestToast();
    checkForLoginRedirect();
  }, [checkForGuestToast, checkForLoginRedirect]);

  return null; // This component doesn't render anything
}

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [isShopDropdownOpen, setIsShopDropdownOpen] = useState(false);
  const [isAuthTransitioning, setIsAuthTransitioning] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  const lastScrollY = useRef(0);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  const dropdownTimeout = useRef<NodeJS.Timeout | null>(null);

  const { user, isAuthenticated, logout, getUserProfileImage, isLoading } =
    useAuth();

  const navigationItems = [
    { label: "Home", href: "#home", id: "home" },
    { label: "Ask help", href: "#ask-help", id: "ask-help" },
  ];

  const getRedirectPathMemo = useCallback((userRole: string) => {
    return getRedirectPath(userRole as UserRole);
  }, []);

  const getProfilePath = useCallback((userRole: string): string => {
    switch (userRole) {
      case UserRole.FARMER:
        return "/farmer/settings";
      case UserRole.RESTAURANT:
        return "#";
      case UserRole.AGGREGATOR:
        return "/aggregator/settings";
      case UserRole.ADMIN:
      case UserRole.LOGISTIC:
        return "/dashboard/settings";
      default:
        console.warn(
          `Unknown user role: ${userRole}. Redirecting to default settings.`
        );
        return "/dashboard/settings";
    }
  }, []);

  // Navigation handler with role-based redirect
  const handleNavigation = useCallback(async (path: string) => {
    // Show loading state briefly
    await new Promise((resolve) => setTimeout(resolve, 300));
    window.location.href = path;
  }, []);

  const handleDashboardNavigation = useCallback(() => {
    if (user?.role) {
      const dashboardPath = getRedirectPathMemo(user.role);
      handleNavigation(dashboardPath);
    }
  }, [user?.role, getRedirectPathMemo, handleNavigation]);

  const handleProfileNavigation = useCallback(() => {
    if (user?.role) {
      const profilePath = getProfilePath(user.role);
      handleNavigation(profilePath);
    }
  }, [user?.role, getProfilePath, handleNavigation]);

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

  const handleLogout = async () => {
    try {
      setIsAuthTransitioning(true);
      await logout();
      setTimeout(() => {
        setIsAuthTransitioning(false);
      }, 500);
    } catch (error) {
      console.error("Logout error:", error);
    }
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

  // Animation effect for subscribe button
  useEffect(() => {
    if (!hasAnimated) {
      const timer = setTimeout(() => {
        setHasAnimated(true);
      }, 500); // Start animation after 500ms

      return () => clearTimeout(timer);
    }
  }, [hasAnimated]);

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

  // Get user profile data
  const profileImage = isAuthenticated ? getUserProfileImage() : null;
  const userName = user?.name || user?.username || "User";

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="bg-green-700 border-b border-green-600">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between h-13">
              <Link href="/">
                <div className="flex items-center gap-2 bg-green-50 px-2 sm:px-3 py-1 rounded-full border-2 border-primary flex-shrink-0 cursor-pointer">
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
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-4 lg:gap-6">
                {navigationItems.map((item) => (
                  <a
                    key={item.id}
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item.id)}
                    className="hover:border-b hover:border-orange-400 py-1  text-[14px] text-white cursor-pointer flex items-center gap-1"
                  >
                    {item.label}
                  </a>
                ))}

                {/* Enhanced Subscribe Button */}
                <div
                  className={`relative ${
                    hasAnimated ? "" : ""
                  }`}
                  onMouseEnter={handleShopMouseEnter}
                  onMouseLeave={handleShopMouseLeave}
                >
                  <button
                    className="py-1 rounded-full text-orange-400 transition-all duration-300 text-[14px] whitespace-nowrap flex items-center gap-2 hover:scale-105"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection("subscribe");
                    }}
                  >
                    <span className="relative z-20">Subscribe To Our Farm</span>
                  </button>

                  {/* Enhanced Dropdown */}
                  <div
                    className={`absolute top-full -left-1 mt-3 w-64 bg-white border border-orange-200 transition-all duration-300 ${
                      isShopDropdownOpen
                        ? "opacity-100 visible transform translate-y-0"
                        : "opacity-0 invisible transform -translate-y-2"
                    }`}
                    onMouseEnter={handleShopMouseEnter}
                    onMouseLeave={handleShopMouseLeave}
                  >
                    <div className="py-2">
                      <Link href="/signup">
                        <button
                          onClick={() => {
                            window.dispatchEvent(
                              new CustomEvent("openSignupRestaurant")
                            );
                            setIsShopDropdownOpen(false);
                          }}
                          className="flex items-center w-full text-left px-4 py-3 text-[13px] text-gray-900 border-b  hover:text-green-500 transition-colors group"
                        >
                          <UserPlus className="w-4 h-4 mr-3 text-orange-400 group-hover:text-orange-600" />
                          <div>
                            <div className="font-medium">
                              Subscribe as Restaurant
                            </div>
                          </div>
                        </button>
                      </Link>
                      <button
                        onClick={() => {
                          setIsShopDropdownOpen(false);
                          window.location.href = "/guest";
                        }}
                        className="flex items-center w-full text-left px-4 py-3 text-[13px] text-gray-900  hover:text-green-500 transition-colors group"
                      >
                        <ShoppingCart className="w-4 h-4 mr-3 text-orange-400 group-hover:text-orange-500" />
                        <div>
                          <div className="font-medium">Shop as Guest</div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </nav>

              {/* Mobile Subscribe Button - Visible on Mobile */}
              <div className="md:hidden flex items-center">
                <div
                  className={`relative ${
                    hasAnimated ? "" : ""
                  }`}
                >
                  <button
                    className="subscribe-button  bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 rounded-full text-sm font-bold hover:from-yellow-300 hover:to-orange-300 py-[7px] px-3 transition-all duration-300 text-[13px] whitespace-nowrap flex items-center gap-2 hover:scale-105 mr-2"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsShopDropdownOpen(!isShopDropdownOpen);
                    }}
                  >
                    <span className="relative z-10">Subscribe</span>
                  </button>

                  {/* Mobile Subscribe Dropdown - Positioned appropriately */}
                  <div
                    className={`absolute top-full right-0 mt-2 w-56 bg-white border border-orange-200 rounded-lg shadow-lg transition-all duration-300 ${
                      isShopDropdownOpen
                        ? "opacity-100 visible transform translate-y-0"
                        : "opacity-0 invisible transform -translate-y-2"
                    }`}
                  >
                    <div className="py-2">
                      <Link href="/signup">
                        <button
                          onClick={() => {
                            window.dispatchEvent(
                              new CustomEvent("openSignupRestaurant")
                            );
                            setIsShopDropdownOpen(false);
                          }}
                          className="flex items-center w-full text-left px-4 py-3 text-[13px] text-gray-900 border-b hover:text-green-500 transition-colors group"
                        >
                          <UserPlus className="w-4 h-4 mr-3 text-orange-400 group-hover:text-orange-600" />
                          <div>
                            <div className="font-medium">
                              Subscribe as Restaurant
                            </div>
                          </div>
                        </button>
                      </Link>
                      <button
                        onClick={() => {
                          setIsShopDropdownOpen(false);
                          window.location.href = "/guest";
                        }}
                        className="flex items-center w-full text-left px-4 py-3 text-[13px] text-gray-900 hover:text-green-500 transition-colors group"
                      >
                        <ShoppingCart className="w-4 h-4 mr-3 text-orange-400 group-hover:text-orange-500" />
                        <div>
                          <div className="font-medium">Shop as Guest</div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right actions */}
              <div className="flex items-center gap-2">
                {/* Desktop User Menu */}
                <div className="hidden md:block relative">
                  {isAuthenticated ? (
                    <>
                      <button
                        onClick={() =>
                          setIsProfileDropdownOpen(!isProfileDropdownOpen)
                        }
                        className="flex items-center gap-2 hover:bg-transparent py-2 px-3 cursor-pointer text-primary-foreground"
                      >
                        <span className="font-medium text-sm max-w-32 truncate">
                          {userName.slice(0, 8)}
                        </span>
                        <div className="rounded-full flex items-center justify-center">
                          {profileImage ? (
                            <Image
                              src={profileImage}
                              alt={`${userName}'s profile`}
                              width={24}
                              height={24}
                              className="rounded-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "/placeholder.svg";
                              }}
                            />
                          ) : (
                            <div className="rounded-full bg-green-600 text-white flex items-center justify-center w-6 h-6 text-xs font-bold">
                              {userName.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>
                      </button>

                      {isProfileDropdownOpen && (
                        <div className="absolute -right-6 top-full mt-2 w-32 bg-white shadow-lg border border-gray-200 py-1 z-50">
                          <button
                            className="block sm:flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={handleDashboardNavigation}
                          >
                            <BrickWall className="w-4 h-4 mr-1" />
                            Dashboard
                          </button>
                          <button
                            className="sm:flex items-center block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={handleProfileNavigation}
                          >
                            <User className="w-4 h-4 mr-1" />
                            Profile
                          </button>
                          <div className="border-t border-gray-100 mt-1"></div>
                          <button
                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                            onClick={handleLogout}
                          >
                            Logout
                          </button>
                        </div>
                      )}
                    </>
                  ) : isAuthTransitioning || isLoading ? (
                    <div className="flex items-center gap-2 px-3">
                      <Skeleton className="h-6 w-20 rounded bg-green-600/60" />
                      <Skeleton className="h-6 w-6 rounded-full bg-green-600/60" />
                    </div>
                  ) : (
                    <Link href="/login">
                      <button className="bg-green-50 text-sm text-black hover:bg-green-100 px-3 sm:px-4 rounded-full py-1 flex items-center gap-1">
                        <User className="w-4 h-4" />
                        Login
                      </button>
                    </Link>
                  )}
                </div>

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="md:hidden text-primary-foreground hover:bg-green-600 hover:text-primary-foreground p-2"
                >
                  {isMenuOpen ? (
                    <X className="w-5 h-5" />
                  ) : (
                    <Menu className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Mobile Navigation Menu */}
            {isMenuOpen && (
              <div className="md:hidden pb-4 border-t border-green-600 mt-2">
                <nav className="flex flex-col gap-3 pt-4">
                  {navigationItems.map((item) => (
                    <a
                      key={item.id}
                      href={item.href}
                      onClick={(e) => handleNavClick(e, item.id)}
                      className={`hover:text-secondary transition-colors cursor-pointer px-2 py-1 rounded flex items-center justify-between ${
                        activeSection === item.id
                          ? "text-yellow-300 bg-green-800/50"
                          : "text-primary-foreground"
                      }`}
                    >
                      <span>{item.label}</span>
                    </a>
                  ))}



                  {/* Mobile Login/Profile */}
                  {isAuthenticated ? (
                    <div className="mt-2 pt-2 border-t border-green-600">
                      <div className="flex items-center gap-2 px-2 py-1 text-primary-foreground">
                        <div className="rounded-full flex items-center justify-center">
                          {profileImage ? (
                            <Image
                              src={profileImage}
                              alt={`${userName}'s profile`}
                              width={20}
                              height={20}
                              className="rounded-full object-cover p-[15px]"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "/placeholder.svg";
                              }}
                            />
                          ) : (
                            <div className="rounded-full p-[15px] bg-green-600 text-white flex items-center justify-center w-5 h-5 text-xs font-bold">
                              {userName.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <span className="font-medium text-sm">{userName}</span>
                      </div>
                      <button
                        className="block w-full text-left px-2 py-1 text-sm text-green-200 hover:text-white transition-colors"
                        onClick={() => {
                          setIsMenuOpen(false);
                          handleDashboardNavigation();
                        }}
                      >
                        Dashboard
                      </button>
                      <button
                        className="block w-full text-left px-2 py-1 text-sm text-green-200 hover:text-white transition-colors"
                        onClick={() => {
                          setIsMenuOpen(false);
                          handleProfileNavigation();
                        }}
                      >
                        Profile
                      </button>
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsMenuOpen(false);
                        }}
                        className="flex items-center gap-2 w-full text-left px-2 py-1 text-sm text-red-300 hover:text-red-200 transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  ) : isLoading ? (
                    <>
                      <div className="flex items-center gap-2 px-3">
                        <Skeleton className="h-6 w-20 rounded bg-green-600/60" />
                        <Skeleton className="h-6 w-6 rounded-full bg-green-600/60" />
                      </div>
                    </>
                  ) : (
                    <>
                      <Link href="/login">
                        <Button
                          variant="secondary"
                          onClick={() => setIsMenuOpen(!isMenuOpen)}
                          size="sm"
                          className="w-fit bg-green-50 text-black hover:bg-green-100 mt-2"
                        >
                          Login
                        </Button>
                      </Link>
                    </>
                  )}
                </nav>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Wrap SearchParamsHandler in Suspense */}
      <Suspense fallback={null}>
        <SearchParamsHandler />
      </Suspense>
    </>
  );
}
