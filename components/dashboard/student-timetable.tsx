"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar, Clock, MapPin, User, BookOpen, RefreshCw, AlertCircle, GraduationCap, Users } from 'lucide-react'
import { supabase } from "@/lib/supabase"

// Enhanced color palette with classic and good-looking colors for different subjects
const subjectColorPalette = [
  "#2563eb", // Classic Blue
  "#dc2626", // Classic Red
  "#16a34a", // Classic Green
  "#ca8a04", // Classic Gold
  "#9333ea", // Classic Purple
  "#c2410c", // Classic Orange
  "#0891b2", // Classic Cyan
  "#be123c", // Classic Rose
  "#4338ca", // Classic Indigo
  "#059669", // Classic Emerald
  "#7c2d12", // Classic Brown
  "#1e40af", // Deep Blue
  "#b91c1c", // Deep Red
  "#15803d", // Deep Green
  "#a16207", // Deep Amber
  "#7c3aed", // Deep Violet
  "#ea580c", // Deep Orange
  "#0e7490", // Deep Cyan
  "#be185d", // Deep Pink
  "#3730a3", // Deep Indigo
  "#047857", // Deep Teal
  "#92400e", // Deep Orange-Brown
  "#1d4ed8", // Bright Blue
  "#dc2626", // Bright Red
  "#22c55e", // Bright Green
]

// Function to get consistent color for a subject with better distribution
const getSubjectColor = (subjectCode: string): string => {
  // Create a more sophisticated hash from the subject code
  let hash = 0
  for (let i = 0; i < subjectCode.length; i++) {
    const char = subjectCode.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }

  // Use absolute value and modulo to get a consistent index
  const colorIndex = Math.abs(hash) % subjectColorPalette.length
  return subjectColorPalette[colorIndex]
}

interface TimeSlot {
  id: string
  start: string
  end: string
  isBreak?: boolean
  breakType?: "coffee" | "lunch"
}

interface ClassEntry {
  id: string
  subjectId: string
  subjectCode: string
  subjectName: string
  shortName: string
  componentType: "theory" | "lab" | "project"
  facultyNames: string[]
  facultyShortNames: string[]
  lab?: string
  batch?: string
  color: string
  hasTheory: boolean
  hasLab: boolean
  section?: string // Add section info to track which section this class belongs to
  roomNumber?: string // Add room number for cross-section classes
}

interface TimetableCell {
  id: string
  day: string
  timeSlotId: string
  classEntries: ClassEntry[]
  isBreak?: boolean
  breakType?: "coffee" | "lunch"
  classEntry?: ClassEntry // Legacy support
}

interface TimetableData {
  id: string
  academicYear: string
  semester: string
  section: string
  roomNumber: string
  timeSlots: TimeSlot[]
  days: string[]
  cells: TimetableCell[]
}

interface StudentInfo {
  semester: string
  section: string
  department: string
  rollNumber: string
  usn: string
  batch?: string
  firstName: string
  lastName: string
}

interface StudentEnrollment {
  course_id: string
  subject_id: string
  subject_code: string
  subject_name: string
  component_type: "theory" | "lab" | "project"
  batch?: string
  faculty_name: string
  semester: number
  section: string
  academic_year: string
  enrollment_date: string
  is_active: boolean
}

export function StudentTimetable() {
  const [timetableData, setTimetableData] = useState<TimetableData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeDay, setActiveDay] = useState<string>("Mon")
  const [error, setError] = useState<string | null>(null)
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null)
  const [studentEnrollments, setStudentEnrollments] = useState<StudentEnrollment[]>([])
  const [crossSectionEnrollments, setCrossSectionEnrollments] = useState<string[]>([])

  // Time slots - same as create-timetable
  const timeSlots: TimeSlot[] = [
    { id: "slot1", start: "8:30", end: "9:30" },
    { id: "slot2", start: "9:30", end: "10:30" },
    { id: "slot3", start: "10:30", end: "10:50", isBreak: true, breakType: "coffee" },
    { id: "slot4", start: "10:50", end: "11:50" },
    { id: "slot5", start: "11:50", end: "12:50" },
    { id: "slot6", start: "12:50", end: "1:30", isBreak: true, breakType: "lunch" },
    { id: "slot7", start: "1:30", end: "2:25" },
    { id: "slot8", start: "2:25", end: "3:20" },
    { id: "slot9", start: "3:20", end: "4:10" },
  ]

  // Days of the week
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        setLoading(true)
        setError(null)

        // Get current user data
        const user = localStorage.getItem("user")
        if (!user) {
          throw new Error("Please log in to view your timetable.")
        }

        const userData = JSON.parse(user)
        console.log("Current user:", userData)

        // Get student data
        const { data: studentData, error: studentError } = await supabase
          .from("students")
          .select(`
            user_id,
            usn,
            roll_number,
            semester,
            section,
            batch
          `)
          .eq("user_id", userData.id)
          .single()

        if (studentError || !studentData) {
          console.error("Error fetching student data:", studentError)
          throw new Error("Could not fetch your student information. Please contact support.")
        }

        // Get user data separately
        const { data: userInfo, error: userError } = await supabase
          .from("users")
          .select(`
            id,
            first_name,
            last_name,
            department,
            role
          `)
          .eq("id", userData.id)
          .single()

        if (userError || !userInfo) {
          console.error("Error fetching user data:", userError)
          throw new Error("Could not fetch your user information. Please contact support.")
        }

        console.log("Student data:", studentData)
        console.log("User data:", userInfo)

        const studentInfo: StudentInfo = {
          semester: studentData.semester?.toString() || "1",
          section: studentData.section || "A",
          department: userInfo.department || "Unknown",
          rollNumber: studentData.roll_number || "N/A",
          usn: studentData.usn || "N/A",
          batch: studentData.batch,
          firstName: userInfo.first_name || "",
          lastName: userInfo.last_name || "",
        }

        setStudentInfo(studentInfo)

        console.log("Fetching enrollments for:", {
          semester: studentInfo.semester,
          section: studentInfo.section,
        })

        // Get student's actual enrolled subjects using the enhanced function
        const { data: enrollments, error: enrollmentsError } = await supabase.rpc("get_student_enrolled_subjects", {
          student_user_id: userData.id,
        })

        if (enrollmentsError) {
          console.error("Error fetching student enrollments:", enrollmentsError)
          throw new Error("Could not load your course enrollments. Please contact support.")
        }

        console.log("Student enrollments:", enrollments)

        if (!enrollments || enrollments.length === 0) {
          setError(
            `You are not enrolled in any courses for Semester ${studentInfo.semester}, Section ${studentInfo.section}. Please contact your administrator.`,
          )
          return
        }

        // Transform enrollments to expected format
        const transformedEnrollments: StudentEnrollment[] = enrollments.map((enrollment: any) => ({
          course_id: enrollment.course_id,
          subject_id: enrollment.subject_id,
          subject_code: enrollment.subject_code,
          subject_name: enrollment.subject_name,
          component_type: enrollment.component_type,
          batch: enrollment.batch || "",
          faculty_name: enrollment.faculty_name,
          semester: enrollment.semester,
          section: enrollment.section,
          academic_year: enrollment.academic_year,
          enrollment_date: enrollment.enrollment_date,
          is_active: enrollment.is_active,
        }))

        setStudentEnrollments(transformedEnrollments)

        // ENHANCED: Find all unique sections where student has enrollments
        const enrolledSections = [...new Set(transformedEnrollments.map((e) => e.section))]
        const crossSectionSections = enrolledSections.filter((section) => section !== studentInfo.section)
        setCrossSectionEnrollments(crossSectionSections)

        console.log("Student's primary section:", studentInfo.section)
        console.log("All enrolled sections:", enrolledSections)
        console.log("Cross-section enrollments:", crossSectionSections)

        // Determine academic year based on student's actual enrollments
        let academicYear: string
        if (transformedEnrollments && transformedEnrollments.length > 0) {
          // Use the academic year from the student's enrollments
          academicYear = transformedEnrollments[0].academic_year
          console.log("Using academic year from enrollments:", academicYear)
        } else {
          // Fallback to current date calculation
          const currentDate = new Date()
          const currentYear = currentDate.getFullYear()
          const currentMonth = currentDate.getMonth() + 1

          if (currentMonth >= 6 && currentMonth <= 12) {
            academicYear = `${currentYear}-${(currentYear + 1).toString().slice(-2)}(odd)`
          } else {
            academicYear = `${currentYear}-${(currentYear + 1).toString().slice(-2)}(even)`
          }
          console.log("Using calculated academic year:", academicYear)
        }

        // ENHANCED: Fetch timetables for ALL sections where student has enrollments
        const timetablePromises = enrolledSections.map((section) =>
          supabase
            .from("timetables")
            .select("*")
            .eq("academic_year", academicYear)
            .eq("semester", Number.parseInt(studentInfo.semester))
            .eq("section", section),
        )

        const timetableResults = await Promise.all(timetablePromises)

        // Collect all timetables
        const allTimetables: any[] = []
        timetableResults.forEach((result, index) => {
          const { data: timetableData, error: timetableError } = result
          const section = enrolledSections[index]

          if (timetableError) {
            console.error(`Error loading timetable for section ${section}:`, timetableError)
            return
          }

          if (timetableData && timetableData.length > 0) {
            // Add section info to each timetable
            allTimetables.push({
              ...timetableData[0],
              source_section: section,
            })
            console.log(`Found timetable for section ${section}`)
          } else {
            console.log(`No timetable found for section ${section}`)
          }
        })

        if (allTimetables.length === 0) {
          console.error("No timetables found for any enrolled sections:", enrolledSections)
          setError(
            `No timetables have been created for your enrolled sections (${enrolledSections.join(", ")}) in Semester ${studentInfo.semester} (${academicYear}). Please check back later or contact your coordinator.`,
          )
          return
        }

        console.log("All found timetables:", allTimetables)

        // ENHANCED: Merge timetables from multiple sections
        const mergedTimetable = await mergeMultipleTimetables(allTimetables, transformedEnrollments, studentInfo)

        console.log("Merged timetable data:", mergedTimetable)
        setTimetableData(mergedTimetable)
      } catch (error) {
        console.error("Failed to fetch timetable:", error)
        setError(error instanceof Error ? error.message : "Failed to load your timetable. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    // ENHANCED: Merge multiple timetables and filter for student's enrolled subjects
    const mergeMultipleTimetables = async (
      timetables: any[],
      enrollments: StudentEnrollment[],
      studentInfo: StudentInfo,
    ): Promise<TimetableData> => {
      // Create a comprehensive map of student's enrolled subjects with correct key format
      const enrolledSubjectsMap = new Map<string, StudentEnrollment[]>()

      enrollments.forEach((enrollment) => {
        // Use the correct key format that matches the timetable subject IDs
        const key = `${enrollment.subject_id}-${enrollment.component_type}`
        if (!enrolledSubjectsMap.has(key)) {
          enrolledSubjectsMap.set(key, [])
        }
        enrolledSubjectsMap.get(key)!.push(enrollment)
      })

      console.log("Enrolled subjects map:", enrolledSubjectsMap)

      // Use the primary section's timetable as base structure
      const primaryTimetable = timetables.find((t) => t.source_section === studentInfo.section) || timetables[0]

      // Create merged timetable structure
      const mergedTimetable: TimetableData = {
        id: `merged-${studentInfo.usn}`,
        academicYear: primaryTimetable.academic_year,
        semester: primaryTimetable.semester.toString(),
        section: `${studentInfo.section}${crossSectionEnrollments.length > 0 ? ` (+${crossSectionEnrollments.join(",")})` : ""}`,
        roomNumber: "Multiple", // Since we have multiple sections
        timeSlots,
        days,
        cells: [],
      }

      // Create a map to merge cells by day and time slot
      const cellMap = new Map<string, TimetableCell>()

      // Process each timetable
      timetables.forEach((timetable) => {
        const originalCells = timetable.data?.cells || []
        const sourceSection = timetable.source_section
        const sourceTimetableRoomNumber = timetable.data?.roomNumber || "TBA"

        originalCells.forEach((cell: any) => {
          const cellKey = `${cell.day}-${cell.timeSlotId}`

          // Initialize cell if not exists
          if (!cellMap.has(cellKey)) {
            cellMap.set(cellKey, {
              id: cell.id,
              day: cell.day,
              timeSlotId: cell.timeSlotId,
              classEntries: [],
              isBreak: cell.isBreak,
              breakType: cell.breakType,
            })
          }

          const mergedCell = cellMap.get(cellKey)!

          // Ensure classEntries is properly formatted
          let classEntries = cell.classEntries || []
          if (cell.classEntry && !cell.classEntries) {
            classEntries = [cell.classEntry]
          }

          // Filter class entries to only include student's enrolled subjects
          const filteredClassEntries = classEntries.filter((classEntry: any) => {
            // Extract the actual subject ID from the timetable subject ID
            let actualSubjectId = classEntry.subjectId
            const actualComponentType = classEntry.componentType

            // Handle cases where subjectId might include component type
            if (actualSubjectId.includes("-")) {
              const parts = actualSubjectId.split("-")
              if (parts.length >= 2) {
                // Remove the last part if it matches the component type
                const lastPart = parts[parts.length - 1]
                if (lastPart === actualComponentType) {
                  actualSubjectId = parts.slice(0, -1).join("-")
                }
              }
            }

            const key = `${actualSubjectId}-${actualComponentType}`
            const enrolledSubjects = enrolledSubjectsMap.get(key)

            console.log(
              `Checking class entry: ${classEntry.subjectCode} (${actualComponentType}) from section ${sourceSection}`,
            )
            console.log(`  - Key: ${key}`)
            console.log(`  - Enrolled subjects found: ${enrolledSubjects ? enrolledSubjects.length : 0}`)

            if (!enrolledSubjects || enrolledSubjects.length === 0) {
              console.log(`Subject not enrolled: ${classEntry.subjectCode} (${actualComponentType}) - Key: ${key}`)
              return false
            }

            // Check if student is enrolled in this specific section for this subject
            const sectionEnrollments = enrolledSubjects.filter((e) => e.section === sourceSection)
            if (sectionEnrollments.length === 0) {
              console.log(`Student not enrolled in section ${sourceSection} for ${classEntry.subjectCode}`)
              return false
            }

            // For lab subjects, also check batch matching
            if (actualComponentType === "lab" && classEntry.batch) {
              const batchMatches = sectionEnrollments.some((enrollment) => {
                const matches = enrollment.batch === classEntry.batch
                console.log(
                  `Lab batch check: ${classEntry.subjectCode} - Student batch: ${enrollment.batch} vs Class batch: ${classEntry.batch} - Match: ${matches}`,
                )
                return matches
              })

              if (!batchMatches) {
                console.log(
                  `Lab batch mismatch for ${classEntry.subjectCode}: Student batches [${sectionEnrollments
                    .map((e) => e.batch)
                    .join(", ")}] vs Class batch ${classEntry.batch}`,
                )
                return false
              }
            }

            // ENHANCED: Update faculty names and add section info
            const relevantEnrollments =
              actualComponentType === "lab" && classEntry.batch
                ? sectionEnrollments.filter((e) => e.batch === classEntry.batch)
                : sectionEnrollments.filter((e) => e.component_type === actualComponentType)

            if (relevantEnrollments.length > 0) {
              const facultyNames = [...new Set(relevantEnrollments.map((e) => e.faculty_name).filter(Boolean))]
              classEntry.facultyNames = facultyNames
              // Generate short names for faculty
              classEntry.facultyShortNames = facultyNames.map((name) => {
                const parts = name.split(" ")
                return parts.map((part) => part.charAt(0).toUpperCase()).join("")
              })
            }

            // ENHANCED: Add section and room information for cross-section classes
            classEntry.section = sourceSection
            classEntry.roomNumber = sourceTimetableRoomNumber

            // FIXED: Add consistent color based on subject code
            classEntry.color = getSubjectColor(classEntry.subjectCode)

            console.log(
              `Including class: ${classEntry.subjectCode} (${actualComponentType}) from section ${sourceSection} - Faculty: ${classEntry.facultyNames?.join(", ")} - Color: ${classEntry.color}`,
            )
            return true
          })

          // Add filtered entries to merged cell
          mergedCell.classEntries.push(...filteredClassEntries)
        })
      })

      // Convert map back to array
      mergedTimetable.cells = Array.from(cellMap.values())

      return mergedTimetable
    }

    fetchTimetable()
  }, [])

  // Get time slot text
  const getTimeSlotText = (timeSlotId: string): string => {
    if (!timetableData) return ""

    const timeSlot = timetableData.timeSlots.find((slot) => slot.id === timeSlotId)
    if (!timeSlot) return ""

    return `${timeSlot.start} - ${timeSlot.end}`
  }

  // Get classes for a specific day
  const getDayClasses = (day: string) => {
    if (!timetableData) return []

    return timetableData.cells
      .filter((cell) => cell.day === day && !cell.isBreak && cell.classEntries && cell.classEntries.length > 0)
      .sort((a, b) => {
        const aSlotNum = Number.parseInt(a.timeSlotId.replace("slot", ""))
        const bSlotNum = Number.parseInt(b.timeSlotId.replace("slot", ""))
        return aSlotNum - bSlotNum
      })
  }

  // Get today's day abbreviation
  const getTodayAbbreviation = (): string => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const today = new Date().getDay()
    return days[today]
  }

  // Get current time slot
  const getCurrentTimeSlot = (): string | null => {
    const now = new Date()
    const currentTime = now.getHours() * 60 + now.getMinutes()

    for (const slot of timeSlots) {
      if (slot.isBreak) continue

      const [startHour, startMin] = slot.start.split(":").map(Number)
      const [endHour, endMin] = slot.end.split(":").map(Number)

      const startTime = startHour * 60 + startMin
      const endTime = endHour * 60 + endMin

      if (currentTime >= startTime && currentTime <= endTime) {
        return slot.id
      }
    }
    return null
  }

  // Set today as the active day by default
  useEffect(() => {
    const today = getTodayAbbreviation()
    if (timetableData && timetableData.days.includes(today)) {
      setActiveDay(today)
    } else {
      setActiveDay(timetableData?.days[0] || "Mon")
    }
  }, [timetableData])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            My Class Timetable
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
            <Skeleton className="h-8 w-full" />
            <div className="space-y-2">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            My Class Timetable
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!timetableData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            My Class Timetable
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No timetable available for your semester and section.</p>
            {studentInfo && (
              <p className="text-sm text-muted-foreground mt-2">
                Semester {studentInfo.semester}, Section {studentInfo.section}
                {studentInfo.batch && ` - Batch ${studentInfo.batch}`}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  const todayClasses = getDayClasses(getTodayAbbreviation())
  const currentTimeSlot = getCurrentTimeSlot()

  return (
    <div className="space-y-6">
      {/* Student Info Cards */}
      {studentInfo && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Semester</p>
                  <p className="font-semibold">{studentInfo.semester}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Primary Section</p>
                  <p className="font-semibold">
                    {studentInfo.section}
                    {studentInfo.batch && ` - ${studentInfo.batch}`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Today's Classes</p>
                  <p className="font-semibold">{todayClasses.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">USN</p>
                  <p className="font-semibold">{studentInfo.usn}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Cross-section enrollment notice */}
      {crossSectionEnrollments.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-800">Cross-Section Enrollments</p>
                <p className="text-xs text-blue-600">
                  You are also enrolled in classes from section(s): {crossSectionEnrollments.join(", ")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Timetable */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              My Class Timetable
              {studentInfo && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  - {studentInfo.firstName} {studentInfo.lastName}
                </span>
              )}
            </div>
            <div className="flex flex-col items-end">
              <Badge variant="outline" className="font-normal">
                Semester {timetableData.semester} - Section {timetableData.section}
              </Badge>
              <span className="text-xs text-muted-foreground mt-1">{timetableData.academicYear}</span>
            </div>
          </CardTitle>
          <CardDescription>
            Your personalized class schedule based on your enrolled subjects across all sections. Current time is
            highlighted.
            {studentEnrollments.length > 0 && (
              <span className="block mt-1 text-xs">
                Enrolled in:{" "}
                {[...new Set(studentEnrollments.map((e) => `${e.subject_code}(${e.component_type})`))].join(", ")}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeDay} onValueChange={setActiveDay} className="w-full">
            <TabsList className="grid grid-cols-6 mb-4">
              {timetableData.days.map((day) => (
                <TabsTrigger
                  key={day}
                  value={day}
                  className={day === getTodayAbbreviation() ? "font-bold bg-primary/10" : ""}
                >
                  {day}
                  {day === getTodayAbbreviation() && <span className="ml-1 text-xs text-primary">•</span>}
                </TabsTrigger>
              ))}
            </TabsList>

            {timetableData.days.map((day) => (
              <TabsContent key={day} value={day} className="space-y-4">
                {getDayClasses(day).length > 0 ? (
                  getDayClasses(day).map((cell) =>
                    cell.classEntries.map((classEntry, index) => {
                      const isCurrentClass = day === getTodayAbbreviation() && cell.timeSlotId === currentTimeSlot
                      const isCrossSection = classEntry.section !== studentInfo?.section

                      return (
                        <div
                          key={`${cell.id}-${index}`}
                          className={`rounded-lg p-4 shadow-sm border-l-4 text-white ${
                            isCurrentClass ? "border-yellow-300 ring-2 ring-yellow-300/50" : "border-white/30"
                          } ${isCrossSection ? "ring-2 ring-blue-300/50" : ""}`}
                          style={{ backgroundColor: classEntry.color }}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold text-lg">{classEntry.shortName || classEntry.subjectCode}</h3>
                                {classEntry.componentType === "lab" && (
                                  <Badge variant="secondary" className="text-xs bg-white/20 text-white border-white/30">
                                    LAB
                                  </Badge>
                                )}
                                {classEntry.componentType === "project" && (
                                  <Badge variant="secondary" className="text-xs bg-white/20 text-white border-white/30">
                                    PROJECT
                                  </Badge>
                                )}
                                {classEntry.batch && (
                                  <Badge variant="secondary" className="text-xs bg-white/20 text-white border-white/30">
                                    {classEntry.batch}
                                  </Badge>
                                )}
                                {isCrossSection && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs bg-blue-200 text-blue-900 border-blue-300"
                                  >
                                    Sec {classEntry.section}
                                  </Badge>
                                )}
                                {isCurrentClass && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs bg-yellow-300 text-yellow-900 animate-pulse"
                                  >
                                    LIVE
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm opacity-90 mb-2">{classEntry.subjectName}</p>
                              {classEntry.componentType === "lab" && classEntry.lab && (
                                <p className="text-xs opacity-80 mb-2 flex items-center">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  {classEntry.lab}
                                </p>
                              )}
                              {classEntry.facultyNames && classEntry.facultyNames.length > 0 && (
                                <p className="text-sm opacity-90 flex items-center">
                                  <User className="h-3 w-3 mr-1" />
                                  {classEntry.facultyNames.join(", ")}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="flex items-center text-sm opacity-90 mb-1">
                                <Clock className="h-3 w-3 mr-1" />
                                {getTimeSlotText(cell.timeSlotId)}
                              </div>
                              <p className="text-sm opacity-90 flex items-center justify-end">
                                <MapPin className="h-3 w-3 mr-1" />
                                {classEntry.componentType === "lab" && classEntry.lab
                                  ? classEntry.lab
                                  : `Room ${classEntry.roomNumber || timetableData.roomNumber}`}
                              </p>
                              {isCrossSection && (
                                <p className="text-xs opacity-80 mt-1">Section {classEntry.section}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    }),
                  )
                ) : (
                  <div className="p-8 text-center border-2 border-dashed border-muted rounded-lg">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground font-medium">No classes scheduled for {day}</p>
                    <p className="text-sm text-muted-foreground mt-1">Enjoy your free day!</p>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>

          {/* Quick Stats */}
          <div className="mt-6 pt-4 border-t">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-primary">
                  {timetableData.cells.filter((cell) => !cell.isBreak && cell.classEntries.length > 0).length}
                </p>
                <p className="text-xs text-muted-foreground">Total Classes</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{todayClasses.length}</p>
                <p className="text-xs text-muted-foreground">Today's Classes</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{studentEnrollments.length}</p>
                <p className="text-xs text-muted-foreground">Enrolled Subjects</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
