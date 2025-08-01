"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { Search, ChevronDown, ArrowUpDown } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

interface Student {
  id: string
  name: string
  email: string
  department: string
  semester: string
  attendance: number
  marks: {
    assignment: number
    midterm: number
    final: number | null
  }
  grade: string | null
}

export default function CourseStudents() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [students, setStudents] = useState<Student[]>([])
  const [courseId, setCourseId] = useState<string>("")
  const [courseName, setCourseName] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Student | "totalMarks"
    direction: "asc" | "desc"
  }>({ key: "name", direction: "asc" })

  useEffect(() => {
    // Get course ID from URL query parameter
    const urlParams = new URLSearchParams(window.location.search)
    const id = urlParams.get("id")
    const name = urlParams.get("name") || "Course"

    if (id) {
      setCourseId(id)
      setCourseName(name)
      fetchCourseStudents(id)
    } else {
      // Fallback to demo data if no ID provided
      setCourseName("Introduction to Computer Science")
      loadDemoStudents()
    }
  }, [])

  const fetchCourseStudents = async (id: string) => {
    try {
      // In a real app, this would be an API call
      // const response = await fetch(`/api/courses/${id}/students`);
      // const data = await response.json();
      // setStudents(data);

      // For demo purposes, we'll use dummy data
      loadDemoStudents()
    } catch (error) {
      console.error("Error fetching course students:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadDemoStudents = () => {
    setTimeout(() => {
      setStudents([
        {
          id: "student1",
          name: "John Smith",
          email: "john.smith@example.com",
          department: "Computer Science",
          semester: "4th Semester",
          attendance: 92,
          marks: {
            assignment: 85,
            midterm: 78,
            final: 82,
          },
          grade: "A",
        },
        {
          id: "student2",
          name: "Emily Johnson",
          email: "emily.johnson@example.com",
          department: "Computer Science",
          semester: "4th Semester",
          attendance: 88,
          marks: {
            assignment: 92,
            midterm: 85,
            final: 88,
          },
          grade: "A",
        },
        {
          id: "student3",
          name: "Michael Brown",
          email: "michael.brown@example.com",
          department: "Computer Science",
          semester: "4th Semester",
          attendance: 78,
          marks: {
            assignment: 75,
            midterm: 68,
            final: 72,
          },
          grade: "B",
        },
        {
          id: "student4",
          name: "Sarah Davis",
          email: "sarah.davis@example.com",
          department: "Computer Science",
          semester: "4th Semester",
          attendance: 95,
          marks: {
            assignment: 95,
            midterm: 92,
            final: 94,
          },
          grade: "A+",
        },
        {
          id: "student5",
          name: "David Wilson",
          email: "david.wilson@example.com",
          department: "Computer Science",
          semester: "4th Semester",
          attendance: 65,
          marks: {
            assignment: 60,
            midterm: 55,
            final: 62,
          },
          grade: "C",
        },
        {
          id: "student6",
          name: "Jennifer Lee",
          email: "jennifer.lee@example.com",
          department: "Computer Science",
          semester: "4th Semester",
          attendance: 85,
          marks: {
            assignment: 88,
            midterm: 82,
            final: 85,
          },
          grade: "B+",
        },
        {
          id: "student7",
          name: "Robert Taylor",
          email: "robert.taylor@example.com",
          department: "Computer Science",
          semester: "4th Semester",
          attendance: 72,
          marks: {
            assignment: 70,
            midterm: 65,
            final: 68,
          },
          grade: "C+",
        },
      ])
      setLoading(false)
    }, 800)
  }

  const handleViewProfile = (studentId: string) => {
    router.push(`/dashboard/student-profile?id=${studentId}`)
  }

  const handleSort = (key: keyof Student | "totalMarks") => {
    let direction: "asc" | "desc" = "asc"
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc"
    }
    setSortConfig({ key, direction })
  }

  const calculateTotalMarks = (student: Student) => {
    const { assignment, midterm, final } = student.marks
    if (final === null) return assignment * 0.3 + midterm * 0.3
    return assignment * 0.3 + midterm * 0.3 + (final || 0) * 0.4
  }

  const sortedStudents = [...students]
    .filter(
      (student) =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .sort((a, b) => {
      if (sortConfig.key === "totalMarks") {
        const aValue = calculateTotalMarks(a)
        const bValue = calculateTotalMarks(b)
        return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue
      }

      const aValue = a[sortConfig.key]
      const bValue = b[sortConfig.key]

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortConfig.direction === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue
      }

      return 0
    })

  const getAttendanceColor = (attendance: number) => {
    if (attendance >= 90) return "bg-green-100 text-green-800"
    if (attendance >= 75) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }

  const getGradeColor = (grade: string | null) => {
    if (!grade) return "bg-gray-100 text-gray-800"
    if (grade.startsWith("A")) return "bg-green-100 text-green-800"
    if (grade.startsWith("B")) return "bg-blue-100 text-blue-800"
    if (grade.startsWith("C")) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">{courseName} - Students</h1>
        <Button onClick={() => router.back()} variant="outline">
          Back
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Enrolled Students</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search students..."
                  className="pl-8 w-[250px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <ChevronDown className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Export as CSV</DropdownMenuItem>
                  <DropdownMenuItem>Export as PDF</DropdownMenuItem>
                  <DropdownMenuItem>Print List</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px] cursor-pointer" onClick={() => handleSort("name")}>
                      Name
                      <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("email")}>
                      Email
                      <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("semester")}>
                      Semester
                      <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                    </TableHead>
                    <TableHead className="cursor-pointer text-center" onClick={() => handleSort("attendance")}>
                      Attendance
                      <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                    </TableHead>
                    <TableHead className="text-center">Marks</TableHead>
                    <TableHead className="cursor-pointer text-center" onClick={() => handleSort("totalMarks")}>
                      Total
                      <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                    </TableHead>
                    <TableHead className="cursor-pointer text-center" onClick={() => handleSort("grade")}>
                      Grade
                      <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedStudents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No students found matching your search criteria.
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>{student.semester}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className={getAttendanceColor(student.attendance)}>
                            {student.attendance}%
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col gap-1 items-center">
                            <span className="text-xs text-muted-foreground">A: {student.marks.assignment}</span>
                            <span className="text-xs text-muted-foreground">M: {student.marks.midterm}</span>
                            <span className="text-xs text-muted-foreground">
                              F: {student.marks.final !== null ? student.marks.final : "N/A"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center font-medium">
                          {calculateTotalMarks(student).toFixed(1)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className={getGradeColor(student.grade)}>
                            {student.grade || "N/A"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" onClick={() => handleViewProfile(student.id)}>
                            View Profile
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
