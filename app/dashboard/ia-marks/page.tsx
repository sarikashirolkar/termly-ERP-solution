"use client"

import { useState, useEffect } from "react"
import { Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import Head from "next/head"

// Mock data
const iaMarksData = [
  {
    id: 1,
    course: "Introduction to Computer Science",
    courseCode: "CS101",
    test: "IA Test 1",
    maxMarks: 30,
    obtainedMarks: 26,
    date: "2025-03-01",
    status: "Excellent",
  },
  {
    id: 2,
    course: "Data Structures & Algorithms",
    courseCode: "DS201",
    test: "IA Test 1",
    maxMarks: 30,
    obtainedMarks: 24,
    date: "2025-03-02",
    status: "Good",
  },
  {
    id: 3,
    course: "Artificial Intelligence",
    courseCode: "AI301",
    test: "IA Test 1",
    maxMarks: 30,
    obtainedMarks: 28,
    date: "2025-03-03",
    status: "Excellent",
  },
  {
    id: 4,
    course: "Database Systems",
    courseCode: "DB301",
    test: "IA Test 1",
    maxMarks: 30,
    obtainedMarks: 22,
    date: "2025-03-04",
    status: "Good",
  },
  {
    id: 5,
    course: "Web Development",
    courseCode: "WD401",
    test: "IA Test 1",
    maxMarks: 30,
    obtainedMarks: 25,
    date: "2025-03-05",
    status: "Good",
  },
  {
    id: 6,
    course: "Introduction to Computer Science",
    courseCode: "CS101",
    test: "IA Test 2",
    maxMarks: 30,
    obtainedMarks: 27,
    date: "2025-04-01",
    status: "Excellent",
  },
  {
    id: 7,
    course: "Data Structures & Algorithms",
    courseCode: "DS201",
    test: "IA Test 2",
    maxMarks: 30,
    obtainedMarks: 25,
    date: "2025-04-02",
    status: "Good",
  },
  {
    id: 8,
    course: "Artificial Intelligence",
    courseCode: "AI301",
    test: "IA Test 2",
    maxMarks: 30,
    obtainedMarks: 29,
    date: "2025-04-03",
    status: "Excellent",
  },
  {
    id: 9,
    course: "Database Systems",
    courseCode: "DB301",
    test: "IA Test 2",
    maxMarks: 30,
    obtainedMarks: 23,
    date: "2025-04-04",
    status: "Good",
  },
  {
    id: 10,
    course: "Web Development",
    courseCode: "WD401",
    test: "IA Test 2",
    maxMarks: 30,
    obtainedMarks: 26,
    date: "2025-04-05",
    status: "Good",
  },
]

export default function IAMarksPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCourse, setSelectedCourse] = useState("all")
  const [selectedTest, setSelectedTest] = useState("all")
  const [userRole, setUserRole] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [marks, setMarks] = useState<any[]>([])
  const [courses, setCourses] = useState<string[]>([])
  const { toast } = useToast()

  useEffect(() => {
    // Add viewport meta tag to ensure proper scaling on mobile
    const meta = document.createElement("meta")
    meta.name = "viewport"
    meta.content = "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"

    // Remove any existing viewport meta tags
    const existingMeta = document.querySelector('meta[name="viewport"]')
    if (existingMeta) {
      existingMeta.remove()
    }

    document.head.appendChild(meta)

    // Get user role from localStorage
    const user = localStorage.getItem("user")
    if (user) {
      const { role } = JSON.parse(user)
      setUserRole(role)
    }

    // Simulate API call to fetch IA marks
    const fetchIAMarks = async () => {
      try {
        // Using mock data for now
        setTimeout(() => {
          setMarks(iaMarksData)

          // Extract unique courses
          const uniqueCourses = Array.from(new Set(iaMarksData.map((mark) => mark.course)))
          setCourses(uniqueCourses)

          setIsLoading(false)
        }, 500)
      } catch (error) {
        console.error("Failed to fetch IA marks:", error)
        toast({
          title: "Error",
          description: "Failed to load IA marks. Please try again later.",
          variant: "destructive",
        })
        setIsLoading(false)
      }
    }

    fetchIAMarks()

    return () => {
      // Clean up
      if (meta.parentNode) {
        meta.parentNode.removeChild(meta)
      }
    }
  }, [toast])

  // Filter marks by selected course and test
  const filteredMarks = marks.filter((mark) => {
    const matchesCourse = selectedCourse === "all" || mark.course === selectedCourse
    const matchesTest = selectedTest === "all" || mark.test === selectedTest
    const matchesSearch = mark.course.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCourse && matchesTest && matchesSearch
  })

  // Calculate statistics
  const calculateStats = () => {
    if (filteredMarks.length === 0) return { total: 0, average: 0, highest: 0, lowest: 0 }

    const total = filteredMarks.reduce((sum, mark) => sum + mark.obtainedMarks, 0)
    const maxPossible = filteredMarks.reduce((sum, mark) => sum + mark.maxMarks, 0)
    const highest = Math.max(...filteredMarks.map((mark) => mark.obtainedMarks))
    const lowest = Math.min(...filteredMarks.map((mark) => mark.obtainedMarks))
    const average = total / filteredMarks.length

    return {
      total,
      maxPossible,
      average: average.toFixed(1),
      highest,
      lowest,
      percentage: ((total / maxPossible) * 100).toFixed(1),
    }
  }

  const stats = calculateStats()
  const uniqueTests = Array.from(new Set(marks.map((mark) => mark.test)))

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Internal Assessment Marks</h2>
          <p className="text-muted-foreground">Loading your IA test marks...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>

      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Internal Assessment Marks</h2>
          <p className="text-muted-foreground">View and track your IA test performance</p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <Card className="bg-blue-50 dark:bg-blue-900/20 border-none">
            <CardHeader className="pb-2 p-3 sm:p-4">
              <CardTitle className="text-xs sm:text-sm font-medium">Total Score</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <div className="text-lg sm:text-2xl font-bold">
                {stats.total}/{stats.maxPossible}
              </div>
              <p className="text-xs text-muted-foreground">{stats.percentage}% overall</p>
            </CardContent>
          </Card>

          <Card className="bg-green-50 dark:bg-green-900/20 border-none">
            <CardHeader className="pb-2 p-3 sm:p-4">
              <CardTitle className="text-xs sm:text-sm font-medium">Average Score</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <div className="text-lg sm:text-2xl font-bold">{stats.average}</div>
              <p className="text-xs text-muted-foreground">Per test</p>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 dark:bg-purple-900/20 border-none">
            <CardHeader className="pb-2 p-3 sm:p-4">
              <CardTitle className="text-xs sm:text-sm font-medium">Highest Score</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <div className="text-lg sm:text-2xl font-bold">{stats.highest}</div>
              <p className="text-xs text-muted-foreground">Your best</p>
            </CardContent>
          </Card>

          <Card className="bg-amber-50 dark:bg-amber-900/20 border-none">
            <CardHeader className="pb-2 p-3 sm:p-4">
              <CardTitle className="text-xs sm:text-sm font-medium">Lowest Score</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <div className="text-lg sm:text-2xl font-bold">{stats.lowest}</div>
              <p className="text-xs text-muted-foreground">To improve</p>
            </CardContent>
          </Card>
        </div>

        {/* IA Test Records */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle>IA Test Marks</CardTitle>
            <CardDescription>View your internal assessment test records by course</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <Tabs defaultValue="all" className="w-full" onValueChange={setSelectedCourse}>
              <div className="overflow-x-auto -mx-4 sm:mx-0 pb-2">
                <div className="inline-block min-w-full px-4 sm:px-0">
                  <TabsList className="mb-4 w-full flex flex-nowrap overflow-x-auto h-auto">
                    <TabsTrigger value="all" className="mb-1 whitespace-nowrap">
                      All Courses
                    </TabsTrigger>
                    {courses.map((course) => (
                      <TabsTrigger key={course} value={course} className="mb-1 whitespace-nowrap">
                        {course}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>
              </div>

              <div className="flex flex-col gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search courses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-8 w-full"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={selectedTest} onValueChange={setSelectedTest}>
                    <SelectTrigger className="h-8 w-full">
                      <SelectValue placeholder="Select test" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tests</SelectItem>
                      {uniqueTests.map((test) => (
                        <SelectItem key={test} value={test}>
                          {test}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <TabsContent value={selectedCourse} className="mt-0">
                {/* Mobile-optimized card layout instead of table */}
                <div className="space-y-4">
                  {filteredMarks.length > 0 ? (
                    filteredMarks.map((mark) => (
                      <div key={mark.id} className="border rounded-md p-3 bg-gray-50 dark:bg-gray-900">
                        <div className="mb-2">
                          <div className="font-medium">{mark.course}</div>
                          <div className="text-xs text-muted-foreground">{mark.courseCode}</div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div>
                            <div className="text-xs text-muted-foreground">Test</div>
                            <div>{mark.test}</div>
                          </div>

                          <div>
                            <div className="text-xs text-muted-foreground">Marks</div>
                            <div>
                              {mark.obtainedMarks}/{mark.maxMarks}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {((mark.obtainedMarks / mark.maxMarks) * 100).toFixed(1)}%
                            </div>
                          </div>

                          <div>
                            <div className="text-xs text-muted-foreground">Status</div>
                            <Badge
                              variant="outline"
                              className={
                                mark.status === "Excellent"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                  : mark.status === "Good"
                                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                                    : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                              }
                            >
                              {mark.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No IA test marks found for this course.
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
