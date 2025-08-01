"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Plus } from "lucide-react"

interface Subject {
  id: string
  name: string
  code: string
  credits: number
}

export default function AddSubjectsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [academicYear, setAcademicYear] = useState<string>("")
  const [semester, setSemester] = useState<string>("")
  const [subjectName, setSubjectName] = useState("")
  const [subjectCode, setSubjectCode] = useState("")
  const [credits, setCredits] = useState<string>("3")
  const [isFormValid, setIsFormValid] = useState(false)

  useEffect(() => {
    // Retrieve selected values from localStorage
    const storedYear = localStorage.getItem("selectedAcademicYear")
    const storedSemester = localStorage.getItem("selectedSemester")

    if (!storedYear || !storedSemester) {
      toast({
        title: "Missing Information",
        description: "Please select academic year and semester first",
        variant: "destructive",
      })
      router.push("/dashboard/manage-subjects")
      return
    }

    setAcademicYear(storedYear)
    setSemester(storedSemester)
  }, [router, toast])

  // Validate form
  useEffect(() => {
    setIsFormValid(
      subjectName.trim() !== "" && subjectCode.trim() !== "" && !isNaN(Number(credits)) && Number(credits) > 0,
    )
  }, [subjectName, subjectCode, credits])

  const handleAddSubject = () => {
    if (!isFormValid) return

    // Create a unique storage key for this academic year and semester
    const storageKey = `subjects_${academicYear}_${semester}`

    // Get existing subjects or initialize empty array
    const existingSubjectsJSON = localStorage.getItem(storageKey)
    const existingSubjects: Subject[] = existingSubjectsJSON ? JSON.parse(existingSubjectsJSON) : []

    // Check if subject code already exists
    const subjectExists = existingSubjects.some((subject) => subject.code.toLowerCase() === subjectCode.toLowerCase())

    if (subjectExists) {
      toast({
        title: "Subject Already Exists",
        description: `A subject with code ${subjectCode} already exists for this semester`,
        variant: "destructive",
      })
      return
    }

    // Add new subject
    const newSubject: Subject = {
      id: Date.now().toString(),
      name: subjectName,
      code: subjectCode,
      credits: Number(credits),
    }

    const updatedSubjects = [...existingSubjects, newSubject]

    // Save to localStorage
    localStorage.setItem(storageKey, JSON.stringify(updatedSubjects))

    // Show success message
    toast({
      title: "Subject Added",
      description: `${subjectName} (${subjectCode}) has been added successfully`,
    })

    // Reset form
    setSubjectName("")
    setSubjectCode("")
    setCredits("3")
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/manage-subjects")} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Add Subjects</h1>
      </div>

      <div className="mb-6 flex items-center">
        <div className="bg-muted px-3 py-1 rounded-md text-sm font-medium mr-2">{academicYear}</div>
        <div className="bg-muted px-3 py-1 rounded-md text-sm font-medium">Semester {semester}</div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Subject</CardTitle>
          <CardDescription>Enter the details of the new subject</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="subject-name">Subject Name</Label>
              <Input
                id="subject-name"
                placeholder="e.g., Data Structures and Algorithms"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="subject-code">Subject Code</Label>
              <Input
                id="subject-code"
                placeholder="e.g., CS201"
                value={subjectCode}
                onChange={(e) => setSubjectCode(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="credits">Credits</Label>
              <Input
                id="credits"
                type="number"
                min="1"
                max="6"
                value={credits}
                onChange={(e) => setCredits(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.push("/dashboard/manage-subjects/view")}>
            View All Subjects
          </Button>
          <Button onClick={handleAddSubject} disabled={!isFormValid}>
            <Plus className="h-4 w-4 mr-2" />
            Add Subject
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
