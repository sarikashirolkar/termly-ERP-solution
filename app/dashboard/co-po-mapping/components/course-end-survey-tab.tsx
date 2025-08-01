"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pencil, Trash, FileText, Download, Plus } from "lucide-react"

export default function CourseEndSurveyTab({ courseConfig }: { courseConfig: any }) {
  const [activeTab, setActiveTab] = useState("create")
  const [questions, setQuestions] = useState([
    "Have you applied the knowledge of the course to solve problems related to the subject?",
    "Rate your idea of analyzing the solutions of problems related to the course",
    "Have you got acquainted with and able to apply the concepts learned in this course?",
    "Rate your knowledge of making use of the course concepts for solving problems",
    "How much you familiarize with modern tools related to this course?",
  ])
  const [newQuestion, setNewQuestion] = useState("")
  const [createSurveyOpen, setCreateSurveyOpen] = useState(false)
  const [showReportCard, setShowReportCard] = useState(false)

  // Department, semester, section, subject data
  const [department, setDepartment] = useState("Computer Science")
  const [semester, setSemester] = useState("Semester 1")
  const [section, setSection] = useState("C")
  const [subject, setSubject] = useState("CS101: Introduction to Computer Science")

  // Replace the reportData constant with this state
  const [reportData, setReportData] = useState<any>(null)

  // Add this function after the state declarations
  const generateReportData = () => {
    // Generate different data based on selected options
    const data = {
      collegeName: "Sri Sai Vidya Vikas Shikshana Samithi (R)",
      instituteDetails: "Sri Vidya Institute of Technology",
      accreditation: "Approved by AICTE, New Delhi & Affiliated to VTU, Belagavi",
      address: "SOLADEVANAHALLI, BENGALURU-560 107, KARNATAKA",
      facultyName:
        department === "Computer Science" ? "Rajendra S" : department === "Electronics" ? "Priya M" : "Suresh K",
      subjectCode: subject,
      academicYear: "1-2023-05-14",
      department: department === "Computer Science" ? "CSE" : department === "Electronics" ? "ECE" : "MECH",
      semester: semester.split(" ")[1],
      section: section,
      totalStudents:
        department === "Computer Science"
          ? "45 Out of 64 (70.31%)"
          : department === "Electronics"
            ? "38 Out of 52 (73.08%)"
            : "42 Out of 60 (70.00%)",
      questionData: [
        {
          question: "Have you applied the knowledge of the course to solve problems related to the subject?",
          rating1: department === "Computer Science" ? 0 : department === "Electronics" ? 2 : 1,
          rating2: department === "Computer Science" ? 13 : department === "Electronics" ? 10 : 15,
          rating3: department === "Computer Science" ? 32 : department === "Electronics" ? 26 : 26,
          cesScore: department === "Computer Science" ? 2.71 : department === "Electronics" ? 2.63 : 2.6,
        },
        {
          question: "Rate your idea of analyzing the solutions of problems related to the course",
          rating1: department === "Computer Science" ? 2 : department === "Electronics" ? 1 : 3,
          rating2: department === "Computer Science" ? 12 : department === "Electronics" ? 14 : 10,
          rating3: department === "Computer Science" ? 31 : department === "Electronics" ? 23 : 29,
          cesScore: department === "Computer Science" ? 2.64 : department === "Electronics" ? 2.58 : 2.62,
        },
        {
          question: "Have you got acquainted with and able to apply the concepts learned in this course?",
          rating1: department === "Computer Science" ? 1 : department === "Electronics" ? 0 : 2,
          rating2: department === "Computer Science" ? 10 : department === "Electronics" ? 12 : 8,
          rating3: department === "Computer Science" ? 34 : department === "Electronics" ? 26 : 32,
          cesScore: department === "Computer Science" ? 2.73 : department === "Electronics" ? 2.68 : 2.71,
        },
        {
          question: "Rate your knowledge of making use of the course concepts for solving problems",
          rating1: department === "Computer Science" ? 1 : department === "Electronics" ? 2 : 0,
          rating2: department === "Computer Science" ? 8 : department === "Electronics" ? 10 : 12,
          rating3: department === "Computer Science" ? 36 : department === "Electronics" ? 26 : 30,
          cesScore: department === "Computer Science" ? 2.78 : department === "Electronics" ? 2.63 : 2.71,
        },
        {
          question: "How much you familiarize with modern tools related to this course?",
          rating1: department === "Computer Science" ? 3 : department === "Electronics" ? 4 : 2,
          rating2: department === "Computer Science" ? 15 : department === "Electronics" ? 12 : 18,
          rating3: department === "Computer Science" ? 27 : department === "Electronics" ? 22 : 22,
          cesScore: department === "Computer Science" ? 2.53 : department === "Electronics" ? 2.47 : 2.48,
        },
      ],
      avgCesScore: department === "Computer Science" ? 2.68 : department === "Electronics" ? 2.6 : 2.62,
    }
    return data
  }

  const handleAddQuestion = () => {
    if (newQuestion.trim() !== "") {
      setQuestions([...questions, newQuestion])
      setNewQuestion("")
    }
  }

  const handleDeleteQuestion = (index: number) => {
    const updatedQuestions = [...questions]
    updatedQuestions.splice(index, 1)
    setQuestions(updatedQuestions)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-2xl font-bold">Course End Survey</h2>
        <p className="text-muted-foreground">Create and manage course end surveys for student feedback</p>
      </div>

      <div className="flex justify-between items-center">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
          <TabsList>
            <TabsTrigger value="create">Create Survey</TabsTrigger>
            <TabsTrigger value="view">View Report</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setCreateSurveyOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Survey
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button>
            <FileText className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      {activeTab === "create" && (
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="font-medium">Add Question</label>
            <div className="flex space-x-2">
              <Input
                placeholder="Enter a new question for the survey"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleAddQuestion}>
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </div>
          </div>

          <Card className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">No.</TableHead>
                  <TableHead>Question</TableHead>
                  <TableHead className="w-32 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {questions.map((question, index) => (
                  <TableRow key={index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{question}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteQuestion(index)}>
                        <Trash className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          <div className="flex justify-end space-x-2">
            <Button variant="outline">Save as Draft</Button>
            <Button>Publish Survey</Button>
          </div>
        </div>
      )}

      {activeTab === "view" && (
        <div className="space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Department</label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Computer Science">Computer Science</SelectItem>
                  <SelectItem value="Electronics">Electronics</SelectItem>
                  <SelectItem value="Mechanical">Mechanical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Semester</label>
              <Select value={semester} onValueChange={setSemester}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Semester 1">Semester 1</SelectItem>
                  <SelectItem value="Semester 2">Semester 2</SelectItem>
                  <SelectItem value="Semester 3">Semester 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Subject</label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CS101: Introduction to Computer Science">
                    CS101: Introduction to Computer Science
                  </SelectItem>
                  <SelectItem value="CS102: Data Structures">CS102: Data Structures</SelectItem>
                  <SelectItem value="CS103: Algorithms">CS103: Algorithms</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Section</label>
              <Select value={section} onValueChange={setSection}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select section" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">A</SelectItem>
                  <SelectItem value="B">B</SelectItem>
                  <SelectItem value="C">C</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={() => {
                setReportData(generateReportData())
                setShowReportCard(true)
              }}
            >
              Generate Report
            </Button>
          </div>

          {showReportCard && reportData && (
            <>
              <Card className="border rounded-md p-6">
                <div className="text-center space-y-1 mb-6">
                  <h3 className="font-bold">{reportData.collegeName}</h3>
                  <p className="font-semibold">{reportData.instituteDetails}</p>
                  <p className="text-sm">{reportData.accreditation}</p>
                  <p className="text-sm">{reportData.address}</p>
                  <h4 className="font-bold mt-4">COURSE END SURVEY REPORT</h4>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p>
                      <span className="font-medium">Faculty Name:</span> {reportData.facultyName}
                    </p>
                    <p>
                      <span className="font-medium">Subject Code and Name:</span> {reportData.subjectCode}
                    </p>
                    <p>
                      <span className="font-medium">Academic Year and Date of CES:</span> {reportData.academicYear}
                    </p>
                    <p>
                      <span className="font-medium">Department:</span> {reportData.department}
                    </p>
                  </div>
                  <div>
                    <p>
                      <span className="font-medium">Semester:</span> {reportData.semester}
                    </p>
                    <p>
                      <span className="font-medium">Section:</span> {reportData.section}
                    </p>
                    <p>
                      <span className="font-medium">Total Number of Students Given CES:</span>{" "}
                      {reportData.totalStudents}
                    </p>
                  </div>
                </div>

                <h4 className="font-medium mb-2">Question Wise Analysis</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Questions</TableHead>
                      <TableHead className="text-center">#1 rating</TableHead>
                      <TableHead className="text-center">#2 rating</TableHead>
                      <TableHead className="text-center">#3 rating</TableHead>
                      <TableHead className="text-center">CES Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.questionData.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.question}</TableCell>
                        <TableCell className="text-center">{item.rating1}</TableCell>
                        <TableCell className="text-center">{item.rating2}</TableCell>
                        <TableCell className="text-center">{item.rating3}</TableCell>
                        <TableCell className="text-center">{item.cesScore.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={4} className="text-right font-medium">
                        Avg. CES Score
                      </TableCell>
                      <TableCell className="text-center font-medium">{reportData.avgCesScore.toFixed(2)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>

                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div>
                    <p className="font-medium">Faculty Signature</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">Signature of HoD</p>
                  </div>
                </div>
              </Card>

              <div className="flex justify-end space-x-2">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
                <Button>Print Report</Button>
              </div>
            </>
          )}
        </div>
      )}

      <Dialog open={createSurveyOpen} onOpenChange={setCreateSurveyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Course End Survey</DialogTitle>
            <DialogDescription>Configure the details for the new course end survey.</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Department</label>
              <Select defaultValue="Computer Science">
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Computer Science">Computer Science</SelectItem>
                  <SelectItem value="Electronics">Electronics</SelectItem>
                  <SelectItem value="Mechanical">Mechanical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Semester</label>
              <Select defaultValue="Semester 1">
                <SelectTrigger>
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Semester 1">Semester 1</SelectItem>
                  <SelectItem value="Semester 2">Semester 2</SelectItem>
                  <SelectItem value="Semester 3">Semester 3</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Section</label>
              <Select defaultValue="A">
                <SelectTrigger>
                  <SelectValue placeholder="Select section" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">A</SelectItem>
                  <SelectItem value="B">B</SelectItem>
                  <SelectItem value="C">C</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Subject</label>
              <Select defaultValue="CS101: Introduction to Computer Science">
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CS101: Introduction to Computer Science">
                    CS101: Introduction to Computer Science
                  </SelectItem>
                  <SelectItem value="CS102: Data Structures">CS102: Data Structures</SelectItem>
                  <SelectItem value="CS103: Algorithms">CS103: Algorithms</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={() => setCreateSurveyOpen(false)}>Create Survey</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
