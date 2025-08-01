"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Progress } from "@/components/ui/progress"
import { FileSpreadsheet, Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Types
interface Student {
  id: string
  name: string
  rollNumber: string
  marks: {
    internal: number
    assignment: number
    test: number
    total: number
    percentage: number
  }
}

interface Faculty {
  id: string
  name: string
  department: string
  subjects: string[]
}

interface Subject {
  id: string
  code: string
  name: string
  department: string
  semester: number
}

interface Department {
  id: string
  name: string
}

interface Class {
  id: string
  name: string
  semester: number
}

interface Section {
  id: string
  name: string
}

interface FacultyPerformance {
  facultyId: string
  facultyName: string
  subjectId: string
  subjectName: string
  averageMarks: number
  passPercentage: number
  highestMarks: number
  lowestMarks: number
  studentCount: number
}

// Mock data
const departments: Department[] = [
  { id: "dept1", name: "Computer Science" },
  { id: "dept2", name: "Information Science" },
  { id: "dept3", name: "Electronics" },
  { id: "dept4", name: "Mechanical" },
]

const classes: Class[] = [
  { id: "class1", name: "1st Year", semester: 1 },
  { id: "class2", name: "2nd Year", semester: 3 },
  { id: "class3", name: "3rd Year", semester: 5 },
  { id: "class4", name: "4th Year", semester: 7 },
]

const sections: Section[] = [
  { id: "sec1", name: "A" },
  { id: "sec2", name: "B" },
  { id: "sec3", name: "C" },
]

const subjects: Subject[] = [
  { id: "sub1", code: "CS101", name: "Introduction to Programming", department: "Computer Science", semester: 1 },
  { id: "sub2", code: "CS201", name: "Data Structures", department: "Computer Science", semester: 3 },
  { id: "sub3", code: "CS301", name: "Database Systems", department: "Computer Science", semester: 5 },
  { id: "sub4", code: "CS401", name: "Artificial Intelligence", department: "Computer Science", semester: 7 },
  { id: "sub5", code: "IS101", name: "Information Systems", department: "Information Science", semester: 1 },
]

const faculties: Faculty[] = [
  { id: "fac1", name: "Dr. Rajesh Kumar", department: "Computer Science", subjects: ["sub1", "sub2"] },
  { id: "fac2", name: "Dr. Priya Sharma", department: "Computer Science", subjects: ["sub3"] },
  { id: "fac3", name: "Dr. Amit Patel", department: "Information Science", subjects: ["sub5"] },
  { id: "fac4", name: "Dr. Sneha Verma", department: "Computer Science", subjects: ["sub4"] },
]

// Generate mock student data
const generateStudents = (count: number): Student[] => {
  const students: Student[] = []
  const firstNames = [
    "Aarav",
    "Vivaan",
    "Aditya",
    "Vihaan",
    "Arjun",
    "Reyansh",
    "Ayaan",
    "Atharva",
    "Krishna",
    "Ishaan",
    "Shivay",
    "Advik",
    "Rudra",
    "Kabir",
    "Dhruv",
    "Aanya",
    "Aadhya",
    "Saanvi",
    "Myra",
    "Pari",
    "Ananya",
    "Aaradhya",
    "Diya",
    "Kiara",
    "Avni",
  ]
  const lastNames = [
    "Sharma",
    "Verma",
    "Patel",
    "Gupta",
    "Singh",
    "Kumar",
    "Joshi",
    "Yadav",
    "Mishra",
    "Shah",
    "Reddy",
    "Nair",
    "Iyer",
    "Mehta",
    "Kapoor",
    "Chauhan",
    "Jain",
    "Malhotra",
    "Bose",
    "Chatterjee",
  ]

  for (let i = 0; i < count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    const internal = Math.floor(Math.random() * 26) // 0-25
    const assignment = Math.floor(Math.random() * 26) // 0-25
    const test = Math.floor(Math.random() * 51) // 0-50
    const total = internal + assignment + test
    const percentage = Math.round((total / 100) * 100)

    students.push({
      id: `S${1000 + i}`,
      name: `${firstName} ${lastName}`,
      rollNumber: `CS${2023}${(i + 1).toString().padStart(3, "0")}`,
      marks: {
        internal,
        assignment,
        test,
        total,
        percentage,
      },
    })
  }

  return students
}

// Generate mock faculty performance data
const generateFacultyPerformance = (): FacultyPerformance[] => {
  const performances: FacultyPerformance[] = []

  faculties.forEach((faculty) => {
    faculty.subjects.forEach((subjectId) => {
      const subject = subjects.find((s) => s.id === subjectId)
      if (subject) {
        performances.push({
          facultyId: faculty.id,
          facultyName: faculty.name,
          subjectId: subject.id,
          subjectName: subject.name,
          averageMarks: Math.floor(Math.random() * 31) + 50, // 50-80
          passPercentage: Math.floor(Math.random() * 31) + 70, // 70-100
          highestMarks: Math.floor(Math.random() * 11) + 90, // 90-100
          lowestMarks: Math.floor(Math.random() * 21) + 30, // 30-50
          studentCount: Math.floor(Math.random() * 31) + 30, // 30-60
        })
      }
    })
  })

  return performances
}

// Mock data for students and faculty performance
const mockStudents = generateStudents(50)
const mockFacultyPerformance = generateFacultyPerformance()

export default function MarksReportPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("individual")

  // Filter states
  const [selectedDepartment, setSelectedDepartment] = useState<string>("")
  const [selectedClass, setSelectedClass] = useState<string>("")
  const [selectedSection, setSelectedSection] = useState<string>("")
  const [selectedSubject, setSelectedSubject] = useState<string>("")
  const [selectedFaculty, setSelectedFaculty] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState<string>("")

  // Data states
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([])
  const [facultyPerformance, setFacultyPerformance] = useState<FacultyPerformance[]>([])
  const [isReportGenerated, setIsReportGenerated] = useState(false)

  // Filter subjects based on selected department and class
  const filteredSubjects = subjects.filter((subject) => {
    if (selectedDepartment && selectedDepartment !== "all" && subject.department !== selectedDepartment) return false
    if (selectedClass) {
      const selectedClassObj = classes.find((c) => c.id === selectedClass)
      if (selectedClassObj && subject.semester !== selectedClassObj.semester) return false
    }
    return true
  })

  // Filter faculties based on selected department and subject
  const filteredFaculties = faculties.filter((faculty) => {
    if (selectedDepartment && selectedDepartment !== "all" && faculty.department !== selectedDepartment) return false
    if (selectedSubject && selectedSubject !== "all" && !faculty.subjects.includes(selectedSubject)) return false
    return true
  })

  // Generate report
  const handleGenerateReport = () => {
    // Filter students based on search query
    let filtered = [...mockStudents]
    if (searchQuery) {
      filtered = filtered.filter(
        (student) =>
          student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Apply random filtering to simulate real filtering
    filtered = filtered.slice(0, 20)

    setFilteredStudents(filtered)
    setFacultyPerformance(mockFacultyPerformance)
    setIsReportGenerated(true)

    toast({
      title: "Report Generated",
      description: "The marks report has been generated successfully.",
    })
  }

  // Export to CSV
  const exportToCSV = (type: "individual" | "consolidated") => {
    let csvContent = ""

    if (type === "individual") {
      // Headers
      csvContent = "Roll Number,Name,Internal Marks,Assignment Marks,Test Marks,Total Marks,Percentage\n"

      // Data
      filteredStudents.forEach((student) => {
        csvContent += `${student.rollNumber},${student.name},${student.marks.internal},${student.marks.assignment},${student.marks.test},${student.marks.total},${student.marks.percentage}%\n`
      })
    } else {
      // Headers
      csvContent = "Faculty Name,Subject Name,Average Marks,Pass Percentage,Highest Marks,Lowest Marks,Student Count\n"

      // Data
      facultyPerformance.forEach((perf) => {
        csvContent += `${perf.facultyName},${perf.subjectName},${perf.averageMarks},${perf.passPercentage}%,${perf.highestMarks},${perf.lowestMarks},${perf.studentCount}\n`
      })
    }

    // Create a blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `${type}-marks-report-${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Export Successful",
      description: `The ${type} marks report has been exported as CSV.`,
    })
  }

  // Calculate grade distribution for charts
  const calculateGradeDistribution = () => {
    const distribution = {
      "A+": 0,
      A: 0,
      "B+": 0,
      B: 0,
      C: 0,
      D: 0,
      F: 0,
    }

    filteredStudents.forEach((student) => {
      // distribution[student.marks.grade as keyof typeof distribution]++
    })

    return Object.entries(distribution).map(([grade, count]) => ({
      grade,
      count,
      percentage: Math.round((count / filteredStudents.length) * 100) || 0,
    }))
  }

  // Calculate subject performance for charts
  const calculateSubjectPerformance = () => {
    return facultyPerformance.map((perf) => ({
      subject: perf.subjectName,
      averageMarks: perf.averageMarks,
      passPercentage: perf.passPercentage,
    }))
  }

  // Calculate department performance for charts
  const calculateDepartmentPerformance = () => {
    const departmentMap = new Map<string, { total: number; count: number }>()

    facultyPerformance.forEach((perf) => {
      const faculty = faculties.find((f) => f.id === perf.facultyId)
      if (faculty) {
        const dept = faculty.department
        if (!departmentMap.has(dept)) {
          departmentMap.set(dept, { total: 0, count: 0 })
        }

        const current = departmentMap.get(dept)!
        current.total += perf.averageMarks
        current.count += 1
        departmentMap.set(dept, current)
      }
    })

    return Array.from(departmentMap.entries()).map(([department, data]) => ({
      department,
      averageMarks: Math.round(data.total / data.count),
    }))
  }

  // Prepare data for charts
  const gradeDistribution = calculateGradeDistribution()
  const subjectPerformance = calculateSubjectPerformance()
  const departmentPerformance = calculateDepartmentPerformance()

  // Colors for charts
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d", "#ffc658"]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Marks Report</h1>
        <p className="text-muted-foreground">View and analyze student marks data across faculty and departments</p>
      </div>

      <Tabs defaultValue="individual" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="individual">Individual Faculty Report</TabsTrigger>
          <TabsTrigger value="consolidated">Consolidated Faculty Report</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Report Filters</CardTitle>
              <CardDescription>Select filters to generate the marks report</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Class</label>
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Classes</SelectItem>
                      {classes.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name} (Semester {cls.semester})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Section</label>
                  <Select value={selectedSection} onValueChange={setSelectedSection}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select section" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sections</SelectItem>
                      {sections.map((section) => (
                        <SelectItem key={section.id} value={section.id}>
                          Section {section.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Subject</label>
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Subjects</SelectItem>
                      {filteredSubjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.code} - {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Faculty</label>
                  <Select value={selectedFaculty} onValueChange={setSelectedFaculty}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select faculty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Faculty</SelectItem>
                      {filteredFaculties.map((faculty) => (
                        <SelectItem key={faculty.id} value={faculty.id}>
                          {faculty.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {activeTab === "individual" && (
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">Search Student</label>
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by name or roll number"
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>

              <Button className="w-full" onClick={handleGenerateReport}>
                Generate Report
              </Button>
            </CardContent>
          </Card>
        </div>

        {isReportGenerated && (
          <TabsContent value="individual" className="mt-6 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Individual Student Marks</CardTitle>
                  <CardDescription>
                    Showing {filteredStudents.length} students
                    {selectedFaculty && ` for ${faculties.find((f) => f.id === selectedFaculty)?.name || ""}`}
                    {selectedSubject && ` in ${subjects.find((s) => s.id === selectedSubject)?.name || ""}`}
                  </CardDescription>
                </div>
                <Button variant="outline" onClick={() => exportToCSV("individual")}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Roll Number</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead className="text-center">Internal (25)</TableHead>
                        <TableHead className="text-center">Assignment (25)</TableHead>
                        <TableHead className="text-center">Test (50)</TableHead>
                        <TableHead className="text-center">Total (100)</TableHead>
                        <TableHead className="text-center">Percentage</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudents.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium">{student.rollNumber}</TableCell>
                          <TableCell>{student.name}</TableCell>
                          <TableCell className="text-center">{student.marks.internal}</TableCell>
                          <TableCell className="text-center">{student.marks.assignment}</TableCell>
                          <TableCell className="text-center">{student.marks.test}</TableCell>
                          <TableCell className="text-center font-medium">{student.marks.total}</TableCell>
                          <TableCell className="text-center">{student.marks.percentage}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Grade Distribution</CardTitle>
                  <CardDescription>Distribution of grades across selected students</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={gradeDistribution}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="grade" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" name="Number of Students" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Marks Distribution</CardTitle>
                  <CardDescription>Percentage of students in each grade category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={gradeDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                          nameKey="grade"
                        >
                          {gradeDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}

        {isReportGenerated && (
          <TabsContent value="consolidated" className="mt-6 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Faculty Performance Summary</CardTitle>
                  <CardDescription>Consolidated performance metrics across faculty members</CardDescription>
                </div>
                <Button variant="outline" onClick={() => exportToCSV("consolidated")}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold">
                          {Math.round(
                            facultyPerformance.reduce((acc, curr) => acc + curr.averageMarks, 0) /
                              facultyPerformance.length,
                          )}
                          %
                        </div>
                        <p className="text-xs text-muted-foreground">Average Marks</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold">
                          {Math.round(
                            facultyPerformance.reduce((acc, curr) => acc + curr.passPercentage, 0) /
                              facultyPerformance.length,
                          )}
                          %
                        </div>
                        <p className="text-xs text-muted-foreground">Pass Percentage</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold">
                          {Math.max(...facultyPerformance.map((p) => p.highestMarks))}
                        </div>
                        <p className="text-xs text-muted-foreground">Highest Marks</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold">
                          {facultyPerformance.reduce((acc, curr) => acc + curr.studentCount, 0)}
                        </div>
                        <p className="text-xs text-muted-foreground">Total Students</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Faculty</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead className="text-center">Average Marks</TableHead>
                        <TableHead className="text-center">Pass %</TableHead>
                        <TableHead className="text-center">Highest</TableHead>
                        <TableHead className="text-center">Lowest</TableHead>
                        <TableHead className="text-center">Students</TableHead>
                        <TableHead className="text-center">Performance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {facultyPerformance.map((perf, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{perf.facultyName}</TableCell>
                          <TableCell>{perf.subjectName}</TableCell>
                          <TableCell className="text-center">{perf.averageMarks}%</TableCell>
                          <TableCell className="text-center">{perf.passPercentage}%</TableCell>
                          <TableCell className="text-center">{perf.highestMarks}</TableCell>
                          <TableCell className="text-center">{perf.lowestMarks}</TableCell>
                          <TableCell className="text-center">{perf.studentCount}</TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center gap-2">
                              <Progress
                                value={perf.averageMarks}
                                className="h-2"
                                indicatorClassName={
                                  perf.averageMarks >= 80
                                    ? "bg-green-500"
                                    : perf.averageMarks >= 70
                                      ? "bg-blue-500"
                                      : perf.averageMarks >= 60
                                        ? "bg-yellow-500"
                                        : perf.averageMarks >= 50
                                          ? "bg-orange-500"
                                          : "bg-red-500"
                                }
                              />
                              <span className="text-xs">{perf.averageMarks}%</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Subject Performance Comparison</CardTitle>
                  <CardDescription>Average marks and pass percentage by subject</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={subjectPerformance}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="subject" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="averageMarks" name="Average Marks %" fill="#8884d8" />
                        <Bar dataKey="passPercentage" name="Pass %" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Department Performance</CardTitle>
                  <CardDescription>Average marks by department</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={departmentPerformance}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="department" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="averageMarks" name="Average Marks %" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Semester Trend Analysis</CardTitle>
                <CardDescription>Performance trends across semesters</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={[
                        { semester: "Semester 1", averageMarks: 72, passPercentage: 85 },
                        { semester: "Semester 2", averageMarks: 68, passPercentage: 82 },
                        { semester: "Semester 3", averageMarks: 75, passPercentage: 88 },
                        { semester: "Semester 4", averageMarks: 70, passPercentage: 84 },
                        { semester: "Semester 5", averageMarks: 73, passPercentage: 86 },
                        { semester: "Semester 6", averageMarks: 76, passPercentage: 89 },
                        { semester: "Semester 7", averageMarks: 78, passPercentage: 91 },
                        { semester: "Semester 8", averageMarks: 80, passPercentage: 93 },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="semester" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="averageMarks"
                        name="Average Marks %"
                        stroke="#8884d8"
                        activeDot={{ r: 8 }}
                      />
                      <Line type="monotone" dataKey="passPercentage" name="Pass %" stroke="#82ca9d" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
