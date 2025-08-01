import { NextResponse } from "next/server"
import { CSVImportService } from "@/lib/csv-import-service"

export const config = {
  api: {
    bodyParser: false, // Disable default body parser for file uploads
  },
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const departmentId = formData.get("department_id") as string | null // Get department_id for filtering

    if (!file) {
      return NextResponse.json({ success: false, error: "No file uploaded." }, { status: 400 })
    }

    const fileContent = await file.text()

    // Initialize department maps if not already done
    await CSVImportService.initializeDepartmentMaps()

    // Process the CSV content for courses
    const result = await CSVImportService.processCourseImport(fileContent)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Subjects imported successfully.",
        successfulImports: result.successfulImports,
        failedImports: result.failedImports,
        errors: result.errors,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to import subjects.",
          successfulImports: result.successfulImports,
          failedImports: result.failedImports,
          errors: result.errors,
        },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("Error in subjects import API:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "An unknown error occurred." },
      { status: 500 },
    )
  }
}
