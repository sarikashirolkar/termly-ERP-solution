import { NextResponse } from "next/server"
import { facultyService } from "@/lib/supabase-service"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // Get department short_name from the departments table first
    const { departmentService } = await import("@/lib/supabase-service")
    const department = await departmentService.getById(params.id)

    if (!department) {
      return NextResponse.json({ error: "Department not found" }, { status: 404 })
    }

    const faculty = await facultyService.getByDepartment(department.short_name)
    return NextResponse.json({ faculty })
  } catch (error) {
    console.error("Error fetching faculty for department:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch faculty for department.",
      },
      { status: 500 },
    )
  }
}
