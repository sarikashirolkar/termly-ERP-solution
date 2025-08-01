"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Clock, AlertCircle, FileText, ClipboardList, CheckCircle2 } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { useUser } from "@clerk/nextjs"

export default function RespondToFormPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const formId = searchParams.get("id")
  const { toast } = useToast()
  const { user } = useUser()

  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<any>(null)
  const [responses, setResponses] = useState<Record<string, any>>({})
  const [submitting, setSubmitting] = useState(false)
  const [timeLeft, setTimeLeft] = useState<string>("")

  useEffect(() => {
    if (!formId) {
      router.push("/dashboard/forms-survey")
      return
    }

    // Fetch the survey from the API
    const fetchSurvey = async () => {
      try {
        // In a real app, this would be an API call
        // For now, we'll check if it's a course end survey
        if (formId.startsWith("ces-")) {
          const response = await fetch(`/api/course-end-survey?id=${formId.replace("ces-", "")}`)
          const data = await response.json()

          if (data.survey) {
            setForm({
              ...data.survey,
              type: "survey",
              category: "Course End Survey",
              estimatedTime: "10 minutes",
              mandatory: true,
              questions: data.survey.questions.map((q: any) => ({
                id: q.id,
                type: "rating",
                text: q.text,
                options: [1, 2, 3],
                required: true,
              })),
              instructions:
                "Please rate each statement on a scale of 1 to 3, where 1 is 'Not Achieved', 2 is 'Partially Achieved', and 3 is 'Fully Achieved'.",
            })

            // Initialize responses
            const initialResponses: Record<string, any> = {}
            data.survey.questions.forEach((question: any) => {
              initialResponses[question.id] = ""
            })
            setResponses(initialResponses)
          } else {
            // Fallback to mock data if API fails
            fetchMockForm(formId)
          }
        } else {
          // For non-course end surveys, use mock data
          fetchMockForm(formId)
        }
      } catch (error) {
        console.error("Error fetching survey:", error)
        // Fallback to mock data if API fails
        fetchMockForm(formId)
      } finally {
        setLoading(false)
      }
    }

    fetchSurvey()

    // Start timer if it's a quiz
    if (form?.type === "quiz" && form?.timeLimit) {
      const endTime = new Date().getTime() + form.timeLimit * 60 * 1000

      const timer = setInterval(() => {
        const now = new Date().getTime()
        const distance = endTime - now

        if (distance <= 0) {
          clearInterval(timer)
          setTimeLeft("Time's up!")
          // Auto-submit the quiz
          handleSubmit()
        } else {
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
          const seconds = Math.floor((distance % (1000 * 60)) / 1000)
          setTimeLeft(`${minutes}:${seconds < 10 ? "0" : ""}${seconds}`)
        }
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [formId, form?.type, form?.timeLimit, router])

  const fetchMockForm = (id: string) => {
    // Mock data for the specific form
    const mockForms = {
      "ces-001": {
        id: "ces-001",
        title: "Course End Survey - Introduction to Computer Science",
        type: "survey",
        category: "Course End Survey",
        description: "Please provide your feedback on the Introduction to Computer Science course.",
        deadline: "2025-05-15",
        status: "pending",
        createdBy: "Dr. Arun Kumar R",
        department: "Computer Science",
        semester: "Semester 1",
        subject: "CS101: Introduction to Computer Science",
        section: "C",
        mandatory: true,
        estimatedTime: "10 minutes",
        questions: [
          {
            id: "q1",
            type: "rating",
            text: "The course objectives were clearly defined.",
            options: [1, 2, 3, 4, 5],
            required: true,
          },
          {
            id: "q2",
            type: "rating",
            text: "The course materials were well-prepared and useful.",
            options: [1, 2, 3, 4, 5],
            required: true,
          },
          {
            id: "q3",
            type: "rating",
            text: "The instructor was knowledgeable about the subject.",
            options: [1, 2, 3, 4, 5],
            required: true,
          },
          {
            id: "q4",
            type: "rating",
            text: "The instructor was responsive to student questions and concerns.",
            options: [1, 2, 3, 4, 5],
            required: true,
          },
          {
            id: "q5",
            type: "rating",
            text: "The assessments (assignments, exams) were fair and appropriate.",
            options: [1, 2, 3, 4, 5],
            required: true,
          },
          {
            id: "q6",
            type: "text",
            text: "What aspects of the course did you find most valuable?",
            required: false,
          },
          {
            id: "q7",
            type: "text",
            text: "What suggestions do you have for improving the course?",
            required: false,
          },
        ],
        instructions:
          "Please rate each statement on a scale of 1 to 5, where 1 is 'Strongly Disagree' and 5 is 'Strongly Agree'.",
      },
      "quiz-001": {
        id: "quiz-001",
        title: "Data Structures Mid-Term Quiz",
        type: "quiz",
        category: "Academic Quiz",
        description: "Test your knowledge on data structures concepts covered so far.",
        deadline: "2025-05-10",
        status: "pending",
        createdBy: "Prof. Priya Sharma",
        department: "Computer Science",
        semester: "Semester 3",
        subject: "CS301: Data Structures",
        section: "A",
        mandatory: true,
        estimatedTime: "30 minutes",
        timeLimit: 30, // in minutes
        questions: [
          {
            id: "q1",
            type: "mcq",
            text: "Which of the following data structures is used for implementing recursion?",
            options: ["Queue", "Stack", "Array", "List"],
            correctAnswer: "Stack",
            required: true,
          },
          {
            id: "q2",
            type: "mcq",
            text: "What is the time complexity of binary search?",
            options: ["O(n)", "O(log n)", "O(n log n)", "O(n²)"],
            correctAnswer: "O(log n)",
            required: true,
          },
          {
            id: "q3",
            type: "mcq",
            text: "Which of the following is not a linear data structure?",
            options: ["Array", "Linked List", "Queue", "Tree"],
            correctAnswer: "Tree",
            required: true,
          },
          {
            id: "q4",
            type: "short_answer",
            text: "Explain the difference between a stack and a queue.",
            required: true,
          },
          {
            id: "q5",
            type: "short_answer",
            text: "What is a hash collision and how can it be resolved?",
            required: true,
          },
        ],
        instructions:
          "This quiz contains multiple choice and short answer questions. You have 30 minutes to complete the quiz. Once you submit, you cannot change your answers.",
      },
      "survey-001": {
        id: "survey-001",
        title: "Library Services Feedback",
        type: "survey",
        category: "Institutional Survey",
        description: "Help us improve our library services by providing your feedback.",
        deadline: "2025-05-20",
        status: "pending",
        createdBy: "Library Committee",
        department: "All Departments",
        mandatory: false,
        estimatedTime: "5 minutes",
        questions: [
          {
            id: "q1",
            type: "mcq",
            text: "How often do you visit the university library?",
            options: ["Daily", "Weekly", "Monthly", "Rarely", "Never"],
            required: true,
          },
          {
            id: "q2",
            type: "checkbox",
            text: "Which library services do you use? (Select all that apply)",
            options: [
              "Book borrowing",
              "E-resources",
              "Study spaces",
              "Research assistance",
              "Printing/copying",
              "Group study rooms",
            ],
            required: true,
          },
          {
            id: "q3",
            type: "rating",
            text: "How would you rate the availability of books and resources?",
            options: [1, 2, 3, 4, 5],
            required: true,
          },
          {
            id: "q4",
            type: "rating",
            text: "How would you rate the helpfulness of library staff?",
            options: [1, 2, 3, 4, 5],
            required: true,
          },
          {
            id: "q5",
            type: "text",
            text: "What suggestions do you have for improving the library services?",
            required: false,
          },
        ],
        instructions: "Please provide honest feedback to help us improve our library services.",
      },
      "form-001": {
        id: "form-001",
        title: "Internship Preference Form",
        type: "form",
        category: "Career Development",
        description: "Submit your preferences for the upcoming summer internship program.",
        deadline: "2025-05-25",
        status: "pending",
        createdBy: "Placement Cell",
        department: "Computer Science",
        semester: "Semester 6",
        mandatory: true,
        estimatedTime: "15 minutes",
        questions: [
          {
            id: "q1",
            type: "text",
            text: "Full Name",
            required: true,
          },
          {
            id: "q2",
            type: "text",
            text: "Roll Number",
            required: true,
          },
          {
            id: "q3",
            type: "text",
            text: "Email Address",
            required: true,
          },
          {
            id: "q4",
            type: "mcq",
            text: "Preferred Internship Domain",
            options: [
              "Software Development",
              "Data Science",
              "Cybersecurity",
              "Web Development",
              "Mobile App Development",
              "Other",
            ],
            required: true,
          },
          {
            id: "q5",
            type: "text",
            text: "If 'Other', please specify",
            required: false,
          },
          {
            id: "q6",
            type: "checkbox",
            text: "Preferred Companies (Select up to 3)",
            options: ["Google", "Microsoft", "Amazon", "IBM", "Infosys", "TCS", "Wipro", "Other"],
            required: true,
          },
          {
            id: "q7",
            type: "text",
            text: "If 'Other', please specify",
            required: false,
          },
          {
            id: "q8",
            type: "text",
            text: "Relevant Skills and Certifications",
            required: true,
          },
          {
            id: "q9",
            type: "mcq",
            text: "Preferred Internship Duration",
            options: ["1 month", "2 months", "3 months", "6 months"],
            required: true,
          },
          {
            id: "q10",
            type: "text",
            text: "Any additional information you would like to share",
            required: false,
          },
        ],
        instructions:
          "Please fill out this form to indicate your preferences for the upcoming summer internship program. Your preferences will be considered during the placement process.",
      },
    }

    const form = mockForms[id as keyof typeof mockForms]
    if (form) {
      setForm(form)

      // Initialize responses object
      const initialResponses: Record<string, any> = {}
      form.questions.forEach((question: any) => {
        if (question.type === "checkbox") {
          initialResponses[question.id] = []
        } else {
          initialResponses[question.id] = ""
        }
      })

      setResponses(initialResponses)
    }

    setLoading(false)
  }

  const handleInputChange = (questionId: string, value: any) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: value,
    }))
  }

  const handleCheckboxChange = (questionId: string, option: string, checked: boolean) => {
    setResponses((prev) => {
      const currentOptions = [...(prev[questionId] || [])]

      if (checked) {
        // Add option if it's not already in the array
        if (!currentOptions.includes(option)) {
          currentOptions.push(option)
        }
      } else {
        // Remove option if it's in the array
        const index = currentOptions.indexOf(option)
        if (index !== -1) {
          currentOptions.splice(index, 1)
        }
      }

      return {
        ...prev,
        [questionId]: currentOptions,
      }
    })
  }

  const validateResponses = () => {
    const unansweredRequired = form.questions
      .filter((q: any) => q.required)
      .filter((q: any) => {
        if (q.type === "checkbox") {
          return !responses[q.id] || responses[q.id].length === 0
        }
        return !responses[q.id]
      })

    return unansweredRequired.length === 0
  }

  const handleSubmit = async () => {
    if (!validateResponses()) {
      toast({
        title: "Incomplete Form",
        description: "Please answer all required questions before submitting.",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)

    try {
      // For course end surveys, submit to the API
      if (form.category === "Course End Survey") {
        const studentId = user?.id || "student1" // Use actual student ID from user object

        // Submit each question response
        const submissionPromises = Object.entries(responses).map(([questionId, rating]) => {
          return fetch("/api/course-end-survey/response", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              surveyId: formId.replace("ces-", ""),
              questionId,
              rating: Number.parseInt(rating as string),
              studentId,
            }),
          })
        })

        await Promise.all(submissionPromises)

        toast({
          title: "Survey Submitted",
          description: "Your feedback has been submitted successfully. Thank you!",
        })
      } else {
        // For other forms, simulate submission
        await new Promise((resolve) => setTimeout(resolve, 1500))

        toast({
          title: "Form Submitted",
          description: "Your responses have been submitted successfully.",
        })
      }

      // Redirect back to the forms list
      router.push("/dashboard/forms-survey")
    } catch (error) {
      console.error("Error submitting form:", error)
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your responses. Please try again.",
        variant: "destructive",
      })
      setSubmitting(false)
    }
  }

  const renderQuestion = (question: any, index: number) => {
    switch (question.type) {
      case "rating":
        return (
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="font-medium">{index + 1}.</span>
              <div>
                <p className="font-medium">{question.text}</p>
                {question.required && <span className="text-red-500 text-sm">*Required</span>}
              </div>
            </div>
            <RadioGroup
              value={responses[question.id]}
              onValueChange={(value) => handleInputChange(question.id, value)}
              className="flex space-x-4 pt-2"
            >
              {question.options.map((option: number) => (
                <div key={option} className="flex flex-col items-center space-y-1">
                  <RadioGroupItem value={option.toString()} id={`${question.id}-${option}`} />
                  <Label htmlFor={`${question.id}-${option}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
            <div className="flex justify-between text-xs text-muted-foreground pt-1">
              <span>Strongly Disagree</span>
              <span>Strongly Agree</span>
            </div>
          </div>
        )

      case "mcq":
        return (
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="font-medium">{index + 1}.</span>
              <div>
                <p className="font-medium">{question.text}</p>
                {question.required && <span className="text-red-500 text-sm">*Required</span>}
              </div>
            </div>
            <RadioGroup
              value={responses[question.id]}
              onValueChange={(value) => handleInputChange(question.id, value)}
              className="space-y-2 pt-2"
            >
              {question.options.map((option: string) => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`${question.id}-${option}`} />
                  <Label htmlFor={`${question.id}-${option}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )

      case "checkbox":
        return (
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="font-medium">{index + 1}.</span>
              <div>
                <p className="font-medium">{question.text}</p>
                {question.required && <span className="text-red-500 text-sm">*Required</span>}
              </div>
            </div>
            <div className="space-y-2 pt-2">
              {question.options.map((option: string) => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${question.id}-${option}`}
                    checked={(responses[question.id] || []).includes(option)}
                    onCheckedChange={(checked) => handleCheckboxChange(question.id, option, checked as boolean)}
                  />
                  <Label htmlFor={`${question.id}-${option}`}>{option}</Label>
                </div>
              ))}
            </div>
          </div>
        )

      case "text":
        return (
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="font-medium">{index + 1}.</span>
              <div>
                <p className="font-medium">{question.text}</p>
                {question.required && <span className="text-red-500 text-sm">*Required</span>}
              </div>
            </div>
            <Textarea
              value={responses[question.id]}
              onChange={(e) => handleInputChange(question.id, e.target.value)}
              placeholder="Type your answer here..."
              className="min-h-[100px]"
            />
          </div>
        )

      case "short_answer":
        return (
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="font-medium">{index + 1}.</span>
              <div>
                <p className="font-medium">{question.text}</p>
                {question.required && <span className="text-red-500 text-sm">*Required</span>}
              </div>
            </div>
            <Input
              value={responses[question.id]}
              onChange={(e) => handleInputChange(question.id, e.target.value)}
              placeholder="Type your answer here..."
            />
          </div>
        )

      default:
        return null
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>
  }

  if (!form) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Form Not Found</h2>
        <p className="text-muted-foreground mb-4">The form you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => router.push("/dashboard/forms-survey")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Forms & Surveys
        </Button>
      </div>
    )
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Course End Survey":
        return <FileText className="h-5 w-5 text-blue-500" />
      case "Academic Quiz":
        return <ClipboardList className="h-5 w-5 text-purple-500" />
      case "Institutional Survey":
        return <FileText className="h-5 w-5 text-green-500" />
      case "Career Development":
        return <FileText className="h-5 w-5 text-amber-500" />
      default:
        return <FileText className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => router.push("/dashboard/forms-survey")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">{form.title}</h1>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            {getCategoryIcon(form.category)}
            <Badge variant="outline">{form.category}</Badge>
            {form.mandatory && (
              <Badge
                variant="outline"
                className="bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
              >
                Mandatory
              </Badge>
            )}
            {form.type === "quiz" && timeLeft && (
              <Badge
                variant="outline"
                className="bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800"
              >
                Time Left: {timeLeft}
              </Badge>
            )}
          </div>
          <CardDescription>{form.description}</CardDescription>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-2">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>Estimated time: {form.estimatedTime}</span>
            </div>
            <div>
              <span>Created by: {form.createdBy}</span>
            </div>
            <div>
              <span>Due: {new Date(form.deadline).toLocaleDateString()}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {form.instructions && (
            <div className="bg-muted/50 p-4 rounded-md mb-6">
              <h3 className="font-medium mb-1">Instructions</h3>
              <p className="text-sm text-muted-foreground">{form.instructions}</p>
            </div>
          )}

          <div className="space-y-8">
            {form.questions.map((question: any, index: number) => (
              <div key={question.id} className="pb-6 border-b last:border-0 last:pb-0">
                {renderQuestion(question, index)}
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
                Submit Response
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
