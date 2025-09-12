"use client"

import { useEffect, useState } from "react"
import { X, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type Notification = {
  id: string
  title: string
  message: string
  orderId: string
  timestamp: string
  isRead: boolean
  type: "order_initiated" | "order_completed" | "order_cancelled" | "payment_received"
}

interface NotificationsDrawerProps {
  isOpen: boolean
  onClose: () => void
  notifications: Notification[]
}

export default function NotificationsDrawer({
  isOpen,
  onClose,
  notifications: initialNotifications,
}: NotificationsDrawerProps) {
  const [notifications, setNotifications] = useState(initialNotifications)
  const [activeFilter, setActiveFilter] = useState<"all" | "read" | "unread">("all")

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }

    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isOpen, onClose])

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const filteredNotifications = notifications.filter((notification) => {
    if (activeFilter === "read") return notification.isRead
    if (activeFilter === "unread") return !notification.isRead
    return true
  })

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, isRead: true })))
  }

  const handleMarkAsUnread = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, isRead: false } : notification)),
    )
  }

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, isRead: true } : notification)),
    )
  }

  const handleDelete = (id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))
  }

  const getNotificationBg = (notification: Notification) => {
    if (!notification.isRead) {
      return "bg-accent/10 border-accent/20"
    }
    return "bg-card border-border"
  }

  const getStatusBadge = (notification: Notification) => {
    return (
      <button
        onClick={() => handleMarkAsUnread(notification.id)}
        className="px-3 py-1 bg-primary/20 text-primary text-xs font-medium rounded-full hover:bg-primary/30 transition-colors"
      >
        Mark as unread
      </button>
    )
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />}

      <div
        className={`fixed top-0 right-0 h-full w-[540px] bg-background text-foreground z-50 transform transition-all duration-300 ease-in-out overflow-y-auto shadow-2xl border-l border-border scrollbar-hide ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background border-b border-border flex justify-between items-center p-6">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <span className="text-xl font-bold text-foreground">Notifications</span>
            {unreadCount > 0 && (
              <Badge className="bg-destructive text-destructive-foreground text-xs">{unreadCount}</Badge>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors hover:rotate-90 transform duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Mark all read button */}
          <div className="flex justify-between items-center">
            <p className="text-muted-foreground text-sm">You have {unreadCount} unread notifications</p>
            <Button
              onClick={handleMarkAllRead}
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Mark all read
            </Button>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-6 border-b border-border">
            {[
              { key: "all", label: "All" },
              { key: "read", label: "Read" },
              { key: "unread", label: "Unread" },
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => setActiveFilter(filter.key as "all" | "read" | "unread")}
                className={`pb-3 text-sm font-medium transition-colors ${
                  activeFilter === filter.key
                    ? "text-foreground border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Notifications list */}
          <div className="space-y-4">
            {filteredNotifications.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">No notifications found</p>
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
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold text-foreground text-sm">{notification.title}</h3>
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          {getStatusBadge(notification)}
                        </div>
                      </div>
                      <p className="text-muted-foreground text-sm">{notification.message}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">{notification.timestamp}</p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(notification.id)
                          }}
                          className="px-2 py-1 bg-destructive/20 text-destructive text-xs font-medium rounded-full hover:bg-destructive/30 transition-colors"
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
  )
}
