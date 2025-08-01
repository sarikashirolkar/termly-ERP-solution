"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Achievement } from "@/lib/database-schema"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"

interface PrincipalAchievementChartsProps {
  achievements: Achievement[]
}

export function PrincipalAchievementCharts({ achievements }: PrincipalAchievementChartsProps) {
  const [chartView, setChartView] = useState("department")

  // Process data for department chart with more balanced mock data
  const departmentData = [
    { name: "CSE", value: 45 },
    { name: "CSE(AIML)", value: 32 },
    { name: "CSE(DS)", value: 38 },
    { name: "ISE", value: 28 },
    { name: "ECE", value: 22 },
  ]

  // Process data for category chart
  const categoryData = [
    { name: "Academic", value: achievements.filter((a) => a.category === "academic").length },
    { name: "Technical", value: achievements.filter((a) => a.category === "technical").length },
    { name: "Sports", value: achievements.filter((a) => a.category === "sports").length },
    { name: "Cultural", value: achievements.filter((a) => a.category === "cultural").length },
    { name: "Other", value: achievements.filter((a) => a.category === "other").length },
  ].filter((item) => item.value > 0)

  // Process data for verification status
  const verificationData = [
    { name: "Verified", value: achievements.filter((a) => a.verified).length },
    { name: "Pending", value: achievements.filter((a) => !a.verified).length },
  ]

  // Process data for department verification rate with mock data
  const departmentVerificationData = [
    { name: "CSE", rate: 85.5 },
    { name: "CSE(AIML)", rate: 78.2 },
    { name: "CSE(DS)", rate: 92.1 },
    { name: "ISE", rate: 67.8 },
    { name: "ECE", rate: 73.4 },
  ]

  // Process data for trend chart (mock data for demo)
  const trendData = [
    { month: "Jan", achievements: 5 },
    { month: "Feb", achievements: 8 },
    { month: "Mar", achievements: 12 },
    { month: "Apr", achievements: 10 },
    { month: "May", achievements: 15 },
    { month: "Jun", achievements: 20 },
    { month: "Jul", achievements: 18 },
    { month: "Aug", achievements: 22 },
    { month: "Sep", achievements: 25 },
    { month: "Oct", achievements: 30 },
    { month: "Nov", achievements: 28 },
    { month: "Dec", achievements: 35 },
  ]

  // Colors for charts
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d", "#ffc658", "#8dd1e1"]

  return (
    <div className="space-y-6">
      <Tabs defaultValue="department" value={chartView} onValueChange={setChartView}>
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Achievement Analytics</h2>
          <TabsList>
            <TabsTrigger value="department">By Department</TabsTrigger>
            <TabsTrigger value="category">By Category</TabsTrigger>
            <TabsTrigger value="verification">Verification Status</TabsTrigger>
            <TabsTrigger value="trend">Trend Analysis</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="department" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Achievements by Department</CardTitle>
                <CardDescription>Distribution of achievements across departments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={departmentData} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" name="Achievements" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Department Distribution</CardTitle>
                <CardDescription>Percentage of achievements by department</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={departmentData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {departmentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} achievements`, "Count"]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="category" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Achievements by Category</CardTitle>
                <CardDescription>Distribution of achievements across categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" name="Achievements" fill="#00C49F" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
                <CardDescription>Percentage of achievements by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} achievements`, "Count"]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="verification" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Verification Status</CardTitle>
                <CardDescription>Status of achievement verifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={verificationData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        <Cell fill="#4CAF50" />
                        <Cell fill="#FFC107" />
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} achievements`, "Count"]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Department Verification Rate</CardTitle>
                <CardDescription>Verification rates by department</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={departmentVerificationData} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                      <YAxis label={{ value: "Verification Rate (%)", angle: -90, position: "insideLeft" }} />
                      <Tooltip formatter={(value) => [`${value}%`, "Verification Rate"]} />
                      <Legend />
                      <Bar dataKey="rate" name="Verification Rate (%)" fill="#FF8042" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trend" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Achievement Trend Analysis</CardTitle>
              <CardDescription>Monthly trend of achievements over the year</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="achievements"
                      name="Achievements"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
