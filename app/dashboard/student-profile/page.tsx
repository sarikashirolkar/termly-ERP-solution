"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { Loader2, Mail, Phone, Calendar, Building, Award, Clock } from "lucide-react"

interface Student {
  id: string
  name: string
  email: string
  phone: string
  department: string
  semester: string
  enrollmentDate: string
  status: "active" | "inactive" | "on leave"
  cgpa: number
  attendance: number
  courses: {
    id: string
    name: string
    code: string
    credits: number
    grade?: string
  }[]
  achievements: {
    title: string
    description: string
    date: string
  }[]
  schedule: {
    day: string
    slots: {
      time: string
      course: string
      location: string
    }[]
  }[]
}

export default function StudentProfile() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [student, setStudent] = useState<Student | null>(null)

  useEffect(() => {
    // Get student ID from URL query parameter
    const urlParams = new URLSearchParams(window.location.search)
    const id = urlParams.get("id")

    if (id) {
      fetchStudentProfile(id)
    } else {
      // Fallback to demo data if no ID provided
      loadDemoStudent()
    }
  }, [])

  const fetchStudentProfile = async (id: string) => {
    try {
      // In a real app, this would be an API call
      // const response = await fetch(`/api/students/${id}`);
      // const data = await response.json();
      // setStudent(data);

      // For demo purposes, we'll use dummy data
      loadDemoStudent()
    } catch (error) {
      console.error("Error fetching student profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadDemoStudent = () => {
    setTimeout(() => {
      setStudent({
        id: "student123",
        name: "John Smith",
        email: "john.smith@example.com",
        phone: "+1 (555) 123-4567",
        department: "Computer Science",
        semester: "4th Semester",
        enrollmentDate: "15/8/2023",
        status: "active",
        cgpa: 3.7,
        attendance: 92,
        courses: [
          {
            id: "cs101",
            name: "Introduction to Computer Science",
            code: "CS101",
            credits: 4,
            grade: "A",
          },
          {
            id: "cs201",
            name: "Data Structures and Algorithms",
            code: "CS201",
            credits: 4,
            grade: "B+",
          },
          {
            id: "math101",
            name: "Calculus I",
            code: "MATH101",
            credits: 3,
            grade: "A",
          },
          {
            id: "phys101",
            name: "Physics I",
            code: "PHYS101",
            credits: 4,
            grade: "B+",
          },
          {
            id: "cs301",
            name: "Database Systems",
            code: "CS301",
            credits: 3,
          },
        ],
        achievements: [
          {
            title: "Dean's List",
            description: "Achieved for outstanding academic performance",
            date: "2024",
          },
          {
            title: "Hackathon Winner",
            description: "First place in the annual college hackathon",
            date: "2023",
          },
        ],
        schedule: [
          {
            day: "Monday",
            slots: [
              {
                time: "09:00 - 10:30",
                course: "CS101",
                location: "Room 101",
              },
              {
                time: "13:00 - 14:30",
                course: "CS201",
                location: "Room 203",
              },
            ],
          },
          {
            day: "Wednesday",
            slots: [
              {
                time: "09:00 - 10:30",
                course: "CS101",
                location: "Room 101",
              },
              {
                time: "13:00 - 14:30",
                course: "MATH101",
                location: "Room 305",
              },
            ],
          },
          {
            day: "Friday",
            slots: [
              {
                time: "09:00 - 10:30",
                course: "CS201",
                location: "Room 203",
              },
              {
                time: "13:00 - 14:30",
                course: "PHYS101",
                location: "Room 405",
              },
            ],
          },
        ],
      })
      setLoading(false)
    }, 800)
  }

  const handleViewCourses = () => {
    if (student) {
      router.push(`/dashboard/student-courses?id=${student.id}&name=${encodeURIComponent(student.name)}`)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-red-100 text-red-800"
      case "on leave":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6 flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading student profile...</span>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="container mx-auto py-6">
        <div className="bg-red-100 text-red-800 p-4 rounded-md">
          Student not found. Please check the ID and try again.
        </div>
        <Button onClick={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Student Profile</h1>
        <Button onClick={() => router.back()} variant="outline">
          Back
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle>Personal Information</CardTitle>
              <Badge className={`capitalize ${getStatusColor(student.status)}`}>{student.status}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center mb-6">
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-2xl mb-4">
                {student.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
              <h2 className="text-xl font-semibold">{student.name}</h2>
              <p className="text-muted-foreground">
                {student.department}, {student.semester}
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{student.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{student.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span>{student.department}</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Enrolled {student.enrollmentDate}</span>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">CGPA</span>
                  <span className="text-sm font-medium">{student.cgpa.toFixed(2)}/4.0</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5">
                  <div
                    className="bg-primary h-2.5 rounded-full"
                    style={{ width: `${(student.cgpa / 4) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Attendance</span>
                  <span className="text-sm font-medium">{student.attendance}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5">
                  <div className="bg-primary h-2.5 rounded-full" style={{ width: `${student.attendance}%` }}></div>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <Button onClick={handleViewCourses} className="w-full">
                View Courses
              </Button>
              <Button variant="outline" className="w-full">
                Send Message
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs Section */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="courses" className="w-full">
            <TabsList className="mb-4 grid grid-cols-3">
              <TabsTrigger value="courses">Courses</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
            </TabsList>

            <TabsContent value="courses">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Enrolled Courses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {student.courses.map((course, index) => (
                      <div key={index} className="border-b pb-4 last:border-0 last:pb-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold">{course.name}</h3>
                            <p className="text-muted-foreground">
                              {course.code} • {course.credits} Credits
                            </p>
                          </div>
                          {course.grade && (
                            <Badge variant="outline" className="font-semibold">
                              Grade: {course.grade}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="achievements">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Achievements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {student.achievements.map((achievement, index) => (
                      <div key={index} className="border-b pb-4 last:border-0 last:pb-0">
                        <div className="flex items-center gap-2">
                          <Award className="h-5 w-5 text-primary" />
                          <h3 className="font-semibold">{achievement.title}</h3>
                        </div>
                        <p className="text-muted-foreground text-sm mt-1">{achievement.date}</p>
                        <p className="mt-2">{achievement.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="schedule">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Weekly Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {student.schedule.map((day, index) => (
                      <div key={index} className="border-b pb-4 last:border-0 last:pb-0">
                        <h3 className="font-semibold mb-3">{day.day}</h3>
                        <div className="space-y-3">
                          {day.slots.map((slot, slotIndex) => (
                            <div key={slotIndex} className="flex items-start gap-3 bg-muted/50 p-3 rounded-md">
                              <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                              <div>
                                <p className="font-medium">{slot.time}</p>
                                <p className="text-sm">
                                  {slot.course} • {slot.location}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
