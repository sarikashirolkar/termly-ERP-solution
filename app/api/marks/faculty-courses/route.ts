import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const academicYear = searchParams.get("academic_year")
    const semester = searchParams.get("semester")
    const section = searchParams.get("section")
    const userId = request.headers.get("x-user-id")

    console.log("[SERVER] Faculty courses API called with params:", {
      academicYear,
      semester,
      section,
      userId,
    })

    if (!academicYear || !semester || !section) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required parameters: academic_year, semester, section",
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

    // Fetch courses for the faculty
    const { data: courses, error } = await supabase
      .from("courses")
      .select(
        `
        id,
        subject_id,
        component_type,
        semester,
        section,
        batch,
        academic_year,
        faculty_id,
        subjects (
          code,
          name
        )
      `,
      )
      .eq("faculty_id", userId)
      .eq("academic_year", academicYear)
      .eq("semester", Number.parseInt(semester))
      .eq("section", section)
      .order("component_type")
      .order("batch")

    if (error) {
      console.error("[SERVER] Error fetching courses:", error)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch courses",
        },
        { status: 500 },
      )
    }

    console.log("[SERVER] Raw courses from database:", courses)

    // Group courses by subject and component type
    const groupedCourses = new Map()

    for (const course of courses || []) {
      const key = `${course.subject_id}-${course.component_type}`

      if (!groupedCourses.has(key)) {
        groupedCourses.set(key, {
          course_id: course.id, // Use the first course ID as the primary ID
          subject_id: course.subject_id,
          subject_code: course.subjects?.code || "",
          subject_name: course.subjects?.name || "",
          component_type: course.component_type,
          semester: course.semester,
          section: course.section,
          academic_year: course.academic_year,
          batches: [],
          course_ids: [],
        })
      }

      const group = groupedCourses.get(key)
      group.course_ids.push(course.id)

      if (course.batch && !group.batches.includes(course.batch)) {
        group.batches.push(course.batch)
      }
    }

    const result = Array.from(groupedCourses.values())
    console.log("[SERVER] Grouped courses result:", result)
    console.log("[SERVER] Found", result.length, "courses for the criteria")

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error("[SERVER] Unexpected error in faculty courses API:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}
