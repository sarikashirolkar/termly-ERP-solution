"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface ReportPreviewProps {
  data: {
    courseInfo: {
      name: string
      code: string
      semester: string
      faculty: string
      academicYear: string
      targetLevel: string
    }
    courseOutcomes: Array<{
      id: string
      description: string
    }>
    attainment: Array<{
      co: string
      cie: number
      cieLevel: number
      use: number
      useLevel: number
      ces: number
      attainment: number
    }>
    averageGrade: number
    averageAttainment: number
    weightage: {
      cie: number
      use: number
      ces: number
    }
    cesData: {
      questions: number
      studentsResponded: number
      responses: number
      totalResponseValue: number
    }
  }
  onDownload?: () => void
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top" as const,
      display: true,
    },
    tooltip: {
      enabled: true,
    },
  },
  scales: {
    y: {
      min: 0,
      max: 3,
      ticks: {
        stepSize: 0.5,
      },
      grid: {
        display: true,
      },
    },
    x: {
      grid: {
        display: false,
      },
    },
  },
}

export default function ReportPreview({ data, onDownload }: ReportPreviewProps) {
  return (
    <Card className="mt-6 bg-white dark:bg-slate-900 border shadow-sm">
      <CardContent className="p-6">
        {/* Header Section */}
        <div className="border text-center p-4 mb-6">
          <h2 className="text-xl font-bold">Sai Vidya Institute of Technology</h2>
          <p className="text-sm">
            Accredited by NAAC with "A" Grade and NBA Accredited UG Programs (CSE, ISE, ECE, EEE, ME, CV)
          </p>
          <p className="text-sm">Department of Electronics and Communication Engineering</p>
          <p className="text-sm">Indiranagar, Bangalore-08</p>
          <p className="font-semibold mt-2">Attainment Sheet</p>
        </div>

        {/* Course Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="border p-3">
            <p className="text-sm text-gray-500">Course Name</p>
            <p className="font-semibold">{data.courseInfo.name}</p>
          </div>
          <div className="border p-3">
            <p className="text-sm text-gray-500">Target Level</p>
            <p className="font-semibold">{data.courseInfo.targetLevel}</p>
          </div>
          <div className="border p-3">
            <p className="text-sm text-gray-500">Course Code</p>
            <p className="font-semibold">{data.courseInfo.code}</p>
          </div>
          <div className="border p-3">
            <p className="text-sm text-gray-500">Semester</p>
            <p className="font-semibold">{data.courseInfo.semester}</p>
          </div>
          <div className="border p-3">
            <p className="text-sm text-gray-500">Faculty</p>
            <p className="font-semibold">{data.courseInfo.faculty}</p>
          </div>
          <div className="border p-3">
            <p className="text-sm text-gray-500">Academic Year</p>
            <p className="font-semibold">{data.courseInfo.academicYear}</p>
          </div>
        </div>

        {/* Course Outcomes */}
        <div className="mb-6">
          <div className="border p-3 bg-blue-50 dark:bg-blue-900/20 font-semibold mb-2">Course Outcomes</div>
          <table className="w-full border-collapse">
            <tbody>
              {data.courseOutcomes.map((co) => (
                <tr key={co.id} className="border">
                  <td className="border p-2 w-16 font-semibold">{co.id}</td>
                  <td className="border p-2">{co.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* CO Attainment */}
        <div className="mb-6">
          <div className="border p-3 bg-blue-50 dark:bg-blue-900/20 font-semibold mb-2">CO Attainment</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-800">
                    <th className="border p-2">Course Outcome</th>
                    <th className="border p-2">CIE/IA</th>
                    <th className="border p-2">Level</th>
                    <th className="border p-2">UE/SEE</th>
                    <th className="border p-2">Level</th>
                    <th className="border p-2">CES</th>
                    <th className="border p-2">Attainment</th>
                  </tr>
                </thead>
                <tbody>
                  {data.attainment.map((item) => (
                    <tr key={item.co}>
                      <td className="border p-2">{item.co}</td>
                      <td className="border p-2">{item.cie.toFixed(2)}</td>
                      <td className="border p-2">{item.cieLevel}</td>
                      <td className="border p-2">{item.use.toFixed(2)}</td>
                      <td className="border p-2">{item.useLevel.toFixed(2)}</td>
                      <td className="border p-2">{item.ces.toFixed(2)}</td>
                      <td className="border p-2">{item.attainment.toFixed(1)}</td>
                    </tr>
                  ))}
                  <tr>
                    <td className="border p-2 font-semibold">Average Grade</td>
                    <td className="border p-2" colSpan={6}>
                      {data.averageGrade}
                    </td>
                  </tr>
                  <tr>
                    <td className="border p-2 font-semibold">Average CO Attainment</td>
                    <td className="border p-2" colSpan={6}>
                      {data.averageAttainment.toFixed(1)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div style={{ height: "300px" }}>
              <div className="border p-3 bg-blue-50 dark:bg-blue-900/20 font-semibold mb-2">Attainment Chart</div>
              <div className="h-64 border p-4">
                <div className="w-full h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.attainment.map((co) => ({
                        name: co.co,
                        attainment: co.attainment || co.attainment === 0 ? Number(co.attainment.toFixed(2)) : 2.1,
                      }))}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 3]} ticks={[0, 0.5, 1, 1.5, 2, 2.5, 3]} />
                      <Tooltip
                        formatter={(value) => [`CO Attainment: ${value}`, ""]}
                        labelStyle={{ color: "#6b7280" }}
                        contentStyle={{ backgroundColor: "#374151", border: "none", borderRadius: "0.375rem" }}
                        itemStyle={{ color: "white" }}
                      />
                      <Legend />
                      <Bar dataKey="attainment" name="CO Attainment" fill="#60a5fa" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Attainment Level */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <div className="border p-3 bg-blue-50 dark:bg-blue-900/20 font-semibold mb-2">Attainment Level</div>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800">
                  <th className="border p-2">%</th>
                  <th className="border p-2">Target</th>
                  <th className="border p-2">Level</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-2">60-70</td>
                  <td className="border p-2">60-70 marks scored</td>
                  <td className="border p-2">3.00</td>
                </tr>
                <tr>
                  <td className="border p-2">50-60</td>
                  <td className="border p-2">50-60 marks scored</td>
                  <td className="border p-2">2.00</td>
                </tr>
                <tr>
                  <td className="border p-2">40-50</td>
                  <td className="border p-2">40-50 marks scored</td>
                  <td className="border p-2">1.00</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <div className="border p-3 bg-blue-50 dark:bg-blue-900/20 font-semibold mb-2">Weightage</div>
            <table className="w-full border-collapse">
              <tbody>
                <tr>
                  <td className="border p-2">CIE</td>
                  <td className="border p-2">{data.weightage.cie.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="border p-2">UE</td>
                  <td className="border p-2">{data.weightage.use.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="border p-2">CES</td>
                  <td className="border p-2">{data.weightage.ces.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <div className="border p-3 bg-blue-50 dark:bg-blue-900/20 font-semibold mb-2">Course End Survey</div>
            <table className="w-full border-collapse">
              <tbody>
                <tr>
                  <td className="border p-2">No. of Questions</td>
                  <td className="border p-2">{data.cesData.questions}</td>
                </tr>
                <tr>
                  <td className="border p-2">No. of Students Responded</td>
                  <td className="border p-2">{data.cesData.studentsResponded.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="border p-2">No. of Responses</td>
                  <td className="border p-2">{data.cesData.responses.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="border p-2">Total Response Value</td>
                  <td className="border p-2">{data.cesData.totalResponseValue.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Download Button */}
        {onDownload && (
          <div className="flex justify-end mt-6">
            <Button onClick={onDownload} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download Report
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
