"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
      console.log("Fetched notifications:", response.data);
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

  const getNotificationBg = (notification: Notification) => {
    if (!notification.isRead) {
      return "bg-yellow-50 border-yellow-200";
    }
    return "bg-green-50 border-green-200";
  };

  const getEventTypeColor = (eventType: string) => {
    switch (eventType) {
      case 'VOUCHER_ISSUED': return 'bg-green-200 text-green-800';
      case 'NEW_ORDER_PLACED': return 'bg-blue-200 text-blue-800';
      case 'ORDER_COMPLETED': return 'bg-purple-200 text-purple-800';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  const getStatusBadge = (notification: Notification) => {
    if (!notification.isRead) {
      return (
        <span className="px-3 py-1 bg-yellow-200 text-yellow-800 text-xs font-medium rounded-full">
          New
        </span>
      );
    }
    return (
      <span className="px-3 py-1 bg-gray-200 text-gray-600 text-xs font-medium rounded-full">
        Read
      </span>
    );
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0  bg-opacity-50 z-40" onClick={onClose} />
      )}

      <div
        className={`fixed top-0 right-0 h-full bg-white text-gray-900 z-50 transform transition-all duration-300 ease-in-out overflow-y-auto shadow-2xl border-l border-gray-200 scrollbar-hide
          w-[90vw] sm:w-[400px] md:w-[440px]
          ${isOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-green-700 border-b border-gray-200 flex justify-between items-center px-6 py-3">
          <div className="flex items-center gap-2">
            <span className="text-xl text-white font-bold">
              Notifications
            </span>
            {unreadCount > 0 && (
              <Badge className="bg-green-500 text-white text-xs">
                {unreadCount}
              </Badge>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors hover:rotate-90 transform duration-200"
          >
            <X className="w-6 h-6 text-white cursor-pointer" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Mark all read button */}
          <div className="flex justify-between items-center">
            <p className="text-gray-600 text-sm">
              You have {unreadCount} unread notifications
            </p>
            <Button
              onClick={handleMarkAllRead}
              size="sm"
              className="bg-green-700 hover:bg-green-600 text-white"
            >
              Mark all read
            </Button>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-6 border-b border-gray-200">
            {[
              { key: "all", label: "All" },
              { key: "read", label: "Read" },
              { key: "unread", label: "Unread" },
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() =>
                  setActiveFilter(filter.key as "all" | "read" | "unread")
                }
                className={`pb-3 text-sm font-medium transition-colors ${activeFilter === filter.key
                    ? "text-gray-900 border-b-2 border-gray-900"
                    : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Notifications list */}
          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <Spinner variant="ring" />
              </div>
            ) : filteredNotifications.length === 0 ? (
              <Card className="">
                <CardContent className="p-8 text-center">
                  <p className="text-gray-500">No notifications found</p>
                </CardContent>
              </Card>
            ) : (
              filteredNotifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`${getNotificationBg(
                    notification
                  )} transition-colors rounded py-1 ${!notification.isRead ? "cursor-pointer hover:shadow-md" : ""
                    }`}
                  onClick={() =>
                    !notification.isRead && handleMarkAsRead(notification.id)
                  }
                >
                  <CardContent className="p-4 ">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold text-gray-900 text-sm">
                          {notification.title}
                        </h3>
                        <div
                          className="flex items-center gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {getStatusBadge(notification)}
                        </div>
                      </div>
                      <p className="text-gray-700 text-sm">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${getEventTypeColor(notification.eventType)}`}>
                            {notification.eventType.replace('_', ' ')}
                          </span>
                          <p className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(notification.id);
                          }}
                          className="px-2 py-1 bg-red-200 text-red-800 text-xs font-medium rounded-full hover:bg-red-300 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          <div className="h-8"></div>
        </div>
      </div>
    </>
  );
}
