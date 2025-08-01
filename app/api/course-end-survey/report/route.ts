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

interface SurveyReport {
  surveyId: string
  facultyName: string
  subjectCode: string
  subjectName: string
  academicYear: string
  department: string
  semester: string
  section: string
  dateOfCES: string
  totalStudents: number
  respondedStudents: number
  responseRate: number
  questions: {
    id: string
    text: string
    ratings: {
      1: number
      2: number
      3: number
    }
    cesScore: number
  }[]
  avgCesScore: number
}

// Mock data (replace with database queries in production)
const surveys: Survey[] = []
const responses: SurveyResponse[] = []

// GET handler - Generate a report for a survey
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const surveyId = searchParams.get("surveyId")

  if (!surveyId) {
    return NextResponse.json({ error: "Survey ID is required" }, { status: 400 })
  }

  // Find the survey
  const survey = surveys.find((s) => s.id === surveyId)
  if (!survey) {
    return NextResponse.json({ error: "Survey not found" }, { status: 404 })
  }

  // Get responses for the survey
  const surveyResponses = responses.filter((r) => r.surveyId === surveyId)

  // Get unique student IDs who responded
  const respondedStudentIds = [...new Set(surveyResponses.map((r) => r.studentId))]

  // Calculate question-wise ratings and CES scores
  const questionReports = survey.questions.map((question) => {
    const questionResponses = surveyResponses.filter((r) => r.questionId === question.id)

    const ratings = {
      1: questionResponses.filter((r) => r.rating === 1).length,
      2: questionResponses.filter((r) => r.rating === 2).length,
      3: questionResponses.filter((r) => r.rating === 3).length,
    }

    // Calculate CES score using the formula: (1*count1 + 2*count2 + 3*count3) / total
    const totalResponses = ratings[1] + ratings[2] + ratings[3]
    const cesScore = totalResponses > 0 ? (1 * ratings[1] + 2 * ratings[2] + 3 * ratings[3]) / totalResponses : 0

    return {
      id: question.id,
      text: question.text,
      ratings,
      cesScore,
    }
  })

  // Calculate average CES score
  const avgCesScore =
    questionReports.length > 0 ? questionReports.reduce((sum, q) => sum + q.cesScore, 0) / questionReports.length : 0

  // Create the report
  const report: SurveyReport = {
    surveyId,
    facultyName: survey.facultyName,
    subjectCode: survey.subjectCode,
    subjectName: survey.subjectName,
    academicYear: survey.academicYear,
    department: survey.department,
    semester: survey.semester,
    section: survey.section,
    dateOfCES: survey.dateCreated,
    totalStudents: 64, // Mock total students - replace with actual count from database
    respondedStudents: respondedStudentIds.length,
    responseRate: (respondedStudentIds.length / 64) * 100, // Mock total - replace with actual
    questions: questionReports,
    avgCesScore,
  }

  return NextResponse.json({ report })
}
