"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation" // Use useSearchParams
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Users, User, Edit, GraduationCap, Award, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { departmentService, facultyService, studentService } from "@/lib/supabase-service"
import type { Department, FacultyProfile, StudentProfile } from "@/lib/database-schema"

interface DepartmentStats {
  totalFaculty: number
  totalStudents: number
  totalCourses: number
  averageAttendance: number
  averagePerformance: number
  activeStudents: number
  hodInfo: {
    name: string
    email: string
    designation: string
  } | null
}

export default function DepartmentDetailsPage() {
  const searchParams = useSearchParams()
  const departmentId = searchParams.get("departmentId") // Correctly get departmentId from search params
  const [department, setDepartment] = useState<Department | null>(null)
  const [stats, setStats] = useState<DepartmentStats | null>(null)
  const [faculty, setFaculty] = useState<FacultyProfile[]>([])
  const [students, setStudents] = useState<StudentProfile[]>([])
  const [activeTab, setActiveTab] = useState("overview")
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }

    if (departmentId) {
      fetchDepartmentData()
    }
  }, [departmentId])

  const fetchDepartmentData = async () => {
    if (!departmentId) {
      setLoading(false) // Ensure loading is false if no ID
      return
    }

    setLoading(true)
    try {
      // Fetch department details with HOD info joined
      const { data: deptData, error: deptError } = await departmentService.getById(departmentId)
      if (deptError) throw deptError
      if (!deptData) {
        console.error("Department not found for ID:", departmentId)
        setDepartment(null)
        setStats(null)
        setLoading(false)
        toast({
          title: "Error",
          description: "Department not found or failed to load details.",
          variant: "destructive",
        })
        return
      }
      setDepartment(deptData)

      // Fetch all faculty and students to filter by department
      const { data: allFacultyResponse, error: allFacultyError } = await facultyService.getAll()
      const { data: allStudentsResponse, error: allStudentsError } = await studentService.getAll()

      if (allFacultyError) {
        console.error("Error fetching all faculty:", allFacultyError)
        toast({
          title: "Error",
          description: "Failed to load all faculty for department details.",
          variant: "destructive",
        })
      }
      if (allStudentsError) {
        console.error("Error fetching all students:", allStudentsError)
        toast({
          title: "Error",
          description: "Failed to load all students for department details.",
          variant: "destructive",
        })
      }

      const allFaculty = allFacultyResponse || []
      const allStudents = allStudentsResponse || []

      // Filter by department short name
      const deptFaculty = allFaculty.filter((f) => f.department === deptData.short_name)
      const deptStudents = allStudents.filter((s) => s.department === deptData.short_name)

      setFaculty(deptFaculty)
      setStudents(deptStudents)

      // Find HOD info from the joined data
      let hodInfo = null
      if (deptData.hod?.user) {
        hodInfo = {
          name: `${deptData.hod.user.first_name || ""} ${deptData.hod.user.last_name || ""}`.trim(),
          email: deptData.hod.user.email || "",
          designation: deptData.hod.designation || "Head of Department",
        }
      }

      // Calculate stats
      const activeStudents = deptStudents.filter((s) => s.status === "Active").length
      const averageAttendance = 85.5 // This would come from attendance data
      const averagePerformance = 78.2 // This would come from marks data

      setStats({
        totalFaculty: deptFaculty.length,
        totalStudents: deptStudents.length,
        totalCourses: 0, // This would come from courses data
        averageAttendance,
        averagePerformance,
        activeStudents,
        hodInfo,
      })
    } catch (error) {
      console.error("Error fetching department data:", error)
      toast({
        title: "Error",
        description: "Failed to load department data.",
        variant: "destructive",
      })
      setDepartment(null) // Clear department data on error
      setStats(null) // Clear stats on error
    } finally {
      setLoading(false)
    }
  }

  const handleEditDepartment = () => {
    // Navigate back to manage departments page
    router.push("/dashboard/manage-departments")
  }

  const viewFaculty = () => {
    router.push(`/dashboard/department-faculty?departmentId=${departmentId}`)
  }

  const viewHOD = () => {
    if (department?.hod_id) {
      router.push(`/dashboard/hod-profile?id=${department.hod_id}`)
    }
  }

  const viewStudents = () => {
    router.push(`/dashboard/students?departmentId=${departmentId}`)
  }

  if (!user || (user.role !== "admin" && user.role !== "hod")) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>You don't have permission to access this page.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading department details...</p>
        </div>
      </div>
    )
  }

  if (!department || !stats) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Department data not available or failed to load.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{department.name}</h1>
            <p className="text-muted-foreground">Department Code: {department.short_name}</p>
          </div>
        </div>
        <Button onClick={handleEditDepartment}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Department
        </Button>
      </div>

      {/* Summary Cards - Updated to match the reference design */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4 md:gap-4">
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faculty</CardTitle>
            <Users className="h-4 w-4 text-blue-500 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{stats.totalFaculty}</div>
            <p className="text-xs text-muted-foreground">Total faculty members</p>
          </CardContent>
        </Card>

        <Card className="bg-green-50 dark:bg-green-900/20 border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students</CardTitle>
            <GraduationCap className="h-4 w-4 text-green-500 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">{stats.activeStudents} active students</p>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 dark:bg-orange-900/20 border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500 dark:text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{stats.averageAttendance}%</div>
            <p className="text-xs text-muted-foreground">Average attendance rate</p>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 dark:bg-purple-900/20 border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <Award className="h-4 w-4 text-purple-500 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{stats.averagePerformance}%</div>
            <p className="text-xs text-muted-foreground">Average performance</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="faculty">Faculty & Staff</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Department Information</CardTitle>
              <CardDescription>Basic details about the department</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Established</h3>
                  <p>{department.established_on ? new Date(department.established_on).getFullYear() : "N/A"}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Location</h3>
                  <p>{department.location || "N/A"}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Email</h3>
                  <p>{department.email || "N/A"}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Phone</h3>
                  <p>{department.phone || "N/A"}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Website</h3>
                  <p>{department.website || "N/A"}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Head of Department</h3>
                  <p className="flex items-center">
                    {stats.hodInfo ? stats.hodInfo.name : "Not assigned"}
                    {stats.hodInfo && (
                      <Button variant="link" className="p-0 h-auto ml-2" onClick={viewHOD}>
                        View Profile
                      </Button>
                    )}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Description</h3>
                <p className="mt-1">{department.description || "No description available."}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faculty" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Faculty Management</CardTitle>
              <CardDescription>Faculty members in this department</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <Button onClick={viewFaculty} className="flex-1">
                  <Users className="mr-2 h-4 w-4" />
                  View All Faculty ({stats.totalFaculty})
                </Button>
                {stats.hodInfo && (
                  <Button onClick={viewHOD} className="flex-1">
                    <User className="mr-2 h-4 w-4" />
                    View HOD Profile
                  </Button>
                )}
              </div>

              {stats.hodInfo && (
                <div className="bg-muted p-4 rounded-md">
                  <h3 className="font-medium mb-2">Head of Department</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{stats.hodInfo.name}</p>
                      <p className="text-sm text-muted-foreground">{stats.hodInfo.email}</p>
                      <p className="text-sm text-muted-foreground">{stats.hodInfo.designation}</p>
                    </div>
                    <Button variant="outline" onClick={viewHOD}>
                      View Profile
                    </Button>
                  </div>
                </div>
              )}

              {faculty.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-medium">Recent Faculty</h3>
                  <div className="grid gap-2">
                    {faculty.slice(0, 5).map((fac) => (
                      <div key={fac.user_id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                        <div>
                          <p className="font-medium">{fac.name}</p>
                          <p className="text-sm text-muted-foreground">{fac.designation}</p>
                        </div>
                        <Badge variant={fac.user_id === department.hod_id ? "default" : "outline"}>
                          {fac.user_id === department.hod_id ? "HOD" : fac.designation}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Student Management</CardTitle>
              <CardDescription>Students enrolled in this department</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <Button onClick={viewStudents} className="flex-1">
                  <GraduationCap className="mr-2 h-4 w-4" />
                  View All Students ({stats.totalStudents})
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-muted p-4 rounded-md">
                  <h3 className="font-medium mb-2">Student Status</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span>Active Students</span>
                      <Badge variant="outline">{stats.activeStudents}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Total Enrolled</span>
                      <Badge variant="outline">{stats.totalStudents}</Badge>
                    </div>
                  </div>
                </div>
                <div className="bg-muted p-4 rounded-md">
                  <h3 className="font-medium mb-2">Performance Metrics</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span>Avg. Attendance</span>
                      <Badge variant="outline">{stats.averageAttendance}%</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Avg. Performance</span>
                      <Badge variant="outline">{stats.averagePerformance}%</Badge>
                    </div>
                  </div>
                </div>
              </div>

              {students.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-medium">Recent Students</h3>
                  <div className="grid gap-2">
                    {students.slice(0, 5).map((student) => (
                      <div key={student.user_id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-muted-foreground">USN: {student.usn}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">Sem {student.semester}</Badge>
                          <p className="text-sm text-muted-foreground">{student.section}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
