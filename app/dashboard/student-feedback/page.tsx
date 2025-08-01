"use client"

import { useState, useEffect } from "react"
import { Filter, MessageSquare, Check, X, Calendar, CalendarIcon } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format, addDays } from "date-fns"
import { FacultyFeedbackInterface } from "@/components/faculty-feedback-interface"
import { feedbackScheduleService, type FeedbackSchedule } from "@/lib/feedback-schedule-service"
import { getActiveRole } from "@/lib/role-switcher"

// Original data for non-faculty roles
const initialFeedbackData = [
  {
    id: 1,
    studentName: "John Smith",
    studentId: "S001",
    course: "Introduction to Computer Science",
    courseCode: "CS101",
    subject: "Lecture Pace Feedback",
    message:
      "The pace of lectures is a bit fast. Could you please slow down a bit and explain concepts in more detail?",
    response: "",
    status: "Pending",
    date: "2025-03-01",
    rating: 4,
    feedbackType: "phase-1",
  },
  {
    id: 2,
    studentName: "Emily Johnson",
    studentId: "S002",
    course: "Data Structures & Algorithms",
    courseCode: "DS201",
    subject: "Assignment Difficulty",
    message:
      "The recent assignment on graph algorithms was quite challenging. Could we have more practice problems before such assignments?",
    response: "",
    status: "Pending",
    date: "2025-03-05",
    rating: 3,
    feedbackType: "phase-1",
  },
  {
    id: 3,
    studentName: "Michael Brown",
    studentId: "S003",
    course: "Artificial Intelligence",
    courseCode: "AI301",
    subject: "Course Material Suggestion",
    message:
      "Could you provide additional resources for neural networks? The current materials are good but I'd like to explore more.",
    response:
      "I've added additional resources on neural networks to the course materials section. Please check and let me know if you need more specific resources.",
    status: "Responded",
    date: "2025-02-20",
    rating: 5,
    feedbackType: "phase-2",
  },
]

// Mock data for students and their feedback status
const studentData = [
  {
    id: "S001",
    name: "John Smith",
    semester: 3,
    section: "A",
    class: "CSE",
    feedbackStatus: "completed",
    lastSubmitted: "2025-03-01",
    feedbackType: "phase-1",
  },
  {
    id: "S002",
    name: "Emily Johnson",
    studentId: "S002",
    semester: 3,
    section: "A",
    class: "CSE",
    feedbackStatus: "pending",
    lastSubmitted: null,
    feedbackType: "phase-1",
  },
  {
    id: "S004",
    name: "Sarah Davis",
    semester: 5,
    section: "B",
    class: "CSE",
    feedbackStatus: "pending",
    lastSubmitted: null,
    feedbackType: "phase-1",
  },
  {
    id: "S005",
    name: "David Wilson",
    semester: 3,
    section: "A",
    class: "CSE",
    feedbackStatus: "pending",
    lastSubmitted: null,
    feedbackType: "phase-2",
  },
  {
    id: "S006",
    name: "Jennifer Lee",
    semester: 7,
    section: "C",
    class: "CSE",
    feedbackStatus: "pending",
    lastSubmitted: null,
    feedbackType: "general",
  },
  {
    id: "S007",
    name: "Robert Taylor",
    semester: 7,
    section: "C",
    class: "CSE",
    feedbackStatus: "completed",
    lastSubmitted: "2025-02-28",
    feedbackType: "phase-2",
  },
  {
    id: "S008",
    name: "Lisa Anderson",
    semester: 5,
    section: "B",
    class: "CSE",
    feedbackStatus: "pending",
    lastSubmitted: null,
    feedbackType: "phase-1",
  },
]

export default function StudentFeedbackPage() {
  const [user, setUser] = useState<any>(null)
  const [activeRole, setActiveRole] = useState<string>("")
  const { toast } = useToast()

  // States for non-faculty roles
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCourse, setSelectedCourse] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedFeedbackTypeOrig, setSelectedFeedbackTypeOrig] = useState("all")
  const [feedbackData, setFeedbackData] = useState(initialFeedbackData)
  const [isResponseDialogOpenOrig, setIsResponseDialogOpenOrig] = useState(false)
  const [selectedFeedback, setSelectedFeedback] = useState<any>(null)
  const [responseTextOrig, setResponseTextOrig] = useState("")
  const [feedbackSchedules, setFeedbackSchedules] = useState<FeedbackSchedule[]>([])
  const [selectedSemesterOrig, setSelectedSemesterOrig] = useState<string>("all")
  const [selectedClass, setSelectedClass] = useState<string>("all")
  const [selectedSectionOrig, setSelectedSectionOrig] = useState<string>("all")
  const [studentsData, setStudentsData] = useState(studentData)
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false)
  const [selectedPhase, setSelectedPhase] = useState<string>("phase-1")
  const [startDate, setStartDate] = useState<Date | undefined>(new Date())
  const [endDate, setEndDate] = useState<Date | undefined>(addDays(new Date(), 14))
  const [dateErrors, setDateErrors] = useState<{
    startDate?: string
    endDate?: string
    general?: string
  }>({})
  const [editingSchedule, setEditingSchedule] = useState<FeedbackSchedule | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser)
      setUser(parsedUser)
      setActiveRole(getActiveRole(parsedUser))
    }

    // Load feedback schedules
    loadFeedbackSchedules()
  }, [])

  const loadFeedbackSchedules = async () => {
    try {
      const schedulesFromDb = await feedbackScheduleService.getAllSchedules() // <-- correct method
      // Convert DB snake_case → camelCase + Date objects for UI convenience
      const transformed = schedulesFromDb.map((s: any) => ({
        ...s,
        startDate: new Date(s.start_date),
        endDate: new Date(s.end_date),
      }))
      setFeedbackSchedules(transformed)
    } catch (error) {
      console.error("Error loading feedback schedules:", error)
      toast({
        title: "Error",
        description: "Failed to load feedback schedules",
        variant: "destructive",
      })
    }
  }

  // Listen for role changes
  useEffect(() => {
    const handleRoleChange = () => {
      if (user) {
        setActiveRole(getActiveRole(user))
      }
    }

    window.addEventListener("roleChange", handleRoleChange)
    window.addEventListener("storage", handleRoleChange)

    return () => {
      window.removeEventListener("roleChange", handleRoleChange)
      window.removeEventListener("storage", handleRoleChange)
    }
  }, [user])

  // Original functions for non-faculty roles
  const filteredFeedbackOrig = feedbackData.filter((feedback) => {
    const matchesSearch =
      feedback.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.message.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCourse = selectedCourse === "all" || feedback.courseCode === selectedCourse
    const matchesStatus = selectedStatus === "all" || feedback.status === selectedStatus
    const matchesFeedbackType = selectedFeedbackTypeOrig === "all" || feedback.feedbackType === selectedFeedbackTypeOrig

    return matchesSearch && matchesCourse && matchesStatus && matchesFeedbackType
  })

  const uniqueCourses = Array.from(new Set(feedbackData.map((feedback) => feedback.courseCode)))

  const handleOpenResponseDialog = (feedback: any) => {
    setSelectedFeedback(feedback)
    setResponseTextOrig(feedback.response || "")
    setIsResponseDialogOpenOrig(true)
  }

  const handleSubmitResponseOrig = () => {
    if (!responseTextOrig.trim()) {
      toast({
        title: "Error",
        description: "Please enter a response",
        variant: "destructive",
      })
      return
    }

    const updatedFeedback = feedbackData.map((feedback) => {
      if (feedback.id === selectedFeedback.id) {
        return {
          ...feedback,
          response: responseTextOrig,
          status: "Responded",
        }
      }
      return feedback
    })

    setFeedbackData(updatedFeedback)
    setIsResponseDialogOpenOrig(false)

    toast({
      title: "Response submitted",
      description: "Your response has been submitted successfully.",
    })
  }

  const isDateValid = () => {
    const errors: {
      startDate?: string
      endDate?: string
      general?: string
    } = {}

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (!startDate) {
      errors.startDate = "Start date is required"
    } else if (startDate < today) {
      errors.startDate = "Start date cannot be in the past"
    }

    if (!endDate) {
      errors.endDate = "End date is required"
    } else if (startDate && endDate && endDate <= startDate) {
      errors.general = "End date must be after start date"
    }

    setDateErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleScheduleFeedback = async () => {
    if (!isDateValid()) return
    setIsLoading(true)

    try {
      const result = await feedbackScheduleService.createSchedule({
        phase: selectedPhase as "phase-1" | "phase-2",
        start_date: startDate!.toISOString(),
        end_date: endDate!.toISOString(),
        status: new Date() >= startDate! && new Date() <= endDate! ? "active" : "upcoming",
        academic_year: "2024-25",
        created_by: user?.id || "admin",
      })

      // Refresh list in UI (transforms inside helper)
      await loadFeedbackSchedules()
      setIsScheduleDialogOpen(false)

      toast({
        title: "Feedback scheduled",
        description: `${selectedPhase === "phase-1" ? "Phase-1" : "Phase-2"} feedback has been scheduled successfully.`,
      })
    } catch (error) {
      console.error("Error scheduling feedback:", error)
      toast({
        title: "Error",
        description: "Failed to schedule feedback. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditSchedule = (schedule: FeedbackSchedule) => {
    setEditingSchedule(schedule)
    setSelectedPhase(schedule.phase)
    setStartDate(schedule.startDate)
    setEndDate(schedule.endDate)
    setIsEditDialogOpen(true)
  }

  const handleUpdateSchedule = async () => {
    if (!isDateValid() || !editingSchedule) return
    setIsLoading(true)

    try {
      await feedbackScheduleService.updateSchedule(editingSchedule.id, {
        start_date: startDate!.toISOString(),
        end_date: endDate!.toISOString(),
        status: new Date() >= startDate! && new Date() <= endDate! ? "active" : "upcoming",
      })

      await loadFeedbackSchedules()
      setIsEditDialogOpen(false)
      setEditingSchedule(null)

      toast({
        title: "Schedule updated",
        description: "Feedback schedule has been updated successfully.",
      })
    } catch (error) {
      console.error("Error updating schedule:", error)
      toast({
        title: "Error",
        description: "Failed to update schedule. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Check if user has permission to access this page
  if (
    !user ||
    (user.role !== "faculty" &&
      user.role !== "hod" &&
      user.role !== "coordinator" &&
      user.role !== "principal" &&
      user.role !== "admin")
  ) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>You don't have permission to access this page.</p>
      </div>
    )
  }

  // Use unified faculty interface for faculty role (both direct and switched)
  if (activeRole === "faculty") {
    return <FacultyFeedbackInterface user={user} />
  }

  // Original interface for non-faculty roles
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Student Feedback</h2>
          <p className="text-muted-foreground">View and respond to student feedback for your courses</p>
        </div>
        {user && user.role === "admin" && (
          <Button onClick={() => setIsScheduleDialogOpen(true)}>Schedule Feedback</Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
            <MessageSquare className="h-4 w-4 text-blue-500 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{feedbackData.length}</div>
            <p className="text-xs text-muted-foreground">Feedback received</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 dark:bg-green-900/20 border-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Responded</CardTitle>
            <Check className="h-4 w-4 text-green-500 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {feedbackData.filter((feedback) => feedback.status === "Responded").length}
            </div>
            <p className="text-xs text-muted-foreground">Feedback responded to</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-50 dark:bg-amber-900/20 border-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <X className="h-4 w-4 text-amber-500 dark:text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {feedbackData.filter((feedback) => feedback.status === "Pending").length}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting response</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 dark:bg-purple-900/20 border-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
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
              className="h-4 w-4 text-purple-500 dark:text-purple-400"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(feedbackData.reduce((sum, feedback) => sum + feedback.rating, 0) / feedbackData.length).toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">Out of 5 stars</p>
          </CardContent>
        </Card>
      </div>

      {user && user.role === "admin" ? (
        <Card>
          <CardHeader>
            <CardTitle>Feedback Schedules</CardTitle>
            <CardDescription>Manage scheduled feedback phases</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {feedbackSchedules.map((schedule) => (
                <Card key={schedule.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="capitalize">
                          {schedule.phase === "phase-1" ? "Phase-1 Feedback" : "Phase-2 Feedback"}
                        </CardTitle>
                        <CardDescription>
                          {schedule.phase === "phase-1"
                            ? "First phase of feedback collection"
                            : "Second phase of feedback collection"}
                        </CardDescription>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleEditSchedule(schedule)}>
                        Edit
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {format(schedule.startDate, "PPP")} - {format(schedule.endDate, "PPP")}
                        </span>
                      </div>
                      <div>
                        Status:{" "}
                        {schedule.status === "active" ? (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                            Active
                          </Badge>
                        ) : schedule.status === "upcoming" ? (
                          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                            Upcoming
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300">
                            Completed
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Pending Students</CardTitle>
            <CardDescription>Students who have not completed their feedback</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={selectedSemesterOrig} onValueChange={setSelectedSemesterOrig}>
                    <SelectTrigger className="h-8 w-[120px]">
                      <SelectValue placeholder="Semester" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Semesters</SelectItem>
                      {Array.from({ length: 8 }, (_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>
                          Semester {i + 1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="h-8 w-[120px]">
                    <SelectValue placeholder="Class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    <SelectItem value="CSE">CSE</SelectItem>
                    <SelectItem value="ECE">ECE</SelectItem>
                    <SelectItem value="ME">ME</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedSectionOrig} onValueChange={setSelectedSectionOrig}>
                  <SelectTrigger className="h-8 w-[120px]">
                    <SelectValue placeholder="Section" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sections</SelectItem>
                    <SelectItem value="A">Section A</SelectItem>
                    <SelectItem value="B">Section B</SelectItem>
                    <SelectItem value="C">Section C</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedFeedbackTypeOrig} onValueChange={setSelectedFeedbackTypeOrig}>
                  <SelectTrigger className="h-8 w-[150px]">
                    <SelectValue placeholder="Feedback Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="phase-1">Phase-1</SelectItem>
                    <SelectItem value="phase-2">Phase-2</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Semester</TableHead>
                    <TableHead>Section</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Feedback Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentsData
                    .filter(
                      (student) =>
                        student.feedbackStatus === "pending" &&
                        (selectedSemesterOrig === "all" || student.semester.toString() === selectedSemesterOrig) &&
                        (selectedClass === "all" || student.class === selectedClass) &&
                        (selectedSectionOrig === "all" || student.section === selectedSectionOrig) &&
                        (selectedFeedbackTypeOrig === "all" || student.feedbackType === selectedFeedbackTypeOrig),
                    )
                    .map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>{student.id}</TableCell>
                        <TableCell>{student.name}</TableCell>
                        <TableCell>{student.semester}</TableCell>
                        <TableCell>{student.section}</TableCell>
                        <TableCell>{student.class}</TableCell>
                        <TableCell>
                          {student.feedbackType === "phase-1" ? (
                            <Badge variant="outline">Phase-1</Badge>
                          ) : student.feedbackType === "phase-2" ? (
                            <Badge variant="outline">Phase-2</Badge>
                          ) : (
                            <Badge variant="outline">General</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                            Pending
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              toast({
                                title: "Reminder sent",
                                description: `Reminder sent to ${student.name}`,
                              })
                            }
                          >
                            Send Reminder
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  {studentsData.filter(
                    (student) =>
                      student.feedbackStatus === "pending" &&
                      (selectedSemesterOrig === "all" || student.semester.toString() === selectedSemesterOrig) &&
                      (selectedClass === "all" || student.class === selectedClass) &&
                      (selectedSectionOrig === "all" || student.section === selectedSectionOrig) &&
                      (selectedFeedbackTypeOrig === "all" || student.feedbackType === selectedFeedbackTypeOrig),
                  ).length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        No pending students found with the selected filters
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={isResponseDialogOpenOrig} onOpenChange={setIsResponseDialogOpenOrig}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {selectedFeedback?.status === "Responded" ? "Edit Response" : "Respond to Feedback"}
            </DialogTitle>
            <DialogDescription>
              {selectedFeedback?.status === "Responded"
                ? "Update your response to this student's feedback"
                : "Provide a response to this student's feedback"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="feedback-subject" className="text-sm font-medium">
                Subject
              </Label>
              <div id="feedback-subject" className="text-sm">
                {selectedFeedback?.subject}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback-message" className="text-sm font-medium">
                Student Message
              </Label>
              <div id="feedback-message" className="text-sm p-3 bg-slate-50 dark:bg-slate-900/50 rounded-md">
                {selectedFeedback?.message}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="response" className="text-sm font-medium">
                Your Response
              </Label>
              <Textarea
                id="response"
                value={responseTextOrig}
                onChange={(e) => setResponseTextOrig(e.target.value)}
                placeholder="Type your response here..."
                className="min-h-[120px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResponseDialogOpenOrig(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitResponseOrig}>
              {selectedFeedback?.status === "Responded" ? "Update Response" : "Submit Response"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Schedule Feedback</DialogTitle>
            <DialogDescription>Schedule a new feedback phase for students</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="feedback-type" className="text-sm font-medium">
                Feedback Type
              </Label>
              <Select value={selectedPhase} onValueChange={setSelectedPhase}>
                <SelectTrigger id="feedback-type" className="h-10 w-full">
                  <SelectValue placeholder="Select feedback type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="phase-1">Phase-1</SelectItem>
                  <SelectItem value="phase-2">Phase-2</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="start-date-input" className="text-sm font-medium">
                Start Date
              </Label>
              <div className="relative">
                <Input
                  id="start-date-input"
                  type="date"
                  value={startDate ? format(startDate, "yyyy-MM-dd") : ""}
                  onChange={(e) => {
                    const date = e.target.value ? new Date(e.target.value) : undefined
                    setStartDate(date)
                    setDateErrors((prev) => ({
                      ...prev,
                      startDate: undefined,
                      general: undefined,
                    }))
                  }}
                  className={`pl-10 ${dateErrors.startDate ? "border-red-500" : ""}`}
                />
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              </div>
              {dateErrors.startDate && <p className="text-sm text-red-500 mt-1">{dateErrors.startDate}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="end-date-input" className="text-sm font-medium">
                End Date
              </Label>
              <div className="relative">
                <Input
                  id="end-date-input"
                  type="date"
                  value={endDate ? format(endDate, "yyyy-MM-dd") : ""}
                  onChange={(e) => {
                    const date = e.target.value ? new Date(e.target.value) : undefined
                    setEndDate(date)
                    setDateErrors((prev) => ({
                      ...prev,
                      endDate: undefined,
                      general: undefined,
                    }))
                  }}
                  className={`pl-10 ${dateErrors.endDate || dateErrors.general ? "border-red-500" : ""}`}
                  min={startDate ? format(startDate, "yyyy-MM-dd") : undefined}
                />
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              </div>
              {dateErrors.endDate && <p className="text-sm text-red-500 mt-1">{dateErrors.endDate}</p>}
              {dateErrors.general && <p className="text-sm text-red-500 mt-1">{dateErrors.general}</p>}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsScheduleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleScheduleFeedback} disabled={isLoading}>
              {isLoading ? "Scheduling..." : "Schedule Feedback"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Feedback Schedule</DialogTitle>
            <DialogDescription>Update the dates for this feedback phase</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Feedback Type</Label>
              <div className="text-sm p-2 bg-muted rounded-md capitalize">
                {editingSchedule?.phase === "phase-1" ? "Phase-1" : "Phase-2"}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-start-date" className="text-sm font-medium">
                Start Date
              </Label>
              <div className="relative">
                <Input
                  id="edit-start-date"
                  type="date"
                  value={startDate ? format(startDate, "yyyy-MM-dd") : ""}
                  onChange={(e) => {
                    const date = e.target.value ? new Date(e.target.value) : undefined
                    setStartDate(date)
                    setDateErrors((prev) => ({
                      ...prev,
                      startDate: undefined,
                      general: undefined,
                    }))
                  }}
                  className={`pl-10 ${dateErrors.startDate ? "border-red-500" : ""}`}
                />
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              </div>
              {dateErrors.startDate && <p className="text-sm text-red-500 mt-1">{dateErrors.startDate}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-end-date" className="text-sm font-medium">
                End Date
              </Label>
              <div className="relative">
                <Input
                  id="edit-end-date"
                  type="date"
                  value={endDate ? format(endDate, "yyyy-MM-dd") : ""}
                  onChange={(e) => {
                    const date = e.target.value ? new Date(e.target.value) : undefined
                    setEndDate(date)
                    setDateErrors((prev) => ({
                      ...prev,
                      endDate: undefined,
                      general: undefined,
                    }))
                  }}
                  className={`pl-10 ${dateErrors.endDate || dateErrors.general ? "border-red-500" : ""}`}
                  min={startDate ? format(startDate, "yyyy-MM-dd") : undefined}
                />
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              </div>
              {dateErrors.endDate && <p className="text-sm text-red-500 mt-1">{dateErrors.endDate}</p>}
              {dateErrors.general && <p className="text-sm text-red-500 mt-1">{dateErrors.general}</p>}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false)
                setEditingSchedule(null)
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateSchedule} disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Schedule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
