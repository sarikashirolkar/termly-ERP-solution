import { NextResponse } from "next/server"
import { createServiceRoleClient } from "@/lib/supabase-service-new"

export async function GET(request: Request) {
  try {
    console.log("=== NOTIFICATIONS API GET CALLED ===")

    const { searchParams } = new URL(request.url)
    const recipientId = searchParams.get("recipientId")

    console.log("Recipient ID:", recipientId)

    if (!recipientId) {
      console.log("No recipient ID provided")
      return NextResponse.json({ success: false, error: "Recipient ID is required" }, { status: 400 })
    }

    console.log("Querying notifications for recipient:", recipientId)

    const supabase = createServiceRoleClient()

    const { data: notifications, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("recipient_id", recipientId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          details: error.details || "No additional details",
        },
        { status: 500 },
      )
    }

    console.log("Query successful. Found notifications:", notifications?.length || 0)
    console.log("Notifications data:", notifications)

    return NextResponse.json({
      success: true,
      data: notifications || [],
      count: notifications?.length || 0,
    })
  } catch (error) {
    console.error("API error:", error)
    const errorMessage = error instanceof Error ? error.message : "Internal server error"
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: "Unexpected error occurred in notifications API",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    console.log("=== NOTIFICATIONS API POST CALLED ===")

    const body = await request.json()
    const { recipient_id, title, message, type = "meeting" } = body

    console.log("Creating notification:", { recipient_id, title, message, type })

    if (!recipient_id || !title || !message) {
      return NextResponse.json(
        { success: false, error: "recipient_id, title, and message are required" },
        { status: 400 },
      )
    }

    const supabase = createServiceRoleClient()

    const { data: notification, error } = await supabase
      .from("notifications")
      .insert({
        recipient_id,
        title,
        message,
        type,
        is_read: false,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating notification:", error)
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          details: error.details || "Failed to create notification",
        },
        { status: 500 },
      )
    }

    console.log("Notification created successfully:", notification)

    return NextResponse.json({
      success: true,
      data: notification,
    })
  } catch (error) {
    console.error("Error in notifications POST API:", error)
    const errorMessage = error instanceof Error ? error.message : "Internal server error"
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: "Unexpected error occurred while creating notification",
      },
      { status: 500 },
    )
  }
}

export async function PATCH(request: Request) {
  try {
    console.log("=== NOTIFICATIONS API PATCH CALLED ===")

    const body = await request.json()
    const { notificationId, recipientId, markAllAsRead } = body

    console.log("PATCH request:", { notificationId, recipientId, markAllAsRead })

    const supabase = createServiceRoleClient()

    if (markAllAsRead && recipientId) {
      const { error } = await supabase.from("notifications").update({ is_read: true }).eq("recipient_id", recipientId)

      if (error) {
        console.error("Error marking all as read:", error)
        return NextResponse.json(
          {
            success: false,
            error: error.message,
            details: "Failed to mark all notifications as read",
          },
          { status: 500 },
        )
      }

      console.log("All notifications marked as read for user:", recipientId)
      return NextResponse.json({ success: true, message: "All notifications marked as read" })
    }

    if (notificationId) {
      const { error } = await supabase.from("notifications").update({ is_read: true }).eq("id", notificationId)

      if (error) {
        console.error("Error marking notification as read:", error)
        return NextResponse.json(
          {
            success: false,
            error: error.message,
            details: "Failed to mark notification as read",
          },
          { status: 500 },
        )
      }

      console.log("Notification marked as read:", notificationId)
      return NextResponse.json({ success: true, message: "Notification marked as read" })
    }

    return NextResponse.json({ success: false, error: "Invalid request parameters" }, { status: 400 })
  } catch (error) {
    console.error("Error in notifications PATCH API:", error)
    const errorMessage = error instanceof Error ? error.message : "Internal server error"
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: "Unexpected error occurred while updating notification",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request) {
  try {
    console.log("=== NOTIFICATIONS API DELETE CALLED ===")

    const { searchParams } = new URL(request.url)
    const notificationId = searchParams.get("notificationId")

    console.log("Deleting notification:", notificationId)

    if (!notificationId) {
      return NextResponse.json({ success: false, error: "Notification ID is required" }, { status: 400 })
    }

    const supabase = createServiceRoleClient()

    const { error } = await supabase.from("notifications").delete().eq("id", notificationId)

    if (error) {
      console.error("Error deleting notification:", error)
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          details: "Failed to delete notification",
        },
        { status: 500 },
      )
    }

    console.log("Notification deleted successfully:", notificationId)
    return NextResponse.json({ success: true, message: "Notification deleted" })
  } catch (error) {
    console.error("Error in notifications DELETE API:", error)
    const errorMessage = error instanceof Error ? error.message : "Internal server error"
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: "Unexpected error occurred while deleting notification",
      },
      { status: 500 },
    )
  }
}
