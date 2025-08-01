import { NextResponse } from "next/server"
import { createServiceRoleClient } from "@/lib/supabase-service-new"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const department = searchParams.get("department")
    const semester = searchParams.get("semester")
    const section = searchParams.get("section")

    if (!department) {
      return NextResponse.json({ success: false, error: "Department is required" }, { status: 400 })
    }

    const supabase = createServiceRoleClient()

    // Get students from the same department (similar to assign-subjects)
    const usersQuery = supabase
      .from("users")
      .select("*")
      .eq("department", department)
      .eq("role", "student")
      .eq("is_active", true)

    const { data: users, error: usersError } = await usersQuery

    if (usersError) {
      console.error("Error fetching users:", usersError)
      return NextResponse.json({ success: false, error: "Failed to fetch users" }, { status: 500 })
    }

    if (!users || users.length === 0) {
      return NextResponse.json({ success: true, data: [] })
    }

    // Get student records for these users
    const userIds = users.map((u) => u.id)
    let studentsQuery = supabase.from("students").select("*").in("user_id", userIds)

    // Apply filters if provided
    if (semester) {
      studentsQuery = studentsQuery.eq("semester", Number.parseInt(semester))
    }
    if (section) {
      studentsQuery = studentsQuery.eq("section", section)
    }

    const { data: studentRecords, error: studentError } = await studentsQuery

    if (studentError) {
      console.error("Error fetching student records:", studentError)
      return NextResponse.json({ success: false, error: "Failed to fetch student records" }, { status: 500 })
    }

    // Create student map
    const studentMap = new Map()
    studentRecords?.forEach((student) => {
      studentMap.set(student.user_id, student)
    })

    // Get already assigned students
    const { data: assignments, error: assignmentError } = await supabase
      .from("proctor_assignments")
      .select("student_id")
      .eq("is_active", true)
      .in("student_id", userIds)

    if (assignmentError) {
      console.error("Error fetching assignments:", assignmentError)
    }

    const assignedStudentIds = new Set(assignments?.map((a) => a.student_id) || [])

    // Combine data and filter out already assigned students
    const studentData = users
      .filter((user) => studentMap.has(user.id) && !assignedStudentIds.has(user.id))
      .map((user) => {
        const studentRecord = studentMap.get(user.id)

        return {
          student_id: user.id,
          student_name: `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.email,
          student_usn: studentRecord?.usn || "",
          student_email: user.email,
          department: user.department,
          semester: studentRecord?.semester || 1,
          section: studentRecord?.section || "A",
          batch: studentRecord?.batch || "",
        }
      })

    return NextResponse.json({
      success: true,
      data: studentData,
    })
  } catch (error) {
    console.error("Error in students API:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
