// Add a new file for student response to course end surveys

"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { ArrowLeft, CheckCircle2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function CourseEndSurveyResponsePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const surveyId = searchParams.get("id")
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [survey, setSurvey] = useState<any>(null)
  const [responses, setResponses] = useState<Record<string, any>>({})
  const [submitting, setSubmitting] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }

    if (!surveyId) {
      router.push("/dashboard/forms-survey")
      return
    }

    // Fetch survey data
    const fetchSurvey = async () => {
      try {
        const response = await fetch(`/api/course-end-survey?id=${surveyId}`)
        const data = await response.json()

        if (data.survey) {
          setSurvey(data.survey)

          // Initialize responses
          const initialResponses: Record<string, any> = {}
          data.survey.questions.forEach((question: any) => {
            initialResponses[question.id] = ""
          })
          setResponses(initialResponses)
        } else {
          toast({
            title: "Error",
            description: "Survey not found",
            variant: "destructive",
          })
          router.push("/dashboard/forms-survey")
        }
      } catch (error) {
        console.error("Error fetching survey:", error)
        toast({
          title: "Error",
          description: "Failed to load survey",
          variant: "destructive",
        })
        router.push("/dashboard/forms-survey")
      } finally {
        setLoading(false)
      }
    }

    fetchSurvey()
  }, [surveyId, router, toast])

  const handleInputChange = (questionId: string, value: any) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: value,
    }))
  }

  const validateResponses = () => {
    // Check if all questions have responses
    return Object.keys(responses).every((key) => responses[key] !== "")
  }

  const handleSubmit = async () => {
    if (!validateResponses()) {
      toast({
        title: "Incomplete Survey",
        description: "Please answer all questions before submitting.",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)

    try {
      const studentId = user?.id || "student1" // Use actual student ID from user object

      // Submit each question response
      const submissionPromises = Object.entries(responses).map(([questionId, rating]) => {
        return fetch("/api/course-end-survey/response", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            surveyId,
            questionId,
            rating: Number.parseInt(rating as string),
            studentId,
          }),
        })
      })

      await Promise.all(submissionPromises)

      // Update survey status to completed
      await fetch(`/api/course-end-survey?id=${surveyId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: surveyId,
          status: "completed",
        }),
      })

      toast({
        title: "Survey Submitted",
        description: "Your feedback has been submitted successfully. Thank you!",
      })

      // Redirect back to the forms list
      router.push("/dashboard/forms-survey")
    } catch (error) {
      console.error("Error submitting survey:", error)
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your responses. Please try again.",
        variant: "destructive",
      })
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>
  }

  if (!survey) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h2 className="text-2xl font-bold mb-2">Survey Not Found</h2>
        <p className="text-muted-foreground mb-4">The survey you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => router.push("/dashboard/forms-survey")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Forms & Surveys
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => router.push("/dashboard/forms-survey")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Course End Survey - {survey.subjectName}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Course End Survey</CardTitle>
          <CardDescription>
            Please provide your feedback on the {survey.subjectName} course taught by {survey.facultyName}.
          </CardDescription>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-2">
            <div>
              <span>Department: {survey.department}</span>
            </div>
            <div>
              <span>Semester: {survey.semester}</span>
            </div>
            <div>
              <span>Section: {survey.section}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 p-4 rounded-md mb-6">
            <h3 className="font-medium mb-1">Instructions</h3>
            <p className="text-sm text-muted-foreground">Please rate each statement on a scale of 1 to 3, where:</p>
            <ul className="text-sm text-muted-foreground list-disc list-inside ml-2 mt-1">
              <li>1 = Not Achieved</li>
              <li>2 = Partially Achieved</li>
              <li>3 = Fully Achieved</li>
            </ul>
          </div>

          <div className="space-y-8">
            {survey.questions.map((question: any, index: number) => (
              <div key={question.id} className="pb-6 border-b last:border-0 last:pb-0">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="font-medium">{index + 1}.</span>
                    <div>
                      <p className="font-medium">{question.text}</p>
                      <span className="text-red-500 text-sm">*Required</span>
                    </div>
                  </div>
                  <RadioGroup
                    value={responses[question.id]}
                    onValueChange={(value) => handleInputChange(question.id, value)}
                    className="flex space-x-4 pt-2"
                  >
                    {[1, 2, 3].map((option) => (
                      <div key={option} className="flex flex-col items-center space-y-1">
                        <RadioGroupItem value={option.toString()} id={`${question.id}-${option}`} />
                        <Label htmlFor={`${question.id}-${option}`}>{option}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                  <div className="flex justify-between text-xs text-muted-foreground pt-1">
                    <span>Not Achieved</span>
                    <span>Fully Achieved</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-6">
          <Button variant="outline" onClick={() => router.push("/dashboard/forms-survey")}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Submit Feedback
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
