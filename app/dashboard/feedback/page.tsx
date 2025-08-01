"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Send, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { FeedbackStarRating as StarRating } from "@/components/feedback-star-rating"
import { Switch } from "@/components/ui/switch"
import { feedbackScheduleService } from "@/lib/feedback-schedule-service"

interface Course {
  id: string
  code: string
  name: string
  component_type: string
  batch: string | null
  section: string
  academic_year: string
  semester: number
  subject_id: string
  faculty: {
    id: string
    name: string
    email: string
  }
}

interface FeedbackHistory {
  id: string
  subject_name: string
  subject_code: string
  faculty_name: string
  feedback_type: string
  rating: number
  message: string
  response: string | null
  status: string
  submitted_at: string
  responded_at: string | null
}

export default function FeedbackPage() {
  const [activeTab, setActiveTab] = useState("submit")
  const [selectedCourse, setSelectedCourse] = useState("")
  const [message, setMessage] = useState("")
  const [ratings, setRatings] = useState<number[]>(Array(10).fill(0))
  const [isAnonymous, setIsAnonymous] = useState(true)
  const [user, setUser] = useState<any>(null)
  const { toast } = useToast()
  const [feedbackType, setFeedbackType] = useState("")
  const [isPhase1Active, setIsPhase1Active] = useState(false)
  const [isPhase2Active, setIsPhase2Active] = useState(false)
  const [courses, setCourses] = useState<Course[]>([])
  const [feedbackHistory, setFeedbackHistory] = useState<FeedbackHistory[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Get user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  // Fetch student courses when user is available
  useEffect(() => {
    if (user?.id) {
      fetchStudentCourses()
      fetchFeedbackHistory()
    }
  }, [user])

  // Check if feedback phases are active
  useEffect(() => {
    const checkFeedbackPhases = async () => {
      try {
        const openPhases = await feedbackScheduleService.getCurrentOpenPhases()
        setIsPhase1Active(openPhases.includes("phase-1"))
        setIsPhase2Active(openPhases.includes("phase-2"))
      } catch (error) {
        console.error("Failed to check feedback phases:", error)
      }
    }

    checkFeedbackPhases()
  }, [])

  const fetchStudentCourses = async () => {
    if (!user?.id) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/feedback/student-courses?studentId=${user.id}`)
      const result = await response.json()

      if (result.success) {
        setCourses(result.data)
        console.log("Fetched student courses:", result.data)
      } else {
        console.error("Failed to fetch courses:", result.error)
        toast({
          title: "Error",
          description: "Failed to load your courses",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching student courses:", error)
      toast({
        title: "Error",
        description: "Failed to load your courses",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchFeedbackHistory = async () => {
    if (!user?.id) return

    try {
      const response = await fetch(`/api/feedback/student-history?studentId=${user.id}`)
      const result = await response.json()

      if (result.success) {
        setFeedbackHistory(result.data)
      } else {
        console.error("Failed to fetch feedback history:", result.error)
      }
    } catch (error) {
      console.error("Error fetching feedback history:", error)
    }
  }

  const handleRatingChange = (index: number, value: number) => {
    const newRatings = [...ratings]
    newRatings[index] = value
    setRatings(newRatings)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!feedbackType) {
      toast({
        title: "Error",
        description: "Please select a feedback type",
        variant: "destructive",
      })
      return
    }

    if ((feedbackType === "phase-1" && !isPhase1Active) || (feedbackType === "phase-2" && !isPhase2Active)) {
      toast({
        title: "Error",
        description: `${feedbackType === "phase-1" ? "Phase-1" : "Phase-2"} feedback period is not active at this time`,
        variant: "destructive",
      })
      return
    }

    if (!selectedCourse) {
      toast({
        title: "Error",
        description: "Please select a course",
        variant: "destructive",
      })
      return
    }

    if (ratings.some((r) => r === 0)) {
      toast({
        title: "Error",
        description: "Please provide ratings for all questions",
        variant: "destructive",
      })
      return
    }

    const selectedCourseData = courses.find((c) => c.id === selectedCourse)
    if (!selectedCourseData) {
      toast({
        title: "Error",
        description: "Selected course not found",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/feedback/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          student_id: user.id,
          course_id: selectedCourse,
          subject_id: selectedCourseData.subject_id,
          faculty_id: selectedCourseData.faculty.id,
          feedback_type: feedbackType,
          ratings,
          message,
          is_anonymous: isAnonymous,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Feedback Submitted",
          description: isAnonymous
            ? "Your anonymous feedback has been submitted successfully"
            : "Your feedback has been submitted successfully",
        })

        // Reset form
        setFeedbackType("")
        setSelectedCourse("")
        setMessage("")
        setRatings(Array(10).fill(0))
        setIsAnonymous(true)

        // Refresh feedback history
        fetchFeedbackHistory()

        // Switch to history tab
        setActiveTab("history")
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to submit feedback",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error submitting feedback:", error)
      toast({
        title: "Error",
        description: "Failed to submit feedback",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const feedbackQuestions = [
    "Has the teacher covered the complete syllabus?",
    "Is the teaching methodology effective?",
    "Are the concepts explained clearly?",
    "Is the pace of teaching appropriate?",
    "Are the study materials provided helpful?",
    "Does the teacher encourage questions and discussions?",
    "Is the teacher punctual and regular?",
    "Are the assignments and assessments relevant?",
    "Does the teacher provide constructive feedback?",
    "Overall, how would you rate the course and teaching?",
  ]

  const selectedCourseData = courses.find((c) => c.id === selectedCourse)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Feedback System</h2>
        <p className="text-muted-foreground">Submit and track your feedback for courses and instructors</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="submit">Submit Feedback</TabsTrigger>
          <TabsTrigger value="history">Feedback History</TabsTrigger>
        </TabsList>

        <TabsContent value="submit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Course Feedback</CardTitle>
              <CardDescription>Share your thoughts about the course and instructor</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="feedbackType">Feedback Type</Label>
                  <Select value={feedbackType} onValueChange={setFeedbackType}>
                    <SelectTrigger id="feedbackType">
                      <SelectValue placeholder="Select feedback type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="phase-1">Phase-1 Feedback</SelectItem>
                      <SelectItem value="phase-2">Phase-2 Feedback</SelectItem>
                      <SelectItem value="general">General Feedback</SelectItem>
                    </SelectContent>
                  </Select>
                  {feedbackType === "phase-1" && !isPhase1Active && (
                    <p className="text-sm text-red-500">Phase-1 feedback period is not active at this time.</p>
                  )}
                  {feedbackType === "phase-2" && !isPhase2Active && (
                    <p className="text-sm text-red-500">Phase-2 feedback period is not active at this time.</p>
                  )}
                </div>

                {feedbackType &&
                  (feedbackType === "general" ||
                    (feedbackType === "phase-1" && isPhase1Active) ||
                    (feedbackType === "phase-2" && isPhase2Active)) && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="course">Select Course</Label>
                        <Select value={selectedCourse} onValueChange={setSelectedCourse} disabled={isLoading}>
                          <SelectTrigger id="course">
                            <SelectValue placeholder={isLoading ? "Loading courses..." : "Select a course"} />
                          </SelectTrigger>
                          <SelectContent>
                            {courses.map((course) => (
                              <SelectItem key={course.id} value={course.id}>
                                {course.code} - {course.name} ({course.component_type})
                                {course.batch && ` - Batch ${course.batch}`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {selectedCourse && selectedCourseData && (
                        <div className="space-y-2">
                          <Label>Instructor</Label>
                          <div className="p-2 bg-muted rounded-md">{selectedCourseData.faculty.name}</div>
                        </div>
                      )}

                      {selectedCourse && selectedCourseData && (
                        <div className="space-y-4">
                          <div className="border rounded-lg p-4">
                            <h3 className="font-medium mb-4">Please rate the following aspects:</h3>
                            <div className="space-y-6">
                              {feedbackQuestions.map((question, index) => (
                                <div
                                  key={index}
                                  className="grid grid-cols-1 md:grid-cols-[1fr,auto] gap-4 items-center"
                                >
                                  <Label className="text-sm">{question}</Label>
                                  <StarRating
                                    value={ratings[index]}
                                    onChange={(value) => handleRatingChange(index, value)}
                                    size="sm"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="message">Additional Comments (Optional)</Label>
                            <Textarea
                              id="message"
                              placeholder="Share any additional feedback or suggestions"
                              className="min-h-[100px]"
                              value={message}
                              onChange={(e) => setMessage(e.target.value)}
                            />
                          </div>

                          <div className="flex items-center space-x-2">
                            <Switch id="anonymous-mode" checked={isAnonymous} onCheckedChange={setIsAnonymous} />
                            <Label htmlFor="anonymous-mode" className="flex items-center gap-2">
                              <EyeOff className="h-4 w-4" />
                              Send anonymously
                              <span className="text-xs text-muted-foreground">
                                (Your name will not be visible to the instructor)
                              </span>
                            </Label>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                <Button
                  type="submit"
                  className="w-full gap-2"
                  disabled={
                    isSubmitting ||
                    !feedbackType ||
                    (feedbackType === "phase-1" && !isPhase1Active) ||
                    (feedbackType === "phase-2" && !isPhase2Active) ||
                    !selectedCourse ||
                    ratings.some((r) => r === 0)
                  }
                >
                  <Send className="h-4 w-4" />
                  <span>{isSubmitting ? "Submitting..." : "Submit Feedback"}</span>
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feedback History</CardTitle>
              <CardDescription>View your previous feedback submissions and responses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {feedbackHistory.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No feedback history available.</div>
                ) : (
                  feedbackHistory.map((feedback) => (
                    <Card key={feedback.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">
                              {feedback.subject_code} - {feedback.subject_name}
                            </CardTitle>
                            <CardDescription>
                              Faculty: {feedback.faculty_name} • {feedback.feedback_type} • Rating: {feedback.rating}/5
                              •{new Date(feedback.submitted_at).toLocaleDateString()}
                            </CardDescription>
                          </div>
                          <div
                            className={`px-2 py-1 rounded text-xs ${
                              feedback.status === "responded"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {feedback.status === "responded" ? "Responded" : "Pending"}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-medium text-sm">Your Feedback:</h4>
                            <p className="text-sm text-muted-foreground mt-1">{feedback.message}</p>
                          </div>
                          {feedback.response && (
                            <div>
                              <h4 className="font-medium text-sm">Faculty Response:</h4>
                              <p className="text-sm text-muted-foreground mt-1">{feedback.response}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Responded on: {new Date(feedback.responded_at!).toLocaleDateString()}
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
