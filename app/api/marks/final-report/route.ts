import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseServiceRole = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get("course_id")
    const batch = searchParams.get("batch")
    const userId = request.headers.get("x-user-id")

    console.log("[SERVER] Final report API called with:", { courseId, batch, userId })

    if (!courseId) {
      return NextResponse.json(
        {
          success: false,
          error: "Course ID is required",
        },
        { status: 400 },
      )
    }

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: "User ID is required",
        },
        { status: 401 },
      )
    }

    // Get all students for the course
    const studentsQuery = supabaseServiceRole
      .from("enrollments")
      .select(`
        student_id,
        users!inner (
          id,
          full_name,
          email,
          raw_user_meta_data
        )
      `)
      .eq("course_id", courseId)

    const { data: students, error: studentsError } = await studentsQuery

    if (studentsError) {
      console.error("[SERVER] Error fetching students:", studentsError)
      return NextResponse.json(
        {
          success: false,
          error: `Failed to fetch students: ${studentsError.message}`,
        },
        { status: 500 },
      )
    }

    console.log("[SERVER] Found", students?.length || 0, "students")

    if (!students || students.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
      })
    }

    // Get marks for all students in this course
    let marksQuery = supabaseServiceRole
      .from("marks")
      .select(`
        student_id,
        assessment_type,
        obtained_marks,
        max_marks
      `)
      .eq("course_id", courseId)

    if (batch) {
      marksQuery = marksQuery.eq("batch", batch)
    }

    const { data: marks, error: marksError } = await marksQuery

    if (marksError) {
      console.error("[SERVER] Error fetching marks:", marksError)
      return NextResponse.json(
        {
          success: false,
          error: `Failed to fetch marks: ${marksError.message}`,
        },
        { status: 500 },
      )
    }

    console.log("[SERVER] Found", marks?.length || 0, "marks records")

    // Process final report data
    const finalReportData = students.map((student: any) => {
      const studentMarks = marks?.filter((mark: any) => mark.student_id === student.student_id) || []

      // Calculate IA average
      const iaMarks = studentMarks.filter((mark: any) => mark.assessment_type.startsWith("IA"))
      const iaAverage =
        iaMarks.length > 0
          ? iaMarks.reduce((sum: number, mark: any) => sum + (mark.obtained_marks / mark.max_marks) * 100, 0) /
            iaMarks.length
          : 0

      // Calculate assignment average
      const assignmentMarks = studentMarks.filter((mark: any) => mark.assessment_type.startsWith("Assignment"))
      const assignmentAverage =
        assignmentMarks.length > 0
          ? assignmentMarks.reduce((sum: number, mark: any) => sum + (mark.obtained_marks / mark.max_marks) * 100, 0) /
            assignmentMarks.length
          : 0

      // Calculate final total (50% IA + 50% Assignment)
      const finalTotal = iaAverage > 0 && assignmentAverage > 0 ? iaAverage * 0.5 + assignmentAverage * 0.5 : 0

      // Determine grade
      let grade = "F"
      if (finalTotal >= 90) grade = "A+"
      else if (finalTotal >= 80) grade = "A"
      else if (finalTotal >= 70) grade = "B+"
      else if (finalTotal >= 60) grade = "B"
      else if (finalTotal >= 50) grade = "C"

      const userData = student.users
      const userMeta = userData.raw_user_meta_data || {}

      return {
        student_id: student.student_id,
        student_name: userData.full_name || userMeta.full_name || "Unknown",
        usn: userMeta.usn || userMeta.student_id || "N/A",
        ia_average: Math.round(iaAverage * 100) / 100,
        assignment_average: Math.round(assignmentAverage * 100) / 100,
        final_total: Math.round(finalTotal * 100) / 100,
        grade,
      }
    })

    console.log("[SERVER] Generated final report for", finalReportData.length, "students")

    return NextResponse.json({
      success: true,
      data: finalReportData,
    })
  } catch (error) {
    console.error("[SERVER] Unexpected error in final report API:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}
