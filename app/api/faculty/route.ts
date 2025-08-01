import { NextResponse } from "next/server"
import { apiService } from "@/lib/supabase-service"

export async function GET() {
  try {
    const faculty = await apiService.faculty.getAll()
    return NextResponse.json(faculty, { status: 200 })
  } catch (error) {
    console.error("Error fetching faculty:", error)
    return NextResponse.json({ error: "Failed to fetch faculty" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const newFacultyData = await request.json()
    const createdFaculty = await apiService.faculty.create(newFacultyData)
    return NextResponse.json(createdFaculty, { status: 201 })
  } catch (error) {
    console.error("Error creating faculty:", error)
    return NextResponse.json({ error: "Failed to create faculty" }, { status: 500 })
  }
}
