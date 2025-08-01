"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { Bell, BookOpen, Calendar, FileText } from "lucide-react"
import type { Notification } from "@/components/dashboard/notifications"

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  markAsRead: (id: number) => void
  dismissNotification: (id: number) => void
  addNotification: (notification: Omit<Notification, "id" | "read">) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  // Initialize with default notifications or load from localStorage
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("notifications")
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch (e) {
          console.error("Failed to parse notifications from localStorage", e)
        }
      }
    }

    // Default notifications
    return [
      {
        id: 1,
        type: "schedule",
        title: "Class Schedule Change",
        message: "Your Artificial Intelligence class on Friday has been moved to Room 302.",
        time: "5 hours ago",
        icon: Calendar,
        read: false,
      },
      {
        id: 2,
        type: "announcement",
        title: "University Announcement",
        message: "The library will be closed this weekend for maintenance.",
        time: "2 days ago",
        icon: Bell,
        read: false,
      },
      {
        id: 3,
        type: "reminder",
        title: "Quiz Reminder",
        message: "Don't forget about your Data Structures quiz tomorrow at 10:00 AM.",
        time: "5 hours ago",
        icon: FileText,
        read: true,
      },
      {
        id: 4,
        type: "announcement",
        title: "New Course Materials Available",
        message: "New lecture notes for Database Systems have been uploaded.",
        time: "2 days ago",
        icon: BookOpen,
        read: true,
      },
    ]
  })

  // Calculate unread count
  const unreadCount = notifications.filter((n) => !n.read).length

  // Save to localStorage when notifications change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("notifications", JSON.stringify(notifications))
    }
  }, [notifications])

  // Mark a notification as read
  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  // Dismiss (remove) a notification
  const dismissNotification = (id: number) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))
  }

  // Add a new notification
  const addNotification = (notification: Omit<Notification, "id" | "read">) => {
    const newId = Math.max(0, ...notifications.map((n) => n.id)) + 1
    setNotifications((prev) => [{ ...notification, id: newId, read: false }, ...prev])
  }

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        dismissNotification,
        addNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }
  return context
}
