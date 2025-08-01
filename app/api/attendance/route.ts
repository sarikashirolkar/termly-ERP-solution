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
    const courseId = searchParams.get("courseId")
    const date = searchParams.get("date")
    const studentId = searchParams.get("studentId")

    // Handle different query types
    if (courseId && date) {
      // Check for existing attendance session for a specific course and date
      console.log("API: Checking attendance for course:", courseId, "date:", date)

      const { data: session, error: sessionError } = await supabaseServiceRole
        .from("attendance_sessions")
        .select(`
          id,
          date,
          course_id,
          created_by_id,
          created_at,
          attendance_records (
            id,
            student_id,
            is_present,
            status,
            marked_at
          )
        `)
        .eq("course_id", courseId)
        .eq("date", date)
        .maybeSingle()

      if (sessionError && sessionError.code !== "PGRST116") {
        console.error("API: Error fetching attendance session:", sessionError)
        return NextResponse.json({ error: "Failed to fetch attendance session" }, { status: 500 })
      }

      if (session) {
        console.log("API: Found attendance session:", {
          sessionId: session.id,
          recordsCount: session.attendance_records?.length || 0,
        })

        return NextResponse.json({
          success: true,
          data: {
            session: {
              id: session.id,
              date: session.date,
              course_id: session.course_id,
              created_by_id: session.created_by_id,
              created_at: session.created_at,
            },
            records: session.attendance_records || [],
          },
        })
      } else {
        console.log("API: No attendance session found for course:", courseId, "date:", date)
        return NextResponse.json({
          success: true,
          data: {
            session: null,
            records: [],
          },
        })
      }
    } else if (studentId) {
      // Get student attendance records (existing functionality)
      console.log("API: Fetching attendance for student:", studentId)

      // FIXED: Use proper joins to get attendance records with course and subject details
      const { data: attendanceRecords, error: attendanceError } = await supabaseServiceRole
        .from("attendance_records")
        .select(`
          id,
          is_present,
          marked_at,
          student_id,
          attendance_sessions!inner (
            id,
            date,
            course_id,
            courses!inner (
              id,
              course_code,
              course_name,
              semester,
              section,
              component_type,
              batch,
              subjects!inner (
                code,
                name
              )
            )
          )
        `)
        .eq("student_id", studentId)
        .order("marked_at", { ascending: false })

      if (attendanceError) {
        console.error("API: Error fetching attendance records:", attendanceError)
        return NextResponse.json({ error: "Failed to fetch attendance records" }, { status: 500 })
      }

      console.log("API: Found attendance records:", attendanceRecords?.length || 0)

      // Transform the data for the frontend
      const transformedRecords = (attendanceRecords || []).map((record: any) => {
        const session = record.attendance_sessions
        const course = session.courses
        const subject = course.subjects

        return {
          id: record.id,
          date: session.date,
          isPresent: record.is_present,
          markedAt: record.marked_at,
          course: {
            id: course.id,
            code: course.course_code || subject.code,
            name: course.course_name || subject.name,
            semester: course.semester,
            section: course.section,
            componentType: course.component_type,
            batch: course.batch,
          },
          subject: {
            code: subject.code,
            name: subject.name,
          },
        }
      })

      // Calculate overall statistics
      const totalClasses = transformedRecords.length
      const presentClasses = transformedRecords.filter((record) => record.isPresent).length
      const absentClasses = totalClasses - presentClasses
      const attendancePercentage = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0

      // Group by course for course-wise statistics
      const courseWiseStats = new Map()
      transformedRecords.forEach((record) => {
        const courseKey = `${record.course.code}-${record.course.componentType}`
        if (!courseWiseStats.has(courseKey)) {
          courseWiseStats.set(courseKey, {
            courseCode: record.course.code,
            courseName: record.course.name,
            componentType: record.course.componentType,
            totalClasses: 0,
            presentClasses: 0,
            absentClasses: 0,
            attendancePercentage: 0,
          })
        }

        const stats = courseWiseStats.get(courseKey)
        stats.totalClasses++
        if (record.isPresent) {
          stats.presentClasses++
        } else {
          stats.absentClasses++
        }
        stats.attendancePercentage = Math.round((stats.presentClasses / stats.totalClasses) * 100)
      })

      const courseWiseArray = Array.from(courseWiseStats.values())

      console.log("API: Transformed data:", {
        totalRecords: transformedRecords.length,
        overall: { totalClasses, presentClasses, absentClasses, attendancePercentage },
        courseWiseCount: courseWiseArray.length,
      })

      return NextResponse.json({
        success: true,
        data: {
          overall: {
            totalClasses,
            presentClasses,
            absentClasses,
            attendancePercentage,
          },
          courseWise: courseWiseArray,
          records: transformedRecords,
        },
      })
    } else {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }
  } catch (error) {
    console.error("API: Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
