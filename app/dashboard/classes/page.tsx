"use client"

import { DialogFooter } from "@/components/ui/dialog"

import type React from "react"
import { useState, useEffect, useMemo, useCallback } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import {
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  CalendarIcon,
  Coffee,
  Utensils,
  Users,
  CheckCircle,
  Eye,
} from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  format,
  addDays,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addWeeks,
  subWeeks,
  isSameDay,
  isFuture,
} from "date-fns"
import { useSearchParams } from "next/navigation"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { FileText } from "lucide-react"
import { getActiveRole } from "@/lib/role-switcher"
import { facultyService, weeklyTimetableModificationsService } from "@/lib/supabase-service-new"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

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
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }

  // Use absolute value and modulo to get a consistent index
  const colorIndex = Math.abs(hash) % subjectColorPalette.length
  return subjectColorPalette[colorIndex]
}

// Define types for our data structures
type TimeSlot = {
  id: string
  start: string
  end: string
  isBreak?: boolean
  breakType?: "coffee" | "lunch"
  label?: string
}

type ClassEvent = {
  id: string
  name: string
  code: string
  semester: number
  section: string
  room: string
  students: number
  day: string
  timeSlotId: string
  color: string
  faculty?: string
  componentType?: string
  batch?: string
  academicYear?: string
  isOriginal?: boolean
  isModified?: boolean
  subjectId?: string
  courseId?: string // Add courseId for attendance sessions
}

type Student = {
  id: string
  name: string
  usn: string
  email: string
  semester: number
  section: string
  batch?: string
}

type AttendanceStatus = "present" | "absent" | "event"

type AttendanceRecord = {
  studentId: string
  studentName: string
  studentUSN: string
  status: AttendanceStatus
  classId: string
  date: string
  weekKey?: string
}

// Faculty timetable data type from SQL function
type FacultyTimetableData = {
  day_name: string
  time_slot_id: string
  start_time: string
  end_time: string
  subject_code: string
  subject_name: string
  component_type: string
  section: string
  batch: string | null
  room_number: string
  student_count: number
  color: string
  semester: number
  academic_year: string
  subject_id: string
  course_id?: string // Add course_id for attendance sessions
}

// Course enrollment type for student fetching (EXACT same as assign-subjects)
type CourseEnrollment = {
  id: string
  course_id: string
  student_id: string
  enrollment_date: string
  is_active: boolean
  batch?: string
  student: {
    name: string
    usn: string
    email: string
    semester: number
    section: string
  }
  course: {
    course_code: string
    course_name: string
    semester: number
    section: string
    batch?: string
    component_type: string
  }
  subject: {
    code: string
    name: string
  }
  batch?: string
  is_cross_section?: boolean
  faculty_names?: string
}

interface ClassSchedule {
  id: string
  name: string
  code: string
  semester: number
  section: string
  room: string
  students: number
  day: string
  timeSlotId: string
  color: string
  faculty: string
  componentType: string
  batch?: string
  academicYear: string
  isOriginal: boolean
}

interface AttendanceStudent {
  id: string
  name: string
  usn: string
  email: string
  semester: string
  section: string
  batch?: string
}

interface AttendanceRecord2 {
  studentId: string
  isPresent: boolean
}

interface AttendanceSession {
  id: string
  date: string
  course_id: string
  created_by_id: string
  created_at: string
  attendance_records: Array<{
    id: string
    student_id: string
    is_present: boolean
    status: string | null
    marked_at: string
  }>
}

interface FacultyStats {
  total_classes_scheduled: number
  classes_conducted: number
  total_students: number
  average_attendance: number
}

interface WeeklyModification {
  id: string
  faculty_id: string
  week_start_date: string
  day_name: string
  time_slot_id: string
  modification_type: string
  new_subject_code?: string
  new_subject_name?: string
  new_room?: string
  reason?: string
  created_at: string
}

const timeSlots2 = [
  { id: "slot1", label: "8:30 - 9:30", start: "8:30", end: "9:30" },
  { id: "slot2", label: "9:30 - 10:30", start: "9:30", end: "10:30" },
  { id: "slot3", label: "10:30 - 10:50", start: "10:30", end: "10:50", isBreak: true },
  { id: "slot4", label: "10:50 - 11:50", start: "10:50", end: "11:50" },
  { id: "slot5", label: "11:50 - 12:50", start: "11:50", end: "12:50" },
  { id: "slot6", label: "12:50 - 1:30", start: "12:50", end: "1:30", isBreak: true },
  { id: "slot7", label: "1:30 - 2:25", start: "1:30", end: "2:25" },
  { id: "slot8", label: "2:25 - 3:20", start: "2:25", end: "3:20" },
  { id: "slot9", label: "3:20 - 4:15", start: "3:20", end: "4:15" },
  { id: "slot10", label: "4:15 - 5:10", start: "4:15", end: "5:10" },
]

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export default function ClassesPage() {
  const searchParams = useSearchParams()
  const classIdParam = searchParams.get("classId")
  const viewParam = searchParams.get("view")
  const dateParam = searchParams.get("date")

  const [user, setUser] = useState<any>(null)
  const [activeRole, setActiveRole] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>(dateParam ? new Date(dateParam) : new Date())
  const [weekStartDate, setWeekStartDate] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [searchQuery, setSearchQuery] = useState("")
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [selectedClassForView, setSelectedClassForView] = useState<ClassEvent | null>(null)
  const [draggedClass, setDraggedClass] = useState<ClassEvent | null>(null)
  const { toast } = useToast()
  const [reportDialogOpen, setReportDialogOpen] = useState(false)
  const [showReportView, setShowReportView] = useState(false)
  const [reportFilters, setReportFilters] = useState({
    academicYear: "2024-25 odd",
    semester: "1",
    section: "A",
    courseCode: "",
  })
  const [reportStudents, setReportStudents] = useState<
    {
      id: string
      name: string
      usn: string
      attendancePercentage: number
      presentDays: number
      absentDays: number
      totalDays: number
    }[]
  >([])
  const [reportSearchQuery, setReportSearchQuery] = useState("")

  // Faculty-specific state
  const [facultyTimetableData, setFacultyTimetableData] = useState<FacultyTimetableData[]>([])
  const [facultyStats2, setFacultyStats2] = useState<FacultyStats | null>(null)
  const [facultyStats, setFacultyStats] = useState({
    totalClassesScheduled: 0,
    classesConducted: 0,
    totalStudents: 0,
    averageAttendance: 0,
  })

  // Week-specific modifications state - now using Supabase
  const [weeklyModifications, setWeeklyModifications] = useState<Record<string, ClassEvent[]>>({})
  const [dragOverCell, setDragOverCell] = useState<{ day: string; timeSlotId: string } | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  // Real students data
  const [realStudents, setRealStudents] = useState<Student[]>([])

  // Component selection state
  const [isComponentSelectionDialogOpen, setIsComponentSelectionDialogOpen] = useState(false)
  const [subjectForComponentSelection, setSubjectForComponentSelection] = useState<ClassEvent | null>(null)
  const [selectedComponentType, setSelectedComponentType] = useState<string>("")
  const [selectedSectionForView, setSelectedSectionForView] = useState<string>("")

  // Enrolled students state (from assign-subjects logic)
  const [enrolledStudents, setEnrolledStudents] = useState<CourseEnrollment[]>([])

  // FIXED: Add state to prevent multiple simultaneous student loading calls
  const [isLoadingStudents, setIsLoadingStudents] = useState(false)

  // FIXED: Add state to track the actual course ID for attendance saving
  const [selectedCourseForAttendance, setSelectedCourseForAttendance] = useState<string | null>(null)

  // NEW: Add state to track existing attendance for the selected date and class
  const [existingAttendance, setExistingAttendance] = useState<any>(null)
  const [attendanceMode, setAttendanceMode] = useState<"mark" | "view" | "edit">("mark")

  // Define time slots based on the reference image
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

  // Generate week days based on the selected week start date
  const weekDays = useMemo(() => {
    return eachDayOfInterval({
      start: weekStartDate,
      end: endOfWeek(weekStartDate, { weekStartsOn: 1 }),
    }).slice(0, 6) // Only take Monday to Saturday
  }, [weekStartDate])

  // Load weekly modifications from Supabase
  const loadWeeklyModifications = useCallback(async (facultyId: string, weekStartDate: Date) => {
    if (!facultyId) return

    try {
      const weekKey = format(weekStartDate, "yyyy-MM-dd")
      const { data: modifications, error } = await weeklyTimetableModificationsService.getWeeklyModifications(
        facultyId,
        weekKey,
      )

      if (error) {
        console.error("Error loading weekly modifications:", error)
        return
      }

      setWeeklyModifications((prev) => ({
        ...prev,
        [weekKey]: modifications || [],
      }))
    } catch (error) {
      console.error("Error loading weekly modifications:", error)
    }
  }, [])

  // Convert faculty timetable data to ClassEvent format with weekly modifications
  const classes = useMemo(() => {
    // Day name mapping from abbreviated to full names
    const dayNameMap: Record<string, string> = {
      Mon: "Monday",
      Tue: "Tuesday",
      Wed: "Wednesday",
      Thu: "Thursday",
      Fri: "Friday",
      Sat: "Saturday",
      Sun: "Sunday",
    }

    const baseClasses = facultyTimetableData.map((item, index) => {
      const fullDayName = dayNameMap[item.day_name] || item.day_name
      const hexColor = getSubjectColor(item.subject_code) // Use subject code for consistent coloring

      return {
        id: `faculty-class-${index}`,
        name: item.subject_name,
        code: item.subject_code,
        semester: item.semester,
        section: item.section,
        room: item.room_number,
        students: item.student_count,
        day: fullDayName,
        timeSlotId: item.time_slot_id,
        color: hexColor,
        faculty: user?.name || "You",
        componentType: item.component_type,
        batch: item.batch || undefined,
        academicYear: item.academic_year,
        isOriginal: true,
        subjectId: item.subject_id,
        courseId: item.course_id, // Add course ID for attendance sessions
      }
    })

    // Get current week key
    const weekKey = format(weekStartDate, "yyyy-MM-dd")
    const weekModifications = weeklyModifications[weekKey] || []

    // Apply weekly modifications efficiently
    if (weekModifications.length === 0) {
      return baseClasses
    }

    // Create a map for faster lookups
    const modificationMap = new Map(weekModifications.map((mod) => [mod.id, mod]))

    // Filter out moved classes and add modifications
    const modifiedClasses = baseClasses.filter((cls) => !modificationMap.has(cls.id)).concat(weekModifications)

    return modifiedClasses
  }, [facultyTimetableData, user, weeklyModifications, weekStartDate])

  // FIXED: Completely rewritten checkExistingAttendance function with direct API call
  const checkExistingAttendance = useCallback(async (courseId: string, date: string) => {
    try {
      console.log("🔍 Checking existing attendance via API for:", { courseId, date })

      // Use the attendance API to check for existing attendance
      const response = await fetch(`/api/attendance?courseId=${courseId}&date=${date}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        console.error("❌ API error checking attendance:", response.status, response.statusText)
        return null
      }

      const result = await response.json()
      console.log("📊 API response for existing attendance:", result)

      if (result.success && result.data && result.data.session) {
        console.log("✅ Found existing attendance session via API:", {
          sessionId: result.data.session.id,
          recordsCount: result.data.records?.length || 0,
          date: result.data.session.date,
          courseId: result.data.session.course_id,
        })

        // Transform API response to match expected format
        const transformedData = {
          id: result.data.session.id,
          date: result.data.session.date,
          course_id: result.data.session.course_id,
          created_by_id: result.data.session.created_by_id,
          created_at: result.data.session.created_at,
          attendance_records: result.data.records || [],
        }

        return transformedData
      } else {
        console.log("ℹ️ No existing attendance found via API for course:", courseId, "date:", date)
        return null
      }
    } catch (error) {
      console.error("❌ Unexpected error checking existing attendance via API:", error)
      // Return null to allow marking attendance even if check fails
      return null
    }
  }, [])

  // FIXED: Improved loadStudentsForSubject function with proper batch filtering
  const loadStudentsForSubject = useCallback(
    async (subject: ClassEvent, componentType: string, section?: string, specificBatch?: string) => {
      // Prevent multiple simultaneous calls
      if (isLoadingStudents) {
        console.log("Already loading students, skipping...")
        return
      }

      // Bail out if the timetable entry doesn't have a subjectId
      if (!subject.subjectId) {
        console.warn("Missing subjectId for classEvent:", subject)
        toast({
          title: "Cannot load students",
          description: "This class entry doesn't have a linked subject. Please check the timetable configuration.",
          variant: "destructive",
        })
        setEnrolledStudents([])
        setRealStudents([])
        setSelectedCourseForAttendance(null)
        setLoadingStudents(false)
        return
      }

      try {
        setIsLoadingStudents(true)
        setLoadingStudents(true)
        setSelectedComponentType(componentType)

        // FIXED: Use the specific batch from the clicked class event
        const targetBatch = specificBatch || subject.batch
        const targetSection = section || subject.section

        console.log("Loading students for subject:", {
          subjectId: subject.subjectId,
          componentType,
          section: targetSection,
          batch: targetBatch,
          currentUserId: user?.id,
        })

        // FIXED: Get courses for this subject and component type, filtered by current faculty and specific batch
        let coursesQuery = supabase
          .from("courses")
          .select(`
          id,
          course_code,
          course_name,
          semester,
          section,
          batch,
          component_type,
          faculty_id
        `)
          .eq("subject_id", subject.subjectId)
          .eq("component_type", componentType)
          .eq("faculty_id", user?.id) // Only get courses taught by current faculty
          .eq("section", targetSection)

        // FIXED: For lab components, filter by specific batch
        if (componentType === "lab" && targetBatch) {
          coursesQuery = coursesQuery.eq("batch", targetBatch)
        }

        const { data: courses, error: coursesError } = await coursesQuery

        if (coursesError) throw coursesError

        console.log("Found courses for current faculty and batch:", courses)

        if (!courses || courses.length === 0) {
          console.log("No courses found for this subject/component/batch combination taught by current faculty")
          toast({
            title: "No classes found",
            description: `You are not assigned to teach this ${componentType}${targetBatch ? ` for batch ${targetBatch}` : ""}.`,
            variant: "destructive",
          })
          setEnrolledStudents([])
          setRealStudents([])
          setSelectedCourseForAttendance(null)
          return
        }

        // FIXED: Set the course ID for attendance saving to the specific course found
        const primaryCourseId = courses[0].id
        setSelectedCourseForAttendance(primaryCourseId)
        console.log("🎯 Set course for attendance:", primaryCourseId)

        // NEW: Check if attendance already exists for this course and date
        const dateString = selectedDate.toISOString().split("T")[0]
        console.log("📅 Checking for existing attendance on date:", dateString)
        const existingAttendanceData = await checkExistingAttendance(primaryCourseId, dateString)
        setExistingAttendance(existingAttendanceData)

        // FIXED: Determine attendance mode based on date and existing data
        if (isFuture(selectedDate)) {
          setAttendanceMode("view")
          console.log("🔮 Future date - setting to view mode")
          toast({
            title: "Future Date",
            description: "Cannot mark attendance for future dates.",
            variant: "destructive",
          })
        } else if (
          existingAttendanceData &&
          existingAttendanceData.attendance_records &&
          existingAttendanceData.attendance_records.length > 0
        ) {
          setAttendanceMode("edit")
          console.log("✏️ Attendance already exists - switching to edit mode")
          console.log("📊 Existing records:", existingAttendanceData.attendance_records.length)
        } else {
          setAttendanceMode("mark")
          console.log("📝 No existing attendance - switching to mark mode")
        }

        // Get course IDs
        const courseIds = courses.map((c) => c.id)

        // Get enrollments for these specific courses
        const { data: enrollments, error: enrollmentsError } = await supabase
          .from("course_enrollments")
          .select(`
          *,
          courses!inner(
            id,
            course_code,
            course_name,
            semester,
            section,
            batch,
            component_type,
            faculty_id,
            subjects!inner(
              code,
              name
            )
          )
        `)
          .in("course_id", courseIds)
          .eq("is_active", true)

        if (enrollmentsError) throw enrollmentsError

        console.log("Found enrollments for specific batch:", enrollments)

        // Get student details
        const studentIds = [...new Set(enrollments?.map((e) => e.student_id) || [])]
        if (studentIds.length === 0) {
          console.log("No student IDs found in enrollments")
          setEnrolledStudents([])
          setRealStudents([])
          return
        }

        // Get student records
        const { data: students, error: studentsError } = await supabase
          .from("students")
          .select(`
          user_id,
          usn,
          semester,
          section
        `)
          .in("user_id", studentIds)

        if (studentsError) throw studentsError

        // Get user details separately
        const { data: users, error: usersError } = await supabase
          .from("users")
          .select(`
          id,
          first_name,
          last_name,
          email
        `)
          .in("id", studentIds)

        if (usersError) throw usersError

        console.log("Found students:", students)
        console.log("Found users:", users)

        // Get faculty details for all courses to show faculty names
        const facultyIds = [...new Set(courses.map((c) => c.faculty_id).filter(Boolean))]
        let facultyData: any[] = []

        if (facultyIds.length > 0) {
          const { data: facultyUsers, error: facultyError } = await supabase
            .from("users")
            .select(`
           id,
           first_name,
           last_name
         `)
            .in("id", facultyIds)

          if (facultyError) throw facultyError
          facultyData = facultyUsers || []
        }

        // Create faculty map
        const facultyMap = new Map()
        facultyData.forEach((faculty: any) => {
          facultyMap.set(faculty.id, `${faculty.first_name || ""} ${faculty.last_name || ""}`.trim())
        })

        // Create student and user maps
        const studentMap = new Map()
        const userMap = new Map()

        students?.forEach((student) => {
          studentMap.set(student.user_id, student)
        })

        users?.forEach((user) => {
          userMap.set(user.id, user)
        })

        // Process enrollments
        const enrichedEnrollments = (enrollments || []).map((enrollment) => {
          const student = studentMap.get(enrollment.student_id)
          const user = userMap.get(enrollment.student_id)

          // Get faculty name for this course
          const course = courses.find((c) => c.id === enrollment.course_id)
          const facultyName = course && course.faculty_id ? facultyMap.get(course.faculty_id) || "" : ""

          // Include student's original section info for cross-section identification
          const studentOriginalSection = student?.section || "Unknown"
          const courseSection = enrollment.courses.section

          return {
            ...enrollment,
            student: {
              name: user ? `${user.first_name || ""} ${user.last_name || ""}`.trim() : "Unknown",
              usn: student?.usn || "Unknown",
              email: user?.email || "Unknown",
              semester: student?.semester || 0,
              section: studentOriginalSection, // Student's original section
            },
            course: {
              course_code: enrollment.courses.course_code,
              course_name: enrollment.courses.course_name,
              semester: enrollment.courses.semester,
              section: courseSection, // Course's section
              batch: enrollment.courses.batch,
              component_type: enrollment.courses.component_type,
            },
            subject: {
              code: enrollment.courses.subjects.code,
              name: enrollment.courses.subjects.name,
            },
            faculty_names: facultyName,
            // Prioritize batch from course_enrollments over courses table
            batch: enrollment.batch || enrollment.courses.batch,
            // Add cross-section indicator
            is_cross_section: studentOriginalSection !== courseSection,
          }
        })

        console.log("Final enriched enrollments for specific batch:", enrichedEnrollments)
        setEnrolledStudents(enrichedEnrollments)

        // Convert to Student format for attendance
        const studentsForAttendance: Student[] = enrichedEnrollments.map((e) => ({
          id: e.student_id,
          name: e.student.name,
          usn: e.student.usn,
          email: e.student.email,
          semester: e.student.semester,
          section: e.student.section,
          batch: e.batch,
        }))

        console.log("Students for attendance (batch-specific):", studentsForAttendance)
        setRealStudents(studentsForAttendance)
      } catch (error) {
        console.error("Error loading students for subject:", error)
        toast({
          title: "Error",
          description: "Failed to load students. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoadingStudents(false)
        setIsLoadingStudents(false)
      }
    },
    [toast, isLoadingStudents, user?.id, selectedDate, checkExistingAttendance],
  )

  // --- helper to fetch subjectId by code ------------------------------
  const fetchSubjectIdByCode = async (code: string): Promise<string | null> => {
    const { data, error } = await supabase.from("subjects").select("id").eq("code", code).limit(1).single()

    if (error || !data?.id) return null
    return data.id
  }

  // FIXED: Improved handleViewStudents function with batch-specific loading
  const handleViewStudents = useCallback(
    async (classEvent: ClassEvent) => {
      // Prevent multiple simultaneous calls
      if (isLoadingStudents) {
        console.log("Already loading students, skipping handleViewStudents...")
        return
      }

      console.log("🎯 Handling view students for class:", classEvent)
      setSelectedClassForView(classEvent)
      setSelectedSectionForView(classEvent.section)

      let subjectId = classEvent.subjectId

      // If subjectId is missing, try to resolve it using the subject code.
      if (!subjectId) {
        subjectId = await fetchSubjectIdByCode(classEvent.code)
        // Mutate the local class object so we do not look it up again.
        if (subjectId) {
          classEvent.subjectId = subjectId
        }
      }

      if (!subjectId) {
        toast({
          title: "Subject not linked",
          description: "No subject record is linked to this class entry and it could not be resolved automatically.",
          variant: "destructive",
        })
        setEnrolledStudents([])
        setRealStudents([])
        return
      }

      // Decide which component (theory/lab) to use
      const hasMultipleComponents = false // enhance later if needed
      if (hasMultipleComponents) {
        setSubjectForComponentSelection(classEvent)
        setIsComponentSelectionDialogOpen(true)
      } else {
        const componentType = classEvent.componentType || "theory"
        // FIXED: Pass the specific batch from the clicked class event
        await loadStudentsForSubject(classEvent, componentType, classEvent.section, classEvent.batch)
      }
    },
    [loadStudentsForSubject, toast, isLoadingStudents],
  )

  // FIXED: Generate attendance data only when students change, not on every render
  const generateAttendanceForRealStudents = useCallback(
    (classId: string, date: Date, students: Student[], existingData?: any) => {
      const dateString = date.toISOString().split("T")[0]
      const weekKey = format(startOfWeek(date, { weekStartsOn: 1 }), "yyyy-MM-dd")

      console.log("📊 Generating attendance data:", {
        classId,
        dateString,
        studentsCount: students.length,
        hasExistingData: !!existingData,
        existingRecordsCount: existingData?.attendance_records?.length || 0,
      })

      // If we have existing attendance data, use it
      if (existingData && existingData.attendance_records && existingData.attendance_records.length > 0) {
        console.log("✅ Using existing attendance data:", existingData.attendance_records)
        const existingRecordsMap = new Map()
        existingData.attendance_records.forEach((record: any) => {
          existingRecordsMap.set(record.student_id, {
            isPresent: record.is_present,
            status: record.status,
          })
        })

        const attendanceFromExisting = students.map((student) => {
          const existingRecord = existingRecordsMap.get(student.id)
          let status: AttendanceStatus = "present" // default

          if (existingRecord) {
            if (existingRecord.status === "excused") {
              status = "event"
            } else {
              status = existingRecord.isPresent ? "present" : "absent"
            }
          }

          return {
            studentId: student.id,
            studentName: student.name,
            studentUSN: student.usn,
            status,
            classId,
            date: dateString,
            weekKey,
          }
        })

        console.log("📋 Generated attendance from existing data:", attendanceFromExisting.length)
        return attendanceFromExisting
      }

      // Check localStorage for existing data as fallback
      const key = `${classId}-${dateString}-week-${weekKey}`
      const existingLocalData = localStorage.getItem(`attendance-${key}`)

      if (existingLocalData) {
        console.log("💾 Using localStorage data as fallback")
        return JSON.parse(existingLocalData)
      }

      // Generate new attendance data for real students
      console.log("🆕 Generating new attendance data with default 'present' status")
      return students.map((student) => ({
        studentId: student.id,
        studentName: student.name,
        studentUSN: student.usn,
        status: "present" as AttendanceStatus, // Default to present
        classId,
        date: dateString,
        weekKey, // Add week key for tracking
      }))
    },
    [],
  )

  // Load faculty timetable data
  const loadFacultyTimetableData = useCallback(
    async (userId: string) => {
      try {
        console.log("Loading faculty timetable data for user:", userId)

        // Get faculty's weekly schedule with course_id included
        const { data: scheduleData, error: scheduleError } = await supabase.rpc("get_faculty_weekly_schedule", {
          faculty_user_id: userId,
        })

        if (scheduleError) {
          console.error("Error loading faculty schedule:", scheduleError)
          setFacultyTimetableData([])
        } else {
          console.log("Faculty schedule data:", scheduleData)
          setFacultyTimetableData(scheduleData || [])
        }

        // Get faculty attendance statistics
        const { data: statsData, error: statsError } = await facultyService.getFacultyAttendanceStats(userId)

        if (statsError) {
          console.error("Error loading faculty stats:", statsError)
          setFacultyStats({
            totalClassesScheduled: 0,
            classesConducted: 0,
            totalStudents: 0,
            averageAttendance: 0,
          })
        } else {
          console.log("Faculty stats data:", statsData)
          if (statsData && statsData.length > 0) {
            const stats = statsData[0]
            setFacultyStats({
              totalClassesScheduled: stats.total_classes_scheduled || 0,
              classesConducted: stats.classes_conducted || 0,
              totalStudents: 0, // Will be updated when students are loaded
              averageAttendance: stats.average_attendance || 0,
            })
          }
        }

        // Load weekly modifications for current week
        await loadWeeklyModifications(userId, weekStartDate)
      } catch (error) {
        console.error("Error loading faculty timetable data:", error)
        toast({
          title: "Warning",
          description: "Some class data could not be loaded. You can still mark attendance for individual classes.",
          variant: "destructive",
        })
      }
    },
    [toast, loadWeeklyModifications, weekStartDate],
  )

  // REAL ATTENDANCE REPORT GENERATION - No mock data
  const generateAttendanceReport = useCallback(async () => {
    try {
      setLoading(true)

      // Get real attendance data from database based on filters
      const { data: attendanceReportData, error } = await supabase
        .from("attendance_sessions")
        .select(`
          id,
          date,
          attendance_records (
            student_id,
            is_present,
            students (
              user_id,
              usn,
              users (
                first_name,
                last_name
              )
            )
          )
        `)
        .gte("date", `${reportFilters.academicYear.split("-")[0]}-01-01`)
        .lte("date", `${reportFilters.academicYear.split("-")[1].split("(")[0]}-12-31`)

      if (error) {
        console.error("Error fetching attendance report:", error)
        // If there's an error, show empty report
        setReportStudents([])
      } else {
        // Process the real data
        const studentAttendanceMap = new Map()

        attendanceReportData?.forEach((session) => {
          session.attendance_records?.forEach((record: any) => {
            const studentId = record.student_id
            const student = record.students

            if (!studentAttendanceMap.has(studentId)) {
              studentAttendanceMap.set(studentId, {
                id: studentId,
                name: `${student.users.first_name || ""} ${student.users.last_name || ""}`.trim(),
                usn: student.usn,
                presentDays: 0,
                absentDays: 0,
                totalDays: 0,
              })
            }

            const studentData = studentAttendanceMap.get(studentId)
            studentData.totalDays++
            if (record.is_present) {
              studentData.presentDays++
            } else {
              studentData.absentDays++
            }
          })
        })

        // Calculate attendance percentages
        const reportData = Array.from(studentAttendanceMap.values()).map((student: any) => ({
          ...student,
          attendancePercentage: student.totalDays > 0 ? Math.round((student.presentDays / student.totalDays) * 100) : 0,
        }))

        setReportStudents(reportData)
      }

      setShowReportView(true)
    } catch (error) {
      console.error("Error generating attendance report:", error)
      toast({
        title: "Error",
        description: "Failed to generate attendance report. Please try again.",
        variant: "destructive",
      })
      setReportStudents([])
    } finally {
      setLoading(false)
    }
  }, [reportFilters, toast])

  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true)

        // Get user from localStorage
        const storedUser = localStorage.getItem("user")
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser)
          setUser(parsedUser)
          const role = getActiveRole(parsedUser)
          setActiveRole(role)

          // Load faculty-specific data if user is faculty
          if (["faculty", "hod", "coordinator", "principal"].includes(role)) {
            await loadFacultyTimetableData(parsedUser.id)
          }
        }

        // Listen for role changes
        const handleRoleChange = () => {
          const storedUser = localStorage.getItem("user")
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser)
            const newRole = getActiveRole(parsedUser)
            setActiveRole(newRole)

            // Reload data if role changed to faculty
            if (["faculty", "hod", "coordinator", "principal"].includes(newRole)) {
              loadFacultyTimetableData(parsedUser.id)
            }
          }
        }

        window.addEventListener("roleChange", handleRoleChange)
        return () => window.removeEventListener("roleChange", handleRoleChange)
      } catch (error) {
        console.error("Error initializing classes page:", error)
        toast({
          title: "Error",
          description: "Failed to load class data. Please refresh the page.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    initializeData()
  }, [toast, loadFacultyTimetableData])

  // Load weekly modifications when week changes
  useEffect(() => {
    if (user?.id) {
      loadWeeklyModifications(user.id, weekStartDate)
    }
  }, [user?.id, weekStartDate, loadWeeklyModifications])

  // FIXED: Handle URL params to auto-select a class - prevent infinite loops
  useEffect(() => {
    if (classIdParam && classes.length > 0 && !isLoadingStudents) {
      const selectedClass = classes.find((cls) => cls.id === classIdParam)
      if (selectedClass && selectedClass !== selectedClassForView) {
        handleViewStudents(selectedClass)
      }
    }
  }, [classIdParam, classes, handleViewStudents, isLoadingStudents, selectedClassForView])

  // FIXED: Load attendance data when students are ready - prevent loops
  useEffect(() => {
    if (selectedClassForView && realStudents.length > 0 && !isLoadingStudents) {
      console.log("🔄 Generating attendance data for real students:", realStudents.length)
      const attendanceData = generateAttendanceForRealStudents(
        selectedClassForView.id,
        selectedDate,
        realStudents,
        existingAttendance,
      )
      setAttendanceData(attendanceData)
      console.log("📊 Set attendance data:", attendanceData.length)
    }
  }, [
    selectedClassForView,
    selectedDate,
    realStudents,
    generateAttendanceForRealStudents,
    isLoadingStudents,
    existingAttendance,
  ])

  // Get class for a specific day and time slot
  const getClassForDayAndTimeSlot = useCallback(
    (day: string, timeSlotId: string) => {
      return classes.find((cls) => cls.day === day && cls.timeSlotId === timeSlotId) || null
    },
    [classes],
  )

  // Handle attendance change
  const handleAttendanceChange = useCallback(
    (studentId: string, status: AttendanceStatus) => {
      if (!selectedClassForView) return

      setAttendanceData((prevData) =>
        prevData.map((record) => (record.studentId === studentId ? { ...record, status } : record)),
      )
    },
    [selectedClassForView],
  )

  // FIXED: Handle save attendance using the correct course ID
  const handleSaveAttendance = useCallback(async () => {
    if (!selectedClassForView || !user) {
      toast({
        title: "Error",
        description: "Missing class or user information.",
        variant: "destructive",
      })
      return
    }

    if (attendanceData.length === 0) {
      toast({
        title: "Error",
        description: "No students found to mark attendance.",
        variant: "destructive",
      })
      return
    }

    // Check if trying to mark future attendance
    if (isFuture(selectedDate)) {
      toast({
        title: "Cannot mark future attendance",
        description: "You cannot mark attendance for future dates.",
        variant: "destructive",
      })
      return
    }

    // FIXED: Use the correct course ID for attendance saving
    const courseId = selectedCourseForAttendance

    if (!courseId) {
      toast({
        title: "Error",
        description: "Course information is missing. Please refresh and try again.",
        variant: "destructive",
      })
      return
    }

    try {
      const dateString = selectedDate.toISOString().split("T")[0]

      console.log("💾 Starting attendance save via API:", {
        courseId,
        date: dateString,
        userId: user.id,
        studentCount: attendanceData.length,
        mode: attendanceMode,
      })

      // Call the API route
      const response = await fetch("/api/attendance/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId,
          date: dateString,
          userId: user.id,
          attendanceRecords: attendanceData,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        console.error("❌ API Error:", result)
        throw new Error(result.error || "Failed to save attendance")
      }

      console.log("✅ API Response:", result)

      // Save to localStorage as backup
      const weekKey = format(startOfWeek(selectedDate, { weekStartsOn: 1 }), "yyyy-MM-dd")
      const storageKey = `${selectedClassForView.id}-${dateString}-week-${weekKey}`
      const backupData = attendanceData.map((record) => ({
        ...record,
        weekKey,
        savedAt: new Date().toISOString(),
      }))
      localStorage.setItem(`attendance-${storageKey}`, JSON.stringify(backupData))

      // FIXED: Properly refresh the existing attendance data after saving
      console.log("🔄 Refreshing attendance data after save...")

      // Wait a moment for the database to be consistent
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const updatedAttendanceData = await checkExistingAttendance(courseId, dateString)
      console.log("📊 Updated attendance data:", updatedAttendanceData)
      setExistingAttendance(updatedAttendanceData)

      // FIXED: Update attendance mode based on the API response and verification
      if (
        result.isUpdate ||
        (updatedAttendanceData &&
          updatedAttendanceData.attendance_records &&
          updatedAttendanceData.attendance_records.length > 0)
      ) {
        setAttendanceMode("edit")
        console.log("✏️ Attendance saved successfully - switched to edit mode")
      } else {
        setAttendanceMode("mark")
        console.log("📝 Attendance saved but no records found - staying in mark mode")
      }

      toast({
        title: `Attendance ${result.isUpdate ? "updated" : "saved"} successfully! ✅`,
        description: `Attendance for ${selectedClassForView.name} on ${format(selectedDate, "MMM d, yyyy")} has been ${result.isUpdate ? "updated" : "saved"} for ${result.recordsCount || attendanceData.length} students.`,
      })

      console.log("✅ Attendance save completed successfully via API")
    } catch (error) {
      console.error("❌ Error saving attendance via API:", error)
      toast({
        title: "Error saving attendance",
        description: error instanceof Error ? error.message : "Failed to save attendance. Please try again.",
        variant: "destructive",
      })
    }
  }, [
    selectedClassForView,
    selectedDate,
    attendanceData,
    toast,
    user,
    selectedCourseForAttendance,
    attendanceMode,
    checkExistingAttendance,
  ])

  // Filter students based on search query
  const filteredStudents = useMemo(() => {
    if (!searchQuery) return attendanceData

    const query = searchQuery.toLowerCase()
    return attendanceData.filter(
      (student) =>
        student.studentName.toLowerCase().includes(query) || student.studentUSN.toLowerCase().includes(query),
    )
  }, [attendanceData, searchQuery])

  // Calculate attendance statistics
  const attendanceStats = useMemo(() => {
    const presentCount = attendanceData.filter((s) => s.status === "present").length
    const absentCount = attendanceData.filter((s) => s.status === "absent").length
    const eventCount = attendanceData.filter((s) => s.status === "event").length
    const totalStudents = attendanceData.length
    const attendancePercentage = totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0

    return { presentCount, absentCount, eventCount, totalStudents, attendancePercentage }
  }, [attendanceData])

  // Handle drag start
  const handleDragStart = useCallback((classEvent: ClassEvent) => {
    setDraggedClass(classEvent)
    setIsDragging(true)
  }, [])

  // Handle drag over
  const handleDragOver = useCallback((e: React.DragEvent, day: string, timeSlotId: string) => {
    e.preventDefault()

    // Only allow dropping in non-break slots
    const isBreakSlot = timeSlots.find((slot) => slot.id === timeSlotId)?.isBreak
    if (isBreakSlot) {
      e.dataTransfer.dropEffect = "none"
      setDragOverCell(null)
    } else {
      e.dataTransfer.dropEffect = "move"
      setDragOverCell({ day, timeSlotId })
    }
  }, [])

  // Handle drop - Updated to use Supabase
  const handleDrop = useCallback(
    async (e: React.DragEvent, day: string, timeSlotId: string) => {
      e.preventDefault()
      setDragOverCell(null)
      setIsDragging(false)

      if (!draggedClass || !user?.id) return

      // Check if the target slot is a break slot
      const isBreakSlot = timeSlots.find((slot) => slot.id === timeSlotId)?.isBreak
      if (isBreakSlot) return

      // Check if there's already a class in this slot
      const existingClass = getClassForDayAndTimeSlot(day, timeSlotId)
      if (existingClass && existingClass.id !== draggedClass.id) {
        toast({
          title: "Cannot move class",
          description: "There is already a class scheduled in this time slot.",
          variant: "destructive",
        })
        return
      }

      // Don't move if it's the same position
      if (draggedClass.day === day && draggedClass.timeSlotId === timeSlotId) {
        setDraggedClass(null)
        return
      }

      try {
        // Get current week key
        const weekKey = format(weekStartDate, "yyyy-MM-dd")

        // Create the moved class data
        const movedClassData = {
          ...draggedClass,
          day,
          timeSlotId,
          isModified: true, // Mark as modified for this week
        }

        // Save to Supabase
        const { error } = await weeklyTimetableModificationsService.saveWeeklyModification(
          user.id,
          weekKey,
          draggedClass.id,
          movedClassData,
        )

        if (error) {
          console.error("Error saving weekly modification:", error)
          toast({
            title: "Error",
            description: "Failed to save class modification. Please try again.",
            variant: "destructive",
          })
          return
        }

        // Update local state
        setWeeklyModifications((prev) => {
          const currentModifications = prev[weekKey] || []
          const updatedModifications = currentModifications.filter((mod) => mod.id !== draggedClass.id)
          updatedModifications.push(movedClassData)

          return {
            ...prev,
            [weekKey]: updatedModifications,
          }
        })

        toast({
          title: "Class moved",
          description: `${draggedClass.name} has been moved to ${day} at ${timeSlots.find((slot) => slot.id === timeSlotId)?.start} for this week only.`,
        })
      } catch (error) {
        console.error("Error moving class:", error)
        toast({
          title: "Error",
          description: "Failed to move class. Please try again.",
          variant: "destructive",
        })
      }

      setDraggedClass(null)
    },
    [draggedClass, getClassForDayAndTimeSlot, toast, weekStartDate, user?.id],
  )

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    setDraggedClass(null)
    setDragOverCell(null)
    setIsDragging(false)
  }, [])

  // Handle cell click for viewing classes only
  const handleCellClick = useCallback(
    (day: string, timeSlotId: string) => {
      // Check if the slot is a break slot
      const isBreakSlot = timeSlots.find((slot) => slot.id === timeSlotId)?.isBreak
      if (isBreakSlot) return

      // Check if there's already a class in this slot
      const existingClass = getClassForDayAndTimeSlot(day, timeSlotId)
      if (existingClass) {
        // If there's a class, select it for viewing and load students
        handleViewStudents(existingClass)
        return
      }

      // For real data, we don't allow adding classes through the UI
      toast({
        title: "No class scheduled",
        description: "There is no class scheduled for this time slot.",
      })
    },
    [getClassForDayAndTimeSlot, toast, handleViewStudents],
  )

  // Navigate to previous week
  const goToPreviousWeek = () => {
    setWeekStartDate(subWeeks(weekStartDate, 1))
  }

  // Navigate to next week
  const goToNextWeek = () => {
    setWeekStartDate(addWeeks(weekStartDate, 1))
  }

  // Navigate to today
  const goToToday = () => {
    setWeekStartDate(startOfWeek(new Date(), { weekStartsOn: 1 }))
    setSelectedDate(new Date())
  }

  // Export attendance data as CSV
  const exportAsCSV = () => {
    if (reportStudents.length === 0) {
      toast({
        title: "No data to export",
        description: "There is no attendance data to export.",
        variant: "destructive",
      })
      return
    }

    // Create CSV content
    const headers = ["USN", "Student Name", "Present Days", "Absent Days", "Total Classes", "Attendance %", "Status"]
    const csvContent = [
      headers.join(","),
      ...reportStudents.map((student) =>
        [
          student.usn,
          `"${student.name}"`,
          student.presentDays,
          student.absentDays,
          student.totalDays,
          student.attendancePercentage,
          student.attendancePercentage >= 85 ? "Excellent" : student.attendancePercentage >= 75 ? "Good" : "At Risk",
        ].join(","),
      ),
    ].join("\n")

    // Create a blob and download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute(
      "download",
      `attendance_report_${reportFilters.academicYear}_sem${reportFilters.semester}_${reportFilters.section}.csv`,
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Export successful",
      description: "Attendance report has been exported as CSV.",
    })
  }

  // Export class attendance data as CSV
  const exportAttendanceAsCSV = (classId: string | undefined) => {
    if (!classId || attendanceData.length === 0) {
      toast({
        title: "No data to export",
        description: "There is no attendance data to export.",
        variant: "destructive",
      })
      return
    }

    // Create CSV content
    const headers = ["USN", "Student Name", "Attendance Status"]
    const csvContent = [
      headers.join(","),
      ...attendanceData.map((student) => [student.studentUSN, `"${student.studentName}"`, student.status].join(",")),
    ].join("\n")

    // Create a blob and download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute(
      "download",
      `class_attendance_${selectedClassForView?.code}_${format(selectedDate, "yyyy-MM-dd")}.csv`,
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Export successful",
      description: "Class attendance has been exported as CSV.",
    })
  }

  // Function to reset weekly modifications - Updated to use Supabase
  const resetWeeklyModifications = async () => {
    if (!user?.id) return

    const weekKey = format(weekStartDate, "yyyy-MM-dd")
    const confirmation = window.confirm(
      "Are you sure you want to reset the timetable for this week? This action cannot be undone.",
    )

    if (confirmation) {
      try {
        const { error } = await weeklyTimetableModificationsService.resetWeeklyModifications(user.id, weekKey)

        if (error) {
          console.error("Error resetting weekly modifications:", error)
          toast({
            title: "Error",
            description: "Failed to reset timetable. Please try again.",
            variant: "destructive",
          })
          return
        }

        // Update local state
        setWeeklyModifications((prev) => {
          const updatedModifications = { ...prev }
          delete updatedModifications[weekKey]
          return updatedModifications
        })

        toast({
          title: "Timetable reset",
          description: "The timetable for this week has been reset to the original schedule.",
        })
      } catch (error) {
        console.error("Error resetting weekly modifications:", error)
        toast({
          title: "Error",
          description: "Failed to reset timetable. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  // Handle component selection for subjects with both theory and lab
  const handleComponentSelection = (componentType: string) => {
    if (subjectForComponentSelection) {
      loadStudentsForSubject(subjectForComponentSelection, componentType, selectedSectionForView)
    }
    setIsComponentSelectionDialogOpen(false)
    setSubjectForComponentSelection(null)
  }

  // Permission check using activeRole
  if (!user || !activeRole || !["faculty", "hod", "coordinator", "principal"].includes(activeRole)) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Classes</h1>
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  const today = new Date()

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Class Schedule</h1>
          <p className="text-muted-foreground">Loading your class schedule...</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Class Schedule</h1>
          <p className="text-muted-foreground">Manage your classes and student attendance.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={goToPreviousWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={goToNextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <div className="text-sm font-medium">
            {format(weekStartDate, "MMM d")} - {format(addDays(weekStartDate, 5), "MMM d, yyyy")}
          </div>
          {weeklyModifications[format(weekStartDate, "yyyy-MM-dd")]?.length > 0 && (
            <Button variant="outline" size="sm" onClick={resetWeeklyModifications}>
              Reset Week
            </Button>
          )}
          <Button variant="default" size="sm" className="ml-2" onClick={() => setReportDialogOpen(true)}>
            View Report
          </Button>
        </div>
      </div>

      {/* Faculty Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Classes Scheduled</p>
                <p className="text-2xl font-bold">{facultyStats.totalClassesScheduled}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Classes Conducted</p>
                <p className="text-2xl font-bold">{facultyStats.classesConducted}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Total Students</p>
                <p className="text-2xl font-bold">{realStudents.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium">Avg Attendance</p>
                <p className="text-2xl font-bold">{facultyStats.averageAttendance}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <div className="min-w-[800px]">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700 p-2 text-left w-20">
                    Time
                  </th>
                  {timeSlots.map((slot) => (
                    <th
                      key={slot.id}
                      className={`border border-gray-200 dark:border-gray-700 p-2 text-center ${
                        slot.isBreak ? "bg-gray-100 dark:bg-gray-800/50" : "bg-gray-50 dark:bg-gray-800"
                      }`}
                    >
                      {slot.start} - {slot.end}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {weekDays.map((date) => {
                  const dayName = format(date, "EEE")
                  const dayDate = format(date, "d")
                  const fullDayName = format(date, "EEEE")
                  const isToday = isSameDay(date, today)

                  return (
                    <tr key={dayName}>
                      <td
                        className={`border border-gray-200 dark:border-gray-700 p-2 font-medium ${
                          isToday
                            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200"
                            : "bg-gray-50 dark:bg-gray-800"
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="font-bold">{dayName}</span>
                          <span className="text-xs opacity-80">{dayDate}</span>
                        </div>
                      </td>
                      {timeSlots.map((slot) => {
                        const isBreakSlot = slot.isBreak
                        const classEvent = getClassForDayAndTimeSlot(fullDayName, slot.id)
                        const isDragOver = dragOverCell?.day === fullDayName && dragOverCell?.timeSlotId === slot.id
                        const isDraggedClass = draggedClass?.id === classEvent?.id

                        return (
                          <td
                            key={slot.id}
                            className={`border border-gray-200 dark:border-gray-700 p-1 h-16 relative ${
                              isBreakSlot
                                ? "bg-gray-100 dark:bg-gray-800/50"
                                : isDragOver
                                  ? "bg-blue-100 dark:bg-blue-900/30"
                                  : "bg-white dark:bg-gray-900"
                            } ${isDraggedClass ? "opacity-50" : ""}`}
                            onDragOver={(e) => handleDragOver(e, fullDayName, slot.id)}
                            onDrop={(e) => handleDrop(e, fullDayName, slot.id)}
                            onClick={() => handleCellClick(fullDayName, slot.id)}
                          >
                            {isBreakSlot ? (
                              <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                                {slot.breakType === "coffee" ? (
                                  <div className="flex flex-col items-center">
                                    <Coffee className="h-4 w-4" />
                                    <span className="text-xs mt-1">COFFEE BREAK</span>
                                  </div>
                                ) : (
                                  <div className="flex flex-col items-center">
                                    <Utensils className="h-4 w-4" />
                                    <span className="text-xs mt-1">LUNCH BREAK</span>
                                  </div>
                                )}
                              </div>
                            ) : classEvent ? (
                              <div
                                className="h-full w-full rounded p-2 text-white text-xs cursor-pointer hover:opacity-80 transition-opacity"
                                style={{ backgroundColor: classEvent.color }}
                                draggable
                                onDragStart={() => handleDragStart(classEvent)}
                                onDragEnd={handleDragEnd}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleViewStudents(classEvent)
                                }}
                              >
                                <div className="font-semibold truncate">{classEvent.code}</div>
                                <div className="truncate">{classEvent.name}</div>
                                <div className="text-xs opacity-90">{classEvent.room}</div>
                                <div className="text-xs opacity-90">
                                  Sem {classEvent.semester} - Sec {classEvent.section}
                                </div>
                                {classEvent.batch && <div className="text-xs opacity-90">{classEvent.batch}</div>}
                                {classEvent.isModified && (
                                  <div className="absolute top-0 right-0 w-2 h-2 bg-yellow-400 rounded-full"></div>
                                )}
                              </div>
                            ) : null}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Selected Class Details */}
      {selectedClassForView && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: selectedClassForView.color }}></div>
                <CardTitle>{selectedClassForView.name}</CardTitle>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <span>•</span>
                  <span>
                    {selectedClassForView.code} • Section {selectedClassForView.section} • Semester{" "}
                    {selectedClassForView.semester}
                    {selectedClassForView.batch && ` • Batch ${selectedClassForView.batch}`}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {/* Show different buttons based on attendance mode and date */}
                {isFuture(selectedDate) ? (
                  <div className="text-sm text-muted-foreground bg-gray-100 px-3 py-1 rounded">
                    Future Date - Cannot Mark Attendance
                  </div>
                ) : existingAttendance &&
                  existingAttendance.attendance_records &&
                  existingAttendance.attendance_records.length > 0 ? (
                  <div className="flex items-center space-x-2">
                    <div className="text-sm text-green-600 bg-green-100 px-3 py-1 rounded flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Attendance Marked
                    </div>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View/Edit
                    </Button>
                  </div>
                ) : (
                  <div className="text-sm text-blue-600 bg-blue-100 px-3 py-1 rounded">Ready to Mark Attendance</div>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Class Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Date</p>
                  <p className="text-sm text-muted-foreground">{format(selectedDate, "MMMM d, yyyy")}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Time</p>
                  <p className="text-sm text-muted-foreground">
                    {timeSlots.find((slot) => slot.id === selectedClassForView.timeSlotId)?.start} -{" "}
                    {timeSlots.find((slot) => slot.id === selectedClassForView.timeSlotId)?.end}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Room</p>
                  <p className="text-sm text-muted-foreground">{selectedClassForView.room}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Faculty</p>
                  <p className="text-sm text-muted-foreground">{selectedClassForView.faculty}</p>
                </div>
              </div>
            </div>

            {/* Attendance Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Attendance</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{attendanceStats.totalStudents}</div>
                    <div className="text-sm text-muted-foreground">Total Students</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{attendanceStats.presentCount}</div>
                    <div className="text-sm text-muted-foreground">Present</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-red-600">{attendanceStats.absentCount}</div>
                    <div className="text-sm text-muted-foreground">Absent</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-orange-600">{attendanceStats.eventCount}</div>
                    <div className="text-sm text-muted-foreground">Event</div>
                  </CardContent>
                </Card>
              </div>

              {/* Student List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-md font-medium">Student List</h4>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search students..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8 w-64"
                      />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Export
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => exportAttendanceAsCSV(selectedClassForView.id)}>
                          <FileText className="h-4 w-4 mr-2" />
                          Export as CSV
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {loadingStudents ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="border rounded-lg">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="text-left p-3 font-medium">USN</th>
                          <th className="text-left p-3 font-medium">Student Name</th>
                          <th className="text-left p-3 font-medium">Attendance Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredStudents.length > 0 ? (
                          filteredStudents.map((student) => (
                            <tr key={student.studentId} className="border-b hover:bg-muted/50">
                              <td className="p-3">{student.studentUSN}</td>
                              <td className="p-3">{student.studentName}</td>
                              <td className="p-3">
                                {attendanceMode === "view" && isFuture(selectedDate) ? (
                                  <div className="text-sm text-muted-foreground">Cannot mark future attendance</div>
                                ) : (
                                  <Select
                                    value={student.status}
                                    onValueChange={(value: AttendanceStatus) =>
                                      handleAttendanceChange(student.studentId, value)
                                    }
                                  >
                                    <SelectTrigger className="w-32">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="present">Present</SelectItem>
                                      <SelectItem value="absent">Absent</SelectItem>
                                      <SelectItem value="event">Event</SelectItem>
                                    </SelectContent>
                                  </Select>
                                )}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={3} className="p-8 text-center text-muted-foreground">
                              {enrolledStudents.length === 0
                                ? "No students enrolled in this class"
                                : "No students found"}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setSelectedClassForView(null)}>
              Close
            </Button>
            {!isFuture(selectedDate) && (
              <Button onClick={handleSaveAttendance} disabled={attendanceData.length === 0}>
                {attendanceMode === "edit" ? "Update Attendance" : "Save Attendance"}
              </Button>
            )}
          </CardFooter>
        </Card>
      )}

      {/* Component Selection Dialog */}
      <Dialog open={isComponentSelectionDialogOpen} onOpenChange={setIsComponentSelectionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Component Type</DialogTitle>
            <DialogDescription>
              This subject has both theory and lab components. Please select which component you want to view students
              for.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Button
              variant="outline"
              className="w-full justify-start bg-transparent"
              onClick={() => handleComponentSelection("theory")}
            >
              Theory Component
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start bg-transparent"
              onClick={() => handleComponentSelection("lab")}
            >
              Lab Component
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Attendance Report Dialog */}
      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Attendance Report</DialogTitle>
            <DialogDescription>Generate and view attendance reports for your classes.</DialogDescription>
          </DialogHeader>

          {!showReportView ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="academicYear">Academic Year</Label>
                  <Select
                    value={reportFilters.academicYear}
                    onValueChange={(value) => setReportFilters({ ...reportFilters, academicYear: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024-25 odd">2024-25 Odd</SelectItem>
                      <SelectItem value="2024-25 even">2024-25 Even</SelectItem>
                      <SelectItem value="2023-24 odd">2023-24 Odd</SelectItem>
                      <SelectItem value="2023-24 even">2023-24 Even</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="semester">Semester</Label>
                  <Select
                    value={reportFilters.semester}
                    onValueChange={(value) => setReportFilters({ ...reportFilters, semester: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                        <SelectItem key={sem} value={sem.toString()}>
                          Semester {sem}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="section">Section</Label>
                  <Select
                    value={reportFilters.section}
                    onValueChange={(value) => setReportFilters({ ...reportFilters, section: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">Section A</SelectItem>
                      <SelectItem value="B">Section B</SelectItem>
                      <SelectItem value="C">Section C</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="courseCode">Course Code (Optional)</Label>
                  <Input
                    id="courseCode"
                    placeholder="e.g., CS101"
                    value={reportFilters.courseCode}
                    onChange={(e) => setReportFilters({ ...reportFilters, courseCode: e.target.value })}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">
                    Attendance Report - {reportFilters.academicYear} | Semester {reportFilters.semester} | Section{" "}
                    {reportFilters.section}
                    {reportFilters.courseCode && ` | ${reportFilters.courseCode}`}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Total Students: {reportStudents.length} | Average Attendance:{" "}
                    {Math.round(
                      reportStudents.reduce((sum, s) => sum + s.attendancePercentage, 0) / (reportStudents.length || 1),
                    )}
                    %
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search students..."
                      value={reportSearchQuery}
                      onChange={(e) => setReportSearchQuery(e.target.value)}
                      className="pl-8 w-64"
                    />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={exportAsCSV}>
                        <FileText className="h-4 w-4 mr-2" />
                        Export as CSV
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="border rounded-lg max-h-96 overflow-y-auto">
                <table className="w-full">
                  <thead className="sticky top-0 bg-background">
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-3 font-medium">USN</th>
                      <th className="text-left p-3 font-medium">Student Name</th>
                      <th className="text-center p-3 font-medium">Present Days</th>
                      <th className="text-center p-3 font-medium">Absent Days</th>
                      <th className="text-center p-3 font-medium">Total Classes</th>
                      <th className="text-center p-3 font-medium">Attendance %</th>
                      <th className="text-center p-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportStudents
                      .filter(
                        (student) =>
                          !reportSearchQuery ||
                          student.name.toLowerCase().includes(reportSearchQuery.toLowerCase()) ||
                          student.usn.toLowerCase().includes(reportSearchQuery.toLowerCase()),
                      )
                      .map((student) => (
                        <tr key={student.id} className="border-b hover:bg-muted/50">
                          <td className="p-3">{student.usn}</td>
                          <td className="p-3">{student.name}</td>
                          <td className="p-3 text-center">{student.presentDays}</td>
                          <td className="p-3 text-center">{student.absentDays}</td>
                          <td className="p-3 text-center">{student.totalDays}</td>
                          <td className="p-3 text-center">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                student.attendancePercentage >= 85
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                  : student.attendancePercentage >= 75
                                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                                    : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                              }`}
                            >
                              {student.attendancePercentage}%
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                student.attendancePercentage >= 85
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                  : student.attendancePercentage >= 75
                                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                                    : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                              }`}
                            >
                              {student.attendancePercentage >= 85
                                ? "Excellent"
                                : student.attendancePercentage >= 75
                                  ? "Good"
                                  : "At Risk"}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <DialogFooter>
            {!showReportView ? (
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setReportDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={generateAttendanceReport}>Generate Report</Button>
              </div>
            ) : (
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setShowReportView(false)}>
                  Back to Filters
                </Button>
                <Button variant="outline" onClick={() => setReportDialogOpen(false)}>
                  Close
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
