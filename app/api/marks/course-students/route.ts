import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get("course_id")
    const batch = searchParams.get("batch")
    const userId = request.headers.get("x-user-id")

    console.log("[SERVER] Course students API called with params:", {
      courseId,
      batch,
      userId,
    })

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

    // Get course details first
    const { data: courseDetails, error: courseError } = await supabase
      .from("courses")
      .select(
        `
        id,
        subject_id,
        component_type,
        section,
        batch,
        semester,
        faculty_id,
        subjects (
          code,
          name
        )
      `,
      )
      .eq("id", courseId)
      .single()

    if (courseError || !courseDetails) {
      console.error("[SERVER] Error fetching course details:", courseError)
      return NextResponse.json(
        {
          success: false,
          error: "Course not found",
        },
        { status: 404 },
      )
    }

    console.log("[SERVER] Course details:", courseDetails)

    // Verify faculty access
    if (courseDetails.faculty_id !== userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Access denied",
        },
        { status: 403 },
      )
    }

    let targetCourseIds = [courseId]

    // For batch-specific requests, find the specific course IDs for that batch
    if (batch && courseDetails.component_type === "lab") {
      const { data: batchCourses, error: batchError } = await supabase
        .from("courses")
        .select("id")
        .eq("subject_id", courseDetails.subject_id)
        .eq("component_type", courseDetails.component_type)
        .eq("section", courseDetails.section)
        .eq("semester", courseDetails.semester)
        .eq("faculty_id", userId)
        .eq("batch", batch)

      if (batchError) {
        console.error("[SERVER] Error fetching batch courses:", batchError)
        return NextResponse.json(
          {
            success: false,
            error: "Failed to fetch batch courses",
          },
          { status: 500 },
        )
      }

      targetCourseIds = batchCourses?.map((c) => c.id) || []
      console.log("[SERVER] Found batch-specific course IDs:", targetCourseIds)
    }

    if (targetCourseIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
      })
    }

    // Get enrollments for the target courses
    const { data: enrollments, error: enrollmentError } = await supabase
      .from("course_enrollments")
      .select(
        `
        student_id,
        course_id,
        batch,
        courses (
          id,
          batch
        )
      `,
      )
      .in("course_id", targetCourseIds)
      .eq("is_active", true)

    if (enrollmentError) {
      console.error("[SERVER] Error fetching enrollments:", enrollmentError)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch enrollments",
        },
        { status: 500 },
      )
    }

    console.log("[SERVER] Found enrollments:", enrollments?.length || 0)

    if (!enrollments || enrollments.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
      })
    }

    // Get unique student IDs
    const studentIds = [...new Set(enrollments.map((e) => e.student_id))]
    console.log("[SERVER] Unique student IDs:", studentIds.length)

    // Get student details
    const { data: students, error: studentError } = await supabase
      .from("students")
      .select(
        `
        user_id,
        usn,
        semester,
        section
      `,
      )
      .in("user_id", studentIds)

    if (studentError) {
      console.error("[SERVER] Error fetching students:", studentError)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch students",
        },
        { status: 500 },
      )
    }

    // Get user details
    const { data: users, error: userError } = await supabase
      .from("users")
      .select(
        `
        id,
        first_name,
        last_name,
        email
      `,
      )
      .in("id", studentIds)

    if (userError) {
      console.error("[SERVER] Error fetching users:", userError)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch users",
        },
        { status: 500 },
      )
    }

    // Create a map of student enrollments to their target course IDs
    const studentCourseMap = new Map()
    for (const enrollment of enrollments) {
      if (!studentCourseMap.has(enrollment.student_id)) {
        studentCourseMap.set(enrollment.student_id, {
          courseIds: [],
          batch: enrollment.batch || enrollment.courses?.batch,
        })
      }
      studentCourseMap.get(enrollment.student_id).courseIds.push(enrollment.course_id)
    }

    // Combine all data
    const result =
      students
        ?.map((student) => {
          const user = users?.find((u) => u.id === student.user_id)
          const courseInfo = studentCourseMap.get(student.user_id)

          if (!user || !courseInfo) return null

          return {
            student_id: student.user_id,
            student_name: `${user.first_name} ${user.last_name}`,
            usn: student.usn,
            roll_number: student.usn, // Using USN as roll number
            email: user.email,
            enrollment_batch: courseInfo.batch,
            course_batch: courseInfo.batch,
            target_course_ids: courseInfo.courseIds,
          }
        })
        .filter(Boolean) || []

    console.log("[SERVER] Final student list:", result.length, "students")
    if (result.length > 0) {
      console.log("[SERVER] Sample student:", result[0])
    }

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error("[SERVER] Unexpected error in course students API:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}
