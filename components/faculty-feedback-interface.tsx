"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { MessageSquare, Check, X, Star, Eye, Reply, Filter, Loader2 } from "lucide-react"

interface FacultyFeedback {
  id: string
  student_id: string
  student_name: string
  student_usn: string
  student_roll: string
  course_id: string
  subject_code: string
  subject_name: string
  message: string
  response: string | null
  rating: number
  feedback_type: string
  status: string
  submitted_at: string
  responded_at: string | null
  is_anonymous: boolean
}

interface Subject {
  id: string
  code: string
  name: string
  component_types: string[]
  sections: string[]
  academic_years: string[]
  semesters: number[]
}

interface FacultyFeedbackInterfaceProps {
  user: any
}

export function FacultyFeedbackInterface({ user }: FacultyFeedbackInterfaceProps) {
  const [feedbackData, setFeedbackData] = useState<FacultyFeedback[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [academicYears, setAcademicYears] = useState<string[]>([])

  // Filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedAcademicYear, setSelectedAcademicYear] = useState("all")
  const [selectedSemester, setSelectedSemester] = useState("all")
  const [selectedSection, setSelectedSection] = useState("all")
  const [selectedSubject, setSelectedSubject] = useState("all")
  const [selectedFeedbackType, setSelectedFeedbackType] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")

  // Dialog states
  const [isResponseDialogOpen, setIsResponseDialogOpen] = useState(false)
  const [selectedFeedback, setSelectedFeedback] = useState<FacultyFeedback | null>(null)
  const [responseText, setResponseText] = useState("")

  // Loading states
  const [loadingFeedback, setLoadingFeedback] = useState(false)
  const [loadingSubjects, setLoadingSubjects] = useState(false)
  const [loadingAcademicYears, setLoadingAcademicYears] = useState(false)
  const [submittingResponse, setSubmittingResponse] = useState(false)

  const semesters = [1, 2, 3, 4, 5, 6, 7, 8]
  const sections = ["A", "B", "C", "D"]

  useEffect(() => {
    if (user?.id) {
      loadAcademicYears()
      loadSubjects()
      loadFeedback()
    }
  }, [user?.id])

  // Reload feedback when filters change
  useEffect(() => {
    if (user?.id) {
      loadFeedback()
    }
  }, [selectedAcademicYear, selectedSemester, selectedSection, selectedSubject, selectedFeedbackType, selectedStatus])

  const loadAcademicYears = async () => {
    try {
      setLoadingAcademicYears(true)
      console.log("Fetching academic years...")

      const response = await fetch("/api/academic-years")
      console.log("Academic years response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Academic years response error:", errorText)
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }

      const data = await response.json()
      console.log("Academic years response data:", data)

      if (data.success) {
        setAcademicYears(data.data)
        console.log("Academic years set:", data.data)
      } else {
        throw new Error(data.error || "Failed to fetch academic years")
      }
    } catch (error) {
      console.error("Error fetching academic years:", error)

      // Set fallback academic years
      const currentYear = new Date().getFullYear()
      const fallbackYears = [
        `${currentYear}-${currentYear + 1}`,
        `${currentYear - 1}-${currentYear}`,
        `${currentYear - 2}-${currentYear - 1}`,
      ]
      setAcademicYears(fallbackYears)

      toast({
        title: "Warning",
        description: "Using fallback academic years. Please check your database connection.",
        variant: "destructive",
      })
    } finally {
      setLoadingAcademicYears(false)
    }
  }

  const loadSubjects = async () => {
    try {
      setLoadingSubjects(true)
      console.log("Loading subjects for faculty:", user.id)

      const params = new URLSearchParams()
      if (selectedAcademicYear && selectedAcademicYear !== "all") {
        params.append("academic_year", selectedAcademicYear)
      }
      if (selectedSemester && selectedSemester !== "all") {
        params.append("semester", selectedSemester)
      }
      if (selectedSection && selectedSection !== "all") {
        params.append("section", selectedSection)
      }

      const response = await fetch(`/api/feedback/faculty-subjects?${params}`, {
        headers: {
          "x-user-id": user.id,
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Subjects response error:", errorText)
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      console.log("Subjects response:", data)

      if (data.success) {
        setSubjects(data.data)
      } else {
        throw new Error(data.error || "Failed to load subjects")
      }
    } catch (error) {
      console.error("Error loading subjects:", error)
      toast({
        title: "Error",
        description: `Failed to load subjects: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setLoadingSubjects(false)
    }
  }

  const loadFeedback = async () => {
    try {
      setLoadingFeedback(true)
      console.log("Loading feedback for faculty:", user.id)

      const params = new URLSearchParams()
      if (selectedAcademicYear && selectedAcademicYear !== "all") {
        params.append("academic_year", selectedAcademicYear)
      }
      if (selectedSemester && selectedSemester !== "all") {
        params.append("semester", selectedSemester)
      }
      if (selectedSection && selectedSection !== "all") {
        params.append("section", selectedSection)
      }
      if (selectedSubject && selectedSubject !== "all") {
        params.append("subject_id", selectedSubject)
      }
      if (selectedFeedbackType && selectedFeedbackType !== "all") {
        params.append("feedback_type", selectedFeedbackType)
      }
      if (selectedStatus && selectedStatus !== "all") {
        params.append("status", selectedStatus)
      }

      const response = await fetch(`/api/feedback/faculty?${params}`, {
        headers: {
          "x-user-id": user.id,
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Feedback response error:", errorText)
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      console.log("Feedback response:", data)

      if (data.success) {
        setFeedbackData(data.data)
      } else {
        throw new Error(data.error || "Failed to load feedback")
      }
    } catch (error) {
      console.error("Error loading feedback:", error)
      toast({
        title: "Error",
        description: `Failed to load feedback: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setLoadingFeedback(false)
    }
  }

  const handleOpenResponseDialog = (feedback: FacultyFeedback) => {
    setSelectedFeedback(feedback)
    setResponseText(feedback.response || "")
    setIsResponseDialogOpen(true)
  }

  const handleSubmitResponse = async () => {
    if (!selectedFeedback || !responseText.trim()) {
      toast({
        title: "Error",
        description: "Please enter a response",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmittingResponse(true)
      console.log("Submitting response for feedback:", selectedFeedback.id)

      console.log("Sending response for feedback:", {
        feedbackId: selectedFeedback.id,
        response: responseText,
        facultyId: user.id, // This is the x-user-id header
      })

      const response = await fetch("/api/feedback/respond", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id,
        },
        body: JSON.stringify({
          feedbackId: selectedFeedback.id,
          response: responseText,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Response submission error:", errorText)
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      console.log("Response submission result:", data)

      if (data.success) {
        toast({
          title: "Success",
          description: "Response submitted successfully",
        })

        setIsResponseDialogOpen(false)
        setSelectedFeedback(null)
        setResponseText("")

        // Reload feedback to show updated status
        loadFeedback()
      } else {
        throw new Error(data.error || "Failed to submit response")
      }
    } catch (error) {
      console.error("Error submitting response:", error)
      toast({
        title: "Error",
        description: `Failed to submit response: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setSubmittingResponse(false)
    }
  }

  const filteredFeedback = feedbackData.filter((feedback) => {
    const matchesSearch =
      feedback.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.subject_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.message.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesSearch
  })

  const renderStarRating = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
          />
        ))}
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="text-amber-600 border-amber-600">
            Pending
          </Badge>
        )
      case "responded":
        return (
          <Badge variant="outline" className="text-green-600 border-green-600">
            Responded
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getFeedbackTypeBadge = (type: string) => {
    switch (type) {
      case "phase-1":
        return <Badge variant="secondary">Phase-1</Badge>
      case "phase-2":
        return <Badge variant="secondary">Phase-2</Badge>
      case "general":
        return <Badge variant="outline">General</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  const totalFeedback = filteredFeedback.length
  const respondedFeedback = filteredFeedback.filter((f) => f.status === "responded").length
  const pendingFeedback = filteredFeedback.filter((f) => f.status === "pending").length
  const averageRating =
    totalFeedback > 0 ? (filteredFeedback.reduce((sum, f) => sum + f.rating, 0) / totalFeedback).toFixed(1) : "0.0"

  return (
    <div className="space-y-6">
      {/* Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filter Feedback</span>
          </CardTitle>
          <CardDescription>Select criteria to view student feedback</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="academic-year">Academic Year</Label>
              <Select
                value={selectedAcademicYear}
                onValueChange={setSelectedAcademicYear}
                disabled={loadingAcademicYears}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingAcademicYears ? "Loading..." : "Select Academic Year"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Academic Years</SelectItem>
                  {academicYears.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="semester">Semester</Label>
              <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                <SelectTrigger>
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Semesters</SelectItem>
                  {semesters.map((sem) => (
                    <SelectItem key={sem} value={sem.toString()}>
                      Semester {sem}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="section">Section</Label>
              <Select value={selectedSection} onValueChange={setSelectedSection}>
                <SelectTrigger>
                  <SelectValue placeholder="Select section" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sections</SelectItem>
                  {sections.map((section) => (
                    <SelectItem key={section} value={section}>
                      Section {section}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject} disabled={loadingSubjects}>
                <SelectTrigger>
                  <SelectValue placeholder={loadingSubjects ? "Loading..." : "Select subject"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.code} - {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback-type">Feedback Type</Label>
              <Select value={selectedFeedbackType} onValueChange={setSelectedFeedbackType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select feedback type" />
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

          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search by student name, subject, or message..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="responded">Responded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={loadFeedback} disabled={loadingFeedback} className="w-full">
            {loadingFeedback ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Loading Feedback...
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                View Feedback
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
            <MessageSquare className="h-4 w-4 text-blue-500 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFeedback}</div>
            <p className="text-xs text-muted-foreground">Feedback received</p>
          </CardContent>
        </Card>

        <Card className="bg-green-50 dark:bg-green-900/20 border-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Responded</CardTitle>
            <Check className="h-4 w-4 text-green-500 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{respondedFeedback}</div>
            <p className="text-xs text-muted-foreground">Feedback responded to</p>
          </CardContent>
        </Card>

        <Card className="bg-amber-50 dark:bg-amber-900/20 border-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <X className="h-4 w-4 text-amber-500 dark:text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingFeedback}</div>
            <p className="text-xs text-muted-foreground">Awaiting response</p>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 dark:bg-purple-900/20 border-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-purple-500 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageRating}</div>
            <p className="text-xs text-muted-foreground">Out of 5 stars</p>
          </CardContent>
        </Card>
      </div>

      {/* Feedback Table */}
      <Card>
        <CardHeader>
          <CardTitle>Student Feedback</CardTitle>
          <CardDescription>
            {filteredFeedback.length > 0
              ? `Showing ${filteredFeedback.length} feedback entries`
              : "No feedback found for the selected criteria"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredFeedback.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFeedback.map((feedback) => (
                    <TableRow key={feedback.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {feedback.is_anonymous ? "Anonymous Student" : feedback.student_name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {feedback.is_anonymous
                              ? "Anonymous | Anonymous"
                              : `${feedback.student_usn} | ${feedback.student_roll}`}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{feedback.subject_code}</div>
                          <div className="text-sm text-muted-foreground">{feedback.subject_name}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getFeedbackTypeBadge(feedback.feedback_type)}</TableCell>
                      <TableCell>{renderStarRating(feedback.rating)}</TableCell>
                      <TableCell>{getStatusBadge(feedback.status)}</TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate" title={feedback.message}>
                          {feedback.message}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{new Date(feedback.submitted_at).toLocaleDateString()}</div>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" onClick={() => handleOpenResponseDialog(feedback)}>
                          <Reply className="h-4 w-4 mr-1" />
                          {feedback.status === "responded" ? "Edit Response" : "Respond"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <div className="text-muted-foreground">No feedback found for the selected criteria</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Response Dialog */}
      <Dialog open={isResponseDialogOpen} onOpenChange={setIsResponseDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {selectedFeedback?.status === "responded" ? "Edit Response" : "Respond to Feedback"}
            </DialogTitle>
            <DialogDescription>
              {selectedFeedback?.status === "responded"
                ? "Update your response to this student's feedback"
                : "Provide a response to this student's feedback"}
            </DialogDescription>
          </DialogHeader>

          {selectedFeedback && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Student</Label>
                <div className="text-sm">
                  {selectedFeedback.is_anonymous
                    ? "Anonymous Student"
                    : `${selectedFeedback.student_name} (${selectedFeedback.student_usn})`}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Subject</Label>
                <div className="text-sm">
                  {selectedFeedback.subject_code} - {selectedFeedback.subject_name}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Rating</Label>
                <div className="text-sm">{renderStarRating(selectedFeedback.rating)}</div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Student Message</Label>
                <div className="text-sm p-3 bg-slate-50 dark:bg-slate-900/50 rounded-md">
                  {selectedFeedback.message}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="response" className="text-sm font-medium">
                  Your Response
                </Label>
                <Textarea
                  id="response"
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Type your response here..."
                  className="min-h-[120px]"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResponseDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitResponse} disabled={submittingResponse || !responseText.trim()}>
              {submittingResponse ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <Reply className="h-4 w-4 mr-2" />
                  {selectedFeedback?.status === "responded" ? "Update Response" : "Submit Response"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
