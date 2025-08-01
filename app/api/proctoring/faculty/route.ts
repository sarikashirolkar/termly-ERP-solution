import { NextResponse } from "next/server"
import { createServiceRoleClient } from "@/lib/supabase-service-new"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const department = searchParams.get("department")

    if (!department) {
      return NextResponse.json({ success: false, error: "Department is required" }, { status: 400 })
    }

    const supabase = createServiceRoleClient()

    // Get faculty from the same department (similar to assign-subjects)
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("*")
      .eq("department", department)
      .in("role", ["faculty", "hod", "coordinator"])
      .eq("is_active", true)

    if (usersError) {
      console.error("Error fetching users:", usersError)
      return NextResponse.json({ success: false, error: "Failed to fetch users" }, { status: 500 })
    }

    if (!users || users.length === 0) {
      return NextResponse.json({ success: true, data: [] })
    }

    // Get faculty records for these users
    const userIds = users.map((u) => u.id)
    const { data: facultyRecords, error: facultyError } = await supabase
      .from("faculty")
      .select("*")
      .in("user_id", userIds)

    if (facultyError) {
      console.error("Error fetching faculty records:", facultyError)
      return NextResponse.json({ success: false, error: "Failed to fetch faculty records" }, { status: 500 })
    }

    // Create faculty map
    const facultyMap = new Map()
    facultyRecords?.forEach((faculty) => {
      facultyMap.set(faculty.user_id, faculty)
    })

    // Get current proctor assignment counts
    const { data: assignmentCounts, error: countError } = await supabase
      .from("proctor_assignments")
      .select("proctor_id")
      .eq("is_active", true)

    if (countError) {
      console.error("Error fetching assignment counts:", countError)
    }

    // Count assignments per proctor
    const proctorCounts = new Map()
    assignmentCounts?.forEach((assignment) => {
      const count = proctorCounts.get(assignment.proctor_id) || 0
      proctorCounts.set(assignment.proctor_id, count + 1)
    })

    // Combine data
    const facultyData = users
      .filter((user) => facultyMap.has(user.id))
      .map((user) => {
        const facultyRecord = facultyMap.get(user.id)
        const currentProctees = proctorCounts.get(user.id) || 0

        return {
          faculty_id: user.id,
          faculty_name: `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.email,
          faculty_email: user.email,
          faculty_phone: user.phone || "",
          designation: facultyRecord?.designation || "Faculty",
          employee_id: facultyRecord?.employee_id || "",
          current_proctees_count: currentProctees,
          max_proctees: 20, // Default max proctees
        }
      })

    return NextResponse.json({
      success: true,
      data: facultyData,
    })
  } catch (error) {
    console.error("Error in faculty API:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
