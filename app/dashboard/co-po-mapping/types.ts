export type MappingLevel = 0 | 1 | 2 | 3

export type CourseOutcome = {
  id: string
  code: string
  description: string
}

export type ProgramOutcome = {
  id: string
  code: string
  description: string
}

export type ProgramSpecificOutcome = {
  id: string
  code: string
  description: string
}

export type MappingData = {
  courseOutcomes: CourseOutcome[]
  programOutcomes: ProgramOutcome[]
  programSpecificOutcomes: ProgramSpecificOutcome[]
  mappings: MappingCell[]
}

export type MappingCell = {
  coId: string
  poId: string
  value: MappingLevel
}

export type AttainmentData = {
  assessmentComponents: AssessmentComponent[]
  thresholds: COAttainmentThreshold[]
  studentMarks: StudentMark[]
  attainmentLevels: { [coId: string]: number }
}

export type AssessmentComponent = {
  id: string
  name: string
  weight: number
  maxMarks: number
}

export type COAttainmentThreshold = {
  coId: string
  threshold: number
}

export type StudentMark = {
  studentId: string
  studentName: string
  marks: { [componentId: string]: { [coId: string]: number } }
}

export type SurveyData = {
  questions: Question[]
  submissions: Submission[]
}

export type Question = {
  id: string
  text: string
}

export type Submission = {
  id: string
  studentId: string
  responses: Response[]
  timestamp: string
}

export type Response = {
  questionId: string
  rating: number
}

export type CourseConfig = {
  courseCode: string
  courseName: string
  semester: string
  faculty: string
}

export interface Student {
  id: string
  name: string
  email: string
  department: string
  semester: string
  attendance: number
  marks: {
    assignment: number
    midterm: number
    final: number | null
  }
  grade: string | null
}
