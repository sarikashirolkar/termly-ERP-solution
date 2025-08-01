"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

interface AssessmentConfigFormProps {
  onGenerate: (config: {
    numIAs: number
    numAssignments: number
    numQuizzes: number
    courseCode: string
    courseName: string
  }) => void
}

export function AssessmentConfigForm({ onGenerate }: AssessmentConfigFormProps) {
  const [numIAs, setNumIAs] = useState(3)
  const [numAssignments, setNumAssignments] = useState(2)
  const [numQuizzes, setNumQuizzes] = useState(2)
  const [courseCode, setCourseCode] = useState("21EC63")
  const [courseName, setCourseName] = useState("VLSI Design & Testing")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onGenerate({
      numIAs,
      numAssignments,
      numQuizzes,
      courseCode,
      courseName,
    })
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="courseCode">Course Code</Label>
              <Input
                id="courseCode"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                placeholder="Enter course code"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="courseName">Course Name</Label>
              <Input
                id="courseName"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                placeholder="Enter course name"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="numIAs">Number of Internal Assessments (IAs)</Label>
              <Select value={numIAs.toString()} onValueChange={(value) => setNumIAs(Number.parseInt(value))}>
                <SelectTrigger id="numIAs">
                  <SelectValue placeholder="Select number of IAs" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="numAssignments">Number of Assignments</Label>
              <Select
                value={numAssignments.toString()}
                onValueChange={(value) => setNumAssignments(Number.parseInt(value))}
              >
                <SelectTrigger id="numAssignments">
                  <SelectValue placeholder="Select number of assignments" />
                </SelectTrigger>
                <SelectContent>
                  {[0, 1, 2, 3, 4, 5].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="numQuizzes">Number of Quizzes</Label>
              <Select value={numQuizzes.toString()} onValueChange={(value) => setNumQuizzes(Number.parseInt(value))}>
                <SelectTrigger id="numQuizzes">
                  <SelectValue placeholder="Select number of quizzes" />
                </SelectTrigger>
                <SelectContent>
                  {[0, 1, 2, 3, 4, 5].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit">Generate Attainment Table</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
