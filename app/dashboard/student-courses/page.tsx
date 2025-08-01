"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Book, Calendar, GraduationCap, User, Clock, CheckCircle } from "lucide-react"
import Link from "next/link"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"

interface Course {
  id: string
  code: string
  name: string
  department: string
  semester: string
  credits: number
  status: "Active" | "Completed" | "Upcoming"
  faculty: string
  facultyId: string
  progress: number
  grade?: string
  startDate?: string
  endDate?: string
  description?: string
  materials?: number
}

export default function StudentCourses() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()
  const studentId = searchParams.get("id")
  const studentName = searchParams.get("name") || "Student"

  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real application, fetch courses for this student
    // For now, we'll use dummy data
    const dummyCourses: Course[] = [
      {
        id: "cs101",
        code: "CS101",
        name: "Introduction to Computer Science",
        department: "Computer Science",
        semester: "Fall 2023",
        credits: 4,
        status: "Active",
        faculty: "Dr. Alan Turing",
        facultyId: "f1",
        progress: 65,
        startDate: "2023-08-15",
        endDate: "2023-12-15",
        description:
          "An introduction to the fundamental concepts of computer science including problem solving, algorithms, and programming basics.",
        materials: 12,
      },
      {
        id: "cs201",
        code: "CS201",
        name: "Data Structures and Algorithms",
        department: "Computer Science",
        semester: "Fall 2023",
        credits: 4,
        status: "Active",
        faculty: "Dr. Ada Lovelace",
        facultyId: "f2",
        progress: 42,
        startDate: "2023-08-15",
        endDate: "2023-12-15",
        description:
          "A comprehensive study of data structures and algorithms, including analysis, implementation, and application.",
        materials: 8,
      },
      {
        id: "math101",
        code: "MATH101",
        name: "Calculus I",
        department: "Mathematics",
        semester: "Spring 2023",
        credits: 3,
        status: "Completed",
        faculty: "Dr. John Nash",
        facultyId: "f3",
        progress: 100,
        grade: "A",
        startDate: "2023-01-10",
        endDate: "2023-05-15",
        description: "Introduction to differential and integral calculus of functions of one variable.",
        materials: 15,
      },
      {
        id: "cs301",
        code: "CS301",
        name: "Database Systems",
        department: "Computer Science",
        semester: "Spring 2024",
        credits: 3,
        status: "Upcoming",
        faculty: "Dr. Grace Hopper",
        facultyId: "f4",
        progress: 0,
        startDate: "2024-01-15",
        endDate: "2024-05-20",
        description: "Fundamentals of database design, development, and management with focus on relational databases.",
        materials: 0,
      },
      {
        id: "cs401",
        code: "CS401",
        name: "Artificial Intelligence",
        department: "Computer Science",
        semester: "Spring 2023",
        credits: 4,
        status: "Completed",
        faculty: "Dr. Geoffrey Hinton",
        facultyId: "f5",
        progress: 100,
        grade: "A-",
        startDate: "2023-01-10",
        endDate: "2023-05-15",
        description:
          "Introduction to artificial intelligence concepts, including search algorithms, knowledge representation, and machine learning.",
        materials: 18,
      },
      {
        id: "eng201",
        code: "ENG201",
        name: "Technical Writing",
        department: "English",
        semester: "Spring 2023",
        credits: 2,
        status: "Completed",
        faculty: "Dr. Emily Dickinson",
        facultyId: "f6",
        progress: 100,
        grade: "B+",
        startDate: "2023-01-10",
        endDate: "2023-05-15",
        description: "Development of technical writing skills for engineering and scientific contexts.",
        materials: 10,
      },
    ]

    setTimeout(() => {
      setCourses(dummyCourses)
      setLoading(false)
    }, 500)
  }, [studentId])

  const handleViewCourseDetails = (courseId: string, courseName: string) => {
    router.push(`/dashboard/course-details?id=${courseId}&name=${encodeURIComponent(courseName)}`)
  }

  const handleEnrollCourse = (courseId: string) => {
    toast({
      title: "Enrollment Successful",
      description: "Student has been enrolled in this course.",
    })
  }

  const handleUnenrollCourse = (courseId: string) => {
    toast({
      title: "Unenrollment Successful",
      description: "Student has been unenrolled from this course.",
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">Active</Badge>
      case "Completed":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">Completed</Badge>
      case "Upcoming":
        return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-800 dark:text-amber-100">Upcoming</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/students">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Courses for {studentName}</h1>
        </div>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="active">Active Courses</TabsTrigger>
          <TabsTrigger value="completed">Completed Courses</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming Courses</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="bg-muted h-24"></CardHeader>
                  <CardContent className="p-4">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses
                .filter((c) => c.status === "Active")
                .map((course) => (
                  <Card
                    key={course.id}
                    className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-green-500"
                    onClick={() => handleViewCourseDetails(course.id, course.name)}
                  >
                    <CardHeader className="pb-2 bg-green-50/50 dark:bg-green-900/20">
                      <div className="flex justify-between items-start">
                        <div>
                          {getStatusBadge(course.status)}
                          <CardTitle className="text-lg mt-2">{course.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {course.code} • {course.department}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{course.semester}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            <Link
                              href={`/dashboard/faculty-profile?id=${course.facultyId}`}
                              className="hover:underline text-blue-600 dark:text-blue-400"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {course.faculty}
                            </Link>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Book className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{course.credits} Credits</span>
                        </div>
                        <div className="mt-2">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progress</span>
                            <span>{course.progress}%</span>
                          </div>
                          <Progress value={course.progress} className="h-2" />
                        </div>
                      </div>
                      <Separator className="my-4" />
                      <div className="flex justify-between">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleUnenrollCourse(course.id)
                          }}
                        >
                          Unenroll
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleViewCourseDetails(course.id, course.name)
                          }}
                        >
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              {courses.filter((c) => c.status === "Active").length === 0 && (
                <div className="col-span-full text-center py-10">
                  <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">No Active Courses</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    This student is not enrolled in any active courses at the moment.
                  </p>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="bg-muted h-24"></CardHeader>
                  <CardContent className="p-4">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses
                .filter((c) => c.status === "Completed")
                .map((course) => (
                  <Card
                    key={course.id}
                    className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-blue-500"
                    onClick={() => handleViewCourseDetails(course.id, course.name)}
                  >
                    <CardHeader className="pb-2 bg-blue-50/50 dark:bg-blue-900/20">
                      <div className="flex justify-between items-start">
                        <div>
                          {getStatusBadge(course.status)}
                          <CardTitle className="text-lg mt-2">{course.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {course.code} • {course.department}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{course.semester}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            <Link
                              href={`/dashboard/faculty-profile?id=${course.facultyId}`}
                              className="hover:underline text-blue-600 dark:text-blue-400"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {course.faculty}
                            </Link>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Book className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{course.credits} Credits</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium">Grade: {course.grade}</span>
                        </div>
                        <div className="mt-2">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Completion</span>
                            <span>{course.progress}%</span>
                          </div>
                          <Progress value={course.progress} className="h-2" />
                        </div>
                      </div>
                      <Separator className="my-4" />
                      <div className="flex justify-end">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleViewCourseDetails(course.id, course.name)
                          }}
                        >
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              {courses.filter((c) => c.status === "Completed").length === 0 && (
                <div className="col-span-full text-center py-10">
                  <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">No Completed Courses</h3>
                  <p className="text-sm text-muted-foreground mt-2">This student has not completed any courses yet.</p>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="upcoming">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="bg-muted h-24"></CardHeader>
                  <CardContent className="p-4">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses
                .filter((c) => c.status === "Upcoming")
                .map((course) => (
                  <Card
                    key={course.id}
                    className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-amber-500"
                    onClick={() => handleViewCourseDetails(course.id, course.name)}
                  >
                    <CardHeader className="pb-2 bg-amber-50/50 dark:bg-amber-900/20">
                      <div className="flex justify-between items-start">
                        <div>
                          {getStatusBadge(course.status)}
                          <CardTitle className="text-lg mt-2">{course.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {course.code} • {course.department}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{course.semester}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            <Link
                              href={`/dashboard/faculty-profile?id=${course.facultyId}`}
                              className="hover:underline text-blue-600 dark:text-blue-400"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {course.faculty}
                            </Link>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Book className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{course.credits} Credits</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            Starts: {new Date(course.startDate || "").toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <Separator className="my-4" />
                      <div className="flex justify-between">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleUnenrollCourse(course.id)
                          }}
                        >
                          Unenroll
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleViewCourseDetails(course.id, course.name)
                          }}
                        >
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              {courses.filter((c) => c.status === "Upcoming").length === 0 && (
                <div className="col-span-full text-center py-10">
                  <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">No Upcoming Courses</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    This student is not enrolled in any upcoming courses.
                  </p>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
