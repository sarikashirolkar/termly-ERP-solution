import { NextResponse } from "next/server"
import { createServiceRoleClient } from "@/lib/supabase-service-new"

export async function POST(request: Request) {
  try {
    const { proctorId, title, description, date, time, location, agenda, studentIds } = await request.json()

    if (!proctorId || !title || !date || !time || !studentIds || !Array.isArray(studentIds)) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    const supabase = createServiceRoleClient()

    // Create the meeting
    const meetingData = {
      proctor_id: proctorId,
      title: title,
      meeting_date: date,
      meeting_time: time,
      created_by: proctorId,
    }

    // Add optional fields only if they exist and are provided
    if (description) meetingData.description = description
    if (location) meetingData.location = location
    if (agenda) meetingData.agenda = agenda

    const { data: meeting, error: meetingError } = await supabase
      .from("proctoring_meetings")
      .insert(meetingData)
      .select()
      .single()

    if (meetingError) {
      console.error("Error creating meeting:", meetingError)
      return NextResponse.json({ success: false, error: "Failed to create meeting" }, { status: 500 })
    }

    // Add attendees
    const attendees = studentIds.map((studentId) => ({
      meeting_id: meeting.id,
      student_id: studentId,
      attendance_status: "invited",
    }))

    const { error: attendeeError } = await supabase.from("proctoring_meeting_attendees").insert(attendees)

    if (attendeeError) {
      console.error("Error adding attendees:", attendeeError)
      // Clean up the meeting if attendees couldn't be added
      await supabase.from("proctoring_meetings").delete().eq("id", meeting.id)
      return NextResponse.json({ success: false, error: "Failed to add attendees" }, { status: 500 })
    }

    // Get proctor name for notification
    const { data: proctor, error: proctorError } = await supabase
      .from("users")
      .select("first_name, last_name")
      .eq("id", proctorId)
      .single()

    const proctorName = proctor ? `${proctor.first_name || ""} ${proctor.last_name || ""}`.trim() : "Your Proctor"

    // Create notifications for students using the notifications API
    const notificationPromises = studentIds.map(async (studentId) => {
      const notificationData = {
        recipient_id: studentId,
        title: "Proctoring Meeting Scheduled",
        message: `${proctorName} has scheduled a proctoring meeting: "${title}" on ${date} at ${time}${location ? ` at ${location}` : ""}.`,
        type: "meeting",
      }

      console.log("Creating notification for student:", studentId, notificationData)

      const { data: notification, error: notificationError } = await supabase
        .from("notifications")
        .insert(notificationData)
        .select()
        .single()

      if (notificationError) {
        console.error("Error creating notification for student:", studentId, notificationError)
        return { success: false, studentId, error: notificationError.message }
      }

      console.log("Notification created successfully for student:", studentId, notification)
      return { success: true, studentId, notification }
    })

    const notificationResults = await Promise.all(notificationPromises)
    const successfulNotifications = notificationResults.filter((result) => result.success).length
    const failedNotifications = notificationResults.filter((result) => !result.success)

    if (failedNotifications.length > 0) {
      console.warn("Some notifications failed to create:", failedNotifications)
    }

    return NextResponse.json({
      success: true,
      message: `Meeting scheduled successfully. Notifications sent to ${successfulNotifications} out of ${studentIds.length} students.`,
      meetingId: meeting.id,
      notificationResults: {
        successful: successfulNotifications,
        failed: failedNotifications.length,
        details: failedNotifications,
      },
    })
  } catch (error) {
    console.error("Error in meetings API:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const proctorId = searchParams.get("proctorId")

    if (!proctorId) {
      return NextResponse.json({ success: false, error: "Proctor ID is required" }, { status: 400 })
    }

    const supabase = createServiceRoleClient()

    // Get meetings for this proctor
    const { data: meetings, error: meetingError } = await supabase
      .from("proctoring_meetings")
      .select("*")
      .eq("proctor_id", proctorId)
      .order("meeting_date", { ascending: false })

    if (meetingError) {
      console.error("Error fetching meetings:", meetingError)
      return NextResponse.json({ success: false, error: "Failed to fetch meetings" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: meetings || [],
    })
  } catch (error) {
    console.error("Error in meetings GET API:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
