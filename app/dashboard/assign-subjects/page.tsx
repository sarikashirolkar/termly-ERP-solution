"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Users, BookOpen, Search, CheckCircle, XCircle, Loader2, Eye, Trash2, Plus, AlertTriangle } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { createClient } from "@supabase/supabase-js"
import { apiService } from "@/lib/supabase-service-new"
import type { SubjectType, DepartmentType, FacultyProfile, StudentProfile } from "@/lib/database-schema"
import { MultiSelect } from "@/components/multi-select"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

interface User {
  id: string
  name: string
  email: string
  role: string
  department?: string
}

interface SubjectWithAssignment extends SubjectType {
  assigned_faculty_ids?: string[]
  assigned_faculty_names?: string[]
  is_assigned: boolean
  theory_faculty_ids?: string[]
  theory_faculty_names?: string[]
  lab_faculty_ids?: string[]
  lab_faculty_names?: string[]
  section_assignments?: Record<
    string,
    {
      theory: string[]
      lab: string[]
    }
  >
}

interface CourseEnrollment {
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
}

export default function AssignSubjectsPage() {
  const [subjects, setSubjects] = useState<SubjectWithAssignment[]>([])
  const [departments, setDepartments] = useState<DepartmentType[]>([])
  const [faculty, setFaculty] = useState<FacultyProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSemester, setSelectedSemester] = useState("all")
  const [activeTab, setActiveTab] = useState("faculty")
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [isViewStudentsDialogOpen, setIsViewStudentsDialogOpen] = useState(false)
  const [isAddStudentsDialogOpen, setIsAddStudentsDialogOpen] = useState(false)
  const [isComponentSelectionDialogOpen, setIsComponentSelectionDialogOpen] = useState(false)

  // Add these state variables after the existing ones
  const [selectedBatch, setSelectedBatch] = useState("")
  const [requiresBatch, setRequiresBatch] = useState(false)
  const [subjectOptions, setSubjectOptions] = useState<any[]>([])
  const [selectedComponentType, setSelectedComponentType] = useState<string>("")
  const [subjectForComponentSelection, setSubjectForComponentSelection] = useState<SubjectType | null>(null)
  const [selectedSectionForView, setSelectedSectionForView] = useState<string>("")
  const [batchOptions, setBatchOptions] = useState<string[]>([])

  // Faculty assignment form state with enhanced lab batch support
  const [assignForm, setAssignForm] = useState({
    subject_id: "",
    academic_year: "",
    semester: "",
    department_id: "",
    section: "A",
    theory_faculty_ids: [] as string[],
    lab_faculty_ids: [] as string[],
    number_of_batches: 1,
    lab_batch_assignments: [] as Array<{ batchNumber: number; facultyIds: string[] }>,
  })

  // Student assignment form state - ENHANCED for cross-section assignments
  const [studentForm, setStudentForm] = useState({
    academic_year: "",
    semester: "",
    section: "A", // This is the section we're fetching students FROM
    target_section: "", // This is the section we're assigning students TO (for cross-section assignments)
    subjects: [] as string[],
  })

  // Student assignment workflow state
  const [fetchedStudents, setFetchedStudents] = useState<StudentProfile[]>([])
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [availableSubjects, setAvailableSubjects] = useState<SubjectType[]>([])
  const [selectedSubjectsForAssignment, setSelectedSubjectsForAssignment] = useState<string[]>([])
  const [studentWorkflowStep, setStudentWorkflowStep] = useState<"initial" | "students-loaded" | "assignment-ready">(
    "initial",
  )

  // View students state
  const [enrolledStudents, setEnrolledStudents] = useState<CourseEnrollment[]>([])
  const [selectedSubjectForView, setSelectedSubjectForView] = useState<SubjectType | null>(null)
  const [studentsToRemove, setStudentsToRemove] = useState<string[]>([])
  const [availableStudentsForAdd, setAvailableStudentsForAdd] = useState<StudentProfile[]>([])
  const [studentsToAdd, setStudentsToAdd] = useState<string[]>([])

  // Statistics
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalSubjects: 0,
    assignedSubjects: 0,
    unassignedSubjects: 0,
  })

  useEffect(() => {
    loadInitialData()
  }, [])

  // Academic year options - copied from manage-subjects
  const getAcademicYearOptions = () => {
    const currentYear = new Date().getFullYear()
    const options = []

    for (let i = 0; i < 3; i++) {
      const year = currentYear - i
      const nextYear = year + 1
      options.push(`${year}-${nextYear.toString().slice(-2)}(odd)`)
      options.push(`${year}-${nextYear.toString().slice(-2)}(even)`)
    }

    return options
  }

  // Get semester options based on academic year - copied from manage-subjects
  const getSemesterOptions = (academicYear: string) => {
    if (academicYear.includes("odd")) {
      return [1, 3, 5, 7]
    } else if (academicYear.includes("even")) {
      return [2, 4, 6, 8]
    }
    return [1, 2, 3, 4, 5, 6, 7, 8]
  }

  // Get section-specific batch options based on number of batches from subject
  const getBatchOptions = (section: string, numberOfBatches = 1) => {
    const sectionLetter = section.charAt(0)
    const options = []
    for (let i = 1; i <= numberOfBatches; i++) {
      options.push(`${sectionLetter}${i}`)
    }
    return options
  }

  // Initialize lab batch assignments when number of batches changes
  useEffect(() => {
    if (assignForm.number_of_batches > 0) {
      const newAssignments = []
      for (let i = 1; i <= assignForm.number_of_batches; i++) {
        const existing = assignForm.lab_batch_assignments.find((a) => a.batchNumber === i)
        newAssignments.push({
          batchNumber: i,
          facultyIds: existing?.facultyIds || [],
        })
      }
      setAssignForm((prev) => ({ ...prev, lab_batch_assignments: newAssignments }))
    }
  }, [assignForm.number_of_batches])

  const loadInitialData = async () => {
    try {
      setLoading(true)

      /* ------------------------------------------------------------------
       * 1. Get the current user from localStorage (client-side session).
       * ------------------------------------------------------------------ */
      const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null
      if (!storedUser) {
        toast({
          title: "Session required",
          description: "Please log in to assign subjects.",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      const userData = JSON.parse(storedUser) as {
        id: string
        first_name?: string
        last_name?: string
        email: string
        role: string
        department?: string
      }

      setCurrentUser({
        id: userData.id,
        name: `${userData.first_name || ""} ${userData.last_name || ""}`.trim() || userData.email,
        email: userData.email,
        role: userData.role,
        department: userData.department,
      })

      /* ------------------------------------------------------------------
       * 2. Load departments, faculty, & subjects with assignments
       * ------------------------------------------------------------------ */
      const [{ data: deptData, error: deptErr }, { data: facultyData, error: facErr }] = await Promise.all([
        apiService.departments.getAllDepartments(),
        apiService.faculty.getAll(),
      ])

      if (deptErr) throw deptErr
      if (facErr) throw facErr

      setDepartments(deptData || [])
      setFaculty(facultyData || [])

      await loadSubjectsWithAssignments(userData.role, userData.department)
      await calculateStats()
    } catch (error) {
      console.error("Error loading initial data:", error)
      toast({
        title: "Error",
        description: "Failed to load initial data. Please refresh or log in again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadSubjectsWithAssignments = async (userRole?: string, userDepartment?: string) => {
    try {
      const { data: subjectsData, error } = await apiService.subjects.getSubjectsWithAssignments(
        userRole,
        userDepartment,
      )
      if (error) throw error
      setSubjects(subjectsData || [])
    } catch (error) {
      console.error("Error loading subjects with assignments:", error)
      toast({
        title: "Error",
        description: "Failed to load subjects. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = async () => {
    try {
      // Get total students count
      const { data: studentsData, error: studentsError } = await apiService.students.getAll()
      if (studentsError) throw studentsError

      // Get total subjects count
      const { data: subjectsData, error: subjectsError } = await apiService.subjects.getAll()
      if (subjectsError) throw subjectsError

      const totalStudents = studentsData?.length || 0
      const totalSubjects = subjectsData?.length || 0
      const assignedSubjects = subjects.filter((s) => s.is_assigned).length
      const unassignedSubjects = totalSubjects - assignedSubjects

      setStats({
        totalStudents,
        totalSubjects,
        assignedSubjects,
        unassignedSubjects,
      })
    } catch (error) {
      console.error("Error calculating stats:", error)
    }
  }

  // Load existing faculty assignments for editing
  const loadExistingAssignments = async (subject: SubjectType, section: string) => {
    try {
      // Get existing courses for this subject and section
      const { data: courses, error: coursesError } = await supabase
        .from("courses")
        .select(`
          id,
          faculty_id,
          component_type,
          batch,
          academic_year,
          semester,
          section
        `)
        .eq("subject_id", subject.id)
        .eq("section", section)

      if (coursesError) throw coursesError

      if (!courses || courses.length === 0) {
        return {
          theory_faculty_ids: [],
          lab_batch_assignments: [],
          number_of_batches: subject.number_of_batches || 1,
        }
      }

      // Separate theory and lab courses
      const theoryCourses = courses.filter((c) => c.component_type === "theory")
      const labCourses = courses.filter((c) => c.component_type === "lab")

      // Get theory faculty IDs
      const theory_faculty_ids = [...new Set(theoryCourses.map((c) => c.faculty_id).filter(Boolean))]

      // Group lab courses by batch and get faculty assignments
      const batchMap = new Map<number, string[]>()
      let maxBatchNumber = 0

      labCourses.forEach((course) => {
        if (course.batch) {
          // Extract batch number from batch name (e.g., "A1" -> 1)
          const batchMatch = course.batch.match(/(\d+)$/)
          if (batchMatch) {
            const batchNumber = Number.parseInt(batchMatch[1])
            maxBatchNumber = Math.max(maxBatchNumber, batchNumber)

            if (!batchMap.has(batchNumber)) {
              batchMap.set(batchNumber, [])
            }
            if (course.faculty_id) {
              batchMap.get(batchNumber)!.push(course.faculty_id)
            }
          }
        }
      })

      // Create lab batch assignments
      const number_of_batches = Math.max(maxBatchNumber, subject.number_of_batches || 1)
      const lab_batch_assignments = []

      for (let i = 1; i <= number_of_batches; i++) {
        lab_batch_assignments.push({
          batchNumber: i,
          facultyIds: [...new Set(batchMap.get(i) || [])], // Remove duplicates
        })
      }

      return {
        theory_faculty_ids,
        lab_batch_assignments,
        number_of_batches,
      }
    } catch (error) {
      console.error("Error loading existing assignments:", error)
      return {
        theory_faculty_ids: [],
        lab_batch_assignments: [],
        number_of_batches: subject.number_of_batches || 1,
      }
    }
  }

  const handleAssignFaculty = async (subject: SubjectType) => {
    try {
      // Get department ID from department short name if needed
      let departmentId = ""
      if (subject.department) {
        const { data: department, error: deptError } = await supabase
          .from("departments")
          .select("id")
          .eq("short_name", subject.department)
          .single()

        if (!deptError && department) {
          departmentId = department.id
        }
      }

      // Load existing assignments for section A (default)
      const existingAssignments = await loadExistingAssignments(subject, "A")

      setAssignForm({
        subject_id: subject.id,
        academic_year: subject.academic_year || getAcademicYearOptions()[0] || "2024-25",
        semester: subject.semester.toString(),
        department_id: departmentId,
        section: "A",
        theory_faculty_ids: existingAssignments.theory_faculty_ids,
        lab_faculty_ids: [], // This is legacy, we use lab_batch_assignments now
        number_of_batches: existingAssignments.number_of_batches,
        lab_batch_assignments: existingAssignments.lab_batch_assignments,
      })
      setIsAssignDialogOpen(true)
    } catch (error) {
      console.error("Error preparing faculty assignment:", error)
      toast({
        title: "Error",
        description: "Failed to prepare assignment form. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Update assignments when section changes in the dialog
  const handleSectionChange = async (newSection: string) => {
    if (!assignForm.subject_id) return

    const subject = subjects.find((s) => s.id === assignForm.subject_id)
    if (!subject) return

    // Load existing assignments for the new section
    const existingAssignments = await loadExistingAssignments(subject, newSection)

    setAssignForm((prev) => ({
      ...prev,
      section: newSection,
      theory_faculty_ids: existingAssignments.theory_faculty_ids,
      number_of_batches: existingAssignments.number_of_batches,
      lab_batch_assignments: existingAssignments.lab_batch_assignments,
    }))
  }

  const handleSaveFacultyAssignment = async () => {
    try {
      setSaving(true)

      if (!assignForm.subject_id) {
        toast({
          title: "Error",
          description: "Please select a subject.",
          variant: "destructive",
        })
        return
      }

      if (
        assignForm.theory_faculty_ids.length === 0 &&
        assignForm.lab_batch_assignments.every((batch) => batch.facultyIds.length === 0)
      ) {
        toast({
          title: "Error",
          description: "Please assign at least one faculty member.",
          variant: "destructive",
        })
        return
      }

      // Use the enhanced upsertFacultyAssignments method with batch support
      const { error } = await apiService.courses.upsertFacultyAssignments(
        assignForm.subject_id,
        assignForm.academic_year,
        Number.parseInt(assignForm.semester),
        assignForm.department_id,
        assignForm.section,
        assignForm.theory_faculty_ids,
        assignForm.lab_batch_assignments,
      )

      if (error) {
        console.error("Error saving faculty assignment:", error)
        toast({
          title: "Error",
          description: `Failed to save assignment: ${error.message || "Unknown error"}`,
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Success",
        description: "Faculty assignment saved successfully!",
      })

      setIsAssignDialogOpen(false)
      // Immediately reload subjects to reflect changes
      await loadSubjectsWithAssignments(currentUser?.role, currentUser?.department)
      await calculateStats()
    } catch (error) {
      console.error("Error in handleSaveFacultyAssignment:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  // ENHANCED: Fetch students with support for cross-section assignments
  const handleFetchStudents = async () => {
    try {
      if (!studentForm.semester || !studentForm.section) {
        toast({
          title: "Error",
          description: "Please select semester and section.",
          variant: "destructive",
        })
        return
      }

      setLoading(true)

      // Fetch students by semester and section
      const { data: studentsData, error: studentsError } = await apiService.students.getBySemesterAndSection(
        Number.parseInt(studentForm.semester),
        studentForm.section,
      )

      if (studentsError) throw studentsError

      setFetchedStudents(studentsData || [])

      // ENHANCED: Fetch available subjects for ALL sections in the semester (not just student's section)
      // This allows cross-section assignments
      const { data: allSubjectsData, error: allSubjectsError } = await supabase
        .from("subjects")
        .select("*")
        .eq("semester", Number.parseInt(studentForm.semester))
        .eq("academic_year", studentForm.academic_year || "2024-25")

      if (allSubjectsError) throw allSubjectsError

      setAvailableSubjects(allSubjectsData || [])
      setStudentWorkflowStep("students-loaded")

      toast({
        title: "Success",
        description: `Found ${studentsData?.length || 0} students. You can now assign them to subjects from any section.`,
      })
    } catch (error) {
      console.error("Error fetching students:", error)
      toast({
        title: "Error",
        description: "Failed to fetch students. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // ENHANCED: Handle cross-section student assignments
  const handleAssignStudentsToSubjects = async () => {
    try {
      if (selectedStudents.length === 0) {
        toast({
          title: "Error",
          description: "Please select at least one student.",
          variant: "destructive",
        })
        return
      }

      if (selectedSubjectsForAssignment.length === 0) {
        toast({
          title: "Error",
          description: "Please select at least one subject.",
          variant: "destructive",
        })
        return
      }

      // Validate batch selection for lab subjects
      const hasLabSubjects = selectedSubjectsForAssignment.some((s) => s.includes(":lab"))
      if (hasLabSubjects && !selectedBatch) {
        toast({
          title: "Error",
          description: "Please select a batch for lab subjects.",
          variant: "destructive",
        })
        return
      }

      setSaving(true)

      // ENHANCED: Get subject options for assignment from ALL sections
      const { data: subjectOptions, error: subjectOptionsError } = await supabase
        .from("subjects")
        .select(`
          id,
          code,
          name,
          semester,
          academic_year,
          has_theory,
          has_lab,
          has_project,
          number_of_batches
        `)
        .eq("semester", Number.parseInt(studentForm.semester))
        .eq("academic_year", studentForm.academic_year || "2024-25")

      if (subjectOptionsError) throw subjectOptionsError

      // Process each selected subject-component combination
      for (const subjectValue of selectedSubjectsForAssignment) {
        const [subjectId, componentType] = subjectValue.split(":")
        const subjectOption = subjectOptions?.find((opt) => opt.id === subjectId)

        if (!subjectOption) continue

        console.log(`Processing assignment for subject: ${subjectOption.code} (${componentType})`)

        // ENHANCED: Find courses for this subject and component type across ALL sections
        let coursesQuery = supabase
          .from("courses")
          .select("id, batch, faculty_id, section, academic_year, semester")
          .eq("subject_id", subjectId)
          .eq("component_type", componentType)
          .eq("academic_year", studentForm.academic_year || "2024-25")
          .eq("semester", Number.parseInt(studentForm.semester))

        // For lab subjects, filter by the selected batch if specified
        if (componentType === "lab" && selectedBatch) {
          coursesQuery = coursesQuery.eq("batch", selectedBatch)
        }

        const { data: courses, error: coursesError } = await coursesQuery

        if (coursesError) {
          console.error("Error fetching courses:", coursesError)
          continue
        }

        console.log(`Found ${courses?.length || 0} courses for ${subjectOption.code} (${componentType})`)

        // Check if courses exist and have faculty assigned
        if (!courses || courses.length === 0) {
          toast({
            title: "Warning",
            description: `No courses found for ${subjectOption.name} (${componentType})${componentType === "lab" && selectedBatch ? ` batch ${selectedBatch}` : ""}. Please ensure faculty are assigned first.`,
            variant: "destructive",
          })
          continue
        }

        // Check if all courses have faculty assigned
        const coursesWithoutFaculty = courses.filter((c) => !c.faculty_id)
        if (coursesWithoutFaculty.length > 0) {
          toast({
            title: "Warning",
            description: `Subject ${subjectOption.name} (${componentType}) has courses without faculty assigned. Please assign faculty first.`,
            variant: "destructive",
          })
          continue
        }

        // ENHANCED: Use the enhanced enrollment method with proper cross-section support
        const courseIds = courses.map((c) => c.id)
        const batchForEnrollment = componentType === "lab" ? selectedBatch : undefined

        console.log(`Enrolling ${selectedStudents.length} students in ${courseIds.length} courses`)
        console.log(`Course IDs: ${courseIds.join(", ")}`)
        console.log(`Batch: ${batchForEnrollment || "N/A"}`)

        const { error: enrollmentError } = await apiService.courses.enrollStudentsInCourses(
          courseIds,
          selectedStudents,
          batchForEnrollment,
        )

        if (enrollmentError) {
          console.error("Error creating course enrollments:", enrollmentError)
          toast({
            title: "Error",
            description: `Failed to enroll students in ${subjectOption.name} (${componentType}): ${enrollmentError.message}`,
            variant: "destructive",
          })
          continue
        }

        console.log(`Successfully enrolled students in ${subjectOption.code} (${componentType})`)
      }

      toast({
        title: "Success",
        description: "Students assigned to subjects successfully! Cross-section assignments are now active.",
      })

      // Reset form and immediately update the UI
      setSelectedStudents([])
      setSelectedSubjectsForAssignment([])
      setStudentWorkflowStep("initial")
      setFetchedStudents([])
      setSelectedBatch("")

      // Immediately reload subjects to reflect the updated assignments
      await loadSubjectsWithAssignments(currentUser?.role, currentUser?.department)
    } catch (error) {
      console.error("Error assigning students to subjects:", error)
      toast({
        title: "Error",
        description: "Failed to assign students. Please try again.",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleViewStudents = (subject: SubjectType, section?: string) => {
    // If section is provided, directly load students for that section
    if (section) {
      setSelectedSectionForView(section)
      // Check if subject has both theory and lab components
      if (subject.has_theory && subject.has_lab) {
        setSubjectForComponentSelection(subject)
        setIsComponentSelectionDialogOpen(true)
      } else {
        // Determine component type
        const componentType = subject.has_lab ? "lab" : "theory"
        loadStudentsForSubject(subject, componentType, section)
      }
    } else {
      // Original behavior for general view
      if (subject.has_theory && subject.has_lab) {
        setSubjectForComponentSelection(subject)
        setIsComponentSelectionDialogOpen(true)
      } else {
        // Determine component type
        const componentType = subject.has_lab ? "lab" : "theory"
        loadStudentsForSubject(subject, componentType)
      }
    }
  }

  const handleComponentSelection = (componentType: string) => {
    if (subjectForComponentSelection) {
      loadStudentsForSubject(subjectForComponentSelection, componentType, selectedSectionForView)
    }
    setIsComponentSelectionDialogOpen(false)
    setSubjectForComponentSelection(null)
  }

  // ENHANCED: Load students for subject with cross-section support
  const loadStudentsForSubject = async (subject: SubjectType, componentType: string, section?: string) => {
    try {
      setLoading(true)
      setSelectedSubjectForView(subject)
      setSelectedComponentType(componentType)

      // ENHANCED: Get courses for this subject and component type across ALL sections if no specific section
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
        .eq("subject_id", subject.id)
        .eq("component_type", componentType)

      if (section) {
        coursesQuery = coursesQuery.eq("section", section)
      }

      const { data: courses, error: coursesError } = await coursesQuery

      if (coursesError) throw coursesError

      if (!courses || courses.length === 0) {
        setEnrolledStudents([])
        setIsViewStudentsDialogOpen(true)
        return
      }

      // Get course IDs
      const courseIds = courses.map((c) => c.id)

      // ENHANCED: Get enrollments for these courses (cross-section support)
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

      // ENHANCED: Get student details - support students from different sections
      const studentIds = [...new Set(enrollments?.map((e) => e.student_id) || [])]
      if (studentIds.length === 0) {
        setEnrolledStudents([])
        setIsViewStudentsDialogOpen(true)
        return
      }

      // Use explicit join to avoid relationship ambiguity
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

      // Get faculty details for all courses to show all faculty names per batch
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

      // Create batch-to-faculty mapping for lab subjects
      const batchFacultyMap = new Map<string, string[]>()
      courses.forEach((course) => {
        if (course.component_type === "lab" && course.batch && course.faculty_id) {
          const facultyName = facultyMap.get(course.faculty_id)
          if (facultyName) {
            if (!batchFacultyMap.has(course.batch)) {
              batchFacultyMap.set(course.batch, [])
            }
            if (!batchFacultyMap.get(course.batch)!.includes(facultyName)) {
              batchFacultyMap.get(course.batch)!.push(facultyName)
            }
          }
        }
      })

      // Create student map
      const studentMap = new Map()
      const userMap = new Map()

      students?.forEach((student) => {
        studentMap.set(student.user_id, student)
      })

      users?.forEach((user) => {
        userMap.set(user.id, user)
      })

      // Remove duplicates by creating a unique set based on student_id only
      const uniqueEnrollments = new Map()
      enrollments?.forEach((enrollment) => {
        const key = enrollment.student_id
        if (!uniqueEnrollments.has(key)) {
          uniqueEnrollments.set(key, enrollment)
        }
      })

      // ENHANCED: Combine enrollment and student data with cross-section support
      const enrichedEnrollments = Array.from(uniqueEnrollments.values()).map((enrollment) => {
        const student = studentMap.get(enrollment.student_id)
        const user = userMap.get(enrollment.student_id)

        // Get all faculty names for this batch (for lab) or single faculty (for theory)
        let facultyNames = ""
        if (componentType === "lab" && enrollment.batch) {
          const batchFaculty = batchFacultyMap.get(enrollment.batch) || []
          facultyNames = batchFaculty.join(", ")
        } else {
          // For theory, get faculty from the course
          const course = courses.find((c) => c.id === enrollment.course_id)
          if (course && course.faculty_id) {
            facultyNames = facultyMap.get(course.faculty_id) || ""
          }
        }

        // ENHANCED: Include student's original section info for cross-section identification
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
          faculty_names: facultyNames,
          // Prioritize batch from course_enrollments over courses table
          batch: enrollment.batch || enrollment.courses.batch,
          // Add cross-section indicator
          is_cross_section: studentOriginalSection !== courseSection,
        }
      })

      setEnrolledStudents(enrichedEnrollments)
      setIsViewStudentsDialogOpen(true)
    } catch (error) {
      console.error("Error loading students for subject:", error)
      toast({
        title: "Error",
        description: "Failed to load students. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveStudents = async () => {
    try {
      if (studentsToRemove.length === 0) {
        toast({
          title: "Error",
          description: "Please select students to remove.",
          variant: "destructive",
        })
        return
      }

      setSaving(true)

      // Update enrollments to inactive
      const { error } = await supabase
        .from("course_enrollments")
        .update({ is_active: false })
        .in("id", studentsToRemove)

      if (error) throw error

      toast({
        title: "Success",
        description: "Students removed successfully!",
      })

      // Reload students and immediately update subjects list
      if (selectedSubjectForView) {
        await loadStudentsForSubject(selectedSubjectForView, selectedComponentType, selectedSectionForView)
      }
      setStudentsToRemove([])

      // Immediately reload subjects to reflect changes
      await loadSubjectsWithAssignments(currentUser?.role, currentUser?.department)
    } catch (error) {
      console.error("Error removing students:", error)
      toast({
        title: "Error",
        description: "Failed to remove students. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  // ENHANCED: Handle adding students with cross-section support
  const handleAddStudents = async () => {
    try {
      if (!selectedSubjectForView) return

      setLoading(true)

      // ENHANCED: Get students from ALL sections in the same semester (not just the course section)
      const { data: allStudents, error: studentsError } = await supabase
        .from("students")
        .select(`
          user_id,
          usn,
          roll_number,
          semester,
          section,
          batch,
          users!inner(
            id,
            first_name,
            last_name,
            email,
            department,
            is_active
          )
        `)
        .eq("semester", selectedSubjectForView.semester)
        .eq("users.is_active", true)

      if (studentsError) throw studentsError

      // Transform to StudentProfile format
      const transformedStudents: StudentProfile[] =
        allStudents?.map((student) => ({
          user_id: student.user_id,
          id: student.user_id,
          name: `${student.users.first_name || ""} ${student.users.last_name || ""}`.trim(),
          usn: student.usn,
          email: student.users.email || "",
          phone: "",
          department: student.users.department || "N/A",
          semester: student.semester,
          section: student.section,
          batch: student.batch,
          enrollmentDate: "",
          profilePicture: "/placeholder.svg?height=40&width=40",
          is_active: student.users.is_active,
          cgpa: null,
          roll_number: student.roll_number,
          status: student.users.is_active ? "Active" : "Inactive",
          role: "student",
        })) || []

      // Get currently enrolled student IDs
      const enrolledStudentIds = enrolledStudents.map((e) => e.student_id)

      // Filter out already enrolled students
      const availableStudents = transformedStudents.filter((student) => !enrolledStudentIds.includes(student.id))

      console.log(`Found ${transformedStudents.length} total students in semester ${selectedSubjectForView.semester}`)
      console.log(`${enrolledStudentIds.length} already enrolled, ${availableStudents.length} available to add`)

      setAvailableStudentsForAdd(availableStudents)
      setIsAddStudentsDialogOpen(true)
    } catch (error) {
      console.error("Error loading available students:", error)
      toast({
        title: "Error",
        description: "Failed to load available students. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveAddStudents = async () => {
    try {
      if (studentsToAdd.length === 0) {
        toast({
          title: "Error",
          description: "Please select students to add.",
          variant: "destructive",
        })
        return
      }

      if (!selectedSubjectForView) return

      setSaving(true)

      // Get courses for this subject and component type, optionally filtered by section
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
        .eq("subject_id", selectedSubjectForView.id)
        .eq("component_type", selectedComponentType)

      if (selectedSectionForView) {
        coursesQuery = coursesQuery.eq("section", selectedSectionForView)
      }

      const { data: courses, error: coursesError } = await coursesQuery

      if (coursesError) throw coursesError

      if (!courses || courses.length === 0) {
        toast({
          title: "Error",
          description: "No courses found for this subject and component type.",
        })
        return
      }

      // Use the enhanced enrollment method
      const courseIds = courses.map((c) => c.id)
      const batch = selectedComponentType === "lab" ? courses[0]?.batch : undefined

      console.log(`Adding ${studentsToAdd.length} students to ${courseIds.length} courses`)
      console.log(`Course sections: ${[...new Set(courses.map((c) => c.section))].join(", ")}`)

      const { error: enrollmentError } = await apiService.courses.enrollStudentsInCourses(
        courseIds,
        studentsToAdd,
        batch,
      )

      if (enrollmentError) {
        console.error("Error creating enrollments:", enrollmentError)
        toast({
          title: "Error",
          description: `Failed to add students: ${enrollmentError.message}`,
        })
        return
      }

      toast({
        title: "Success",
        description: "Students added successfully! Cross-section enrollments are now active.",
      })

      // Reload students and close dialog, then immediately update subjects list
      await loadStudentsForSubject(selectedSubjectForView, selectedComponentType, selectedSectionForView)
      setIsAddStudentsDialogOpen(false)
      setStudentsToAdd([])

      // Immediately reload subjects to reflect changes
      await loadSubjectsWithAssignments(currentUser?.role, currentUser?.department)
    } catch (error) {
      console.error("Error adding students:", error)
      toast({
        title: "Error",
        description: "Failed to add students. Please try again.",
      })
    } finally {
      setSaving(false)
    }
  }

  // Filter subjects based on search and semester
  const filteredSubjects = subjects.filter((subject) => {
    const matchesSearch =
      (subject.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (subject.code || "").toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSemester = selectedSemester === "all" || subject.semester?.toString() === selectedSemester
    return matchesSearch && matchesSemester
  })

  // Get faculty options for multi-select
  const facultyOptions = faculty.map((f) => ({
    label: f.name,
    value: f.id,
  }))

  // ENHANCED: Get subject options for student assignment with cross-section support
  const getSubjectOptionsForStudentAssignment = () => {
    if (!studentForm.semester) return []

    return availableSubjects.flatMap((subject) => {
      const options = []
      if (subject.has_theory) {
        options.push({
          label: `${subject.code} - ${subject.name} (Theory)`,
          value: `${subject.id}:theory`,
          number_of_batches: 1,
          section: subject.section || "All Sections",
        })
      }
      if (subject.has_lab) {
        options.push({
          label: `${subject.code} - ${subject.name} (Lab)`,
          value: `${subject.id}:lab`,
          number_of_batches: subject.number_of_batches || 1,
          section: subject.section || "All Sections",
        })
      }
      return options
    })
  }

  // ENHANCED: Get batch options based on selected subjects from all sections
  const getAvailableBatchOptions = async () => {
    const labSubjects = selectedSubjectsForAssignment.filter((s) => s.includes(":lab"))
    if (labSubjects.length === 0) return []

    try {
      // Get all unique batches for the selected lab subjects across ALL sections
      const subjectIds = labSubjects.map((s) => s.split(":")[0])

      const { data: courses, error } = await supabase
        .from("courses")
        .select("batch, section")
        .in("subject_id", subjectIds)
        .eq("component_type", "lab")
        .not("batch", "is", null)

      if (error) {
        console.error("Error fetching batch options:", error)
        // Fallback to default behavior
        return getBatchOptions(studentForm.section, 1)
      }

      // Extract unique batch names and sort them
      const uniqueBatches = [...new Set(courses?.map((c) => c.batch).filter(Boolean) || [])]
      console.log("Available batches across all sections:", uniqueBatches)
      return uniqueBatches.sort()
    } catch (error) {
      console.error("Error in getAvailableBatchOptions:", error)
      // Fallback to default behavior
      return getBatchOptions(studentForm.section, 1)
    }
  }

  // Add this useEffect to load batch options when subjects change
  useEffect(() => {
    const loadBatchOptions = async () => {
      const options = await getAvailableBatchOptions()
      setBatchOptions(options)
    }

    if (selectedSubjectsForAssignment.some((s) => s.includes(":lab"))) {
      loadBatchOptions()
    } else {
      setBatchOptions([])
      setSelectedBatch("")
    }
  }, [selectedSubjectsForAssignment, studentForm.section])

  // Get all available sections from subjects - only show sections that have assignments
  const getAvailableSections = () => {
    const sectionsWithAssignments = new Set<string>()

    // Always show A and B
    sectionsWithAssignments.add("A")
    sectionsWithAssignments.add("B")

    // Check if any subject has assignments in C or D
    filteredSubjects.forEach((subject) => {
      if (subject.section_assignments) {
        Object.keys(subject.section_assignments).forEach((section) => {
          if (section === "C" || section === "D") {
            const assignments = subject.section_assignments![section]
            if (assignments.theory.length > 0 || assignments.lab.length > 0) {
              sectionsWithAssignments.add(section)
            }
          }
        })
      }
    })

    return Array.from(sectionsWithAssignments).sort()
  }

  if (loading && subjects.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Assign Subjects</h1>
          <p className="text-muted-foreground">Manage faculty and student assignments to courses</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Total Students</p>
                <p className="text-2xl font-bold">{stats.totalStudents}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Total Subjects</p>
                <p className="text-2xl font-bold">{stats.totalSubjects}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Assigned</p>
                <p className="text-2xl font-bold">{stats.assignedSubjects}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm font-medium">Unassigned</p>
                <p className="text-2xl font-bold">{stats.unassignedSubjects}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="faculty">Faculty Assignment</TabsTrigger>
          <TabsTrigger value="students">Student Assignment</TabsTrigger>
        </TabsList>

        <TabsContent value="faculty" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Subject Assignments</CardTitle>
              <CardDescription>Assign faculty to subjects and view current assignments</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search subjects..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Semesters</SelectItem>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                      <SelectItem key={sem} value={sem.toString()}>
                        Semester {sem}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Subjects Table with Section-wise Faculty Display */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject Code</TableHead>
                      <TableHead>Subject Name</TableHead>
                      <TableHead>Semester</TableHead>
                      <TableHead>Credits</TableHead>
                      {getAvailableSections().map((section) => (
                        <TableHead key={section}>Section {section}</TableHead>
                      ))}
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubjects.map((subject) => (
                      <TableRow key={subject.id}>
                        <TableCell className="font-medium">{subject.code}</TableCell>
                        <TableCell>{subject.name}</TableCell>
                        <TableCell>{subject.semester}</TableCell>
                        <TableCell>{subject.credits}</TableCell>
                        {getAvailableSections().map((section) => (
                          <TableCell key={section}>
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                {subject.section_assignments?.[section] ? (
                                  <div className="space-y-1">
                                    {subject.section_assignments[section].theory.length > 0 && (
                                      <div className="text-xs">
                                        <span className="font-medium">Theory:</span>{" "}
                                        {subject.section_assignments[section].theory.join(", ")}
                                      </div>
                                    )}
                                    {subject.section_assignments[section].lab.length > 0 && (
                                      <div className="text-xs">
                                        <span className="font-medium">Lab:</span>{" "}
                                        {subject.section_assignments[section].lab.join(", ")}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground text-xs">Not assigned</span>
                                )}
                              </div>
                              {subject.section_assignments?.[section] &&
                                (subject.section_assignments[section].theory.length > 0 ||
                                  subject.section_assignments[section].lab.length > 0) && (
                                  <Button
                                    size="sm"
                                    variant="default"
                                    onClick={() => handleViewStudents(subject, section)}
                                    className="h-6 w-6 p-0 ml-2 bg-blue-600 hover:bg-blue-700"
                                  >
                                    <Eye className="h-3 w-3" />
                                  </Button>
                                )}
                            </div>
                          </TableCell>
                        ))}
                        <TableCell>
                          <Button size="sm" onClick={() => handleAssignFaculty(subject)}>
                            {subject.is_assigned ? "Edit" : "Assign"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Student Assignment</CardTitle>
              <CardDescription>
                Assign students to subjects based on academic parameters. Students can be assigned to subjects from any
                section (cross-section assignments supported).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Cross-section assignment notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Cross-Section Assignment Support</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      You can now assign students from any section to subjects in other sections. For example, assign
                      Section A students to Section B subjects. The system will automatically handle cross-section
                      enrollments.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 1: Academic Parameters */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Step 1: Select Academic Parameters</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="academic-year">Academic Year</Label>
                    <Select
                      value={studentForm.academic_year}
                      onValueChange={(value) => {
                        setStudentForm({ ...studentForm, academic_year: value, semester: "" })
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select academic year" />
                      </SelectTrigger>
                      <SelectContent>
                        {getAcademicYearOptions().map((year) => (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="semester">Semester</Label>
                    <Select
                      value={studentForm.semester}
                      onValueChange={(value) => setStudentForm({ ...studentForm, semester: value })}
                      disabled={!studentForm.academic_year}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select semester" />
                      </SelectTrigger>
                      <SelectContent>
                        {getSemesterOptions(studentForm.academic_year).map((sem) => (
                          <SelectItem key={sem} value={sem.toString()}>
                            Semester {sem}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="section">Student Section (Source)</Label>
                    <Select
                      value={studentForm.section}
                      onValueChange={(value) => setStudentForm({ ...studentForm, section: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select section" />
                      </SelectTrigger>
                      <SelectContent>
                        {["A", "B", "C", "D"].map((section) => (
                          <SelectItem key={section} value={section}>
                            Section {section}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">Select the section to fetch students from</p>
                  </div>
                </div>
                <Button onClick={handleFetchStudents} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Fetch Students
                </Button>
              </div>

              {/* Step 2: Select Students */}
              {studentWorkflowStep === "students-loaded" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Step 2: Select Students ({fetchedStudents.length} found)</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="select-all-students"
                        checked={selectedStudents.length === fetchedStudents.length}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedStudents(fetchedStudents.map((s) => s.id))
                          } else {
                            setSelectedStudents([])
                          }
                        }}
                      />
                      <Label htmlFor="select-all-students">Select All Students</Label>
                    </div>
                    <div className="max-h-60 overflow-y-auto border rounded-md p-4 space-y-2">
                      {fetchedStudents.map((student) => (
                        <div key={student.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`student-${student.id}`}
                            checked={selectedStudents.includes(student.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedStudents([...selectedStudents, student.id])
                              } else {
                                setSelectedStudents(selectedStudents.filter((id) => id !== student.id))
                              }
                            }}
                          />
                          <Label htmlFor={`student-${student.id}`} className="flex-1">
                            {student.name} ({student.usn}) - Section {student.section}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Step 3: Select Subjects */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Step 3: Select Subjects (Cross-Section Supported)</h3>
                    <div>
                      <Label>Subjects (from all sections)</Label>
                      <MultiSelect
                        options={getSubjectOptionsForStudentAssignment()}
                        value={selectedSubjectsForAssignment}
                        onChange={setSelectedSubjectsForAssignment}
                        placeholder="Select subjects from any section..."
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Subjects from all sections are available for assignment
                      </p>
                    </div>

                    {/* Batch selection for lab subjects - Updated to use actual configured batches */}
                    {selectedSubjectsForAssignment.some((s) => s.includes(":lab")) && (
                      <div>
                        <Label htmlFor="batch">Batch (for Lab subjects)</Label>
                        <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select batch" />
                          </SelectTrigger>
                          <SelectContent>
                            {batchOptions.map((batch) => (
                              <SelectItem key={batch} value={batch}>
                                Batch {batch}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground mt-1">
                          Available batches from all sections with lab assignments
                        </p>
                      </div>
                    )}

                    <Button onClick={handleAssignStudentsToSubjects} disabled={saving}>
                      {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Assign Students to Subjects (Cross-Section)
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Faculty Assignment Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Assign Faculty to Subject</DialogTitle>
            <DialogDescription>
              {(() => {
                const currentSubject = subjects.find((s) => s.id === assignForm.subject_id)
                if (currentSubject?.has_theory && currentSubject?.has_lab) {
                  return "Select faculty members for theory and lab components"
                } else if (currentSubject?.has_lab) {
                  return "Select faculty members for lab component"
                } else if (currentSubject?.has_project) {
                  return "Select faculty members for project component"
                } else {
                  return "Select faculty members for theory component"
                }
              })()}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="academic-year">Academic Year</Label>
                <Select
                  value={assignForm.academic_year}
                  onValueChange={(value) => setAssignForm({ ...assignForm, academic_year: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getAcademicYearOptions().map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="section">Section</Label>
                <Select value={assignForm.section} onValueChange={handleSectionChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["A", "B", "C", "D"].map((section) => (
                      <SelectItem key={section} value={section}>
                        Section {section}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Theory Faculty Section - Show for theory, both theory+lab, or project subjects */}
            {(() => {
              const currentSubject = subjects.find((s) => s.id === assignForm.subject_id)
              return currentSubject?.has_theory || currentSubject?.has_project ? (
                <div>
                  <Label>Theory Faculty</Label>
                  <MultiSelect
                    options={facultyOptions}
                    value={assignForm.theory_faculty_ids}
                    onChange={(selected) => setAssignForm({ ...assignForm, theory_faculty_ids: selected })}
                    placeholder="Select theory faculty..."
                  />
                </div>
              ) : null
            })()}

            {/* Lab Faculty Section - Show only for lab or both theory+lab subjects */}
            {(() => {
              const currentSubject = subjects.find((s) => s.id === assignForm.subject_id)
              return currentSubject?.has_lab ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Label>Lab Faculty</Label>
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="number-of-batches" className="text-sm">
                        Number of Batches:
                      </Label>
                      <Select
                        value={assignForm.number_of_batches.toString()}
                        onValueChange={(value) =>
                          setAssignForm({ ...assignForm, number_of_batches: Number.parseInt(value) })
                        }
                      >
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4].map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Dynamic Batch Faculty Assignment */}
                  {assignForm.lab_batch_assignments.map((batch, index) => (
                    <div key={batch.batchNumber} className="border rounded-lg p-4 space-y-2">
                      <Label className="font-medium">
                        Batch {assignForm.section}
                        {batch.batchNumber} Faculty
                      </Label>
                      <MultiSelect
                        options={facultyOptions}
                        value={batch.facultyIds}
                        onChange={(selected) => {
                          const newAssignments = [...assignForm.lab_batch_assignments]
                          newAssignments[index] = { ...batch, facultyIds: selected }
                          setAssignForm({ ...assignForm, lab_batch_assignments: newAssignments })
                        }}
                        placeholder={`Select faculty for batch ${assignForm.section}${batch.batchNumber}...`}
                      />
                    </div>
                  ))}
                </div>
              ) : null
            })()}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveFacultyAssignment} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Assignment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Component Selection Dialog */}
      <Dialog open={isComponentSelectionDialogOpen} onOpenChange={setIsComponentSelectionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Component Type</DialogTitle>
            <DialogDescription>
              This subject has both theory and lab components. Please select which one to view.
              {selectedSectionForView && ` (Section ${selectedSectionForView})`}
            </DialogDescription>
          </DialogHeader>
          <div className="flex space-x-4">
            <Button onClick={() => handleComponentSelection("theory")} className="flex-1">
              Theory
            </Button>
            <Button onClick={() => handleComponentSelection("lab")} className="flex-1">
              Lab
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Students Dialog - ENHANCED with cross-section indicators */}
      <Dialog open={isViewStudentsDialogOpen} onOpenChange={setIsViewStudentsDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              Assigned Students - {selectedSubjectForView?.name} ({selectedComponentType})
              {selectedSectionForView && ` - Section ${selectedSectionForView}`}
            </DialogTitle>
            <DialogDescription>
              {selectedComponentType === "lab" ? "Students grouped by batches" : "All assigned students"} (including
              cross-section enrollments)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Total: {enrolledStudents.length} students
                {enrolledStudents.filter((e) => e.is_cross_section).length > 0 && (
                  <span className="text-blue-600 ml-2">
                    ({enrolledStudents.filter((e) => e.is_cross_section).length} cross-section)
                  </span>
                )}
              </p>
              <div className="space-x-2">
                <Button size="sm" onClick={handleAddStudents}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Students
                </Button>
                {studentsToRemove.length > 0 && (
                  <Button size="sm" variant="destructive" onClick={handleRemoveStudents} disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
                    Remove Selected ({studentsToRemove.length})
                  </Button>
                )}
              </div>
            </div>

            {/* Select All Option */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="select-all-enrolled"
                checked={studentsToRemove.length === enrolledStudents.length}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setStudentsToRemove(enrolledStudents.map((e) => e.id))
                  } else {
                    setStudentsToRemove([])
                  }
                }}
              />
              <Label htmlFor="select-all-enrolled">Select All Students</Label>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {selectedComponentType === "lab" ? (
                // Group by batch for lab subjects - ENHANCED with cross-section indicators
                Object.entries(
                  enrolledStudents.reduce(
                    (acc, enrollment) => {
                      // Use the batch from course_enrollments first, then fall back to course batch
                      const batch = enrollment.batch || enrollment.course.batch || "No Batch"
                      if (!acc[batch]) acc[batch] = []
                      // Only add if not already present (additional safety check)
                      const existingStudent = acc[batch].find((e) => e.student_id === enrollment.student_id)
                      if (!existingStudent) {
                        acc[batch].push(enrollment)
                      }
                      return acc
                    },
                    {} as Record<string, CourseEnrollment[]>,
                  ),
                ).map(([batch, students]) => {
                  // Get faculty names for this batch - use the faculty_names from the first student
                  const facultyNames =
                    students.length > 0 && students[0].faculty_names ? students[0].faculty_names : "No Faculty Assigned"

                  const crossSectionCount = students.filter((s) => s.is_cross_section).length

                  return (
                    <div key={batch} className="space-y-2">
                      <h4 className="font-semibold text-sm bg-muted p-2 rounded flex items-center justify-between">
                        <span>
                          {batch} ({students.length} students) - Faculty: {facultyNames}
                        </span>
                        {crossSectionCount > 0 && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {crossSectionCount} cross-section
                          </span>
                        )}
                      </h4>
                      <div className="space-y-1 pl-4">
                        {students.map((enrollment) => (
                          <div key={enrollment.id} className="flex items-center space-x-2">
                            <Checkbox
                              checked={studentsToRemove.includes(enrollment.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setStudentsToRemove([...studentsToRemove, enrollment.id])
                                } else {
                                  setStudentsToRemove(studentsToRemove.filter((id) => id !== enrollment.id))
                                }
                              }}
                            />
                            <span className="text-sm flex items-center gap-2">
                              {enrollment.student.name} ({enrollment.student.usn})
                              {enrollment.is_cross_section && (
                                <span className="text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded">
                                  From Sec {enrollment.student.section}
                                </span>
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })
              ) : (
                // Simple list for theory subjects with cross-section indicators
                <div className="space-y-2">
                  {enrolledStudents.length > 0 && (
                    <div className="text-sm text-muted-foreground mb-2">
                      Faculty: {enrolledStudents[0]?.faculty_names || "No Faculty Assigned"}
                    </div>
                  )}
                  {enrolledStudents.map((enrollment) => (
                    <div key={enrollment.id} className="flex items-center space-x-2">
                      <Checkbox
                        checked={studentsToRemove.includes(enrollment.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setStudentsToRemove([...studentsToRemove, enrollment.id])
                          } else {
                            setStudentsToRemove(studentsToRemove.filter((id) => id !== enrollment.id))
                          }
                        }}
                      />
                      <span className="text-sm flex items-center gap-2">
                        {enrollment.student.name} ({enrollment.student.usn})
                        {enrollment.is_cross_section && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded">
                            From Sec {enrollment.student.section}
                          </span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Students Dialog - ENHANCED with cross-section support */}
      <Dialog open={isAddStudentsDialogOpen} onOpenChange={setIsAddStudentsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Students (Cross-Section Supported)</DialogTitle>
            <DialogDescription>
              Select students from any section in the same semester to add to this subject
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="max-h-96 overflow-y-auto space-y-2">
              {availableStudentsForAdd.map((student) => (
                <div key={student.id} className="flex items-center space-x-2">
                  <Checkbox
                    checked={studentsToAdd.includes(student.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setStudentsToAdd([...studentsToAdd, student.id])
                      } else {
                        setStudentsToAdd(studentsToAdd.filter((id) => id !== student.id))
                      }
                    }}
                  />
                  <span className="text-sm flex items-center gap-2">
                    {student.name} ({student.usn}) - Section {student.section}
                    {student.section !== selectedSectionForView && selectedSectionForView && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded">Cross-Section</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddStudentsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveAddStudents} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Add Students ({studentsToAdd.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
