import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: Request) {
  const { student_id, class_id, date, status } = await request.json()

  if (!student_id || !class_id || !date || !status) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  try {
    const { data, error } = await supabase
      .from("attendance")
      .insert([{ student_id, class_id, date, status }])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("Error marking attendance:", error)
    return NextResponse.json({ error: "Failed to mark attendance" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const studentId = searchParams.get("student_id")
  const classId = searchParams.get("class_id")
  const date = searchParams.get("date")

  try {
    let query = supabase.from("attendance").select("*")

    if (studentId) {
      query = query.eq("student_id", studentId)
    }
    if (classId) {
      query = query.eq("class_id", classId)
    }
    if (date) {
      query = query.eq("date", date)
    }

    const { data, error } = await query.order("date", { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching attendance records:", error)
    return NextResponse.json({ error: "Failed to fetch attendance records" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const { id, status } = await request.json()

  if (!id || !status) {
    return NextResponse.json({ error: "Attendance ID and status are required" }, { status: 400 })
  }

  try {
    const { data, error } = await supabase.from("attendance").update({ status }).eq("id", id).select().single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error updating attendance:", error)
    return NextResponse.json({ error: "Failed to update attendance" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  if (!id) {
    return NextResponse.json({ error: "Attendance ID is required" }, { status: 400 })
  }

  try {
    const { error } = await supabase.from("attendance").delete().eq("id", id)

    if (error) throw error

    return NextResponse.json({ message: "Attendance record deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting attendance:", error)
    return NextResponse.json({ error: "Failed to delete attendance" }, { status: 500 })
  }
}
