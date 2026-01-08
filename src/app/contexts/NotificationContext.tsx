"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { notificationService } from "@/app/services/notificationService";

interface NotificationContextType {
    unreadCount: number;
    loading: boolean;
    refreshUnreadCount: () => Promise<void>;
    markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const refreshUnreadCount = useCallback(async () => {
        try {
            const response = await notificationService.getUnreadCount();
            setUnreadCount(response.data.unreadCount);
        } catch (error) {
            console.error("Failed to fetch unread count:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    const markAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setUnreadCount(0);
        } catch (error) {
            console.error("Failed to mark all as read:", error);
            throw error;
        }
    };

    useEffect(() => {
        refreshUnreadCount();
        // Refresh every 30 seconds
        const interval = setInterval(refreshUnreadCount, 30000);
        return () => clearInterval(interval);
    }, [refreshUnreadCount]);

    return (
        <NotificationContext.Provider
            value={{
                unreadCount,
                loading,
                refreshUnreadCount,
                markAllAsRead,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error("useNotifications must be used within a NotificationProvider");
    }
    return context;
}
