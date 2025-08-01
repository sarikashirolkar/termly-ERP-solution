"use client"

import { useState } from "react"

export interface SurveyQuestion {
  text: string
  type: string
  options?: string[]
  courseOutcome?: string
}

export interface SurveyReport {
  questionText: string
  averageRating: number
  responseCount: number
  courseOutcome?: string
}

export function useSurveyData() {
  // Course configuration
  const [courseCode, setCourseCode] = useState<string>("CS101")
  const [courseName, setCourseName] = useState<string>("Introduction to Computer Science")
  const [semester, setSemester] = useState<string>("Fall 2023")
  const [faculty, setFaculty] = useState<string>("Dr. John Doe")

  // Survey questions
  const [questions, setQuestions] = useState<SurveyQuestion[]>([
    {
      text: "How well did the course help you understand the fundamental concepts?",
      type: "number",
      courseOutcome: "CO1",
    },
    {
      text: "Rate your ability to apply the knowledge gained in practical scenarios",
      type: "number",
      courseOutcome: "CO2",
    },
    {
      text: "How effective were the teaching methods used in this course?",
      type: "number",
      courseOutcome: "CO3",
    },
  ])

  // Survey responses
  const [responses, setResponses] = useState<Record<string, any>[]>([
    {
      "How well did the course help you understand the fundamental concepts?": "4",
      "Rate your ability to apply the knowledge gained in practical scenarios": "3",
      "How effective were the teaching methods used in this course?": "5",
    },
    {
      "How well did the course help you understand the fundamental concepts?": "5",
      "Rate your ability to apply the knowledge gained in practical scenarios": "4",
      "How effective were the teaching methods used in this course?": "4",
    },
  ])

  // Survey report
  const [report, setReport] = useState<SurveyReport[] | null>(null)

  // Course End Survey states
  const [surveyQuestions, setSurveyQuestions] = useState<{ id: string; text: string }[]>([
    { id: "q1", text: "Have you applied the knowledge of the course to solve problems related to the subject?" },
    { id: "q2", text: "Rate your idea of analyzing the solutions of problems related to the course" },
    { id: "q3", text: "Have you got acquainted with and able to apply the concepts learned in this course?" },
    { id: "q4", text: "Rate your knowledge of making use of the course concepts for solving problems" },
    { id: "q5", text: "How much you familiarize with modern tools related to this course?" },
  ])

  const [newQuestion, setNewQuestion] = useState<string>("")
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null)
  const [tempQuestionText, setTempQuestionText] = useState<string>("")
  const [selectedFaculty, setSelectedFaculty] = useState<string>("")
  const [surveyDate, setSurveyDate] = useState<string>(new Date().toISOString().split("T")[0])
  const [totalStudents, setTotalStudents] = useState<number>(64)
  const [respondedStudents, setRespondedStudents] = useState<number>(45)

  const [mockResponses, setMockResponses] = useState<
    Record<string, { rating1: number; rating2: number; rating3: number }>
  >({
    q1: { rating1: 0, rating2: 13, rating3: 32 },
    q2: { rating1: 2, rating2: 12, rating3: 31 },
    q3: { rating1: 1, rating2: 10, rating3: 34 },
    q4: { rating1: 1, rating2: 8, rating3: 36 },
    q5: { rating1: 3, rating2: 15, rating3: 27 },
  })

  const [showReport, setShowReport] = useState(false)
  const [selectedDepartment, setSelectedDepartment] = useState<string>("CSE")
  const [selectedSection, setSelectedSection] = useState<string>("C")

  // Faculty responses by department
  const [facultyResponses, setFacultyResponses] = useState<
    Record<string, Record<string, { rating1: number; rating2: number; rating3: number }>>
  >({
    CSE: {
      q1: { rating1: 0, rating2: 13, rating3: 32 },
      q2: { rating1: 2, rating2: 12, rating3: 31 },
      q3: { rating1: 1, rating2: 10, rating3: 34 },
      q4: { rating1: 1, rating2: 8, rating3: 36 },
      q5: { rating1: 3, rating2: 15, rating3: 27 },
    },
    ECE: {
      q1: { rating1: 3, rating2: 15, rating3: 25 },
      q2: { rating1: 4, rating2: 18, rating3: 21 },
      q3: { rating1: 2, rating2: 12, rating3: 29 },
      q4: { rating1: 5, rating2: 10, rating3: 28 },
      q5: { rating1: 1, rating2: 14, rating3: 28 },
    },
    ME: {
      q1: { rating1: 2, rating2: 10, rating3: 28 },
      q2: { rating1: 1, rating2: 15, rating3: 24 },
      q3: { rating1: 3, rating2: 12, rating3: 25 },
      q4: { rating1: 0, rating2: 14, rating3: 26 },
      q5: { rating1: 4, rating2: 11, rating3: 25 },
    },
    CE: {
      q1: { rating1: 1, rating2: 12, rating3: 27 },
      q2: { rating1: 3, rating2: 14, rating3: 23 },
      q3: { rating1: 2, rating2: 13, rating3: 25 },
      q4: { rating1: 4, rating2: 11, rating3: 25 },
      q5: { rating1: 2, rating2: 13, rating3: 25 },
    },
  })

  const [departmentStudentCounts, setDepartmentStudentCounts] = useState<
    Record<string, { total: number; responded: number }>
  >({
    CSE: { total: 64, responded: 45 },
    ECE: { total: 58, responded: 42 },
    ME: { total: 52, responded: 38 },
    CE: { total: 60, responded: 44 },
  })

  // Add a new question
  const addQuestion = (question: SurveyQuestion) => {
    setQuestions([...questions, question])
  }

  // Update an existing question
  const updateQuestion = (index: number, text: string, type: string, options?: string[], courseOutcome?: string) => {
    const updatedQuestions = [...questions]
    updatedQuestions[index] = {
      text,
      type,
      options,
      courseOutcome,
    }
    setQuestions(updatedQuestions)
  }

  // Remove a question
  const removeQuestion = (index: number) => {
    const updatedQuestions = [...questions]
    updatedQuestions.splice(index, 1)
    setQuestions(updatedQuestions)
  }

  // Add a new response
  const addResponse = (response: Record<string, any>) => {
    setResponses([...responses, response])
  }

  // Generate survey report
  const generateReport = () => {
    const newReport: SurveyReport[] = questions.map((question) => {
      const questionResponses = responses.map((response) => Number(response[question.text]) || 0)

      const sum = questionResponses.reduce((acc, val) => acc + val, 0)
      const count = questionResponses.length
      const average = count > 0 ? sum / count : 0

      return {
        questionText: question.text,
        averageRating: average,
        responseCount: count,
        courseOutcome: question.courseOutcome,
      }
    })

    setReport(newReport)
  }

  // Export survey data to CSV
  const exportSurveyCSV = () => {
    if (!report) {
      generateReport()
    }

    let csv = "Question,Average Rating,Response Count,Course Outcome\n"

    report?.forEach((item) => {
      csv += `"${item.questionText}",${item.averageRating.toFixed(2)},${item.responseCount},${item.courseOutcome || ""}\n`
    })

    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${courseCode}_survey_report.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Save survey data
  const saveSurveyData = () => {
    // In a real application, this would save to a database
    console.log("Saving survey data:", {
      courseCode,
      courseName,
      semester,
      faculty,
      questions,
      responses,
    })

    // For demo purposes, save to localStorage
    try {
      localStorage.setItem(
        "survey_data",
        JSON.stringify({
          courseCode,
          courseName,
          semester,
          faculty,
          questions,
          responses,
        }),
      )
      return true
    } catch (error) {
      console.error("Error saving survey data:", error)
      return false
    }
  }

  const handleAddQuestion = () => {
    if (newQuestion.trim() === "") return

    const newId = `q${surveyQuestions.length + 1}`
    setSurveyQuestions([...surveyQuestions, { id: newId, text: newQuestion }])
    setNewQuestion("")

    // Add mock responses for the new question
    setMockResponses({
      ...mockResponses,
      [newId]: { rating1: 0, rating2: 0, rating3: 0 },
    })
  }

  const handleRemoveQuestion = (id: string) => {
    setSurveyQuestions(surveyQuestions.filter((q) => q.id !== id))

    // Remove mock responses for this question
    const updatedResponses = { ...mockResponses }
    delete updatedResponses[id]

    setMockResponses(updatedResponses)
  }

  const startEditingQuestion = (id: string, text: string) => {
    setEditingQuestion(id)
    setTempQuestionText(text)
  }

  const saveEditQuestion = (id: string) => {
    if (tempQuestionText.trim() === "") return

    setSurveyQuestions(surveyQuestions.map((q) => (q.id === id ? { ...q, text: tempQuestionText } : q)))

    setEditingQuestion(null)
    setTempQuestionText("")
  }

  const cancelEditQuestion = () => {
    setEditingQuestion(null)
    setTempQuestionText("")
  }

  const handleMockResponseChange = (questionId: string, rating: 1 | 2 | 3, value: number) => {
    setMockResponses({
      ...mockResponses,
      [questionId]: {
        ...mockResponses[questionId],
        [`rating${rating}`]: value,
      },
    })
  }

  const calculateCESScore = (questionId: string) => {
    const responses = mockResponses[questionId]
    if (!responses) return 0

    const total = responses.rating1 + responses.rating2 + responses.rating3
    if (total === 0) return 0

    return (1 * responses.rating1 + 2 * responses.rating2 + 3 * responses.rating3) / total
  }

  const calculateAverageCESScore = () => {
    const scores = surveyQuestions.map((q) => calculateCESScore(q.id))
    const total = scores.reduce((sum, score) => sum + score, 0)
    return scores.length > 0 ? total / scores.length : 0
  }

  const exportSurveyToCSV = () => {
    // Create CSV content
    let csv =
      "Faculty Name,Subject Code and Name,Academic Year and Date of CES,Department,Semester,Section,Total Number of Students Given CES\n"

    // Add survey details
    csv += `${selectedFaculty || "DR ARUN KUMAR R"},CS101 Introduction to Computer Science,`
    csv += `Fall 2023-${surveyDate},1,`
    csv += `1,C,${respondedStudents} Out of ${totalStudents} (${((respondedStudents / totalStudents) * 100).toFixed(2)}%)\n\n`

    // Add question headers
    csv += "Questions,#1 rating,#2 rating,#3 rating,CES Score\n"

    // Add question data
    surveyQuestions.forEach((question) => {
      const responses = mockResponses[question.id] || { rating1: 0, rating2: 0, rating3: 0 }
      csv += `"${question.text}",${responses.rating1},${responses.rating2},${responses.rating3},${calculateCESScore(question.id).toFixed(2)}\n`
    })

    // Add average CES score
    csv += `\nAvg. CES Score,${calculateAverageCESScore().toFixed(2)}\n`

    return csv
  }

  const saveSurvey = () => {
    // In a real application, this would save to a database
    try {
      localStorage.setItem("survey_questions", JSON.stringify(surveyQuestions))
      localStorage.setItem("survey_responses", JSON.stringify(mockResponses))
      return true
    } catch (error) {
      console.error("Error saving survey data:", error)
      return false
    }
  }

  const publishSurvey = () => {
    // In a real application, this would publish the survey for students
    return true
  }

  // Function to generate dynamic report data
  const generateReportData = () => {
    // Update mockResponses based on selected department
    setMockResponses(facultyResponses[selectedDepartment] || facultyResponses.CSE)

    // Update student counts
    const counts = departmentStudentCounts[selectedDepartment] || departmentStudentCounts.CSE
    setTotalStudents(counts.total)
    setRespondedStudents(counts.responded)

    // Show the report
    setShowReport(true)
  }

  return {
    courseCode,
    setCourseCode,
    courseName,
    setCourseName,
    semester,
    setSemester,
    faculty,
    setFaculty,
    questions,
    addQuestion,
    updateQuestion,
    removeQuestion,
    responses,
    addResponse,
    generateReport,
    report,
    exportSurveyCSV,
    saveSurveyData,
    surveyQuestions,
    newQuestion,
    setNewQuestion,
    editingQuestion,
    tempQuestionText,
    selectedFaculty,
    setSelectedFaculty,
    surveyDate,
    setSurveyDate,
    totalStudents,
    respondedStudents,
    mockResponses,
    showReport,
    setShowReport,
    selectedDepartment,
    setSelectedDepartment,
    selectedSection,
    setSelectedSection,
    facultyResponses,
    departmentStudentCounts,
    handleAddQuestion,
    handleRemoveQuestion,
    startEditingQuestion,
    saveEditQuestion,
    cancelEditQuestion,
    handleMockResponseChange,
    calculateCESScore,
    calculateAverageCESScore,
    exportSurveyToCSV,
    saveSurvey,
    publishSurvey,
    generateReportData,
  }
}
