"use client"

import { Skeleton } from "@/components/ui/skeleton"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { subjectService, studentService } from "@/lib/supabase-service"
import type { Subject, StudentProfile } from "@/lib/database-schema"
import { useAuth } from "@/lib/auth"

interface AssignmentMark {
  id: string
  studentId: string
  studentName: string
  subjectId: string
  subjectName: string
  assignmentName: string
  marksObtained: number
  maxMarks: number
}

export default function AssignmentMarksPage() {
  const { user } = useAuth()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [students, setStudents] = useState<StudentProfile[]>([])
  const [selectedSubject, setSelectedSubject] = useState<string>("")
  const [selectedStudent, setSelectedStudent] = useState<string>("")
  const [assignmentName, setAssignmentName] = useState("")
  const [marksObtained, setMarksObtained] = useState<number | "">("")
  const [maxMarks, setMaxMarks] = useState<number | "">("")
  const [assignmentMarks, setAssignmentMarks] = useState<AssignmentMark[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [subjectsData, studentsData] = await Promise.all([subjectService.getAll(), studentService.getAll()])
        setSubjects(subjectsData)
        setStudents(studentsData)
        // In a real app, you'd fetch existing assignment marks here
        setAssignmentMarks([
          {
            id: "1",
            studentId: "s1",
            studentName: "Alice Smith",
            subjectId: "sub1",
            subjectName: "Math",
            assignmentName: "Homework 1",
            marksObtained: 18,
            maxMarks: 20,
          },
          {
            id: "2",
            studentId: "s2",
            studentName: "Bob Johnson",
            subjectId: "sub1",
            subjectName: "Math",
            assignmentName: "Homework 1",
            marksObtained: 15,
            maxMarks: 20,
          },
        ])
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load data for assignment marks.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [toast])

  const handleAddMark = async () => {
    if (!selectedSubject || !selectedStudent || !assignmentName || marksObtained === "" || maxMarks === "") {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields.",
        variant: "destructive",
      })
      return
    }

    if (marksObtained > maxMarks) {
      toast({
        title: "Invalid Marks",
        description: "Marks obtained cannot be greater than maximum marks.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      // Simulate API call to add assignment mark
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const newMark: AssignmentMark = {
        id: String(assignmentMarks.length + 1), // Mock ID
        studentId: selectedStudent,
        studentName: students.find((s) => s.id === selectedStudent)?.name || "Unknown Student",
        subjectId: selectedSubject,
        subjectName: subjects.find((s) => s.id === selectedSubject)?.name || "Unknown Subject",
        assignmentName,
        marksObtained: Number(marksObtained),
        maxMarks: Number(maxMarks),
      }
      setAssignmentMarks((prev) => [...prev, newMark])

      toast({
        title: "Success",
        description: "Assignment mark added successfully.",
      })
      // Reset form
      setSelectedStudent("")
      setAssignmentName("")
      setMarksObtained("")
      setMaxMarks("")
    } catch (error) {
      console.error("Error adding assignment mark:", error)
      toast({
        title: "Error",
        description: "Failed to add assignment mark. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="grid gap-6 p-6 md:p-8">
        <h1 className="text-3xl font-bold">Assignment Marks</h1>
        <Card>
          <CardHeader>
            <CardTitle>Add Assignment Marks</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-full" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-48" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>All Assignment Marks</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Skeleton className="h-4 w-20" />
                  </TableHead>
                  <TableHead>
                    <Skeleton className="h-4 w-20" />
                  </TableHead>
                  <TableHead>
                    <Skeleton className="h-4 w-20" />
                  </TableHead>
                  <TableHead>
                    <Skeleton className="h-4 w-20" />
                  </TableHead>
                  <TableHead>
                    <Skeleton className="h-4 w-20" />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[1, 2, 3].map((i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
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
      <h1 className="text-3xl font-bold">Assignment Marks</h1>

      <Card>
        <CardHeader>
          <CardTitle>Add Assignment Marks</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject} disabled={isSubmitting}>
                <SelectTrigger id="subject">
                  <SelectValue placeholder="Select Subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name} ({subject.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="student">Student</Label>
              <Select value={selectedStudent} onValueChange={setSelectedStudent} disabled={isSubmitting}>
                <SelectTrigger id="student">
                  <SelectValue placeholder="Select Student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name} ({student.enrollment_number})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="assignmentName">Assignment Name</Label>
            <Input
              id="assignmentName"
              value={assignmentName}
              onChange={(e) => setAssignmentName(e.target.value)}
              placeholder="e.g., Homework 1, Midterm Project"
              disabled={isSubmitting}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="marksObtained">Marks Obtained</Label>
              <Input
                id="marksObtained"
                type="number"
                value={marksObtained}
                onChange={(e) => setMarksObtained(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="e.g., 15"
                min={0}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxMarks">Maximum Marks</Label>
              <Input
                id="maxMarks"
                type="number"
                value={maxMarks}
                onChange={(e) => setMaxMarks(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="e.g., 20"
                min={0}
                disabled={isSubmitting}
              />
            </div>
          </div>
          <Button onClick={handleAddMark} disabled={isSubmitting}>
            {isSubmitting ? "Adding..." : "Add Mark"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Assignment Marks</CardTitle>
        </CardHeader>
        <CardContent>
          {assignmentMarks.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">No assignment marks recorded yet.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Assignment</TableHead>
                  <TableHead>Marks</TableHead>
                  <TableHead>Percentage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignmentMarks.map((mark) => (
                  <TableRow key={mark.id}>
                    <TableCell className="font-medium">{mark.studentName}</TableCell>
                    <TableCell>{mark.subjectName}</TableCell>
                    <TableCell>{mark.assignmentName}</TableCell>
                    <TableCell>
                      {mark.marksObtained} / {mark.maxMarks}
                    </TableCell>
                    <TableCell>{((mark.marksObtained / mark.maxMarks) * 100).toFixed(2)}%</TableCell>
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
