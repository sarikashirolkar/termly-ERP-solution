import { NextResponse } from "next/server"
import { achievementService } from "@/lib/supabase-service"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get("studentId")
    const status = searchParams.get("status")
    const statistics = searchParams.get("statistics")

    let data

    if (statistics === "true") {
      data = await achievementService.getStatistics()
    } else if (studentId) {
      data = await achievementService.getByStudent(studentId)
    } else if (status) {
      data = await achievementService.getByStatus(status as any)
    } else {
      data = await achievementService.getAll()
    }

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error("Error fetching achievements:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch achievements",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const createdAchievement = await achievementService.create({
      ...body,
      status: "pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      data: createdAchievement,
    })
  } catch (error) {
    console.error("Error creating achievement:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create achievement",
      },
      { status: 500 },
    )
  }
}
