import { type NextRequest, NextResponse } from "next/server"

// Types
interface SurveyResponse {
  id: string
  surveyId: string
  questionId: string
  rating: 1 | 2 | 3
  studentId: string
}

// In-memory storage (replace with database in production)
let responses: SurveyResponse[] = []

// GET handler - Get responses for a survey
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const surveyId = searchParams.get("surveyId")
  const studentId = searchParams.get("studentId")

  if (!surveyId) {
    return NextResponse.json({ error: "Survey ID is required" }, { status: 400 })
  }

  // Filter responses by survey ID and optionally by student ID
  let filteredResponses = responses.filter((r) => r.surveyId === surveyId)
  if (studentId) {
    filteredResponses = filteredResponses.filter((r) => r.studentId === studentId)
  }

  return NextResponse.json({ responses: filteredResponses })
}

// POST handler - Submit a response
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.surveyId || !body.questionId || body.rating === undefined || !body.studentId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate rating
    if (![1, 2, 3].includes(body.rating)) {
      return NextResponse.json({ error: "Rating must be 1, 2, or 3" }, { status: 400 })
    }

    // Check if response already exists
    const existingResponse = responses.find(
      (r) => r.surveyId === body.surveyId && r.questionId === body.questionId && r.studentId === body.studentId,
    )

    if (existingResponse) {
      // Update existing response
      existingResponse.rating = body.rating
      return NextResponse.json({ response: existingResponse })
    }

    // Create a new response
    const newResponse: SurveyResponse = {
      id: `response_${Date.now()}`,
      surveyId: body.surveyId,
      questionId: body.questionId,
      rating: body.rating,
      studentId: body.studentId,
    }

    // Add to responses
    responses.push(newResponse)

    return NextResponse.json({ response: newResponse }, { status: 201 })
  } catch (error) {
    console.error("Error submitting response:", error)
    return NextResponse.json({ error: "Failed to submit response" }, { status: 500 })
  }
}

// DELETE handler - Delete responses
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const surveyId = searchParams.get("surveyId")
  const studentId = searchParams.get("studentId")

  if (!surveyId) {
    return NextResponse.json({ error: "Survey ID is required" }, { status: 400 })
  }

  // Delete responses by survey ID and optionally by student ID
  if (studentId) {
    responses = responses.filter((r) => !(r.surveyId === surveyId && r.studentId === studentId))
  } else {
    responses = responses.filter((r) => r.surveyId !== surveyId)
  }

  return NextResponse.json({ success: true })
}
