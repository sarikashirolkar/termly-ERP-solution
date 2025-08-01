import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get("studentId")

    if (!studentId) {
      return NextResponse.json({ error: "Student ID is required" }, { status: 400 })
    }

    console.log("Fetching courses for student:", studentId)

    // Get student's enrolled courses with subject and faculty information
    // Following the same pattern as marks/course-students/route.ts
    const { data: enrollments, error } = await supabase
      .from("course_enrollments")
      .select(`
        id,
        course_id,
        batch,
        courses!inner(
          id,
          subject_id,
          faculty_id,
          component_type,
          section,
          academic_year,
          semester,
          subjects!inner(
            id,
            code,
            name
          )
        )
      `)
      .eq("student_id", studentId)
      .eq("is_active", true)

    if (error) {
      console.error("Error fetching student courses:", error)
      return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 })
    }

    console.log("Raw enrollments data:", enrollments)

    // Get faculty information separately to avoid relationship issues
    const facultyIds = enrollments?.map((e: any) => e.courses.faculty_id).filter(Boolean) || []

    let facultyData: any[] = []
    if (facultyIds.length > 0) {
      const { data: faculty, error: facultyError } = await supabase
        .from("users")
        .select("id, first_name, last_name, email")
        .in("id", facultyIds)

      if (facultyError) {
        console.error("Error fetching faculty data:", facultyError)
      } else {
        facultyData = faculty || []
      }
    }

    // Transform the data for frontend consumption
    const courses =
      enrollments?.map((enrollment: any) => {
        const faculty = facultyData.find((f) => f.id === enrollment.courses.faculty_id)
        return {
          id: enrollment.course_id,
          code: enrollment.courses.subjects.code,
          name: enrollment.courses.subjects.name,
          component_type: enrollment.courses.component_type,
          batch: enrollment.batch,
          section: enrollment.courses.section,
          academic_year: enrollment.courses.academic_year,
          semester: enrollment.courses.semester,
          subject_id: enrollment.courses.subject_id,
          faculty_id: enrollment.courses.faculty_id,
          faculty: {
            id: faculty?.id || enrollment.courses.faculty_id,
            name: faculty ? `${faculty.first_name || ""} ${faculty.last_name || ""}`.trim() : "Unknown Faculty",
            email: faculty?.email || "",
          },
        }
      }) || []

    console.log("Transformed courses:", courses)

    return NextResponse.json({
      success: true,
      data: courses,
    })
  } catch (error) {
    console.error("Error in student courses API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
