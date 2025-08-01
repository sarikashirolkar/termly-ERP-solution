"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts"

type OverallAttendanceData = {
  overallAverage: number
  studentAverage: number
  facultyAverage: number
  totalStudents: number
  totalFaculty: number
}

interface OverallAttendanceChartProps {
  data: { month: string; percentage: number }[]
}

export function OverallAttendanceChart({ data }: OverallAttendanceChartProps) {
  const [attendanceData, setAttendanceData] = useState<OverallAttendanceData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/analytics?metric=overallAnalytics")
        const responseData = await response.json()
        setAttendanceData(responseData.overallAttendance || null)
      } catch (error) {
        console.error("Failed to fetch overall attendance:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Overall Attendance Trend</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <div className="animate-pulse w-full h-full bg-muted/50 rounded-md"></div>
        </CardContent>
      </Card>
    )
  }

  if (!attendanceData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Overall Attendance Trend</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">Unable to load attendance data</p>
        </CardContent>
      </Card>
    )
  }

  const chartData = [
    { name: "Students", value: attendanceData.studentAverage, count: attendanceData.totalStudents },
    { name: "Faculty", value: attendanceData.facultyAverage, count: attendanceData.totalFaculty },
  ]

  const COLORS = ["#0088FE", "#00C49F"]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Overall Attendance Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row items-center justify-between mb-4">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <div className="text-3xl font-bold">{attendanceData.overallAverage.toFixed(1)}%</div>
            <div className="text-sm text-muted-foreground">Overall Attendance Rate</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-semibold">{attendanceData.studentAverage.toFixed(1)}%</div>
              <div className="text-xs text-muted-foreground">Student Attendance</div>
              <div className="text-xs font-medium">{attendanceData.totalStudents} Students</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold">{attendanceData.facultyAverage.toFixed(1)}%</div>
              <div className="text-xs text-muted-foreground">Faculty Attendance</div>
              <div className="text-xs font-medium">{attendanceData.totalFaculty} Faculty</div>
            </div>
          </div>
        </div>
        <div className="h-[200px]">
          <ChartContainer config={{ percentage: { label: "Percentage", color: "hsl(var(--primary))" } }}>
            <LineChart accessibilityLayer data={data}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
              <YAxis domain={[0, 100]} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <Line dataKey="percentage" type="monotone" stroke="var(--color-percentage)" strokeWidth={2} dot={false} />
            </LineChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}
