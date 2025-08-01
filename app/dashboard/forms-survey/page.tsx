"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ClipboardList, FileText, CheckCircle2, Clock, AlertCircle, ChevronRight } from "lucide-react"

export default function FormsSurveyPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [forms, setForms] = useState<any[]>([])

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser)
      setUser(parsedUser)

      // Fetch forms and surveys
      fetchMockForms(parsedUser)
    } else {
      setLoading(false)
    }
  }, [])

  const fetchMockForms = async (user: any) => {
    try {
      // Fetch course end surveys from the API
      const response = await fetch("/api/course-end-survey")
      const data = await response.json()

      // Transform the surveys into the format we need
      const cesSurveys = data.surveys
        .filter((survey: any) => survey.status === "published")
        .map((survey: any) => ({
          id: `ces-${survey.id}`,
          title: `Course End Survey - ${survey.subjectName}`,
          type: "survey",
          category: "Course End Survey",
          description: `Please provide your feedback on the ${survey.subjectName} course.`,
          deadline: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 7 days from now
          status: "pending",
          createdBy: survey.facultyName,
          department: survey.department,
          semester: survey.semester,
          subject: `${survey.subjectCode}: ${survey.subjectName}`,
          section: survey.section,
          mandatory: true,
          estimatedTime: "10 minutes",
        }))

      // Mock data for other forms and surveys
      const mockForms = [
        {
          id: "quiz-001",
          title: "Data Structures Mid-Term Quiz",
          type: "quiz",
          category: "Academic Quiz",
          description: "Test your knowledge on data structures concepts covered so far.",
          deadline: "2025-05-10",
          status: "pending",
          createdBy: "Prof. Priya Sharma",
          department: "Computer Science",
          semester: "Semester 3",
          subject: "CS301: Data Structures",
          section: "A",
          mandatory: true,
          estimatedTime: "30 minutes",
        },
        {
          id: "survey-001",
          title: "Library Services Feedback",
          type: "survey",
          category: "Institutional Survey",
          description: "Help us improve our library services by providing your feedback.",
          deadline: "2025-05-20",
          status: "pending",
          createdBy: "Library Committee",
          department: "All Departments",
          mandatory: false,
          estimatedTime: "5 minutes",
        },
        {
          id: "form-001",
          title: "Internship Preference Form",
          type: "form",
          category: "Career Development",
          description: "Submit your preferences for the upcoming summer internship program.",
          deadline: "2025-05-25",
          status: "pending",
          createdBy: "Placement Cell",
          department: "Computer Science",
          semester: "Semester 6",
          mandatory: true,
          estimatedTime: "15 minutes",
        },
        {
          id: "ces-002",
          title: "Course End Survey - Database Management Systems",
          type: "survey",
          category: "Course End Survey",
          description: "Please provide your feedback on the Database Management Systems course.",
          deadline: "2025-05-18",
          status: "completed",
          createdBy: "Dr. Rajesh Kumar",
          department: "Computer Science",
          semester: "Semester 3",
          subject: "CS302: Database Management Systems",
          section: "B",
          mandatory: true,
          estimatedTime: "10 minutes",
          completedOn: "2025-05-01",
        },
      ]

      // Combine API surveys with mock data
      setForms([...cesSurveys, ...mockForms])
    } catch (error) {
      console.error("Error fetching surveys:", error)
      // Fallback to mock data if API fails
      const mockForms = [
        {
          id: "quiz-001",
          title: "Data Structures Mid-Term Quiz",
          type: "quiz",
          category: "Academic Quiz",
          description: "Test your knowledge on data structures concepts covered so far.",
          deadline: "2025-05-10",
          status: "pending",
          createdBy: "Prof. Priya Sharma",
          department: "Computer Science",
          semester: "Semester 3",
          subject: "CS301: Data Structures",
          section: "A",
          mandatory: true,
          estimatedTime: "30 minutes",
        },
        {
          id: "survey-001",
          title: "Library Services Feedback",
          type: "survey",
          category: "Institutional Survey",
          description: "Help us improve our library services by providing your feedback.",
          deadline: "2025-05-20",
          status: "pending",
          createdBy: "Library Committee",
          department: "All Departments",
          mandatory: false,
          estimatedTime: "5 minutes",
        },
        {
          id: "form-001",
          title: "Internship Preference Form",
          type: "form",
          category: "Career Development",
          description: "Submit your preferences for the upcoming summer internship program.",
          deadline: "2025-05-25",
          status: "pending",
          createdBy: "Placement Cell",
          department: "Computer Science",
          semester: "Semester 6",
          mandatory: true,
          estimatedTime: "15 minutes",
        },
        {
          id: "ces-002",
          title: "Course End Survey - Database Management Systems",
          type: "survey",
          category: "Course End Survey",
          description: "Please provide your feedback on the Database Management Systems course.",
          deadline: "2025-05-18",
          status: "completed",
          createdBy: "Dr. Rajesh Kumar",
          department: "Computer Science",
          semester: "Semester 3",
          subject: "CS302: Database Management Systems",
          section: "B",
          mandatory: true,
          estimatedTime: "10 minutes",
          completedOn: "2025-05-01",
        },
      ]
      setForms(mockForms)
    }

    setLoading(false)
  }

  const handleFormClick = (form: any) => {
    // In a real app, this would navigate to the specific form
    if (form.category === "Course End Survey" && form.status === "pending") {
      // For course end surveys, use the dedicated response page
      router.push(`/dashboard/course-end-survey/respond?id=${form.id.replace("ces-", "")}`)
    } else {
      // For other forms or completed surveys, use the generic response page
      router.push(`/dashboard/forms-survey/respond?id=${form.id}`)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800"
          >
            Pending
          </Badge>
        )
      case "completed":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
          >
            Completed
          </Badge>
        )
      case "expired":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
          >
            Expired
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Course End Survey":
        return <FileText className="h-5 w-5 text-blue-500" />
      case "Academic Quiz":
        return <ClipboardList className="h-5 w-5 text-purple-500" />
      case "Institutional Survey":
        return <FileText className="h-5 w-5 text-green-500" />
      case "Career Development":
        return <FileText className="h-5 w-5 text-amber-500" />
      default:
        return <FileText className="h-5 w-5 text-gray-500" />
    }
  }

  const pendingForms = forms.filter((form) => form.status === "pending")
  const completedForms = forms.filter((form) => form.status === "completed")
  const expiredForms = forms.filter((form) => form.status === "expired")

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>
  }

  if (!user || user.role !== "student") {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
        <p className="text-muted-foreground">This page is only accessible to students.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Forms & Surveys</h1>
        <p className="text-muted-foreground">
          Respond to surveys, quizzes, and forms assigned to you by your institution.
        </p>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending" className="relative">
            Pending
            {pendingForms.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                {pendingForms.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingForms.length > 0 ? (
            pendingForms.map((form) => (
              <Card
                key={form.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleFormClick(form)}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(form.category)}
                      <div>
                        <CardTitle className="text-lg">{form.title}</CardTitle>
                        <CardDescription>{form.category}</CardDescription>
                      </div>
                    </div>
                    {getStatusBadge(form.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">{form.description}</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>Estimated time: {form.estimatedTime}</span>
                    </div>
                    {form.mandatory && (
                      <div className="flex items-center gap-1 text-red-500">
                        <AlertCircle className="h-4 w-4" />
                        <span>Mandatory</span>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-4">
                  <div className="text-sm text-muted-foreground">
                    Due: {new Date(form.deadline).toLocaleDateString()}
                  </div>
                  <Button variant="ghost" size="sm" className="gap-1">
                    Respond <ChevronRight className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-lg font-medium mb-1">All caught up!</h3>
              <p className="text-muted-foreground">You have no pending forms or surveys to complete.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedForms.length > 0 ? (
            completedForms.map((form) => (
              <Card
                key={form.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleFormClick(form)}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(form.category)}
                      <div>
                        <CardTitle className="text-lg">{form.title}</CardTitle>
                        <CardDescription>{form.category}</CardDescription>
                      </div>
                    </div>
                    {getStatusBadge(form.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">{form.description}</p>
                  <div className="text-sm">
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Completed on: {new Date(form.completedOn).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-4">
                  <div className="text-sm text-muted-foreground">Created by: {form.createdBy}</div>
                  <Button variant="ghost" size="sm" className="gap-1">
                    View Response <ChevronRight className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-1">No completed forms</h3>
              <p className="text-muted-foreground">You haven't completed any forms or surveys yet.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {forms.length > 0 ? (
            forms.map((form) => (
              <Card
                key={form.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleFormClick(form)}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(form.category)}
                      <div>
                        <CardTitle className="text-lg">{form.title}</CardTitle>
                        <CardDescription>{form.category}</CardDescription>
                      </div>
                    </div>
                    {getStatusBadge(form.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">{form.description}</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {form.status === "pending" ? (
                      <>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>Estimated time: {form.estimatedTime}</span>
                        </div>
                        {form.mandatory && (
                          <div className="flex items-center gap-1 text-red-500">
                            <AlertCircle className="h-4 w-4" />
                            <span>Mandatory</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>Completed on: {new Date(form.completedOn).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-4">
                  <div className="text-sm text-muted-foreground">
                    {form.status === "pending"
                      ? `Due: ${new Date(form.deadline).toLocaleDateString()}`
                      : `Created by: ${form.createdBy}`}
                  </div>
                  <Button variant="ghost" size="sm" className="gap-1">
                    {form.status === "pending" ? (
                      <>
                        Respond <ChevronRight className="h-4 w-4" />
                      </>
                    ) : (
                      <>
                        View Response <ChevronRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-1">No forms available</h3>
              <p className="text-muted-foreground">There are no forms or surveys assigned to you at the moment.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
