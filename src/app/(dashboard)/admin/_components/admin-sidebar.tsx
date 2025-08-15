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
  Building,
//   Settings,
//   MessageSquare,
  LogOut,
  HelpCircle,
} from "lucide-react";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  {
    icon: FileText,
    label: "Farmer Submission",
    href: "/admin/farmer-submissions",
    active: true,
  },
  {
    icon: ShoppingCart,
    label: "Restaurant Orders",
    href: "/admin/restaurant-orders",
  },
  { icon: Package, label: "Inventory", href: "/admin/inventory" },
  { icon: CreditCard, label: "Payments", href: "/admin/payments" },
  { icon: TrendingUp, label: "Sales", href: "/admin/sales" },
  { icon: Users, label: "Farmers", href: "/admin/farmers" },
  { icon: Building, label: "Restaurants", href: "/admin/restaurants" },
  { icon: LogOut, label: "Logout", href: "/logout" },
];

export function AdminSidebar() {
  return (
    <div className="w-64 min-w-64 h-screen border-r border-gray-200 bg-gray-50 text-white flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="p-4 flex-shrink-0">
        <h1 className="text-xl font-bold text-black">Food Bundle</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-auto scrollbar-hide">
        <ul className="space-y-1 px-3 pb-4">
          {menuItems.map((item, index) => (
            <li key={index}>
              <a
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap",
                  item.active
                    ? "bg-green-600 text-white"
                    : "text-gray-800 hover:bg-green-100 "
                )}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.label}
              </a>
            </li>
          ))}
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
