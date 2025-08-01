import { type NextRequest, NextResponse } from "next/server"
import { CSVImportService } from "@/lib/csv-import-service"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")

    if (!type) {
      return NextResponse.json({ error: "Template type is required" }, { status: 400 })
    }

    const template = await CSVImportService.generateTemplate(type)

    return new NextResponse(template, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${type}_import_template.csv"`,
      },
    })
  } catch (error) {
    console.error("Template generation error:", error)
    return NextResponse.json({ error: "Failed to generate template" }, { status: 500 })
  }
}
