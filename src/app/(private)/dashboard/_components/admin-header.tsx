"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, ArrowUpRight } from "lucide-react";
import { MdMenuOpen, MdClose } from "react-icons/md";
import NotificationsDrawer from "@/app/(private)/restaurant/_components/notificationDrawer";
import { useNotifications } from "@/app/contexts/NotificationContext";
import { usePathname } from "next/navigation";
import { adminPageTitle } from "./admin-sidebar";

interface AdminHeaderProps {
  onMenuClick: () => void;
  sidebarOpen: boolean;
}

export function AdminHeader({ onMenuClick, sidebarOpen }: AdminHeaderProps) {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { unreadCount } = useNotifications();
  const pathname = usePathname();
  const { group, title } = adminPageTitle(pathname);

  return (
    <>
    <header className="border-b border-[#DCE6DF] bg-white/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            onClick={onMenuClick}
            aria-label={sidebarOpen ? "Close menu" : "Open menu"}
            aria-expanded={sidebarOpen}
            className="flex h-10 w-10 items-center justify-center rounded-full text-[#0B2E1F] hover:bg-[#F6F9F7] md:hidden cursor-pointer"
          >
            {sidebarOpen ? <MdClose className="h-6 w-6" /> : <MdMenuOpen className="h-6 w-6" />}
          </button>
          <div className="min-w-0">
            <p className="m-0 hidden truncate text-[12px] font-bold uppercase tracking-[1.2px] text-[#00A43A] sm:block">
              {group ?? "Admin dashboard"}
            </p>
            <h1 className="m-0 truncate text-[20px] font-bold leading-tight tracking-[-0.4px] text-[#0B2E1F] [font-family:var(--font-inter-tight),sans-serif]">
              {title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5">
          <Link
            href="/"
            className="hidden h-10 items-center gap-1.5 rounded-full border border-[#DCE6DF] bg-white px-4 text-[14px] font-bold text-[#0B2E1F] transition-colors hover:border-[#00A43A] sm:inline-flex"
          >
            food.rw <ArrowUpRight className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={() => setIsNotificationsOpen(true)}
            aria-label={`Notifications, ${unreadCount} unread`}
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#DCE6DF] bg-white text-[#0B2E1F] transition-colors hover:border-[#00A43A] hover:bg-[#F6F9F7] cursor-pointer"
          >
            <Bell className="h-[18px] w-[18px]" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#00A43A] px-1 text-[11px] font-bold text-white ring-2 ring-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
    <NotificationsDrawer isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
    </>
  );
}
