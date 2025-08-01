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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { courseId, date, userId, attendanceRecords } = body

    console.log("API: Starting attendance save process:", {
      courseId,
      date,
      userId,
      recordCount: attendanceRecords?.length || 0,
    })

    // Validate required fields
    if (!courseId || !date || !userId || !attendanceRecords || !Array.isArray(attendanceRecords)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify user has proper role using service role client (bypasses RLS)
    const { data: userData, error: userError } = await supabaseServiceRole
      .from("users")
      .select("id, role, is_active")
      .eq("id", userId)
      .single()

    if (userError || !userData) {
      console.error("User verification failed:", userError)
      return NextResponse.json({ error: "User verification failed" }, { status: 403 })
    }

    if (!["faculty", "hod", "coordinator", "principal"].includes(userData.role) || !userData.is_active) {
      console.error("User doesn't have permission:", userData)
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    console.log("API: User verified:", userData)

    // Verify course exists and get course details
    const { data: courseData, error: courseError } = await supabaseServiceRole
      .from("courses")
      .select("id, faculty_id, subject_id, academic_year, semester, section, batch, component_type")
      .eq("id", courseId)
      .single()

    if (courseError || !courseData) {
      console.error("Course verification failed:", courseError)
      return NextResponse.json({ error: "Invalid course" }, { status: 400 })
    }

    console.log("API: Course verified:", courseData)

    // Get the current academic year ID
    const { data: academicYearData, error: academicYearError } = await supabaseServiceRole
      .from("academic_years")
      .select("id")
      .eq("is_current", true)
      .single()

    if (academicYearError || !academicYearData) {
      console.error("Academic year lookup failed:", academicYearError)
      return NextResponse.json({ error: "Could not find current academic year" }, { status: 400 })
    }

    console.log("API: Academic year found:", academicYearData.id)

    // Get the subject_assignment_id using the correct column names
    const { data: subjectAssignmentData, error: subjectAssignmentError } = await supabaseServiceRole
      .from("subject_assignments")
      .select("id")
      .eq("subject_id", courseData.subject_id)
      .eq("academic_year_id", academicYearData.id)
      .eq("section", courseData.section)
      .eq("faculty_id", courseData.faculty_id)
      .single()

    let subjectAssignmentId: string

    if (subjectAssignmentError || !subjectAssignmentData) {
      console.error("Subject Assignment verification failed:", subjectAssignmentError)

      // Try to create a subject assignment if it doesn't exist
      const { data: newSubjectAssignment, error: createAssignmentError } = await supabaseServiceRole
        .from("subject_assignments")
        .insert({
          subject_id: courseData.subject_id,
          faculty_id: courseData.faculty_id,
          academic_year_id: academicYearData.id,
          section: courseData.section,
          is_active: true,
          assigned_date: new Date().toISOString().split("T")[0],
        })
        .select("id")
        .single()

      if (createAssignmentError || !newSubjectAssignment) {
        console.error("Failed to create subject assignment:", createAssignmentError)
        return NextResponse.json({ error: "Could not create subject assignment" }, { status: 400 })
      }

      console.log("API: Created new subject assignment:", newSubjectAssignment.id)
      subjectAssignmentId = newSubjectAssignment.id
    } else {
      subjectAssignmentId = subjectAssignmentData.id
      console.log("API: Subject Assignment verified:", subjectAssignmentId)
    }

    // Check if attendance session already exists
    const { data: existingSession, error: sessionCheckError } = await supabaseServiceRole
      .from("attendance_sessions")
      .select("id, created_at")
      .eq("course_id", courseId)
      .eq("date", date)
      .maybeSingle()

    if (sessionCheckError && sessionCheckError.code !== "PGRST116") {
      console.error("Session check failed:", sessionCheckError)
      return NextResponse.json({ error: "Failed to check existing session" }, { status: 500 })
    }

    let sessionId: string
    let isUpdate = false

    if (existingSession) {
      sessionId = existingSession.id
      isUpdate = true
      console.log("API: Using existing session:", sessionId)

      // Delete existing records to replace them
      const { error: deleteError } = await supabaseServiceRole
        .from("attendance_records")
        .delete()
        .eq("session_id", sessionId)

      if (deleteError) {
        console.error("Error deleting existing records:", deleteError)
        return NextResponse.json({ error: "Failed to delete existing records" }, { status: 500 })
      }
    } else {
      // Create new session
      console.log("API: Creating new attendance session")

      const sessionData = {
        course_id: courseId,
        date: date,
        created_by_id: userId,
        subject_assignment_id: subjectAssignmentId,
      }

      console.log("API: Creating new session:", sessionData)

      const { data: newSession, error: sessionError } = await supabaseServiceRole
        .from("attendance_sessions")
        .insert(sessionData)
        .select("id")
        .single()

      if (sessionError) {
        console.error("Error creating session:", sessionError)
        return NextResponse.json(
          { error: `Failed to create attendance session: ${sessionError.message}` },
          { status: 500 },
        )
      }

      sessionId = newSession.id
      console.log("API: Created new session:", sessionId)
    }

    // Get student enrollment data for validation
    const studentIdsForValidation = attendanceRecords.map((record: any) => record.studentId)

    console.log("API: Looking for enrollments for students:", studentIdsForValidation)

    const { data: enrollmentData, error: enrollmentError } = await supabaseServiceRole
      .from("course_enrollments")
      .select("id, student_id, course_id, batch, is_active")
      .eq("course_id", courseId)
      .in("student_id", studentIdsForValidation)
      .eq("is_active", true)

    if (enrollmentError) {
      console.error("Enrollment lookup failed:", enrollmentError)
      return NextResponse.json({ error: "Failed to lookup student enrollments" }, { status: 500 })
    }

    console.log("API: Found enrollments:", enrollmentData)

    if (!enrollmentData || enrollmentData.length === 0) {
      return NextResponse.json(
        {
          error: "No student enrollments found for this course.",
          debug: {
            courseId,
            studentIds: studentIdsForValidation,
          },
        },
        { status: 400 },
      )
    }

    // Create enrollment map
    const enrollmentMap = new Map()
    enrollmentData.forEach((enrollment) => {
      enrollmentMap.set(enrollment.student_id, enrollment.id)
    })

    // Prepare records for insertion with better status handling
    const recordsToInsert = attendanceRecords
      .filter((record: any) => enrollmentMap.has(record.studentId))
      .map((record: any) => {
        // Determine the status based on attendance
        let status = null // Default to null for normal attendance
        let isPresent = true // Default to present

        if (record.status === "present") {
          isPresent = true
          status = null // Normal present attendance
        } else if (record.status === "absent") {
          isPresent = false
          status = null // Normal absent attendance
        } else if (record.status === "event") {
          isPresent = true // Count as present but mark as excused
          status = "excused" // Special status for events
        }

        const enrollmentId = enrollmentMap.get(record.studentId)
        console.log(`API: Mapping student ${record.studentId} to enrollment ${enrollmentId}`)

        return {
          session_id: sessionId,
          student_id: record.studentId,
          student_enrollment_id: enrollmentId,
          is_present: isPresent,
          marked_by_id: userId,
          status: status,
          marked_at: new Date().toISOString(),
        }
      })

    console.log("API: Records to insert:", recordsToInsert.length)
    console.log("API: Sample record:", recordsToInsert[0])

    // Insert attendance records
    const { data: insertedRecords, error: recordsError } = await supabaseServiceRole
      .from("attendance_records")
      .insert(recordsToInsert)
      .select("id, student_id, is_present, status")

    if (recordsError) {
      console.error("Error saving attendance records:", recordsError)
      return NextResponse.json(
        {
          error: `Failed to save attendance records: ${recordsError.message}`,
          details: recordsError,
        },
        { status: 500 },
      )
    }

    console.log("API: Successfully inserted records:", insertedRecords?.length || 0)

    // Verify the records were actually saved by querying them back
    const { data: verificationRecords, error: verificationError } = await supabaseServiceRole
      .from("attendance_records")
      .select(`
        id, 
        student_id, 
        is_present, 
        status, 
        marked_at,
        session_id
      `)
      .eq("session_id", sessionId)

    if (verificationError) {
      console.error("Error verifying saved records:", verificationError)
    } else {
      console.log("API: Verification - records in database:", verificationRecords?.length || 0)
      console.log("API: Sample verification record:", verificationRecords?.[0])
    }

    // Also verify the session exists
    const { data: sessionVerification, error: sessionVerificationError } = await supabaseServiceRole
      .from("attendance_sessions")
      .select("id, course_id, date, created_at")
      .eq("id", sessionId)
      .single()

    if (sessionVerificationError) {
      console.error("Error verifying session:", sessionVerificationError)
    } else {
      console.log("API: Session verification:", sessionVerification)
    }

    return NextResponse.json({
      success: true,
      sessionId,
      recordsCount: recordsToInsert.length,
      message: `Attendance ${isUpdate ? "updated" : "saved"} successfully`,
      insertedRecords: insertedRecords?.length || 0,
      verificationCount: verificationRecords?.length || 0,
      isUpdate,
      debug: {
        courseId,
        date,
        sessionExists: !!sessionVerification,
        recordsInDb: verificationRecords?.length || 0,
      },
    })
  } catch (error) {
    console.error("API: Unexpected error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
