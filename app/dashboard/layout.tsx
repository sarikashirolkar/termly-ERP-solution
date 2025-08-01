"use client"

import type React from "react"

import { useState, useEffect, useRef, Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import {
  Award,
  Calendar,
  BarChartIcon as ChartBar,
  FileText,
  Home,
  MessageSquare,
  Settings,
  Upload,
  Users,
  BookOpen,
  GraduationCap,
  Building,
  ClipboardList,
  UserCheck,
  CalendarDays,
  BookmarkPlus,
  LogOut,
  UserCog,
  FormInput,
} from "lucide-react"
import { getStudentNavigation } from "@/lib/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Menu, Search, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/theme-toggle"
import { ContactUsDialog } from "@/components/contact-us-dialog"
import { NotificationsDropdown } from "@/components/notifications-dropdown"
import * as z from "zod"
import { Label } from "@/components/ui/label"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [profileDialogOpen, setProfileDialogOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const notificationButtonRef = useRef<HTMLButtonElement>(null)
  const [user, setUser] = useState<{
    email: string
    role: string
    firstName: string
    lastName: string
    department?: string
    profilePicture?: string
  } | null>(null)
  const [activeRole, setActiveRole] = useState<string | null>(null)

  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false)
  const [leaveValues, setLeaveValues] = useState({
    casualLeaves: 10,
    earnedLeaves: 30,
    leavesWithoutPay: 10,
    otherLeaves: 35,
  })

  const LeaveFormSchema = z.object({
    casualLeaves: z.number().min(0).max(100),
    earnedLeaves: z.number().min(0).max(100),
    leavesWithoutPay: z.number().min(0).max(100),
    otherLeaves: z.number().min(0).max(100),
  })

  // Prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Close notifications when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notificationsOpen &&
        notificationButtonRef.current &&
        !notificationButtonRef.current.contains(event.target as Node)
      ) {
        // Check if the click is inside the notifications dropdown
        const notificationsDropdown = document.querySelector("[data-notifications-dropdown]")
        if (notificationsDropdown && !notificationsDropdown.contains(event.target as Node)) {
          setNotificationsOpen(false)
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [notificationsOpen])

  // Add viewport meta tag to ensure proper scaling on mobile devices
  // This should be added in the head section of the layout
  // Since this is a client component, we need to ensure the viewport is properly set
  // Add this at the top of the component, before the return statement

  useEffect(() => {
    // Ensure proper viewport settings for mobile
    const meta = document.createElement("meta")
    meta.name = "viewport"
    meta.content = "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"

    // Check if it already exists
    if (!document.querySelector('meta[name="viewport"]')) {
      document.head.appendChild(meta)
    }
  }, [])

  // Check if user is logged in
  useEffect(() => {
    if (isMounted) {
      try {
        const storedUser = localStorage.getItem("user")
        if (!storedUser) {
          router.push("/")
          toast({
            title: "Authentication required",
            description: "Please log in to access the dashboard.",
            variant: "destructive",
          })
        } else {
          const parsedUser = JSON.parse(storedUser)
          setUser(parsedUser)

          // Determine the initial active role based on the user's actual role
          let initialActiveRole = parsedUser.role
          if (["hod", "admin", "principal", "coordinator"].includes(parsedUser.role)) {
            const storedActiveRole = localStorage.getItem("activeRole")
            if (storedActiveRole === "faculty") {
              initialActiveRole = "faculty" // Persist faculty view if it was explicitly set
            } else {
              initialActiveRole = parsedUser.role // Default to primary role on fresh login
              localStorage.setItem("activeRole", parsedUser.role) // Ensure primary role is set in storage
            }
          } else {
            // For student and direct faculty roles, activeRole is always their role
            localStorage.setItem("activeRole", parsedUser.role)
          }
          setActiveRole(initialActiveRole)
        }
      } catch (error) {
        console.error("Error accessing localStorage:", error)
        router.push("/")
        toast({
          title: "Session error",
          description: "There was an error accessing your session. Please log in again.",
          variant: "destructive",
        })
      }
    }
  }, [router, toast, isMounted])

  const handleLogout = () => {
    try {
      localStorage.removeItem("user")
      localStorage.removeItem("activeRole") // Clear activeRole on logout
      router.push("/")
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      })
    } catch (error) {
      console.error("Error during logout:", error)
      router.push("/")
      toast({
        title: "Logout issue",
        description: "There was an issue during logout, but you've been redirected to the login page.",
      })
    }
  }

  const handleProfilePictureUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          // Create an image element to resize the image
          const img = document.createElement("img")
          img.onload = () => {
            // Create a canvas to resize the image
            const canvas = document.createElement("canvas")
            // Max dimensions for the profile picture (reduces file size)
            const MAX_WIDTH = 150
            const MAX_HEIGHT = 150

            let width = img.width
            let height = img.height

            // Resize image while maintaining aspect ratio
            if (width > height) {
              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width
                width = MAX_WIDTH
              }
            } else {
              if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height
                height = MAX_HEIGHT
              }
            }

            canvas.width = width
            canvas.height = height

            // Draw the resized image on the canvas
            const ctx = canvas.getContext("2d")
            ctx?.drawImage(img, 0, 0, width, height)

            // Get the compressed image as a data URL (JPEG format with 0.8 quality)
            const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.8)

            if (user) {
              try {
                // Store only the compressed image
                const updatedUser = { ...user, profilePicture: compressedDataUrl }
                localStorage.setItem("user", JSON.stringify(updatedUser))
                setUser(updatedUser)
                toast({
                  title: "Profile picture updated",
                  description: "Your profile picture has been updated successfully.",
                })
              } catch (storageError) {
                // Handle localStorage quota exceeded error
                console.error("Storage error:", storageError)
                toast({
                  title: "Update failed",
                  description: "Could not save profile picture due to storage limitations.",
                  variant: "destructive",
                })
              }
            }
          }

          // Set the image source to the loaded file
          img.src = e.target?.result as string
        } catch (error) {
          console.error("Error processing image:", error)
          toast({
            title: "Update failed",
            description: "Could not process the image. Please try a smaller image.",
            variant: "destructive",
          })
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleLeaveFormSubmit = (values: z.infer<typeof LeaveFormSchema>) => {
    setLeaveValues(values)
    toast({
      title: "Leave allocations updated",
      description: "The leave allocations have been updated successfully.",
    })
    setLeaveDialogOpen(false)
  }

  const getInitials = () => {
    if (!user) return "U"

    const firstInitial = user.firstName ? user.firstName.charAt(0) : ""
    const lastInitial = user.lastName ? user.lastName.charAt(0) : ""

    return (firstInitial + lastInitial).toUpperCase() || user.email.charAt(0).toUpperCase()

    return (firstInitial + lastInitial).toUpperCase() || user.email.charAt(0).toUpperCase()
  }

  const getUserDisplayName = () => {
    if (!user) return "User"

    const firstName = user.firstName?.trim() || ""
    const lastName = user.lastName?.trim() || ""

    if (firstName && lastName) {
      return `${firstName} ${lastName}`
    } else if (firstName) {
      return firstName
    } else if (lastName) {
      return lastName
    }

    return "User"
  }

  const getNavigation = () => {
    if (!user) return []

    // Faculty navigation items - these should always be shown for faculty role or when in faculty view
    const facultyNavItems = [
      { name: "Dashboard", href: "/dashboard", icon: Home },
      { name: "My Classes", href: "/dashboard/classes", icon: Calendar },
      { name: "Upload Marks", href: "/dashboard/upload-marks", icon: FileText },
      { name: "Upload Materials", href: "/dashboard/upload-materials", icon: Upload },
      { name: "Forms", href: "/dashboard/forms", icon: FormInput },
      { name: "Student Feedback", href: "/dashboard/student-feedback", icon: MessageSquare },
      { name: "CO-PO Mapping", href: "/dashboard/co-po-mapping", icon: ClipboardList },
      { name: "My Proctees", href: "/dashboard/proctoring", icon: UserCheck },
      { name: "Apply Forms", href: "/dashboard/apply-forms", icon: FileText },
      { name: "Calendar of Events", href: "/dashboard/calendar-events", icon: CalendarDays },
      { name: "Achievements", href: "/dashboard/achievements", icon: Award },
      { name: "Settings", href: "/dashboard/settings", icon: Settings },
    ]

    // Student navigation items - always return for students
    if (user.role === "student") {
      return getStudentNavigation()
    }

    // For actual faculty users, return faculty navigation
    if (user.role === "faculty") {
      return facultyNavItems
    }

    // For roles that can switch to faculty view (HOD, Admin, Principal, Coordinator)
    // Check if they are currently in faculty view
    const currentActiveRole = localStorage.getItem("activeRole") || user.role
    if (["hod", "admin", "principal", "coordinator"].includes(user.role) && currentActiveRole === "faculty") {
      return facultyNavItems
    }

    // Otherwise, return role-specific navigation for HOD, Admin, Principal, Coordinator
    if (user.role === "hod") {
      return [
        { name: "Dashboard", href: "/dashboard", icon: Home },
        { name: "Department Faculty", href: "/dashboard/faculty", icon: GraduationCap },
        { name: "Department Students", href: "/dashboard/students", icon: Users },
        { name: "View CO-PO Reports", href: "/dashboard/view-co-po-reports", icon: ClipboardList },
        { name: "Department Reports", href: "/dashboard/reports", icon: ChartBar },
        { name: "Applied Applications", href: "/dashboard/applied-applications", icon: ClipboardList },
        { name: "Calendar of Events", href: "/dashboard/calendar-events", icon: CalendarDays },
        { name: "Achievements", href: "/dashboard/achievements", icon: Award },
        { name: "Settings", href: "/dashboard/settings", icon: Settings },
      ]
    }

    // Admin navigation items
    if (user.role === "admin") {
      return [
        { name: "Dashboard", href: "/dashboard", icon: Home },
        { name: "Faculty Management", href: "/dashboard/faculty", icon: GraduationCap },
        { name: "Student Management", href: "/dashboard/students", icon: Users },
        { name: "Department Management", href: "/dashboard/manage-departments", icon: Building },
        { name: "Manage Coordinators", href: "/dashboard/manage-coordinators", icon: UserCog }, // New item
        { name: "Schedule Feedback", href: "/dashboard/student-feedback", icon: MessageSquare },
        { name: "Reports", href: "/dashboard/reports", icon: ChartBar },
        { name: "Calendar of Events", href: "/dashboard/calendar-events", icon: CalendarDays },
        { name: "System Settings", href: "/dashboard/system-settings", icon: Settings },
      ]
    }

    // Principal navigation items
    if (user.role === "principal") {
      return [
        { name: "Dashboard", href: "/dashboard", icon: Home },
        { name: "Reports", href: "/dashboard/reports", icon: ChartBar },
        { name: "Applied Applications", href: "/dashboard/applied-applications", icon: ClipboardList },
        { name: "Calendar of Events", href: "/dashboard/calendar-events", icon: CalendarDays },
        { name: "Settings", href: "/dashboard/settings", icon: Settings },
      ]
    }

    // Coordinator navigation items
    if (user.role === "coordinator") {
      return [
        { name: "Dashboard", href: "/dashboard", icon: Home },
        { name: "Manage Subjects", href: "/dashboard/manage-subjects", icon: BookOpen }, // Re-added
        { name: "Assign Subjects", href: "/dashboard/assign-subjects", icon: BookmarkPlus },
        { name: "Create Timetable", href: "/dashboard/create-timetable", icon: Calendar },
        { name: "Assign Proctees", href: "/dashboard/assign-proctees", icon: UserCog },
        { name: "Forms", href: "/dashboard/forms", icon: FormInput },
        { name: "Student Feedback", href: "/dashboard/student-feedback", icon: MessageSquare },
        { name: "Calendar of Events", href: "/dashboard/calendar-events", icon: CalendarDays },
        { name: "Achievements", href: "/dashboard/achievements", icon: Award },
        { name: "Settings", href: "/dashboard/settings", icon: Settings },
      ]
    }

    // Default navigation for any other role
    return [
      { name: "Dashboard", href: "/dashboard", icon: Home },
      { name: "Calendar of Events", href: "/dashboard/calendar-events", icon: CalendarDays },
      { name: "Achievements", href: "/dashboard/achievements", icon: Award },
      { name: "Settings", href: "/dashboard/settings", icon: Settings },
    ]
  }

  const navigation = getNavigation()

  // Mock notifications
  // const notifications = [
  //   {
  //     id: 1,
  //     title: "Class Schedule Change",
  //     description: "Your Artificial Intelligence class on Friday has been moved to Room 302.",
  //     time: "5 hours ago",
  //   },
  //   {
  //     id: 2,
  //     title: "University Announcement",
  //     description: "The library will be closed this weekend for maintenance.",
  //     time: "2 days ago",
  //   },
  // ]

  useEffect(() => {
    const handleRoleChange = (event: Event) => {
      const customEvent = event as CustomEvent
      if (customEvent.detail) {
        setActiveRole(customEvent.detail.newRole)
      }
    }

    window.addEventListener("roleChange", handleRoleChange)

    return () => {
      window.removeEventListener("roleChange", handleRoleChange)
    }
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <div className="flex h-screen bg-[#f5f5f5] dark:bg-background">
      {/* Sidebar - Desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-white dark:bg-background border-r dark:border-muted/30">
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center h-16 flex-shrink-0 px-4 border-b dark:bg-[#131825] bg-[#f9f9f7]">
            <Link href="/dashboard" className="flex items-center">
              <Image
                src="/images/logodark.png"
                alt="NexaLink Logo"
                width={150}
                height={40}
                className="hidden dark:block"
              />
              <Image
                src="/images/logolight(1).png"
                alt="NexaLink Logo"
                width={150}
                height={40}
                className="block dark:hidden"
              />
            </Link>
          </div>
          <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 px-2 py-4 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center px-4 py-3 text-sm font-medium rounded-md
                    ${
                      pathname === item.href
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }
                  `}
                >
                  <item.icon className="mr-3 h-5 w-5" aria-hidden="true" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex flex-col p-4 border-t">
            <div className="flex items-center mb-2">
              <div className="flex-shrink-0 cursor-pointer" onClick={() => setProfileDialogOpen(true)}>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.profilePicture || "/placeholder.svg"} />
                  <AvatarFallback>{getInitials()}</AvatarFallback>
                </Avatar>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{getUserDisplayName()}</p>
                <div className="flex items-center">
                  {(user?.role === "hod" ||
                    user?.role === "admin" ||
                    user?.role === "principal" ||
                    user?.role === "coordinator") &&
                  localStorage.getItem("activeRole") === "faculty" ? (
                    <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 rounded-sm mr-1">
                      Faculty View
                    </span>
                  ) : (
                    <p className="text-xs text-muted-foreground capitalize">{user?.role || "User"}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Role switcher button for HOD */}
            {user?.role === "hod" && (
              <Button
                variant="outline"
                size="sm"
                className="mb-2 justify-start gap-2 bg-transparent"
                onClick={() => {
                  const currentRole = localStorage.getItem("activeRole") || user?.role
                  const newRole = currentRole === "hod" ? "faculty" : "hod"
                  localStorage.setItem("activeRole", newRole)

                  // Dispatch events to ensure all components update
                  window.dispatchEvent(
                    new CustomEvent("roleChange", {
                      detail: { newRole, previousRole: currentRole },
                    }),
                  )

                  window.dispatchEvent(
                    new StorageEvent("storage", {
                      key: "activeRole",
                      newValue: newRole,
                      oldValue: currentRole,
                    }),
                  )

                  toast({
                    title: `Switched to ${newRole === "hod" ? "HOD" : "Faculty"} view`,
                    description: `You are now viewing the dashboard as a ${newRole === "hod" ? "Head of Department" : "Faculty member"}.`,
                  })

                  // Force a re-render by updating state
                  setActiveRole(newRole)

                  // Navigate to dashboard
                  router.push("/dashboard")
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                  <path d="M3 3v5 h5"></path>
                  <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path>
                  <path d="M16 21h5v-5"></path>
                </svg>
                <span>Switch to {localStorage.getItem("activeRole") === "faculty" ? "HOD" : "Faculty"} View</span>
              </Button>
            )}

            {/* Role switcher button for Admin */}
            {user?.role === "admin" && (
              <Button
                variant="outline"
                size="sm"
                className="mb-2 justify-start gap-2 bg-transparent"
                onClick={() => {
                  const currentRole = localStorage.getItem("activeRole") || user?.role
                  const newRole = currentRole === "admin" ? "faculty" : "admin"
                  localStorage.setItem("activeRole", newRole)

                  // Dispatch events to ensure all components update
                  window.dispatchEvent(
                    new CustomEvent("roleChange", {
                      detail: { newRole, previousRole: currentRole },
                    }),
                  )

                  window.dispatchEvent(
                    new StorageEvent("storage", {
                      key: "activeRole",
                      newValue: newRole,
                      oldValue: currentRole,
                    }),
                  )

                  toast({
                    title: `Switched to ${newRole === "admin" ? "Admin" : "Faculty"} view`,
                    description: `You are now viewing the dashboard as ${newRole === "admin" ? "an Administrator" : "a Faculty member"}.`,
                  })

                  // Force a re-render by updating state
                  setActiveRole(newRole)

                  // Navigate to dashboard
                  router.push("/dashboard")
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                  <path d="M3 3v5 h5"></path>
                  <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path>
                  <path d="M16 21h5v-5"></path>
                </svg>
                <span>Switch to {localStorage.getItem("activeRole") === "faculty" ? "Admin" : "Faculty"} View</span>
              </Button>
            )}

            {/* Role switcher button for Principal */}
            {user?.role === "principal" && (
              <Button
                variant="outline"
                size="sm"
                className="mb-2 justify-start gap-2 bg-transparent"
                onClick={() => {
                  const currentRole = localStorage.getItem("activeRole") || user?.role
                  const newRole = currentRole === "principal" ? "faculty" : "principal"
                  localStorage.setItem("activeRole", newRole)

                  // Dispatch events to ensure all components update
                  window.dispatchEvent(
                    new CustomEvent("roleChange", {
                      detail: { newRole, previousRole: currentRole },
                    }),
                  )

                  window.dispatchEvent(
                    new StorageEvent("storage", {
                      key: "activeRole",
                      newValue: newRole,
                      oldValue: currentRole,
                    }),
                  )

                  toast({
                    title: `Switched to ${newRole === "principal" ? "Principal" : "Faculty"} view`,
                    description: `You are now viewing the dashboard as ${newRole === "principal" ? "a Principal" : "a Faculty member"}.`,
                  })

                  // Force a re-render by updating state
                  setActiveRole(newRole)

                  // Navigate to dashboard
                  router.push("/dashboard")
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                  <path d="M3 3v5 h5"></path>
                  <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path>
                  <path d="M16 21h5v-5"></path>
                </svg>
                <span>Switch to {localStorage.getItem("activeRole") === "faculty" ? "Principal" : "Faculty"} View</span>
              </Button>
            )}

            {/* Role switcher button for Coordinator */}
            {user?.role === "coordinator" && (
              <Button
                variant="outline"
                size="sm"
                className="mb-2 justify-start gap-2 bg-transparent"
                onClick={() => {
                  const currentRole = localStorage.getItem("activeRole") || user?.role
                  const newRole = currentRole === "coordinator" ? "faculty" : "coordinator"
                  localStorage.setItem("activeRole", newRole)

                  // Dispatch events to ensure all components update
                  window.dispatchEvent(
                    new CustomEvent("roleChange", {
                      detail: { newRole, previousRole: currentRole },
                    }),
                  )

                  window.dispatchEvent(
                    new StorageEvent("storage", {
                      key: "activeRole",
                      newValue: newRole,
                      oldValue: currentRole,
                    }),
                  )

                  toast({
                    title: `Switched to ${newRole === "coordinator" ? "Coordinator" : "Faculty"} view`,
                    description: `You are now viewing the dashboard as ${newRole === "coordinator" ? "a Coordinator" : "a Faculty member"}.`,
                  })

                  // Force a re-render by updating state
                  setActiveRole(newRole)

                  // Navigate to dashboard
                  router.push("/dashboard")
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                  <path d="M3 3v5 h5"></path>
                  <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path>
                  <path d="M16 21h5v-5"></path>
                </svg>
                <span>
                  Switch to {localStorage.getItem("activeRole") === "faculty" ? "Coordinator" : "Faculty"} View
                </span>
              </Button>
            )}

            <Button variant="outline" className="w-full justify-start gap-2 bg-transparent" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              <span>Log out</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-[250px] sm:w-[300px] p-0">
          <div className="flex items-center h-16 px-4 border-b dark:bg-[#131925] bg-[#f9f9f7]">
            <Link href="/dashboard" className="flex items-center" onClick={() => setMobileMenuOpen(false)}>
              <Image
                src="/images/logodark.png"
                alt="NexaLink Logo"
                width={150}
                height={40}
                className="hidden dark:block"
              />
              <Image
                src="/images/logolight(1).png"
                alt="NexaLink Logo"
                width={150}
                height={40}
                className="block dark:hidden"
              />
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto">
            <nav className="px-2 py-4 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center px-4 py-3 text-sm font-medium rounded-md
                    ${
                      pathname === item.href
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }
                  `}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="mr-3 h-5 w-5" aria-hidden="true" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex flex-col p-4 border-t">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 cursor-pointer" onClick={() => setProfileDialogOpen(true)}>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.profilePicture || "/placeholder.svg"} />
                  <AvatarFallback>{getInitials()}</AvatarFallback>
                </Avatar>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{getUserDisplayName()}</p>
                {(user?.role === "hod" ||
                  user?.role === "admin" ||
                  user?.role === "principal" ||
                  user?.role === "coordinator") &&
                localStorage.getItem("activeRole") === "faculty" ? (
                  <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 rounded-sm mr-1">
                    Faculty View
                  </span>
                ) : (
                  <p className="text-xs text-muted-foreground capitalize">{user?.role || "User"}</p>
                )}
              </div>
            </div>
            <Button variant="outline" className="w-full justify-start gap-2 bg-transparent" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              <span>Log out</span>
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Profile Picture Upload Dialog */}
      <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Profile Picture</DialogTitle>
            <DialogDescription>Update your profile picture</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center gap-4 py-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user?.profilePicture || "/placeholder.svg"} />
              <AvatarFallback className="text-lg">{getInitials()}</AvatarFallback>
            </Avatar>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleProfilePictureUpload}
            />
            <Button onClick={() => fileInputRef.current?.click()} variant="outline">
              Upload New Picture
            </Button>
          </div>
          <DialogFooter>
            <Button onClick={() => setProfileDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Leaves Dialog */}
      <Dialog open={leaveDialogOpen} onOpenChange={setLeaveDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Manage Leave Allocations</DialogTitle>
            <DialogDescription>Set the number of leaves available for each category.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="casualLeaves">Casual Leaves</Label>
                <Input
                  id="casualLeaves"
                  type="number"
                  value={leaveValues.casualLeaves}
                  onChange={(e) =>
                    setLeaveValues({ ...leaveValues, casualLeaves: Number.parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="earnedLeaves">Earned Leaves</Label>
                <Input
                  id="earnedLeaves"
                  type="number"
                  value={leaveValues.earnedLeaves}
                  onChange={(e) =>
                    setLeaveValues({ ...leaveValues, earnedLeaves: Number.parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="leavesWithoutPay">Leaves Without Pay</Label>
                <Input
                  id="leavesWithoutPay"
                  type="number"
                  value={leaveValues.leavesWithoutPay}
                  onChange={(e) =>
                    setLeaveValues({ ...leaveValues, leavesWithoutPay: Number.parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="otherLeaves">Other Leaves</Label>
                <Input
                  id="otherLeaves"
                  type="number"
                  value={leaveValues.otherLeaves}
                  onChange={(e) =>
                    setLeaveValues({ ...leaveValues, otherLeaves: Number.parseInt(e.target.value) || 0 })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLeaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => handleLeaveFormSubmit(leaveValues)}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <div className="sticky top-0 z-10 flex-shrink-0 h-16 bg-white dark:bg-[#131825] bg-[#f9f9f7] border-b flex">
          <button
            type="button"
            className="md:hidden px-4 text-muted-foreground focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6 text-primary" aria-hidden="true" />
          </button>
          <div className="flex-1 flex items-center justify-between px-4">
            <div className="flex-1 max-w-xs">
              <div className="w-full flex items-center">
                <div className="relative w-full text-muted-foreground focus-within:text-foreground">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <Input placeholder="Search..." className="pl-10 bg-muted/50 h-9" />
                </div>
              </div>
            </div>
            <div className="ml-4 flex items-center md:ml-6 gap-2">
              <ContactUsDialog />

              {/* Single notification dropdown - remove any duplicate Bell components */}
              <NotificationsDropdown />

              <ThemeToggle />

              {/* Profile dropdown with role switcher */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative rounded-full">
                    <span className="sr-only">Open user menu</span>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.profilePicture || "/placeholder.svg"} />
                      <AvatarFallback>{getInitials()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span>{getUserDisplayName()}</span>
                      <span className="text-xs text-muted-foreground">{user?.email}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  {/* Role switcher - only show for HOD users */}
                  {user?.role === "hod" && (
                    <>
                      <DropdownMenuLabel>Switch Role</DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => {
                          const currentRole = localStorage.getItem("activeRole") || user?.role
                          const newRole = currentRole === "hod" ? "faculty" : "hod"
                          localStorage.setItem("activeRole", newRole)

                          // Dispatch events to ensure all components update
                          window.dispatchEvent(
                            new CustomEvent("roleChange", {
                              detail: { newRole, previousRole: currentRole },
                            }),
                          )

                          window.dispatchEvent(
                            new StorageEvent("storage", {
                              key: "activeRole",
                              newValue: newRole,
                              oldValue: currentRole,
                            }),
                          )

                          toast({
                            title: `Switched to ${newRole === "hod" ? "HOD" : "Faculty"} view`,
                            description: `You are now viewing the dashboard as a ${newRole === "hod" ? "Head of Department" : "Faculty member"}.`,
                          })
                          // Use router.push instead of window.location.reload
                          router.push("/dashboard")
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="mr-2 h-4 w-4"
                        >
                          <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                          <path d="M3 3v5 h5"></path>
                          <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path>
                          <path d="M16 21h5v-5"></path>
                        </svg>
                        <span>
                          Switch to {localStorage.getItem("activeRole") === "faculty" ? "HOD" : "Faculty"} View
                        </span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}

                  {/* Role switcher - only show for Admin users */}
                  {user?.role === "admin" && (
                    <>
                      <DropdownMenuLabel>Switch Role</DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => {
                          const currentRole = localStorage.getItem("activeRole") || user?.role
                          const newRole = currentRole === "admin" ? "faculty" : "admin"
                          localStorage.setItem("activeRole", newRole)

                          // Dispatch events to ensure all components update
                          window.dispatchEvent(
                            new CustomEvent("roleChange", {
                              detail: { newRole, previousRole: currentRole },
                            }),
                          )

                          window.dispatchEvent(
                            new StorageEvent("storage", {
                              key: "activeRole",
                              newValue: newRole,
                              oldValue: currentRole,
                            }),
                          )

                          toast({
                            title: `Switched to ${newRole === "admin" ? "Admin" : "Faculty"} view`,
                            description: `You are now viewing the dashboard as ${newRole === "admin" ? "an Administrator" : "a Faculty member"}.`,
                          })
                          // Use router.push instead of window.location.reload
                          router.push("/dashboard")
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="mr-2 h-4 w-4"
                        >
                          <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                          <path d="M3 3v5 h5"></path>
                          <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path>
                          <path d="M16 21h5v-5"></path>
                        </svg>
                        <span>
                          Switch to {localStorage.getItem("activeRole") === "faculty" ? "Admin" : "Faculty"} View
                        </span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}

                  {/* Role switcher - only show for Principal users */}
                  {user?.role === "principal" && (
                    <>
                      <DropdownMenuLabel>Switch Role</DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => {
                          const currentRole = localStorage.getItem("activeRole") || user?.role
                          const newRole = currentRole === "principal" ? "faculty" : "principal"
                          localStorage.setItem("activeRole", newRole)

                          // Dispatch events to ensure all components update
                          window.dispatchEvent(
                            new CustomEvent("roleChange", {
                              detail: { newRole, previousRole: currentRole },
                            }),
                          )

                          window.dispatchEvent(
                            new StorageEvent("storage", {
                              key: "activeRole",
                              newValue: newRole,
                              oldValue: currentRole,
                            }),
                          )

                          toast({
                            title: `Switched to ${newRole === "principal" ? "Principal" : "Faculty"} view`,
                            description: `You are now viewing the dashboard as ${newRole === "principal" ? "a Principal" : "a Faculty member"}.`,
                          })
                          // Use router.push instead of window.location.reload
                          router.push("/dashboard")
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="mr-2 h-4 w-4"
                        >
                          <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                          <path d="M3 3v5 h5"></path>
                          <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path>
                          <path d="M16 21h5v-5"></path>
                        </svg>
                        <span>
                          Switch to {localStorage.getItem("activeRole") === "faculty" ? "Principal" : "Faculty"} View
                        </span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}

                  {/* Role switcher - only show for Coordinator users */}
                  {user?.role === "coordinator" && (
                    <>
                      <DropdownMenuLabel>Switch Role</DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => {
                          const currentRole = localStorage.getItem("activeRole") || user?.role
                          const newRole = currentRole === "coordinator" ? "faculty" : "coordinator"
                          localStorage.setItem("activeRole", newRole)

                          // Dispatch events to ensure all components update
                          window.dispatchEvent(
                            new CustomEvent("roleChange", {
                              detail: { newRole, previousRole: currentRole },
                            }),
                          )

                          window.dispatchEvent(
                            new StorageEvent("storage", {
                              key: "activeRole",
                              newValue: newRole,
                              oldValue: currentRole,
                            }),
                          )

                          toast({
                            title: `Switched to ${newRole === "coordinator" ? "Coordinator" : "Faculty"} view`,
                            description: `You are now viewing the dashboard as ${newRole === "coordinator" ? "a Coordinator" : "a Faculty member"}.`,
                          })
                          // Use router.push instead of window.location.reload
                          router.push("/dashboard")
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="mr-2 h-4 w-4"
                        >
                          <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                          <path d="M3 3v5 h5"></path>
                          <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path>
                          <path d="M16 21h5v-5"></path>
                        </svg>
                        <span>
                          Switch to {localStorage.getItem("activeRole") === "faculty" ? "Coordinator" : "Faculty"} View
                        </span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}

                  <DropdownMenuItem onClick={() => setProfileDialogOpen(true)}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile Picture</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto bg-[#f5f5f5] dark:bg-background">
          {user?.role === "admin" && (
            <div className="py-4 sm:py-6" data-interactive-container="true">
              <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
                <Suspense
                  fallback={
                    <div className="flex items-center justify-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
                      <span className="ml-2">Loading content...</span>
                    </div>
                  }
                >
                  {children}
                </Suspense>
              </div>
            </div>
          )}
          {user?.role !== "admin" && (
            <div className="py-4 sm:py-6" data-interactive-container="true">
              <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
                <Suspense
                  fallback={
                    <div className="flex items-center justify-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
                      <span className="ml-2">Loading content...</span>
                    </div>
                  }
                >
                  {children}
                </Suspense>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
