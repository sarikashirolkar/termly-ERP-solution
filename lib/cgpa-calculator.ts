export function calculateCGPA(grades: { gradePoint: number; credits: number }[]): number {
  if (grades.length === 0) {
    return 0
  }

  let totalGradePoints = 0
  let totalCredits = 0

  for (const { gradePoint, credits } of grades) {
    totalGradePoints += gradePoint * credits
    totalCredits += credits
  }

  if (totalCredits === 0) {
    return 0
  }

  return Number.parseFloat((totalGradePoints / totalCredits).toFixed(2))
}

export function getGradePoint(grade: string): number {
  switch (grade.toUpperCase()) {
    case "S":
      return 10
    case "A":
      return 9
    case "B":
      return 8
    case "C":
      return 7
    case "D":
      return 6
    case "E":
      return 5
    case "F":
      return 0
    case "N": // Not applicable / Not graded
      return 0
    default:
      return 0 // Or throw an error for invalid grade
  }
}

export function getGradeFromPercentage(percentage: number): string {
  if (percentage >= 90) return "S"
  if (percentage >= 80) return "A"
  if (percentage >= 70) return "B"
  if (percentage >= 60) return "C"
  if (percentage >= 50) return "D"
  if (percentage >= 40) return "E"
  return "F"
}

export function getLetterGrade(gradePoint: number): string {
  if (gradePoint >= 9.5) return "S"
  if (gradePoint >= 8.5) return "A"
  if (gradePoint >= 7.5) return "B"
  if (gradePoint >= 6.5) return "C"
  if (gradePoint >= 5.5) return "D"
  if (gradePoint >= 4.5) return "E"
  return "F"
}

export function getCGPAClassification(cgpa: number): string {
  if (cgpa >= 9.0) return "Outstanding"
  if (cgpa >= 8.0) return "Excellent"
  if (cgpa >= 7.0) return "Very Good"
  if (cgpa >= 6.0) return "Good"
  if (cgpa >= 5.0) return "Average"
  if (cgpa >= 4.0) return "Pass"
  return "Fail"
}
