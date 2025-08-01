"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface CourseConfigurationProps {
  courseCode: string
  setCourseCode: (value: string) => void
  courseName: string
  setCourseName: (value: string) => void
  semester: string
  setSemester: (value: string) => void
  faculty: string
  setFaculty: (value: string) => void
}

export default function CourseConfiguration({
  courseCode,
  setCourseCode,
  courseName,
  setCourseName,
  semester,
  setSemester,
  faculty,
  setFaculty,
}: CourseConfigurationProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="course-code">Course Code</Label>
            <Input
              id="course-code"
              value={courseCode}
              onChange={(e) => setCourseCode(e.target.value)}
              placeholder="e.g., CS101"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="course-name">Course Name</Label>
            <Input
              id="course-name"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              placeholder="e.g., Introduction to Computer Science"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="semester">Semester</Label>
            <Input
              id="semester"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              placeholder="e.g., Fall 2023"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="faculty">Faculty</Label>
            <Input
              id="faculty"
              value={faculty}
              onChange={(e) => setFaculty(e.target.value)}
              placeholder="e.g., Dr. John Doe"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
