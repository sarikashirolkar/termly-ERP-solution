import { type NextRequest, NextResponse } from "next/server"
import { CSVImportService } from "@/lib/csv-import-service"
import { supabase } from "@/lib/supabase" // Import supabase client

export async function POST(request: NextRequest) {
  let importResult: any = null // To store the result from CSVImportService
  let importType = "unknown"
  let fileName = "unknown"
  const importedByUserId: string | null = null // Placeholder for actual user ID if available

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    importType = (formData.get("importType") as string) || "unknown"
    fileName = file.name || "unknown"

    // In a real application, you would get the actual user ID from the session/auth
    // For now, we'll use a placeholder or try to get it from a mock auth
    // const { data: { user } } = await supabase.auth.getUser();
    // importedByUserId = user?.id || null;

    if (!file) {
      return NextResponse.json({ success: false, message: "No file provided" }, { status: 400 })
    }

    if (!importType) {
      return NextResponse.json({ success: false, message: "Import type not specified" }, { status: 400 })
    }

    const csvContent = await file.text()

    switch (importType) {
      case "students":
        importResult = await CSVImportService.processStudentImport(csvContent)
        break
      case "faculty":
        importResult = await CSVImportService.processFacultyImport(csvContent)
        break
      case "hods":
        importResult = await CSVImportService.processHODImport(csvContent)
        break
      case "coordinators":
        importResult = await CSVImportService.processCoordinatorImport(csvContent)
        break
      case "courses":
        importResult = await CSVImportService.processCourseImport(csvContent)
        break
      default:
        return NextResponse.json({ success: false, message: "Invalid import type" }, { status: 400 })
    }

    // Log the import result to the audit table
    await supabase.from("import_audit_logs").insert({
      import_type: importType,
      imported_by: importedByUserId, // Replace with actual user ID from auth
      total_records: importResult.totalRecords,
      successful_imports: importResult.successfulImports,
      failed_imports: importResult.failedImports,
      errors: importResult.errors.length > 0 ? JSON.stringify(importResult.errors) : null,
      file_name: fileName,
    })

    return NextResponse.json({
      success: importResult.success,
      message: importResult.success
        ? `Successfully imported ${importResult.successfulImports} out of ${importResult.totalRecords} records`
        : "Import failed",
      result: {
        totalRecords: importResult.totalRecords,
        successfulImports: importResult.successfulImports,
        failedImports: importResult.failedImports,
        errors: importResult.errors,
        importedUsers: importResult.importedUsers,
      },
    })
  } catch (error) {
    console.error("Import error:", error)

    // Also log the error to the audit table if the initial processing failed
    await supabase.from("import_audit_logs").insert({
      import_type: importType,
      imported_by: importedByUserId,
      total_records: importResult?.totalRecords || 0,
      successful_imports: importResult?.successfulImports || 0,
      failed_imports: (importResult?.totalRecords || 0) - (importResult?.successfulImports || 0),
      errors: JSON.stringify([error instanceof Error ? error.message : "Unknown error during import"]),
      file_name: fileName,
    })

    return NextResponse.json(
      {
        success: false,
        message: "An error occurred during import",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
