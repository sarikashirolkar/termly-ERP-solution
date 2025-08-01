import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  console.log("[SERVER] Marks save API called")

  try {
    const body = await request.json()
    const { marks } = body
    const userId = request.headers.get("x-user-id")

    console.log("[SERVER] Marks save API called with:", marks?.length, "marks")

    if (!marks || !Array.isArray(marks) || marks.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No marks data provided",
        },
        { status: 400 },
      )
    }

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: "User authentication required",
        },
        { status: 401 },
      )
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Prepare marks for insertion/update
    const marksToSave = marks.map((mark) => ({
      student_id: mark.studentId,
      course_id: mark.courseId,
      assessment_type: mark.assessmentType,
      max_marks: mark.maxMarks,
      obtained_marks: mark.obtainedMarks,
      assessment_date: mark.assessmentDate,
      entered_by: userId,
      entered_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      remarks: mark.remarks || null,
    }))

    console.log("[SERVER] Prepared marks for insertion:", marksToSave.length)

    // Use upsert to handle both insert and update cases
    const { data, error } = await supabase
      .from("student_marks")
      .upsert(marksToSave, {
        onConflict: "student_id,course_id,assessment_type",
        ignoreDuplicates: false,
      })
      .select()

    if (error) {
      console.error("[SERVER] Database error in save marks:", error.message)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to save marks to database",
          details: error.message,
        },
        { status: 500 },
      )
    }

    console.log("[SERVER] Marks saved successfully:", data?.length || marksToSave.length)

    return NextResponse.json({
      success: true,
      message: `Successfully saved ${marksToSave.length} marks`,
      data: data,
    })
  } catch (error) {
    console.error("[SERVER] Unexpected error in save marks API:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
