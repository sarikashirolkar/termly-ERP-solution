import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Create service role client for server-side operations
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
    const studentId = searchParams.get("user_id") || request.headers.get("x-user-id")

    console.log("[SERVER] Student marks API called for user:", studentId)

    if (!studentId) {
      console.log("[SERVER] No student ID found")
      return NextResponse.json(
        {
          success: false,
          error: "Student ID is required",
        },
        { status: 401 },
      )
    }

    // First, let's check if the student_marks table exists and has data
    const { data: tableCheck, error: tableError } = await supabaseServiceRole.from("student_marks").select("*").limit(1)

    if (tableError) {
      console.error("[SERVER] Student marks table error:", tableError)
      return NextResponse.json(
        {
          success: false,
          error: `Student marks table error: ${tableError.message}`,
        },
        { status: 500 },
      )
    }

    console.log("[SERVER] Student marks table exists, checking for student marks...")

    // Get student marks directly first to debug
    const { data: directMarks, error: directError } = await supabaseServiceRole
      .from("student_marks")
      .select("*")
      .eq("student_id", studentId)

    console.log("[SERVER] Direct marks query result:", {
      count: directMarks?.length || 0,
      error: directError?.message,
      sampleData: directMarks?.slice(0, 2),
    })

    if (directError) {
      console.error("[SERVER] Direct marks error:", directError)
      return NextResponse.json(
        {
          success: false,
          error: `Failed to fetch marks: ${directError.message}`,
        },
        { status: 500 },
      )
    }

    if (!directMarks || directMarks.length === 0) {
      console.log("[SERVER] No marks found for student:", studentId)
      return NextResponse.json({
        success: true,
        data: {
          overall: {
            totalAssessments: 0,
            averagePercentage: 0,
          },
          categories: {
            ia: { count: 0, average: 0, total: 0, marks: [] },
            assignment: { count: 0, average: 0, total: 0, marks: [] },
            final: { percentage: 0, calculated: false },
          },
          subjectWise: [],
          records: [],
        },
      })
    }

    // Now get marks with course and subject details
    const { data: marksRecords, error: marksError } = await supabaseServiceRole
      .from("student_marks")
      .select(`
        id,
        student_id,
        course_id,
        assessment_type,
        max_marks,
        obtained_marks,
        assessment_date,
        remarks,
        courses!inner (
          id,
          course_code,
          course_name,
          semester,
          section,
          component_type,
          academic_year,
          batch,
          subjects!inner (
            code,
            name
          )
        )
      `)
      .eq("student_id", studentId)
      .order("assessment_date", { ascending: false })

    if (marksError) {
      console.error("[SERVER] Error fetching student marks with details:", marksError)
      // Fallback to basic marks data if join fails
      const transformedMarks = directMarks.map((record: any) => {
        const percentage = record.max_marks > 0 ? (record.obtained_marks / record.max_marks) * 100 : 0

        let grade = "F"
        if (percentage >= 90) grade = "A+"
        else if (percentage >= 80) grade = "A"
        else if (percentage >= 70) grade = "B+"
        else if (percentage >= 60) grade = "B"
        else if (percentage >= 50) grade = "C"

        let category = "other"
        if (record.assessment_type.startsWith("IA")) category = "ia"
        else if (record.assessment_type.startsWith("Assignment")) category = "assignment"

        return {
          mark_id: record.id,
          subject_name: "Unknown Subject",
          subject_code: "UNKNOWN",
          assessment_type: record.assessment_type,
          obtained_marks: record.obtained_marks,
          max_marks: record.max_marks,
          percentage: Math.round(percentage * 100) / 100,
          assessment_date: record.assessment_date,
          semester: 0,
          academic_year: "Unknown",
          component_type: "theory",
          batch: null,
          grade,
          category,
        }
      })

      return NextResponse.json({
        success: true,
        data: {
          overall: {
            totalAssessments: transformedMarks.length,
            averagePercentage:
              transformedMarks.length > 0
                ? Math.round(
                    (transformedMarks.reduce((sum, mark) => sum + mark.percentage, 0) / transformedMarks.length) * 100,
                  ) / 100
                : 0,
          },
          categories: {
            ia: {
              count: transformedMarks.filter((m) => m.category === "ia").length,
              average: 0,
              total: 0,
              marks: transformedMarks.filter((m) => m.category === "ia"),
            },
            assignment: {
              count: transformedMarks.filter((m) => m.category === "assignment").length,
              average: 0,
              total: 0,
              marks: transformedMarks.filter((m) => m.category === "assignment"),
            },
            final: { percentage: 0, calculated: false },
          },
          subjectWise: [],
          records: transformedMarks,
        },
      })
    }

    console.log("[SERVER] Found", marksRecords?.length || 0, "marks records with details")

    // Transform the data and categorize by assessment type
    const transformedMarks = (marksRecords || []).map((record: any) => {
      const course = record.courses
      const subject = course.subjects
      const percentage = record.max_marks > 0 ? (record.obtained_marks / record.max_marks) * 100 : 0

      let grade = "F"
      if (percentage >= 90) grade = "A+"
      else if (percentage >= 80) grade = "A"
      else if (percentage >= 70) grade = "B+"
      else if (percentage >= 60) grade = "B"
      else if (percentage >= 50) grade = "C"

      // Categorize assessment type
      let category = "other"
      if (record.assessment_type.startsWith("IA")) category = "ia"
      else if (record.assessment_type.startsWith("Assignment")) category = "assignment"

      return {
        mark_id: record.id,
        subject_name: subject.name,
        subject_code: subject.code,
        assessment_type: record.assessment_type,
        obtained_marks: record.obtained_marks,
        max_marks: record.max_marks,
        percentage: Math.round(percentage * 100) / 100,
        assessment_date: record.assessment_date,
        semester: course.semester,
        academic_year: course.academic_year,
        component_type: course.component_type,
        batch: course.batch,
        grade,
        category,
      }
    })

    // Calculate statistics by category
    const iaMarks = transformedMarks.filter((m) => m.category === "ia")
    const assignmentMarks = transformedMarks.filter((m) => m.category === "assignment")

    const calculateCategoryStats = (marks: any[]) => {
      if (marks.length === 0) return { count: 0, average: 0, total: 0 }
      const total = marks.reduce((sum, mark) => sum + mark.percentage, 0)
      return {
        count: marks.length,
        average: Math.round((total / marks.length) * 100) / 100,
        total: Math.round(total * 100) / 100,
      }
    }

    const iaStats = calculateCategoryStats(iaMarks)
    const assignmentStats = calculateCategoryStats(assignmentMarks)

    // Calculate final marks (50% IA + 50% Assignment)
    const finalMarks =
      iaStats.average > 0 && assignmentStats.average > 0
        ? Math.round((iaStats.average * 0.5 + assignmentStats.average * 0.5) * 100) / 100
        : 0

    // Overall statistics
    const totalAssessments = transformedMarks.length
    const overallAverage =
      totalAssessments > 0
        ? Math.round((transformedMarks.reduce((sum, mark) => sum + mark.percentage, 0) / totalAssessments) * 100) / 100
        : 0

    // Group by subject for subject-wise statistics
    const subjectWiseStats = new Map()
    transformedMarks.forEach((record) => {
      const subjectKey = `${record.subject_code}-${record.component_type}`
      if (!subjectWiseStats.has(subjectKey)) {
        subjectWiseStats.set(subjectKey, {
          subjectCode: record.subject_code,
          subjectName: record.subject_name,
          componentType: record.component_type,
          totalAssessments: 0,
          totalMarks: 0,
          averagePercentage: 0,
          iaMarks: [],
          assignmentMarks: [],
          assessments: [],
        })
      }

      const stats = subjectWiseStats.get(subjectKey)
      stats.totalAssessments++
      stats.totalMarks += record.percentage
      stats.assessments.push(record)
      stats.averagePercentage = Math.round((stats.totalMarks / stats.totalAssessments) * 100) / 100

      // Categorize marks
      if (record.category === "ia") {
        stats.iaMarks.push(record)
      } else if (record.category === "assignment") {
        stats.assignmentMarks.push(record)
      }
    })

    const subjectWiseArray = Array.from(subjectWiseStats.values()).map((subject) => ({
      ...subject,
      iaAverage:
        subject.iaMarks.length > 0
          ? Math.round(
              (subject.iaMarks.reduce((sum: number, mark: any) => sum + mark.percentage, 0) / subject.iaMarks.length) *
                100,
            ) / 100
          : 0,
      assignmentAverage:
        subject.assignmentMarks.length > 0
          ? Math.round(
              (subject.assignmentMarks.reduce((sum: number, mark: any) => sum + mark.percentage, 0) /
                subject.assignmentMarks.length) *
                100,
            ) / 100
          : 0,
    }))

    console.log("[SERVER] Transformed data:", {
      totalRecords: transformedMarks.length,
      overall: { totalAssessments, overallAverage },
      ia: iaStats,
      assignment: assignmentStats,
      finalMarks,
      subjectWiseCount: subjectWiseArray.length,
    })

    return NextResponse.json({
      success: true,
      data: {
        overall: {
          totalAssessments,
          averagePercentage: overallAverage,
        },
        categories: {
          ia: {
            ...iaStats,
            marks: iaMarks,
          },
          assignment: {
            ...assignmentStats,
            marks: assignmentMarks,
          },
          final: {
            percentage: finalMarks,
            calculated: iaStats.average > 0 && assignmentStats.average > 0,
          },
        },
        subjectWise: subjectWiseArray,
        records: transformedMarks,
      },
    })
  } catch (error) {
    console.error("[SERVER] Unexpected error in student marks API:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}
