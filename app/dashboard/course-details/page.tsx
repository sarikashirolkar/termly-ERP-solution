"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, BookOpen, Users, FileText, Download, Calendar, Clock } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"

interface Course {
  id: string
  code: string
  name: string
  description: string
  credits: number
  departmentId: string
  departmentName: string
  semester: number
  year: number
  facultyId: string
  facultyName: string
  startDate: string
  endDate: string
  schedule: Array<{
    day: string
    startTime: string
    endTime: string
    room: string
  }>
  enrolledStudents: number
  maxCapacity: number
  syllabus: Array<{
    unit: number
    title: string
    topics: string[]
    completionStatus: number
  }>
  materials: Array<{
    id: string
    title: string
    type: string
    uploadDate: string
    size: string
  }>
  assessments: Array<{
    id: string
    title: string
    type: string
    dueDate: string
    totalMarks: number
    status: string
  }>
}

export default function CourseDetailsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()
  const courseId = searchParams.get("id")
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    // In a real application, fetch course data from API
    // For demo, using dummy data
    setTimeout(() => {
      setCourse({
        id: courseId || "course-001",
        code: "CS301",
        name: "Data Structures and Algorithms",
        description:
          "This course covers fundamental data structures and algorithms used in computer science. Topics include arrays, linked lists, stacks, queues, trees, graphs, sorting, searching, and algorithm analysis.",
        credits: 4,
        departmentId: "dept-001",
        departmentName: "Computer Science and Engineering",
        semester: 3,
        year: 2,
        facultyId: "fac-001",
        facultyName: "Dr. Rajesh Kumar",
        startDate: "2023-08-01",
        endDate: "2023-12-15",
        schedule: [
          {
            day: "Monday",
            startTime: "10:00",
            endTime: "11:30",
            room: "A-201",
          },
          {
            day: "Wednesday",
            startTime: "10:00",
            endTime: "11:30",
            room: "A-201",
          },
          {
            day: "Friday",
            startTime: "14:00",
            endTime: "15:30",
            room: "Lab-101",
          },
        ],
        enrolledStudents: 45,
        maxCapacity: 60,
        syllabus: [
          {
            unit: 1,
            title: "Introduction to Data Structures",
            topics: ["Abstract Data Types", "Time and Space Complexity", "Arrays and Strings"],
            completionStatus: 100,
          },
          {
            unit: 2,
            title: "Linear Data Structures",
            topics: ["Linked Lists", "Stacks", "Queues", "Hash Tables"],
            completionStatus: 75,
          },
          {
            unit: 3,
            title: "Tree Data Structures",
            topics: ["Binary Trees", "Binary Search Trees", "AVL Trees", "Red-Black Trees"],
            completionStatus: 50,
          },
          {
            unit: 4,
            title: "Graph Algorithms",
            topics: ["Graph Representation", "BFS and DFS", "Shortest Path Algorithms", "Minimum Spanning Trees"],
            completionStatus: 25,
          },
          {
            unit: 5,
            title: "Advanced Algorithms",
            topics: ["Dynamic Programming", "Greedy Algorithms", "Backtracking", "String Matching Algorithms"],
            completionStatus: 0,
          },
        ],
        materials: [
          {
            id: "mat-001",
            title: "Introduction to Data Structures Slides",
            type: "pdf",
            uploadDate: "2023-08-05",
            size: "2.4 MB",
          },
          {
            id: "mat-002",
            title: "Linked List Implementation Code",
            type: "zip",
            uploadDate: "2023-08-12",
            size: "1.1 MB",
          },
          {
            id: "mat-003",
            title: "Tree Traversal Tutorial",
            type: "video",
            uploadDate: "2023-09-03",
            size: "45.6 MB",
          },
          {
            id: "mat-004",
            title: "Algorithm Analysis Practice Problems",
            type: "pdf",
            uploadDate: "2023-09-15",
            size: "3.2 MB",
          },
        ],
        assessments: [
          {
            id: "ass-001",
            title: "Quiz 1: Arrays and Linked Lists",
            type: "quiz",
            dueDate: "2023-08-20",
            totalMarks: 20,
            status: "completed",
          },
          {
            id: "ass-002",
            title: "Assignment 1: Stack and Queue Implementation",
            type: "assignment",
            dueDate: "2023-09-10",
            totalMarks: 50,
            status: "completed",
          },
          {
            id: "ass-003",
            title: "Mid-term Examination",
            type: "exam",
            dueDate: "2023-10-05",
            totalMarks: 100,
            status: "upcoming",
          },
          {
            id: "ass-004",
            title: "Assignment 2: Graph Algorithms",
            type: "assignment",
            dueDate: "2023-11-15",
            totalMarks: 50,
            status: "upcoming",
          },
          {
            id: "ass-005",
            title: "Final Examination",
            type: "exam",
            dueDate: "2023-12-10",
            totalMarks: 100,
            status: "upcoming",
          },
        ],
      })
      setLoading(false)
    }, 1000)
  }, [courseId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Course Not Found</h1>
        <p className="mb-4">The course you are looking for does not exist or has been removed.</p>
        <Link href="/dashboard/courses">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Courses
          </Button>
        </Link>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
  }

  const getOverallProgress = () => {
    if (!course.syllabus.length) return 0
    const totalUnits = course.syllabus.length
    const completedPercentage = course.syllabus.reduce((acc, unit) => acc + unit.completionStatus, 0) / totalUnits
    return completedPercentage
  }

  const getAssessmentStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500"
      case "upcoming":
        return "bg-blue-500"
      case "overdue":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getAssessmentStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">Completed</Badge>
      case "upcoming":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">Upcoming</Badge>
      case "overdue":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100">Overdue</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getMaterialTypeIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FileText className="h-4 w-4" />
      case "video":
        return <BookOpen className="h-4 w-4" />
      case "zip":
        return <FileText className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const handleDownloadMaterial = (materialId: string, title: string) => {
    toast({
      title: "Download Started",
      description: `Downloading ${title}...`,
    })
    // In a real app, this would trigger an actual download
  }

  const handleViewStudents = () => {
    router.push(`/dashboard/course-students?id=${course.id}&name=${encodeURIComponent(course.name)}`)
  }

  const handleEditCourse = () => {
    router.push(`/dashboard/courses?edit=${course.id}`)
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Link href="/dashboard/courses">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">{course.name}</h1>
          <Badge>{course.code}</Badge>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleViewStudents}>
            <Users className="mr-2 h-4 w-4" />
            View Students
          </Button>
          <Button onClick={handleEditCourse}>Edit Course</Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-4 md:w-[600px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="syllabus">Syllabus</TabsTrigger>
          <TabsTrigger value="materials">Materials</TabsTrigger>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Course Information</CardTitle>
                <CardDescription>Detailed information about the course</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold">Description</h3>
                  <p className="text-muted-foreground">{course.description}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Department</p>
                    <Link href={`/dashboard/department-details?id=${course.departmentId}`}>
                      <p className="text-sm text-blue-500 hover:underline">{course.departmentName}</p>
                    </Link>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Faculty</p>
                    <Link href={`/dashboard/faculty-profile?id=${course.facultyId}`}>
                      <p className="text-sm text-blue-500 hover:underline">{course.facultyName}</p>
                    </Link>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Credits</p>
                    <p className="text-sm text-muted-foreground">{course.credits}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Semester / Year</p>
                    <p className="text-sm text-muted-foreground">
                      Semester {course.semester}, Year {course.year}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Start Date</p>
                    <p className="text-sm text-muted-foreground">{formatDate(course.startDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">End Date</p>
                    <p className="text-sm text-muted-foreground">{formatDate(course.endDate)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Enrollment</CardTitle>
                <CardDescription>Student enrollment status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Enrolled Students</p>
                    <p className="text-2xl font-bold">{course.enrolledStudents}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Maximum Capacity</p>
                    <p className="text-2xl font-bold">{course.maxCapacity}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Enrollment Progress</p>
                  <Progress value={(course.enrolledStudents / course.maxCapacity) * 100} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {Math.round((course.enrolledStudents / course.maxCapacity) * 100)}% of capacity filled
                  </p>
                </div>
                <Button variant="outline" className="w-full" onClick={handleViewStudents}>
                  <Users className="mr-2 h-4 w-4" />
                  View Enrolled Students
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Course Schedule</CardTitle>
              <CardDescription>Weekly schedule for this course</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {course.schedule.map((scheduleItem, index) => (
                  <Card key={index} className="bg-muted/40 hover:bg-muted/60 transition-colors cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">{scheduleItem.day}</Badge>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="h-3.5 w-3.5 mr-1" />
                          {scheduleItem.startTime} - {scheduleItem.endTime}
                        </div>
                      </div>
                      <div className="flex items-center text-sm">
                        <Calendar className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                        <span>Room: {scheduleItem.room}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Course Progress</CardTitle>
              <CardDescription>Overall course completion status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <p className="text-sm font-medium">Overall Progress</p>
                    <p className="text-sm font-medium">{Math.round(getOverallProgress())}%</p>
                  </div>
                  <Progress value={getOverallProgress()} className="h-2" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Syllabus Units</p>
                    <div className="space-y-2">
                      {course.syllabus.map((unit) => (
                        <div key={unit.unit} className="flex items-center justify-between">
                          <p className="text-sm">
                            Unit {unit.unit}: {unit.title}
                          </p>
                          <Badge variant={unit.completionStatus === 100 ? "default" : "outline"}>
                            {unit.completionStatus}%
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Assessments</p>
                    <div className="space-y-2">
                      {course.assessments.map((assessment) => (
                        <div key={assessment.id} className="flex items-center justify-between">
                          <p className="text-sm truncate" style={{ maxWidth: "200px" }}>
                            {assessment.title}
                          </p>
                          {getAssessmentStatusBadge(assessment.status)}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="syllabus" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Course Syllabus</CardTitle>
              <CardDescription>
                Detailed syllabus for {course.code}: {course.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {course.syllabus.map((unit) => (
                <div key={unit.unit} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">
                      Unit {unit.unit}: {unit.title}
                    </h3>
                    <Badge variant={unit.completionStatus === 100 ? "default" : "outline"}>
                      {unit.completionStatus}% Complete
                    </Badge>
                  </div>
                  <Progress value={unit.completionStatus} className="h-2 mb-2" />
                  <div className="bg-muted/40 p-4 rounded-md">
                    <h4 className="font-medium mb-2">Topics Covered:</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {unit.topics.map((topic, index) => (
                        <li key={index} className="text-sm">
                          {topic}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="materials" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Course Materials</CardTitle>
              <CardDescription>
                Study materials for {course.code}: {course.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Upload Date</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {course.materials.map((material) => (
                    <TableRow key={material.id} className="hover:bg-muted/50 cursor-pointer">
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          {getMaterialTypeIcon(material.type)}
                          <span className="ml-2">{material.title}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {material.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(material.uploadDate).toLocaleDateString()}</TableCell>
                      <TableCell>{material.size}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadMaterial(material.id, material.title)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-4 flex justify-end">
                <Button
                  onClick={() => {
                    toast({
                      title: "Upload Material",
                      description: "This feature would allow uploading new materials in a real application.",
                    })
                  }}
                >
                  Upload New Material
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assessments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Course Assessments</CardTitle>
              <CardDescription>
                Assessments and evaluations for {course.code}: {course.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Total Marks</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {course.assessments.map((assessment) => (
                    <TableRow key={assessment.id} className="hover:bg-muted/50 cursor-pointer">
                      <TableCell className="font-medium">{assessment.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {assessment.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(assessment.dueDate).toLocaleDateString()}</TableCell>
                      <TableCell>{assessment.totalMarks}</TableCell>
                      <TableCell>{getAssessmentStatusBadge(assessment.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            toast({
                              title: "View Assessment Details",
                              description: `Viewing details for ${assessment.title}`,
                            })
                          }}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-4 flex justify-end">
                <Button
                  onClick={() => {
                    toast({
                      title: "Create Assessment",
                      description: "This feature would allow creating new assessments in a real application.",
                    })
                  }}
                >
                  Create New Assessment
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
