"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Download, FileSpreadsheet, Search, Upload, UserPlus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CSVImportService } from "@/lib/csv-import-service"

interface Faculty {
  faculty_id: string
  faculty_name: string
  faculty_email: string
  faculty_phone: string
  designation: string
  employee_id: string
  current_proctees_count: number
  max_proctees: number
}

interface Student {
  student_id: string
  student_name: string
  student_usn: string
  student_email: string
  department: string
  semester: number
  section: string
  batch: string
}

interface Assignment {
  id: string
  name: string
  usn: string
  email: string
  phone: string
  department: string
  semester: number
  section: string
  batch: string
  cgpa: number
  parentName: string
  parentPhone: string
  assignedAt: string
}

export default function AssignProcteesPage() {
  const { toast } = useToast()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [user, setUser] = useState<any>(null)
  const [faculty, setFaculty] = useState<Faculty[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [selectedProctor, setSelectedProctor] = useState<string>("")
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [filterSemester, setFilterSemester] = useState<string>("all")
  const [filterSection, setFilterSection] = useState<string>("all")
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [showAssignDialog, setShowAssignDialog] = useState(false)
  const [showAddStudentDialog, setShowAddStudentDialog] = useState(false)
  const [activeTab, setActiveTab] = useState("assign")
  const [loading, setLoading] = useState(false)
  const [importLoading, setImportLoading] = useState(false)

  // New student form state
  const [newStudent, setNewStudent] = useState({
    name: "",
    email: "",
    usn: "",
    phone: "",
    semester: "",
    section: "",
    batch: "",
    father_name: "",
    father_phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    country: "",
    blood_group: "",
  })

  // Load user data and fetch initial data
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      const userData = JSON.parse(storedUser)
      setUser(userData)

      if (userData.department) {
        fetchFaculty(userData.department)
        fetchStudents(userData.department)
      }
    }
  }, [])

  // Fetch faculty from the same department
  const fetchFaculty = async (department: string) => {
    try {
      const response = await fetch(`/api/proctoring/faculty?department=${department}`)
      const result = await response.json()

      if (result.success) {
        setFaculty(result.data)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch faculty members",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching faculty:", error)
      toast({
        title: "Error",
        description: "Failed to fetch faculty members",
        variant: "destructive",
      })
    }
  }

  // Fetch available students
  const fetchStudents = async (department: string, semester?: string, section?: string) => {
    try {
      let url = `/api/proctoring/students?department=${department}`
      if (semester && semester !== "all") {
        url += `&semester=${semester}`
      }
      if (section && section !== "all") {
        url += `&section=${section}`
      }

      const response = await fetch(url)
      const result = await response.json()

      if (result.success) {
        setStudents(result.data)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch students",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching students:", error)
      toast({
        title: "Error",
        description: "Failed to fetch students",
        variant: "destructive",
      })
    }
  }

  // Fetch assignments for selected proctor
  const fetchAssignments = async (proctorId: string) => {
    try {
      const response = await fetch(`/api/proctoring/assignments?proctorId=${proctorId}`)
      const result = await response.json()

      if (result.success) {
        setAssignments(result.data)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch assignments",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching assignments:", error)
      toast({
        title: "Error",
        description: "Failed to fetch assignments",
        variant: "destructive",
      })
    }
  }

  // Get the current proctor details
  const currentProctor = faculty.find((f) => f.faculty_id === selectedProctor)

  // Get available students (filtered)
  const availableStudents = students.filter(
    (student) =>
      searchTerm === "" ||
      student.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.student_usn.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Handle proctor selection
  const handleProctorChange = (value: string) => {
    setSelectedProctor(value)
    setSelectedStudents([])
    if (value && activeTab === "view") {
      fetchAssignments(value)
    }
  }

  // Handle filter changes
  const handleFilterChange = () => {
    if (user?.department) {
      fetchStudents(user.department, filterSemester, filterSection)
    }
  }

  useEffect(() => {
    handleFilterChange()
  }, [filterSemester, filterSection])

  // Handle student selection
  const handleStudentSelection = (studentId: string) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId],
    )
  }

  // Handle select all students
  const handleSelectAllStudents = () => {
    if (selectedStudents.length === availableStudents.length) {
      setSelectedStudents([])
    } else {
      setSelectedStudents(availableStudents.map((student) => student.student_id))
    }
  }

  // Handle assign students to proctor
  const handleAssignStudents = async () => {
    if (!selectedProctor) {
      toast({
        title: "No proctor selected",
        description: "Please select a proctor first.",
        variant: "destructive",
      })
      return
    }

    if (selectedStudents.length === 0) {
      toast({
        title: "No students selected",
        description: "Please select at least one student to assign.",
        variant: "destructive",
      })
      return
    }

    if (!user?.id) {
      toast({
        title: "Authentication error",
        description: "Please log in again.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/proctoring/assign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          proctorId: selectedProctor,
          studentIds: selectedStudents,
          assignedBy: user.id,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Students assigned successfully",
          description: result.message,
        })

        // Refresh data
        if (user.department) {
          fetchStudents(user.department, filterSemester, filterSection)
          fetchFaculty(user.department)
        }

        // Clear selection
        setSelectedStudents([])
        setShowAssignDialog(false)
      } else {
        toast({
          title: "Assignment failed",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error assigning students:", error)
      toast({
        title: "Assignment failed",
        description: "An error occurred while assigning students.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Handle remove student from proctor
  const handleRemoveStudent = async (studentId: string) => {
    if (!selectedProctor) return

    try {
      const response = await fetch(`/api/proctoring/assignments?studentId=${studentId}&proctorId=${selectedProctor}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Student removed",
          description: result.message,
        })

        // Refresh assignments
        fetchAssignments(selectedProctor)

        // Refresh available students
        if (user?.department) {
          fetchStudents(user.department, filterSemester, filterSection)
          fetchFaculty(user.department)
        }
      } else {
        toast({
          title: "Remove failed",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error removing student:", error)
      toast({
        title: "Remove failed",
        description: "An error occurred while removing the student.",
        variant: "destructive",
      })
    }
  }

  // Handle add individual student
  const handleAddStudent = async () => {
    if (!newStudent.name || !newStudent.email || !newStudent.usn || !newStudent.semester || !newStudent.section) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields (Name, Email, USN, Semester, Section).",
        variant: "destructive",
      })
      return
    }

    if (!user?.department) {
      toast({
        title: "Authentication error",
        description: "Please log in again.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      // Create student data in the same format as CSV import
      const studentData = {
        ...newStudent,
        department: user.department,
        password: "student123", // Default password
        batch: newStudent.batch || new Date().getFullYear().toString(),
      }

      // Use the same CSV import service logic for consistency
      const csvContent = `name,email,password,usn,phone,department,semester,section,batch,father_name,father_phone,address,city,state,pincode,country,blood_group
${studentData.name},${studentData.email},${studentData.password},${studentData.usn},${studentData.phone || ""},${studentData.department},${studentData.semester},${studentData.section},${studentData.batch},${studentData.father_name || ""},${studentData.father_phone || ""},${studentData.address || ""},${studentData.city || ""},${studentData.state || ""},${studentData.pincode || ""},${studentData.country || ""},${studentData.blood_group || ""}`

      const result = await CSVImportService.processStudentImport(csvContent)

      if (result.success && result.successfulImports > 0) {
        toast({
          title: "Student added successfully",
          description: `${newStudent.name} has been added to the system.`,
        })

        // Reset form
        setNewStudent({
          name: "",
          email: "",
          usn: "",
          phone: "",
          semester: "",
          section: "",
          batch: "",
          father_name: "",
          father_phone: "",
          address: "",
          city: "",
          state: "",
          pincode: "",
          country: "",
          blood_group: "",
        })

        // Refresh students list
        if (user.department) {
          fetchStudents(user.department, filterSemester, filterSection)
        }

        setShowAddStudentDialog(false)
      } else {
        toast({
          title: "Failed to add student",
          description: result.errors.join(", "),
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error adding student:", error)
      toast({
        title: "Failed to add student",
        description: "An error occurred while adding the student.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Handle import Excel
  const handleImportExcel = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImportLoading(true)
    try {
      const text = await file.text()
      const result = await CSVImportService.processStudentImport(text)

      if (result.success) {
        toast({
          title: "Import successful",
          description: `Successfully imported ${result.successfulImports} students. ${result.failedImports} failed.`,
        })

        // Refresh students list
        if (user?.department) {
          fetchStudents(user.department, filterSemester, filterSection)
        }
      } else {
        toast({
          title: "Import failed",
          description: result.errors.join(", "),
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error importing file:", error)
      toast({
        title: "Import failed",
        description: "An error occurred while importing the file.",
        variant: "destructive",
      })
    } finally {
      setImportLoading(false)
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  // Handle export Excel
  const handleExportExcel = async () => {
    try {
      const template = await CSVImportService.generateTemplate("students")
      const blob = new Blob([template], { type: "text/csv" })
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
    } catch (error) {
      console.error("Error generating template:", error)
      toast({
        title: "Export failed",
        description: "Failed to generate template.",
        variant: "destructive",
      })
    }
  }

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    if (value === "view" && selectedProctor) {
      fetchAssignments(selectedProctor)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Assign Proctees</h1>
          <p className="text-muted-foreground">Assign students to faculty members for proctoring</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleImportExcel} disabled={importLoading}>
            <Upload className="mr-2 h-4 w-4" />
            {importLoading ? "Importing..." : "Import"}
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportExcel}>
            <Download className="mr-2 h-4 w-4" />
            Export Template
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowAddStudentDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Student
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileUpload}
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="assign">Assign Proctees</TabsTrigger>
          <TabsTrigger value="view">View Assignments</TabsTrigger>
        </TabsList>

        <TabsContent value="assign" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Select Proctor</CardTitle>
              <CardDescription>Choose a faculty member to assign students as proctees</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="proctor">Proctor</Label>
                    <Select value={selectedProctor} onValueChange={handleProctorChange}>
                      <SelectTrigger id="proctor">
                        <SelectValue placeholder="Select a proctor" />
                      </SelectTrigger>
                      <SelectContent>
                        {faculty.map((f) => (
                          <SelectItem key={f.faculty_id} value={f.faculty_id}>
                            {f.faculty_name} ({f.designation})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {currentProctor && (
                    <div className="md:col-span-2">
                      <div className="rounded-lg border p-3 h-full">
                        <div className="font-medium">Proctor Details</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          <div>Email: {currentProctor.faculty_email}</div>
                          <div>Designation: {currentProctor.designation}</div>
                          <div className="mt-1">
                            <Badge variant="outline" className="bg-primary/10">
                              {currentProctor.current_proctees_count} / {currentProctor.max_proctees} proctees assigned
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {selectedProctor && (
            <Card>
              <CardHeader>
                <CardTitle>Available Students</CardTitle>
                <CardDescription>Select students to assign to {currentProctor?.faculty_name}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="search"
                          placeholder="Search by name or USN..."
                          className="pl-8"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 sm:w-[260px]">
                      <div>
                        <Select value={filterSemester} onValueChange={setFilterSemester}>
                          <SelectTrigger id="semester">
                            <SelectValue placeholder="Semester" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Semesters</SelectItem>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                              <SelectItem key={sem} value={sem.toString()}>
                                {sem} Semester
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Select value={filterSection} onValueChange={setFilterSection}>
                          <SelectTrigger id="section">
                            <SelectValue placeholder="Section" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Sections</SelectItem>
                            {["A", "B", "C", "D"].map((section) => (
                              <SelectItem key={section} value={section}>
                                Section {section}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[40px]">
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-gray-300"
                              checked={
                                selectedStudents.length === availableStudents.length && availableStudents.length > 0
                              }
                              onChange={handleSelectAllStudents}
                            />
                          </TableHead>
                          <TableHead>USN</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Semester</TableHead>
                          <TableHead>Section</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {availableStudents.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                              No students available for assignment
                            </TableCell>
                          </TableRow>
                        ) : (
                          availableStudents.map((student) => (
                            <TableRow key={student.student_id}>
                              <TableCell>
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 rounded border-gray-300"
                                  checked={selectedStudents.includes(student.student_id)}
                                  onChange={() => handleStudentSelection(student.student_id)}
                                />
                              </TableCell>
                              <TableCell>{student.student_usn}</TableCell>
                              <TableCell>{student.student_name}</TableCell>
                              <TableCell>{student.semester}</TableCell>
                              <TableCell>{student.section}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-sm text-muted-foreground">{selectedStudents.length} students selected</div>
                <Button onClick={() => setShowAssignDialog(true)} disabled={selectedStudents.length === 0}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Assign to Proctor
                </Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="view" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Proctor Assignments</CardTitle>
              <CardDescription>View and manage student assignments to proctors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="view-proctor">Select Proctor</Label>
                    <Select value={selectedProctor} onValueChange={handleProctorChange}>
                      <SelectTrigger id="view-proctor">
                        <SelectValue placeholder="Select a proctor" />
                      </SelectTrigger>
                      <SelectContent>
                        {faculty.map((f) => (
                          <SelectItem key={f.faculty_id} value={f.faculty_id}>
                            {f.faculty_name} ({f.designation})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {selectedProctor && (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>USN</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Semester</TableHead>
                          <TableHead>Section</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {assignments.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                              No students assigned to this proctor
                            </TableCell>
                          </TableRow>
                        ) : (
                          assignments.map((assignment) => (
                            <TableRow key={assignment.id}>
                              <TableCell>{assignment.usn}</TableCell>
                              <TableCell>{assignment.name}</TableCell>
                              <TableCell>{assignment.semester}</TableCell>
                              <TableCell>{assignment.section}</TableCell>
                              <TableCell className="text-right">
                                <Button variant="ghost" size="sm" onClick={() => handleRemoveStudent(assignment.id)}>
                                  Remove
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </CardContent>
            {selectedProctor && assignments.length > 0 && (
              <CardFooter>
                <div className="text-sm text-muted-foreground">
                  Total: {assignments.length} students assigned to {currentProctor?.faculty_name}
                </div>
              </CardFooter>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Confirmation Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Assignment</DialogTitle>
            <DialogDescription>
              You are about to assign {selectedStudents.length} students to {currentProctor?.faculty_name}. This action
              can be reversed later if needed.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="rounded-md bg-muted p-4">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Assignment Summary</span>
              </div>
              <ul className="mt-2 ml-6 list-disc text-sm">
                <li>Proctor: {currentProctor?.faculty_name}</li>
                <li>Designation: {currentProctor?.designation}</li>
                <li>Students to assign: {selectedStudents.length}</li>
                <li>Current assignments: {currentProctor?.current_proctees_count}</li>
                <li>Maximum allowed: {currentProctor?.max_proctees}</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssignStudents} disabled={loading}>
              {loading ? "Assigning..." : "Confirm Assignment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Student Dialog */}
      <Dialog open={showAddStudentDialog} onOpenChange={setShowAddStudentDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Student</DialogTitle>
            <DialogDescription>Add a new student to the system for proctor assignment</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="student-name">Name *</Label>
                <Input
                  id="student-name"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                  placeholder="Full name"
                />
              </div>
              <div>
                <Label htmlFor="student-email">Email *</Label>
                <Input
                  id="student-email"
                  type="email"
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                  placeholder="student@example.com"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="student-usn">USN *</Label>
                <Input
                  id="student-usn"
                  value={newStudent.usn}
                  onChange={(e) => setNewStudent({ ...newStudent, usn: e.target.value })}
                  placeholder="1DS21CS001"
                />
              </div>
              <div>
                <Label htmlFor="student-phone">Phone</Label>
                <Input
                  id="student-phone"
                  value={newStudent.phone}
                  onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                  placeholder="Phone number"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="student-semester">Semester *</Label>
                <Select
                  value={newStudent.semester}
                  onValueChange={(value) => setNewStudent({ ...newStudent, semester: value })}
                >
                  <SelectTrigger>
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
              <div>
                <Label htmlFor="student-section">Section *</Label>
                <Select
                  value={newStudent.section}
                  onValueChange={(value) => setNewStudent({ ...newStudent, section: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    {["A", "B", "C", "D"].map((section) => (
                      <SelectItem key={section} value={section}>
                        {section}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="student-batch">Batch</Label>
                <Input
                  id="student-batch"
                  value={newStudent.batch}
                  onChange={(e) => setNewStudent({ ...newStudent, batch: e.target.value })}
                  placeholder="2024"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="student-father-name">Father's Name</Label>
                <Input
                  id="student-father-name"
                  value={newStudent.father_name}
                  onChange={(e) => setNewStudent({ ...newStudent, father_name: e.target.value })}
                  placeholder="Father's name"
                />
              </div>
              <div>
                <Label htmlFor="student-father-phone">Father's Phone</Label>
                <Input
                  id="student-father-phone"
                  value={newStudent.father_phone}
                  onChange={(e) => setNewStudent({ ...newStudent, father_phone: e.target.value })}
                  placeholder="Father's phone number"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="student-address">Address</Label>
                <Input
                  id="student-address"
                  value={newStudent.address}
                  onChange={(e) => setNewStudent({ ...newStudent, address: e.target.value })}
                  placeholder="Address"
                />
              </div>
              <div>
                <Label htmlFor="student-city">City</Label>
                <Input
                  id="student-city"
                  value={newStudent.city}
                  onChange={(e) => setNewStudent({ ...newStudent, city: e.target.value })}
                  placeholder="City"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="student-state">State</Label>
                <Input
                  id="student-state"
                  value={newStudent.state}
                  onChange={(e) => setNewStudent({ ...newStudent, state: e.target.value })}
                  placeholder="State"
                />
              </div>
              <div>
                <Label htmlFor="student-pincode">Pincode</Label>
                <Input
                  id="student-pincode"
                  value={newStudent.pincode}
                  onChange={(e) => setNewStudent({ ...newStudent, pincode: e.target.value })}
                  placeholder="Pincode"
                />
              </div>
              <div>
                <Label htmlFor="student-blood-group">Blood Group</Label>
                <Select
                  value={newStudent.blood_group}
                  onValueChange={(value) => setNewStudent({ ...newStudent, blood_group: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Blood group" />
                  </SelectTrigger>
                  <SelectContent>
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                      <SelectItem key={bg} value={bg}>
                        {bg}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddStudentDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddStudent} disabled={loading}>
              {loading ? "Adding..." : "Add Student"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
