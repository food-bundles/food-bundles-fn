"use client"

import { useEffect, useState } from "react"
import { X, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { notificationService, Notification } from "@/app/services/notificationService"
import { useNotifications } from "@/app/contexts/NotificationContext"

interface NotificationsDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export default function NotificationsDrawer({ isOpen, onClose }: NotificationsDrawerProps) {
  const { unreadCount, refreshUnreadCount, markAllAsRead: globalMarkAllRead } = useNotifications()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const [activeFilter, setActiveFilter] = useState<"all" | "read" | "unread">("all")

  useEffect(() => {
    if (isOpen) fetchNotifications()
  }, [isOpen])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const response = await notificationService.getNotifications(1, 20)
      setNotifications(response.data)
    } catch (error) {
      console.error("Failed to fetch notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose()
    }
    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isOpen, onClose])

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset"
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  const filteredNotifications = notifications.filter((notification) => {
    if (activeFilter === "read") return notification.isRead
    if (activeFilter === "unread") return !notification.isRead
    return true
  })

  const handleMarkAllRead = async () => {
    try {
      await globalMarkAllRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    } catch (error) {
      console.error("Failed to mark all as read:", error)
    }
  }

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id)
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
      refreshUnreadCount()
    } catch (error) {
      console.error("Failed to mark as read:", error)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await notificationService.deleteNotification(id)
      setNotifications((prev) => prev.filter((n) => n.id !== id))
      refreshUnreadCount()
    } catch (error) {
      console.error("Failed to delete notification:", error)
    }
  }

  const getNotificationBg = (notification: Notification) =>
    notification.isRead ? "bg-card border-border" : "bg-accent/10 border-accent/20"

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />}

      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] md:w-[480px] lg:w-[540px] bg-background text-foreground z-50 transform transition-all duration-300 ease-in-out overflow-y-auto shadow-2xl border-l border-border scrollbar-hide ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="sticky top-0 z-10 bg-background border-b border-border flex justify-between items-center p-4 sm:p-6">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
            <span className="text-lg sm:text-xl font-bold text-foreground">Notifications</span>
            {unreadCount > 0 && <Badge className="bg-destructive text-destructive-foreground text-xs">{unreadCount}</Badge>}
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors hover:rotate-90 transform duration-200"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 sm:justify-between sm:items-center">
            <p className="text-muted-foreground text-xs sm:text-sm">
              You have {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
            </p>
            <Button
              onClick={handleMarkAllRead}
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto text-xs sm:text-sm"
            >
              Mark all read
            </Button>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 border-b border-border overflow-x-auto">
            {[
              { key: "all", label: "All" },
              { key: "read", label: "Read" },
              { key: "unread", label: "Unread" },
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => setActiveFilter(filter.key as "all" | "read" | "unread")}
                className={`pb-2 sm:pb-3 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                  activeFilter === filter.key
                    ? "text-foreground border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="space-y-3 sm:space-y-4">
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <p className="text-muted-foreground text-sm">Loading...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <Card>
                <CardContent className="p-6 sm:p-8 text-center">
                  <p className="text-muted-foreground text-sm">No notifications found</p>
                </CardContent>
              </Card>
            ) : (
              filteredNotifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`${getNotificationBg(notification)} transition-colors ${
                    !notification.isRead ? "cursor-pointer hover:shadow-md" : ""
                  }`}
                  onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
                >
                  <CardContent className="p-3 sm:p-4">
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-foreground text-xs sm:text-sm flex-1 min-w-0 break-words">
                          {notification.title}
                        </h3>
                        {!notification.isRead && (
                          <span className="px-2 py-1 bg-primary/20 text-primary text-[10px] sm:text-xs font-medium rounded-full whitespace-nowrap">
                            New
                          </span>
                        )}
                      </div>
                      <p className="text-muted-foreground text-xs sm:text-sm break-words">{notification.message}</p>
                      <div className="flex flex-col xs:flex-row gap-2 xs:items-center xs:justify-between">
                        <p className="text-[10px] xs:text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(notification.id)
                          }}
                          className="px-2 py-1 bg-destructive/20 text-destructive text-[10px] xs:text-xs font-medium rounded-full hover:bg-destructive/30 transition-colors w-fit xs:w-auto"
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

          <div className="h-6 sm:h-8"></div>
        </div>
      </div>
    </>
  )
}
