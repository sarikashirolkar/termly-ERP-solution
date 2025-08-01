import type { AttainmentData, StudentMark, AssessmentComponent, CourseOutcome, Question, Student } from "../types"

// Calculate overall attainment
export const calculateOverallAttainment = (
  cia: number,
  ueSee: number,
  ces: number,
  weights: { cia: number; ueSee: number; ces: number },
): number => {
  return Number.parseFloat((cia * weights.cia + ueSee * weights.ueSee + ces * weights.ces).toFixed(2))
}

// Calculate CO attainment for each student
export const calculateStudentCOAttainment = (
  student: Student,
  questions: Question[],
  courseOutcomes: CourseOutcome[],
): Record<string, number> => {
  const coAttainment: Record<string, { total: number; max: number }> = {}

  // Initialize CO attainment
  courseOutcomes.forEach((co) => {
    coAttainment[co.id] = { total: 0, max: 0 }
  })

  // Calculate total and max marks for each CO
  questions.forEach((question) => {
    const mark = student.marks[question.id] || 0
    if (!coAttainment[question.coId]) {
      coAttainment[question.coId] = { total: 0, max: 0 }
    }
    coAttainment[question.coId].total += mark
    coAttainment[question.coId].max += question.maxMarks
  })

  // Calculate percentage attainment for each CO
  const result: Record<string, number> = {}
  Object.entries(coAttainment).forEach(([coId, { total, max }]) => {
    result[coId] = max > 0 ? (total / max) * 100 : 0
  })

  return result
}

// Calculate overall CO attainment
export const calculateOverallCOAttainment = (
  students: Student[],
  questions: Question[],
  courseOutcomes: CourseOutcome[],
): Record<string, number> => {
  const coAttainment: Record<string, { total: number; max: number }> = {}

  // Initialize CO attainment
  courseOutcomes.forEach((co) => {
    coAttainment[co.id] = { total: 0, max: 0 }
  })

  // Sum up attainment for all students
  students.forEach((student) => {
    questions.forEach((question) => {
      const mark = student.marks[question.id] || 0
      if (!coAttainment[question.coId]) {
        coAttainment[question.coId] = { total: 0, max: 0 }
      }
      coAttainment[question.coId].total += mark
      coAttainment[question.coId].max += question.maxMarks
    })
  })

  // Calculate percentage attainment for each CO
  const result: Record<string, number> = {}
  Object.entries(coAttainment).forEach(([coId, { total, max }]) => {
    result[coId] = max > 0 ? (total / max) * 100 : 0
  })

  return result
}

// Calculate target attainment
export const calculateTargetAttainment = (
  questions: Question[],
  courseOutcomes: CourseOutcome[],
): Record<string, number> => {
  const coAttainment: Record<string, { total: number; max: number }> = {}

  // Initialize CO attainment
  courseOutcomes.forEach((co) => {
    coAttainment[co.id] = { total: 0, max: 0 }
  })

  // Calculate total and max marks for each CO
  questions.forEach((question) => {
    if (!coAttainment[question.coId]) {
      coAttainment[question.coId] = { total: 0, max: 0 }
    }
    coAttainment[question.coId].total += question.targetMarks
    coAttainment[question.coId].max += question.maxMarks
  })

  // Calculate percentage attainment for each CO
  const result: Record<string, number> = {}
  Object.entries(coAttainment).forEach(([coId, { total, max }]) => {
    result[coId] = max > 0 ? (total / max) * 100 : 0
  })

  return result
}

// Calculate average attainment
export const calculateAverageAttainment = (detailedAttainment: any[], component: string): number => {
  if (detailedAttainment.length === 0) return 0
  const sum = detailedAttainment.reduce((acc, item) => acc + item.attainment[component], 0)
  return Number.parseFloat((sum / detailedAttainment.length).toFixed(2))
}

// Calculate PO attainment
export const calculatePOAttainment = (
  poId: string,
  courseOutcomes: CourseOutcome[],
  selectedCourse: string,
  mappings: any,
  detailedAttainment: any[],
): number => {
  let totalMappingValue = 0
  let mappedCOCount = 0
  const avgCOAttainment = calculateAverageAttainment(detailedAttainment, "overall")

  courseOutcomes.forEach((co) => {
    const mappingLevel = getMappingLevel(co.id, poId, selectedCourse, mappings)
    if (mappingLevel > 0) {
      totalMappingValue += mappingLevel
      mappedCOCount++
    }
  })

  if (mappedCOCount === 0) return 0

  const avgMapping = totalMappingValue / mappedCOCount
  // Using the formula: (Average CO Attainment * Average PO Mapping) / Number of Levels (3)
  return Number.parseFloat(((avgCOAttainment * avgMapping) / 3).toFixed(2))
}

// Get mapping level
export const getMappingLevel = (coId: string, poId: string, selectedCourse: string, mappings: any): number => {
  if (!mappings[selectedCourse] || !mappings[selectedCourse][coId]) {
    return 0
  }
  return mappings[selectedCourse][coId][poId] || 0
}

// Get mapping color
export const getMappingColor = (level: number): string => {
  switch (level) {
    case 1:
      return "bg-yellow-100 dark:bg-yellow-900/30"
    case 2:
      return "bg-blue-100 dark:bg-blue-900/30"
    case 3:
      return "bg-green-100 dark:bg-green-900/30"
    default:
      return ""
  }
}

// Get mapping text
export const getMappingText = (level: number): string => {
  switch (level) {
    case 1:
      return "Low"
    case 2:
      return "Medium"
    case 3:
      return "High"
    default:
      return "None"
  }
}

// Calculate CES score
export const calculateCESScore = (
  questionId: string,
  mockResponses: Record<string, { rating1: number; rating2: number; rating3: number }>,
): number => {
  const responses = mockResponses[questionId]
  if (!responses) return 0

  const total = responses.rating1 + responses.rating2 + responses.rating3
  if (total === 0) return 0

  return (1 * responses.rating1 + 2 * responses.rating2 + 3 * responses.rating3) / total
}

// Calculate average CES score
export const calculateAverageCESScore = (
  surveyQuestions: { id: string; text: string }[],
  mockResponses: Record<string, { rating1: number; rating2: number; rating3: number }>,
): number => {
  const scores = surveyQuestions.map((q) => calculateCESScore(q.id, mockResponses))
  const total = scores.reduce((sum, score) => sum + score, 0)
  return scores.length > 0 ? total / scores.length : 0
}

// Calculate attainment level for a single CO
export function calculateAttainmentLevel(attainmentData: AttainmentData, coId: string): number {
  const { assessmentComponents, studentMarks, thresholds } = attainmentData

  // Find threshold for this CO
  const threshold = thresholds.find((t) => t.coId === coId)?.threshold || 40

  // If no components or marks, return 0
  if (!assessmentComponents?.length || !studentMarks?.length) {
    return 0
  }

  // Calculate total marks and attained marks for this CO
  let totalMarks = 0
  let attainedMarks = 0

  studentMarks.forEach((student) => {
    assessmentComponents.forEach((component) => {
      const mark = student.marks[component.id]?.[coId]
      if (mark !== undefined) {
        const weightedMark = (mark / component.maxMarks) * component.weight
        totalMarks += component.weight
        attainedMarks += weightedMark
      }
    })
  })

  // Calculate percentage attainment
  const percentAttainment = totalMarks > 0 ? (attainedMarks / totalMarks) * 100 : 0

  // Map to attainment level (1-3)
  if (percentAttainment >= threshold + 20) {
    return 3
  } else if (percentAttainment >= threshold) {
    return 2
  } else if (percentAttainment >= threshold - 20) {
    return 1
  } else {
    return 0
  }
}

// Calculate attainment levels for all COs
export function calculateAllAttainments(
  attainmentData: AttainmentData,
  courseOutcomes: CourseOutcome[],
): { [coId: string]: number } {
  const result: { [coId: string]: number } = {}

  courseOutcomes?.forEach((co) => {
    result[co.id] = calculateAttainmentLevel(attainmentData, co.id)
  })

  return result
}

// Export attainment data to CSV
export function exportAttainmentToCSV(attainmentData: AttainmentData, courseOutcomes: CourseOutcome[]): string {
  const { assessmentComponents, studentMarks } = attainmentData

  // Create header row
  let csv = "Student ID,Student Name"

  // Add component and CO headers
  assessmentComponents?.forEach((component) => {
    courseOutcomes?.forEach((co) => {
      csv += `,${component.name} - ${co.code}`
    })
  })

  csv += "\n"

  // Add student data rows
  studentMarks?.forEach((student) => {
    csv += `${student.studentId},${student.studentName}`

    assessmentComponents?.forEach((component) => {
      courseOutcomes?.forEach((co) => {
        const mark = student.marks[component.id]?.[co.id] ?? ""
        csv += `,${mark}`
      })
    })

    csv += "\n"
  })

  return csv
}

// Parse CSV data into student marks
export function parseAttainmentCSV(
  csvData: string,
  assessmentComponents: AssessmentComponent[],
  courseOutcomes: CourseOutcome[],
): StudentMark[] {
  const lines = csvData.split("\n")
  if (lines.length < 2) return []

  const studentMarks: StudentMark[] = []

  // Skip header row
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    const values = line.split(",")
    if (values.length < 2) continue

    const studentId = values[0]
    const studentName = values[1]
    const marks: { [componentId: string]: { [coId: string]: number } } = {}

    let valueIndex = 2
    assessmentComponents?.forEach((component) => {
      marks[component.id] = {}

      courseOutcomes?.forEach((co) => {
        if (valueIndex < values.length) {
          const mark = Number.parseFloat(values[valueIndex])
          if (!isNaN(mark)) {
            marks[component.id][co.id] = mark
          }
          valueIndex++
        }
      })
    })

    studentMarks.push({
      studentId,
      studentName,
      marks,
    })
  }

  return studentMarks
}
