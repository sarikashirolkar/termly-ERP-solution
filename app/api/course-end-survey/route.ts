import { type NextRequest, NextResponse } from "next/server"

// Types
interface Question {
  id: string
  text: string
}

interface Survey {
  id: string
  title: string
  department: string
  semester: string
  section: string
  subjectCode: string
  subjectName: string
  facultyName: string
  academicYear: string
  dateCreated: string
  questions: Question[]
  status: "draft" | "published" | "completed"
}

interface SurveyResponse {
  id: string
  surveyId: string
  questionId: string
  rating: 1 | 2 | 3
  studentId: string
}

// In-memory storage (replace with database in production)
const surveys: Survey[] = []
let responses: SurveyResponse[] = []

// GET handler
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  const department = searchParams.get("department")
  const facultyId = searchParams.get("facultyId")

  // Return a specific survey
  if (id) {
    const survey = surveys.find((s) => s.id === id)
    if (!survey) {
      return NextResponse.json({ error: "Survey not found" }, { status: 404 })
    }
    return NextResponse.json({ survey })
  }

  // Filter surveys by department
  if (department) {
    const filteredSurveys = surveys.filter((s) => s.department === department)
    return NextResponse.json({ surveys: filteredSurveys })
  }

  // Filter surveys by faculty
  if (facultyId) {
    const filteredSurveys = surveys.filter((s) => s.facultyName === facultyId)
    return NextResponse.json({ surveys: filteredSurveys })
  }

  // Return all surveys
  return NextResponse.json({ surveys })
}

// POST handler - Create a new survey
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (
      !body.title ||
      !body.department ||
      !body.semester ||
      !body.section ||
      !body.subjectCode ||
      !body.subjectName ||
      !body.facultyName ||
      !body.academicYear ||
      !body.questions ||
      body.questions.length === 0
    ) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create a new survey
    const newSurvey: Survey = {
      id: `survey_${Date.now()}`,
      title: body.title,
      department: body.department,
      semester: body.semester,
      section: body.section,
      subjectCode: body.subjectCode,
      subjectName: body.subjectName,
      facultyName: body.facultyName,
      academicYear: body.academicYear,
      dateCreated: new Date().toISOString().split("T")[0],
      questions: body.questions.map((q: any, index: number) => ({
        id: `q_${Date.now()}_${index}`,
        text: q.text,
      })),
      status: "draft",
    }

    // Add to surveys
    surveys.push(newSurvey)

    return NextResponse.json({ survey: newSurvey }, { status: 201 })
  } catch (error) {
    console.error("Error creating survey:", error)
    return NextResponse.json({ error: "Failed to create survey" }, { status: 500 })
  }
}

// PUT handler - Update a survey
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.id) {
      return NextResponse.json({ error: "Survey ID is required" }, { status: 400 })
    }

    // Find the survey
    const surveyIndex = surveys.findIndex((s) => s.id === body.id)
    if (surveyIndex === -1) {
      return NextResponse.json({ error: "Survey not found" }, { status: 404 })
    }

    // Update the survey
    const updatedSurvey = {
      ...surveys[surveyIndex],
      ...body,
      questions: body.questions || surveys[surveyIndex].questions,
    }

    surveys[surveyIndex] = updatedSurvey

    return NextResponse.json({ survey: updatedSurvey })
  } catch (error) {
    console.error("Error updating survey:", error)
    return NextResponse.json({ error: "Failed to update survey" }, { status: 500 })
  }
}

// DELETE handler - Delete a survey
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  if (!id) {
    return NextResponse.json({ error: "Survey ID is required" }, { status: 400 })
  }

  // Find the survey
  const surveyIndex = surveys.findIndex((s) => s.id === id)
  if (surveyIndex === -1) {
    return NextResponse.json({ error: "Survey not found" }, { status: 404 })
  }

  // Remove the survey
  surveys.splice(surveyIndex, 1)

  // Remove associated responses
  responses = responses.filter((r) => r.surveyId !== id)

  return NextResponse.json({ success: true })
}
