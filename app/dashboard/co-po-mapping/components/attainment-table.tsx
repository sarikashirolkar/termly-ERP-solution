"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import type { CourseOutcome, AssessmentComponent, StudentMark } from "../types"

interface AttainmentTableProps {
  courseOutcomes: CourseOutcome[]
  assessmentComponents: AssessmentComponent[]
  studentMarks: StudentMark[]
  onMarkChange: (studentId: string, componentId: string, coId: string, value: string) => void
}

export function AttainmentTable({
  courseOutcomes,
  assessmentComponents,
  studentMarks,
  onMarkChange,
}: AttainmentTableProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newStudentId, setNewStudentId] = useState("")
  const [newStudentName, setNewStudentName] = useState("")

  const handleAddStudent = () => {
    if (!newStudentId || !newStudentName) return

    const newStudent: StudentMark = {
      studentId: newStudentId,
      studentName: newStudentName,
      marks: {},
    }

    onMarkChange(newStudentId, "", "", "")

    setNewStudentId("")
    setNewStudentName("")
    setDialogOpen(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Student Marks</h3>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add Student</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Student</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="studentId">Student ID</Label>
                <Input
                  id="studentId"
                  value={newStudentId}
                  onChange={(e) => setNewStudentId(e.target.value)}
                  placeholder="e.g., S001"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="studentName">Student Name</Label>
                <Input
                  id="studentName"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="e.g., John Doe"
                />
              </div>

              <div className="flex justify-end">
                <Button variant="outline" className="mr-2" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddStudent}>Add</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-md">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted dark:bg-slate-800">
                <th className="p-2 text-left font-medium dark:bg-slate-700 dark:text-white dark:border-slate-600 border">
                  Student ID
                </th>
                <th className="p-2 text-left font-medium dark:bg-slate-700 dark:text-white dark:border-slate-600 border">
                  Student Name
                </th>

                {assessmentComponents.map((component) =>
                  courseOutcomes.map((co) => (
                    <th
                      key={`${component.id}-${co.id}`}
                      className="p-2 text-center font-medium dark:bg-slate-700 dark:text-white dark:border-slate-600 border"
                    >
                      {component.name} - {co.code}
                    </th>
                  )),
                )}
              </tr>
            </thead>

            <tbody>
              {studentMarks.map((student) => (
                <tr key={student.studentId} className="border-t dark:border-slate-600">
                  <td className="p-2 dark:bg-slate-800/90 dark:text-white dark:border-slate-600 border">
                    {student.studentId}
                  </td>
                  <td className="p-2 dark:bg-slate-800/90 dark:text-white dark:border-slate-600 border">
                    {student.studentName}
                  </td>

                  {assessmentComponents.map((component) =>
                    courseOutcomes.map((co) => {
                      const markKey = `${component.id}-${co.id}`
                      const mark = student.marks[markKey] || ""

                      return (
                        <td
                          key={markKey}
                          className="p-2 dark:bg-slate-800/90 dark:text-white dark:border-slate-600 border"
                        >
                          <Input
                            type="number"
                            min="0"
                            max={component.maxMarks}
                            value={mark}
                            onChange={(e) => onMarkChange(student.studentId, component.id, co.id, e.target.value)}
                            className="w-16 text-center mx-auto dark:bg-slate-700 dark:text-white dark:border-slate-500 dark:focus:border-slate-400"
                          />
                        </td>
                      )
                    }),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {studentMarks.length === 0 && (
          <div className="p-4 text-center text-muted-foreground">
            No students added yet. Click "Add Student" to begin.
          </div>
        )}
      </div>
    </div>
  )
}
