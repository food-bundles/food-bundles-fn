"use client";

import { useState, useMemo, useSyncExternalStore } from "react";
import { Bell, User, ChevronDown, Settings, LogOut, Menu, X, ShieldCheck } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import NotificationsDrawer from "./notification";
import ProfileDrawer from "./ProfileDrawer";
import { authService } from "@/app/services/authService";
import { toast } from "sonner";
import SettingsDrawer from "./farmerSettings";
import { useAuth } from "@/app/contexts/auth-context";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useNotifications } from "@/app/contexts/NotificationContext";
import { RoleSwitchMenuItems } from "@/components/role-switcher";

interface DashboardHeaderProps {
  /** Toggles the sidebar (visible only below the md breakpoint). */
  onMenuClick?: () => void;
  /** Current sidebar open state, used to render the correct icon. */
  sidebarOpen?: boolean;
}

// Page titles, most specific first
const TITLES: [string, string][] = [
  ["/farmers/offers", "Buying offers"],
  ["/farmers/submissions", "My submissions"],
  ["/farmers/sales", "Sales"],
  ["/farmers/demand-signals", "What buyers need"],
  ["/farmers/profile", "Profile"],
  ["/farmers/setting", "Settings"],
  ["/farmers", "Dashboard"],
];

/** Same look as the food.rw dashboard header: white, page title, bell, account menu */
export default function DashboardHeader({ onMenuClick, sidebarOpen }: DashboardHeaderProps = {}) {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const { unreadCount } = useNotifications();
  const { user, getUserProfileImage } = useAuth();

  // The user is read from the browser: show their name once the page runs there
  // (the server can't know it, and a different text breaks hydration)
  const inBrowser = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const displayName = useMemo(() => (inBrowser && (user?.name || user?.phone)) || "Farmer", [user, inBrowser]);
  const contact = (inBrowser && (user?.email || user?.phone)) || "";
  const profileImage = getUserProfileImage();
  const title = TITLES.find(([path]) => pathname.startsWith(path))?.[1] ?? "Farmer account";

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await authService.logout().catch(() => {});
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.clear();
      toast.success("Logged out successfully");
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <header className="border-b border-[#DCE6DF] bg-white/95 backdrop-blur">
        <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-2">
            {onMenuClick && (
              <button
                type="button"
                onClick={onMenuClick}
                aria-label={sidebarOpen ? "Close menu" : "Open menu"}
                aria-expanded={sidebarOpen}
                className="flex h-10 w-10 items-center justify-center rounded-full text-[#0B2E1F] hover:bg-[#F6F9F7] md:hidden cursor-pointer"
              >
                {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            )}
            <div className="min-w-0">
              <p className="m-0 hidden truncate text-[12px] font-bold uppercase tracking-[1.2px] text-[#00A43A] sm:block">
                Farmer account
              </p>
              <h1 className="m-0 truncate text-[20px] font-bold leading-tight tracking-[-0.4px] text-[#0B2E1F] [font-family:var(--font-inter-tight),sans-serif]">
                {title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5">
            <button
              type="button"
              onClick={() => setIsNotificationsOpen(true)}
              aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#DCE6DF] bg-white text-[#0B2E1F] transition-colors hover:border-[#00A43A] hover:bg-[#F6F9F7] cursor-pointer"
            >
              <Bell className="h-[18px] w-[18px]" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#00A43A] px-1 text-[11px] font-bold text-white ring-2 ring-white">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            {/* The menu's generated ids differ between server and browser: render it in the browser only */}
          
          </div>
        </div>
      </header>

      <NotificationsDrawer isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
      <ProfileDrawer isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      <SettingsDrawer isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
}
