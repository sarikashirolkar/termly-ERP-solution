"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { BookOpen, Calendar, FileText, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { notificationService } from "@/lib/supabase-service"
import { ViewAllAnnouncementsDialog } from "@/components/view-all-announcements-dialog"
import { Bell } from "lucide-react"

function CoordinatorDashboard({ user }: { user: any }) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [announcements, setAnnouncements] = useState<any[]>([])

  // Placeholder stats for Coordinator Dashboard
  const [stats, setStats] = useState([
    {
      id: 1,
      title: "Managed Courses",
      value: "8",
      description: "In your department",
      icon: BookOpen,
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      iconColor: "text-blue-500 dark:text-blue-400",
      href: "/dashboard/courses",
    },
    {
      id: 2,
      title: "Assigned Faculty",
      value: "15",
      description: "In your department",
      icon: Users,
      bgColor: "bg-green-50 dark:bg-green-900/20",
      iconColor: "text-green-500 dark:text-green-400",
      href: "/dashboard/faculty",
    },
    {
      id: 3,
      title: "Pending Approvals",
      value: "5",
      description: "Certifications/Forms",
      icon: FileText,
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      iconColor: "text-purple-500 dark:text-purple-400",
      href: "/dashboard/applied-applications",
    },
    {
      id: 4,
      title: "Upcoming Events",
      value: "3",
      description: "This week",
      icon: Calendar,
      bgColor: "bg-amber-50 dark:bg-amber-900/20",
      iconColor: "text-amber-500 dark:text-amber-400",
      href: "/dashboard/calendar-events",
    },
  ])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        // Fetch notifications
        const notificationsResponse = await notificationService.getAll()
        setAnnouncements(
          notificationsResponse.slice(0, 5).map((notif: any) => ({
            id: notif.id,
            title: notif.title,
            description: notif.message,
            date: notif.created_at,
            icon: Bell,
            important: notif.priority === "high" || notif.priority === "urgent",
          })),
        )
        // In a real application, you would fetch coordinator-specific data here
        // For now, we'll use static mock data for stats.
      } catch (error) {
        console.error("Failed to fetch coordinator dashboard data:", error)
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please check your database connection.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [toast])

  // Quick links for coordinator
  const quickLinks = [
    { id: 1, title: "Manage Courses", href: "/dashboard/courses" },
    { id: 2, title: "Manage Faculty", href: "/dashboard/faculty" },
    { id: 3, title: "View Student Applications", href: "/dashboard/applied-applications" },
    { id: 4, title: "Manage Timetable", href: "/dashboard/create-timetable" },
    { id: 5, title: "CO-PO Mapping", href: "/dashboard/co-po-mapping" },
    { id: 6, title: "Generate Reports", href: "/dashboard/reports" },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Loading...</h1>
            <p className="text-muted-foreground">Fetching coordinator dashboard data...</p>
          </div>
        </div>
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4 md:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {user?.firstName || "Coordinator"}</h1>
          <p className="text-muted-foreground">Here's an overview of your coordinator responsibilities.</p>
        </div>
        {/* Coordinator might not create announcements, or it might be a different type of announcement */}
        {/* <CreateAnnouncementDialog /> */}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4 md:gap-4">
        {stats.map((stat) => (
          <Card
            key={stat.id}
            className={`${stat.bgColor} border-none shadow-sm hover:shadow-md hover:scale-[1.03] transition-all duration-200 cursor-pointer`}
            onClick={() => router.push(stat.href)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Coordinator specific sections - e.g., Course Management, Faculty Assignments, Pending Forms */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Course Management Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="font-medium">Total Courses Managed</span>
                <span className="font-medium">8</span>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <span className="font-medium">Courses Needing Faculty Assignment</span>
                <span className="font-medium">2</span>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <span className="font-medium">Upcoming Course Audits</span>
                <span className="font-medium">Next Month</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Student Applications/Forms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="font-medium">Leave Applications</span>
                <span className="font-medium">3</span>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <span className="font-medium">Certification Verifications</span>
                <span className="font-medium">2</span>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <span className="font-medium">Course Change Requests</span>
                <span className="font-medium">1</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Announcements (shared with other roles) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent Announcements</h2>
          <ViewAllAnnouncementsDialog announcements={announcements} />
        </div>
        <div className="space-y-4">
          {announcements.length > 0 ? (
            announcements.map((announcement) => (
              <Card
                key={announcement.id}
                className="bg-white dark:bg-background shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-200 cursor-pointer"
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-2 md:gap-4">
                    <div className="rounded-full bg-primary/10 p-2 mt-1">
                      <announcement.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{announcement.title}</h3>
                        {announcement.important && (
                          <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-300">
                            Important
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{announcement.description}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          Posted on {new Date(announcement.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="bg-white dark:bg-background">
              <CardContent className="p-8 text-center">
                <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No announcements yet</h3>
                <p className="text-muted-foreground">Create your first announcement to get started.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Quick Links</h2>
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 md:gap-4">
          {quickLinks.map((link) => (
            <Link key={link.id} href={link.href}>
              <Card className="shadow-sm hover:bg-muted/70 hover:shadow-md hover:scale-[1.02] transition-all duration-200 cursor-pointer bg-white dark:bg-background">
                <CardContent className="p-4 flex items-center justify-between">
                  <span className="font-medium">{link.title}</span>
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
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <path d="M5 12h14"></path>
                    <path d="m12 5 7 7-7 7"></path>
                  </svg>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export { CoordinatorDashboard }
