import { createClient } from "@supabase/supabase-js"
import type {
  Database,
  FacultyProfile,
  DepartmentType,
  SubjectType,
  CourseType,
  StudentProfile,
} from "./database-schema"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Generic service for basic CRUD operations
const createService = <T extends { id: string }>(tableName: string) => ({
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

// Specific services for each table
export const userService = {
  ...createService("users"),
  updateUserRole: async (userId: string, role: string): Promise<{ data: any | null; error: any }> => {
    const { data, error } = await supabase.from("users").update({ role }).eq("id", userId).select().single()
    return { data, error }
  },
}

export const studentService = {
  ...createService("students"),
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
    // Get students by semester and section
    const { data: students, error: studentsError } = await supabase
      .from("students")
      .select("*")
      .eq("semester", semester)
      .eq("section", section)

    if (studentsError) {
      return { data: null, error: studentsError }
    }

    if (!students || students.length === 0) {
      return { data: [], error: null }
    }

    // Get user data for these students
    const userIds = students.map((s) => s.user_id)
    const { data: users, error: usersError } = await supabase.from("users").select("*").in("id", userIds)

    if (usersError) {
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
  getById: async (userId: string): Promise<{ data: StudentProfile | null; error: any }> => {
    // Get student record
    const { data: student, error: studentError } = await supabase
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
      user_id: student.user_id,
      id: student.user_id,
      name: `${user.first_name || ""} ${user.last_name || ""}`.trim(),
      usn: student.usn,
      email: user.email || "",
      phone: user.phone || "",
      department: user.department || "N/A",
      semester: student.semester,
      section: student.section,
      batch: student.batch,
      enrollmentDate: student.admission_date || "",
      profilePicture: user.profile_picture || "/placeholder.svg?height=40&width=40",
      is_active: user.is_active,
      cgpa: student.cgpa,
      roll_number: student.roll_number,
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
        if (!studentRecord) return null // Should not happen if userIds are from students

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
      .filter(Boolean) // Remove any nulls if a user didn't have a corresponding student record

    return { data: mappedStudents as StudentProfile[], error: null }
  },
}

export const facultyService = {
  ...createService("faculty"),
  // Override the update method to use 'user_id' instead of 'id'
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

        let effectiveRole = user.role // Start with the role from the users table

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
          role: effectiveRole, // Use the effective role here
        }
      })
      .filter((user) => facultyMap.has(user.id)) // Only include users who have faculty records

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

    let effectiveRole = user.role // Start with the role from the users table

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
      role: effectiveRole, // Use the effective role here
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
          is_hod: facultyRecord?.is_hod || false,
          is_coordinator: facultyRecord?.is_coordinator || false,
          status: user.is_active ? "Active" : "Inactive",
          profilePicture: user.profile_picture || "/placeholder.svg?height=40&width=40",
          role: user.role,
        }
      })
      .filter((user) => facultyMap.has(user.id)) // Only include users who have faculty records

    return { data: mappedFaculty as FacultyProfile[], error: null }
  },
  // Add method to update coordinator status
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

      const pendingCommonLetters = 3 // Placeholder
      const classesThisWeek = 12 // Placeholder
      const pendingAssessments = 4 // Placeholder

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
}

// ---------------------------------------------------------------------------
//  DEPARTMENTS
// ---------------------------------------------------------------------------
export const departmentService = {
  ...createService("departments"),

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

  // unchanged helper
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
  ...createService("courses"),
  getAllCourses: async (): Promise<{ data: CourseType[] | null; error: Error | null }> => {
    const { data, error } = await supabase.from("courses").select(`
      *,
      subjects(name, code, has_theory, has_lab, has_project),
      assigned_faculty:course_faculty_assignments(
        faculty_id,
        faculty:users(id, first_name, last_name, email, role, phone, profile_picture)
      )
    `)

    if (error) {
      return { data: null, error }
    }

    const enrichedCourses = data.map((course: any) => ({
      ...course,
      assigned_faculty: course.assigned_faculty.map((assignment: any) => ({
        id: assignment.faculty.id,
        name: `${assignment.faculty.first_name || ""} ${assignment.faculty.last_name || ""}`.trim(),
        email: assignment.faculty.email,
        role: assignment.faculty.role,
        phone: assignment.faculty.phone,
        profile_picture: assignment.faculty.profile_picture,
      })),
    })) as CourseType[]

    return { data: enrichedCourses, error: null }
  },
  getCoursesByDepartment: async (departmentId: string): Promise<{ data: CourseType[] | null; error: Error | null }> => {
    const { data, error } = await supabase
      .from("courses")
      .select(`
      *,
      subjects(name, code, has_theory, has_lab, has_project),
      assigned_faculty:course_faculty_assignments(
        faculty_id,
        faculty:users(id, first_name, last_name, email, role, phone, profile_picture)
      )
    `)
      .eq("department_id", departmentId)

    if (error) {
      return { data: null, error }
    }

    const enrichedCourses = data.map((course: any) => ({
      ...course,
      assigned_faculty: course.assigned_faculty.map((assignment: any) => ({
        id: assignment.faculty.id,
        name: `${assignment.faculty.first_name || ""} ${assignment.faculty.last_name || ""}`.trim(),
        email: assignment.faculty.email,
        role: assignment.faculty.role,
        phone: assignment.faculty.phone,
        profile_picture: assignment.faculty.profile_picture,
      })),
    })) as CourseType[]

    return { data: enrichedCourses, error: null }
  },
  addCourse: async (
    courseData: Omit<CourseType, "id" | "assigned_faculty">,
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
        // Optionally, roll back the course creation if assignment fails
        await supabase.from("courses").delete().eq("id", newCourse.id)
        return { data: null, error: assignmentsError }
      }
    }

    // Re-fetch the newly created course with its assigned faculty for a complete object
    const { data: fetchedCourse, error: fetchError } = await supabase
      .from("courses")
      .select(`
      *,
      subjects(name, code, has_theory, has_lab, has_project),
      assigned_faculty:course_faculty_assignments(
        faculty_id,
        faculty:users(id, first_name, last_name, email, role, phone, profile_picture)
      )
    `)
      .eq("id", newCourse.id)
      .single()

    if (fetchError) {
      return { data: null, error: fetchError }
    }

    const enrichedFetchedCourse = {
      ...fetchedCourse,
      assigned_faculty: fetchedCourse.assigned_faculty.map((assignment: any) => ({
        id: assignment.faculty.id,
        name: `${assignment.faculty.first_name || ""} ${assignment.faculty.last_name || ""}`.trim(),
        email: assignment.faculty.email,
        role: assignment.faculty.role,
        phone: assignment.faculty.phone,
        profile_picture: assignment.faculty.profile_picture,
      })),
    } as CourseType

    return { data: enrichedFetchedCourse, error: null }
  },
  updateCourse: async (
    id: string,
    updates: Partial<Omit<CourseType, "assigned_faculty">>,
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

    // Re-fetch the updated course with its assigned faculty for a complete object
    const { data: fetchedCourse, error: fetchError } = await supabase
      .from("courses")
      .select(`
      *,
      subjects(name, code, has_theory, has_lab, has_project),
      assigned_faculty:course_faculty_assignments(
        faculty_id,
        faculty:users(id, first_name, last_name, email, role, phone, profile_picture)
      )
    `)
      .eq("id", id)
      .single()

    if (fetchError) {
      return { data: null, error: fetchError }
    }

    const enrichedFetchedCourse = {
      ...fetchedCourse,
      assigned_faculty: fetchedCourse.assigned_faculty.map((assignment: any) => ({
        id: assignment.faculty.id,
        name: `${assignment.faculty.first_name || ""} ${assignment.faculty.last_name || ""}`.trim(),
        email: assignment.faculty.email,
        role: assignment.faculty.role,
        phone: assignment.faculty.phone,
        profile_picture: assignment.faculty.profile_picture,
      })),
    } as CourseType

    return { data: enrichedFetchedCourse, error: null }
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
}

export const subjectService = {
  ...createService("subjects"),
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
}

export const attendanceService = createService("attendance")
export const marksService = createService("ia_marks")
export const achievementService = createService("achievements")
export const notificationService = createService("notifications")
export const materialService = createService("materials")
export const feedbackService = createService("feedback")
export const formsService = createService("surveys")

export const leaveAllocationService = {
  ...createService("leave_allocations"),
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

    const averageAttendance = 85.5 // Placeholder
    const averagePerformance = 78.2 // Placeholder

    return {
      totalStudents: studentCount ?? 0,
      totalFaculty: facultyCount ?? 0,
      averageAttendance,
      averagePerformance,
    }
  },
}

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
  forms: formsService,
}
