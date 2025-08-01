"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import {
  Search,
  Filter,
  Edit,
  Trash,
  MoreHorizontal,
  UserPlus,
  Download,
  Upload,
  Check,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { apiService } from "@/lib/supabase-service"
import { ManualAddService } from "@/lib/manual-add-service"
import { getActiveRole } from "@/lib/role-switcher"
import type { StudentProfile, Department } from "@/lib/database-schema" // Import StudentProfile and Department

export default function StudentManagementPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("all")
  const [selectedSemester, setSelectedSemester] = useState("all")
  const [studentData, setStudentData] = useState<StudentProfile[]>([])
  const [isAddStudentDialogOpen, setIsAddStudentDialogOpen] = useState(false)
  const [isEditStudentDialogOpen, setIsEditStudentDialogOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState<StudentProfile | null>(null)
  const [newStudent, setNewStudent] = useState({
    name: "",
    usn: "",
    email: "",
    phone: "",
    department: "",
    semester: "",
    section: "",
    batch: "",
    password: "",
  })
  const [departments, setDepartments] = useState<Department[]>([])
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [activeRole, setActiveRole] = useState<string | null>(null)
  const [isAddingStudent, setIsAddingStudent] = useState(false)
  const [isEditingStudent, setIsEditingStudent] = useState(false)
  const [isDeletingStudent, setIsDeletingStudent] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)

  // Import dialog states
  const [importFile, setImportFile] = useState<File | null>(null)
  const [isImporting, setIsImporting] = useState(false)

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser)
      setUser(parsedUser)
      setActiveRole(getActiveRole(parsedUser))
    }

    const fetchData = async () => {
      await fetchDepartments()
      await fetchStudents()
    }
    fetchData()

    const handleRoleChange = () => {
      const storedUser = localStorage.getItem("user")
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser)
        setActiveRole(getActiveRole(parsedUser))
      }
    }
    window.addEventListener("roleChange", handleRoleChange)
    return () => window.removeEventListener("roleChange", handleRoleChange)
  }, [])

  const fetchStudents = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data: studentsFromDb, error } = await apiService.students.getAll()
      if (error) {
        console.error("Failed to fetch students:", error)
        setError(`Failed to load student data: ${error.message}`)
        toast({
          title: "Error",
          description: `Failed to load student data: ${error.message}. Please try again.`,
          variant: "destructive",
        })
        setStudentData([]) // Ensure studentData is an empty array on error
      } else {
        setStudentData(studentsFromDb || []) // Directly set the data, ensuring it's an array
      }
    } catch (err) {
      console.error("Failed to fetch students:", err)
      setError("Failed to load student data.")
      toast({
        title: "Error",
        description: "Failed to load student data. Please try again.",
        variant: "destructive",
      })
      setStudentData([]) // Ensure studentData is an empty array on error
    } finally {
      setLoading(false)
    }
  }

  const fetchDepartments = async () => {
    try {
      const { data: depts, error } = await apiService.departments.getAll()
      if (error) {
        console.error("Error fetching departments:", error)
        toast({
          title: "Error",
          description: `Failed to load department data: ${error.message}`,
          variant: "destructive",
        })
      } else {
        console.log("Fetched departments:", depts)
        setDepartments(depts || [])
      }
    } catch (error) {
      console.error("Error fetching departments:", error)
      toast({
        title: "Error",
        description: "Failed to load department data.",
        variant: "destructive",
      })
    }
  }

  const getDepartmentName = (shortName: string) => {
    const dept = departments.find((d) => d.short_name === shortName)
    return dept ? dept.name : shortName
  }

  const filteredStudents = useMemo(() => {
    let filtered = studentData

    if (searchTerm) {
      filtered = filtered.filter(
        (student) =>
          student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.usn.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.email.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (selectedDepartment !== "all") {
      filtered = filtered.filter((student) => student.department === selectedDepartment)
    }

    if (selectedSemester !== "all") {
      filtered = filtered.filter((student) => student.semester.toString() === selectedSemester)
    }

    return filtered
  }, [studentData, searchTerm, selectedDepartment, selectedSemester])

  const handleAddStudent = async () => {
    if (
      !newStudent.name ||
      !newStudent.usn ||
      !newStudent.email ||
      !newStudent.department ||
      !newStudent.semester ||
      !newStudent.section ||
      !newStudent.batch
    ) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setIsAddingStudent(true)

    try {
      const result = await ManualAddService.addStudent({
        name: newStudent.name,
        usn: newStudent.usn,
        email: newStudent.email,
        phone: newStudent.phone,
        department: newStudent.department,
        semester: Number.parseInt(newStudent.semester),
        section: newStudent.section,
        batch: newStudent.batch,
        password: newStudent.password || undefined,
      })

      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        })
        setIsAddStudentDialogOpen(false)
        setNewStudent({
          name: "",
          usn: "",
          email: "",
          phone: "",
          department: "",
          semester: "",
          section: "",
          batch: "",
          password: "",
        })
        fetchStudents()
      } else {
        toast({
          title: "Error",
          description: result.error || result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error adding student:", error)
      toast({
        title: "Error",
        description: "Failed to add student.",
        variant: "destructive",
      })
    } finally {
      setIsAddingStudent(false)
    }
  }

  const handleEditStudent = async () => {
    if (!editingStudent) return

    setIsEditingStudent(true)
    try {
      const [firstName, ...lastNameParts] = editingStudent.name.split(" ")
      const lastName = lastNameParts.join(" ")

      const updates: Partial<
        StudentProfile & {
          user: {
            first_name: string
            last_name: string
            email: string
            phone: string // Changed from phone_number
            department: string
            role: string
            is_active: boolean // Added is_active
            profile_picture: string // Added profile_picture
          }
        }
      > = {
        usn: editingStudent.usn,
        roll_number: editingStudent.roll_number,
        semester: editingStudent.semester,
        section: editingStudent.section,
        batch: editingStudent.batch,
        user: {
          first_name: firstName,
          last_name: lastName,
          email: editingStudent.email,
          phone: editingStudent.phone || "", // Changed from phone_number
          department: editingStudent.department,
          role: editingStudent.role,
          is_active: editingStudent.is_active, // Added is_active
          profile_picture: editingStudent.profilePicture || "", // Added profile_picture
        },
      }

      await apiService.students.update(editingStudent.user_id, updates)
      toast({
        title: "Success",
        description: "Student updated successfully.",
      })
      setIsEditStudentDialogOpen(false)
      fetchStudents()
    } catch (error) {
      console.error("Error updating student:", error)
      toast({
        title: "Error",
        description: `Failed to update student: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      })
    } finally {
      setIsEditingStudent(false)
    }
  }

  const handleDeleteStudent = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this student?")) {
      return
    }
    setIsDeletingStudent(true)
    try {
      await apiService.students.delete(id)
      toast({
        title: "Success",
        description: "Student deleted successfully.",
      })
      fetchStudents()
    } catch (err) {
      console.error("Failed to delete student:", err)
      toast({
        title: "Error",
        description: "Failed to delete student. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeletingStudent(false)
    }
  }

  const handleExportStudents = () => {
    const headers = ["Name", "USN", "Email", "Phone", "Department", "Semester", "Section", "Batch"]
    const csvContent = [
      headers.join(","),
      ...studentData.map((student) =>
        [
          student.name,
          student.usn,
          student.email,
          student.phone,
          getDepartmentName(student.department || ""),
          student.semester,
          student.section,
          student.batch,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "students.csv"
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)

    toast({
      title: "Export successful",
      description: "Student data has been exported to CSV.",
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.type !== "text/csv" && !selectedFile.name.endsWith(".csv")) {
        toast({
          title: "Invalid file type",
          description: "Please select a CSV file.",
          variant: "destructive",
        })
        return
      }
      setImportFile(selectedFile)
    }
  }

  const handleDownloadTemplate = async () => {
    const headers = [
      "name",
      "email",
      "password",
      "usn",
      "phone",
      "department",
      "semester",
      "section",
      "batch",
      "father_name",
      "father_phone",
      "address",
      "city",
      "state",
      "pincode",
      "country",
      "blood_group",
    ]
    const sampleData = [
      "John Doe",
      "john.doe@example.com",
      "password123",
      "1VA22CS001",
      "1234567890",
      "CSE",
      "5",
      "A",
      "2022",
      "Richard Doe",
      "0987654321",
      "123 Main St",
      "Springfield",
      "IL",
      "62701",
      "USA",
      "A+",
    ]

    const csvContent = [headers.join(","), sampleData.join("\n")].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "student_import_template.csv"
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)

    toast({
      title: "Template downloaded",
      description: "Student import template has been downloaded.",
    })
  }

  const handleImportStudents = async () => {
    if (!importFile) {
      toast({
        title: "No file selected",
        description: "Please select a CSV file to import.",
        variant: "destructive",
      })
      return
    }

    setIsImporting(true)

    try {
      const formData = new FormData()
      formData.append("file", importFile)
      formData.append("importType", "students")

      const response = await fetch("/api/users/import", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        setIsImportDialogOpen(false)
        setImportFile(null)
        fetchStudents() // Refresh data from DB after successful import

        toast({
          title: "Import successful",
          description: `${result.result.successfulImports} students have been imported successfully.`,
        })
      } else {
        toast({
          title: "Import failed",
          description: result.message || "Failed to import students.",
          variant: "destructive",
        })
        if (result.result?.errors && result.result.errors.length > 0) {
          result.result.errors.forEach((err: string) => {
            toast({
              title: `Import Error Detail - Row ${err.split(":")[0].replace("Row ", "")}`,
              description: err.split(":").slice(1).join(":").trim(),
              variant: "destructive",
            })
          })
        }
      }
    } catch (error) {
      toast({
        title: "Import error",
        description: `An error occurred during import: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      })
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Student Management</h2>
          <p className="text-muted-foreground">Manage student profiles and data</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 gap-1 bg-transparent" onClick={handleExportStudents}>
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
          {user?.role === "admin" && (
            <Button className="gap-1" onClick={() => setIsImportDialogOpen(true)}>
              <Upload className="h-4 w-4" />
              <span>Import Students</span>
            </Button>
          )}
          <Button className="gap-1" onClick={() => setIsAddStudentDialogOpen(true)}>
            <UserPlus className="h-4 w-4" />
            <span>Add Student</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 text-blue-500 dark:text-blue-400"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentData.length}</div>
            <p className="text-xs text-muted-foreground">Registered students</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 dark:bg-green-900/20 border-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Students</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 text-green-500 dark:text-green-400"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentData.filter((student) => student.is_active).length}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 dark:bg-purple-900/20 border-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 text-purple-500 dark:text-purple-400"
            >
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departments.length}</div>
            <p className="text-xs text-muted-foreground">Academic departments</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-50 dark:bg-amber-900/20 border-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. CGPA</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 text-amber-500 dark:text-amber-400"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(studentData.reduce((sum, student) => sum + (student.cgpa || 0), 0) / studentData.length || 0).toFixed(
                2,
              )}
            </div>
            <p className="text-xs text-muted-foreground">Overall academic performance</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="grid" className="space-y-4">
        <TabsList>
          <TabsTrigger value="grid">Grid View</TabsTrigger>
          <TabsTrigger value="table">Table View</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="space-y-4">
          <Card className="bg-white dark:bg-background">
            <CardHeader>
              <CardTitle>Student Directory</CardTitle>
              <CardDescription>View and manage all student members</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
                <div className="flex flex-1 items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-8 w-full md:w-[300px]"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                    <SelectTrigger className="h-8 w-[180px]">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {departments.map((dept) => (
                        <SelectItem key={dept.short_name} value={dept.short_name}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                    <SelectTrigger className="h-8 w-[180px]">
                      <SelectValue placeholder="Select semester" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Semesters</SelectItem>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                        <SelectItem key={sem} value={sem.toString()}>
                          Semester {sem}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredStudents.length === 0 ? (
                  <div className="col-span-full text-center py-4">No students found matching your search criteria</div>
                ) : (
                  filteredStudents.map((student) => (
                    <Card key={student.user_id} className="overflow-hidden">
                      <CardHeader className="bg-muted/30 pb-2">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <img
                              src={student.profilePicture || "/placeholder.svg?height=40&width=40"}
                              alt="Profile"
                              className="rounded-full w-10 h-10 object-cover"
                            />
                            <div>
                              <CardTitle className="text-base">{student.name}</CardTitle>
                              <CardDescription>
                                {getDepartmentName(student.department)} - Semester {student.semester}
                              </CardDescription>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditingStudent(student)
                                  setIsEditStudentDialogOpen(true)
                                }}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Edit Student</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteStudent(student.user_id)}
                                disabled={isDeletingStudent}
                              >
                                <Trash className="mr-2 h-4 w-4" />
                                <span>{isDeletingStudent ? "Deleting..." : "Delete Student"}</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-4 w-4 text-muted-foreground"
                            >
                              <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                              <path d="m22 7-8.97 5.7a1.93 1.93 0 0 1-2.06 0L2 7"></path>
                            </svg>
                            <span>{student.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-4 w-4 text-muted-foreground"
                            >
                              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-1.18 2.19l-.7.35a1.6 1.6 0 0 0-.43 2.37 1.6 1.6 0 0 0 2.37-.43l.35-.7A2 2 0 0 1 18.4 16.92Z"></path>
                            </svg>
                            <span>{student.phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-4 w-4 text-muted-foreground"
                            >
                              <path d="M12 2v20"></path>
                              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                            </svg>
                            <span>USN: {student.usn}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-4 w-4 text-muted-foreground"
                            >
                              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
                            </svg>
                            <span>Section: {student.section}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-4 w-4 text-muted-foreground"
                            >
                              <path d="M2 13.5V7.5a2.5 2.5 0 0 1 5 0v6a2.5 2.5 0 0 0 5 0V7.5a2.5 2.5 0 0 1 5 0v6a2.5 2.5 0 0 0 5 0v-6"></path>
                            </svg>
                            <span>Batch: {student.batch}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-4 w-4 text-muted-foreground"
                            >
                              <circle cx="12" cy="12" r="10"></circle>
                              <path d="M12 6v6l4 2"></path>
                            </svg>
                            <span>Status: {student.is_active ? "Active" : "Inactive"}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="table" className="space-y-4">
          <Card className="bg-white dark:bg-background">
            <CardHeader>
              <CardTitle>Student List</CardTitle>
              <CardDescription>View and manage all student members in a table format</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
                <div className="flex flex-1 items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-8 w-full md:w-[300px]"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                    <SelectTrigger className="h-8 w-[180px]">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {departments.map((dept) => (
                        <SelectItem key={dept.short_name} value={dept.short_name}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                    <SelectTrigger className="h-8 w-[180px]">
                      <SelectValue placeholder="Select semester" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Semesters</SelectItem>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                        <SelectItem key={sem} value={sem.toString()}>
                          Semester {sem}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>USN</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Semester</TableHead>
                      <TableHead>Section</TableHead>
                      <TableHead>Batch</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center">
                          No students found matching your search criteria
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredStudents.map((student) => (
                        <TableRow key={student.user_id}>
                          <TableCell className="font-medium">{student.name}</TableCell>
                          <TableCell>{student.usn}</TableCell>
                          <TableCell>{student.email}</TableCell>
                          <TableCell>{getDepartmentName(student.department)}</TableCell>
                          <TableCell>{student.semester}</TableCell>
                          <TableCell>{student.section}</TableCell>
                          <TableCell>{student.batch}</TableCell>
                          <TableCell>{student.is_active ? "Active" : "Inactive"}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setEditingStudent(student)
                                    setIsEditStudentDialogOpen(true)
                                  }}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  <span>Edit Student</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteStudent(student.user_id)}
                                  disabled={isDeletingStudent}
                                >
                                  <Trash className="mr-2 h-4 w-4" />
                                  <span>{isDeletingStudent ? "Deleting..." : "Delete Student"}</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Student Dialog */}
      <Dialog open={isAddStudentDialogOpen} onOpenChange={setIsAddStudentDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Add New Student</DialogTitle>
            <DialogDescription>Enter the details for the new student you want to add.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="usn">USN *</Label>
                <Input
                  id="usn"
                  placeholder="1VA22CS001"
                  value={newStudent.usn}
                  onChange={(e) => setNewStudent({ ...newStudent, usn: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john.doe@example.com"
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="1234567890"
                  value={newStudent.phone}
                  onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">Department *</Label>
                <Select
                  value={newStudent.department}
                  onValueChange={(value) => setNewStudent({ ...newStudent, department: value })}
                >
                  <SelectTrigger id="department">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.short_name} value={dept.short_name}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="semester">Semester *</Label>
                <Select
                  value={newStudent.semester}
                  onValueChange={(value) => setNewStudent({ ...newStudent, semester: value })}
                >
                  <SelectTrigger id="semester">
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                      <SelectItem key={sem} value={sem.toString()}>
                        {sem}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="section">Section *</Label>
                <Select
                  value={newStudent.section}
                  onValueChange={(value) => setNewStudent({ ...newStudent, section: value })}
                >
                  <SelectTrigger id="section">
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    {["A", "B", "C", "D", "E", "F", "G", "H"].map((sec) => (
                      <SelectItem key={sec} value={sec}>
                        {sec}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="batch">Batch *</Label>
                <Input
                  id="batch"
                  placeholder="2022"
                  value={newStudent.batch}
                  onChange={(e) => setNewStudent({ ...newStudent, batch: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password (optional)</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Leave empty for default password"
                  value={newStudent.password}
                  onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">If left empty, default password "student123" will be used</p>
            </div>
            <div className="text-sm text-muted-foreground">* Required fields</div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddStudentDialogOpen(false)} disabled={isAddingStudent}>
              Cancel
            </Button>
            <Button onClick={handleAddStudent} disabled={isAddingStudent}>
              {isAddingStudent ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Student"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Student Dialog */}
      <Dialog open={isEditStudentDialogOpen} onOpenChange={setIsEditStudentDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
            <DialogDescription>Update the details for the student.</DialogDescription>
          </DialogHeader>
          {editingStudent && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editName">Full Name *</Label>
                  <Input
                    id="editName"
                    placeholder="John Doe"
                    value={editingStudent.name}
                    onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editUsn">USN *</Label>
                  <Input
                    id="editUsn"
                    placeholder="1VA22CS001"
                    value={editingStudent.usn}
                    onChange={(e) => setEditingStudent({ ...editingStudent, usn: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editEmail">Email *</Label>
                  <Input
                    id="editEmail"
                    type="email"
                    placeholder="john.doe@example.com"
                    value={editingStudent.email}
                    onChange={(e) => setEditingStudent({ ...editingStudent, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editPhone">Phone</Label>
                  <Input
                    id="editPhone"
                    type="tel"
                    placeholder="1234567890"
                    value={editingStudent.phone}
                    onChange={(e) => setEditingStudent({ ...editingStudent, phone: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editDepartment">Department *</Label>
                  <Select
                    value={editingStudent.department}
                    onValueChange={(value) => setEditingStudent({ ...editingStudent, department: value })}
                  >
                    <SelectTrigger id="editDepartment">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.short_name} value={dept.short_name}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editSemester">Semester *</Label>
                  <Select
                    value={editingStudent.semester.toString()}
                    onValueChange={(value) =>
                      setEditingStudent({ ...editingStudent, semester: Number.parseInt(value) })
                    }
                  >
                    <SelectTrigger id="editSemester">
                      <SelectValue placeholder="Select semester" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                        <SelectItem key={sem} value={sem.toString()}>
                          {sem}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editSection">Section *</Label>
                  <Select
                    value={editingStudent.section}
                    onValueChange={(value) => setEditingStudent({ ...editingStudent, section: value as any })}
                  >
                    <SelectTrigger id="editSection">
                      <SelectValue placeholder="Select section" />
                    </SelectTrigger>
                    <SelectContent>
                      {["A", "B", "C", "D", "E", "F", "G", "H"].map((sec) => (
                        <SelectItem key={sec} value={sec}>
                          {sec}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editBatch">Batch *</Label>
                  <Input
                    id="editBatch"
                    placeholder="2022"
                    value={editingStudent.batch || ""}
                    onChange={(e) => setEditingStudent({ ...editingStudent, batch: e.target.value })}
                  />
                </div>
              </div>
              <div className="text-sm text-muted-foreground">* Required fields</div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditStudentDialogOpen(false)} disabled={isEditingStudent}>
              Cancel
            </Button>
            <Button onClick={handleEditStudent} disabled={isEditingStudent}>
              {isEditingStudent ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Student Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Import Students</DialogTitle>
            <DialogDescription>
              Upload a CSV file containing student data. The file should include columns for name, email, password, USN,
              phone, department, semester, section, and batch.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="importFile">CSV File</Label>
              <Input id="importFile" type="file" accept=".csv" onChange={handleFileChange} />
              <p className="text-xs text-muted-foreground">Supported formats: .csv</p>
            </div>
            <div className="space-y-2">
              <Label>Template</Label>
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">
                  Download the template file to ensure your data is formatted correctly.
                </p>
                <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
                  <Download className="h-4 w-4 mr-1" /> Template
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Required Fields</Label>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-1">
                  <Check className="h-3 w-3 text-green-500" /> Name
                </div>
                <div className="flex items-center gap-1">
                  <Check className="h-3 w-3 text-green-500" /> Email
                </div>
                <div className="flex items-center gap-1">
                  <Check className="h-3 w-3 text-green-500" /> Password
                </div>
                <div className="flex items-center gap-1">
                  <Check className="h-3 w-3 text-green-500" /> USN
                </div>
                <div className="flex items-center gap-1">
                  <Check className="h-3 w-3 text-green-500" /> Department
                </div>
                <div className="flex items-center gap-1">
                  <Check className="h-3 w-3 text-green-500" /> Semester
                </div>
                <div className="flex items-center gap-1">
                  <Check className="h-3 w-3 text-green-500" /> Section
                </div>
                <div className="flex items-center gap-1">
                  <Check className="h-3 w-3 text-green-500" /> Batch
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleImportStudents} disabled={isImporting}>
              {isImporting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Importing...
                </>
              ) : (
                "Import Students"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
