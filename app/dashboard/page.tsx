"use client"

import { TableHeader } from "@/components/ui/table"

import { Table, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { Bell, BookOpen, Calendar, FileText, Users, GraduationCap, Award, BarChart, ClipboardCheck } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PrincipalDashboardCharts } from "@/components/dashboard/principal-dashboard-charts"
import { CreateAnnouncementDialog } from "@/components/create-announcement-dialog"
import { format, addDays, startOfWeek } from "date-fns"
import { ViewAllAnnouncementsDialog } from "@/components/view-all-announcements-dialog"
import { StudentTimetable } from "@/components/dashboard/student-timetable"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import {
  facultyService,
  analyticsService,
  notificationService,
  studentService,
  achievementService,
  weeklyTimetableModificationsService,
} from "@/lib/supabase-service-new"

// Student Dashboard
function StudentDashboard({ user }: { user: any }) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [studentData, setStudentData] = useState<any>(null)
  const [achievements, setAchievements] = useState<any[]>([])
  const [attendance, setAttendance] = useState<number>(85)
  const [certifications, setCertifications] = useState<any[]>([])

  // Fetch student data
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoading(true)

        // Fetch student profile data
        try {
          const response = await fetch("/api/students")
          if (response.ok) {
            const data = await response.json()
            setStudentData(data)
          }
        } catch (error) {
          console.log("Students API not available, using defaults")
        }

        // Fetch achievements
        try {
          const { data: achievementsData, error: achievementsError } = await achievementService.getAll()
          if (achievementsError) {
            console.error("Error fetching achievements:", achievementsError)
          } else {
            setAchievements(achievementsData || [])
          }
        } catch (error) {
          console.log("Achievements API not available, using defaults")
        }

        // Fetch certifications
        try {
          const certificationsResponse = await fetch("/api/certifications")
          if (certificationsResponse.ok) {
            const certificationsData = await certificationsResponse.json()
            setCertifications(certificationsData)
          }
        } catch (error) {
          console.log("Certifications API not available, using defaults")
        }

        // Fetch attendance data
        try {
          const attendanceResponse = await fetch("/api/attendance")
          if (attendanceResponse.ok) {
            const attendanceData = await attendanceResponse.json()
            setAttendance(attendanceData.averageAttendance || 85)
          }
        } catch (error) {
          console.log("Attendance API not available, using defaults")
        }
      } catch (error) {
        console.error("Failed to fetch student data:", error)
        toast({
          title: "Error",
          description: "Failed to load student dashboard data.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStudentData()
  }, [toast])

  const stats = [
    {
      id: 1,
      title: "Average Attendance",
      value: `${attendance}%`,
      description: "All your courses",
      icon: ClipboardCheck,
      bgColor: "bg-green-50 dark:bg-green-900/20",
      iconColor: "text-green-500 dark:text-green-400",
      href: "/dashboard/attendance",
    },
    {
      id: 2,
      title: "My Certifications",
      value: `${certifications?.length || 0}`,
      description: "Uploaded certifications",
      icon: Award,
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      iconColor: "text-purple-500 dark:text-purple-400",
      href: "/dashboard/certifications",
    },
    {
      id: 3,
      title: "My Achievements",
      value: `${achievements?.length || 0}`,
      description: "Verified achievements",
      icon: Award,
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      iconColor: "text-blue-500 dark:text-blue-400",
      href: "/dashboard/achievements",
    },
    {
      id: 4,
      title: "Marks Report",
      value: "View",
      description: "Check your marks report",
      icon: BarChart,
      bgColor: "bg-amber-50 dark:bg-amber-900/20",
      iconColor: "text-amber-500 dark:text-amber-400",
      href: "/dashboard/marks-report",
    },
  ]

  const announcements = [
    {
      id: 1,
      title: "Library Hours Extended for Finals Week",
      description:
        "The university library will extend its hours during finals week. The library will be open from 7 AM to midnight from December 10-17.",
      date: "1/3/2025",
      icon: Bell,
    },
    {
      id: 2,
      title: "Campus Closed for Maintenance",
      description:
        "The main campus will be closed on Saturday, October 15 for scheduled maintenance. All classes will be conducted online.",
      date: "29/2/2025",
      icon: Bell,
      important: true,
    },
  ]

  const quickLinks = [
    { id: 1, title: "View My Profile", href: "/dashboard/student-profile" },
    { id: 2, title: "View Attendance Report", href: "/dashboard/attendance" },
    { id: 3, title: "View Marks Report", href: "/dashboard/marks-report" },
    { id: 4, title: "Calculate CGPA", href: "/dashboard/cgpa-calculator" },
    { id: 5, title: "Academic Calendar", href: "/dashboard/calendar-events" },
    { id: 6, title: "Support & Help", href: "/dashboard/help" },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Loading...</h1>
            <p className="text-muted-foreground">Fetching your dashboard data...</p>
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
          <h1 className="text-2xl font-bold">Welcome back, {user?.firstName || user?.name || "Student"}</h1>
          <p className="text-muted-foreground">Here's what's happening in your academic portal today.</p>
        </div>
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

      {/* My Class Timetable */}
      <StudentTimetable />

      {/* Recent Announcements */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent Announcements</h2>
          <Button variant="outline" size="sm">
            View All
          </Button>
        </div>
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <Card key={announcement.id} className="bg-white dark:bg-background">
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
                    <div className="mt-2">
                      <span className="text-xs text-muted-foreground">Posted on {announcement.date}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
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

// HOD Dashboard
function HODDashboard({ user }: { user: any }) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [departmentData, setDepartmentData] = useState<any>(null)
  const [facultyData, setFacultyData] = useState<any[]>([])
  const [studentData, setStudentData] = useState<any[]>([])
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [departmentStudents, setDepartmentStudents] = useState(0)
  const [activeFaculty, setActiveFaculty] = useState(0)

  // Fetch HOD dashboard data
  useEffect(() => {
    const fetchHODData = async () => {
      try {
        setLoading(true)

        // Fetch department data
        try {
          const deptResponse = await fetch("/api/departments")
          if (deptResponse.ok) {
            const deptData = await deptResponse.json()
            setDepartmentData(deptData)
          }
        } catch (error) {
          console.log("Departments API not available, using defaults")
        }

        // Fetch department-specific student data
        const { data: students, error: studentsError } = await studentService.getByDepartment(user.department)
        if (studentsError) {
          console.error("Error fetching department students:", studentsError)
          setStudentData([])
        } else {
          setStudentData(students || [])
          setDepartmentStudents(students?.length || 0)
        }

        // Fetch all faculty and then filter by the HOD's department
        try {
          const { data: facultyResponse, error: facultyError } = await facultyService.getByDepartment(user.department)
          if (facultyError) {
            console.log("Faculty API not available or error fetching department faculty, using defaults", facultyError)
            setFacultyData([
              { name: "Dr. Rajesh Kumar", designation: "Associate Professor", specialization: "Data Structures" },
              { name: "Prof. Priya Sharma", designation: "Assistant Professor", specialization: "Database Systems" },
              { name: "Dr. Amit Patel", designation: "Professor", specialization: "Computer Networks" },
              { name: "Prof. Sneha Verma", designation: "Assistant Professor", specialization: "Operating Systems" },
              { name: "Dr. Vikram Singh", designation: "Associate Professor", specialization: "Software Engineering" },
            ])
          } else {
            setFacultyData(facultyResponse || [])
            setActiveFaculty(facultyResponse?.length || 0)
          }
        } catch (error) {
          console.log("Faculty API not available, using defaults", error)
          setFacultyData([
            { name: "Dr. Rajesh Kumar", designation: "Associate Professor", specialization: "Data Structures" },
            { name: "Prof. Priya Sharma", designation: "Assistant Professor", specialization: "Database Systems" },
            { name: "Dr. Amit Patel", designation: "Professor", specialization: "Computer Networks" },
            { name: "Prof. Sneha Verma", designation: "Assistant Professor", specialization: "Operating Systems" },
            { name: "Dr. Vikram Singh", designation: "Associate Professor", specialization: "Software Engineering" },
          ])
        }

        // Fetch announcements
        try {
          const announcementsResponse = await fetch("/api/notifications")
          if (announcementsResponse.ok) {
            const announcementsList = await announcementsResponse.json()
            setAnnouncements(announcementsList.slice(0, 2))
          }
        } catch (error) {
          console.log("Notifications API not available, using defaults")
          setAnnouncements([
            {
              id: 1,
              title: "Computer Science Faculty Meeting",
              description:
                "There will be a Computer Science faculty meeting on Friday at 2 PM in the Conference Hall to discuss the upcoming semester planning.",
              date: "1/3/2025",
              icon: Bell,
            },
            {
              id: 2,
              title: "Course Allocation Deadline",
              description:
                "All Computer Science faculty members must submit their course preferences for the next semester by March 15th.",
              date: "26/2/2025",
              icon: Bell,
              important: true,
            },
          ])
        }
      } catch (error) {
        console.error("Failed to fetch HOD data:", error)
        toast({
          title: "Error",
          description: "Failed to load HOD dashboard data.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchHODData()
  }, [user, toast])

  const stats = [
    {
      id: 1,
      title: "Department Students",
      value: departmentStudents.toString(),
      description: "Currently enrolled",
      icon: Users,
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      iconColor: "text-blue-500 dark:text-blue-400",
      href: "/dashboard/students",
    },
    {
      id: 2,
      title: "Department Faculty",
      value: activeFaculty.toString(),
      description: "Active faculty",
      icon: GraduationCap,
      bgColor: "bg-green-50 dark:bg-green-900/20",
      iconColor: "text-green-500 dark:text-green-400",
      href: "/dashboard/department-faculty",
    },
    {
      id: 3,
      title: "Attendance Rate",
      value: "89%",
      description: "Department average",
      icon: Calendar,
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      iconColor: "text-purple-500 dark:text-purple-400",
      href: "/dashboard/reports",
    },
    {
      id: 4,
      title: "Average Performance",
      value: "82%",
      description: "Department academics",
      icon: BarChart,
      bgColor: "bg-amber-50 dark:bg-amber-900/20",
      iconColor: "text-amber-500 dark:text-amber-400",
      href: "/dashboard/reports",
    },
  ]

  const defaultFacultyData = [
    { name: "Dr. Rajesh Kumar", designation: "Associate Professor", specialization: "Data Structures" },
    { name: "Prof. Priya Sharma", designation: "Assistant Professor", specialization: "Database Systems" },
    { name: "Dr. Amit Patel", designation: "Professor", specialization: "Computer Networks" },
    { name: "Prof. Sneha Verma", designation: "Assistant Professor", specialization: "Operating Systems" },
    { name: "Dr. Vikram Singh", designation: "Associate Professor", specialization: "Software Engineering" },
  ]

  const studentDistribution = [
    { semester: "Semester 1", students: 42, performance: "86.5%", attendance: "92%" },
    { semester: "Semester 3", students: 38, performance: "82.3%", attendance: "88%" },
    { semester: "Semester 5", students: 45, performance: "79.8%", attendance: "85%" },
    { semester: "Semester 7", students: 40, performance: "84.2%", attendance: "90%" },
  ]

  const defaultAnnouncements = [
    {
      id: 1,
      title: "Computer Science Faculty Meeting",
      description:
        "There will be a Computer Science faculty meeting on Friday at 2 PM in the Conference Hall to discuss the upcoming semester planning.",
      date: "1/3/2025",
      icon: Bell,
    },
    {
      id: 2,
      title: "Course Allocation Deadline",
      description:
        "All Computer Science faculty members must submit their course preferences for the next semester by March 15th.",
      date: "26/2/2025",
      icon: Bell,
      important: true,
    },
  ]

  const quickLinks = [
    { id: 1, title: "Department Faculty", href: "/dashboard/department-faculty" },
    { id: 2, title: "Department Students", href: "/dashboard/department-students" },
    { id: 3, title: "Department Courses", href: "/dashboard/department-courses" },
    { id: 4, title: "Department CO-PO", href: "/dashboard/department-co-po" },
    { id: 5, title: "Department Reports", href: "/dashboard/department-reports" },
    { id: 6, title: "Applied Applications", href: "/dashboard/applied-applications" },
    { id: 7, title: "Upload Calendar", href: "/dashboard/upload-calendar" },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Loading...</h1>
            <p className="text-muted-foreground">Fetching department data...</p>
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
          <h1 className="text-2xl font-bold">Welcome back, {user?.firstName || user?.name || "HOD"}</h1>
          <p className="text-muted-foreground">Here's an overview of your department.</p>
        </div>
        <CreateAnnouncementDialog />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4 md:gap-4">
        {stats.map((stat) => (
          <Card
            key={stat.id}
            className={`${stat.bgColor} border-none shadow-sm hover:shadow-md hover:scale-[1.03] transition-all duration-200 cursor-pointer`}
            onClick={() => (window.location.href = stat.href)}
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

      {/* Department Overview */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Department Faculty Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Department Faculty Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-sm font-medium border-b pb-2">
                <div>Name</div>
                <div>Designation</div>
                <div>Specialization</div>
              </div>
              {(facultyData.length > 0 ? facultyData : defaultFacultyData).map((faculty, index) => (
                <div key={index} className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-blue-600">{faculty.name}</div>
                  <div>{faculty.designation}</div>
                  <div>{faculty.specialization}</div>
                </div>
              ))}
              <div className="pt-2">
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  View All Faculty
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Student Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Student Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Semester</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Attendance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentDistribution.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.semester}</TableCell>
                    <TableCell>{item.students}</TableCell>
                    <TableCell>{item.performance}</TableCell>
                    <TableCell>{item.attendance}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex justify-end mt-4">
              <Button variant="outline" size="sm" className="w-full bg-transparent">
                View All Students
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Announcements */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Department Announcements</h2>
          <Button variant="outline" size="sm">
            Create Announcement
          </Button>
        </div>
        <div className="space-y-4">
          {(announcements.length > 0 ? announcements : defaultAnnouncements).map((announcement) => (
            <Card key={announcement.id} className="bg-white dark:bg-background">
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
                    <div className="mt-2">
                      <span className="text-xs text-muted-foreground">Posted on {announcement.date}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Department Quick Links */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Department Quick Links</h2>
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

// Coordinator Dashboard - Redesigned
function CoordinatorDashboard({ user }: { user: any }) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [managedCoursesCount, setManagedCoursesCount] = useState(0)
  const [pendingFormsCount, setPendingFormsCount] = useState(0)
  const [pendingCertificationsCount, setPendingCertificationsCount] = useState(0)

  // Placeholder stats for Coordinator Dashboard
  const [stats, setStats] = useState([
    {
      id: 1,
      title: "Managed Courses",
      value: "0",
      description: "In your department",
      icon: BookOpen,
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      iconColor: "text-blue-500 dark:text-blue-400",
      href: "/dashboard/manage-subjects", // Changed from /dashboard/courses
    },
    {
      id: 2,
      title: "Assigned Faculty",
      value: "0",
      description: "In your department",
      icon: Users,
      bgColor: "bg-green-50 dark:bg-green-900/20",
      iconColor: "text-green-500 dark:text-green-400",
      href: "/dashboard/faculty",
    },
    {
      id: 3,
      title: "Pending Approvals",
      value: "0",
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
        try {
          const notificationsResponse = await notificationService.getAll()
          setAnnouncements(
            notificationsResponse.data?.slice(0, 5).map((notif: any) => ({
              id: notif.id,
              title: notif.title,
              description: notif.content,
              date: notif.created_at,
              icon: Bell,
              important: notif.priority === "high" || notif.priority === "urgent",
            })) || [],
          )
        } catch (error) {
          console.log("Notifications API not available, using defaults")
          setAnnouncements([
            {
              id: 1,
              title: "Faculty Meeting Scheduled",
              description:
                "There will be a faculty meeting on Friday at 2 PM in the Conference Hall to discuss the upcoming semester planning.",
              date: "1/3/2025",
              icon: Bell,
            },
            {
              id: 2,
              title: "Subject Assignment Deadline",
              description:
                "All faculty members must submit their subject preferences by March 15th for the upcoming semester allocation.",
              date: "26/2/2025",
              icon: Bell,
              important: true,
            },
          ])
        }

        // Fetch managed courses - fix the count
        try {
          const { data: subjects, error: subjectsError } = await supabase
            .from("subjects")
            .select("*")
            .eq("department", user.department)

          if (subjectsError) {
            console.error("Error fetching coordinator subjects:", subjectsError)
          } else {
            setManagedCoursesCount(subjects?.length || 0)
          }
        } catch (error) {
          console.error("Failed to fetch coordinator subjects:", error)
        }

        // Fetch assigned faculty
        let assignedFacultyCount = 0
        try {
          const { data: faculty, error: facultyError } = await facultyService.getByDepartment(user.department)
          if (facultyError) {
            console.error("Error fetching coordinator faculty:", facultyError)
          } else {
            assignedFacultyCount = faculty?.length || 0
          }
        } catch (error) {
          console.error("Failed to fetch coordinator faculty:", error)
        }

        // Fetch pending certifications
        try {
          const { data: certifications, error: certError } = await achievementService.getAll()
          if (certError) {
            console.error("Error fetching certifications:", certError)
          } else {
            setPendingCertificationsCount(
              certifications?.filter((cert: any) => !cert.verified && cert.department === user.department).length || 0,
            )
          }
        } catch (error) {
          console.error("Failed to fetch certifications:", error)
        }

        // Fetch pending applications (forms) - Fixed to use correct enum values
        try {
          const { data: applications, error: applicationsError } = await supabase
            .from("applications")
            .select("status")
            .in("status", ["submitted", "under_review"]) // Use correct enum values

          if (applicationsError) {
            console.error("Error fetching applications:", applicationsError)
          } else {
            setPendingFormsCount(applications?.length || 0)
          }
        } catch (error) {
          console.error("Failed to fetch applications:", error)
        }

        const totalPendingApprovals = pendingCertificationsCount + pendingFormsCount

        setStats((prevStats) =>
          prevStats.map((stat) => {
            if (stat.id === 1) return { ...stat, value: managedCoursesCount.toString() }
            if (stat.id === 2) return { ...stat, value: assignedFacultyCount.toString() }
            if (stat.id === 3) return { ...stat, value: totalPendingApprovals.toString() }
            return stat
          }),
        )
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
  }, [toast, user?.department, managedCoursesCount, pendingCertificationsCount])

  // Quick links for coordinator
  const quickLinks = [
    { id: 1, title: "Manage Courses", href: "/dashboard/manage-subjects" }, // Changed from /dashboard/courses
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
          <h1 className="text-2xl font-bold">Welcome back, {user?.firstName || user?.name || "Coordinator"}</h1>
          <p className="text-muted-foreground">Here's an overview of your coordinator responsibilities.</p>
        </div>
        <CreateAnnouncementDialog />
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

      {/* Coordinator specific sections */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Course Management Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="font-medium">Total Courses Managed</span>
                <span className="font-medium">{managedCoursesCount}</span>
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
                <span className="font-medium">{pendingFormsCount}</span>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <span className="font-medium">Certification Verifications</span>
                <span className="font-medium">{pendingCertificationsCount}</span>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <span className="font-medium">Course Change Requests</span>
                <span className="font-medium">1</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Announcements */}
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

// Principal Dashboard (will also serve Admin for now)
function PrincipalDashboard({ user }: { user: any }) {
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const response = await analyticsService.getOverallStats()
        setAnalyticsData(response)
      } catch (error) {
        console.error("Failed to fetch analytics data:", error)
        toast({
          title: "Error",
          description: "Failed to load dashboard data.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchAnalyticsData()
  }, [toast])

  const stats = [
    {
      id: 1,
      title: "Total Students",
      value: analyticsData?.totalStudents?.toString() || "1248",
      description: "Enrolled",
      icon: Users,
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      iconColor: "text-blue-500 dark:text-blue-400",
      href: "/dashboard/students",
    },
    {
      id: 2,
      title: "Total Faculty",
      value: analyticsData?.totalFaculty?.toString() || "86",
      description: "Active",
      icon: GraduationCap,
      bgColor: "bg-green-50 dark:bg-green-900/20",
      iconColor: "text-green-500 dark:text-green-400",
      href: "/dashboard/faculty",
    },
    {
      id: 3,
      title: "Attendance Rate",
      value: analyticsData?.averageAttendance ? `${analyticsData.averageAttendance.toFixed(1)}%` : "92%",
      description: "Overall",
      icon: Calendar,
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      iconColor: "text-purple-500 dark:text-purple-400",
      href: "/dashboard/reports",
    },
    {
      id: 4,
      title: "Average Performance",
      value: analyticsData?.averagePerformance ? `${analyticsData.averagePerformance.toFixed(1)}%` : "84%",
      description: "Overall academics",
      icon: GraduationCap,
      bgColor: "bg-amber-50 dark:bg-amber-900/20",
      iconColor: "text-amber-500 dark:text-amber-400",
      href: "/dashboard/reports",
    },
  ]

  // Recent announcements
  const announcements = [
    {
      id: 1,
      title: "New Semester Registration Open",
      description:
        "Registration for the Fall 2025 semester is now open. Please ensure all faculty members have updated their course information.",
      date: "2025-03-01",
      icon: Bell,
    },
    {
      id: 2,
      title: "System Maintenance Scheduled",
      description:
        "The academic portal will be undergoing maintenance on Saturday from 10 PM to 2 AM. Please inform all users about potential downtime.",
      date: "2025-02-28",
      icon: Bell,
      important: true,
    },
  ]

  // Quick links for principal
  const quickLinks = [
    { id: 1, title: "Manage Students", href: "/dashboard/students" },
    { id: 2, title: "Manage Faculty", href: "/dashboard/faculty" },
    { id: 3, title: "Manage Departments", href: "/dashboard/manage-departments" },
    { id: 4, title: "View Reports", href: "/dashboard/reports" },
    { id: 5, title: "System Settings", href: "/dashboard/system-settings" },
    { id: 6, title: "Academic Calendar", href: "/dashboard/calendar-events" },
    { id: 7, title: "Notifications", href: "/dashboard/notifications" },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Loading...</h1>
            <p className="text-muted-foreground">Fetching dashboard data...</p>
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
          <h1 className="text-2xl font-bold">Welcome back, {user?.firstName || user?.name || "Principal"}</h1>
          <p className="text-muted-foreground">Here's an overview of your academic institution.</p>
        </div>
        <CreateAnnouncementDialog />
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

      {/* Analytics Overview */}
      <PrincipalDashboardCharts />

      {/* Student and Faculty Sections - Reorganized by Branch and Semester */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Student Performance by Branch & Semester</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="cse">
              <TabsList className="grid grid-cols-5 mb-4">
                <TabsTrigger value="cse">CSE</TabsTrigger>
                <TabsTrigger value="cse-aiml">CSE AIML</TabsTrigger>
                <TabsTrigger value="cse-ds">CSE DS</TabsTrigger>
                <TabsTrigger value="isc">ISE</TabsTrigger>
                <TabsTrigger value="ece">ECE</TabsTrigger>
              </TabsList>
              <TabsContent value="cse" className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="font-medium">Semester 1</span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">42 students</span>
                      <span className="font-medium">86.5%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="font-medium">Semester 3</span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">38 students</span>
                      <span className="font-medium">82.3%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="font-medium">Semester 5</span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">45 students</span>
                      <span className="font-medium">79.8%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="font-medium">Semester 7</span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">40 students</span>
                      <span className="font-medium">84.2%</span>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="cse-aiml" className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="font-medium">Semester 1</span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">35 students</span>
                      <span className="font-medium">88.7%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="font-medium">Semester 3</span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">32 students</span>
                      <span className="font-medium">85.1%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="font-medium">Semester 5</span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">30 students</span>
                      <span className="font-medium">83.9%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="font-medium">Semester 7</span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">28 students</span>
                      <span className="font-medium">87.5%</span>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="cse-ds" className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="font-medium">Semester 1</span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">30 students</span>
                      <span className="font-medium">84.2%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="font-medium">Semester 3</span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">28 students</span>
                      <span className="font-medium">81.7%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="font-medium">Semester 5</span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">25 students</span>
                      <span className="font-medium">79.5%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="font-medium">Semester 7</span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">22 students</span>
                      <span className="font-medium">82.8%</span>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="isc" className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="font-medium">Total Courses</span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">9 courses</span>
                      <span className="font-medium">92.7%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="font-medium">Average Attendance</span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">All Faculty</span>
                      <span className="font-medium">95.8%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="font-medium">Student Feedback</span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">Overall</span>
                      <span className="font-medium">4.8/5</span>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="ece" className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="font-medium">Total Courses</span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">7 courses</span>
                      <span className="font-medium">89.1%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="font-medium">Average Attendance</span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">All Faculty</span>
                      <span className="font-medium">91.2%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="font-medium">Student Feedback</span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">Overall</span>
                      <span className="font-medium">4.4/5</span>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Faculty Performance by Department</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="cse">
              <TabsList className="grid grid-cols-5 mb-4">
                <TabsTrigger value="cse">CSE</TabsTrigger>
                <TabsTrigger value="cse-aiml">CSE AIML</TabsTrigger>
                <TabsTrigger value="cse-ds">CSE DS</TabsTrigger>
                <TabsTrigger value="isc">ISE</TabsTrigger>
                <TabsTrigger value="ece">ECE</TabsTrigger>
              </TabsList>
              <TabsContent value="cse" className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="font-medium">Total Courses</span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">12 courses</span>
                      <span className="font-medium">88.5%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="font-medium">Average Attendance</span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">All Faculty</span>
                      <span className="font-medium">92.3%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="font-medium">Student Feedback</span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">Overall</span>
                      <span className="font-medium">4.5/5</span>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="cse-aiml" className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="font-medium">Total Courses</span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">10 courses</span>
                      <span className="font-medium">90.2%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="font-medium">Average Attendance</span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">All Faculty</span>
                      <span className="font-medium">94.1%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="font-medium">Student Feedback</span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">Overall</span>
                      <span className="font-medium">4.7/5</span>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="cse-ds" className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="font-medium">Total Courses</span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">8 courses</span>
                      <span className="font-medium">85.9%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="font-medium">Average Attendance</span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">All Faculty</span>
                      <span className="font-medium">90.5%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="font-medium">Student Feedback</span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">Overall</span>
                      <span className="font-medium">4.3/5</span>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="isc" className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="font-medium">Total Courses</span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">9 courses</span>
                      <span className="font-medium">92.7%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="font-medium">Average Attendance</span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">All Faculty</span>
                      <span className="font-medium">95.8%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="font-medium">Student Feedback</span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">Overall</span>
                      <span className="font-medium">4.8/5</span>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="ece" className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="font-medium">Total Courses</span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">7 courses</span>
                      <span className="font-medium">89.1%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="font-medium">Average Attendance</span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">All Faculty</span>
                      <span className="font-medium">91.2%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="font-medium">Student Feedback</span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">Overall</span>
                      <span className="font-medium">4.4/5</span>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Recent Announcements */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent Announcements</h2>
          <Button variant="outline" size="sm">
            View All
          </Button>
        </div>

        <div className="space-y-4">
          {announcements.map((announcement) => (
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
          ))}
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

// Faculty Dashboard - FIXED: Updated to properly apply weekly modifications
function FacultyDashboard({ user }: { user: any }) {
  const router = useRouter()
  const [classes, setClasses] = useState<any[]>([])
  const [todayClasses, setTodayClasses] = useState<any[]>([])
  const [tomorrowClasses, setTomorrowClasses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [pendingLetters, setPendingLetters] = useState(3)
  const [dashboardData, setDashboardData] = useState<any>(null)
  const { toast } = useToast()

  // Define time slots based on the classes page
  const timeSlots = [
    { id: "slot1", start: "8:30", end: "9:30" },
    { id: "slot2", start: "9:30", end: "10:30" },
    { id: "slot3", start: "10:30", end: "10:50", isBreak: true, breakType: "coffee" },
    { id: "slot4", start: "10:50", end: "11:50" },
    { id: "slot5", start: "11:50", end: "12:50" },
    { id: "slot6", start: "12:50", end: "1:30", isBreak: true, breakType: "lunch" },
    { id: "slot7", start: "1:30", end: "2:25" },
    { id: "slot8", start: "2:25", end: "3:20" },
    { id: "slot9", start: "3:20", end: "4:10" },
  ]

  // Stats data for faculty
  const [stats, setStats] = useState([
    {
      id: 1,
      title: "Your Courses",
      value: "6",
      description: "Current semester",
      icon: BookOpen,
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      iconColor: "text-blue-500 dark:text-blue-400",
      href: "/dashboard/classes",
    },
    {
      id: 2,
      title: "Pending Common Letters",
      value: "3",
      description: "Awaiting approval",
      icon: FileText,
      bgColor: "bg-red-50 dark:bg-red-900/20",
      iconColor: "text-red-500 dark:text-red-400",
      href: "/dashboard/proctoring",
    },
    {
      id: 3,
      title: "Classes This Week",
      value: "12",
      description: "Across all your courses",
      icon: Calendar,
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      iconColor: "text-purple-500 dark:text-purple-400",
      href: "/dashboard/classes",
    },
    {
      id: 4,
      title: "Pending Assessments",
      value: "4",
      description: "To be graded",
      icon: FileText,
      bgColor: "bg-amber-50 dark:bg-amber-900/20",
      iconColor: "text-amber-500 dark:text-amber-400",
      href: "/dashboard/upload-marks",
    },
  ])

  // Helper function to convert Tailwind color classes to hex colors
  const convertTailwindColorToHex = useCallback((tailwindColor: string): string => {
    const colorMap: Record<string, string> = {
      "bg-blue-500": "#3b82f6",
      "bg-green-500": "#10b981",
      "bg-red-500": "#ef4444",
      "bg-yellow-500": "#eab308",
      "bg-purple-500": "#a855f7",
      "bg-pink-500": "#ec4899",
      "bg-indigo-500": "#6366f1",
      "bg-orange-500": "#f97316",
      "bg-cyan-500": "#06b6d4",
      "bg-teal-500": "#14b8a6",
      "bg-lime-500": "#84cc16",
      "bg-emerald-500": "#10b981",
      "bg-violet-500": "#8b5cf6",
      "bg-fuchsia-500": "#d946ef",
      "bg-rose-500": "#f43f5e",
      "bg-sky-500": "#0ea5e9",
    }

    return colorMap[tailwindColor] || "#4f46e5" // Default to indigo if not found
  }, [])

  // Helper function to apply weekly modifications (same as classes page)
  const applyWeeklyModifications = useCallback((baseClasses: any[], weekStartDate: Date) => {
    // Day name mapping from abbreviated to full names
    const dayNameMap: Record<string, string> = {
      Mon: "Monday",
      Tue: "Tuesday",
      Wed: "Wednesday",
      Thu: "Thursday",
      Fri: "Friday",
      Sat: "Saturday",
      Sun: "Sunday",
    }

    // Get weekly modifications from Supabase
    const weekKey = format(weekStartDate, "yyyy-MM-dd")

    // This will be populated by the useEffect that loads modifications
    const weeklyModifications = JSON.parse(localStorage.getItem("weeklyTimetableModifications") || "{}")
    const weekModifications = weeklyModifications[weekKey] || []

    // Apply weekly modifications efficiently
    if (weekModifications.length === 0) {
      return baseClasses
    }

    // Create a map for faster lookups
    const modificationMap = new Map(weekModifications.map((mod: any) => [mod.id, mod]))

    // Filter out moved classes and add modifications
    const modifiedClasses = baseClasses.filter((cls: any) => !modificationMap.has(cls.id)).concat(weekModifications)

    return modifiedClasses
  }, [])

  useEffect(() => {
    const fetchFacultyData = async () => {
      try {
        setLoading(true)
        if (user?.id) {
          const data = await facultyService.getDashboardData(user.id)
          setDashboardData(data)
        }
      } catch (error) {
        console.error("Failed to fetch faculty dashboard data:", error)
        toast({
          title: "Error",
          description: "Failed to load faculty dashboard data.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchFacultyData()
  }, [user?.id, toast])

  // Fetch pending common letters count
  useEffect(() => {
    const fetchPendingLetters = () => {
      try {
        const storedLetters = localStorage.getItem("pending-common-letters")
        const count = storedLetters ? JSON.parse(storedLetters).length : 3
        setStats((prevStats) => prevStats.map((stat) => (stat.id === 2 ? { ...stat, value: count.toString() } : stat)))
        setPendingLetters(count)
      } catch (error) {
        console.error("Failed to fetch pending letters:", error)
      }
    }

    fetchPendingLetters()
  }, [])

  // FIXED: Fetch faculty schedule with weekly modifications applied
  useEffect(() => {
    const fetchFacultySchedule = async () => {
      if (!user?.id) return

      try {
        setLoading(true)

        // Get faculty's weekly schedule using the same logic as classes page
        const { data: scheduleData, error: scheduleError } = await facultyService.getFacultyWeeklySchedule(user.id)

        if (scheduleError) {
          console.error("Error loading faculty schedule:", scheduleError)
          setTodayClasses([])
          setTomorrowClasses([])
          return
        }

        if (!scheduleData || scheduleData.length === 0) {
          setTodayClasses([])
          setTomorrowClasses([])
          return
        }

        // Convert faculty timetable data to class format (same as classes page)
        const convertedClasses = scheduleData.map((item: any, index: number) => {
          const dayNameMap: Record<string, string> = {
            Mon: "Monday",
            Tue: "Tuesday",
            Wed: "Wednesday",
            Thu: "Thursday",
            Fri: "Friday",
            Sat: "Saturday",
            Sun: "Sunday",
          }

          const fullDayName = dayNameMap[item.day_name] || item.day_name
          const hexColor = convertTailwindColorToHex(item.color)

          return {
            id: `faculty-class-${index}`,
            name: item.subject_name,
            code: item.subject_code,
            semester: item.semester,
            section: item.section,
            room: item.room_number,
            students: item.student_count,
            day: fullDayName,
            timeSlotId: item.time_slot_id,
            color: hexColor,
            faculty: user?.name || "You",
            componentType: item.component_type,
            batch: item.batch || undefined,
            academicYear: item.academic_year,
            subjectId: item.subject_id,
          }
        })

        // FIXED: Load and apply weekly modifications for current week
        const currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
        const weekKey = format(currentWeekStart, "yyyy-MM-dd")

        // Load weekly modifications from Supabase
        const { data: modifications, error: modError } =
          await weeklyTimetableModificationsService.getWeeklyModifications(user.id, weekKey)

        let modifiedClasses = convertedClasses
        if (!modError && modifications && modifications.length > 0) {
          // Apply modifications
          const modificationMap = new Map(modifications.map((mod: any) => [mod.id, mod]))
          modifiedClasses = convertedClasses.filter((cls: any) => !modificationMap.has(cls.id)).concat(modifications)

          // Store in localStorage for consistency with classes page
          const weeklyModifications = JSON.parse(localStorage.getItem("weeklyTimetableModifications") || "{}")
          weeklyModifications[weekKey] = modifications
          localStorage.setItem("weeklyTimetableModifications", JSON.stringify(weeklyModifications))
        }

        // Filter for today's classes
        const today = new Date()
        const todayName = format(today, "EEEE")
        const todayClassList = modifiedClasses.filter((cls: any) => cls.day === todayName)
        todayClassList.sort((a: any, b: any) => {
          const aSlotNum = Number.parseInt(a.timeSlotId.replace("slot", ""))
          const bSlotNum = Number.parseInt(b.timeSlotId.replace("slot", ""))
          return aSlotNum - bSlotNum
        })
        setTodayClasses(todayClassList)

        // Filter for tomorrow's classes
        const tomorrow = addDays(today, 1)
        const tomorrowName = format(tomorrow, "EEEE")
        const tomorrowClassList = modifiedClasses.filter((cls: any) => cls.day === tomorrowName)
        tomorrowClassList.sort((a: any, b: any) => {
          const aSlotNum = Number.parseInt(a.timeSlotId.replace("slot", ""))
          const bSlotNum = Number.parseInt(b.timeSlotId.replace("slot", ""))
          return aSlotNum - bSlotNum
        })
        setTomorrowClasses(tomorrowClassList)
      } catch (error) {
        console.error("Error fetching faculty schedule:", error)
        setTodayClasses([])
        setTomorrowClasses([])
      } finally {
        setLoading(false)
      }
    }

    fetchFacultySchedule()

    // Listen for storage changes to update when timetable is modified
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "weeklyTimetableModifications") {
        fetchFacultySchedule()
      }
    }

    window.addEventListener("storage", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [user?.id, convertTailwindColorToHex])

  // FIXED: Simple navigation functions that don't cause infinite loops
  const handleAttendanceClick = useCallback(
    (classItem: any) => {
      const today = new Date()
      const dateString = format(today, "yyyy-MM-dd")

      // Simple navigation without complex logic that could cause loops
      router.push(`/dashboard/classes?classId=${classItem.id}&view=attendance&date=${dateString}`)
    },
    [router],
  )

  const handleViewDetailsClick = useCallback(
    (classItem: any) => {
      // Simple navigation without complex logic that could cause loops
      router.push(`/dashboard/classes?classId=${classItem.id}`)
    },
    [router],
  )

  // Recent announcements
  const announcements = [
    {
      id: 1,
      title: "Faculty Meeting Scheduled",
      description:
        "There will be a faculty meeting on Friday at 2 PM in the Conference Hall to discuss the upcoming semester planning.",
      date: "2025-03-01",
      icon: Bell,
    },
    {
      id: 2,
      title: "Exam Schedule Released",
      description:
        "The final examination schedule has been released. Please review and confirm your assigned invigilation duties.",
      date: "2025-02-28",
      icon: Bell,
      important: true,
    },
  ]

  // Quick links for faculty
  const quickLinks = [
    { id: 1, title: "View My Profile", href: "/dashboard/settings" },
    { id: 2, title: "Manage Classes", href: "/dashboard/classes" },
    { id: 3, title: "Grade Assignments", href: "/dashboard/student-marks" },
    { id: 4, title: "Upload Study Materials", href: "/dashboard/upload-materials" },
    { id: 5, title: "View Student Feedback", href: "/dashboard/student-feedback" },
    { id: 6, title: "CO-PO Mapping", href: "/dashboard/co-po-mapping" },
    { id: 7, title: "My Proctees", href: "/dashboard/proctoring" },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Loading...</h1>
            <p className="text-muted-foreground">Fetching your dashboard data...</p>
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
          <h1 className="text-2xl font-bold">Welcome back, {user?.firstName || user?.name || "Faculty"}</h1>
          <p className="text-muted-foreground">Here's what's happening in your academic portal today.</p>
        </div>
        <CreateAnnouncementDialog />
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

      {/* Upcoming Classes */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Upcoming Classes</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="bg-white dark:bg-background">
            <CardHeader>
              <CardTitle className="text-lg">Today's Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              {todayClasses.length > 0 ? (
                <div className="space-y-3">
                  {todayClasses.map((cls, index) => {
                    const timeSlot = timeSlots.find((slot) => slot.id === cls.timeSlotId)
                    return (
                      <div key={index} className="border-l-4 pl-4 py-2" style={{ borderColor: cls.color }}>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-base">
                              {cls.code} - {cls.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {timeSlot?.start} - {timeSlot?.end} • {cls.room}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Sem {cls.semester} - Sec {cls.section}
                              {cls.batch && ` - ${cls.batch}`}
                            </div>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => handleAttendanceClick(cls)}>
                            Attendance
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="flex justify-center py-8 text-muted-foreground">No classes scheduled for today.</div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-background">
            <CardHeader>
              <CardTitle className="text-lg">Tomorrow's Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              {tomorrowClasses.length > 0 ? (
                <div className="space-y-3">
                  {tomorrowClasses.map((cls, index) => {
                    const timeSlot = timeSlots.find((slot) => slot.id === cls.timeSlotId)
                    return (
                      <div key={index} className="border-l-4 pl-4 py-2" style={{ borderColor: cls.color }}>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-base">
                              {cls.code} - {cls.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {timeSlot?.start} - {timeSlot?.end} • {cls.room}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Sem {cls.semester} - Sec {cls.section}
                              {cls.batch && ` - ${cls.batch}`}
                            </div>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => handleViewDetailsClick(cls)}>
                            View Details
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="flex justify-center py-8 text-muted-foreground">No classes scheduled for tomorrow.</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Announcements */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent Announcements</h2>
          <ViewAllAnnouncementsDialog announcements={announcements} />
        </div>
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <Card key={announcement.id} className="bg-white dark:bg-background">
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
                    <div className="mt-2">
                      <span className="text-xs text-muted-foreground">
                        Posted on {new Date(announcement.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
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

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeRole, setActiveRole] = useState<string>("")
  const router = useRouter()

  useEffect(() => {
    const checkAuth = () => {
      try {
        const userData = localStorage.getItem("user")
        if (!userData) {
          router.push("/")
          return
        }

        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)

        // Get active role from localStorage or use user's primary role
        const storedRole = localStorage.getItem("activeRole")
        setActiveRole(storedRole || parsedUser.role)
      } catch (error) {
        console.error("Failed to parse user data:", error)
        router.push("/")
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  // Listen for role changes
  useEffect(() => {
    const handleRoleChange = (event: CustomEvent) => {
      setActiveRole(event.detail.newRole)
    }

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "activeRole" && event.newValue) {
        setActiveRole(event.newValue)
      }
    }

    window.addEventListener("roleChange", handleRoleChange as EventListener)
    window.addEventListener("storage", handleStorageChange)

    return () => {
      window.removeEventListener("roleChange", handleRoleChange as EventListener)
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  // Render appropriate dashboard based on active role
  switch (activeRole) {
    case "student":
      return <StudentDashboard user={user} />
    case "hod":
      return <HODDashboard user={user} />
    case "coordinator":
      return <CoordinatorDashboard user={user} />
    case "faculty":
      return <FacultyDashboard user={user} />
    case "admin":
      return <PrincipalDashboard user={user} />
    case "principal":
      return <PrincipalDashboard user={user} />
    default:
      return <PrincipalDashboard user={user} />
  }
}
