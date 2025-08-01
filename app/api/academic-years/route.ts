import { type NextRequest, NextResponse } from "next/server"
import { academicYearService } from "@/lib/academic-year-service"

export async function GET(request: NextRequest) {
  try {
    console.log("Fetching academic years...")
    const academicYears = await academicYearService.getAcademicYears()
    console.log("Academic years fetched:", academicYears)

    return NextResponse.json({
      success: true,
      data: academicYears,
    })
  } catch (error) {
    console.error("Error in academic years API:", error)

    // Return a more detailed error response
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: error instanceof Error ? error.stack : "No stack trace available",
      },
      { status: 500 },
    )
  }
}
