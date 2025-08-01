import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(request: NextRequest) {
  console.log("[API] Starting existing marks request")

  try {
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get("course_id")
    const assessmentType = searchParams.get("assessment_type")
    const batch = searchParams.get("batch")
    const userId = request.headers.get("x-user-id")

    console.log("[API] Request parameters:", {
      courseId,
      assessmentType,
      batch,
      userId,
    })

    // Validate required parameters
    if (!courseId || !assessmentType) {
      console.log("[API] Missing required parameters")
      return NextResponse.json(
        {
          success: false,
          error: "Missing required parameters: course_id and assessment_type are required",
        },
        { status: 400 },
      )
    }

    if (!userId) {
      console.log("[API] Missing user ID")
      return NextResponse.json(
        {
          success: false,
          error: "User authentication required",
        },
        { status: 401 },
      )
    }

    // Initialize Supabase client
    let supabase
    try {
      supabase = createClient(supabaseUrl, supabaseServiceKey)
      console.log("[API] Supabase client created successfully")
    } catch (error) {
      console.error("[API] Failed to create Supabase client:", error)
      return NextResponse.json(
        {
          success: false,
          error: "Database connection failed",
        },
        { status: 500 },
      )
    }

    console.log("[API] Executing database query...")

    // Get existing marks from student_marks table
    const { data: existingMarks, error: marksError } = await supabase
      .from("student_marks")
      .select(`
        student_id,
        obtained_marks,
        max_marks,
        assessment_date
      `)
      .eq("course_id", courseId)
      .eq("assessment_type", assessmentType)

    if (marksError) {
      console.error("[API] Database query error:", marksError)
      return NextResponse.json(
        {
          success: false,
          error: `Database query failed: ${marksError.message}`,
        },
        { status: 500 },
      )
    }

    console.log("[API] Found existing marks:", existingMarks?.length || 0)

    // If batch is specified, filter by students enrolled in that batch
    let filteredMarks = existingMarks || []

    if (batch && batch.trim() !== "" && batch !== "null" && batch !== "undefined") {
      console.log("[API] Filtering by batch:", batch)

      // Get students enrolled in the specific batch for this course
      const { data: enrollments, error: enrollmentError } = await supabase
        .from("course_enrollments")
        .select("student_id")
        .eq("course_id", courseId)
        .eq("batch", batch)

      if (enrollmentError) {
        console.error("[API] Error fetching enrollments for batch filtering:", enrollmentError)
        // Continue without batch filtering if enrollment query fails
      } else if (enrollments) {
        const batchStudentIds = enrollments.map((e) => e.student_id)
        console.log("[API] Students in batch:", batchStudentIds.length)
        filteredMarks = filteredMarks.filter((mark) => batchStudentIds.includes(mark.student_id))
        console.log("[API] Filtered marks for batch:", filteredMarks.length)
      }
    }

    console.log("[API] Query executed successfully, returning", filteredMarks.length, "records")

    // Return the results in the format expected by frontend
    return NextResponse.json({
      success: true,
      data: filteredMarks,
    })
  } catch (error) {
    console.error("[API] Unexpected error in existing marks API:", error)

    // Ensure we always return JSON
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "An unexpected error occurred",
      },
      { status: 500 },
    )
  }
}
