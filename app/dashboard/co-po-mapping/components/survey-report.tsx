"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"

interface SurveyReportProps {
  report: {
    questionText: string
    averageRating: number
    responseCount: number
    courseOutcome?: string
  }[]
}

const SurveyReport = ({ report }: SurveyReportProps) => {
  // Calculate overall average
  const overallAverage =
    report.length > 0 ? report.reduce((sum, item) => sum + item.averageRating, 0) / report.length : 0

  // Group by course outcome
  const courseOutcomeData: Record<string, { sum: number; count: number }> = {}

  report.forEach((item) => {
    if (item.courseOutcome) {
      if (!courseOutcomeData[item.courseOutcome]) {
        courseOutcomeData[item.courseOutcome] = { sum: 0, count: 0 }
      }
      courseOutcomeData[item.courseOutcome].sum += item.averageRating
      courseOutcomeData[item.courseOutcome].count += 1
    }
  })

  const courseOutcomeAverages = Object.entries(courseOutcomeData).map(([outcome, data]) => ({
    outcome,
    average: data.count > 0 ? data.sum / data.count : 0,
  }))

  return (
    <div className="space-y-6 mt-4">
      <Card>
        <CardHeader>
          <CardTitle>Overall Survey Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Overall Average Rating</span>
                <span className="text-sm font-medium">{overallAverage.toFixed(2)} / 5</span>
              </div>
              <Progress value={overallAverage * 20} className="h-2" />
            </div>

            <div className="text-sm text-muted-foreground">Based on {report[0]?.responseCount || 0} responses</div>
          </div>
        </CardContent>
      </Card>

      {courseOutcomeAverages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Course Outcome Averages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {courseOutcomeAverages.map((item) => (
                <div key={item.outcome}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">{item.outcome}</span>
                    <span className="text-sm font-medium">{item.average.toFixed(2)} / 5</span>
                  </div>
                  <Progress value={item.average * 20} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Detailed Question Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Question</TableHead>
                <TableHead>Average Rating</TableHead>
                <TableHead>Course Outcome</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {report.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.questionText}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Progress value={item.averageRating * 20} className="h-2 w-24" />
                      <span>{item.averageRating.toFixed(2)}</span>
                    </div>
                  </TableCell>
                  <TableCell>{item.courseOutcome || "N/A"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

export default SurveyReport
