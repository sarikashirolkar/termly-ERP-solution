import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Create service role client for server-side operations
const supabaseServiceRole = createClient(supabaseUrl, supabaseServiceRoleKey)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, facultyId, weekStartDate, originalClassId, modifiedClassData } = body

    console.log("API received request:", { action, facultyId, weekStartDate, originalClassId })

    switch (action) {
      case "save":
        return await handleSave(facultyId, weekStartDate, originalClassId, modifiedClassData)
      case "delete":
        return await handleDelete(facultyId, weekStartDate, originalClassId)
      case "reset":
        return await handleReset(facultyId, weekStartDate)
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function handleSave(facultyId: string, weekStartDate: string, originalClassId: string, modifiedClassData: any) {
  try {
    const { data, error } = await supabaseServiceRole
      .from("weekly_timetable_modifications")
      .upsert(
        {
          faculty_id: facultyId,
          week_start_date: weekStartDate,
          original_class_id: originalClassId,
          modified_class_data: modifiedClassData,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "faculty_id,week_start_date,original_class_id",
        },
      )
      .select()
      .single()

    if (error) {
      console.error("Database error in handleSave:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Error in handleSave:", error)
    return NextResponse.json({ error: "Failed to save modification" }, { status: 500 })
  }
}

async function handleDelete(facultyId: string, weekStartDate: string, originalClassId: string) {
  try {
    const { error } = await supabaseServiceRole
      .from("weekly_timetable_modifications")
      .delete()
      .eq("faculty_id", facultyId)
      .eq("week_start_date", weekStartDate)
      .eq("original_class_id", originalClassId)

    if (error) {
      console.error("Database error in handleDelete:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in handleDelete:", error)
    return NextResponse.json({ error: "Failed to delete modification" }, { status: 500 })
  }
}

async function handleReset(facultyId: string, weekStartDate: string) {
  try {
    const { error } = await supabaseServiceRole
      .from("weekly_timetable_modifications")
      .delete()
      .eq("faculty_id", facultyId)
      .eq("week_start_date", weekStartDate)

    if (error) {
      console.error("Database error in handleReset:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in handleReset:", error)
    return NextResponse.json({ error: "Failed to reset modifications" }, { status: 500 })
  }
}
