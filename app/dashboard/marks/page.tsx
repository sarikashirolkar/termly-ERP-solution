"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertCircle,
  BookOpen,
  Calendar,
  TrendingUp,
  Download,
  Calculator,
  FileText,
  GraduationCap,
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface StudentMark {
  mark_id: string
  subject_name: string
  subject_code: string
  assessment_type: string
  obtained_marks: number
  max_marks: number
  percentage: number
  assessment_date: string
  semester: number
  academic_year: string
  component_type: string
  batch?: string
  grade: string
  category: string
}

interface CategoryStats {
  count: number
  average: number
  total: number
  marks: StudentMark[]
}

interface SubjectWiseStats {
  subjectCode: string
  subjectName: string
  componentType: string
  totalAssessments: number
  totalMarks: number
  averagePercentage: number
  iaAverage: number
  assignmentAverage: number
  iaMarks: StudentMark[]
  assignmentMarks: StudentMark[]
  assessments: StudentMark[]
}

interface MarksData {
  overall: {
    totalAssessments: number
    averagePercentage: number
  }
  categories: {
    ia: CategoryStats
    assignment: CategoryStats
    final: {
      percentage: number
      calculated: boolean
    }
  }
  subjectWise: SubjectWiseStats[]
  records: StudentMark[]
}

export default function StudentMarksPage() {
  const [marksData, setMarksData] = useState<MarksData>({
    overall: { totalAssessments: 0, averagePercentage: 0 },
    categories: {
      ia: { count: 0, average: 0, total: 0, marks: [] },
      assignment: { count: 0, average: 0, total: 0, marks: [] },
      final: { percentage: 0, calculated: false },
    },
    subjectWise: [],
    records: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSubject, setSelectedSubject] = useState("all")

  useEffect(() => {
    fetchStudentMarks()
  }, [])

  const fetchStudentMarks = async () => {
    try {
      setLoading(true)
      setError(null)

      const userData = localStorage.getItem("user")
      if (!userData) {
        console.error("No user data found")
        setError("Please log in to view your marks")
        return
      }

      const user = JSON.parse(userData)
      const studentId = user.id

      console.log("Fetching marks data for student:", studentId)

      const response = await fetch(`/api/marks/student?user_id=${studentId}`, {
        headers: {
          "x-user-id": studentId,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.success && result.data) {
        setMarksData(result.data)
        console.log("Final marks data:", result.data)
      } else {
        throw new Error(result.error || "Failed to fetch marks")
      }
    } catch (error) {
      console.error("Error fetching marks data:", error)
      setError(error instanceof Error ? error.message : "Failed to fetch marks")
    } finally {
      setLoading(false)
    }
  }

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A+":
        return "bg-green-100 text-green-800 border-green-200"
      case "A":
        return "bg-green-100 text-green-700 border-green-200"
      case "B+":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "B":
        return "bg-blue-100 text-blue-700 border-blue-200"
      case "C":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-red-100 text-red-800 border-red-200"
    }
  }

  const getAssessmentTypeColor = (type: string) => {
    if (type.startsWith("IA")) return "bg-purple-100 text-purple-800 border-purple-200"
    if (type.startsWith("Assignment")) return "bg-orange-100 text-orange-800 border-orange-200"
    return "bg-gray-100 text-gray-800 border-gray-200"
  }

  const uniqueSubjects = Array.from(new Set(marksData.records.map((record) => record.subject_code)))

  const renderMarksTable = (marks: StudentMark[], title: string) => (
    <div className="space-y-3">
      <h4 className="font-medium text-sm text-muted-foreground">{title}</h4>
      {marks.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <BookOpen className="h-8 w-8 mx-auto mb-2" />
          <p>No {title.toLowerCase()} available</p>
        </div>
      ) : (
        <div className="space-y-2">
          {marks
            .filter((record) => selectedSubject === "all" || record.subject_code === selectedSubject)
            .map((record) => (
              <div
                key={record.mark_id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{record.subject_name}</span>
                    <Badge variant="outline" className="text-xs">
                      {record.subject_code}
                    </Badge>
                    <Badge variant="outline" className={`text-xs ${getAssessmentTypeColor(record.assessment_type)}`}>
                      {record.assessment_type}
                    </Badge>
                    {record.batch && (
                      <Badge variant="outline" className="text-xs">
                        Batch {record.batch}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(record.assessment_date).toLocaleDateString()}
                    </span>
                    <span>Sem {record.semester}</span>
                    <span className="capitalize">{record.component_type}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-medium text-sm">
                      {record.obtained_marks}/{record.max_marks}
                    </div>
                    <div className="text-xs text-muted-foreground">{record.percentage}%</div>
                  </div>
                  <Badge variant="outline" className={`${getGradeColor(record.grade)} font-medium text-xs`}>
                    {record.grade}
                  </Badge>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  )

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Marks</h1>
            <p className="text-muted-foreground">Loading your academic performance...</p>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Marks</h1>
            <p className="text-muted-foreground">View your academic performance</p>
          </div>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Error Loading Marks: {error}</span>
            <Button variant="outline" size="sm" onClick={fetchStudentMarks}>
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Marks</h1>
          <p className="text-muted-foreground">
            View your academic performance across IA tests, assignments, and final marks
          </p>
        </div>
        <Button variant="outline" className="flex items-center space-x-2 bg-transparent">
          <Download className="h-4 w-4" />
          <span>Export</span>
        </Button>
      </div>

      {/* Overall Performance Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Average</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{marksData.overall.averagePercentage}%</div>
            <p className="text-xs text-muted-foreground">{marksData.overall.totalAssessments} assessments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">IA Average</CardTitle>
            <GraduationCap className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{marksData.categories.ia.average}%</div>
            <p className="text-xs text-muted-foreground">{marksData.categories.ia.count} IA tests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assignment Average</CardTitle>
            <FileText className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{marksData.categories.assignment.average}%</div>
            <p className="text-xs text-muted-foreground">{marksData.categories.assignment.count} assignments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Final Marks</CardTitle>
            <Calculator className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {marksData.categories.final.calculated ? `${marksData.categories.final.percentage}%` : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              {marksData.categories.final.calculated ? "50% IA + 50% Assignment" : "Pending calculations"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Subject-wise Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Subject-wise Performance</CardTitle>
          <CardDescription>Your performance breakdown by subject</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {marksData.subjectWise.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">No subject data available</div>
          ) : (
            marksData.subjectWise.map((subject) => (
              <div key={`${subject.subjectCode}-${subject.componentType}`} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">
                      {subject.subjectName} ({subject.componentType})
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {subject.subjectCode}
                    </Badge>
                  </div>
                  <span className="font-bold">{subject.averagePercentage}%</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">IA Average:</span>
                      <span className="font-medium text-purple-600">{subject.iaAverage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-purple-500 h-1.5 rounded-full transition-all duration-1000"
                        style={{ width: `${subject.iaAverage}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Assignment Average:</span>
                      <span className="font-medium text-orange-600">{subject.assignmentAverage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-orange-500 h-1.5 rounded-full transition-all duration-1000"
                        style={{ width: `${subject.assignmentAverage}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Final (50-50):</span>
                      <span className="font-medium text-green-600">
                        {subject.iaAverage > 0 && subject.assignmentAverage > 0
                          ? `${Math.round((subject.iaAverage * 0.5 + subject.assignmentAverage * 0.5) * 100) / 100}%`
                          : "N/A"}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-green-500 h-1.5 rounded-full transition-all duration-1000"
                        style={{
                          width:
                            subject.iaAverage > 0 && subject.assignmentAverage > 0
                              ? `${subject.iaAverage * 0.5 + subject.assignmentAverage * 0.5}%`
                              : "0%",
                        }}
                      />
                    </div>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  {subject.totalAssessments} total assessments • {subject.iaMarks.length} IA tests •{" "}
                  {subject.assignmentMarks.length} assignments
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Detailed Marks by Category */}
      <Card>
        <CardHeader>
          <CardTitle>Assessment Details</CardTitle>
          <CardDescription>Detailed view of your marks by assessment type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Subject Filter */}
            <div className="flex items-center space-x-4">
              <Label>Filter by Subject:</Label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {uniqueSubjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tabs for different assessment types */}
            <Tabs defaultValue="ia" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="ia" className="flex items-center space-x-2">
                  <GraduationCap className="h-4 w-4" />
                  <span>IA Tests ({marksData.categories.ia.count})</span>
                </TabsTrigger>
                <TabsTrigger value="assignment" className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>Assignments ({marksData.categories.assignment.count})</span>
                </TabsTrigger>
                <TabsTrigger value="final" className="flex items-center space-x-2">
                  <Calculator className="h-4 w-4" />
                  <span>Final Report</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="ia" className="space-y-4">
                {renderMarksTable(marksData.categories.ia.marks, "IA Test Results")}
              </TabsContent>

              <TabsContent value="assignment" className="space-y-4">
                {renderMarksTable(marksData.categories.assignment.marks, "Assignment Results")}
              </TabsContent>

              <TabsContent value="final" className="space-y-4">
                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-muted-foreground">Final Marks Calculation</h4>
                  {marksData.categories.final.calculated ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-purple-600">
                                {marksData.categories.ia.average}%
                              </div>
                              <p className="text-sm text-muted-foreground">IA Average (50%)</p>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-orange-600">
                                {marksData.categories.assignment.average}%
                              </div>
                              <p className="text-sm text-muted-foreground">Assignment Average (50%)</p>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-green-600">
                                {marksData.categories.final.percentage}%
                              </div>
                              <p className="text-sm text-muted-foreground">Final Marks</p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                      <div className="text-center text-sm text-muted-foreground">
                        Final Marks = (IA Average × 50%) + (Assignment Average × 50%)
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">Final marks calculation pending</h3>
                      <p className="text-muted-foreground">
                        Final marks will be calculated once you have both IA test and assignment marks.
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
