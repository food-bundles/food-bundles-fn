/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  // LayoutDashboard,
  FileText,
  ShoppingCart,
  Package,
  CreditCard,
  TrendingUp,
  Users,
  LogOut,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  UserCheck,
  UserCog,
  Soup,
  Crown,
  Ticket,
} from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { authService } from "@/app/services/authService";
import { OptimizedImage } from "@/components/OptimizedImage";

const menuItems = [
  // { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
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
  { icon: Package, label: "Inventory", href: "/dashboard/inventory" },
  {
    icon: CreditCard,
    label: "Payments",
    href: "/dashboard/payments",
  },
  { icon: TrendingUp, label: "Sales", href: "/dashboard/sales" },
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
];

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
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
      return (
        item.subItems.some((subItem: any) => pathname === subItem.href) ||
        pathname === item.href
      );
    }
    return pathname === item.href;
  };

  const isSubItemActive = (subItem: any) => {
    return pathname === subItem.href;
  };

  return (
    <div className="relative w-60 min-w-60 h-screen overflow-hidden bg-green-900">
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
        <div className="p-3 md:p-4 flex items-center gap-2 shrink-0 relative z-10 bg-green-700 backdrop-blur-sm">
          <OptimizedImage
            src="/imgs/Food_bundle_logo.png"
            alt="Logo"
            width={40}
            height={40}
            className="w-7 h-7 md:w-8 md:h-8 rounded-full object-cover"
          />
          <h1 className="text-lg md:text-xl font-bold text-green-100">
            FoodBundles
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-2 md:py-4 overflow-auto scrollbar-hide relative z-10">
          <ul className="space-y-1 px-2 md:px-3 pb-4">
            {menuItems.map((item, index) => {
              const isActive = isItemActive(item);
              const isExpanded = expandedItems.has(index);
              const hasSubItems = item.subItems && item.subItems.length > 0;

              return (
                <li key={index}>
                  {hasSubItems ? (
                    <>
                      <button
                        onClick={() => toggleExpanded(index)}
                        className={cn(
                          "w-full flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap justify-between",
                          isActive
                            ? "bg-green-500 hover:bg-green-600 text-white"
                            : "text-green-200 "
                        )}
                      >
                        <div className="flex items-center hover:text-green-500">
                          <item.icon
                            className={cn(
                              "mr-2 md:mr-3 h-4 w-4 md:h-5 md:w-5",
                              isActive ? "text-white" : " text-green-500"
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
                                    "flex items-center px-2 md:px-3 py-2 rounded text-xs md:text-sm font-medium transition-colors whitespace-nowrap",
                                    isSubActive
                                      ? "bg-transparent text-green-600 "
                                      : "text-gray-600 "
                                  )}
                                >
                                  <subItem.icon className="mr-2 md:mr-3 h-2 w-2 md:h-3 md:w-3 text-green-500" />
                                  <span className="truncate text-[12px] text-green-200 hover:text-green-500">
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
                        "flex items-center px-2 md:px-3 py-2 text-xs md:text-sm font-medium transition-colors whitespace-nowrap rounded-md",
                        isActive ? "bg-green-700 hover:bg-green-600" : ""
                      )}
                    >
                      <item.icon
                        className={cn(
                          "mr-2 md:mr-3 h-4 w-4 md:h-5 md:w-5",
                          isActive ? "text-white" : " text-green-500"
                        )}
                      />
                      <span className="truncate text-green-200 hover:text-green-500">
                        {item.label}
                      </span>
                    </Link>
                  )}
                </li>
              );
            })}

            {/* Logout Button */}
            <li>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className={cn(
                  "w-full flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap",
                  "text-red-300  hover:text-red-400",
                  isLoggingOut && "opacity-50 cursor-not-allowed"
                )}
              >
                <LogOut className="mr-3 h-5 w-5 text-green-600" />
                {isLoggingOut ? "Logging out..." : "Logout"}
              </button>
            </li>
          </ul>

          {/* Help Center */}
          <div className="p-4 shrink-0">
            <div className="bg-green-100 rounded-lg p-4 text-center">
              <div className="w-16 h-16 bg-green-300 rounded-full flex items-center justify-center mx-auto mb-5">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                  <HelpCircle className="h-6 w-6 text-white" />
                </div>
              </div>

              <h3 className="text-sm font-medium text-gray-800 mb-1">
                Help center
              </h3>
              <p className="text-xs text-gray-600 mb-3">
                Get support for managing your food production and inventory.
              </p>
              <Button className="w-full bg-green-600 text-white text-xs py-2 px-3 rounded-md hover:bg-green-700 transition-colors">
                Go to help center
              </Button>
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
}
