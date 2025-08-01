"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/hooks/use-toast"
import { Loader2, Upload, Users, GraduationCap, Calculator, FileText } from "lucide-react"

interface CourseStudent {
  student_id: string
  student_name: string
  usn: string
  roll_number: string
  email: string
  target_course_ids: string[]
  enrollment_batch?: string
  course_batch?: string
}

interface FacultyCourse {
  course_id: string
  subject_id: string
  subject_code: string
  subject_name: string
  component_type: string
  semester: number
  section: string
  academic_year: string
  batches: string[]
  course_ids: string[]
}

interface StudentMark {
  student_id: string
  obtained_marks: number
}

interface ExistingMark {
  student_id: string
  obtained_marks: number
  max_marks: number
  assessment_date: string
}

interface FinalReportData {
  student_id: string
  student_name: string
  usn: string
  ia_average: number
  assignment_average: number
  final_total: number
  grade: string
}

export default function UploadMarksPage() {
  const [academicYears, setAcademicYears] = useState<string[]>([])
  const [courses, setCourses] = useState<FacultyCourse[]>([])
  const [students, setStudents] = useState<CourseStudent[]>([])
  const [marks, setMarks] = useState<Record<string, number>>({})
  const [finalReportData, setFinalReportData] = useState<FinalReportData[]>([])
  const [user, setUser] = useState<any>(null)

  const [selectedAcademicYear, setSelectedAcademicYear] = useState("")
  const [selectedSemester, setSelectedSemester] = useState("")
  const [selectedSection, setSelectedSection] = useState("")
  const [selectedCourse, setSelectedCourse] = useState("")
  const [selectedBatch, setSelectedBatch] = useState("")
  const [selectedAssessmentType, setSelectedAssessmentType] = useState("")
  const [maxMarks, setMaxMarks] = useState(30)
  const [activeTab, setActiveTab] = useState("ia-marks")

  const [loadingAcademicYears, setLoadingAcademicYears] = useState(true)
  const [loadingCourses, setLoadingCourses] = useState(false)
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [savingMarks, setSavingMarks] = useState(false)
  const [loadingFinalReport, setLoadingFinalReport] = useState(false)
  const [marksSavedForCurrentSelection, setMarksSavedForCurrentSelection] = useState(false)
  const [loadingExistingMarks, setLoadingExistingMarks] = useState(false)

  // Assessment types based on active tab
  const getAssessmentTypes = () => {
    switch (activeTab) {
      case "ia-marks":
        return [
          { value: "IA1", label: "IA Test 1" },
          { value: "IA2", label: "IA Test 2" },
          { value: "IA3", label: "IA Test 3" },
        ]
      case "assignment-marks":
        return [
          { value: "Assignment1", label: "Assignment 1" },
          { value: "Assignment2", label: "Assignment 2" },
          { value: "Assignment3", label: "Assignment 3" },
          { value: "Assignment4", label: "Assignment 4" },
          { value: "Assignment5", label: "Assignment 5" },
        ]
      default:
        return []
    }
  }

  const semesters = [1, 2, 3, 4, 5, 6, 7, 8]
  const sections = ["A", "B", "C", "D"]

  // Get selected course details
  const selectedCourseDetails = courses.find((c) => c.course_id === selectedCourse)
  const isLabCourse = selectedCourseDetails?.component_type === "lab"
  const availableBatches = selectedCourseDetails?.batches || []

  // Fetch academic years on component mount
  useEffect(() => {
    fetchAcademicYears()
  }, [])

  // Fetch courses when filters change
  useEffect(() => {
    if (selectedAcademicYear && selectedSemester && selectedSection) {
      fetchCourses()
    } else {
      setCourses([])
      setSelectedCourse("")
    }
  }, [selectedAcademicYear, selectedSemester, selectedSection])

  // Reset batch and assessment type when course changes
  useEffect(() => {
    setSelectedBatch("")
    setSelectedAssessmentType("")
    setStudents([])
    setMarks({})
    setMarksSavedForCurrentSelection(false)
  }, [selectedCourse])

  // Reset assessment type when tab changes
  useEffect(() => {
    setSelectedAssessmentType("")
    setMarksSavedForCurrentSelection(false)
    setMarks({})
  }, [activeTab])

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  const fetchAcademicYears = async () => {
    try {
      setLoadingAcademicYears(true)
      console.log("Fetching academic years...")

      const response = await fetch("/api/academic-years")
      console.log("Response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Response error:", errorText)
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }

      const data = await response.json()
      console.log("Response data:", data)

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

  const fetchCourses = async () => {
    try {
      setLoadingCourses(true)
      const params = new URLSearchParams({
        academic_year: selectedAcademicYear,
        semester: selectedSemester,
        section: selectedSection,
      })

      console.log("Fetching courses with params:", params.toString())
      const response = await fetch(`/api/marks/faculty-courses?${params}`, {
        headers: {
          "x-user-id": user?.id || "",
        },
      })

      console.log("Response status:", response.status)
      console.log("Response headers:", response.headers.get("content-type"))

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Response error:", errorText)
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      console.log("Response data:", data)

      if (data.success) {
        setCourses(data.data)
        console.log("Courses set:", data.data.length)
      } else {
        throw new Error(data.error || "Failed to fetch courses")
      }
    } catch (error) {
      console.error("Error fetching courses:", error)
      toast({
        title: "Error",
        description: `Failed to fetch courses: ${error.message}`,
        variant: "destructive",
      })
      setCourses([]) // Reset courses on error
    } finally {
      setLoadingCourses(false)
    }
  }

  const fetchExistingMarks = async () => {
    if (!selectedCourse || !selectedAssessmentType || !user?.id) {
      console.log("[FRONTEND] Missing required data for fetching existing marks:", {
        selectedCourse,
        selectedAssessmentType,
        userId: user?.id,
      })
      return
    }

    try {
      setLoadingExistingMarks(true)
      console.log("[FRONTEND] Fetching existing marks for:", {
        courseId: selectedCourse,
        assessmentType: selectedAssessmentType,
        batch: selectedBatch,
        userId: user.id,
      })

      const params = new URLSearchParams({
        course_id: selectedCourse,
        assessment_type: selectedAssessmentType,
      })

      if (selectedBatch && selectedBatch.trim() !== "") {
        params.append("batch", selectedBatch)
      }

      const url = `/api/marks/existing?${params}`
      console.log("[FRONTEND] Fetching from URL:", url)

      const response = await fetch(url, {
        headers: {
          "x-user-id": user.id,
        },
      })

      console.log("[FRONTEND] Existing marks response status:", response.status)
      console.log("[FRONTEND] Existing marks response headers:", response.headers.get("content-type"))

      // Always try to get the response text first
      const responseText = await response.text()
      console.log("[FRONTEND] Raw response text:", responseText)

      if (!response.ok) {
        console.error("[FRONTEND] Existing marks response error:", responseText)

        // Try to parse as JSON to get more details
        let errorMessage = "Unknown error"
        try {
          const errorData = JSON.parse(responseText)
          console.error("[FRONTEND] Parsed error data:", errorData)
          errorMessage = errorData.error || errorData.message || "Unknown error"
        } catch (parseError) {
          console.error("[FRONTEND] Could not parse error response as JSON:", parseError)
          errorMessage = responseText || "Unknown error"
        }

        console.log("[FRONTEND] Setting marks saved to false due to error")
        setMarksSavedForCurrentSelection(false)
        setMarks({})

        // Don't show toast for 404 or when no marks exist
        if (response.status !== 404) {
          toast({
            title: "Warning",
            description: `Could not load existing marks: ${errorMessage}`,
            variant: "destructive",
          })
        }
        return
      }

      // Try to parse the successful response
      let data
      try {
        data = JSON.parse(responseText)
        console.log("[FRONTEND] Existing marks response data:", data)
      } catch (parseError) {
        console.error("[FRONTEND] Could not parse successful response as JSON:", parseError)
        setMarksSavedForCurrentSelection(false)
        setMarks({})
        toast({
          title: "Warning",
          description: "Received invalid response format when loading existing marks",
          variant: "destructive",
        })
        return
      }

      if (data.success) {
        if (data.data && data.data.length > 0) {
          // Create a map of student_id to marks
          const existingMarksMap: Record<string, number> = {}
          let hasExistingMarks = false

          data.data.forEach((mark: ExistingMark) => {
            existingMarksMap[mark.student_id] = mark.obtained_marks
            hasExistingMarks = true
          })

          if (hasExistingMarks) {
            console.log("[FRONTEND] Setting existing marks:", existingMarksMap)
            setMarks(existingMarksMap)
            setMarksSavedForCurrentSelection(true)

            toast({
              title: "Existing Marks Loaded",
              description: `Found existing marks for ${data.data.length} students`,
            })
          } else {
            console.log("[FRONTEND] No existing marks found")
            setMarksSavedForCurrentSelection(false)
            setMarks({})
          }
        } else {
          console.log("[FRONTEND] No existing marks data")
          setMarksSavedForCurrentSelection(false)
          setMarks({})
        }
      } else {
        console.log("[FRONTEND] API returned success=false:", data.error)
        setMarksSavedForCurrentSelection(false)
        setMarks({})

        if (data.error) {
          toast({
            title: "Warning",
            description: `Could not load existing marks: ${data.error}`,
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      console.error("[FRONTEND] Error fetching existing marks:", error)
      setMarksSavedForCurrentSelection(false)
      setMarks({})

      toast({
        title: "Warning",
        description: "Could not load existing marks. Continuing with empty marks.",
        variant: "destructive",
      })
    } finally {
      setLoadingExistingMarks(false)
    }
  }

  const loadStudents = async () => {
    if (!selectedCourse) {
      toast({
        title: "Error",
        description: "Please select a subject first",
        variant: "destructive",
      })
      return
    }

    if (isLabCourse && !selectedBatch) {
      toast({
        title: "Error",
        description: "Please select a batch for lab subjects",
        variant: "destructive",
      })
      return
    }

    try {
      setLoadingStudents(true)
      console.log("Loading students for course:", selectedCourse, "batch:", selectedBatch)

      const params = new URLSearchParams({
        course_id: selectedCourse,
      })

      if (selectedBatch) {
        params.append("batch", selectedBatch)
      }

      const response = await fetch(`/api/marks/course-students?${params}`, {
        headers: {
          "x-user-id": user?.id || "",
        },
      })

      console.log("Students response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Students response error:", errorText)
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      console.log("Students response data:", data)

      if (data.success) {
        setStudents(data.data)
        // Don't reset marks here - we want to preserve them
        // setMarks({}) // Reset marks when loading new students
        // setMarksSavedForCurrentSelection(false) // Reset saved status

        toast({
          title: "Success",
          description: `Loaded ${data.data.length} students${selectedBatch ? ` for batch ${selectedBatch}` : ""}`,
        })

        // After loading students, fetch existing marks if assessment type is selected
        if (selectedAssessmentType) {
          await fetchExistingMarks()
        }
      } else {
        throw new Error(data.error || "Failed to load students")
      }
    } catch (error) {
      console.error("Error loading students:", error)
      toast({
        title: "Error",
        description: `Failed to load students: ${error.message}`,
        variant: "destructive",
      })
      setStudents([]) // Reset students on error
    } finally {
      setLoadingStudents(false)
    }
  }

  // Fetch existing marks when assessment type changes and students are loaded
  useEffect(() => {
    if (selectedCourse && selectedAssessmentType && students.length > 0) {
      fetchExistingMarks()
    }
  }, [selectedCourse, selectedAssessmentType, selectedBatch, students.length])

  const handleMarkChange = (studentId: string, mark: string) => {
    const numericMark = Number.parseInt(mark) || 0
    if (numericMark >= 0 && numericMark <= maxMarks) {
      setMarks((prev) => ({
        ...prev,
        [studentId]: numericMark,
      }))
    }
  }

  const saveMarks = async () => {
    if (!selectedCourse || !selectedAssessmentType) {
      toast({
        title: "Error",
        description: "Please select subject and assessment type",
        variant: "destructive",
      })
      return
    }

    if (isLabCourse && !selectedBatch) {
      toast({
        title: "Error",
        description: "Please select a batch for lab subjects",
        variant: "destructive",
      })
      return
    }

    // Create marks array with correct course IDs for each student
    const marksToSave = Object.entries(marks)
      .filter(([_, mark]) => mark !== undefined && mark >= 0)
      .map(([studentId, obtainedMarks]) => {
        const student = students.find((s) => s.student_id === studentId)
        if (!student || !student.target_course_ids || student.target_course_ids.length === 0) {
          console.error("No target course IDs found for student:", studentId)
          return null
        }

        // Use the first target course ID for this student
        const targetCourseId = student.target_course_ids[0]

        return {
          studentId,
          courseId: targetCourseId, // Use the student's actual course ID
          assessmentType: selectedAssessmentType,
          maxMarks,
          obtainedMarks,
          assessmentDate: new Date().toISOString().split("T")[0],
        }
      })
      .filter(Boolean)

    if (marksToSave.length === 0) {
      toast({
        title: "Error",
        description: "Please enter marks for at least one student",
        variant: "destructive",
      })
      return
    }

    try {
      setSavingMarks(true)
      console.log("Saving marks:", marksToSave)

      const response = await fetch("/api/marks/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user?.id || "",
        },
        body: JSON.stringify({ marks: marksToSave }),
      })

      console.log("Save marks response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Save marks response error:", errorText)
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      console.log("Save marks response data:", data)

      if (data.success) {
        toast({
          title: "Success",
          description: `Marks ${marksSavedForCurrentSelection ? "updated" : "saved"} for ${marksToSave.length} students${selectedBatch ? ` in batch ${selectedBatch}` : ""}`,
        })
        setMarksSavedForCurrentSelection(true)
      } else {
        throw new Error(data.error || "Failed to save marks")
      }
    } catch (error) {
      console.error("Error saving marks:", error)
      toast({
        title: "Error",
        description: `Failed to save marks: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setSavingMarks(false)
    }
  }

  const loadFinalReport = async () => {
    if (!selectedCourse) {
      toast({
        title: "Error",
        description: "Please select a subject first",
        variant: "destructive",
      })
      return
    }

    try {
      setLoadingFinalReport(true)
      console.log("Loading final report for course:", selectedCourse)

      const params = new URLSearchParams({
        course_id: selectedCourse,
      })

      if (selectedBatch) {
        params.append("batch", selectedBatch)
      }

      const response = await fetch(`/api/marks/final-report?${params}`, {
        headers: {
          "x-user-id": user?.id || "",
        },
      })

      console.log("Final report response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Final report response error:", errorText)
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      console.log("Final report response data:", data)

      if (data.success) {
        setFinalReportData(data.data)
        toast({
          title: "Success",
          description: `Final report loaded for ${data.data.length} students${selectedBatch ? ` in batch ${selectedBatch}` : ""}`,
        })
      } else {
        throw new Error(data.error || "Failed to load final report")
      }
    } catch (error) {
      console.error("Error loading final report:", error)
      toast({
        title: "Error",
        description: `Failed to load final report: ${error.message}`,
        variant: "destructive",
      })
      setFinalReportData([]) // Reset final report data on error
    } finally {
      setLoadingFinalReport(false)
    }
  }

  const getGradeVariant = (grade: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (grade) {
      case "Excellent":
        return "default"
      case "Good":
        return "secondary"
      case "Average":
        return "outline"
      default:
        return "destructive"
    }
  }

  const renderSelectionFilters = () => (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      <div className="space-y-2">
        <Label htmlFor="academic-year">Academic Year</Label>
        <Select value={selectedAcademicYear} onValueChange={setSelectedAcademicYear} disabled={loadingAcademicYears}>
          <SelectTrigger>
            <SelectValue placeholder={loadingAcademicYears ? "Loading..." : "Select academic year"} />
          </SelectTrigger>
          <SelectContent>
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
            {sections.map((section) => (
              <SelectItem key={section} value={section}>
                Section {section}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="subject">Subject</Label>
        <Select
          value={selectedCourse}
          onValueChange={setSelectedCourse}
          disabled={loadingCourses || courses.length === 0}
        >
          <SelectTrigger>
            <SelectValue placeholder={loadingCourses ? "Loading..." : "Select subject"} />
          </SelectTrigger>
          <SelectContent>
            {courses.map((course) => (
              <SelectItem key={course.course_id} value={course.course_id}>
                {course.subject_code} - {course.subject_name} ({course.component_type})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Batch dropdown - only show for lab courses */}
      {isLabCourse && (
        <div className="space-y-2">
          <Label htmlFor="batch">Batch</Label>
          <Select
            value={selectedBatch}
            onValueChange={setSelectedBatch}
            disabled={!selectedCourse || availableBatches.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select batch" />
            </SelectTrigger>
            <SelectContent>
              {availableBatches.map((batch) => (
                <SelectItem key={batch} value={batch}>
                  Batch {batch}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  )

  const renderCourseDetails = () => {
    if (!selectedCourseDetails) return null

    return (
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <div>
              <div className="font-medium">Subject:</div>
              <div>
                {selectedCourseDetails.subject_code} - {selectedCourseDetails.subject_name}
              </div>
            </div>
            <div>
              <div className="font-medium">Type:</div>
              <div>{selectedCourseDetails.component_type}</div>
            </div>
            <div>
              <div className="font-medium">Semester:</div>
              <div>{selectedCourseDetails.semester}</div>
            </div>
            <div>
              <div className="font-medium">Section:</div>
              <div>{selectedCourseDetails.section}</div>
            </div>
            {selectedBatch && (
              <div>
                <div className="font-medium">Batch:</div>
                <div>{selectedBatch}</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Marks Management</h1>
          <div className="text-muted-foreground">Manage student marks and assessments</div>
        </div>
        <div className="flex items-center space-x-2">
          <Upload className="h-5 w-5" />
          <span className="text-sm font-medium">Upload Marks</span>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="ia-marks">IA Test Marks</TabsTrigger>
          <TabsTrigger value="assignment-marks">Assignment Marks</TabsTrigger>
          <TabsTrigger value="final-report">Final Report</TabsTrigger>
        </TabsList>

        <TabsContent value="ia-marks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <GraduationCap className="h-5 w-5" />
                <span>Batch Edit IA Test Marks</span>
              </CardTitle>
              <CardDescription>
                Select academic year, semester, section and subject to edit IA test marks for all students at once
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Selection Filters */}
              {renderSelectionFilters()}

              {/* Assessment Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="assessment-type">IA Test</Label>
                  <Select value={selectedAssessmentType} onValueChange={setSelectedAssessmentType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select IA test" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAssessmentTypes().map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max-marks">Maximum Marks</Label>
                  <Input
                    id="max-marks"
                    type="number"
                    value={maxMarks}
                    onChange={(e) => setMaxMarks(Number.parseInt(e.target.value) || 30)}
                    min="1"
                    max="100"
                  />
                </div>
              </div>

              {/* Load Students Button */}
              <div className="flex justify-center">
                <Button
                  onClick={loadStudents}
                  disabled={!selectedCourse || (isLabCourse && !selectedBatch) || loadingStudents}
                  className="flex items-center space-x-2"
                >
                  {loadingStudents ? <Loader2 className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />}
                  <span>{loadingStudents ? "Loading Students..." : "Load Students"}</span>
                </Button>
              </div>

              {/* Course Details */}
              {renderCourseDetails()}

              {/* Loading indicator for existing marks */}
              {loadingExistingMarks && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm text-muted-foreground">Loading existing marks...</span>
                </div>
              )}

              {/* Students Table */}
              {students.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>IA Test Marks Entry{selectedBatch ? ` - Batch ${selectedBatch}` : ""}</span>
                      <Badge variant="secondary">{students.length} Students</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Roll No.</TableHead>
                            <TableHead>USN</TableHead>
                            <TableHead>Student Name</TableHead>
                            <TableHead className="text-center">Marks (out of {maxMarks})</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {students.map((student) => (
                            <TableRow key={student.student_id}>
                              <TableCell className="font-medium">{student.roll_number}</TableCell>
                              <TableCell>{student.usn}</TableCell>
                              <TableCell>{student.student_name}</TableCell>
                              <TableCell className="text-center">
                                <Input
                                  type="number"
                                  min="0"
                                  max={maxMarks}
                                  value={marks[student.student_id] || ""}
                                  onChange={(e) => handleMarkChange(student.student_id, e.target.value)}
                                  className="w-20 text-center"
                                  placeholder="0"
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    <div className="flex justify-end mt-6">
                      <Button
                        onClick={saveMarks}
                        disabled={savingMarks || Object.keys(marks).length === 0}
                        className="flex items-center space-x-2"
                      >
                        {savingMarks ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                        <span>
                          {savingMarks ? "Saving..." : marksSavedForCurrentSelection ? "Update Marks" : "Save Marks"}
                        </span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignment-marks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Assignment Marks</span>
              </CardTitle>
              <CardDescription>Upload and manage assignment marks for students</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Selection Filters */}
              {renderSelectionFilters()}

              {/* Assignment Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="assignment-type">Assignment</Label>
                  <Select value={selectedAssessmentType} onValueChange={setSelectedAssessmentType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select assignment" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAssessmentTypes().map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max-marks">Maximum Marks</Label>
                  <Input
                    id="max-marks"
                    type="number"
                    value={maxMarks}
                    onChange={(e) => setMaxMarks(Number.parseInt(e.target.value) || 30)}
                    min="1"
                    max="100"
                  />
                </div>
              </div>

              {/* Load Students Button */}
              <div className="flex justify-center">
                <Button
                  onClick={loadStudents}
                  disabled={!selectedCourse || (isLabCourse && !selectedBatch) || loadingStudents}
                  className="flex items-center space-x-2"
                >
                  {loadingStudents ? <Loader2 className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />}
                  <span>{loadingStudents ? "Loading Students..." : "Load Students"}</span>
                </Button>
              </div>

              {/* Course Details */}
              {renderCourseDetails()}

              {/* Loading indicator for existing marks */}
              {loadingExistingMarks && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm text-muted-foreground">Loading existing marks...</span>
                </div>
              )}

              {/* Students Table for Assignment Marks */}
              {students.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Assignment Marks Entry{selectedBatch ? ` - Batch ${selectedBatch}` : ""}</span>
                      <Badge variant="secondary">{students.length} Students</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Roll No.</TableHead>
                            <TableHead>USN</TableHead>
                            <TableHead>Student Name</TableHead>
                            <TableHead className="text-center">Marks (out of {maxMarks})</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {students.map((student) => (
                            <TableRow key={student.student_id}>
                              <TableCell className="font-medium">{student.roll_number}</TableCell>
                              <TableCell>{student.usn}</TableCell>
                              <TableCell>{student.student_name}</TableCell>
                              <TableCell className="text-center">
                                <Input
                                  type="number"
                                  min="0"
                                  max={maxMarks}
                                  value={marks[student.student_id] || ""}
                                  onChange={(e) => handleMarkChange(student.student_id, e.target.value)}
                                  className="w-20 text-center"
                                  placeholder="0"
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    <div className="flex justify-end mt-6">
                      <Button
                        onClick={saveMarks}
                        disabled={savingMarks || Object.keys(marks).length === 0}
                        className="flex items-center space-x-2"
                      >
                        {savingMarks ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                        <span>
                          {savingMarks ? "Saving..." : marksSavedForCurrentSelection ? "Update Marks" : "Save Marks"}
                        </span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="final-report" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calculator className="h-5 w-5" />
                <span>Final Report</span>
              </CardTitle>
              <CardDescription>
                Auto-calculated final marks report (50% IA Average + 50% Assignment Average)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Selection Filters */}
              {renderSelectionFilters()}

              {/* Generate Report Button */}
              <div className="flex justify-center">
                <Button
                  onClick={loadFinalReport}
                  disabled={!selectedCourse || (isLabCourse && !selectedBatch) || loadingFinalReport}
                  className="flex items-center space-x-2"
                >
                  {loadingFinalReport ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Calculator className="h-4 w-4" />
                  )}
                  <span>{loadingFinalReport ? "Generating Report..." : "Generate Final Report"}</span>
                </Button>
              </div>

              {/* Course Details */}
              {renderCourseDetails()}

              {/* Final Report Table */}
              {finalReportData.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Final Marks Report{selectedBatch ? ` - Batch ${selectedBatch}` : ""}</span>
                      <Badge variant="secondary">{finalReportData.length} Students</Badge>
                    </CardTitle>
                    <CardDescription>
                      Final marks calculated as: 50% IA Average + 50% Assignment Average
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>USN</TableHead>
                            <TableHead>Student Name</TableHead>
                            <TableHead className="text-center">IA Average (50%)</TableHead>
                            <TableHead className="text-center">Assignment Average (50%)</TableHead>
                            <TableHead className="text-center">Final Total</TableHead>
                            <TableHead className="text-center">Grade</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {finalReportData.map((student) => (
                            <TableRow key={student.student_id}>
                              <TableCell className="font-medium">{student.usn}</TableCell>
                              <TableCell>{student.student_name}</TableCell>
                              <TableCell className="text-center">{student.ia_average.toFixed(1)}%</TableCell>
                              <TableCell className="text-center">{student.assignment_average.toFixed(1)}%</TableCell>
                              <TableCell className="text-center font-bold">{student.final_total.toFixed(1)}%</TableCell>
                              <TableCell className="text-center">
                                <Badge variant={getGradeVariant(student.grade)}>{student.grade}</Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {finalReportData.length === 0 && selectedCourse && (
                <div className="text-center py-8">
                  <Calculator className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <div className="text-muted-foreground">Click "Generate Final Report" to view calculated marks</div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
