"use client"

import { Skeleton } from "@/components/ui/skeleton"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAuth } from "@/lib/auth"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { subjectService } from "@/lib/supabase-service"

interface AssignmentMark {
  id: string
  subjectName: string
  assignmentName: string
  marksObtained: number
  maxMarks: number
  percentage: string
}

export default function StudentAssignmentMarksPage() {
  const { user } = useAuth()
  const [assignmentMarks, setAssignmentMarks] = useState<AssignmentMark[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchMarks = async () => {
      if (!user?.id) {
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        // In a real application, you would fetch marks specific to the logged-in student
        // For now, we'll use mock data and filter by a mock student ID
        const mockStudentId = user.id // Assuming user.id can be used as studentId for mock data
        const allSubjects = await subjectService.getAll() // Fetch all subjects to get names

        const mockMarksData = [
          {
            id: "1",
            studentId: "student123",
            subjectId: "sub1",
            assignmentName: "Quiz 1",
            marksObtained: 8,
            maxMarks: 10,
          },
          {
            id: "2",
            studentId: "student123",
            subjectId: "sub2",
            assignmentName: "Midterm Exam",
            marksObtained: 75,
            maxMarks: 100,
          },
          {
            id: "3",
            studentId: "student456",
            subjectId: "sub1",
            assignmentName: "Quiz 1",
            marksObtained: 9,
            maxMarks: 10,
          },
        ]

        const studentSpecificMarks = mockMarksData.filter((mark) => mark.studentId === mockStudentId)

        const formattedMarks: AssignmentMark[] = studentSpecificMarks.map((mark) => {
          const subject = allSubjects.find((s) => s.id === mark.subjectId)
          const subjectName = subject ? subject.name : "Unknown Subject"
          const percentage = ((mark.marksObtained / mark.maxMarks) * 100).toFixed(2) + "%"
          return {
            id: mark.id,
            subjectName,
            assignmentName: mark.assignmentName,
            marksObtained: mark.marksObtained,
            maxMarks: mark.maxMarks,
            percentage,
          }
        })

        setAssignmentMarks(formattedMarks)
      } catch (error) {
        console.error("Error fetching assignment marks:", error)
        toast({
          title: "Error",
          description: "Failed to load your assignment marks.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    fetchMarks()
  }, [user?.id, toast])

  if (loading) {
    return (
      <div className="grid gap-6 p-6 md:p-8">
        <h1 className="text-3xl font-bold">My Assignment Marks</h1>
        <Card>
          <CardHeader>
            <CardTitle>Assignment Marks Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Skeleton className="h-4 w-24" />
                  </TableHead>
                  <TableHead>
                    <Skeleton className="h-4 w-24" />
                  </TableHead>
                  <TableHead>
                    <Skeleton className="h-4 w-24" />
                  </TableHead>
                  <TableHead>
                    <Skeleton className="h-4 w-16" />
                  </TableHead>
                  <TableHead>
                    <Skeleton className="h-4 w-16" />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[1, 2, 3].map((i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid gap-6 p-6 md:p-8">
      <h1 className="text-3xl font-bold">My Assignment Marks</h1>

      <Card>
        <CardHeader>
          <CardTitle>Assignment Marks Overview</CardTitle>
        </CardHeader>
        <CardContent>
          {assignmentMarks.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">No assignment marks available yet.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Assignment</TableHead>
                  <TableHead>Marks Obtained</TableHead>
                  <TableHead>Max Marks</TableHead>
                  <TableHead>Percentage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignmentMarks.map((mark) => (
                  <TableRow key={mark.id}>
                    <TableCell className="font-medium">{mark.subjectName}</TableCell>
                    <TableCell>{mark.assignmentName}</TableCell>
                    <TableCell>{mark.marksObtained}</TableCell>
                    <TableCell>{mark.maxMarks}</TableCell>
                    <TableCell>{mark.percentage}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
