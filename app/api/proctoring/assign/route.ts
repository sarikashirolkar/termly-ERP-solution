import { NextResponse } from "next/server"
import { createServiceRoleClient } from "@/lib/supabase-service-new"

export async function POST(request: Request) {
  try {
    const { proctorId, studentIds, assignedBy } = await request.json()

    if (!proctorId || !studentIds || !Array.isArray(studentIds) || studentIds.length === 0 || !assignedBy) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    const supabase = createServiceRoleClient()

    // Check if proctor exists and get current assignment count
    const { data: proctor, error: proctorError } = await supabase
      .from("users")
      .select("id, first_name, last_name")
      .eq("id", proctorId)
      .single()

    if (proctorError || !proctor) {
      return NextResponse.json({ success: false, error: "Proctor not found" }, { status: 404 })
    }

    // Get current proctor assignment count
    const { count: currentCount, error: countError } = await supabase
      .from("proctor_assignments")
      .select("id", { count: "exact", head: true })
      .eq("proctor_id", proctorId)
      .eq("is_active", true)

    if (countError) {
      console.error("Error counting assignments:", countError)
      return NextResponse.json({ success: false, error: "Failed to check current assignments" }, { status: 500 })
    }

    const maxProctees = 20
    if ((currentCount || 0) + studentIds.length > maxProctees) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot assign ${studentIds.length} students. Proctor can have maximum ${maxProctees} proctees. Currently has ${currentCount || 0}.`,
        },
        { status: 400 },
      )
    }

    // Check if any students are already assigned
    const { data: existingAssignments, error: existingError } = await supabase
      .from("proctor_assignments")
      .select("student_id")
      .in("student_id", studentIds)
      .eq("is_active", true)

    if (existingError) {
      console.error("Error checking existing assignments:", existingError)
      return NextResponse.json({ success: false, error: "Failed to check existing assignments" }, { status: 500 })
    }

    if (existingAssignments && existingAssignments.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Some students are already assigned to other proctors",
        },
        { status: 400 },
      )
    }

    // Create assignments
    const assignments = studentIds.map((studentId) => ({
      proctor_id: proctorId,
      student_id: studentId,
      assigned_by: assignedBy,
      is_active: true,
    }))

    const { error: insertError } = await supabase.from("proctor_assignments").insert(assignments)

    if (insertError) {
      console.error("Error creating assignments:", insertError)
      return NextResponse.json({ success: false, error: "Failed to create assignments" }, { status: 500 })
    }

    const proctorName = `${proctor.first_name || ""} ${proctor.last_name || ""}`.trim()

    return NextResponse.json({
      success: true,
      message: `Successfully assigned ${studentIds.length} students to ${proctorName}`,
    })
  } catch (error) {
    console.error("Error in assign API:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
