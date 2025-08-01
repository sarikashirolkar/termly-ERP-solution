import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const studentId = searchParams.get("student_id")
  const subjectId = searchParams.get("subject_id")
  const academicYear = searchParams.get("academic_year")
  const semester = searchParams.get("semester")

  if (!studentId) {
    return NextResponse.json({ error: "Student ID is required" }, { status: 400 })
  }

  try {
    let query = supabase.from("marks").select("*").eq("student_id", studentId).like("assessment_type", "IA%")

    if (subjectId) {
      query = query.eq("subject_id", subjectId)
    }
    if (academicYear) {
      query = query.eq("academic_year", academicYear)
    }
    if (semester) {
      query = query.eq("semester", Number.parseInt(semester))
    }

    const { data, error } = await query.order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching IA marks:", error)
    return NextResponse.json({ error: "Failed to fetch IA marks" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const { student_id, subject_id, assessment_type, marks_obtained, max_marks, academic_year, semester } =
    await request.json()

  if (!student_id || !subject_id || !assessment_type || marks_obtained === undefined || max_marks === undefined) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  if (!assessment_type.startsWith("IA")) {
    return NextResponse.json({ error: "Assessment type must be an IA mark (e.g., IA1, IA2)" }, { status: 400 })
  }

  try {
    const { data, error } = await supabase
      .from("marks")
      .insert([
        {
          student_id,
          subject_id,
          assessment_type,
          marks_obtained,
          max_marks,
          academic_year,
          semester,
        },
      ])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("Error adding IA mark:", error)
    return NextResponse.json({ error: "Failed to add IA mark" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const { id, marks_obtained, max_marks } = await request.json()

  if (!id || marks_obtained === undefined || max_marks === undefined) {
    return NextResponse.json({ error: "ID, marks obtained, and max marks are required" }, { status: 400 })
  }

  try {
    const { data, error } = await supabase
      .from("marks")
      .update({ marks_obtained, max_marks })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error updating IA mark:", error)
    return NextResponse.json({ error: "Failed to update IA mark" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  if (!id) {
    return NextResponse.json({ error: "IA Mark ID is required" }, { status: 400 })
  }

  try {
    const { error } = await supabase.from("marks").delete().eq("id", id)

    if (error) throw error

    return NextResponse.json({ message: "IA Mark deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting IA mark:", error)
    return NextResponse.json({ error: "Failed to delete IA mark" }, { status: 500 })
  }
}
