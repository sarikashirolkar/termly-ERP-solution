import { type NextRequest, NextResponse } from "next/server"
import { analyticsService } from "@/lib/supabase-service"

// Type definitions
type AttendanceRecord = {
  studentId: string
  courseId: string
  date: string
  status: "present" | "absent" | "late"
  branch?: string
  facultyId?: string
}

type PerformanceRecord = {
  studentId: string
  courseId: string
  scoreType: string
  score: number
  maxScore: number
  date: string
  branch?: string
}

type EngagementRecord = {
  userId: string
  userType: "student" | "faculty" | "admin"
  action: string
  timestamp: number
}

type Student = {
  id: string
  firstName: string
  lastName: string
  email: string
  branch: string
}

type Faculty = {
  id: string
  firstName: string
  lastName: string
  email: string
  department: string
}

// In-memory stores (replace with database in production)
const attendanceRecords: AttendanceRecord[] = [
  { studentId: "S1001", courseId: "C101", date: "2025-03-01", status: "present", branch: "CSE" },
  { studentId: "S1002", courseId: "C101", date: "2025-03-01", status: "present", branch: "CSE(AIML)" },
  { studentId: "S1003", courseId: "C101", date: "2025-03-01", status: "absent", branch: "CSE(DS)" },
  { studentId: "S1004", courseId: "C101", date: "2025-03-01", status: "present", branch: "ISC" },
  { studentId: "S1005", courseId: "C101", date: "2025-03-01", status: "late", branch: "ECE" },
  { studentId: "S1001", courseId: "C102", date: "2025-03-02", status: "present", branch: "CSE" },
  { studentId: "S1002", courseId: "C102", date: "2025-03-02", status: "absent", branch: "CSE(AIML)" },
  { studentId: "S1003", courseId: "C102", date: "2025-03-02", status: "present", branch: "CSE(DS)" },
  { studentId: "S1004", courseId: "C102", date: "2025-03-02", status: "present", branch: "ISC" },
  { studentId: "S1005", courseId: "C102", date: "2025-03-02", status: "present", branch: "ECE" },
  { studentId: "S1001", courseId: "C101", date: "2025-03-03", status: "present", branch: "CSE" },
  { studentId: "S1001", courseId: "C101", date: "2025-03-04", status: "absent", branch: "CSE" },
  { studentId: "S1001", courseId: "C101", date: "2025-03-05", status: "present", branch: "CSE" },
  { studentId: "S1001", courseId: "C101", date: "2025-03-06", status: "present", branch: "CSE" },
  { studentId: "S1001", courseId: "C101", date: "2025-03-07", status: "late", branch: "CSE" },
  { studentId: "S1001", courseId: "C101", date: "2025-03-08", status: "present", branch: "CSE" },
  { studentId: "S1001", courseId: "C101", date: "2025-03-09", status: "present", branch: "CSE" },
  { studentId: "S1001", courseId: "C101", date: "2025-03-10", status: "absent", branch: "CSE" },
  { studentId: "S1001", courseId: "C101", date: "2025-03-11", status: "present", branch: "CSE" },
  { studentId: "S1001", courseId: "C101", date: "2025-03-12", status: "present", branch: "CSE" },
]

const performanceRecords: PerformanceRecord[] = [
  {
    studentId: "S1001",
    courseId: "C101",
    scoreType: "quiz",
    score: 85,
    maxScore: 100,
    date: "2025-03-05",
    branch: "CSE",
  },
  {
    studentId: "S1002",
    courseId: "C101",
    scoreType: "quiz",
    score: 92,
    maxScore: 100,
    date: "2025-03-05",
    branch: "CSE(AIML)",
  },
  {
    studentId: "S1003",
    courseId: "C101",
    scoreType: "quiz",
    score: 78,
    maxScore: 100,
    date: "2025-03-05",
    branch: "CSE(DS)",
  },
  {
    studentId: "S1004",
    courseId: "C101",
    scoreType: "quiz",
    score: 88,
    maxScore: 100,
    date: "2025-03-05",
    branch: "ISC",
  },
  {
    studentId: "S1005",
    courseId: "C101",
    scoreType: "quiz",
    score: 75,
    maxScore: 100,
    date: "2025-03-05",
    branch: "ECE",
  },
  {
    studentId: "S1001",
    courseId: "C102",
    scoreType: "assignment",
    score: 90,
    maxScore: 100,
    date: "2025-03-10",
    branch: "CSE",
  },
  {
    studentId: "S1002",
    courseId: "C102",
    scoreType: "assignment",
    score: 95,
    maxScore: 100,
    date: "2025-03-10",
    branch: "CSE(AIML)",
  },
  {
    studentId: "S1003",
    courseId: "C102",
    scoreType: "assignment",
    score: 82,
    maxScore: 100,
    date: "2025-03-10",
    branch: "CSE(DS)",
  },
  {
    studentId: "S1004",
    courseId: "C102",
    scoreType: "assignment",
    score: 85,
    maxScore: 100,
    date: "2025-03-10",
    branch: "ISC",
  },
  {
    studentId: "S1005",
    courseId: "C102",
    scoreType: "assignment",
    score: 80,
    maxScore: 100,
    date: "2025-03-10",
    branch: "ECE",
  },
  {
    studentId: "S1001",
    courseId: "C101",
    scoreType: "midterm",
    score: 72,
    maxScore: 100,
    date: "2025-04-01",
    branch: "CSE",
  },
  {
    studentId: "S1001",
    courseId: "C101",
    scoreType: "final",
    score: 95,
    maxScore: 100,
    date: "2025-05-15",
    branch: "CSE",
  },
  {
    studentId: "S1001",
    courseId: "C102",
    scoreType: "quiz",
    score: 88,
    maxScore: 100,
    date: "2025-04-20",
    branch: "CSE",
  },
  {
    studentId: "S1001",
    courseId: "C101",
    scoreType: "quiz",
    score: 65,
    maxScore: 100,
    date: "2025-03-01",
    branch: "CSE",
  },
  {
    studentId: "S1001",
    courseId: "C101",
    scoreType: "quiz",
    score: 75,
    maxScore: 100,
    date: "2025-03-15",
    branch: "CSE",
  },
  {
    studentId: "S1001",
    courseId: "C101",
    scoreType: "quiz",
    score: 80,
    maxScore: 100,
    date: "2025-04-10",
    branch: "CSE",
  },
]

const engagementRecords: EngagementRecord[] = []

const students: Student[] = [
  { id: "S1001", firstName: "John", lastName: "Doe", email: "john.doe@example.com", branch: "CSE" },
  { id: "S1002", firstName: "Jane", lastName: "Smith", email: "jane.smith@example.com", branch: "CSE(AIML)" },
  { id: "S1003", firstName: "Bob", lastName: "Johnson", email: "bob.johnson@example.com", branch: "CSE(DS)" },
  { id: "S1004", firstName: "Alice", lastName: "Williams", email: "alice.williams@example.com", branch: "ISC" },
  { id: "S1005", firstName: "Charlie", lastName: "Brown", email: "charlie.brown@example.com", branch: "ECE" },
]

const faculty: Faculty[] = [
  {
    id: "F1001",
    firstName: "David",
    lastName: "Miller",
    email: "david.miller@example.com",
    department: "Computer Science",
  },
  {
    id: "F1002",
    firstName: "Sarah",
    lastName: "Wilson",
    email: "sarah.wilson@example.com",
    department: "Information Science",
  },
  {
    id: "F1003",
    firstName: "Michael",
    lastName: "Taylor",
    email: "michael.taylor@example.com",
    department: "Electronics",
  },
]

// Helper functions
function calculateAttendancePercentage(studentId: string, courseId?: string): number {
  const records = attendanceRecords.filter(
    (record) => record.studentId === studentId && (courseId ? record.courseId === courseId : true),
  )

  if (records.length === 0) return 0

  const presentCount = records.filter((record) => record.status === "present" || record.status === "late").length

  return (presentCount / records.length) * 100
}

function calculateAveragePerformance(studentId: string, courseId?: string): number {
  const records = performanceRecords.filter(
    (record) => record.studentId === studentId && (courseId ? record.courseId === courseId : true),
  )

  if (records.length === 0) return 0

  const totalPercentage = records.reduce((sum, record) => {
    return sum + (record.score / record.maxScore) * 100
  }, 0)

  return totalPercentage / records.length
}

function calculatePerformanceTrend(studentId: string, courseId?: string, days = 30): number[] {
  const now = Date.now()
  const startTime = now - days * 24 * 60 * 60 * 1000

  // Group records by day
  const dailyScores: Map<string, number[]> = new Map()

  performanceRecords
    .filter(
      (record) =>
        record.studentId === studentId &&
        (courseId ? record.courseId === courseId : true) &&
        new Date(record.date).getTime() >= startTime,
    )
    .forEach((record) => {
      const day = record.date.split("T")[0]
      if (!dailyScores.has(day)) {
        dailyScores.set(day, [])
      }
      dailyScores.get(day)!.push((record.score / record.maxScore) * 100)
    })

  // Calculate daily averages
  const result: { day: string; average: number }[] = []

  for (const [day, scores] of dailyScores.entries()) {
    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length
    result.push({ day, average })
  }

  // Sort by day
  result.sort((a, b) => new Date(a.day).getTime() - new Date(b.day).getTime())

  // Return just the averages
  return result.map((item) => item.average)
}

function getTopPerformers(courseId: string, limit = 5): { studentId: string; average: number }[] {
  // Get unique student IDs
  const studentIds = new Set(
    performanceRecords.filter((record) => record.courseId === courseId).map((record) => record.studentId),
  )

  // Calculate average for each student
  const studentAverages: { studentId: string; average: number }[] = []

  for (const studentId of studentIds) {
    const average = calculateAveragePerformance(studentId, courseId)
    studentAverages.push({ studentId, average })
  }

  // Sort by average (descending) and take top performers
  return studentAverages.sort((a, b) => b.average - a.average).slice(0, limit)
}

function getMostEngagedUsers(days = 30, limit = 5): { userId: string; userType: string; count: number }[] {
  const now = Date.now()
  const startTime = now - days * 24 * 60 * 60 * 1000

  // Filter recent records
  const recentRecords = engagementRecords.filter((record) => record.timestamp >= startTime)

  // Count actions by user
  const userCounts: Map<string, { userId: string; userType: string; count: number }> = new Map()

  recentRecords.forEach((record) => {
    const key = `${record.userType}-${record.userId}`
    if (!userCounts.has(key)) {
      userCounts.set(key, {
        userId: record.userId,
        userType: record.userType,
        count: 0,
      })
    }
    userCounts.get(key)!.count++
  })

  // Sort by count and take top users
  return Array.from(userCounts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

// New helper functions for enhanced analytics
function calculateAverageAttendanceByBranch(): { branch: string; average: number; studentCount: number }[] {
  const branches = ["CSE", "CSE(AIML)", "CSE(DS)", "ISC", "ECE"]
  const result: { branch: string; average: number; studentCount: number }[] = []

  for (const branch of branches) {
    const branchStudents = students.filter((student) => student.branch === branch)
    if (branchStudents.length === 0) {
      result.push({ branch, average: 0, studentCount: 0 })
      continue
    }

    let totalAttendance = 0
    for (const student of branchStudents) {
      totalAttendance += calculateAttendancePercentage(student.id)
    }

    result.push({
      branch,
      average: totalAttendance / branchStudents.length,
      studentCount: branchStudents.length,
    })
  }

  return result
}

function calculateAverageMarksByBranch(): { branch: string; average: number; studentCount: number }[] {
  const branches = ["CSE", "CSE(AIML)", "CSE(DS)", "ISC", "ECE"]
  const result: { branch: string; average: number; studentCount: number }[] = []

  for (const branch of branches) {
    const branchStudents = students.filter((student) => student.branch === branch)
    if (branchStudents.length === 0) {
      result.push({ branch, average: 0, studentCount: 0 })
      continue
    }

    let totalMarks = 0
    for (const student of branchStudents) {
      totalMarks += calculateAveragePerformance(student.id)
    }

    result.push({
      branch,
      average: totalMarks / branchStudents.length,
      studentCount: branchStudents.length,
    })
  }

  return result
}

function calculateOverallAttendance(): {
  overallAverage: number
  studentAverage: number
  facultyAverage: number
  totalStudents: number
  totalFaculty: number
} {
  // For this mock implementation, we'll use random values for faculty attendance
  // In a real implementation, you would calculate this from actual faculty attendance records

  let totalStudentAttendance = 0
  for (const student of students) {
    totalStudentAttendance += calculateAttendancePercentage(student.id)
  }

  const studentAverage = totalStudentAttendance / students.length
  const facultyAverage = 92.5 // Mock value for faculty attendance

  return {
    overallAverage: (studentAverage + facultyAverage) / 2,
    studentAverage,
    facultyAverage,
    totalStudents: students.length,
    totalFaculty: faculty.length,
  }
}

function getStudentPerformanceDetails(studentId: string): {
  attendance: number
  marks: number
  trend: number[]
  branch: string
  name: string
} | null {
  const student = students.find((s) => s.id === studentId)
  if (!student) return null

  return {
    attendance: calculateAttendancePercentage(studentId),
    marks: calculateAveragePerformance(studentId),
    trend: calculatePerformanceTrend(studentId),
    branch: student.branch,
    name: `${student.firstName} ${student.lastName}`,
  }
}

function getFacultyPerformanceDetails(facultyId: string): {
  department: string
  name: string
  courseCount: number
  studentCount: number
  averageAttendance: number
} | null {
  const facultyMember = faculty.find((f) => f.id === facultyId)
  if (!facultyMember) return null

  // Mock data for faculty performance
  return {
    department: facultyMember.department,
    name: `${facultyMember.firstName} ${facultyMember.lastName}`,
    courseCount: 3,
    studentCount: 120,
    averageAttendance: 88.5,
  }
}

// Enhance the analytics API to better support branch and semester organization

// Add a new helper function to get student data by branch and semester
function getStudentDataByBranchAndSemester(): {
  branch: string
  semesters: {
    semester: number
    studentCount: number
    averageAttendance: number
    averagePerformance: number
  }[]
}[] {
  const branches = ["CSE", "CSE(AIML)", "CSE(DS)", "ISC", "ECE"]
  const semesters = [1, 3, 5, 7]

  const result = branches.map((branch) => {
    const semesterData = semesters.map((semester) => {
      // In a real implementation, this would query the database
      // For this mock, we'll generate some realistic data
      const studentCount = Math.floor(Math.random() * 20) + 25 // 25-45 students
      const averageAttendance = Math.floor(Math.random() * 15) + 75 // 75-90%
      const averagePerformance = Math.floor(Math.random() * 15) + 75 // 75-90%

      return {
        semester,
        studentCount,
        averageAttendance,
        averagePerformance,
      }
    })

    return {
      branch,
      semesters: semesterData,
    }
  })

  return result
}

// NEW HELPER FUNCTIONS FOR STUDENT ANALYTICS
function getStudentAttendanceTrend(studentId: string, days = 90): { date: string; percentage: number }[] {
  const now = new Date()
  const startDate = new Date(now.setDate(now.getDate() - days))

  const studentAttendance = attendanceRecords.filter(
    (record) => record.studentId === studentId && new Date(record.date) >= startDate,
  )

  const dailyAttendance: { [key: string]: { present: number; total: number } } = {}

  studentAttendance.forEach((record) => {
    const dateKey = record.date // Assuming date is YYYY-MM-DD
    if (!dailyAttendance[dateKey]) {
      dailyAttendance[dateKey] = { present: 0, total: 0 }
    }
    dailyAttendance[dateKey].total++
    if (record.status === "present" || record.status === "late") {
      dailyAttendance[dateKey].present++
    }
  })

  const trendData: { date: string; percentage: number }[] = []
  for (const dateKey in dailyAttendance) {
    const { present, total } = dailyAttendance[dateKey]
    trendData.push({
      date: dateKey,
      percentage: total > 0 ? (present / total) * 100 : 0,
    })
  }

  // Sort by date
  trendData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Ensure there's always some data for the chart, even if sparse
  if (trendData.length === 0) {
    // Generate dummy data for the last 7 days if no real data
    for (let i = 0; i < 7; i++) {
      const d = new Date()
      d.setDate(now.getDate() - (6 - i)) // Get dates for the last 7 days
      trendData.push({
        date: d.toISOString().split("T")[0],
        percentage: Math.floor(Math.random() * 20) + 70, // Random percentage between 70-90
      })
    }
  }

  return trendData
}

function getStudentGradeDistribution(studentId: string): { grade: string; count: number }[] {
  const studentPerformance = performanceRecords.filter((record) => record.studentId === studentId)

  const gradeCounts: { [key: string]: number } = { A: 0, B: 0, C: 0, D: 0, F: 0 }

  studentPerformance.forEach((record) => {
    const percentage = (record.score / record.maxScore) * 100
    let grade: string

    if (percentage >= 90) grade = "A"
    else if (percentage >= 80) grade = "B"
    else if (percentage >= 70) grade = "C"
    else if (percentage >= 60) grade = "D"
    else grade = "F"

    gradeCounts[grade]++
  })

  // Convert to array format expected by chart
  const distributionData = Object.keys(gradeCounts).map((grade) => ({
    grade,
    count: gradeCounts[grade],
  }))

  // Ensure there's always some data for the chart, even if sparse
  if (distributionData.every((item) => item.count === 0)) {
    return [
      { grade: "A", count: 10 },
      { grade: "B", count: 25 },
      { grade: "C", count: 20 },
      { grade: "D", count: 5 },
      { grade: "F", count: 2 },
    ]
  }

  return distributionData
}

// Update the GET function to include the new branch and semester data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get("studentId")
    const courseId = searchParams.get("courseId")
    const metric = searchParams.get("metric")
    const days = Number.parseInt(searchParams.get("days") || "30")
    const limit = Number.parseInt(searchParams.get("limit") || "5")
    const role = searchParams.get("role")
    const branch = searchParams.get("branch")
    const semester = searchParams.get("semester")
    const departmentId = searchParams.get("departmentId")
    const type = searchParams.get("type")
    const department = searchParams.get("department")

    let data

    if (type === "department") {
      if (department) {
        data = await analyticsService.getDepartmentStats(department as any)
      } else {
        return NextResponse.json(
          {
            success: false,
            error: "Department parameter is required for department analytics",
          },
          { status: 400 },
        )
      }
    } else if (type === "student-performance") {
      data = await analyticsService.getStudentPerformanceStats()
    } else if (type === "faculty-workload") {
      data = await analyticsService.getFacultyWorkloadStats()
    } else if (type === "attendance") {
      data = await analyticsService.getAttendanceStats()
    } else if (type === "achievements") {
      data = await analyticsService.getAchievementStats()
    } else if (metric === "overallAnalytics" || metric === "principalAnalytics") {
      data = await analyticsService.getOverallStats()
    } else if (metric === "departmentAnalytics" && departmentId) {
      data = await analyticsService.getDepartmentStats(departmentId)
    } else if (metric === "studentPerformance") {
      data = await analyticsService.getStudentPerformanceStats()
    } else if (metric === "facultyWorkload") {
      data = await analyticsService.getFacultyWorkloadStats()
    } else if (metric === "attendanceStats") {
      data = await analyticsService.getAttendanceStats()
    } else if (metric === "achievementStats") {
      data = await analyticsService.getAchievementStats()
    } else if (role === "principal" || role === "admin" || role === "hod") {
      data = {
        overallAttendance: calculateOverallAttendance(),
        attendanceByBranch: calculateAverageAttendanceByBranch(),
        marksByBranch: calculateAverageMarksByBranch(),
        mostEngaged: getMostEngagedUsers(days, limit),
        studentDataByBranchAndSemester: getStudentDataByBranchAndSemester(),
      }
    } else if (role === "faculty") {
      // Faculty dashboard
      data = {
        coursePerformance: [
          { courseId: "C101", name: "Introduction to Programming", attendance: 87.5, averageMarks: 82.3 },
          { courseId: "C102", name: "Data Structures", attendance: 92.1, averageMarks: 78.9 },
          { courseId: "C103", name: "Database Systems", attendance: 85.0, averageMarks: 80.5 },
        ],
        topPerformers: getTopPerformers("C101", 5),
      }
    } else if (studentId) {
      // Student dashboard
      data = {
        attendance: calculateAttendancePercentage(studentId),
        performance: {
          average: calculateAveragePerformance(studentId),
          trend: calculatePerformanceTrend(studentId, undefined, days),
        },
        attendanceTrend: getStudentAttendanceTrend(studentId, days), // NEW
        gradeDistribution: getStudentGradeDistribution(studentId), // NEW
      }
    } else if (courseId) {
      // Course dashboard
      data = {
        topPerformers: getTopPerformers(courseId, limit),
      }
    } else {
      // General dashboard
      data = {
        mostEngaged: getMostEngagedUsers(days, limit),
      }
    }

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch analytics",
      },
      { status: 500 },
    )
  }
}

// POST endpoint to add analytics data (for testing)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { metric, department } = body

    let data
    if (metric === "departmentAnalytics" && department) {
      data = await analyticsService.getDepartmentStats(department as any)
    } else {
      data = await analyticsService.getOverallStats()
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error processing analytics request:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process analytics request. Please check your database connection.",
      },
      { status: 500 },
    )
  }
}
