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
  MapPin,
  QrCode,
  ArrowUpRight,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect, useMemo, useRef } from "react";
import { authService } from "@/app/services/authService";
import Image from "next/image";
import { MdSystemSecurityUpdate } from "react-icons/md";
import { canOpenPage } from "@/lib/admin-permissions";
import { highlightParts, searchLinks, SearchableLink } from "./sidebar-search";
import { RoleSwitchButtons } from "@/components/role-switcher";

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
  "/dashboard/aggregation-sites": ["collection", "drop-off", "pickup", "location", "nearest", "map"],
  "/dashboard/predictive-intelligence": ["ai", "forecast", "prediction", "analytics"],
  "/dashboard/supply-intelligence": ["ai", "supply", "farmers", "forecast"],
  "/dashboard/market-price-intelligence": ["ai", "prices", "market", "trends"],
  "/dashboard/restaurant-kyc": ["verification", "documents", "identity", "compliance", "location", "zone"],
  "/dashboard/vouchers": ["loans", "credit", "card", "bnpl", "repayment", "lending"],
  "/dashboard/deposits": ["wallet", "money", "top up", "balance", "transactions", "payments"],
  "/dashboard/newsletter": ["email", "subscribers", "campaign", "mail"],
  "/dashboard/invitations": ["aggregator applications", "umukusanyi", "qr", "agreement", "collector", "invite", "onboarding", "join", "referral"],
  "/dashboard/users/lookup": ["find", "search", "user", "account", "phone"],
  "/dashboard/users/people": ["people", "everyone", "persons", "users list"],
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
  "/dashboard/settings/voucher-qr": ["qr", "voucher", "apply", "card", "loan", "print", "poster"],
};

// A link is active on its own page and on pages below it ("/dashboard" only on itself)
export function isPathActive(href: string, pathname: string) {
  if (href === "/dashboard") return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}

// Header title for a page: its menu label, with the group it sits in
export function adminPageTitle(pathname: string): { group?: string; title: string } {
  let best: { group?: string; title: string; len: number } | null = null;
  for (const item of menuItems) {
    const links = item.subItems ? item.subItems.map((s) => ({ ...s, group: item.label })) : [{ ...item, group: undefined }];
    for (const l of links) {
      if (isPathActive(l.href, pathname) && (!best || l.href.length > best.len)) {
        best = { group: l.group, title: l.label, len: l.href.length };
      }
    }
  }
  return best ? { group: best.group, title: best.title } : { title: "Dashboard" };
}

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
    icon: DollarSign,
    label: "ebm",
    href: "/dashboard/ebm",
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
    icon: MapPin,
    label: "Aggregation Sites",
    href: "/dashboard/aggregation-sites",
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
        icon: Users,
        label: "All users",
        href: "/dashboard/users/people",
      },
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
      {
        icon: QrCode,
        label: "Voucher QR",
        href: "/dashboard/settings/voucher-qr",
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

  const isItemActive = (item: any) => isPathActive(item.href, pathname);

  const hasActiveSubItem = (item: any) => {
    if (item.subItems) {
      return item.subItems.some((subItem: any) => isPathActive(subItem.href, pathname));
    }
    return false;
  };

  const isSubItemActive = (subItem: any) => isPathActive(subItem.href, pathname);

  const userName = userData?.name || userData?.username || "";
  const roleLabel =
    userData?.role === "SUPERUSER" ? "Super Admin" : userData?.adminRole?.name || userData?.role || "Role";

  return (
    <div className="relative w-60 min-w-60 h-screen supports-[height:100dvh]:h-dvh overflow-hidden bg-[#0B2E1F] text-white">
      {/* Soft glows from the site's hero gradient */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(circle at 0% 0%, #00D04833 0, transparent 45%), radial-gradient(circle at 100% 100%, #18A0A033 0, transparent 45%)",
        }}
      />
      <div
        className={`
          fixed md:relative
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          z-50 md:z-auto
          w-60 min-w-60 h-screen supports-[height:100dvh]:h-dvh flex flex-col shrink-0
          transition-transform duration-300 ease-in-out relative
        `}
      >
        {/* Logo */}
        <div className="relative z-10 shrink-0 px-4 pb-3 pt-4">
          <Link href="/" className="inline-flex items-center gap-2.5 rounded-full bg-white py-1 pl-1.5 pr-3.5" aria-label="Food Bundles home">
            <Image src="/home/food-bundles-logo.png" alt="" width={33} height={28} className="h-7 w-auto" />
            <span className="text-[15px] font-bold tracking-tight text-[#0B2E1F] [font-family:var(--font-inter-tight),sans-serif]">
              Food Bundles
            </span>
          </Link>
          <p className="m-0 mt-2 px-1 text-[11px] font-bold uppercase tracking-[1.4px] text-[#7CF2A6]/80">Admin dashboard</p>
        </div>

        {/* Search */}
        <div className="relative z-10 shrink-0 px-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search menu…"
              aria-label="Search menu"
              className="h-10 w-full rounded-xl border border-white/15 bg-white/10 pl-9 pr-14 text-[14px] text-white placeholder:text-white/50 transition-colors focus:border-[#00D048] focus:outline-none"
            />
            {query ? (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => {
                  setQuery("");
                  searchRef.current?.focus();
                }}
                className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            ) : (
              <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md border border-white/20 px-1.5 text-[10px] text-white/60">
                Ctrl K
              </kbd>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav aria-label="Admin" className="relative z-10 flex-1 overflow-auto py-3 scrollbar-hide">
          {isSearching ? (
            <div className="px-3 pb-4">
              <p className="px-2 pb-2 text-[11px] font-bold uppercase tracking-[1px] text-[#7CF2A6]/80">
                {isFallback ? "No exact match — closest links" : `${searchResults.length} result${searchResults.length === 1 ? "" : "s"}`}
              </p>
              <ul className="space-y-0.5">
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
                          "flex min-h-11 w-full items-center rounded-xl px-3 py-1.5 text-left text-[14px] transition-colors",
                          isHighlighted ? "bg-[#00D048] text-[#0B2E1F]" : "text-white/85 hover:bg-white/10 hover:text-white",
                        )}
                      >
                        <Icon className="mr-3 h-4 w-4 shrink-0" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-semibold">
                            {highlightParts(link.label, isFallback ? "" : query).map((part, p) =>
                              part.match ? (
                                <mark key={p} className="rounded-sm bg-[#E9B949]/40 font-bold text-inherit">
                                  {part.text}
                                </mark>
                              ) : (
                                <span key={p}>{part.text}</span>
                              ),
                            )}
                          </span>
                          {link.parentLabel && (
                            <span className={cn("block truncate text-[11px]", isHighlighted ? "text-[#0B2E1F]/70" : "text-white/50")}>
                              {link.parentLabel}
                            </span>
                          )}
                        </span>
                        {isHighlighted && <CornerDownLeft className="ml-2 h-3.5 w-3.5 shrink-0" />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : (
            <ul className="space-y-0.5 px-3 pb-4">
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
                          type="button"
                          onClick={() => toggleExpanded(index)}
                          aria-expanded={isExpanded}
                          className={cn(
                            "flex min-h-10 w-full items-center justify-between rounded-xl px-3 text-[14px] font-semibold transition-colors whitespace-nowrap",
                            hasActiveSub ? "bg-white/10 text-white" : "text-white/85 hover:bg-white/10 hover:text-white",
                          )}
                        >
                          <span className="flex min-w-0 items-center">
                            <item.icon className={cn("mr-3 h-[18px] w-[18px] shrink-0", hasActiveSub ? "text-[#00D048]" : "")} />
                            <span className="truncate">{item.label}</span>
                          </span>
                          <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform", !isExpanded && "-rotate-90")} />
                        </button>
                        {isExpanded && (
                          <ul className="ml-[22px] mt-0.5 space-y-0.5 border-l border-white/15 pl-2">
                            {item.subItems.map((subItem, subIndex) => {
                              const isSubActive = isSubItemActive(subItem);
                              return (
                                <li key={subIndex}>
                                  <Link
                                    href={subItem.href}
                                    onClick={() => onClose()}
                                    aria-current={isSubActive ? "page" : undefined}
                                    className={cn(
                                      "flex min-h-9 items-center rounded-lg px-2.5 text-[13px] transition-colors whitespace-nowrap",
                                      isSubActive
                                        ? "bg-[#00D048] font-bold text-[#0B2E1F]"
                                        : "text-white/75 hover:bg-white/10 hover:text-white",
                                    )}
                                  >
                                    <subItem.icon className="mr-2.5 h-3.5 w-3.5 shrink-0" />
                                    <span className="truncate">{subItem.label}</span>
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
                        aria-current={isActive ? "page" : undefined}
                        className={cn(
                          "flex min-h-10 items-center rounded-xl px-3 text-[14px] font-semibold transition-colors whitespace-nowrap",
                          isActive ? "bg-[#00D048] text-[#0B2E1F]" : "text-white/85 hover:bg-white/10 hover:text-white",
                        )}
                      >
                        <item.icon className="mr-3 h-[18px] w-[18px] shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </nav>

        {/* Account */}
        <div className="relative z-10 shrink-0 border-t border-white/10 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          {userDropdownOpen && (
            <div className="absolute bottom-full left-3 right-3 mb-2 overflow-hidden rounded-xl bg-white text-[#0B2E1F] shadow-[0_20px_40px_-12px_#000]">
              <div className="border-b border-[#DCE6DF] px-3 py-2.5">
                <p className="m-0 truncate text-[14px] font-bold">{userName || "—"}</p>
                {userData?.email && (
                  <p className="m-0 mt-0.5 flex items-center truncate text-[12px] text-[#4A6358]">
                    <Mail className="mr-1.5 h-3 w-3 shrink-0" />
                    <span className="truncate">{userData.email}</span>
                  </p>
                )}
              </div>
              <RoleSwitchButtons className="border-b border-[#DCE6DF]" />
              <Link
                href="/"
                className="flex min-h-10 items-center gap-2 px-3 text-[14px] hover:bg-[#F6F9F7]"
              >
                <ArrowUpRight className="h-4 w-4" />
                Visit food.rw
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className={cn(
                  "flex min-h-10 w-full items-center gap-2 px-3 text-[14px] text-red-600 hover:bg-red-50",
                  isLoggingOut && "cursor-not-allowed opacity-50",
                )}
              >
                <LogOut className="h-4 w-4" />
                {isLoggingOut ? "Logging out…" : "Log out"}
              </button>
            </div>
          )}
          <button
            type="button"
            onClick={() => setUserDropdownOpen((o) => !o)}
            aria-expanded={userDropdownOpen}
            className="flex w-full items-center gap-2.5 rounded-xl px-2 py-1.5 text-left transition-colors hover:bg-white/10"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#00D048] text-[13px] font-bold text-[#0B2E1F]">
              {userName ? userName.substring(0, 2).toUpperCase() : <User className="h-4 w-4" />}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[14px] font-bold">{userName || "…"}</span>
              <span className="block truncate text-[11px] text-white/60">{roleLabel}</span>
            </span>
            <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform", userDropdownOpen && "rotate-180")} />
          </button>
        </div>
      </div>
    </div>
  );
}
