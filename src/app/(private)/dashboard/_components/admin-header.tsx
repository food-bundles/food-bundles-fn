"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { MdMenuOpen, MdClose } from "react-icons/md";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { notificationService } from "@/app/services/notificationService";
import NotificationsDrawer from "@/app/(private)/restaurant/_components/notificationDrawer";
import { usePathname } from "next/navigation";

interface AdminHeaderProps {
  onMenuClick: () => void;
  sidebarOpen: boolean;
}

export function AdminHeader({ onMenuClick, sidebarOpen }: AdminHeaderProps) {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();

  const getPageTitle = () => {
    const pathSegments = pathname.split('/').filter(Boolean);
    const pathMap: { [key: string]: string } = {
      'dashboard': 'Dashboard',
      'farmer-submissions': 'Farmer Submissions',
      'restaurant-orders': 'Restaurant Orders',
      'stock': 'Stock Management',
      'products': 'Products',
      'categories': 'Categories',
      'units': 'Units',
      'subscriptions': 'Subscriptions',
      'vouchers': 'Voucher Management',
      'deposits': 'Deposit Management',
      'invitations': 'Invitations',
      'users': 'Users',
      'farmers': 'Farmers',
      'restaurants': 'Restaurants',
      'administration': 'Administration',
      'contact-submissions': 'Messages'
    };

    if (pathSegments.length === 1) {
      return pathMap[pathSegments[0]] || 'Dashboard';
    }

    const breadcrumbs = pathSegments.slice(1).map(segment => pathMap[segment] || segment);
    return breadcrumbs.join(' > ');
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await notificationService.getUnreadCount();
        setUnreadNotifications(response.data.unreadCount);
      } catch (error) {
        console.error('Failed to fetch unread count:', error);
        setUnreadNotifications(0);
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-green-800 border-b border-green-800">
      <div className="px-4 pt-2 pb-1 flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 cursor-pointer text-white hover:bg-green-600 rounded transition-colors"
          >
            {sidebarOpen ? (
              <MdClose className="h-6 w-6" />
            ) : (
              <MdMenuOpen className="h-6 w-6" />
            )}
          </button>
          <div className="flex items-center gap-2 md:gap-4">
            <h1 className="text-sm md:text-md font-semibold text-white">
              {getPageTitle()}
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-1 md:space-x-3">
          <button
            onClick={() => setIsNotificationsOpen(true)}
            className="relative p-1.5 md:p-2 hover:bg-green-600 cursor-pointer rounded-full text-white"
          >
            <Bell className="h-4 w-4 md:h-5 md:w-5" />
            {unreadNotifications > 0 && (
              <Badge className="absolute top-0 right-1 h-4 w-4 rounded-full p-0 flex items-center justify-center bg-orange-400 text-white text-xs">
                {unreadNotifications}
              </Badge>
            )}
          </button>

          <div className="flex items-center space-x-2">
            {isMounted && (
              <Select defaultValue="en" key="language-select">
                <SelectTrigger className="h-5 w-20 text-xs bg-green-700 text-white border border-green-600 hover:bg-green-600 focus:ring-2 focus:ring-green-600 [&_svg]:text-white">
                  <SelectValue placeholder="ENG" />
                </SelectTrigger>

                <SelectContent className="flex">
                  <SelectItem value="en">ENG</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </div>

      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
    </header>
  );
}