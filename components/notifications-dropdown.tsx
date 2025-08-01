"use client"

import { useState, useEffect, useCallback } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Bell, X, CheckCircle, AlertCircle } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"

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

export function NotificationsDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const fetchNotifications = useCallback(async () => {
    console.log("=== FETCHING NOTIFICATIONS ===")
    setLoading(true)
    setError(null)

    let currentUser: User | null = null
    try {
      const userString = localStorage.getItem("user")
      console.log("Raw localStorage user:", userString)
      if (userString) {
        currentUser = JSON.parse(userString)
        setUserId(currentUser.id)
        console.log("User ID:", currentUser.id)
      } else {
        console.warn("No user found in localStorage.")
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
      console.warn("User ID is null or undefined after parsing.")
      setError("User ID not available. Cannot fetch notifications.")
      setLoading(false)
      return
    }

    const apiUrl = `/api/notifications?recipientId=${currentUser.id}&limit=10`
    console.log("API URL:", apiUrl)

    try {
      const res = await fetch(apiUrl)
      console.log("Response status:", res.status)
      console.log("Response ok:", res.ok)
      const data = await res.json()
      console.log("Response data:", data)

      if (!res.ok) {
        throw new Error(data.error || `HTTP error! status: ${res.status}`)
      }

      setNotifications(data.data || [])
      setUnreadCount(data.data?.filter((n: Notification) => !n.is_read).length || 0)
    } catch (e: any) {
      console.error("API returned error:", e.message)
      setError(`Failed to fetch notifications: ${e.message}`)
    } finally {
      console.log("Setting loading to false")
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    console.log("=== NOTIFICATIONS DROPDOWN COMPONENT MOUNTED ===")
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 10000) // Poll every 10 seconds
    return () => clearInterval(interval)
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
        setUnreadCount((prev) => (prev > 0 ? prev - 1 : 0))
      } else {
        const errorData = await res.json()
        console.error("Failed to mark as read:", errorData.error)
        alert(`Failed to mark as read: ${errorData.error}`)
      }
    } catch (e: any) {
      console.error("Error marking as read:", e)
      alert(`Error marking as read: ${e.message}`)
    }
  }

  const handleDeleteNotification = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications?id=${id}`, {
        method: "DELETE",
      })
      if (res.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== id))
        setUnreadCount((prev) => (prev > 0 ? prev - 1 : 0)) // Re-calculate unread count
      } else {
        const errorData = await res.json()
        console.error("Failed to delete notification:", errorData.error)
        alert(`Failed to delete notification: ${errorData.error}`)
      }
    } catch (e: any) {
      console.error("Error deleting notification:", e)
      alert(`Error deleting notification: ${e.message}`)
    }
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full transform translate-x-1/2 -translate-y-1/2">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 p-4">
        <div className="flex items-center justify-between mb-4">
          <DropdownMenuLabel className="text-lg font-bold">Notifications</DropdownMenuLabel>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          You have {unreadCount} unread notifications. {userId && `(User ID: ${userId.substring(0, 8)}...)`}
        </p>
        <DropdownMenuSeparator />

        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[80%]" />
            <Skeleton className="h-4 w-[90%]" />
            <Skeleton className="h-4 w-[70%]" />
            <Skeleton className="h-4 w-[85%]" />
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-4 flex flex-col items-center">
            <AlertCircle className="h-8 w-8 mb-2" />
            <p>{error}</p>
            <Button onClick={fetchNotifications} className="mt-2">
              Retry
            </Button>
          </div>
        ) : notifications.length === 0 ? (
          <p className="text-center text-gray-500 py-4">No notifications found.</p>
        ) : (
          <ScrollArea className="h-[300px]">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="flex flex-col items-start space-y-1 p-2 cursor-pointer hover:bg-gray-50"
                onSelect={(e) => e.preventDefault()}
              >
                <div className="flex justify-between w-full">
                  <span className={`font-medium ${notification.is_read ? "text-gray-500" : "text-gray-900"}`}>
                    {notification.title}
                  </span>
                  <div className="flex items-center gap-2">
                    {!notification.is_read && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleMarkAsRead(notification.id)}
                      >
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="sr-only">Mark as read</span>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleDeleteNotification(notification.id)}
                    >
                      <X className="h-4 w-4 text-red-500" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </div>
                <p className={`text-sm ${notification.is_read ? "text-gray-400" : "text-gray-600"}`}>
                  {notification.message}
                </p>
                <span className="text-xs text-gray-400">{new Date(notification.created_at).toLocaleString()}</span>
              </DropdownMenuItem>
            ))}
          </ScrollArea>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="justify-center" onSelect={() => router.push("/dashboard/notifications")}>
          View All Notifications
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
