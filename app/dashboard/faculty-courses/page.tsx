"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Calendar, Clock, GraduationCap, Users } from "lucide-react"
import Link from "next/link"

interface Course {
  id: string
  code: string
  name: string
  department: string
  semester: string
  credits: number
  status: "Active" | "Inactive" | "Upcoming"
  students: number
}

export default function FacultyCourses() {
  const searchParams = useSearchParams()
  const facultyId = searchParams.get("id")
  const facultyName = searchParams.get("name") || "Faculty"

  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real application, fetch courses assigned to this faculty
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
        students: 42,
      },
      {
        id: "cs201",
        code: "CS201",
        name: "Data Structures and Algorithms",
        department: "Computer Science",
        semester: "Fall 2023",
        credits: 4,
        status: "Active",
        students: 38,
      },
      {
        id: "cs301",
        code: "CS301",
        name: "Database Systems",
        department: "Computer Science",
        semester: "Spring 2024",
        credits: 3,
        status: "Upcoming",
        students: 0,
      },
    ]

    setTimeout(() => {
      setCourses(dummyCourses)
      setLoading(false)
    }, 500)
  }, [facultyId])

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/faculty">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Courses taught by {facultyName}</h1>
        </div>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="active">Active Courses</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming Courses</TabsTrigger>
          <TabsTrigger value="past">Past Courses</TabsTrigger>
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
                  <Card key={course.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <Badge variant={course.status === "Active" ? "success" : "secondary"} className="mb-2">
                            {course.status}
                          </Badge>
                          <CardTitle className="text-lg">{course.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {course.code} • {course.department}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{course.semester}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{course.credits} Credits</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{course.students} Students</span>
                        </div>
                      </div>
                      <Separator className="my-4" />
                      <div className="flex justify-between">
                        <Button variant="outline" asChild>
                          <Link href={`/dashboard/course-students?id=${course.id}&name=${course.name}`}>
                            View Students
                          </Link>
                        </Button>
                        <Button variant="default" asChild>
                          <Link href={`/dashboard/course-details?id=${course.id}&name=${course.name}`}>
                            View Details
                          </Link>
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
                    This faculty is not teaching any active courses at the moment.
                  </p>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="upcoming">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses
              .filter((c) => c.status === "Upcoming")
              .map((course) => (
                <Card key={course.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <Badge variant="secondary" className="mb-2">
                          {course.status}
                        </Badge>
                        <CardTitle className="text-lg">{course.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {course.code} • {course.department}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{course.semester}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{course.credits} Credits</span>
                      </div>
                    </div>
                    <Separator className="my-4" />
                    <div className="flex justify-end">
                      <Button variant="default" asChild>
                        <Link href={`/dashboard/course-details?id=${course.id}&name=${course.name}`}>View Details</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            {courses.filter((c) => c.status === "Upcoming").length === 0 && (
              <div className="col-span-full text-center py-10">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No Upcoming Courses</h3>
                <p className="text-sm text-muted-foreground mt-2">This faculty has no upcoming courses scheduled.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="past">
          <div className="col-span-full text-center py-10">
            <Clock className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">Past Courses</h3>
            <p className="text-sm text-muted-foreground mt-2">Historical course data is not available in this demo.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
