import { NextResponse } from "next/server"
import { subjectService } from "@/lib/supabase-service"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const department = searchParams.get("department")
    const semester = searchParams.get("semester")
    const enrollment = searchParams.get("enrollment")

    let subjects

    if (enrollment === "true") {
      subjects = await subjectService.getEnrollmentView()
    } else if (department) {
      subjects = await subjectService.getByDepartment(department as any)
    } else if (semester) {
      subjects = await subjectService.getBySemester(Number.parseInt(semester))
    } else {
      subjects = await subjectService.getAll()
    }

    return NextResponse.json({
      success: true,
      data: subjects,
    })
  } catch (error) {
    console.error("Error fetching subjects:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch subjects",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const createdSubject = await subjectService.create({
      ...body,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      data: createdSubject,
    })
  } catch (error) {
    console.error("Error creating subject:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create subject",
      },
      { status: 500 },
    )
  }
}
