"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AttendanceChart } from "@/components/dashboard/attendance-chart"
import { GradeDistributionChart } from "@/components/dashboard/grade-distribution-chart"
import { useEffect, useState } from "react"

// Define types for the fetched data
interface StudentAnalyticsData {
  attendance: number
  performance: {
    average: number
    trend: number[]
  }
  attendanceTrend: { date: string; percentage: number }[]
  gradeDistribution: { grade: string; count: number }[]
}

export default function AnalyticsPage() {
  const [userData, setUserData] = useState<any>(null)
  const [studentAnalytics, setStudentAnalytics] = useState<StudentAnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setLoading(true)
      setError(null)
      const storedUser = localStorage.getItem("user")
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser)
        setUserData(parsedUser)

        // Check if the user is a student
        if (parsedUser.role === "student" && parsedUser.id) {
          try {
            const response = await fetch(`/api/analytics?studentId=${parsedUser.id}`)
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`)
            }
            const result = await response.json()
            if (result.success) {
              setStudentAnalytics(result.data)
            } else {
              setError(result.error || "Failed to fetch student analytics data.")
            }
          } catch (err) {
            console.error("Error fetching student analytics:", err)
            setError("Failed to load analytics data. Please try again.")
          } finally {
            setLoading(false)
          }
        } else {
          // Handle non-student roles or missing student ID if needed
          setLoading(false)
        }
      } else {
        setLoading(false)
        setError("User data not found. Please log in.")
      }
    }

    fetchAnalyticsData()
  }, []) // Empty dependency array means this runs once on mount

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">Performance Analytics</h2>
        <p className="text-muted-foreground">Loading analytics data...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">Performance Analytics</h2>
        <p className="text-red-500">Error: {error}</p>
      </div>
    )
  }

  // Render student-specific analytics if data is available and user is a student
  if (userData?.role === "student" && studentAnalytics) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Performance Analytics</h2>
          <p className="text-muted-foreground">Analyze your academic performance with detailed insights</p>
        </div>

        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Attendance Trend</CardTitle>
                <CardDescription>Your attendance patterns over time</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                {studentAnalytics.attendanceTrend && studentAnalytics.attendanceTrend.length > 0 ? (
                  <AttendanceChart data={studentAnalytics.attendanceTrend} />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No attendance data available for trend.
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Grade Distribution</CardTitle>
                <CardDescription>Distribution of your grades</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                {studentAnalytics.gradeDistribution && studentAnalytics.gradeDistribution.length > 0 ? (
                  <GradeDistributionChart data={studentAnalytics.gradeDistribution} />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No grade distribution data available.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Existing insights/recommendations can be made dynamic based on studentAnalytics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Performance Insights</CardTitle>
              <CardDescription>Data-driven insights based on your performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-lg border p-3">
                  <h4 className="font-medium">Overall Attendance</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your overall attendance is {studentAnalytics.attendance.toFixed(2)}%. Consistent attendance is key
                    to success.
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <h4 className="font-medium">Average Marks</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your average performance across assessments is {studentAnalytics.performance.average.toFixed(2)}%.
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <h4 className="font-medium">Performance Trend</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your performance trend shows{" "}
                    {studentAnalytics.performance.trend.length > 1
                      ? studentAnalytics.performance.trend[studentAnalytics.performance.trend.length - 1] >
                        studentAnalytics.performance.trend[0]
                        ? "an upward trend"
                        : "a stable or downward trend"
                      : "consistent performance"}
                    .
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Improvement Areas</CardTitle>
              <CardDescription>Specific areas for improvement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-lg border p-3">
                  <h4 className="font-medium">Data Structures & Algorithms</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your quiz scores indicate challenges with graph algorithms and dynamic programming. The upcoming
                    assignments will focus on these topics - consider reviewing the supplementary materials.
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <h4 className="font-medium">Attendance Consistency</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your attendance pattern shows gaps on Mondays and Fridays. These days contain critical content that
                    appears frequently in assessments.
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <h4 className="font-medium">Assessment Preparation</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your performance in surprise quizzes is 15% lower than in scheduled assessments. Regular review of
                    class materials can help close this gap.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
              <CardDescription>Actionable suggestions for better performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-lg border p-3">
                  <h4 className="font-medium">Targeted Resources</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Based on your performance data, we recommend the supplementary materials for Data Structures
                    available in the Study Materials section. Focus on Chapters 4-6 on graph algorithms.
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <h4 className="font-medium">Peer Collaboration</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Students with similar profiles have shown 12% improvement when participating in the weekly
                    problem-solving sessions. The next session is on Wednesday at 4 PM.
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <h4 className="font-medium">Assessment Strategy</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your performance data suggests you perform better on morning assessments. When possible, schedule
                    your optional assessments before noon for optimal results.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Fallback for other roles or if student data is not available
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Performance Analytics</h2>
        <p className="text-muted-foreground">Analyze academic performance with detailed insights</p>
      </div>
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        Analytics data not available for your role or no data to display.
      </div>
    </div>
  )
}
