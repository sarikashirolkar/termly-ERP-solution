import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("user_id")

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 })
  }

  try {
    const { data, error } = await supabase.from("user_preferences").select("*").eq("user_id", userId).single()

    if (error && error.code !== "PGRST116") {
      // PGRST116 means no rows found, which is not an error for this case
      throw error
    }

    if (!data) {
      return NextResponse.json({ message: "Preferences not found for this user" }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching user preferences:", error)
    return NextResponse.json({ error: "Failed to fetch user preferences" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const { user_id, theme, notifications_enabled, email_reminders_enabled, dashboard_layout } = await request.json()

  if (!user_id) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 })
  }

  try {
    const { data, error } = await supabase
      .from("user_preferences")
      .insert([
        {
          user_id,
          theme,
          notifications_enabled,
          email_reminders_enabled,
          dashboard_layout,
        },
      ])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("Error creating user preferences:", error)
    return NextResponse.json({ error: "Failed to create user preferences" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const { user_id, theme, notifications_enabled, email_reminders_enabled, dashboard_layout } = await request.json()

  if (!user_id) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 })
  }

  try {
    const { data, error } = await supabase
      .from("user_preferences")
      .update({
        theme,
        notifications_enabled,
        email_reminders_enabled,
        dashboard_layout,
      })
      .eq("user_id", user_id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error updating user preferences:", error)
    return NextResponse.json({ error: "Failed to update user preferences" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("user_id")

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 })
  }

  try {
    const { error } = await supabase.from("user_preferences").delete().eq("user_id", userId)

    if (error) throw error

    return NextResponse.json({ message: "User preferences deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting user preferences:", error)
    return NextResponse.json({ error: "Failed to delete user preferences" }, { status: 500 })
  }
}
