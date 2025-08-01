import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const subjectId = searchParams.get("subject_id")
  const academicYear = searchParams.get("academic_year")

  if (!subjectId || !academicYear) {
    return NextResponse.json({ error: "Subject ID and Academic Year are required" }, { status: 400 })
  }

  try {
    const { data, error } = await supabase
      .from("syllabus")
      .select("*")
      .eq("subject_id", subjectId)
      .eq("academic_year", academicYear)
      .single()

    if (error && error.code !== "PGRST116") {
      // PGRST116 means no rows found, which is not an error for this case
      throw error
    }

    if (!data) {
      return NextResponse.json({ message: "Syllabus not found for the given criteria" }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching syllabus:", error)
    return NextResponse.json({ error: "Failed to fetch syllabus" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const { subject_id, academic_year, file_url } = await request.json()

  if (!subject_id || !academic_year || !file_url) {
    return NextResponse.json({ error: "Subject ID, Academic Year, and File URL are required" }, { status: 400 })
  }

  try {
    const { data, error } = await supabase
      .from("syllabus")
      .insert([{ subject_id, academic_year, file_url }])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("Error uploading syllabus:", error)
    return NextResponse.json({ error: "Failed to upload syllabus" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const { id, subject_id, academic_year, file_url } = await request.json()

  if (!id || !subject_id || !academic_year || !file_url) {
    return NextResponse.json({ error: "ID, Subject ID, Academic Year, and File URL are required" }, { status: 400 })
  }

  try {
    const { data, error } = await supabase
      .from("syllabus")
      .update({ subject_id, academic_year, file_url })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error updating syllabus:", error)
    return NextResponse.json({ error: "Failed to update syllabus" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  if (!id) {
    return NextResponse.json({ error: "Syllabus ID is required" }, { status: 400 })
  }

  try {
    const { error } = await supabase.from("syllabus").delete().eq("id", id)

    if (error) throw error

    return NextResponse.json({ message: "Syllabus deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting syllabus:", error)
    return NextResponse.json({ error: "Failed to delete syllabus" }, { status: 500 })
  }
}
