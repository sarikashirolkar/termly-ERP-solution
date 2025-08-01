"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { calculateCGPA, getGradePoint } from "@/lib/cgpa-calculator"
import { Trash2 } from "lucide-react"

interface GradeInput {
  id: number
  grade: string
  credits: number
}

export function CGPACalculator() {
  const [grades, setGrades] = useState<GradeInput[]>([{ id: 1, grade: "", credits: 0 }])
  const [cgpa, setCgpa] = useState<number | null>(null)
  const [nextId, setNextId] = useState(2)

  const handleGradeChange = (id: number, field: keyof GradeInput, value: string | number) => {
    setGrades((prevGrades) => prevGrades.map((g) => (g.id === id ? { ...g, [field]: value } : g)))
  }

  const addGradeInput = () => {
    setGrades((prevGrades) => [...prevGrades, { id: nextId, grade: "", credits: 0 }])
    setNextId((prevId) => prevId + 1)
  }

  const removeGradeInput = (id: number) => {
    setGrades((prevGrades) => prevGrades.filter((g) => g.id !== id))
  }

  const calculate = () => {
    const validGrades = grades
      .filter((g) => g.grade && g.credits > 0)
      .map((g) => ({
        gradePoint: getGradePoint(g.grade),
        credits: g.credits,
      }))

    if (validGrades.length > 0) {
      setCgpa(calculateCGPA(validGrades))
    } else {
      setCgpa(0)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>CGPA Calculator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {grades.map((g, index) => (
            <div key={g.id} className="flex items-end gap-4">
              <div className="flex-1 grid gap-2">
                <Label htmlFor={`grade-${g.id}`}>Subject {index + 1} Grade</Label>
                <Select value={g.grade} onValueChange={(value) => handleGradeChange(g.id, "grade", value)}>
                  <SelectTrigger id={`grade-${g.id}`}>
                    <SelectValue placeholder="Select Grade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="S">S (10)</SelectItem>
                    <SelectItem value="A">A (9)</SelectItem>
                    <SelectItem value="B">B (8)</SelectItem>
                    <SelectItem value="C">C (7)</SelectItem>
                    <SelectItem value="D">D (6)</SelectItem>
                    <SelectItem value="E">E (5)</SelectItem>
                    <SelectItem value="F">F (0)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 grid gap-2">
                <Label htmlFor={`credits-${g.id}`}>Credits</Label>
                <Input
                  id={`credits-${g.id}`}
                  type="number"
                  value={g.credits === 0 ? "" : g.credits}
                  onChange={(e) => handleGradeChange(g.id, "credits", Number.parseInt(e.target.value) || 0)}
                  min="0"
                />
              </div>
              {grades.length > 1 && (
                <Button variant="ghost" size="icon" onClick={() => removeGradeInput(g.id)}>
                  <Trash2 className="h-5 w-5 text-red-500" />
                  <span className="sr-only">Remove grade</span>
                </Button>
              )}
            </div>
          ))}
        </div>
        <Button variant="outline" onClick={addGradeInput} className="w-full bg-transparent">
          Add Another Subject
        </Button>
        <Button onClick={calculate} className="w-full">
          Calculate CGPA
        </Button>
        {cgpa !== null && (
          <div className="text-center text-2xl font-bold mt-6">
            Your CGPA: <span className="text-primary">{cgpa}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
