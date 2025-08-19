/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
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
} from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  {
    icon: FileText,
    label: "Farmer Submission",
    href: "/admin/farmer-submissions",
  },
  {
    icon: ShoppingCart,
    label: "Restaurant Orders",
    href: "/admin/restaurant-orders",
  },
  { icon: Package, label: "Inventory", href: "/admin/inventory" },
  {
    icon: CreditCard,
    label: "Payments",
    href: "/admin/payments",
  },
  { icon: TrendingUp, label: "Sales", href: "/admin/sales" },
  {
    icon: Users,
    label: "Users",
    href: "/admin/users",
    subItems: [
      {
        icon: UserCheck,
        label: "Farmers",
        href: "/admin/users/farmers",
      },
      {
        icon: Soup,
        label: "Restaurants",
        href: "/admin/users/restaurants",
      },
      {
        icon: UserCog,
        label: "Administration",
        href: "/admin/users/administration",
      },
    ],
  },
  { icon: LogOut, label: "Logout", href: "/" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState(new Set());

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
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

  const isSubItemActive = (subItem:any) => {
    return pathname === subItem.href;
  };

  return (
    <div className="w-64 min-w-64 h-screen border-r border-gray-200 bg-gray-50 flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="p-4 flex-shrink-0">
        <h1 className="text-xl font-bold text-black">Food Bundle</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-auto scrollbar-hide">
        <ul className="space-y-1 px-3 pb-4">
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
                          ? "bg-green-600 hover:bg-green-700 text-white"
                          : "text-gray-800 hover:bg-green-100"
                      )}
                    >
                      <div className="flex items-center">
                        <item.icon className="mr-3 h-5 w-5" />
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
                                className={cn(
                                  "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap",
                                  isSubActive
                                    ? "bg-green-600 hover:bg-green-700 text-white"
                                    : "text-gray-600 hover:bg-green-100"
                                )}
                              >
                                <subItem.icon className="mr-3 h-4 w-4" />
                                {subItem.label}
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
                    className={cn(
                      "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap",
                      isActive
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "text-gray-800 hover:bg-green-100"
                    )}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>

        {/* Help Center */}
        <div className="p-4 flex-shrink-0">
          <div className="bg-green-100 rounded-lg p-4 text-center">
            {/* Outer circle */}
            <div className="w-16 h-16 bg-green-300 rounded-full flex items-center justify-center mx-auto mb-5">
              {/* Inner circle */}
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                <HelpCircle className="h-6 w-6 text-white" />
              </div>
            </div>

            <h3 className="text-sm font-medium text-gray-800 mb-1">
              Help center
            </h3>
            <p className="text-xs text-gray-600 mb-3">
              Etiam porta sem malesuada magna mollis euismod.
            </p>
            <Button className="w-full bg-green-600 text-white text-xs py-2 px-3 rounded-md hover:bg-green-700 transition-colors">
              Go to help center
            </Button>
          </div>
        </div>
      </nav>
    </div>
  );
}
