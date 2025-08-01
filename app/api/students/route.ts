import { NextResponse } from "next/server"
import { studentService, userService } from "@/lib/supabase-service"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const department = searchParams.get("department")
    const semester = searchParams.get("semester")
    const section = searchParams.get("section")

    let students

    if (department && semester && section) {
      students = await studentService.getBySection(Number.parseInt(semester), section)
    } else if (department) {
      students = await studentService.getByDepartment(department as any)
    } else if (semester) {
      students = await studentService.getBySemester(Number.parseInt(semester))
    } else {
      students = await studentService.getAll()
    }

    return NextResponse.json({
      success: true,
      data: students,
    })
  } catch (error) {
    console.error("Error fetching students:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch students",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { user, student } = body

    // Create user first
    const createdUser = await userService.create({
      ...user,
      role: "student",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    // Create student record
    const createdStudent = await studentService.create({
      ...student,
      user_id: createdUser.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      data: {
        user: createdUser,
        student: createdStudent,
      },
    })
  } catch (error) {
    console.error("Error creating student:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create student",
      },
      { status: 500 },
    )
  }
}
