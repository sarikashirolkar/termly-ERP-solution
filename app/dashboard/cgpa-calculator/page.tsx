"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getLetterGrade, getCGPAClassification } from "@/lib/cgpa-calculator"
import { useToast } from "@/hooks/use-toast"
import { PlusCircle, Trash2, Save, Calculator } from "lucide-react"

interface Course {
  id: string
  code: string
  credits: number
  marks: number
  gradePoint: number
}

interface Semester {
  id: string
  number: number
  courses: Course[]
  gpa: number
}

export default function CGPACalculatorPage() {
  const [step, setStep] = useState<"select-semesters" | "enter-data" | "results">("select-semesters")
  const [totalSemesters, setTotalSemesters] = useState<number>(0)
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [activeSemester, setActiveSemester] = useState<number>(1)
  const [cgpa, setCGPA] = useState<number>(0)
  const { toast } = useToast()

  // Initialize semesters when total semesters is set
  const initializeSemesters = (count: number) => {
    if (count > 0) {
      const initialSemesters: Semester[] = Array.from({ length: count }, (_, i) => ({
        id: `sem-${i + 1}`,
        number: i + 1,
        courses: [],
        gpa: 0,
      }))
      setSemesters(initialSemesters)
      setActiveSemester(1)
      setStep("enter-data")
    }
  }

  // Calculate GPA for a semester
  const calculateSemesterGPA = (courses: Course[]): number => {
    if (courses.length === 0) return 0

    let totalCredits = 0
    let totalGradePoints = 0

    for (const course of courses) {
      totalCredits += course.credits
      totalGradePoints += course.credits * course.gradePoint
    }

    return totalCredits > 0 ? totalGradePoints / totalCredits : 0
  }

  // Add a new course to the active semester
  const addCourse = () => {
    const semesterIndex = semesters.findIndex((sem) => sem.number === activeSemester)
    if (semesterIndex === -1) return

    const updatedSemesters = [...semesters]
    const newCourse: Course = {
      id: `course-${Date.now()}`,
      code: "",
      credits: 0,
      marks: 0,
      gradePoint: 0,
    }

    updatedSemesters[semesterIndex].courses.push(newCourse)
    setSemesters(updatedSemesters)
  }

  // Remove a course from the active semester
  const removeCourse = (courseId: string) => {
    const semesterIndex = semesters.findIndex((sem) => sem.number === activeSemester)
    if (semesterIndex === -1) return

    const updatedSemesters = [...semesters]
    updatedSemesters[semesterIndex].courses = updatedSemesters[semesterIndex].courses.filter(
      (course) => course.id !== courseId,
    )

    // Recalculate semester GPA
    updatedSemesters[semesterIndex].gpa = calculateSemesterGPA(updatedSemesters[semesterIndex].courses)

    setSemesters(updatedSemesters)
  }

  // Update course details
  const updateCourse = (courseId: string, field: keyof Course, value: string | number) => {
    const semesterIndex = semesters.findIndex((sem) => sem.number === activeSemester)
    if (semesterIndex === -1) return

    const courseIndex = semesters[semesterIndex].courses.findIndex((course) => course.id === courseId)
    if (courseIndex === -1) return

    const updatedSemesters = [...semesters]
    updatedSemesters[semesterIndex].courses[courseIndex] = {
      ...updatedSemesters[semesterIndex].courses[courseIndex],
      [field]: value,
    }

    // If marks are updated, calculate grade point immediately
    if (field === "marks") {
      const marks = Number(value)
      let gradePoint = 0

      if (marks >= 90) gradePoint = 10
      else if (marks >= 80) gradePoint = 9
      else if (marks >= 70) gradePoint = 8
      else if (marks >= 60) gradePoint = 7
      else if (marks >= 50) gradePoint = 6
      else if (marks >= 45) gradePoint = 5
      else if (marks >= 40) gradePoint = 4
      else gradePoint = 0

      updatedSemesters[semesterIndex].courses[courseIndex].gradePoint = gradePoint

      // Also update the semester GPA in real-time
      updatedSemesters[semesterIndex].gpa = calculateSemesterGPA(updatedSemesters[semesterIndex].courses)
    }

    setSemesters(updatedSemesters)
  }

  // Save semester data and calculate GPA
  const saveSemesterData = () => {
    const semesterIndex = semesters.findIndex((sem) => sem.number === activeSemester)
    if (semesterIndex === -1) return

    const courses = semesters[semesterIndex].courses

    // Validate courses
    if (courses.length === 0) {
      toast({
        title: "No courses added",
        description: "Please add at least one course for this semester.",
        variant: "destructive",
      })
      return
    }

    for (const course of courses) {
      if (!course.code || course.credits <= 0 || course.marks < 0 || course.marks > 100) {
        toast({
          title: "Invalid course data",
          description: "Please ensure all courses have valid code, credits, and marks.",
          variant: "destructive",
        })
        return
      }
    }

    // Calculate semester GPA
    const gpa = calculateSemesterGPA(courses)

    const updatedSemesters = [...semesters]
    updatedSemesters[semesterIndex].gpa = gpa

    setSemesters(updatedSemesters)

    toast({
      title: "Semester data saved",
      description: `Semester ${activeSemester} GPA: ${gpa.toFixed(2)}`,
    })

    // Move to next semester if available
    if (activeSemester < totalSemesters) {
      setActiveSemester(activeSemester + 1)
    }
  }

  // Calculate overall CGPA
  const calculateOverallCGPA = () => {
    console.log("Starting CGPA calculation...")
    console.log("Current semesters:", semesters)

    // Validate that all semesters have data and courses
    for (const semester of semesters) {
      if (semester.courses.length === 0) {
        toast({
          title: "Incomplete data",
          description: `Please add courses for Semester ${semester.number}.`,
          variant: "destructive",
        })
        return
      }

      // Check if any course has invalid data
      for (const course of semester.courses) {
        if (!course.code.trim()) {
          toast({
            title: "Missing course code",
            description: `Please enter a course code for all courses in Semester ${semester.number}.`,
            variant: "destructive",
          })
          return
        }
        if (course.credits <= 0) {
          toast({
            title: "Invalid credits",
            description: `Please enter valid credits (1-6) for all courses in Semester ${semester.number}.`,
            variant: "destructive",
          })
          return
        }
        if (course.marks < 0 || course.marks > 100) {
          toast({
            title: "Invalid marks",
            description: `Please enter valid marks (0-100) for all courses in Semester ${semester.number}.`,
            variant: "destructive",
          })
          return
        }
      }
    }

    // Recalculate grade points for all courses to ensure they're up to date
    const updatedSemesters = semesters.map((semester) => ({
      ...semester,
      courses: semester.courses.map((course) => {
        let gradePoint = 0
        const marks = course.marks

        if (marks >= 90) gradePoint = 10
        else if (marks >= 80) gradePoint = 9
        else if (marks >= 70) gradePoint = 8
        else if (marks >= 60) gradePoint = 7
        else if (marks >= 50) gradePoint = 6
        else if (marks >= 45) gradePoint = 5
        else if (marks >= 40) gradePoint = 4
        else gradePoint = 0

        return { ...course, gradePoint }
      }),
    }))

    // Calculate semester GPAs
    const semestersWithGPA = updatedSemesters.map((semester) => ({
      ...semester,
      gpa: calculateSemesterGPA(semester.courses),
    }))

    console.log("Semesters with GPA:", semestersWithGPA)

    // Prepare all courses for CGPA calculation
    const allCourses = semestersWithGPA.flatMap((semester) =>
      semester.courses.map((course) => ({
        credits: course.credits,
        gradePoint: course.gradePoint,
      })),
    )

    console.log("All courses for CGPA calculation:", allCourses)

    // Calculate CGPA manually to ensure it works
    let totalCredits = 0
    let totalGradePoints = 0

    for (const course of allCourses) {
      totalCredits += course.credits
      totalGradePoints += course.credits * course.gradePoint
    }

    const calculatedCGPA = totalCredits > 0 ? totalGradePoints / totalCredits : 0

    console.log("Total Credits:", totalCredits)
    console.log("Total Grade Points:", totalGradePoints)
    console.log("Calculated CGPA:", calculatedCGPA)

    if (calculatedCGPA === 0) {
      toast({
        title: "Calculation Error",
        description: "Unable to calculate CGPA. Please check your data.",
        variant: "destructive",
      })
      return
    }

    // Update state with calculated values
    setSemesters(semestersWithGPA)
    setCGPA(calculatedCGPA)

    // Save CGPA to localStorage
    try {
      const user = localStorage.getItem("user")
      if (user) {
        const userData = JSON.parse(user)
        userData.cgpa = calculatedCGPA
        localStorage.setItem("user", JSON.stringify(userData))
      }
    } catch (error) {
      console.error("Error saving CGPA to localStorage:", error)
    }

    toast({
      title: "CGPA Calculated Successfully!",
      description: `Your CGPA is ${calculatedCGPA.toFixed(2)} (${getCGPAClassification(calculatedCGPA)})`,
    })

    setStep("results")
  }

  // Reset calculator
  const resetCalculator = () => {
    setStep("select-semesters")
    setTotalSemesters(0)
    setSemesters([])
    setCGPA(0)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">CGPA Calculator</h2>
        <p className="text-muted-foreground">Calculate your Cumulative Grade Point Average</p>
      </div>

      <div className="bg-white dark:bg-background rounded-lg border shadow-sm">
        {step === "select-semesters" && (
          <Card className="border-0 shadow-none">
            <CardHeader>
              <CardTitle>CGPA Calculator</CardTitle>
              <CardDescription>Calculate your Cumulative Grade Point Average</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="total-semesters">How many semesters have you completed?</Label>
                  <Select onValueChange={(value) => setTotalSemesters(Number.parseInt(value))}>
                    <SelectTrigger id="total-semesters">
                      <SelectValue placeholder="Select number of semesters" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} {num === 1 ? "Semester" : "Semesters"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => initializeSemesters(totalSemesters)} disabled={totalSemesters === 0}>
                Continue
              </Button>
            </CardFooter>
          </Card>
        )}

        {step === "enter-data" && (
          <Card className="border-0 shadow-none">
            <CardHeader>
              <CardTitle>Enter Semester Data</CardTitle>
              <CardDescription>Enter your courses and grades for each semester</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs
                value={activeSemester.toString()}
                onValueChange={(value) => setActiveSemester(Number.parseInt(value))}
                className="w-full"
              >
                <TabsList className="grid grid-cols-4 sm:grid-cols-8">
                  {semesters.map((semester) => (
                    <TabsTrigger key={semester.id} value={semester.number.toString()} className="relative">
                      Sem {semester.number}
                      {semester.gpa > 0 && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full" />
                      )}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {semesters.map((semester) => (
                  <TabsContent key={semester.id} value={semester.number.toString()} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">Semester {semester.number}</h3>
                      <Button variant="outline" size="sm" onClick={addCourse}>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add Course
                      </Button>
                    </div>

                    {semester.courses.length === 0 ? (
                      <div className="text-center py-4 text-muted-foreground">
                        No courses added yet. Click "Add Course" to begin.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {semester.courses.map((course) => (
                          <div key={course.id} className="grid grid-cols-12 gap-2 items-end">
                            <div className="col-span-3">
                              <Label htmlFor={`course-code-${course.id}`}>Course Code</Label>
                              <Input
                                id={`course-code-${course.id}`}
                                value={course.code}
                                onChange={(e) => updateCourse(course.id, "code", e.target.value)}
                                placeholder="e.g., CS101"
                              />
                            </div>
                            <div className="col-span-2">
                              <Label htmlFor={`course-credits-${course.id}`}>Credits</Label>
                              <Input
                                id={`course-credits-${course.id}`}
                                type="number"
                                min="1"
                                max="6"
                                value={course.credits || ""}
                                onChange={(e) =>
                                  updateCourse(course.id, "credits", Number.parseInt(e.target.value) || 0)
                                }
                              />
                            </div>
                            <div className="col-span-2">
                              <Label htmlFor={`course-marks-${course.id}`}>Marks</Label>
                              <Input
                                id={`course-marks-${course.id}`}
                                type="number"
                                min="0"
                                max="100"
                                value={course.marks || ""}
                                onChange={(e) => updateCourse(course.id, "marks", Number.parseInt(e.target.value) || 0)}
                              />
                            </div>
                            <div className="col-span-2">
                              <Label>Grade Point</Label>
                              <div className="h-10 px-3 py-2 rounded-md border border-input bg-background text-sm">
                                {course.gradePoint.toFixed(1)}
                              </div>
                            </div>
                            <div className="col-span-2">
                              <Label>Grade</Label>
                              <div className="h-10 px-3 py-2 rounded-md border border-input bg-background text-sm">
                                {getLetterGrade(course.gradePoint)}
                              </div>
                            </div>
                            <div className="col-span-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeCourse(course.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}

                        {semester.courses.length > 0 && (
                          <div className="pt-4 border-t flex justify-between items-center">
                            <div>
                              <span className="text-sm text-muted-foreground">Semester GPA:</span>
                              <span className="ml-2 font-medium">
                                {semester.gpa > 0 ? semester.gpa.toFixed(2) : "Not calculated"}
                              </span>
                            </div>
                            <Button onClick={saveSemesterData} className="gap-2">
                              <Save className="h-4 w-4" />
                              Save Semester Data
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={resetCalculator}>
                Start Over
              </Button>
              <Button onClick={calculateOverallCGPA} className="gap-2">
                <Calculator className="h-4 w-4" />
                Calculate CGPA
              </Button>
            </CardFooter>
          </Card>
        )}

        {step === "results" && (
          <Card className="border-0 shadow-none">
            <CardHeader>
              <CardTitle>CGPA Results</CardTitle>
              <CardDescription>Your calculated CGPA and semester breakdown</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-6 bg-primary/10 rounded-lg text-center">
                <h3 className="text-lg font-medium mb-2">Your Cumulative GPA</h3>
                <div className="text-4xl font-bold">{cgpa.toFixed(2)}</div>
                <div className="mt-2 text-sm">{getCGPAClassification(cgpa)}</div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Semester Breakdown</h3>
                <div className="space-y-2">
                  {semesters.map((semester) => (
                    <div key={semester.id} className="flex justify-between items-center p-3 border rounded-md">
                      <span>Semester {semester.number}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">{semester.courses.length} courses</span>
                        <span className="font-medium">{semester.gpa.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={resetCalculator} className="w-full">
                Calculate Again
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  )
}
