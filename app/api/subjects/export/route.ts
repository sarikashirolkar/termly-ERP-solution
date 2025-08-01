import { NextResponse } from "next/server"
import { subjectService } from "@/lib/supabase-service"
import { parse } from "csv-parse/sync" // Ensure this import is present

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const departmentId = searchParams.get("department_id")

    let subjectsQuery = subjectService.getAll()
    if (departmentId) {
      subjectsQuery = subjectService.getByDepartment(departmentId)
    }

    const { data: subjects, error } = await subjectsQuery

    if (error) {
      console.error("Error fetching subjects for export:", error)
      return NextResponse.json({ error: "Failed to fetch subjects for export" }, { status: 500 })
    }

    if (!subjects || subjects.length === 0) {
      return NextResponse.json({ message: "No subjects found to export" }, { status: 200 })
    }

    // Define CSV headers
    const headers = ["code", "name", "department", "credits", "semester", "academic_year", "faculty_id", "section"]

    // Map subject data to CSV rows
    const csvRows = subjects.map((subject) => ({
      code: subject.code,
      name: subject.name,
      department: subject.department_id, // Use department_id (short_name)
      credits: subject.credits,
      semester: subject.semester,
      academic_year: subject.academic_year || "",
      faculty_id: subject.faculty_id || "",
      section: subject.section || "",
    }))

    // Convert to CSV string
    // Using csv-parse/sync's stringify for robust CSV generation
    const csvString = parse(csvRows, {
      header: true,
      columns: headers,
      delimiter: ",",
      quote: '"',
      escape: '"',
      record_delimiter: "\n",
    })

    return new NextResponse(csvString, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="subjects_export_${Date.now()}.csv"`,
      },
    })
  } catch (error) {
    console.error("Error exporting subjects:", error)
    return NextResponse.json({ error: "Failed to export subjects" }, { status: 500 })
  }
}
