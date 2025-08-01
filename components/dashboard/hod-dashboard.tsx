"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Users, GraduationCap, Calendar, BarChart, FileText } from "lucide-react"
import { getAuthUser } from "@/lib/auth" // Assuming this function exists and returns user data including departmentId

// This function fetches data from your API route: /api/departments/[id]/faculty
// It is assumed that app/api/departments/[id]/faculty/route.ts correctly filters by department ID.
async function fetchDepartmentFaculty(departmentId: string) {
  const response = await fetch(`/api/departments/${departmentId}/faculty`)
  if (!response.ok) {
    throw new Error("Failed to fetch department faculty")
  }
  return response.json()
}

export default function HODDashboard() {
  const [departmentFaculty, setDepartmentFaculty] = useState<any[]>([])
  const [loadingFaculty, setLoadingFaculty] = useState(true)
  const [errorFaculty, setErrorFaculty] = useState<string | null>(null)

  // State for other dashboard cards (mocked for brevity, as they are not part of the current fix)
  const [departmentStudents, setDepartmentStudents] = useState(0)
  const [activeFaculty, setActiveFaculty] = useState(0)
  const [attendanceRate, setAttendanceRate] = useState("0%")
  const [averagePerformance, setAveragePerformance] = useState("0%")
  const [studentDistribution, setStudentDistribution] = useState<any[]>([])

  useEffect(() => {
    async function loadHODData() {
      try {
        setLoadingFaculty(true)
        // Fetch current user's department ID
        const user = await getAuthUser() // Assuming getAuthUser returns { departmentId: string, ... }
        if (user && user.departmentId) {
          // Fetch department-specific faculty data
          const faculty = await fetchDepartmentFaculty(user.departmentId)
          setDepartmentFaculty(faculty)

          // Mock other dashboard data based on the image and common dashboard elements
          // In a real application, these would also be fetched from relevant APIs
          setDepartmentStudents(0) // From image
          setActiveFaculty(faculty.length) // Based on fetched faculty
          setAttendanceRate("89%") // From image
          setAveragePerformance("82%") // From image
          setStudentDistribution([
            { semester: "Semester 1", students: 42, performance: "86.5%", attendance: "92%" },
            { semester: "Semester 3", students: 38, performance: "82.3%", attendance: "88%" },
            { semester: "Semester 5", students: 45, performance: "79.8%", attendance: "85%" },
            { semester: "Semester 7", students: 40, performance: "84.2%", attendance: "90%" },
          ])
        } else {
          setErrorFaculty(
            "Could not retrieve HOD's department information. Please ensure you are logged in as an HOD with a department assigned.",
          )
        }
      } catch (err: any) {
        setErrorFaculty(`Failed to load HOD dashboard data: ${err.message}`)
        console.error(err)
      } finally {
        setLoadingFaculty(false)
      }
    }

    loadHODData()
  }, [])

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, HOD</h1>
          <p className="text-gray-500 dark:text-gray-400">Here's an overview of your department.</p>
        </div>
        <Button variant="outline">
          <FileText className="mr-2 h-4 w-4" />
          Create Announcement
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Department Students</CardTitle>
            <Users className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departmentStudents}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Currently enrolled</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Department Faculty</CardTitle>
            <GraduationCap className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeFaculty}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Active faculty</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendanceRate}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Department average</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Performance</CardTitle>
            <BarChart className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averagePerformance}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Department academics</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Department Faculty Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingFaculty ? (
              <div className="text-center py-4">Loading faculty data...</div>
            ) : errorFaculty ? (
              <div className="text-red-500 text-center py-4">{errorFaculty}</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Designation</TableHead>
                    <TableHead>Specialization</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departmentFaculty.map((faculty) => (
                    <TableRow key={faculty.id}>
                      <TableCell className="font-medium">{faculty.name}</TableCell>
                      <TableCell>{faculty.designation}</TableCell>
                      <TableCell>{faculty.specialization}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            <div className="flex justify-end mt-4">
              <Button variant="outline">View All Faculty</Button>
            </div>
          </CardContent>
        </Card>

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
                {studentDistribution.map((data, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{data.semester}</TableCell>
                    <TableCell>{data.students}</TableCell>
                    <TableCell>{data.performance}</TableCell>
                    <TableCell>{data.attendance}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex justify-end mt-4">
              <Button variant="outline">View All Students</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
