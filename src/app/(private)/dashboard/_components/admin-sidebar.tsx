/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { cn } from "@/lib/utils";
import {
  // LayoutDashboard,
  FileText,
  ShoppingCart,
  Package,
  Users,
  LogOut,
  ChevronDown,
  ChevronRight,
  User,
  Mail,
  UserCheck,
  UserCog,
  Soup,
  Crown,
  Ticket,
  UserPlus,
  LayoutDashboard,
  Wallet,
  Box,
  Tags,
  Boxes,
  BarChart3,
  Bell,
  Settings,
  DollarSign,
  TrendingUp,
  CreditCard,
  MailOpen,
  ShieldCheck,
  Brain,
  Sprout,
  FileCheck,
  KeyRound,
  Trash2,
  Truck,
  ClipboardCheck,
  ClipboardList,
  Search,
  X,
  CornerDownLeft,
} from "lucide-react";
import NotificationsDrawer from "@/app/(private)/restaurant/_components/notificationDrawer";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect, useMemo, useRef } from "react";
import { authService } from "@/app/services/authService";
import { OptimizedImage } from "@/components/OptimizedImage";
import { MdSystemSecurityUpdate } from "react-icons/md";
import { canOpenPage } from "@/lib/admin-permissions";
import { highlightParts, searchLinks, SearchableLink } from "./sidebar-search";

// Extra words people may type when looking for a page, so search finds related links
const searchKeywords: Record<string, string[]> = {
  "/dashboard": ["home", "overview", "analytics", "stats", "summary"],
  "/dashboard/farmer-submissions": ["farmers", "produce", "harvest", "supply", "verify", "approve"],
  "/dashboard/restaurant-orders": ["orders", "sales", "purchases", "delivery", "invoice", "receipt", "ebm"],
  "/dashboard/submission-verification": ["aggregator", "verify", "weigh", "harvest", "farmers", "accept"],
  "/dashboard/users/trash": ["deleted", "removed", "restore", "recycle", "bin"],
  "/dashboard/supply-requests": ["school", "needs", "demand", "list", "timetable", "aggregator", "request"],
  "/dashboard/deliveries": ["logistics", "delivery", "transit", "otp", "dispatch", "driver"],
  "/dashboard/stock/products": ["items", "inventory", "goods", "catalog", "price"],
  "/dashboard/stock/categories": ["groups", "types", "classification"],
  "/dashboard/stock/units": ["kg", "measure", "measurement", "quantity", "weight"],
  "/dashboard/stock/payment-methods": ["momo", "mobile money", "card", "cash", "pay", "bank"],
  "/dashboard/stock/customer-types": ["pricing", "hotel", "restaurant", "tiers", "price"],
  "/dashboard/stock/fb-reports": ["reports", "sales", "tabletronic", "revenue"],
  "/dashboard/subscriptions": ["plans", "premium", "membership", "billing"],
  "/dashboard/markets": ["prices", "market", "wfp", "commodity", "trends"],
  "/dashboard/predictive-intelligence": ["ai", "forecast", "prediction", "analytics"],
  "/dashboard/supply-intelligence": ["ai", "supply", "farmers", "forecast"],
  "/dashboard/market-price-intelligence": ["ai", "prices", "market", "trends"],
  "/dashboard/restaurant-kyc": ["verification", "documents", "identity", "compliance", "location", "zone"],
  "/dashboard/vouchers": ["loans", "credit", "card", "bnpl", "repayment", "lending"],
  "/dashboard/deposits": ["wallet", "money", "top up", "balance", "transactions", "payments"],
  "/dashboard/newsletter": ["email", "subscribers", "campaign", "mail"],
  "/dashboard/invitations": ["invite", "onboarding", "join", "referral"],
  "/dashboard/users/lookup": ["find", "search", "user", "account", "phone"],
  "/dashboard/users/farmers": ["growers", "suppliers"],
  "/dashboard/users/restaurants": ["clients", "restaurants", "hotels", "schools", "buyers"],
  "/dashboard/users/affiliators": ["affiliates", "agents", "partners", "referral"],
  "/dashboard/users/administration": ["admins", "staff", "team", "employees"],
  "/dashboard/users/roles": ["permissions", "access", "rbac", "privileges", "security"],
  "/dashboard/contact-submissions": ["messages", "contact", "inbox", "support", "feedback"],
  "/dashboard/promo-codes": ["discounts", "coupons", "offers", "promotion", "gift"],
  "/dashboard/settings/notification-recipient": ["sms", "alerts", "notifications", "phone"],
  "/dashboard/settings/delivery-fees": ["shipping", "transport", "logistics", "distance"],
  "/dashboard/settings/authenticator": ["2fa", "mfa", "otp", "security", "two factor"],
};

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  {
    // Farmer journey: manage every stage, or verify face to face
    icon: FileText,
    label: "Farmer Submissions",
    href: "/dashboard/submissions",
    subItems: [
      {
        icon: FileText,
        label: "Submission Management",
        href: "/dashboard/farmer-submissions",
      },
      {
        icon: ClipboardCheck,
        label: "Verify Submissions",
        href: "/dashboard/submission-verification",
      },
      {
        icon: ClipboardList,
        label: "Supply Requests",
        href: "/dashboard/supply-requests",
      },
    ],
  },
  {
    icon: ShoppingCart,
    label: "Restaurant Orders",
    href: "/dashboard/restaurant-orders",
  },
  {
    icon: Truck,
    label: "Deliveries",
    href: "/dashboard/deliveries",
  },
  {
    icon: Package,
    label: "Stock",
    href: "/dashboard/stock",
    subItems: [
      {
        icon: Box,
        label: "Products",
        href: "/dashboard/stock/products",
      },
      {
        icon: Tags,
        label: "Categories",
        href: "/dashboard/stock/categories",
      },
      {
        icon: Boxes,
        label: "Units",
        href: "/dashboard/stock/units",
      },
      {
        icon: CreditCard,
        label: "Payment Methods",
        href: "/dashboard/stock/payment-methods",
      },
      {
        icon: Users,
        label: "Customer Types",
        href: "/dashboard/stock/customer-types",
      },
      {
        icon: BarChart3,
        label: "Tt Sales Reports",
        href: "/dashboard/stock/fb-reports",
      },
    ],
  },
  {
    icon: Crown,
    label: "Subscriptions",
    href: "/dashboard/subscriptions",
  },
  {
    icon: TrendingUp,
    label: "Market Prices",
    href: "/dashboard/markets",
  },
  {
    icon: Brain,
    label: "Intelligence",
    href: "/dashboard/intelligence",
    subItems: [
      {
        icon: Brain,
        label: "Predictive Intelligence",
        href: "/dashboard/predictive-intelligence",
      },
      {
        icon: Sprout,
        label: "Supply Intelligence",
        href: "/dashboard/supply-intelligence",
      },
      {
        icon: TrendingUp,
        label: "Market Price Intelligence",
        href: "/dashboard/market-price-intelligence",
      },
    ],
  },
  {
    icon: ShieldCheck,
    label: "Restaurant KYC",
    href: "/dashboard/restaurant-kyc",
  },
  {
    icon: Ticket,
    label: "Voucher Management",
    href: "/dashboard/vouchers",
  },
  {
    icon: Wallet,
    label: "Deposit Management",
    href: "/dashboard/deposits",
  },
  {
    icon: MailOpen,
    label: "Newsletter",
    href: "/dashboard/newsletter",
  },
  {
    icon: UserPlus,
    label: "Invitations",
    href: "/dashboard/invitations",
  },
  {
    icon: Users,
    label: "Users",
    href: "/dashboard/users",
    subItems: [
      {
        icon: User,
        label: "User Lookup",
        href: "/dashboard/users/lookup",
      },
      {
        icon: UserCheck,
        label: "Farmers",
        href: "/dashboard/users/farmers",
      },
      {
        icon: Soup,
        label: "Customers",
        href: "/dashboard/users/restaurants",
      },
      {
        icon: Users,
        label: "Affiliators",
        href: "/dashboard/users/affiliators",
      },
      {
        icon: UserCog,
        label: "Administration",
        href: "/dashboard/users/administration",
      },
      {
        icon: KeyRound,
        label: "Roles & Permissions",
        href: "/dashboard/users/roles",
      },
      {
        icon: Trash2,
        label: "Trash",
        href: "/dashboard/users/trash",
      },
    ],
  },
  {
    icon: UserPlus,
    label: "Message",
    href: "/dashboard/contact-submissions",
  },
  {
    icon: Ticket,
    label: "Promo Codes",
    href: "/dashboard/promo-codes",
  },
  {
    icon: Settings,
    label: "Settings",
    href: "/dashboard/settings",
    subItems: [
      {
        icon: Bell,
        label: "SMS Recipients",
        href: "/dashboard/settings/notification-recipient",
      },
      {
        icon: Truck,
        label: "Delivery Fees",
        href: "/dashboard/settings/delivery-fees",
      },
      {
        icon: MdSystemSecurityUpdate,
        label: "Authenticator",
        href: "/dashboard/settings/authenticator",
      },
    ],
  },
];

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  // Show only what the user's role permits. Until /me loads, show just the
  // Dashboard link so restricted items never flash on screen.
  const filteredMenuItems = !userData
    ? menuItems.filter((item) => item.href === "/dashboard")
    : menuItems
        .map((item) =>
          item.subItems
            ? { ...item, subItems: item.subItems.filter((sub) => canOpenPage(userData, sub.href)) }
            : item
        )
        .filter((item) =>
          item.subItems ? item.subItems.length > 0 : canOpenPage(userData, item.href)
        );

  // ─── Search ────────────────────────────────────────────────────────────────
  const router = useRouter();
  const searchRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [highlighted, setHighlighted] = useState(0);

  // Only links the user may open, flattened so sub-links are searchable too
  const searchableLinks = useMemo<SearchableLink[]>(
    () =>
      filteredMenuItems.flatMap<SearchableLink>((item) =>
        item.subItems
          ? item.subItems.map((sub) => ({
              ...sub,
              parentLabel: item.label,
              keywords: searchKeywords[sub.href],
            }))
          : [{ ...item, keywords: searchKeywords[item.href] }],
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [userData],
  );

  const { results: searchResults, isFallback } = useMemo(
    () => searchLinks(searchableLinks, query),
    [searchableLinks, query],
  );
  const isSearching = query.trim().length > 0;

  useEffect(() => {
    setHighlighted(0);
  }, [query]);

  // Ctrl/Cmd + K focuses the search box
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const openLink = (href: string) => {
    setQuery("");
    searchRef.current?.blur();
    onClose();
    router.push(href);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setQuery("");
      return;
    }
    if (!searchResults.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((h) => (h + 1) % searchResults.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => (h - 1 + searchResults.length) % searchResults.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      openLink(searchResults[highlighted]?.href ?? searchResults[0].href);
    }
  };

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await authService.getCurrentUser();
        setUserData(response.user);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };
    fetchUserData();

    // Auto-expand menu items with active sub-items
    filteredMenuItems.forEach((item, index) => {
      if (item.subItems && hasActiveSubItem(item)) {
        setExpandedItems((prev) => new Set(prev).add(index));
      }
    });
  }, [pathname]);

  const handleUserDropdownToggle = () => {
    setUserDropdownOpen(!userDropdownOpen);
    if (!userDropdownOpen) {
      setTimeout(() => {
        const nav = document.querySelector("nav");
        if (nav) {
          nav.scrollTop = nav.scrollHeight;
        }
      }, 100);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authService.logout();
      await new Promise((resolve) => setTimeout(resolve, 500));
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      window.location.href = "/";
    }
  };

  const isItemActive = (item: any) => {
    if (item.subItems) {
      return pathname === item.href;
    }
    return pathname === item.href;
  };

  const hasActiveSubItem = (item: any) => {
    if (item.subItems) {
      return item.subItems.some((subItem: any) => pathname === subItem.href);
    }
    return false;
  };

  const isSubItemActive = (subItem: any) => {
    return pathname === subItem.href;
  };

  return (
    <div className="relative w-60 min-w-60 h-screen overflow-hidden bg-green-800">
      <div
        className={`
          fixed md:relative
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          z-50 md:z-auto
          w-60 min-w-60 h-screen border-r border-gray-200 flex flex-col shrink-0 
          transition-transform duration-300 ease-in-out relative
        `}
        style={{ backgroundColor: "transparent" }}
      >
        {/* Logo */}
        <div className="p-3 md:p-4 flex items-center justify-between shrink-0 relative z-10 bg-green-900 backdrop-blur-sm">
          <Link href="/">
            <div className="flex items-center gap-2">
              <OptimizedImage
                src="/imgs/Food_bundle_logo.png"
                alt="Logo"
                width={40}
                height={40}
                className="w-7 h-7 md:w-8 md:h-8 rounded-full object-cover"
              />
              <h1 className="text-sm font-bold text-green-100">
                Food Bundles
              </h1>
            </div>
          </Link>
          <NotificationsDrawer isOpen={false} onClose={() => {}} />
          <NotificationsDrawer isOpen={false} onClose={() => {}} />
        </div>

        {/* Search */}
        <div className="px-2 md:px-3 pt-3 shrink-0 relative z-10">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-green-400" />
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search menu..."
              aria-label="Search menu"
              className="w-full rounded-md bg-green-900/60 border border-green-700 focus:border-green-400 focus:outline-none pl-8 pr-14 py-1.5 text-xs text-green-50 placeholder:text-green-400/80 transition-colors"
            />
            {query ? (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => {
                  setQuery("");
                  searchRef.current?.focus();
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded text-green-300 hover:text-white hover:bg-green-700"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : (
              <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border border-green-700 px-1 text-[9px] text-green-400">
                Ctrl K
              </kbd>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-2 md:py-4 mb-10 overflow-auto scrollbar-hide relative z-10">
          {isSearching ? (
            <div className="px-2 md:px-3 pb-4">
              <p className="px-2 pb-2 text-[10px] uppercase tracking-wider text-green-400">
                {isFallback ? "No exact match — closest links" : `${searchResults.length} result${searchResults.length === 1 ? "" : "s"}`}
              </p>
              <ul className="space-y-1">
                {searchResults.map((link, i) => {
                  const Icon = link.icon;
                  const isHighlighted = i === highlighted;
                  return (
                    <li key={link.href}>
                      <button
                        type="button"
                        onClick={() => openLink(link.href)}
                        onMouseEnter={() => setHighlighted(i)}
                        className={cn(
                          "w-full flex items-center px-3 py-2 rounded-md text-xs text-left transition-colors",
                          isHighlighted
                            ? "bg-green-600 text-white"
                            : "text-green-200 hover:bg-green-700 hover:text-white",
                          pathname === link.href && !isHighlighted && "bg-green-700/60",
                        )}
                      >
                        <Icon className={cn("mr-2 md:mr-3 h-4 w-4 shrink-0", isHighlighted ? "text-green-100" : "text-green-500")} />
                        <span className="flex-1 min-w-0">
                          <span className="block truncate">
                            {highlightParts(link.label, isFallback ? "" : query).map((part, p) =>
                              part.match ? (
                                <mark key={p} className="bg-yellow-300/30 text-inherit rounded-sm font-semibold">
                                  {part.text}
                                </mark>
                              ) : (
                                <span key={p}>{part.text}</span>
                              ),
                            )}
                          </span>
                          {link.parentLabel && (
                            <span className="block truncate text-[10px] text-green-400">
                              {link.parentLabel}
                            </span>
                          )}
                        </span>
                        {isHighlighted && <CornerDownLeft className="ml-2 h-3 w-3 shrink-0 text-green-200" />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : (
          <ul className="space-y-1 px-2 md:px-3 pb-4">
            {filteredMenuItems.map((item, index) => {
              const isActive = isItemActive(item);
              const hasActiveSub = hasActiveSubItem(item);
              const isExpanded = expandedItems.has(index);
              const hasSubItems = item.subItems && item.subItems.length > 0;

              return (
                <li key={index}>
                  {hasSubItems ? (
                    <>
                      <button
                        onClick={() => toggleExpanded(index)}
                        className={cn(
                          "w-full flex items-center px-3 py-2 rounded-md text-xs transition-colors whitespace-nowrap justify-between",
                          (isActive && !hasActiveSub) || hasActiveSub
                            ? "bg-green-500 hover:bg-green-600 text-white"
                            : "text-green-200 hover:bg-green-700 hover:text-white",
                        )}
                      >
                        <div className="flex items-center">
                          <item.icon
                            className={cn(
                              "mr-2 md:mr-3 h-4 w-4 md:h-5 md:w-5",
                              (isActive && !hasActiveSub) || hasActiveSub
                                ? "text-green-200"
                                : "text-green-500",
                            )}
                          />
                          {item.label}
                        </div>
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
                      {isExpanded && (
                        <ul className="mt-1 ml-6 space-y-1">
                          {item.subItems.map((subItem, subIndex) => {
                            const isSubActive = isSubItemActive(subItem);
                            return (
                              <li key={subIndex}>
                                <Link
                                  href={subItem.href}
                                  onClick={() => onClose()}
                                  className={cn(
                                    "flex items-center px-2 md:px-3 py-2 rounded text-xs transition-colors whitespace-nowrap",
                                    isSubActive
                                      ? "bg-green-600 text-white"
                                      : "text-green-200 hover:bg-green-600 hover:text-white",
                                  )}
                                >
                                  <subItem.icon className="mr-2 md:mr-3 h-2 w-2 md:h-3 md:w-3" />
                                  <span className="truncate text-[13px]">
                                    {subItem.label}
                                  </span>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={() => onClose()}
                      className={cn(
                        "flex items-center px-2 md:px-3 py-2 text-xs transition-colors whitespace-nowrap rounded-md",
                        isActive
                          ? "bg-green-700 hover:bg-green-700 text-green-200"
                          : "text-green-200 hover:bg-green-700 hover:text-white",
                      )}
                    >
                      <item.icon
                        className={cn(
                          "mr-2 md:mr-3 h-4 w-4 md:h-5 md:w-5",
                          isActive ? "text-white" : "text-green-500",
                        )}
                      />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  )}
                </li>
              );
            })}

            {/* User Account Dropdown */}
            <li className="relative">
              <button
                onClick={handleUserDropdownToggle}
                className="w-full flex items-center px-3 py-2 rounded-md text-xs transition-colors whitespace-nowrap text-green-200 hover:bg-green-700 hover:text-white"
              >
                <User className="mr-3 h-5 w-5 text-green-500" />
                <div className="flex-1 text-left mr-2">
                  <div className="truncate">
                    {userData?.name || userData?.username}
                  </div>
                  <div className="text-[10px] text-green-400 truncate">
                    {userData?.role === "SUPERUSER" ? "Super Admin" : userData?.adminRole?.name || userData?.role || "Role"}
                  </div>
                </div>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform",
                    userDropdownOpen && "rotate-180",
                  )}
                />
              </button>

              {userDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1  bg-green-800 border border-green-600 rounded-md shadow-lg z-50">
                  <div className="p-3 border-b border-green-600">
                    <div className="text-[10px] text-green-400 truncate mt-1">
                      {userData?.role === "SUPERUSER" ? "Super Admin" : userData?.adminRole?.name || userData?.role || "Role"}
                    </div>
                    {userData?.email && (
                      <div className="flex items-center mt-2 text-[10px] text-green-300">
                        <Mail className="mr-1 h-3 w-3" />
                        <span className="truncate">{userData.email}</span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className={cn(
                      "w-full flex items-center px-3 py-2 text-xs transition-colors",
                      "text-red-300 hover:text-red-400 hover:bg-green-700",
                      isLoggingOut && "opacity-50 cursor-not-allowed",
                    )}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {isLoggingOut ? "Logging out..." : "Logout"}
                  </button>
                </div>
              )}
            </li>
          </ul>
          )}
        </nav>
      </div>
    </div>
  );
}
