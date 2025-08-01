import { type NextRequest, NextResponse } from "next/server"
import { createServiceRoleClient } from "@/lib/supabase-service-new" // Import service role client

export async function GET(request: NextRequest) {
  try {
    const supabaseServiceRole = createServiceRoleClient() // Use service role client for fetching
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get("studentId")

    if (!studentId) {
      return NextResponse.json({ error: "Student ID is required" }, { status: 400 })
    }

    console.log("Fetching feedback history for student:", studentId)

    // Get student's feedback history with subject information
    const { data: feedbackHistory, error } = await supabaseServiceRole // Use service role client here
      .from("student_feedback")
      .select(`
        id,
        subject_id,
        faculty_id,
        subject_name,
        message,
        response,
        rating,
        feedback_type,
        status,
        submitted_at,
        responded_at,
        subjects!student_feedback_subject_id_fkey(
          code,
          name
        )
      `)
      .eq("student_id", studentId)
      .order("submitted_at", { ascending: false })

    if (error) {
      console.error("Error fetching student feedback history:", error)
      return NextResponse.json({ error: "Failed to fetch feedback history" }, { status: 500 })
    }

    console.log("Raw feedback history data from Supabase:", feedbackHistory)

    // Get faculty information separately
    const facultyIds = feedbackHistory?.map((f: any) => f.faculty_id).filter(Boolean) || []

    let facultyData: any[] = []
    if (facultyIds.length > 0) {
      const { data: faculty, error: facultyError } = await supabaseServiceRole // Use service role client here
        .from("users")
        .select("id, first_name, last_name")
        .in("id", facultyIds)

      if (facultyError) {
        console.error("Error fetching faculty data:", facultyError)
      } else {
        facultyData = faculty || []
      }
    }

    // Transform the data for frontend consumption
    const transformedHistory =
      feedbackHistory?.map((feedback: any) => {
        const faculty = facultyData.find((f) => f.id === feedback.faculty_id)
        return {
          id: feedback.id,
          subject_code: feedback.subjects?.code || "N/A",
          subject_name: feedback.subjects?.name || feedback.subject_name || "N/A",
          faculty_name: faculty ? `${faculty.first_name || ""} ${faculty.last_name || ""}`.trim() : "Unknown Faculty",
          message: feedback.message,
          response: feedback.response,
          rating: feedback.rating,
          feedback_type: feedback.feedback_type,
          status: feedback.status,
          submitted_at: feedback.submitted_at,
          responded_at: feedback.responded_at,
        }
      }) || []

    console.log("Transformed feedback history:", transformedHistory)

    return NextResponse.json({
      success: true,
      data: transformedHistory,
    })
  } catch (error) {
    console.error("Error in student feedback history API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
