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
} from "lucide-react";
import NotificationsDrawer from "@/app/(private)/restaurant/_components/notificationDrawer";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { authService } from "@/app/services/authService";
import { OptimizedImage } from "@/components/OptimizedImage";

const menuItems = [
  { icon: Users, label: "Affiliators", href: "/dashboard/users/affiliators" },
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  {
    icon: FileText,
    label: "Farmer Submission",
    href: "/dashboard/farmer-submissions",
  },
  {
    icon: ShoppingCart,
    label: "Restaurant Orders",
    href: "/dashboard/restaurant-orders",
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
    ],
  },
  {
    icon: Crown,
    label: "Subscriptions",
    href: "/dashboard/subscriptions",
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
        icon: UserCheck,
        label: "Farmers",
        href: "/dashboard/users/farmers",
      },
      {
        icon: Soup,
        label: "Restaurants",
        href: "/dashboard/users/restaurants",
      },
      {
        icon: UserCog,
        label: "Administration",
        href: "/dashboard/users/administration",
      },
    ],
  },
  {
    icon: UserPlus,
    label: "Message",
    href: "/dashboard/contact-submissions",
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
  }, []);

  const handleUserDropdownToggle = () => {
    setUserDropdownOpen(!userDropdownOpen);
    if (!userDropdownOpen) {
      setTimeout(() => {
        const nav = document.querySelector('nav');
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
      {/* Animated Squares Background */}
      <div className="absolute inset-0 animated-squares z-0" />

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
              Food Bundles Ltd
            </h1>
          </div>
          </Link>
          <NotificationsDrawer isOpen={false} onClose={() => {}} />
          <NotificationsDrawer
            isOpen={false}
            onClose={() => { }}
          />
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-2 md:py-4 mb-10 overflow-auto scrollbar-hide relative z-10">
          <ul className="space-y-1 px-2 md:px-3 pb-4">
            {menuItems.map((item, index) => {
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
                          isActive && !hasActiveSub
                            ? "bg-green-500 hover:bg-green-600 text-white"
                            : "text-green-200 hover:bg-green-700 hover:text-white"
                        )}
                      >
                        <div className="flex items-center">
                          <item.icon
                            className={cn(
                              "mr-2 md:mr-3 h-4 w-4 md:h-5 md:w-5",
                              isActive && !hasActiveSub
                                ? "text-green-200"
                                : "text-green-500"
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
                                      : "text-green-200 hover:bg-green-600 hover:text-white"
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
                          : "text-green-200 hover:bg-green-700 hover:text-white"
                      )}
                    >
                      <item.icon
                        className={cn(
                          "mr-2 md:mr-3 h-4 w-4 md:h-5 md:w-5",
                          isActive ? "text-white" : "text-green-500"
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
                    {userData?.role || "Role"}
                  </div>
                </div>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform",
                    userDropdownOpen && "rotate-180"
                  )}
                />
              </button>

              {userDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1  bg-green-800 border border-green-600 rounded-md shadow-lg z-50">
                  <div className="p-3 border-b border-green-600">
                    <div className="text-xs text-green-200 font-medium truncate">
                      {userData?.name || userData?.username || "User"}
                    </div>
                    <div className="text-[10px] text-green-400 truncate mt-1">
                      {userData?.role || "Role"}
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
                      isLoggingOut && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {isLoggingOut ? "Logging out..." : "Logout"}
                  </button>
                </div>
              )}
            </li>
          </ul>

          {/* Help Center */}
          <div className="p-4 shrink-0">
            <div className="bg-green-100 rounded-lg p-4 text-center">
              <div className="w-16 h-16 bg-green-300 rounded-full flex items-center justify-center mx-auto mb-2">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                  <HelpCircle className="h-6 w-6 text-white" />
                </div>
              </div>

              <h3 className="text-sm font-medium text-gray-800 mb-1">
                Help center
              </h3>
              <Link href="/dashboard/contact-submissions">
                <Button className="w-full bg-green-600 text-white text-xs py-2 px-3 cursor-pointer rounded-md hover:bg-green-700 transition-colors">
                  Go to help center
                </Button>
              </Link>
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
}
