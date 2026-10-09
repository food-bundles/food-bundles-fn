/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { Button } from "@/components/ui/button";
import { OptimizedImage } from "@/components/OptimizedImage";
import { Menu, X, UserPlus, User, ShoppingCart, LayoutGrid, LogOut } from "lucide-react";
import { useState, useCallback, useRef, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/auth-context";
import { UserRole } from "@/lib/types";
import Link from "next/link";
import { getRedirectPath } from "@/lib/navigations";
import { Skeleton } from "./ui/skeleton";
import { toast } from "react-toastify";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PriceComparisonPopup } from "@/components/PriceComparisonPopup";

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
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [isShopDropdownOpen, setIsShopDropdownOpen] = useState(false);
  const [isPriceDropdownOpen, setIsPriceDropdownOpen] = useState(false);
  const [isMobilePriceOpen, setIsMobilePriceOpen] = useState(false);
  const [isAuthTransitioning, setIsAuthTransitioning] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  const lastScrollY = useRef(0);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  const dropdownTimeout = useRef<NodeJS.Timeout | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const { user, isAuthenticated, logout, getUserProfileImage, isLoading } =
    useAuth();

  const navigationItems = [
    { label: "Home", href: "#home", id: "home" },
    { label: "Connect", href: "#connect", id: "connect" },
    { label: "Price", href: "/dashboard/markets", id: "price", isExternal: true },
    { label: "Ask help", href: "/support", id: "ask-help", isExternal: true },
  ];

  const getRedirectPathMemo = useCallback((userRole: string) => {
    return getRedirectPath(userRole as UserRole);
  }, []);

  const getProfilePath = useCallback((userRole: string): string => {
    switch (userRole) {
      case UserRole.FARMER:
        return "/farmers";
      case UserRole.RESTAURANT:
        return "#";
      case UserRole.AGGREGATOR:
        return "/aggregator";
      case UserRole.ADMIN:
      case UserRole.LOGISTICS:
        return "/dashboard";
      case UserRole.MARKET_PRICES:
        return "/dashboard/markets";
      default:
        console.warn(
          `Unknown user role: ${userRole}. Redirecting to default settings.`
        );
        return "/dashboard";
    }
  }, []);

  // Navigation handler with role-based redirect
  const handleNavigation = useCallback((path: string) => {
    if (!isMounted || !path) return;
    if (path.startsWith("http")) {
      window.location.href = path;
    } else {
      router.push(path);
    }
  }, [router, isMounted]);

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
    }, 150);
  };

  const handlePriceMouseEnter = () => {
    if (dropdownTimeout.current) {
      clearTimeout(dropdownTimeout.current);
    }
    setIsPriceDropdownOpen(true);
  };

  const handlePriceMouseLeave = () => {
    dropdownTimeout.current = setTimeout(() => {
      setIsPriceDropdownOpen(false);
    }, 150);
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
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Full reload, not a client-side state change: it clears Next.js's
      // router cache (which may hold a "/login → /" redirect prefetched while
      // signed in) and every context still holding the previous user's data.
      window.location.href = "/";
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

  // Removed animation effect to improve performance

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
      <header
        className="fixed top-0 left-0 right-0 z-50"
        suppressHydrationWarning
      >
        <div className="bg-green-700 border-b border-green-600 ">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between h-13">
              <Link href="/">
                <div className="flex items-center gap-2 bg-green-50 px-2 sm:px-3 py-1 rounded-full border-2 border-primary cursor-pointer">
                  <OptimizedImage
                    src="/imgs/Food_bundle_logo.png"
                    alt="FoodBundle Logo"
                    width={32}
                    height={32}
                    className="rounded-full object-cover w-5 h-5"
                    transformation={[
                      { width: 64, height: 64, crop: "fill", quality: "85" },
                    ]}
                  />
                  <span className="text-2sm font-bold text-black whitespace-nowrap">
                    FoodBundles
                  </span>
                </div>
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-4 lg:gap-6">
                {navigationItems.map((item) => {
                  if (item.id === "price") {
                    return (
                      <div
                        key={item.id}
                        className="relative"
                        onMouseEnter={handlePriceMouseEnter}
                        onMouseLeave={handlePriceMouseLeave}
                      >
                        <Link
                          href={item.href}
                          className="hover:border-b hover:border-orange-400 py-1 text-[13px] uppercase tracking-wide text-white cursor-pointer flex items-center gap-1"
                        >
                          {item.label}
                        </Link>
                        <div
                          className={`absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl transition-all duration-300 z-50 ${
                            isPriceDropdownOpen
                              ? "opacity-100 visible transform translate-y-0"
                              : "opacity-0 invisible transform -translate-y-2"
                          }`}
                          onMouseEnter={handlePriceMouseEnter}
                          onMouseLeave={handlePriceMouseLeave}
                        >
                          <div className="p-4">
                            <h3 className="text-sm font-bold text-gray-900 mb-3">Price Comparison</h3>
                            <PriceComparisonPopup />
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return item.isExternal ? (
                    <Link
                      key={item.id}
                      href={item.href}
                      className="hover:border-b hover:border-orange-400 py-1 text-[13px] uppercase tracking-wide text-white cursor-pointer flex items-center gap-1"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <a
                      key={item.id}
                      href={item.href}
                      onClick={(e) => handleNavClick(e, item.id)}
                      className="hover:border-b hover:border-orange-400 py-1 text-[13px] uppercase tracking-wide text-white cursor-pointer flex items-center gap-1"
                    >
                      {item.label}
                    </a>
                  );
                })}

                {/* Enhanced Subscribe Button */}
                <div
                  className="relative"
                  onMouseEnter={handleShopMouseEnter}
                  onMouseLeave={handleShopMouseLeave}
                >
                  <button
                    className="bg-linear-to-r from-yellow-400 to-orange-400 text-gray-900 px-4 sm:px-6 py-1 rounded-full text-sm font-bold hover:from-yellow-300 hover:to-orange-300 transition-all duration-200 shadow-md transform hover:scale-105"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection("subscribe");
                    }}
                    suppressHydrationWarning
                  >
                    <span className="relative z-20 uppercase tracking-wide">Shop Now</span>
                  </button>

                  {/* Enhanced Dropdown */}
                  <div
                    className={`absolute top-full -left-18 mt-2 w-64 space-y-2 bg-white border border-orange-200 rounded-md transition-all duration-300 ${isShopDropdownOpen
                      ? "opacity-100 visible transform translate-y-0"
                      : "opacity-0 invisible transform -translate-y-2"
                      }`}
                    onMouseEnter={handleShopMouseEnter}
                    onMouseLeave={handleShopMouseLeave}
                  >
                    <div>
                      <p className=" w-full ml-4 pt-2 font-medium text-gray-900 text-[14px]">
                        Subscribe To Our Farm
                      </p>
                    </div>
                    <div className="pb-0">
                      <Link href="/login" prefetch={false}>
                        <button
                          onClick={() => {
                            window.dispatchEvent(
                              new CustomEvent("openSignupRestaurant")
                            );
                            setIsShopDropdownOpen(false);
                          }}
                          className="flex items-center w-full text-left px-4 py-2 text-[13px] text-gray-900 border-b  hover:text-green-500 transition-colors group"
                        >
                          <UserPlus className="w-4 h-4 mr-3 text-orange-400 group-hover:text-orange-600" />
                          <div>
                            <div className="">Shop as Restaurant</div>
                          </div>
                        </button>
                      </Link>
                      <button
                        onClick={() => {
                          setIsShopDropdownOpen(false);
                          router?.push("/guest");
                        }}
                        className="flex items-center w-full text-left px-4 py-2 text-[13px] text-gray-900  hover:text-green-500 transition-colors group"
                      >
                        <ShoppingCart className="w-4 h-4 mr-3 text-orange-400 group-hover:text-orange-500" />
                        <div>
                          <div className="">Shop as Guest</div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </nav>

              {/* Mobile Subscribe Button - Visible on Mobile */}
              <div className="md:hidden flex items-center">
                <div className="relative">
                  <button
                    className="subscribe-button  bg-linear-to-r from-yellow-400 to-orange-400 text-gray-900 rounded-full text-sm font-bold hover:from-yellow-300 hover:to-orange-300 py-[7px] px-3 transition-all duration-300 text-[13px] whitespace-nowrap flex items-center gap-2 hover:scale-105 mr-2"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsShopDropdownOpen(!isShopDropdownOpen);
                    }}
                    suppressHydrationWarning
                  >
                    <span className="relative z-10 uppercase tracking-wide">Shop Now</span>
                  </button>

                  {/* Mobile Subscribe Dropdown - Positioned appropriately */}
                  <div
                    className={`absolute top-full -left-20 mt-1 w-60 bg-white border border-orange-200 rounded-lg shadow-lg transition-all duration-300 ${isShopDropdownOpen
                      ? "opacity-100 visible transform translate-y-0"
                      : "opacity-0 invisible transform -translate-y-2"
                      }`}
                  >
                    <div>
                      <p className=" w-full ml-4 pt-2 font-medium text-gray-900 text-[14px]">
                        Subscribe To Our Farm
                      </p>
                    </div>
                    <div className="py-0">
                      <Link href="/login" prefetch={false}>
                        <button
                          onClick={() => {
                            window.dispatchEvent(
                              new CustomEvent("openSignupRestaurant")
                            );
                            setIsShopDropdownOpen(false);
                          }}
                          className="flex items-center w-full text-left px-4 py-2 text-[13px] text-gray-900 border-b hover:text-green-500 transition-colors group"
                        >
                          <UserPlus className="w-4 h-4 mr-3 text-orange-400 group-hover:text-orange-600" />
                          <div>
                            <div className="font-medium">
                              Shop as Restaurant
                            </div>
                          </div>
                        </button>
                      </Link>
                      <button
                        onClick={() => {
                          setIsShopDropdownOpen(false);
                          router?.push("/guest");
                        }}
                        className="flex items-center w-full text-left px-4 py-2 text-[13px] text-gray-900 hover:text-green-500 transition-colors group"
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
                {/* Desktop account menu */}
                <div className="hidden md:block">
                  {isAuthenticated && isMounted ? (
                    // modal={false}: keep page scroll (and the scrollbar) while open, so the layout does not shift
                    <DropdownMenu modal={false}>
                      <DropdownMenuTrigger asChild>
                        <button
                          aria-label="Account menu"
                          className="flex items-center justify-center rounded-full ring-2 ring-green-50/80 hover:ring-white transition-shadow cursor-pointer focus:outline-none focus-visible:ring-orange-300"
                        >
                          {profileImage ? (
                            <OptimizedImage
                              src={profileImage}
                              alt={`${userName}'s profile`}
                              width={32}
                              height={32}
                              className="rounded-full object-cover w-8 h-8"
                              transformation={[
                                {
                                  width: 64,
                                  height: 64,
                                  crop: "fill",
                                  quality: "80",
                                },
                              ]}
                            />
                          ) : (
                            <div className="rounded-full bg-green-50 text-green-800 flex items-center justify-center w-8 h-8 text-sm font-bold">
                              {userName.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        sideOffset={10}
                        className="w-64 rounded-2xl border-green-100 p-0 shadow-xl overflow-hidden"
                      >
                        <div className="px-4 py-3">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {userName}
                          </p>
                          <p className="text-xs text-gray-600 truncate">
                            {user?.email || user?.phone}
                          </p>
                        </div>
                        <DropdownMenuSeparator className="my-0" />
                        <DropdownMenuItem
                          onClick={handleDashboardNavigation}
                          className="gap-3 rounded-none px-4 py-3 text-sm text-gray-900 cursor-pointer focus:bg-green-50"
                        >
                          <LayoutGrid className="w-4 h-4 text-green-700" />
                          My account
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={handleLogout}
                          className="gap-3 rounded-none px-4 py-3 text-sm text-gray-900 cursor-pointer focus:bg-green-50"
                        >
                          <LogOut className="w-4 h-4 text-gray-600" />
                          Sign out
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (isAuthTransitioning || isLoading || !isMounted) ? (
                    <div className="flex items-center gap-2 px-3">
                      <Skeleton className="h-6 w-20 rounded bg-green-600/60" />
                      <Skeleton className="h-6 w-6 rounded-full bg-green-600/60" />
                    </div>
                  ) : (
                    <Link href="/login" prefetch={false}>
                      <button className="bg-green-50 text-[13px] uppercase tracking-wide text-black hover:bg-green-100 px-3 sm:px-4 rounded-full py-1 flex items-center gap-1 cursor-pointer">
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
                    item.isExternal ? (
                      <div key={item.id}>
                        {item.id === "price" ? (
                          <button
                            onClick={() => setIsMobilePriceOpen(!isMobilePriceOpen)}
                            className={`w-full text-left text-[13px] uppercase tracking-wide hover:text-secondary transition-colors cursor-pointer px-2 py-1 rounded flex items-center justify-between ${
                              activeSection === item.id ? "text-yellow-300 bg-green-800/50" : "text-primary-foreground"
                            }`}
                          >
                            <span>{item.label}</span>
                            <span className="text-xs text-primary-foreground">{isMobilePriceOpen ? "▲" : "▼"}</span>
                          </button>
                        ) : (
                          <Link
                            href={item.href}
                            onClick={() => setIsMenuOpen(false)}
                            className={`block text-[13px] uppercase tracking-wide hover:text-secondary transition-colors cursor-pointer px-2 py-1 rounded ${
                              activeSection === item.id ? "text-yellow-300 bg-green-800/50" : "text-primary-foreground"
                            }`}
                          >
                            {item.label}
                          </Link>
                        )}
                      </div>
                    ) : (
                      <a
                        key={item.id}
                        href={item.href}
                        onClick={(e) => handleNavClick(e, item.id)}
                        className={`text-[13px] uppercase tracking-wide hover:text-secondary transition-colors cursor-pointer px-2 py-1 rounded flex items-center justify-between ${activeSection === item.id
                          ? "text-yellow-300 bg-green-800/50"
                          : "text-primary-foreground"
                        }`}
                      >
                        <span>{item.label}</span>
                      </a>
                    )
                  ))}

                  {/* Mobile Login/Profile */}
                  {isAuthenticated ? (
                    <div className="mt-2 pt-2 border-t border-green-600">
                      <div className="flex items-center gap-2 px-2 py-1 text-primary-foreground">
                        <div className="rounded-full flex items-center justify-center">
                          {profileImage ? (
                            <OptimizedImage
                              src={profileImage}
                              alt={`${userName}'s profile`}
                              width={20}
                              height={20}
                              className="rounded-full object-cover p-[15px]"
                              transformation={[
                                {
                                  width: 40,
                                  height: 40,
                                  crop: "fill",
                                  quality: "80",
                                },
                              ]}
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
                        My Account
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
                      <Link href="/login" prefetch={false}>
                        <Button
                          variant="secondary"
                          onClick={() => setIsMenuOpen(!isMenuOpen)}
                          size="sm"
                          className="w-fit bg-green-50 text-black uppercase tracking-wide hover:bg-green-100 mt-2"
                        >
                          Login
                        </Button>
                      </Link>
                    </>
                  )}
                </nav>
              </div>
            )}
            {/* Mobile Price Comparison - Below mobile nav menu */}
            {isMobilePriceOpen && (
              <div className="md:hidden border-t border-green-600 bg-white p-4 overflow-x-auto">
                <h3 className="text-sm font-bold text-gray-900 mb-3">Price Comparison</h3>
                <PriceComparisonPopup />
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
