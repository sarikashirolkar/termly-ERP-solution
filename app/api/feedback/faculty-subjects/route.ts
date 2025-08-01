import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const facultyId = request.headers.get("x-user-id")
    const academicYear = searchParams.get("academic_year")
    const semester = searchParams.get("semester")
    const section = searchParams.get("section")

    if (!facultyId) {
      return NextResponse.json({ error: "Faculty ID is required" }, { status: 400 })
    }

    console.log("Fetching subjects for faculty:", {
      facultyId,
      academicYear,
      semester,
      section,
    })

    // Get subjects taught by faculty with filters
    // Following the same pattern as marks/faculty-courses/route.ts
    let query = supabase
      .from("courses")
      .select(`
        id,
        subject_id,
        component_type,
        section,
        academic_year,
        semester,
        subjects!inner(
          id,
          code,
          name
        )
      `)
      .eq("faculty_id", facultyId)

    // Apply filters
    if (academicYear && academicYear !== "all") {
      query = query.eq("academic_year", academicYear)
    }

    if (semester && semester !== "all") {
      query = query.eq("semester", Number.parseInt(semester))
    }

    if (section && section !== "all") {
      query = query.eq("section", section)
    }

    const { data: courses, error } = await query

    if (error) {
      console.error("Error fetching faculty subjects:", error)
      return NextResponse.json({ error: "Failed to fetch subjects" }, { status: 500 })
    }

    console.log("Raw courses data:", courses)

    // Transform and deduplicate subjects
    const subjectsMap = new Map()

    courses?.forEach((course: any) => {
      const subjectId = course.subject_id
      if (!subjectsMap.has(subjectId)) {
        subjectsMap.set(subjectId, {
          id: subjectId,
          code: course.subjects.code,
          name: course.subjects.name,
          component_types: [course.component_type],
          sections: [course.section],
          academic_years: [course.academic_year],
          semesters: [course.semester],
        })
      } else {
        const existing = subjectsMap.get(subjectId)
        if (!existing.component_types.includes(course.component_type)) {
          existing.component_types.push(course.component_type)
        }
        if (!existing.sections.includes(course.section)) {
          existing.sections.push(course.section)
        }
        if (!existing.academic_years.includes(course.academic_year)) {
          existing.academic_years.push(course.academic_year)
        }
        if (!existing.semesters.includes(course.semester)) {
          existing.semesters.push(course.semester)
        }
      }
    })

    const subjects = Array.from(subjectsMap.values())

    console.log("Transformed subjects:", subjects)

    return NextResponse.json({
      success: true,
      data: subjects,
    })
  } catch (error) {
    console.error("Error in faculty subjects API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
