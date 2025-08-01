import { type NextRequest, NextResponse } from "next/server"
import { createServiceRoleClient } from "@/lib/supabase-service-new"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { feedbackId, response } = body
    const facultyId = request.headers.get("x-user-id")

    console.log("[SERVER]Received response submission request:", { feedbackId, response, facultyId })

    if (!feedbackId || !response || !facultyId) {
      console.error("[SERVER]Missing required fields for feedback response:", { feedbackId, response, facultyId })
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = createServiceRoleClient()

    console.log("[SERVER]Attempting to update feedback with:", { feedbackId, response, facultyId })

    // First, let's check if the feedback exists and belongs to this faculty
    const { data: existingFeedback, error: checkError } = await supabase
      .from("student_feedback")
      .select("id, faculty_id, status")
      .eq("id", feedbackId)
      .single()

    if (checkError) {
      console.error("[SERVER]Error checking existing feedback:", checkError)
      return NextResponse.json({ error: "Failed to find feedback entry" }, { status: 500 })
    }

    if (!existingFeedback) {
      console.error("[SERVER]No feedback found with ID:", feedbackId)
      return NextResponse.json({ error: "Feedback entry not found" }, { status: 404 })
    }

    if (existingFeedback.faculty_id !== facultyId) {
      console.error("[SERVER]Faculty ID mismatch:", { expected: existingFeedback.faculty_id, provided: facultyId })
      return NextResponse.json({ error: "Not authorized to respond to this feedback" }, { status: 403 })
    }

    // Update feedback with response - removed updated_at field since table doesn't have it
    const { data: updatedFeedback, error } = await supabase
      .from("student_feedback")
      .update({
        response: response,
        status: "responded",
        responded_at: new Date().toISOString(),
      })
      .eq("id", feedbackId)
      .select()
      .single()

    if (error) {
      console.error("[SERVER]Error updating feedback response:", error)
      return NextResponse.json({ error: "Failed to submit response" }, { status: 500 })
    }

    console.log("[SERVER]Response submitted successfully:", updatedFeedback)

    return NextResponse.json({
      success: true,
      data: updatedFeedback,
      message: "Response submitted successfully",
    })
  } catch (error) {
    console.error("[SERVER]Error in respond to feedback API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
