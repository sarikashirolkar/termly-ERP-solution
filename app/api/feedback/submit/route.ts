import { type NextRequest, NextResponse } from "next/server"
import { createServiceRoleClient } from "@/lib/supabase-service-new"

export async function POST(request: NextRequest) {
  try {
    const supabaseServiceRole = createServiceRoleClient()
    const body = await request.json()
    const { student_id, course_id, subject_id, faculty_id, feedback_type, ratings, message, is_anonymous } = body

    console.log("Submitting feedback:", body)

    if (!student_id || !course_id || !subject_id || !faculty_id || !feedback_type || !ratings) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const averageRating = ratings.reduce((sum: number, rating: number) => sum + rating, 0) / ratings.length

    const { data: feedback, error: feedbackError } = await supabaseServiceRole
      .from("student_feedback")
      .insert({
        student_id,
        faculty_id,
        subject_id,
        course_id,
        message: message || "",
        rating: Math.round(averageRating),
        feedback_type,
        status: "pending",
        is_anonymous: is_anonymous || false,
        submitted_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (feedbackError) {
      console.error("Error inserting feedback:", feedbackError)
      return NextResponse.json({ error: "Failed to submit feedback: " + feedbackError.message }, { status: 500 })
    }

    console.log("Feedback submitted successfully:", feedback) // Added log to confirm inserted data

    // Re-enable or remove this block based on your database schema for feedback_ratings
    /*
    if (ratings && ratings.length > 0) {
      const ratingInserts = ratings.map((rating: number, index: number) => ({
        feedback_id: feedback.id,
        question_index: index,
        rating_value: rating,
      }))

      const { error: ratingsError } = await supabaseServiceRole.from("feedback_ratings").insert(ratingInserts)

      if (ratingsError) {
        console.error("Error inserting ratings:", ratingsError)
      }
    }
    */

    return NextResponse.json({
      success: true,
      data: feedback,
      message: "Feedback submitted successfully",
    })
  } catch (error: any) {
    console.error("Error in submit feedback API:", error)
    console.error("Full error object:", JSON.stringify(error, Object.getOwnPropertyNames(error)))
    return NextResponse.json({ error: "Internal server error: " + (error.message || "Unknown error") }, { status: 500 })
  }
}
