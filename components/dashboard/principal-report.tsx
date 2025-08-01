"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart, LineChart, Users, BookOpen, GraduationCap, Award } from "lucide-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, Line, XAxis, YAxis, CartesianGrid } from "recharts"

interface PrincipalReportProps {
  overallStats: {
    totalStudents: number
    totalFaculty: number
    totalDepartments: number
    averageAttendance: number
    averagePerformance: number
  }
  departmentStats: {
    department: string
    total_students: number
    total_faculty: number
    average_cgpa: number
    average_attendance: number
  }[]
  performanceData: { name: string; score: number }[]
  attendanceData: { month: string; percentage: number }[]
}

export function PrincipalReport({
  overallStats,
  departmentStats,
  performanceData,
  attendanceData,
}: PrincipalReportProps) {
  return (
    <div className="grid gap-6 p-6 md:p-8">
      <h1 className="text-3xl font-bold">Principal's Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallStats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Faculty</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallStats.totalFaculty}</div>
            <p className="text-xs text-muted-foreground">+15% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Departments</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallStats.totalDepartments}</div>
            <p className="text-xs text-muted-foreground">+5% from last year</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Performance</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallStats.averagePerformance}%</div>
            <p className="text-xs text-muted-foreground">+3.2% from last semester</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Overall Performance Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{ score: { label: "Score", color: "hsl(var(--primary))" } }}>
              <BarChart accessibilityLayer data={performanceData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} />
                <YAxis domain={[0, 100]} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Bar dataKey="score" fill="var(--color-score)" radius={8} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Overall Attendance Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{ percentage: { label: "Percentage", color: "hsl(var(--primary))" } }}>
              <LineChart accessibilityLayer data={attendanceData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                <YAxis domain={[0, 100]} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Line
                  dataKey="percentage"
                  type="monotone"
                  stroke="var(--color-percentage)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Departmental Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Department</TableHead>
                <TableHead>Total Students</TableHead>
                <TableHead>Total Faculty</TableHead>
                <TableHead>Avg. CGPA</TableHead>
                <TableHead>Avg. Attendance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departmentStats.map((dept) => (
                <TableRow key={dept.department}>
                  <TableCell className="font-medium">{dept.department}</TableCell>
                  <TableCell>{dept.total_students}</TableCell>
                  <TableCell>{dept.total_faculty}</TableCell>
                  <TableCell>{dept.average_cgpa.toFixed(2)}</TableCell>
                  <TableCell>{dept.average_attendance.toFixed(2)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
