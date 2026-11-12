"use client";

import { useEffect, useState } from "react";
import { X, Trash2, CheckCheck, BellOff } from "lucide-react";
import { notificationService, Notification } from "@/app/services/notificationService";
import { formatDistanceToNow } from "date-fns";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { useNotifications } from "@/app/contexts/NotificationContext";

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationsDrawer({
  isOpen,
  onClose,
}: NotificationsDrawerProps) {
  const { unreadCount, refreshUnreadCount, markAllAsRead: globalMarkAllRead } = useNotifications();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"all" | "read" | "unread">(
    "all"
  );

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationService.getNotifications(1, 20);
      setNotifications(response.data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // use global unreadCount from context for the badge
  // const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filteredNotifications = notifications.filter((notification) => {
    if (activeFilter === "read") return notification.isRead;
    if (activeFilter === "unread") return !notification.isRead;
    return true;
  });

  const handleMarkAllRead = async () => {
    try {
      await globalMarkAllRead();
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, isRead: true }))
      );
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id
            ? { ...notification, isRead: true }
            : notification
        )
      );
      refreshUnreadCount();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications((prev) =>
        prev.filter((notification) => notification.id !== id)
      );
      refreshUnreadCount();
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const getEventTypeColor = (eventType: string) => {
    switch (eventType) {
      case "VOUCHER_ISSUED": return "bg-[#E3F3E8] text-[#007A35]";
      case "NEW_ORDER_PLACED": return "bg-[#E4EEF7] text-[#1B4F7A]";
      case "ORDER_COMPLETED": return "bg-[#FFF3D1] text-[#7A5200]";
      default: return "bg-[#EEF3EF] text-[#4A6358]";
    }
  };

  const counts = {
    all: notifications.length,
    unread: notifications.filter((n) => !n.isRead).length,
    read: notifications.filter((n) => n.isRead).length,
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && <div className="fixed inset-0 z-[55] bg-black/30" onClick={onClose} />}

      <aside
        aria-label="Notifications"
        inert={!isOpen}
        className={`fixed top-0 right-0 z-[60] flex h-full w-[92vw] flex-col bg-[#F6F9F7] text-[#0B2E1F] shadow-2xl transition-transform duration-300 ease-in-out sm:w-[420px] md:w-[440px]
          ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-[#0B2E1F] px-5 py-4 text-white">
          <div className="flex items-center gap-2.5">
            <span className="text-lg font-bold [font-family:var(--font-inter-tight),sans-serif]">Notifications</span>
            {unreadCount > 0 && (
              <span className="rounded-full bg-[#00D048] px-2 py-0.5 text-xs font-bold text-[#0B2E1F]">{unreadCount} new</span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close notifications"
            className="flex h-10 w-10 items-center justify-center rounded-full text-white hover:bg-white/10 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filters and mark-all */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#DCE6DF] bg-white px-5 py-3">
          <div className="flex gap-1.5" role="group" aria-label="Filter notifications">
            {(["all", "unread", "read"] as const).map((key) => {
              const on = activeFilter === key;
              return (
                <button
                  key={key}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setActiveFilter(key)}
                  className={`min-h-9 rounded-full px-3.5 text-[13px] font-bold capitalize transition-colors cursor-pointer ${
                    on ? "bg-[#0B2E1F] text-white" : "border border-[#DCE6DF] bg-white text-[#0B2E1F] hover:border-[#00A43A]"
                  }`}
                >
                  {key} <span className={on ? "text-[#7CF2A6]" : "text-[#4A6358]"}>{counts[key]}</span>
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-full px-2 text-[13px] font-bold text-[#007A35] hover:text-[#0B2E1F] disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
          >
            <CheckCheck className="h-4 w-4" /> Mark all read
          </button>
        </div>

        {/* Notifications list */}
        <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-hide">
          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <Spinner variant="ring" />
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E3F3E8]">
                <BellOff className="h-5 w-5 text-[#007A35]" />
              </span>
              <p className="m-0 font-bold">You’re all caught up</p>
              <p className="m-0 text-sm text-[#4A6358]">
                {activeFilter === "unread" ? "No unread notifications." : "Nothing here yet."}
              </p>
            </div>
          ) : (
            <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
              {filteredNotifications.map((notification) => {
                const unread = !notification.isRead;
                return (
                  <li
                    key={notification.id}
                    className={`group relative rounded-2xl border p-4 transition-colors ${
                      unread ? "border-[#BFE6CB] bg-white shadow-[0_10px_24px_-18px_#0B2E1F80]" : "border-[#E6EEE9] bg-white/60"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        aria-hidden="true"
                        className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${unread ? "bg-[#00A43A]" : "bg-[#C5D1C6]"}`}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className={`m-0 text-[15px] leading-snug ${unread ? "font-bold" : "font-semibold text-[#4A6358]"}`}>
                            {unread && <span className="sr-only">Unread: </span>}
                            {notification.title}
                          </h3>
                          <button
                            type="button"
                            onClick={() => handleDelete(notification.id)}
                            aria-label={`Delete notification: ${notification.title}`}
                            className="-mr-1 -mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#4A6358] hover:bg-red-50 hover:text-red-600 cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="m-0 mt-1 text-[14px] leading-relaxed text-[#2E4A3B]">{notification.message}</p>
                        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${getEventTypeColor(notification.eventType)}`}>
                              {notification.eventType.replace(/_/g, " ").toLowerCase()}
                            </span>
                            <span className="text-xs text-[#4A6358]">
                              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                          {unread && (
                            <button
                              type="button"
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="rounded-full px-2 py-1 text-[12px] font-bold text-[#007A35] hover:bg-[#E3F3E8] cursor-pointer"
                            >
                              Mark as read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </aside>
    </>
  );
}
