import { NextResponse } from "next/server"
import { achievementService } from "@/lib/supabase-service"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { achievementId, verifiedById, remarks, action } = body

    if (!achievementId || !verifiedById) {
      return NextResponse.json(
        {
          success: false,
          error: "Achievement ID and verifier ID are required",
        },
        { status: 400 },
      )
    }

    let updatedAchievement

    if (action === "verify") {
      updatedAchievement = await achievementService.verify(achievementId, verifiedById, remarks)
    } else if (action === "reject") {
      updatedAchievement = await achievementService.update(achievementId, {
        status: "rejected",
        verified_by_id: verifiedById,
        verification_date: new Date().toISOString(),
        verification_remarks: remarks,
        updated_at: new Date().toISOString(),
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid action. Use 'verify' or 'reject'",
        },
        { status: 400 },
      )
    }

    return NextResponse.json({
      success: true,
      data: updatedAchievement,
    })
  } catch (error) {
    console.error("Error verifying achievement:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to verify achievement",
      },
      { status: 500 },
    )
  }
}
