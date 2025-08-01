import { createClient } from "@supabase/supabase-js"
import type {
  Database,
  FacultyProfile,
  DepartmentType,
  SubjectType,
  CourseType,
  StudentProfile,
  ApplicationType,
} from "./database-schema"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY! // Ensure this is defined

const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Create service role client only on server side
// Create a single Supabase client for the service role
// This client bypasses Row Level Security (RLS)
export function createServiceRoleClient() {
  if (!supabaseUrl) {
    throw new Error("Missing environment variable NEXT_PUBLIC_SUPABASE_URL")
  }

  if (!supabaseServiceRoleKey) {
    throw new Error("Missing environment variable SUPABASE_SERVICE_ROLE_KEY")
  }
  return createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false, // Service role client doesn't need to persist sessions
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })
}

// Generic service for basic CRUD operations (for tables not requiring complex joins/logic)
const createGenericService = <T extends { id: string }>(tableName: keyof Database["public"]["Tables"]) => ({
  getAll: async (): Promise<{ data: T[] | null; error: any }> => {
    const { data, error } = await supabase.from(tableName).select("*")
    return { data: data as T[] | null, error }
  },
  getById: async (id: string): Promise<{ data: T | null; error: any }> => {
    const { data, error } = await supabase.from(tableName).select("*").eq("id", id).single()
    return { data: data as T | null, error }
  },
  create: async (item: Omit<T, "id">): Promise<{ data: T | null; error: any }> => {
    const { data, error } = await supabase.from(tableName).insert(item).select().single()
    return { data: data as T | null, error }
  },
  update: async (id: string, updates: Partial<T>): Promise<{ data: T | null; error: any }> => {
    const { data, error } = await supabase.from(tableName).update(updates).eq("id", id).select().single()
    return { data: data as T | null, error }
  },
  delete: async (id: string): Promise<{ error: any }> => {
    const { error } = await supabase.from(tableName).delete().eq("id", id)
    return { error }
  },
})

// Weekly Timetable Modifications Service - Updated to use API routes for server-side operations
export const weeklyTimetableModificationsService = {
  // Get modifications for a faculty member for a specific week
  getWeeklyModifications: async (
    facultyId: string,
    weekStartDate: string,
  ): Promise<{ data: any[] | null; error: any }> => {
    try {
      console.log("Getting weekly modifications for:", { facultyId, weekStartDate })

      const { data, error } = await supabase
        .from("weekly_timetable_modifications")
        .select("*")
        .eq("faculty_id", facultyId)
        .eq("week_start_date", weekStartDate)

      if (error) {
        console.error("Error fetching weekly modifications:", error)
        return { data: null, error }
      }

      // Transform the data back to the format expected by the UI
      const modifications =
        data?.map((mod) => ({
          id: mod.original_class_id,
          ...mod.modified_class_data,
          isModified: true,
        })) || []

      console.log("Retrieved modifications:", modifications)
      return { data: modifications, error: null }
    } catch (error) {
      console.error("Error in getWeeklyModifications:", error)
      return { data: null, error }
    }
  },

  // Save or update a weekly modification - Use API route for server-side operation
  saveWeeklyModification: async (
    facultyId: string,
    weekStartDate: string,
    originalClassId: string,
    modifiedClassData: any,
  ): Promise<{ data: any | null; error: any }> => {
    try {
      console.log("Saving weekly modification via API:", {
        facultyId,
        weekStartDate,
        originalClassId,
        modifiedClassData,
      })

      const response = await fetch("/api/weekly-timetable-modifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "save",
          facultyId,
          weekStartDate,
          originalClassId,
          modifiedClassData,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("API error:", errorText)
        return { data: null, error: new Error(errorText) }
      }

      const result = await response.json()
      console.log("Successfully saved modification via API:", result)
      return { data: result.data, error: null }
    } catch (error) {
      console.error("Error in saveWeeklyModification:", error)
      return { data: null, error }
    }
  },

  // Delete a weekly modification - Use API route for server-side operation
  deleteWeeklyModification: async (
    facultyId: string,
    weekStartDate: string,
    originalClassId: string,
  ): Promise<{ error: any }> => {
    try {
      console.log("Deleting weekly modification via API:", { facultyId, weekStartDate, originalClassId })

      const response = await fetch("/api/weekly-timetable-modifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "delete",
          facultyId,
          weekStartDate,
          originalClassId,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("API error:", errorText)
        return { error: new Error(errorText) }
      }

      console.log("Successfully deleted modification via API")
      return { error: null }
    } catch (error) {
      console.error("Error in deleteWeeklyModification:", error)
      return { error }
    }
  },

  // Delete all modifications for a faculty member for a specific week - Use API route
  resetWeeklyModifications: async (facultyId: string, weekStartDate: string): Promise<{ error: any }> => {
    try {
      console.log("Resetting weekly modifications via API for:", { facultyId, weekStartDate })

      const response = await fetch("/api/weekly-timetable-modifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "reset",
          facultyId,
          weekStartDate,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("API error:", errorText)
        return { error: new Error(errorText) }
      }

      console.log("Successfully reset weekly modifications via API")
      return { error: null }
    } catch (error) {
      console.error("Error in resetWeeklyModifications:", error)
      return { error }
    }
  },
}

// Specific services for each table
export const userService = {
  ...createGenericService("users"),
  updateUserRole: async (userId: string, role: string): Promise<{ data: any | null; error: any }> => {
    const { data, error } = await supabase.from("users").update({ role }).eq("id", userId).select().single()
    return { data, error }
  },
}

export const studentService = {
  ...createGenericService("students"),
  getAll: async (): Promise<{ data: StudentProfile[] | null; error: any }> => {
    // Get all students first
    const { data: students, error: studentsError } = await supabase.from("students").select("*")

    if (studentsError) {
      console.error("Error fetching students:", studentsError)
      return { data: null, error: studentsError }
    }

    if (!students || students.length === 0) {
      return { data: [], error: null }
    }

    // Get all user IDs from students
    const userIds = students.map((s) => s.user_id)

    // Get user data for these IDs
    const { data: users, error: usersError } = await supabase.from("users").select("*").in("id", userIds)

    if (usersError) {
      console.error("Error fetching users for students:", usersError)
      return { data: null, error: usersError }
    }

    // Create a map of users by ID
    const userMap = new Map()
    users?.forEach((user) => {
      userMap.set(user.id, user)
    })

    // Combine student and user data
    const mappedStudents = students
      .filter((s) => userMap.has(s.user_id))
      .map((s) => {
        const user = userMap.get(s.user_id)
        return {
          user_id: s.user_id,
          id: s.user_id,
          name: `${user.first_name || ""} ${user.last_name || ""}`.trim(),
          usn: s.usn,
          email: user.email || "",
          phone: user.phone || "",
          department: user.department || "N/A",
          semester: s.semester,
          section: s.section,
          batch: s.batch,
          enrollmentDate: s.admission_date || "",
          profilePicture: user.profile_picture || "/placeholder.svg?height=40&width=40",
          is_active: user.is_active,
          cgpa: s.cgpa,
          roll_number: s.roll_number,
          status: user.is_active ? "Active" : "Inactive",
          role: user.role,
        }
      })

    return { data: mappedStudents as StudentProfile[], error: null }
  },
  getBySemesterAndSection: async (
    semester: number,
    section: string,
  ): Promise<{ data: StudentProfile[] | null; error: any }> => {
    try {
      // Get students by semester and section
      const { data: students, error: studentsError } = await supabase
        .from("students")
        .select("*")
        .eq("semester", semester)
        .eq("section", section)

      if (studentsError) {
        console.error("Error fetching students by semester and section:", studentsError)
        return { data: null, error: studentsError }
      }

      if (!students || students.length === 0) {
        return { data: [], error: null }
      }

      // Get user data for these students
      const userIds = students.map((s) => s.user_id)
      const { data: users, error: usersError } = await supabase.from("users").select("*").in("id", userIds)

      if (usersError) {
        console.error("Error fetching users for students:", usersError)
        return { data: null, error: usersError }
      }

      // Create a map of users by ID
      const userMap = new Map()
      users?.forEach((user) => {
        userMap.set(user.id, user)
      })

      // Combine student and user data
      const mappedStudents = students
        .filter((s) => userMap.has(s.user_id))
        .map((s) => {
          const user = userMap.get(s.user_id)
          return {
            user_id: s.user_id,
            id: s.user_id,
            name: `${user.first_name || ""} ${user.last_name || ""}`.trim(),
            usn: s.usn,
            email: user.email || "",
            phone: user.phone || "",
            department: user.department || "N/A",
            semester: s.semester,
            section: s.section,
            batch: s.batch,
            enrollmentDate: s.admission_date || "",
            profilePicture: user.profile_picture || "/placeholder.svg?height=40&width=40",
            is_active: user.is_active,
            cgpa: s.cgpa,
            roll_number: s.roll_number,
            status: user.is_active ? "Active" : "Inactive",
            role: user.role,
          }
        })

      return { data: mappedStudents as StudentProfile[], error: null }
    } catch (error) {
      console.error("Unexpected error in getBySemesterAndSection:", error)
      return { data: null, error }
    }
  },
  getById: async (userId: string): Promise<{ data: StudentProfile | null; error: any }> => {
    // Get student record
    const { data: studentRecord, error: studentError } = await supabase
      .from("students")
      .select("*")
      .eq("user_id", userId)
      .single()

    if (studentError) {
      return { data: null, error: studentError }
    }

    // Get user record
    const { data: user, error: userError } = await supabase.from("users").select("*").eq("id", userId).single()

    if (userError) {
      return { data: null, error: userError }
    }

    const mappedStudent: StudentProfile = {
      user_id: studentRecord.user_id,
      id: studentRecord.user_id,
      name: `${user.first_name || ""} ${user.last_name || ""}`.trim(),
      usn: studentRecord.usn,
      email: user.email || "",
      phone: user.phone || "",
      department: user.department || "N/A",
      semester: studentRecord.semester,
      section: studentRecord.section,
      batch: studentRecord.batch,
      enrollmentDate: studentRecord.admission_date || "",
      profilePicture: user.profile_picture || "/placeholder.svg?height=40&width=40",
      is_active: user.is_active,
      cgpa: studentRecord.cgpa,
      roll_number: studentRecord.roll_number,
      status: user.is_active ? "Active" : "Inactive",
      role: user.role,
    }

    return { data: mappedStudent, error: null }
  },
  getDashboardData: async (userId: string) => {
    try {
      const { count: courseCount, error: courseCountError } = await supabase
        .from("courses")
        .select("id", { count: "exact", head: true })
        .eq("student_id", userId)

      if (courseCountError) throw courseCountError

      const averageAttendance = 85.0 // Placeholder for actual calculation

      const { count: pendingAssignments, error: pendingAssignmentsError } = await supabase
        .from("ia_marks")
        .select("id", { count: "exact", head: true })
        .eq("student_id", userId)
        .is("marks_obtained", null)

      if (pendingAssignmentsError) throw pendingAssignmentsError

      return {
        totalCourses: courseCount ?? 0,
        averageAttendance,
        pendingAssignments: pendingAssignments ?? 0,
      }
    } catch (error) {
      console.error("[studentService.getDashboardData] failed:", error)
      throw error
    }
  },
  getByDepartment: async (departmentShortName: string): Promise<{ data: StudentProfile[] | null; error: any }> => {
    // Get users in the department with student role
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("*")
      .eq("department", departmentShortName)
      .eq("role", "student")
      .eq("is_active", true)

    if (usersError) {
      return { data: null, error: usersError }
    }

    // Get student records for these users
    const userIds = users?.map((u) => u.id) || []
    if (userIds.length === 0) {
      return { data: [], error: null }
    }

    const { data: studentRecords, error: studentError } = await supabase
      .from("students")
      .select("*")
      .in("user_id", userIds)

    if (studentError) {
      return { data: null, error: studentError }
    }

    // Create a map of student records by user_id
    const studentMap = new Map()
    studentRecords?.forEach((student) => {
      studentMap.set(student.user_id, student)
    })

    const mappedStudents = users
      ?.map((user: any) => {
        const studentRecord = studentMap.get(user.id)
        if (!studentRecord) return null

        return {
          user_id: user.id,
          id: user.id,
          name: `${user.first_name || ""} ${user.last_name || ""}`.trim(),
          usn: studentRecord.usn,
          email: user.email || "",
          phone: user.phone || "",
          department: user.department || "N/A",
          semester: studentRecord.semester,
          section: studentRecord.section,
          batch: studentRecord.batch,
          enrollmentDate: studentRecord.admission_date || "",
          profilePicture: user.profile_picture || "/placeholder.svg?height=40&width=40",
          is_active: user.is_active,
          cgpa: studentRecord.cgpa,
          roll_number: studentRecord.roll_number,
          status: user.is_active ? "Active" : "Inactive",
          role: user.role,
        }
      })
      .filter(Boolean)

    return { data: mappedStudents as StudentProfile[], error: null }
  },
  getStudentSubjects: async (studentId: string): Promise<{ data: any[] | null; error: any }> => {
    try {
      // FIXED: Use the new function to get student's enrolled subjects with correct component types
      const { data: enrollments, error: enrollmentsError } = await supabase.rpc("get_student_enrolled_subjects", {
        student_user_id: studentId,
      })

      if (enrollmentsError) {
        console.error("Error fetching student enrollments:", enrollmentsError)
        return { data: null, error: enrollmentsError }
      }

      // Transform to the expected format
      const subjects =
        enrollments?.map((enrollment: any) => ({
          id: enrollment.subject_id,
          code: enrollment.subject_code,
          name: enrollment.subject_name,
          component_type: enrollment.component_type,
          batch: enrollment.batch,
          faculty_name: enrollment.faculty_name,
          semester: enrollment.semester,
          section: enrollment.section,
          academic_year: enrollment.academic_year,
        })) || []

      return { data: subjects, error: null }
    } catch (error) {
      console.error("Error in getStudentSubjects:", error)
      return { data: null, error }
    }
  },
  getStudentEnrollments: async (studentId: string): Promise<{ data: any[] | null; error: any }> => {
    try {
      // FIXED: Use the new function to get student's enrolled subjects
      const { data: enrollments, error } = await supabase.rpc("get_student_enrolled_subjects", {
        student_user_id: studentId,
      })

      if (error) throw error

      // Transform to match the expected format
      const transformedEnrollments =
        enrollments?.map((enrollment: any) => ({
          id: enrollment.course_id,
          course_id: enrollment.course_id,
          student_id: studentId,
          is_active: true,
          batch: enrollment.batch,
          courses: {
            id: enrollment.course_id,
            course_code: enrollment.subject_code,
            course_name: enrollment.subject_name,
            semester: enrollment.semester,
            section: enrollment.section,
            academic_year: enrollment.academic_year,
            component_type: enrollment.component_type,
            batch: enrollment.batch,
            subjects: {
              id: enrollment.subject_id,
              code: enrollment.subject_code,
              name: enrollment.subject_name,
            },
          },
        })) || []

      return { data: transformedEnrollments, error: null }
    } catch (error) {
      console.error("Error fetching student enrollments:", error)
      return { data: null, error }
    }
  },
}

export const facultyService = {
  ...createGenericService("faculty"),
  update: async (userId: string, updates: Partial<any>): Promise<{ data: any | null; error: any }> => {
    const { data, error } = await supabase.from("faculty").update(updates).eq("user_id", userId).select().single()
    return { data: data as any | null, error }
  },
  getAll: async (): Promise<{ data: FacultyProfile[] | null; error: Error | null }> => {
    // First get all users with faculty roles
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("*")
      .in("role", ["faculty", "hod", "coordinator", "principal", "admin"])

    if (usersError) {
      console.error("Error fetching users:", usersError)
      return { data: null, error: usersError }
    }

    // Then get all faculty records
    const { data: facultyRecords, error: facultyError } = await supabase.from("faculty").select("*")

    if (facultyError) {
      console.error("Error fetching faculty records:", facultyError)
      return { data: null, error: facultyError }
    }

    // Create a map of faculty records by user_id
    const facultyMap = new Map()
    facultyRecords?.forEach((faculty) => {
      facultyMap.set(faculty.user_id, faculty)
    })

    // Combine the data
    const enrichedData = users
      ?.map((user: any) => {
        const facultyRecord = facultyMap.get(user.id)

        let effectiveRole = user.role

        if (user.role === "faculty" && facultyRecord) {
          if (facultyRecord.is_hod) {
            effectiveRole = "hod"
          } else if (facultyRecord.is_coordinator) {
            effectiveRole = "coordinator"
          }
        }

        return {
          id: user.id,
          user_id: user.id,
          name: `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.email,
          employeeId: facultyRecord?.employee_id || null,
          email: user.email,
          phone: user.phone || null,
          department: user.department || null,
          designation: facultyRecord?.designation || null,
          qualification: facultyRecord?.qualification || null,
          join_date: facultyRecord?.join_date || null,
          is_hod: facultyRecord?.is_hod || false,
          is_coordinator: facultyRecord?.is_coordinator || false,
          status: user.is_active ? "Active" : "Inactive",
          profilePicture: user.profile_picture || "/placeholder.svg?height=40&width=40",
          role: effectiveRole,
        }
      })
      .filter((user) => facultyMap.has(user.id))

    return { data: enrichedData as FacultyProfile[], error: null }
  },
  getById: async (userId: string): Promise<{ data: FacultyProfile | null; error: Error | null }> => {
    // Get user data
    const { data: user, error: userError } = await supabase.from("users").select("*").eq("id", userId).single()

    if (userError) {
      return { data: null, error: userError }
    }

    // Get faculty data
    const { data: facultyRecord, error: facultyError } = await supabase
      .from("faculty")
      .select("*")
      .eq("user_id", userId)
      .single()

    if (facultyError) {
      return { data: null, error: facultyError }
    }

    let effectiveRole = user.role

    if (user.role === "faculty" && facultyRecord) {
      if (facultyRecord.is_hod) {
        effectiveRole = "hod"
      } else if (facultyRecord.is_coordinator) {
        effectiveRole = "coordinator"
      }
    }

    const enrichedData = {
      id: user.id,
      user_id: user.id,
      name: `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.email,
      employeeId: facultyRecord?.employee_id || null,
      email: user.email,
      phone: user.phone || null,
      department: user.department || null,
      designation: facultyRecord?.designation || null,
      qualification: facultyRecord?.qualification || null,
      join_date: facultyRecord?.join_date || null,
      is_hod: facultyRecord?.is_hod || false,
      is_coordinator: facultyRecord?.is_coordinator || false,
      status: user.is_active ? "Active" : "Inactive",
      profilePicture: user.profile_picture || "/placeholder.svg?height=40&width=40",
      role: effectiveRole,
    }

    return { data: enrichedData, error: null }
  },
  getByDepartment: async (departmentShortName: string): Promise<{ data: FacultyProfile[] | null; error: any }> => {
    // Get users in the department
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("*")
      .eq("department", departmentShortName)
      .in("role", ["faculty", "hod", "coordinator", "principal", "admin"])
      .eq("is_active", true)

    if (usersError) {
      return { data: null, error: usersError }
    }

    // Get faculty records for these users
    const userIds = users?.map((u) => u.id) || []
    if (userIds.length === 0) {
      return { data: [], error: null }
    }

    const { data: facultyRecords, error: facultyError } = await supabase
      .from("faculty")
      .select("*")
      .in("user_id", userIds)

    if (facultyError) {
      return { data: null, error: facultyError }
    }

    // Create a map of faculty records by user_id
    const facultyMap = new Map()
    facultyRecords?.forEach((faculty) => {
      facultyMap.set(faculty.user_id, faculty)
    })

    const mappedFaculty = users
      ?.map((user: any) => {
        const facultyRecord = facultyMap.get(user.id)
        return {
          id: user.id,
          user_id: user.id,
          name: `${user.first_name || ""} ${user.last_name || ""}`.trim(),
          employeeId: facultyRecord?.employee_id || null,
          email: user.email || "",
          phone: user.phone || "",
          department: user.department || "N/A",
          designation: facultyRecord?.designation || null,
          qualification: facultyRecord?.qualification || null,
          join_date: facultyRecord?.join_date || null,
          is_hod: facultyRecord?.is_coordinator || false,
          is_coordinator: facultyRecord?.is_coordinator || false,
          status: user.is_active ? "Active" : "Inactive",
          profilePicture: user.profile_picture || "/placeholder.svg?height=40&width=40",
          role: user.role,
        }
      })
      .filter((user) => facultyMap.has(user.id))

    return { data: mappedFaculty as FacultyProfile[], error: null }
  },
  updateCoordinatorStatus: async (
    userId: string,
    isCoordinator: boolean,
  ): Promise<{ data: any | null; error: any }> => {
    const { data, error } = await supabase
      .from("faculty")
      .update({ is_coordinator: isCoordinator })
      .eq("user_id", userId)
      .select()
      .single()
    return { data, error }
  },
  getDashboardData: async (userId: string) => {
    try {
      const { count: courseCount, error: courseCountError } = await supabase
        .from("courses")
        .select("id", { count: "exact", head: true })
        .eq("faculty_id", userId)

      if (courseCountError) throw courseCountError

      const pendingCommonLetters = 3
      const classesThisWeek = 12
      const pendingAssessments = 4

      return {
        totalCourses: courseCount ?? 0,
        pendingCommonLetters,
        classesThisWeek,
        pendingAssessments,
      }
    } catch (error) {
      console.error("[facultyService.getDashboardData] failed:", error)
      throw error
    }
  },
  // FIXED: Faculty timetable methods with proper error handling and data transformation
  getFacultyWeeklySchedule: async (
    facultyUserId: string,
    weekStartDate?: Date,
  ): Promise<{ data: any[] | null; error: any }> => {
    try {
      console.log("Calling get_faculty_weekly_schedule for user:", facultyUserId)

      const { data, error } = await supabase.rpc("get_faculty_weekly_schedule", {
        faculty_user_id: facultyUserId,
        week_start_date: weekStartDate?.toISOString().split("T")[0] || new Date().toISOString().split("T")[0],
      })

      if (error) {
        console.error("Error fetching faculty weekly schedule:", error)
        return { data: null, error }
      }

      console.log("Faculty weekly schedule received:", data)
      return { data: data || [], error: null }
    } catch (error) {
      console.error("Error in getFacultyWeeklySchedule:", error)
      return { data: null, error }
    }
  },
  getFacultyAttendanceStats: async (facultyUserId: string): Promise<{ data: any[] | null; error: any }> => {
    try {
      console.log("Calling get_faculty_attendance_stats for user:", facultyUserId)

      const { data, error } = await supabase.rpc("get_faculty_attendance_stats", {
        faculty_user_id: facultyUserId,
      })

      if (error) {
        console.error("Error fetching faculty attendance stats:", error)
        return { data: null, error }
      }

      console.log("Faculty attendance stats received:", data)
      return { data: data || [], error: null }
    } catch (error) {
      console.error("Error in getFacultyAttendanceStats:", error)
      return { data: null, error }
    }
  },
}

export const departmentService = {
  ...createGenericService("departments"),

  getAllDepartments: async (): Promise<{ data: DepartmentType[] | null; error: Error | null }> => {
    // Get all departments
    const { data: departments, error: deptError } = await supabase.from("departments").select("*")

    if (deptError) {
      console.error("Error fetching departments:", deptError)
      return { data: null, error: deptError }
    }

    // Get HOD information for departments that have hod_id
    const departmentsWithHod = await Promise.all(
      (departments || []).map(async (dept) => {
        if (dept.hod_id) {
          const { data: hod, error: hodError } = await supabase
            .from("users")
            .select("first_name, last_name")
            .eq("id", dept.hod_id)
            .single()

          if (!hodError && hod) {
            return {
              ...dept,
              hod_name: `${hod.first_name || ""} ${hod.last_name || ""}`.trim() || null,
            }
          }
        }
        return { ...dept, hod_name: null }
      }),
    )

    return { data: departmentsWithHod as DepartmentType[], error: null }
  },

  getById: async (id: string | number): Promise<{ data: DepartmentType | null; error: Error | null }> => {
    const { data: dept, error: deptError } = await supabase.from("departments").select("*").eq("id", id).single()

    if (deptError) return { data: null, error: deptError }

    let hod_name = null
    let hod = null
    if (dept.hod_id) {
      const { data: hodData, error: hodError } = await supabase
        .from("users")
        .select("first_name, last_name, email")
        .eq("id", dept.hod_id)
        .single()

      if (!hodError && hodData) {
        hod_name = `${hodData.first_name || ""} ${hodData.last_name || ""}`.trim() || null
        hod = {
          user: {
            first_name: hodData.first_name,
            last_name: hodData.last_name,
            email: hodData.email,
          },
        }
      }
    }

    return { data: { ...dept, hod_name, hod } as DepartmentType, error: null }
  },

  isFacultyHODOfAnyDepartment: async (facultyId: string): Promise<boolean> => {
    const { data, error } = await supabase.from("departments").select("id").eq("hod_id", facultyId).limit(1)
    if (error) {
      console.error("Error checking if faculty is HOD:", error)
      throw error
    }
    return !!data?.length
  },
}

export const courseService = {
  ...createGenericService("courses"),
  getAllCourses: async (): Promise<{ data: CourseType[] | null; error: Error | null }> => {
    // First get all courses with subjects
    const { data: courses, error: coursesError } = await supabase.from("courses").select(`
      *,
      subjects(*)
    `)

    if (coursesError) {
      return { data: null, error: coursesError }
    }

    // Then get faculty assignments for each course
    const coursesWithFaculty = await Promise.all(
      (courses || []).map(async (course) => {
        const { data: assignments, error: assignmentsError } = await supabase
          .from("course_faculty_assignments")
          .select(`
            faculty_id,
            users(id, first_name, last_name, email, role, phone, profile_picture)
          `)
          .eq("course_id", course.id)

        if (assignmentsError) {
          console.error("Error fetching faculty assignments:", assignmentsError)
          return {
            ...course,
            assigned_faculty: [],
          }
        }

        const assignedFaculty = (assignments || []).map((assignment: any) => ({
          id: assignment.users.id,
          name: `${assignment.users.first_name || ""} ${assignment.users.last_name || ""}`.trim(),
          email: assignment.users.email,
          role: assignment.users.role,
          phone: assignment.users.phone,
          profile_picture: assignment.users.profile_picture,
        }))

        return {
          ...course,
          assigned_faculty: assignedFaculty,
        }
      }),
    )

    return { data: coursesWithFaculty as CourseType[], error: null }
  },
  getCoursesByDepartment: async (departmentId: string): Promise<{ data: CourseType[] | null; error: Error | null }> => {
    // First get courses by department with subjects
    const { data: courses, error: coursesError } = await supabase
      .from("courses")
      .select(`
        *,
        subjects(*)
      `)
      .eq("department_id", departmentId)

    if (coursesError) {
      return { data: null, error: coursesError }
    }

    // Then get faculty assignments for each course
    const coursesWithFaculty = await Promise.all(
      (courses || []).map(async (course) => {
        const { data: assignments, error: assignmentsError } = await supabase
          .from("course_faculty_assignments")
          .select(`
            faculty_id,
            users(id, first_name, last_name, email, role, phone, profile_picture)
          `)
          .eq("course_id", course.id)

        if (assignmentsError) {
          console.error("Error fetching faculty assignments:", assignmentsError)
          return {
            ...course,
            assigned_faculty: [],
          }
        }

        const assignedFaculty = (assignments || []).map((assignment: any) => ({
          id: assignment.users.id,
          name: `${assignment.users.first_name || ""} ${assignment.users.last_name || ""}`.trim(),
          email: assignment.users.email,
          role: assignment.users.role,
          phone: assignment.users.phone,
          profile_picture: assignment.users.profile_picture,
        }))

        return {
          ...course,
          assigned_faculty: assignedFaculty,
        }
      }),
    )

    return { data: coursesWithFaculty as CourseType[], error: null }
  },
  addCourse: async (
    courseData: Omit<CourseType, "id" | "assigned_faculty" | "subjects">,
    facultyIds: string[],
  ): Promise<{ data: CourseType | null; error: Error | null }> => {
    const { data: newCourse, error: courseError } = await supabase.from("courses").insert(courseData).select().single()

    if (courseError) {
      return { data: null, error: courseError }
    }

    if (facultyIds.length > 0) {
      const assignments = facultyIds.map((faculty_id) => ({
        course_id: newCourse.id,
        faculty_id,
      }))
      const { error: assignmentsError } = await supabase.from("course_faculty_assignments").insert(assignments)

      if (assignmentsError) {
        await supabase.from("courses").delete().eq("id", newCourse.id)
        return { data: null, error: assignmentsError }
      }
    }

    // Get the complete course data
    const { data: completeData, error: fetchError } = await this.getAllCourses()
    if (fetchError) {
      return { data: null, error: fetchError }
    }

    const createdCourse = completeData?.find((c) => c.id === newCourse.id) || null
    return { data: createdCourse, error: null }
  },
  updateCourse: async (
    id: string,
    updates: Partial<Omit<CourseType, "assigned_faculty" | "subjects">>,
    facultyIds: string[],
  ): Promise<{ data: CourseType | null; error: Error | null }> => {
    const { data: updatedCourse, error: courseError } = await supabase
      .from("courses")
      .update(updates)
      .eq("id", id)
      .select()
      .single()

    if (courseError) {
      return { data: null, error: courseError }
    }

    // Delete existing assignments for this course
    const { error: deleteError } = await supabase.from("course_faculty_assignments").delete().eq("course_id", id)

    if (deleteError) {
      return { data: null, error: deleteError }
    }

    // Insert new assignments
    if (facultyIds.length > 0) {
      const assignments = facultyIds.map((faculty_id) => ({
        course_id: id,
        faculty_id,
      }))
      const { error: insertError } = await supabase.from("course_faculty_assignments").insert(assignments)

      if (insertError) {
        return { data: null, error: insertError }
      }
    }

    // Get the complete course data
    const { data: completeData, error: fetchError } = await this.getAllCourses()
    if (fetchError) {
      return { data: null, error: fetchError }
    }

    const updatedCompleteData = completeData?.find((c) => c.id === id) || null
    return { data: updatedCompleteData, error: null }
  },
  deleteCourse: async (id: string): Promise<{ error: Error | null }> => {
    // First, delete associated faculty assignments
    const { error: deleteAssignmentsError } = await supabase
      .from("course_faculty_assignments")
      .delete()
      .eq("course_id", id)

    if (deleteAssignmentsError) {
      return { error: deleteAssignmentsError }
    }

    // Then, delete the course itself
    const { error } = await supabase.from("courses").delete().eq("id", id)
    return { error }
  },
  // Enhanced method for upserting faculty assignments with batch support - FIXED
  upsertFacultyAssignments: async (
    subjectId: string,
    academicYear: string,
    semester: number,
    departmentId: string,
    section: string,
    theoryFacultyIds: string[],
    labFacultyAssignments: Array<{ batchNumber: number; facultyIds: string[] }>,
  ): Promise<{ error: any }> => {
    try {
      console.log("upsertFacultyAssignments called with:", {
        subjectId,
        academicYear,
        semester,
        departmentId,
        section,
        theoryFacultyIds,
        labFacultyAssignments,
      })

      // Validate required fields
      if (!subjectId) {
        return { error: new Error("Subject ID is required") }
      }

      // Get the subject to find the department using the department field (short name)
      let finalDepartmentId = departmentId
      if (!finalDepartmentId || finalDepartmentId === "") {
        const { data: subject, error: subjectError } = await supabase
          .from("subjects")
          .select("department")
          .eq("id", subjectId)
          .single()

        if (subjectError) {
          console.error("Error fetching subject:", subjectError)
          return { error: subjectError }
        }

        // Get department ID from department short name
        if (subject.department) {
          const { data: department, error: deptError } = await supabase
            .from("departments")
            .select("id")
            .eq("short_name", subject.department)
            .single()

          if (deptError) {
            console.error("Error fetching department:", deptError)
            return { error: deptError }
          }

          finalDepartmentId = department.id
        }
      }

      if (!finalDepartmentId) {
        return { error: new Error("Department ID could not be determined") }
      }

      console.log("Using department_id:", finalDepartmentId)

      // First, delete existing assignments for this subject/semester/section combination
      const { error: deleteError } = await supabase
        .from("courses")
        .delete()
        .eq("subject_id", subjectId)
        .eq("academic_year", academicYear)
        .eq("semester", semester)
        .eq("department_id", finalDepartmentId)
        .eq("section", section)

      if (deleteError) {
        console.error("Error deleting existing assignments:", deleteError)
        return { error: deleteError }
      }

      console.log("Deleted existing assignments")

      // Insert new theory assignments
      for (const facultyId of theoryFacultyIds) {
        const courseData = {
          subject_id: subjectId,
          faculty_id: facultyId,
          academic_year: academicYear,
          semester: semester,
          department_id: finalDepartmentId,
          section: section,
          component_type: "theory" as const,
          batch: null, // Theory doesn't have batch
        }

        console.log("Inserting theory course:", courseData)

        const { error } = await supabase.from("courses").insert(courseData)
        if (error) {
          console.error("Error inserting theory course:", error)
          return { error }
        }
      }

      // Insert new lab assignments with batch support - FIXED LOGIC
      for (const labAssignment of labFacultyAssignments) {
        // Only create assignments for batches that have faculty assigned
        if (labAssignment.facultyIds.length === 0) {
          console.log(`Skipping batch ${labAssignment.batchNumber} - no faculty assigned`)
          continue
        }

        const batchName = `${section}${labAssignment.batchNumber}`

        // FIXED: Create separate course records for each faculty in the batch
        for (const facultyId of labAssignment.facultyIds) {
          const courseData = {
            subject_id: subjectId,
            faculty_id: facultyId,
            academic_year: academicYear,
            semester: semester,
            department_id: finalDepartmentId,
            section: section,
            component_type: "lab" as const,
            batch: batchName,
          }

          console.log("Inserting lab course:", courseData)

          const { error } = await supabase.from("courses").insert(courseData)
          if (error) {
            console.error("Error inserting lab course:", error)
            return { error }
          }
        }
      }

      console.log("Faculty assignments completed successfully")
      return { error: null }
    } catch (error) {
      console.error("Error in upsertFacultyAssignments:", error)
      return { error }
    }
  },
  // Add method to get courses by subject and component type
  getCoursesBySubjectAndComponent: async (
    subjectId: string,
    componentType: string,
  ): Promise<{ data: any[] | null; error: any }> => {
    try {
      const { data: courses, error: coursesError } = await supabase
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
        .eq("subject_id", subjectId)
        .eq("component_type", componentType)

      if (coursesError) throw coursesError

      return { data: courses || [], error: null }
    } catch (error) {
      console.error("Error fetching courses by subject and component:", error)
      return { data: null, error }
    }
  },
  // FIXED: Method to handle student enrollment with proper batch-specific logic for labs
  enrollStudentsInCourses: async (
    courseIds: string[],
    studentIds: string[],
    batch?: string,
  ): Promise<{ error: any }> => {
    try {
      console.log("enrollStudentsInCourses called with:", { courseIds, studentIds, batch })

      // Get course details to understand what we're enrolling students in
      const { data: courses, error: coursesError } = await supabase
        .from("courses")
        .select(`
        id,
        subject_id,
        component_type,
        section,
        batch,
        faculty_id
      `)
        .in("id", courseIds)

      if (coursesError) {
        console.error("Error fetching course details:", coursesError)
        return { error: coursesError }
      }

      if (!courses || courses.length === 0) {
        return { error: new Error("No courses found") }
      }

      // Group courses by subject and component type
      const courseGroups = new Map<string, any[]>()
      courses.forEach((course) => {
        const key = `${course.subject_id}:${course.component_type}`
        if (!courseGroups.has(key)) {
          courseGroups.set(key, [])
        }
        courseGroups.get(key)!.push(course)
      })

      // Process each subject-component group
      for (const [groupKey, groupCourses] of courseGroups) {
        const [subjectId, componentType] = groupKey.split(":")

        // First, remove existing enrollments for these students in this subject-component
        for (const studentId of studentIds) {
          const { error: deleteError } = await supabase
            .from("course_enrollments")
            .delete()
            .eq("student_id", studentId)
            .in(
              "course_id",
              groupCourses.map((c) => c.id),
            )

          if (deleteError) {
            console.error("Error removing existing enrollments:", deleteError)
            return { error: deleteError }
          }
        }

        // Handle enrollment based on component type
        if (componentType === "lab" && batch) {
          // FIXED: For lab with specific batch, create enrollments for ALL faculty teaching that batch
          const batchCourses = groupCourses.filter((course) => course.batch === batch)

          if (batchCourses.length === 0) {
            console.warn(`No courses found for batch ${batch} in subject ${subjectId}`)
            continue
          }

          // FIXED: Create separate enrollments for each faculty-course combination
          const enrollments = []
          for (const course of batchCourses) {
            for (const studentId of studentIds) {
              enrollments.push({
                course_id: course.id,
                student_id: studentId,
                enrollment_date: new Date().toISOString(),
                is_active: true,
                batch: batch,
              })
            }
          }

          if (enrollments.length > 0) {
            const { error: insertError } = await supabase.from("course_enrollments").insert(enrollments)

            if (insertError) {
              console.error("Error creating lab enrollments:", insertError)
              return { error: insertError }
            }
          }
        } else if (componentType === "theory") {
          // For theory, enroll in all theory courses (usually just one per section, but could be multiple faculty)
          const enrollments = []
          for (const course of groupCourses) {
            for (const studentId of studentIds) {
              enrollments.push({
                course_id: course.id,
                student_id: studentId,
                enrollment_date: new Date().toISOString(),
                is_active: true,
                batch: null, // Theory doesn't have batch
              })
            }
          }

          if (enrollments.length > 0) {
            const { error: insertError } = await supabase.from("course_enrollments").insert(enrollments)

            if (insertError) {
              console.error("Error creating theory enrollments:", insertError)
              return { error: insertError }
            }
          }
        } else {
          // For lab without specific batch or other component types, enroll in all courses
          const enrollments = []
          for (const course of groupCourses) {
            for (const studentId of studentIds) {
              enrollments.push({
                course_id: course.id,
                student_id: studentId,
                enrollment_date: new Date().toISOString(),
                is_active: true,
                batch: course.batch || null,
              })
            }
          }

          if (enrollments.length > 0) {
            const { error: insertError } = await supabase.from("course_enrollments").insert(enrollments)

            if (insertError) {
              console.error("Error creating default enrollments:", insertError)
              return { error: insertError }
            }
          }
        }
      }

      console.log("Student enrollment completed successfully")
      return { error: null }
    } catch (error) {
      console.error("Error in enrollStudentsInCourses:", error)
      return { error }
    }
  },
}

export const subjectService = {
  ...createGenericService("subjects"),
  getByDepartment: async (
    departmentShortName: string,
  ): Promise<{ data: SubjectType[] | null; error: Error | null }> => {
    const { data, error } = await supabase.from("subjects").select("*").eq("department", departmentShortName)
    return { data: data as SubjectType[] | null, error }
  },
  getBySemesterAndAcademicYear: async (
    semester: number,
    academicYear: string,
  ): Promise<{ data: SubjectType[] | null; error: Error | null }> => {
    const { data, error } = await supabase
      .from("subjects")
      .select("*")
      .eq("semester", semester)
      .eq("academic_year", academicYear)
    return { data: data as SubjectType[] | null, error }
  },
  // FIXED: Enhanced method to get subjects with detailed faculty assignments by section
  getSubjectsWithAssignments: async (
    currentUserRole?: string,
    currentUserDepartment?: string,
  ): Promise<{ data: any[] | null; error: any }> => {
    try {
      console.log("Starting getSubjectsWithAssignments...")

      // 1. Get all subjects (optionally filtered by department)
      let subjectsQuery = supabase.from("subjects").select("*")

      if (currentUserRole === "coordinator" && currentUserDepartment) {
        subjectsQuery = subjectsQuery.eq("department", currentUserDepartment)
      }

      const { data: subjectsData, error: subjectsError } = await subjectsQuery
      if (subjectsError) throw subjectsError

      if (!subjectsData || subjectsData.length === 0) {
        return { data: [], error: null }
      }

      // 2. Get all courses with faculty information and section details
      const { data: coursesData, error: coursesError } = await supabase.from("courses").select(`
          id, 
          subject_id, 
          faculty_id, 
          component_type,
          section,
          batch
        `)

      if (coursesError) throw coursesError

      // 3. Get faculty information separately
      const facultyIds = [...new Set((coursesData || []).map((c: any) => c.faculty_id).filter(Boolean))]
      let facultyData: any[] = []

      if (facultyIds.length > 0) {
        const { data: users, error: usersError } = await supabase
          .from("users")
          .select("id, first_name, last_name")
          .in("id", facultyIds)

        if (usersError) throw usersError
        facultyData = users || []
      }

      // 4. Create faculty map
      const facultyMap = new Map()
      facultyData.forEach((user: any) => {
        facultyMap.set(user.id, user)
      })

      // 5. Group courses by subject, section, and component type
      const subjectAssignmentsMap = new Map<
        string,
        {
          sections: Map<
            string,
            {
              theoryFaculty: Set<string>
              labFaculty: Set<string>
            }
          >
        }
      >()

      // Process each course and group faculty by subject, section, and component type
      ;(coursesData || []).forEach((course: any) => {
        if (!course.subject_id || !course.faculty_id) return

        const faculty = facultyMap.get(course.faculty_id)
        if (!faculty) return

        const facultyName = `${faculty.first_name || ""} ${faculty.last_name || ""}`.trim()
        if (!facultyName) return

        if (!subjectAssignmentsMap.has(course.subject_id)) {
          subjectAssignmentsMap.set(course.subject_id, { sections: new Map() })
        }

        const subjectData = subjectAssignmentsMap.get(course.subject_id)!
        if (!subjectData.sections.has(course.section)) {
          subjectData.sections.set(course.section, { theoryFaculty: new Set(), labFaculty: new Set() })
        }

        const sectionData = subjectData.sections.get(course.section)!
        if (course.component_type === "theory") {
          sectionData.theoryFaculty.add(facultyName)
        } else if (course.component_type === "lab") {
          sectionData.labFaculty.add(facultyName)
        }
      })

      // 6. FIXED: Transform subjects with assignment information
      const enrichedSubjects = subjectsData.map((subject) => {
        const assignmentData = subjectAssignmentsMap.get(subject.id)

        // Create section assignments object
        const section_assignments: Record<string, { theory: string[]; lab: string[] }> = {}
        let is_assigned = false

        if (assignmentData) {
          assignmentData.sections.forEach((facultySets, section) => {
            const theoryFaculty = Array.from(facultySets.theoryFaculty)
            const labFaculty = Array.from(facultySets.labFaculty)

            section_assignments[section] = {
              theory: theoryFaculty,
              lab: labFaculty,
            }

            if (theoryFaculty.length > 0 || labFaculty.length > 0) {
              is_assigned = true
            }
          })
        }

        return {
          ...subject,
          section_assignments,
          is_assigned,
        }
      })

      console.log("Enriched subjects:", enrichedSubjects.length)
      return { data: enrichedSubjects, error: null }
    } catch (error) {
      console.error("Error in getSubjectsWithAssignments:", error)
      return { data: null, error }
    }
  },
  // Add this new method to subjectService
  getSubjectOptionsForAssignment: async (
    semester: number,
    academicYear: string,
  ): Promise<{ data: any[] | null; error: any }> => {
    try {
      const { data: subjects, error } = await supabase
        .from("subjects")
        .select("*")
        .eq("semester", semester)
        .eq("academic_year", academicYear)

      if (error) throw error

      const subjectOptions: any[] = []

      subjects?.forEach((subject) => {
        const hasTheory = subject.has_theory
        const hasLab = subject.has_lab
        const numberOfBatches = subject.number_of_batches || 1

        if (hasTheory && hasLab) {
          // Add separate entries for theory and lab
          subjectOptions.push({
            label: `${subject.code} - ${subject.name} (Theory)`,
            value: `${subject.id}:theory`,
            subject_id: subject.id,
            component_type: "theory",
            subject: subject,
            number_of_batches: 1, // Theory always has 1 batch
          })
          subjectOptions.push({
            label: `${subject.code} - ${subject.name} (Lab)`,
            value: `${subject.id}:lab`,
            subject_id: subject.id,
            component_type: "lab",
            subject: subject,
            number_of_batches: numberOfBatches,
          })
        } else if (hasTheory) {
          // Theory only
          subjectOptions.push({
            label: `${subject.code} - ${subject.name}`,
            value: `${subject.id}:theory`,
            subject_id: subject.id,
            component_type: "theory",
            subject: subject,
            number_of_batches: 1,
          })
        } else if (hasLab) {
          // Lab only
          subjectOptions.push({
            label: `${subject.code} - ${subject.name}`,
            value: `${subject.id}:lab`,
            subject_id: subject.id,
            component_type: "lab",
            subject: subject,
            number_of_batches: numberOfBatches,
          })
        } else {
          // Default to theory if no flags are set
          subjectOptions.push({
            label: `${subject.code} - ${subject.name}`,
            value: `${subject.id}:theory`,
            subject_id: subject.id,
            component_type: "theory",
            subject: subject,
            number_of_batches: 1,
          })
        }
      })

      return { data: subjectOptions, error: null }
    } catch (error) {
      console.error("Error getting subject options:", error)
      return { data: null, error }
    }
  },
}

// Timetable service for handling timetable operations
export const timetableService = {
  // Save timetable to database
  saveTimetable: async (timetableData: {
    academic_year: string
    semester: number
    section: string
    data: any
  }): Promise<{ data: any | null; error: any }> => {
    try {
      // Check if timetable already exists
      const { data: existing, error: existingError } = await supabase
        .from("timetables")
        .select("id")
        .eq("academic_year", timetableData.academic_year)
        .eq("semester", timetableData.semester)
        .eq("section", timetableData.section)
        .single()

      if (existingError && existingError.code !== "PGRST116") {
        // PGRST116 is "not found" error, which is expected for new timetables
        throw existingError
      }

      if (existing) {
        // Update existing timetable
        const { data, error } = await supabase
          .from("timetables")
          .update({
            data: timetableData.data,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id)
          .select()
          .single()

        return { data, error }
      } else {
        // Create new timetable
        const { data, error } = await supabase
          .from("timetables")
          .insert({
            academic_year: timetableData.academic_year,
            semester: timetableData.semester,
            section: timetableData.section,
            data: timetableData.data,
          })
          .select()
          .single()

        return { data, error }
      }
    } catch (error) {
      console.error("Error saving timetable:", error)
      return { data: null, error }
    }
  },

  // Load timetable from database
  loadTimetable: async (
    academic_year: string,
    semester: number,
    section: string,
  ): Promise<{ data: any | null; error: any }> => {
    try {
      const { data, error } = await supabase
        .from("timetables")
        .select("*")
        .eq("academic_year", academic_year)
        .eq("semester", semester)
        .eq("section", section)
        .single()

      return { data, error }
    } catch (error) {
      console.error("Error loading timetable:", error)
      return { data: null, error }
    }
  },

  // Get all saved timetables
  getAllTimetables: async (): Promise<{ data: any[] | null; error: any }> => {
    try {
      const { data, error } = await supabase.from("timetables").select("*").order("updated_at", { ascending: false })

      return { data, error }
    } catch (error) {
      console.error("Error fetching all timetables:", error)
      return { data: null, error }
    }
  },

  // Delete timetable
  deleteTimetable: async (id: string): Promise<{ error: any }> => {
    try {
      const { error } = await supabase.from("timetables").delete().eq("id", id)
      return { error }
    } catch (error) {
      console.error("Error deleting timetable:", error)
      return { error }
    }
  },
}

export const attendanceService = {
  ...createGenericService("attendance"),
  getAttendanceSummary: async (): Promise<{ data: any[] | null; error: any }> => {
    try {
      const { data, error } = await supabase
        .from("attendance_sessions")
        .select(`
          id,
          date,
          created_by_id, // Make sure to select created_by_id
          subject_assignments(
            subjects(name, code)
          )
        `)
        .order("date", { ascending: false })
        .limit(10)

      return { data, error }
    } catch (error) {
      console.error("Error fetching attendance summary:", error)
      return { data: null, error }
    }
  },
  getStudentAttendance: async (studentId: string): Promise<{ data: any[] | null; error: any }> => {
    try {
      const { data, error } = await supabase
        .from("attendance_records")
        .select(`
          *,
          attendance_sessions(
            date,
            created_by_id, // Make sure to select created_by_id
            subject_assignments(
              subjects(name, code)
            )
          )
        `)
        .eq("student_id", studentId)
        .order("created_at", { ascending: false })

      return { data, error }
    } catch (error) {
      console.error("Error fetching student attendance:", error)
      return { data: null, error }
    }
  },
  getRecordsBySession: async (sessionId: string): Promise<{ data: any[] | null; error: any }> => {
    try {
      const { data, error } = await supabase.from("attendance_records").select("*").eq("session_id", sessionId)

      return { data, error }
    } catch (error) {
      console.error("Error fetching records by session:", error)
      return { data: null, error }
    }
  },
  getSessionsBySubjectAssignment: async (subjectAssignmentId: string): Promise<{ data: any[] | null; error: any }> => {
    try {
      const { data, error } = await supabase
        .from("attendance_sessions")
        .select("*")
        .eq("subject_assignment_id", subjectAssignmentId)
        .order("date", { ascending: false })

      return { data, error }
    } catch (error) {
      console.error("Error fetching sessions by subject assignment:", error)
      return { data: null, error }
    }
  },
  createSession: async (sessionData: any): Promise<any> => {
    try {
      const { data, error } = await supabase.from("attendance_sessions").insert(sessionData).select().single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("Error creating attendance session:", error)
      throw error
    }
  },
  markAttendance: async (records: any[]): Promise<{ data: any[] | null; error: any }> => {
    try {
      const { data, error } = await supabase.from("attendance_records").insert(records).select()

      return { data, error }
    } catch (error) {
      console.error("Error marking attendance:", error)
      return { data: null, error }
    }
  },
}

export const marksService = createGenericService("ia_marks")
export const notificationService = createGenericService("notifications")
export const materialService = createGenericService("materials")
export const feedbackService = createGenericService("feedback_responses")

// Custom service for achievements to include student department
export const achievementService = {
  ...createGenericService<Database["public"]["Tables"]["achievements"]["Row"]>("achievements"),
  getAll: async (): Promise<{ data: any[] | null; error: any }> => {
    // Get all achievements first
    const { data: achievements, error: achievementsError } = await supabase.from("achievements").select("*")

    if (achievementsError) {
      return { data: null, error: achievementsError }
    }

    // Get student information for each achievement
    const enrichedAchievements = await Promise.all(
      (achievements || []).map(async (achievement) => {
        const { data: student, error: studentError } = await supabase
          .from("students")
          .select(`
            usn,
            users(first_name, last_name, department)
          `)
          .eq("user_id", achievement.student_id)
          .single()

        if (studentError) {
          console.error("Error fetching student for achievement:", studentError)
          return {
            ...achievement,
            student_name: "Unknown",
            student_usn: "Unknown",
            student_department: "Unknown",
          }
        }

        return {
          ...achievement,
          student_name: `${student.users.first_name || ""} ${student.users.last_name || ""}`.trim(),
          student_usn: student.usn,
          student_department: student.users.department,
        }
      }),
    )

    return { data: enrichedAchievements, error: null }
  },
}

export const analyticsService = {
  async getOverallStats() {
    // Count students
    const { count: studentCount, error: studentErr } = await supabase
      .from("users")
      .select("id", { count: "exact", head: true })
      .eq("role", "student")
      .eq("is_active", true)

    if (studentErr) {
      console.error("Error fetching student count for analytics:", studentErr)
    }

    // Count faculty (including all faculty roles)
    const { count: facultyCount, error: facultyErr } = await supabase
      .from("users")
      .select("id", { count: "exact", head: true })
      .in("role", ["faculty", "hod", "coordinator", "principal", "admin"])
      .eq("is_active", true)

    if (facultyErr) {
      console.error("Error fetching faculty count for analytics:", facultyErr)
    }

    const averageAttendance = 85.5
    const averagePerformance = 78.2

    return {
      totalStudents: studentCount ?? 0,
      totalFaculty: facultyCount ?? 0,
      averageAttendance,
      averagePerformance,
    }
  },
}

// Custom service for leaves (forms/applications) to include user department
export const leavesService = {
  ...createGenericService<Database["public"]["Tables"]["leaves"]["Row"]>("leaves"),
  getAll: async (): Promise<{ data: ApplicationType[] | null; error: any }> => {
    // Get all leaves first
    const { data: leaves, error: leavesError } = await supabase.from("leaves").select("*")

    if (leavesError) {
      return { data: null, error: leavesError }
    }

    if (!leaves || leaves.length === 0) {
      return { data: [], error: null }
    }

    // Get user IDs
    const userIds = leaves.map((l) => l.user_id).filter(Boolean)

    if (userIds.length === 0) {
      return { data: leaves.map((l) => ({ ...l, department: null })), error: null }
    }

    // Get user data for these user IDs
    const { data: users, error: usersError } = await supabase.from("users").select("id, department").in("id", userIds)

    if (usersError) {
      console.error("Error fetching users for leaves:", usersError)
      return { data: leaves.map((l) => ({ ...l, department: null })), error: null }
    }

    // Create a map of users by ID
    const userMap = new Map()
    users?.forEach((user) => {
      userMap.set(user.id, user)
    })

    // Enrich leaves with department data
    const enrichedData = leaves.map((item) => ({
      ...item,
      department: item.user_id ? userMap.get(item.user_id)?.department || null : null,
    }))

    return { data: enrichedData as ApplicationType[], error: null }
  },
}

export const leaveAllocationService = {
  ...createGenericService("leave_allocations"),
  getLeaveBalances: async (): Promise<any> => {
    const { data, error } = await supabase.from("leave_allocations").select("*")
    if (error) {
      console.error("Error fetching leave allocations:", error)
      throw error
    }

    const leaveBalance: any = {
      CL: 0,
      RH: 0,
      OOD: 0,
      CO: 0,
      SL: 0,
      LWP: 0,
      EL: 0,
    }

    data.forEach((allocation) => {
      if (allocation.leave_type in leaveBalance) {
        leaveBalance[allocation.leave_type as keyof any] = allocation.allocation
      }
    })

    return leaveBalance
  },
  updateLeaveBalances: async (leaveBalances: any): Promise<void> => {
    const updates = Object.entries(leaveBalances).map(([leaveType, allocation]) => ({
      leave_type: leaveType,
      allocation: allocation,
    }))

    for (const update of updates) {
      const { error } = await supabase
        .from("leave_allocations")
        .update({ allocation: update.allocation })
        .eq("leave_type", update.leave_type)

      if (error) {
        console.error(`Error updating leave allocation for ${update.leave_type}:`, error)
        throw error
      }
    }
  },
}

// Application service for handling form applications
export const applicationService = {
  ...createGenericService<ApplicationType>("applications"),
  getByStudentId: async (studentId: string): Promise<{ data: ApplicationType[] | null; error: any }> => {
    const { data, error } = await supabase.from("applications").select("*").eq("student_id", studentId)
    return { data: data as ApplicationType[] | null, error }
  },
  getByStatus: async (status: string): Promise<{ data: ApplicationType[] | null; error: any }> => {
    const { data, error } = await supabase.from("applications").select("*").eq("status", status)
    return { data: data as ApplicationType[] | null, error }
  },
  updateStatus: async (id: string, status: string): Promise<{ data: ApplicationType | null; error: any }> => {
    const { data, error } = await supabase.from("applications").update({ status }).eq("id", id).select().single()
    return { data: data as ApplicationType | null, error }
  },
}

// Export the supabase client for direct use if needed
export { supabase }

export const apiService = {
  users: userService,
  students: studentService,
  faculty: facultyService,
  departments: departmentService,
  subjects: subjectService,
  courses: courseService,
  attendance: attendanceService,
  marks: marksService,
  achievements: achievementService,
  notifications: notificationService,
  materials: materialService,
  feedback: feedbackService,
  analytics: analyticsService,
  leaveAllocations: leaveAllocationService,
  leaves: leavesService,
  forms: leavesService, // Alias forms to leavesService for backward compatibility
  timetables: timetableService,
  applications: applicationService,
  weeklyTimetableModifications: weeklyTimetableModificationsService,
}
