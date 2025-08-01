import { NextResponse } from "next/server"
import { studentMarksService } from "@/lib/supabase-service"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get("studentId")
    const assessmentId = searchParams.get("assessmentId")

    let data

    if (studentId) {
      data = await studentMarksService.getByStudent(studentId)
    } else if (assessmentId) {
      data = await studentMarksService.getByAssessment(assessmentId)
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Either studentId or assessmentId is required",
        },
        { status: 400 },
      )
    }

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error("Error fetching marks:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch marks",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { marks } = body

    if (!marks || !Array.isArray(marks)) {
      return NextResponse.json(
        {
          success: false,
          error: "Marks array is required",
        },
        { status: 400 },
      )
    }

    const marksWithTimestamp = marks.map((mark: any) => ({
      ...mark,
      entered_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }))

    const createdMarks = await studentMarksService.create(marksWithTimestamp)

    return NextResponse.json({
      success: true,
      data: createdMarks,
    })
  } catch (error) {
    console.error("Error creating marks:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create marks",
      },
      { status: 500 },
    )
  }
}
