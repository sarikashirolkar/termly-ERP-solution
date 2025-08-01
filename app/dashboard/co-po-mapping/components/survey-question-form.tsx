"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, X } from "lucide-react"

interface SurveyQuestionFormProps {
  onAddQuestion: (question: {
    text: string
    type: string
    options?: string[]
    courseOutcome?: string
  }) => void
}

const SurveyQuestionForm = ({ onAddQuestion }: SurveyQuestionFormProps) => {
  const [questionText, setQuestionText] = useState("")
  const [questionType, setQuestionType] = useState("number")
  const [courseOutcome, setCourseOutcome] = useState("")
  const [options, setOptions] = useState<string[]>([])
  const [newOption, setNewOption] = useState("")

  const handleAddOption = () => {
    if (newOption.trim() === "") return
    setOptions([...options, newOption.trim()])
    setNewOption("")
  }

  const handleRemoveOption = (index: number) => {
    const newOptions = [...options]
    newOptions.splice(index, 1)
    setOptions(newOptions)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (questionText.trim() === "") return

    onAddQuestion({
      text: questionText,
      type: questionType,
      options: questionType === "multiple" ? options : undefined,
      courseOutcome: courseOutcome || undefined,
    })

    // Reset form
    setQuestionText("")
    setQuestionType("number")
    setCourseOutcome("")
    setOptions([])
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="question-text">Question Text</Label>
        <Input
          id="question-text"
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          placeholder="Enter question text"
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="question-type">Question Type</Label>
        <Select value={questionType} onValueChange={setQuestionType}>
          <SelectTrigger id="question-type">
            <SelectValue placeholder="Select question type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="text">Text</SelectItem>
            <SelectItem value="number">Number (1-5 Rating)</SelectItem>
            <SelectItem value="multiple">Multiple Choice</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="course-outcome">Related Course Outcome (Optional)</Label>
        <Input
          id="course-outcome"
          value={courseOutcome}
          onChange={(e) => setCourseOutcome(e.target.value)}
          placeholder="e.g., CO1, CO2"
        />
      </div>

      {questionType === "multiple" && (
        <div className="space-y-2">
          <Label>Options</Label>

          <div className="flex space-x-2">
            <Input value={newOption} onChange={(e) => setNewOption(e.target.value)} placeholder="Add an option" />
            <Button type="button" onClick={handleAddOption} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {options.length > 0 && (
            <div className="space-y-2 mt-2">
              {options.map((option, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md">
                  <span>{option}</span>
                  <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveOption(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <Button type="submit" className="w-full">
        Add Question
      </Button>
    </form>
  )
}

export default SurveyQuestionForm
