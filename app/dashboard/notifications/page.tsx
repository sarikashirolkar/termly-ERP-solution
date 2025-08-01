"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { CheckCircle, AlertCircle, Trash2, BookMarkedIcon as MarkAsUnread } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Notification {
  id: string
  recipient_id: string
  title: string
  message: string
  type: string
  is_read: boolean
  created_at: string
}

interface User {
  id: string
  email: string
  role: string
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    setError(null)

    let currentUser: User | null = null
    try {
      const userString = localStorage.getItem("user")
      if (userString) {
        currentUser = JSON.parse(userString)
        setUserId(currentUser.id)
      } else {
        setError("User not logged in. Please log in to view notifications.")
        setLoading(false)
        return
      }
    } catch (e: any) {
      console.error("Error parsing user from localStorage:", e)
      setError(`Failed to parse user data: ${e.message}`)
      setLoading(false)
      return
    }

    if (!currentUser?.id) {
      setError("User ID not available. Cannot fetch notifications.")
      setLoading(false)
      return
    }

    try {
      const res = await fetch(`/api/notifications?recipientId=${currentUser.id}&limit=50`)
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || `HTTP error! status: ${res.status}`)
      }

      setNotifications(data.data || [])
    } catch (e: any) {
      console.error("API returned error:", e.message)
      setError(`Failed to fetch notifications: ${e.message}`)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const handleMarkAsRead = async (id: string) => {
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_read: true }),
      })
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)))
        toast({
          title: "Notification marked as read",
          description: "The notification has been marked as read.",
        })
      } else {
        const errorData = await res.json()
        toast({
          title: "Error",
          description: `Failed to mark as read: ${errorData.error}`,
          variant: "destructive",
        })
      }
    } catch (e: any) {
      toast({
        title: "Error",
        description: `Error marking as read: ${e.message}`,
        variant: "destructive",
      })
    }
  }

  const handleMarkAsUnread = async (id: string) => {
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_read: false }),
      })
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: false } : n)))
        toast({
          title: "Notification marked as unread",
          description: "The notification has been marked as unread.",
        })
      } else {
        const errorData = await res.json()
        toast({
          title: "Error",
          description: `Failed to mark as unread: ${errorData.error}`,
          variant: "destructive",
        })
      }
    } catch (e: any) {
      toast({
        title: "Error",
        description: `Error marking as unread: ${e.message}`,
        variant: "destructive",
      })
    }
  }

  const handleDeleteNotification = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications?id=${id}`, {
        method: "DELETE",
      })
      if (res.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== id))
        toast({
          title: "Notification deleted",
          description: "The notification has been deleted successfully.",
        })
      } else {
        const errorData = await res.json()
        toast({
          title: "Error",
          description: `Failed to delete notification: ${errorData.error}`,
          variant: "destructive",
        })
      }
    } catch (e: any) {
      toast({
        title: "Error",
        description: `Error deleting notification: ${e.message}`,
        variant: "destructive",
      })
    }
  }

  const handleMarkAllAsRead = async () => {
    const unreadNotifications = notifications.filter((n) => !n.is_read)

    try {
      await Promise.all(
        unreadNotifications.map((notification) =>
          fetch("/api/notifications", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: notification.id, is_read: true }),
          }),
        ),
      )

      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
      toast({
        title: "All notifications marked as read",
        description: `${unreadNotifications.length} notifications have been marked as read.`,
      })
    } catch (e: any) {
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read.",
        variant: "destructive",
      })
    }
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">
            You have {unreadCount} unread notifications out of {notifications.length} total.
          </p>
        </div>
        {unreadCount > 0 && (
          <Button onClick={handleMarkAllAsRead}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Mark All as Read
          </Button>
        )}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[80%]" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Notifications</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchNotifications}>Try Again</Button>
          </CardContent>
        </Card>
      ) : notifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <div className="text-6xl mb-4">🔔</div>
            <h3 className="text-lg font-semibold mb-2">No Notifications</h3>
            <p className="text-muted-foreground">You don't have any notifications yet.</p>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="h-[600px]">
          <div className="space-y-4">
            {notifications.map((notification) => (
              <Card key={notification.id} className={`${!notification.is_read ? "border-l-4 border-l-blue-500" : ""}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className={`text-base ${notification.is_read ? "text-muted-foreground" : ""}`}>
                        {notification.title}
                        {!notification.is_read && (
                          <Badge variant="secondary" className="ml-2">
                            New
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>{new Date(notification.created_at).toLocaleString()}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {notification.is_read ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleMarkAsUnread(notification.id)}
                          title="Mark as unread"
                        >
                          <MarkAsUnread className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleMarkAsRead(notification.id)}
                          title="Mark as read"
                        >
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteNotification(notification.id)}
                        title="Delete notification"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className={`${notification.is_read ? "text-muted-foreground" : ""}`}>{notification.message}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}
