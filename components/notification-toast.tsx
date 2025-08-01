"use client"

import { useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { useNotifications } from "@/components/notification-provider"
import { Bell } from "lucide-react"

export function NotificationToast() {
  const { toast } = useToast()
  const { notifications } = useNotifications()

  // Show toast when a new notification is added
  useEffect(() => {
    const unreadNotifications = notifications.filter((n) => !n.read)

    if (unreadNotifications.length > 0) {
      const latestNotification = unreadNotifications[0]

      // Only show toast for the most recent notification
      toast({
        title: latestNotification.title,
        description: latestNotification.message,
        action: <Bell className="h-4 w-4" />,
      })
    }
  }, [notifications, toast])

  return null
}
