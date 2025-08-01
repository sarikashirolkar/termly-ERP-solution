"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

type BranchData = {
  branch: string
  average: number
  studentCount: number
}

interface BranchPerformanceChartProps {
  data: { branch: string; averageScore: number }[]
}

export function BranchPerformanceChart({ data }: BranchPerformanceChartProps) {
  const [attendanceData, setAttendanceData] = useState<BranchData[]>([])
  const [marksData, setMarksData] = useState<BranchData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/analytics?metric=branchAnalytics")
        const analyticsData = await response.json()
        setAttendanceData(analyticsData.attendanceByBranch || [])
        setMarksData(analyticsData.marksByBranch || [])
      } catch (error) {
        console.error("Failed to fetch branch analytics:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Format data for charts
  const formattedAttendanceData = attendanceData.map((item) => ({
    branch: item.branch,
    averageScore: Number.parseFloat(item.average.toFixed(1)),
  }))

  const formattedMarksData = marksData.map((item) => ({
    branch: item.branch,
    averageScore: Number.parseFloat(item.average.toFixed(1)),
  }))

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Branch Performance Comparison</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <div className="animate-pulse w-full h-full bg-muted/50 rounded-md"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Branch Performance Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{ averageScore: { label: "Average Score", color: "hsl(var(--primary))" } }}>
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="branch" tickLine={false} tickMargin={10} axisLine={false} />
            <YAxis domain={[0, 100]} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Bar dataKey="averageScore" fill="var(--color-averageScore)" radius={8} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
