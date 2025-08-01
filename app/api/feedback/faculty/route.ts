import { type NextRequest, NextResponse } from "next/server"
import { createServiceRoleClient } from "@/lib/supabase-service-new"

export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceRoleClient()
    const { searchParams } = new URL(request.url)
    const facultyId = request.headers.get("x-user-id")
    const academicYear = searchParams.get("academic_year")
    const semester = searchParams.get("semester")
    const section = searchParams.get("section")
    const subjectId = searchParams.get("subject_id")
    const feedbackType = searchParams.get("feedback_type")
    const status = searchParams.get("status")

    if (!facultyId) {
      return NextResponse.json({ error: "Faculty ID is required" }, { status: 400 })
    }

    console.log("Fetching feedback for faculty:", {
      facultyId,
      academicYear,
      semester,
      section,
      subjectId,
      feedbackType,
      status,
    })

    // Build query with filters
    let query = supabase
      .from("student_feedback")
      .select(`
        id,
        student_id,
        course_id,
        subject_id,
        subject_name,
        message,
        response,
        rating,
        feedback_type,
        status,
        submitted_at,
        responded_at,
        is_anonymous,
        subjects!student_feedback_subject_id_fkey(
          code,
          name
        )
      `)
      .eq("faculty_id", facultyId)

    // Apply filters
    if (feedbackType && feedbackType !== "all") {
      query = query.eq("feedback_type", feedbackType)
    }

    if (status && status !== "all") {
      query = query.eq("status", status)
    }

    if (subjectId && subjectId !== "all") {
      query = query.eq("subject_id", subjectId)
    }

    // For academic year, semester, section filters, we need to join with courses
    if (academicYear || semester || section) {
      let courseQuery = supabase.from("courses").select("id")

      if (academicYear && academicYear !== "all") {
        courseQuery = courseQuery.eq("academic_year", academicYear)
      }

      if (semester && semester !== "all") {
        courseQuery = courseQuery.eq("semester", Number.parseInt(semester))
      }

      if (section && section !== "all") {
        courseQuery = courseQuery.eq("section", section)
      }

      const { data: courses, error: courseError } = await courseQuery

      if (courseError) {
        console.error("Error fetching courses for filtering:", courseError)
        return NextResponse.json({ error: "Failed to fetch feedback" }, { status: 500 })
      }

      const courseIds = courses?.map((c) => c.id) || []
      if (courseIds.length > 0) {
        query = query.in("course_id", courseIds)
      } else {
        return NextResponse.json({
          success: true,
          data: [],
        })
      }
    }

    query = query.order("submitted_at", { ascending: false })

    const { data: feedbackData, error } = await query

    if (error) {
      console.error("Error fetching faculty feedback:", error)
      return NextResponse.json({ error: "Failed to fetch feedback" }, { status: 500 })
    }

    console.log("Raw feedback data:", feedbackData)

    // Get student information separately, but only for non-anonymous feedback
    const nonAnonymousFeedback = feedbackData?.filter((f: any) => !f.is_anonymous) || []
    const studentIds = nonAnonymousFeedback.map((f: any) => f.student_id).filter(Boolean)

    let studentData: any[] = []
    if (studentIds.length > 0) {
      const { data: students, error: studentError } = await supabase
        .from("users")
        .select("id, first_name, last_name")
        .in("id", studentIds)

      if (studentError) {
        console.error("Error fetching student data:", studentError)
      } else {
        studentData = students || []
      }
    }

    // Transform the data for frontend consumption
    const transformedFeedback =
      feedbackData?.map((feedback: any) => {
        let studentName = "Anonymous Student"
        let studentUsn = "Anonymous"
        let studentRoll = "Anonymous"

        // Only show student details if feedback is not anonymous
        if (!feedback.is_anonymous) {
          const student = studentData.find((s) => s.id === feedback.student_id)
          if (student) {
            studentName = `${student.first_name || ""} ${student.last_name || ""}`.trim()
            studentUsn = "N/A" // Set to N/A as USN is not in users table
            studentRoll = "N/A" // Set to N/A as roll number is not in users table
          } else {
            studentName = "Unknown Student"
          }
        }

        return {
          id: feedback.id,
          student_id: feedback.is_anonymous ? "anonymous" : feedback.student_id,
          student_name: studentName,
          student_usn: studentUsn,
          student_roll: studentRoll,
          course_id: feedback.course_id,
          subject_code: feedback.subjects?.code || "N/A",
          subject_name: feedback.subjects?.name || feedback.subject_name || "N/A",
          message: feedback.message,
          response: feedback.response,
          rating: feedback.rating,
          feedback_type: feedback.feedback_type,
          status: feedback.status,
          submitted_at: feedback.submitted_at,
          responded_at: feedback.responded_at,
          is_anonymous: feedback.is_anonymous,
        }
      }) || []

    console.log("Transformed feedback:", transformedFeedback)

    return NextResponse.json({
      success: true,
      data: transformedFeedback,
    })
  } catch (error) {
    console.error("Error in faculty feedback API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
