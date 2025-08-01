import { NextResponse } from "next/server"
import { createServiceRoleClient } from "@/lib/supabase-service-new"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const proctorId = searchParams.get("proctorId")

    if (!proctorId) {
      return NextResponse.json({ success: false, error: "Proctor ID is required" }, { status: 400 })
    }

    const supabase = createServiceRoleClient()

    // Get active assignments for this proctor
    const { data: assignments, error: assignmentError } = await supabase
      .from("proctor_assignments")
      .select("student_id, assigned_at")
      .eq("proctor_id", proctorId)
      .eq("is_active", true)

    if (assignmentError) {
      console.error("Error fetching assignments:", assignmentError)
      return NextResponse.json({ success: false, error: "Failed to fetch assignments" }, { status: 500 })
    }

    if (!assignments || assignments.length === 0) {
      return NextResponse.json({ success: true, data: [] })
    }

    const studentIds = assignments.map((a) => a.student_id)

    // Get student user data
    const { data: users, error: usersError } = await supabase.from("users").select("*").in("id", studentIds)

    if (usersError) {
      console.error("Error fetching users:", usersError)
      return NextResponse.json({ success: false, error: "Failed to fetch student users" }, { status: 500 })
    }

    // Get student records
    const { data: studentRecords, error: studentError } = await supabase
      .from("students")
      .select("*")
      .in("user_id", studentIds)

    if (studentError) {
      console.error("Error fetching student records:", studentError)
      return NextResponse.json({ success: false, error: "Failed to fetch student records" }, { status: 500 })
    }

    // Create maps for easy lookup
    const userMap = new Map()
    users?.forEach((user) => {
      userMap.set(user.id, user)
    })

    const studentMap = new Map()
    studentRecords?.forEach((student) => {
      studentMap.set(student.user_id, student)
    })

    const assignmentMap = new Map()
    assignments.forEach((assignment) => {
      assignmentMap.set(assignment.student_id, assignment)
    })

    // Combine data
    const procteeData = studentIds
      .filter((id) => userMap.has(id) && studentMap.has(id))
      .map((studentId) => {
        const user = userMap.get(studentId)
        const student = studentMap.get(studentId)
        const assignment = assignmentMap.get(studentId)

        return {
          id: studentId,
          name: `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.email,
          usn: student.usn || "",
          email: user.email,
          phone: user.phone || "",
          department: user.department,
          semester: student.semester || 1,
          section: student.section || "A",
          batch: student.batch || "",
          cgpa: student.cgpa || 0,
          parentName: student.parent_name || student.father_name || "",
          parentPhone: student.father_phone || "",
          assignedAt: assignment.assigned_at,
        }
      })

    return NextResponse.json({
      success: true,
      data: procteeData,
    })
  } catch (error) {
    console.error("Error in my-proctees API:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
