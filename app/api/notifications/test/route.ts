import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-client" // Assuming this path is correct for your Supabase client

export async function GET(req: NextRequest) {
  console.log("[SERVER] === NOTIFICATIONS TEST API GET CALLED ===")
  const supabase = createClient()

  try {
    // Test database connection
    const { data: testData, error: testError } = await supabase.from("notifications").select("id").limit(1)
    if (testError) {
      console.error("[SERVER] Database connection test failed:", testError)
      return NextResponse.json(
        { success: false, error: `Database connection error: ${testError.message}` },
        { status: 500 },
      )
    }
    console.log("[SERVER] Database connection successful.")

    return NextResponse.json({
      success: true,
      message: "Notifications test API is working and database is accessible.",
    })
  } catch (error: any) {
    console.error("[SERVER] Error in notifications test API:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  console.log("[SERVER] === NOTIFICATIONS TEST API POST CALLED ===")
  const supabase = createClient()

  try {
    const { recipientId } = await req.json()

    if (!recipientId) {
      return NextResponse.json(
        { success: false, error: "Recipient ID is required to create sample notifications." },
        { status: 400 },
      )
    }

    const sampleNotifications = [
      {
        recipient_id: recipientId,
        title: "Test Notification 1",
        message: "This is a sample notification for testing purposes.",
        type: "test",
        is_read: false,
      },
      {
        recipient_id: recipientId,
        title: "Test Notification 2",
        message: "Another test notification to check display.",
        type: "test",
        is_read: false,
      },
      {
        recipient_id: recipientId,
        title: "Important Update",
        message: "A new feature has been rolled out. Check it out!",
        type: "update",
        is_read: false,
      },
    ]

    const { data, error } = await supabase.from("notifications").insert(sampleNotifications).select()

    if (error) {
      console.error("[SERVER] Error inserting sample notifications:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    console.log("[SERVER] Sample notifications created:", data)
    return NextResponse.json({ success: true, message: "Sample notifications created successfully.", data })
  } catch (error: any) {
    console.error("[SERVER] Error in notifications test API POST:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
