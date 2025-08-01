"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Edit, Plus, Search, Download, Upload } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { createClient } from "@supabase/supabase-js"
import type { SubjectType, Enums } from "@/lib/database-schema" // Import SubjectType and Enums

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

// Use SubjectType from database-schema for consistency and extend it
interface Subject extends SubjectType {
  academic_year?: string
  faculty_id?: string
  faculty_name?: string
  section?: string
}

interface User {
  id: string
  name: string
  email: string
  role: string
  department?: string
}

export default function ManageSubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterSemester, setFilterSemester] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    semester: "",
    credits: "",
    academic_year: "",
    course_category: "" as Enums<"course_category_type"> | "", // New field
    has_theory: false, // New field
    has_lab: false, // New field
    has_project: false, // NEW FIELD
  })

  // Academic year options
  const getAcademicYearOptions = () => {
    const currentYear = new Date().getFullYear()
    const options = []

    for (let i = 0; i < 3; i++) {
      const year = currentYear - i
      const nextYear = year + 1
      options.push(`${year}-${nextYear.toString().slice(-2)}(odd)`)
      options.push(`${year}-${nextYear.toString().slice(-2)}(even)`)
    }

    return options
  }

  // Get semester options based on academic year
  const getSemesterOptions = (academicYear: string) => {
    if (academicYear.includes("odd")) {
      return [1, 3, 5, 7]
    } else if (academicYear.includes("even")) {
      return [2, 4, 6, 8]
    }
    return [1, 2, 3, 4, 5, 6, 7, 8]
  }

  useEffect(() => {
    // Get current user from localStorage
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      const user = JSON.parse(storedUser)
      setCurrentUser(user)
    }
  }, [])

  useEffect(() => {
    if (currentUser) {
      fetchSubjects()
    }
  }, [currentUser])

  const fetchSubjects = async () => {
    try {
      setLoading(true)
      let query = supabase.from("subjects").select("*")

      // Filter by user's department if they are a coordinator
      if (currentUser?.role === "coordinator" && currentUser?.department) {
        query = query.eq("department", currentUser.department)
      }

      const { data, error } = await query.order("code")

      if (error) {
        console.error("Error fetching subjects:", error)
        toast({
          title: "Error",
          description: "Failed to fetch subjects",
          variant: "destructive",
        })
        return
      }

      setSubjects(data || [])
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "Failed to fetch subjects",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSubject = async () => {
    try {
      console.log("handleSaveSubject called")
      // Validate required fields
      if (
        !formData.code ||
        !formData.name ||
        !formData.semester ||
        !formData.credits ||
        !formData.academic_year ||
        !formData.course_category
      ) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        })
        console.log("Validation failed: Missing required fields")
        return
      }

      // Client-side validation for academic_year format
      const academicYear = formData.academic_year.trim() // Trim whitespace
      const academicYearRegex = /^\d{4}-\d{2}\(odd|even\)$/

      console.log("Academic Year value:", academicYear)
      console.log("Regex test result:", academicYearRegex.test(academicYear))

      if (!academicYearRegex.test(academicYear)) {
        toast({
          title: "Validation Error",
          description: "Academic Year must be in format YYYY-YY(odd) or YYYY-YY(even) (e.g., 2024-25(odd))",
          variant: "destructive",
        })
        console.log("Validation failed: Academic year format incorrect", academicYear)
        return
      }

      const subjectData = {
        code: formData.code,
        name: formData.name,
        department: currentUser?.department || "",
        semester: Number.parseInt(formData.semester),
        credits: Number.parseInt(formData.credits),
        academic_year: formData.academic_year,
        course_category: formData.course_category, // Save new field
        has_theory: formData.has_theory, // Save new field
        has_lab: formData.has_lab, // Save new field
        has_project: formData.has_project, // NEW FIELD
      }

      console.log("Attempting to save subject with data:", subjectData)

      let result
      if (editingSubject) {
        // Update existing subject
        console.log("Updating existing subject:", editingSubject.id)
        result = await supabase.from("subjects").update(subjectData).eq("id", editingSubject.id).select()
      } else {
        // Create new subject
        console.log("Creating new subject.")
        result = await supabase.from("subjects").insert([subjectData]).select()
      }

      if (result.error) {
        console.error("Error saving subject:", result.error)
        toast({
          title: "Error",
          description: `Failed to ${editingSubject ? "update" : "create"} subject: ${result.error.message}`,
          variant: "destructive",
        })
        return
      }

      console.log("Subject saved successfully:", result.data)
      toast({
        title: "Success",
        description: `Subject ${editingSubject ? "updated" : "created"} successfully`,
      })

      // Reset form and close dialog
      setFormData({
        code: "",
        name: "",
        semester: "",
        credits: "",
        academic_year: "",
        course_category: "",
        has_theory: false,
        has_lab: false,
        has_project: false, // Reset new field
      })
      setIsAddDialogOpen(false)
      setIsEditDialogOpen(false)
      setEditingSubject(null)

      // Refresh subjects list
      fetchSubjects()
    } catch (error) {
      console.error("Caught unexpected error saving subject:", error)
      toast({
        title: "Error",
        description: "Failed to save subject due to an unexpected error.",
        variant: "destructive",
      })
    }
  }

  const handleEditSubject = (subject: Subject) => {
    setEditingSubject(subject)
    setFormData({
      code: subject.code,
      name: subject.name,
      semester: subject.semester.toString(),
      credits: subject.credits.toString(),
      academic_year: subject.academic_year || "",
      course_category: subject.course_category || "", // Set new field
      has_theory: subject.has_theory || false, // Set new field
      has_lab: subject.has_lab || false, // Set new field
      has_project: subject.has_project || false, // Set NEW FIELD
    })
    setIsEditDialogOpen(true)
  }

  const handleDeleteSubject = async (id: string) => {
    if (!confirm("Are you sure you want to delete this subject?")) {
      return
    }

    try {
      const { error } = await supabase.from("subjects").delete().eq("id", id)

      if (error) {
        console.error("Error deleting subject:", error)
        toast({
          title: "Error",
          description: "Failed to delete subject",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Success",
        description: "Subject deleted successfully",
      })

      fetchSubjects()
    } catch (error) {
      console.error("Error deleting subject:", error)
      toast({
        title: "Error",
        description: "Failed to delete subject",
        variant: "destructive",
      })
    }
  }

  const handleImportSubjects = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      // Add department for coordinator
      if (currentUser?.department) {
        formData.append("department", currentUser.department)
      }

      const response = await fetch("/api/subjects/import", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to import subjects.")
      }

      toast({
        title: "Import Successful",
        description: `${result.importedCount} subjects imported. ${result.skippedCount} skipped.`,
      })

      fetchSubjects()
    } catch (error: any) {
      toast({
        title: "Import Failed",
        description: error.message || "An unexpected error occurred during import.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      event.target.value = ""
    }
  }

  const handleExportSubjects = async () => {
    setLoading(true)
    try {
      let url = "/api/subjects/export"
      if (currentUser?.department) {
        url += `?department=${currentUser.department}`
      }

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error("Failed to export subjects.")
      }

      const blob = await response.blob()
      const urlBlob = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = urlBlob
      a.download = "subjects.csv"
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(urlBlob)

      toast({
        title: "Export Successful",
        description: "Subjects data exported to CSV.",
      })
    } catch (error: any) {
      toast({
        title: "Export Failed",
        description: error.message || "Failed to export subjects. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredSubjects = subjects.filter((subject) => {
    const matchesSearch =
      searchTerm === "" ||
      subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.code.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSemester = filterSemester === "all" || subject.semester.toString() === filterSemester

    return matchesSearch && matchesSemester
  })

  const SubjectDialog = ({
    isOpen,
    onOpenChange,
    title,
    description,
  }: {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    title: string
    description: string
  }) => (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="code" className="text-right">
              Code
            </Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className="col-span-3"
              placeholder="e.g., CS101"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="col-span-3"
              placeholder="Subject name"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="credits" className="text-right">
              Credits
            </Label>
            <Input
              id="credits"
              type="number"
              value={formData.credits}
              onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
              className="col-span-3"
              placeholder="4"
              min="1"
              max="10"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="academic_year" className="text-right">
              Academic Year
            </Label>
            <Select
              value={formData.academic_year}
              onValueChange={(value) => {
                setFormData({ ...formData, academic_year: value, semester: "" })
              }}
            >
              <SelectTrigger className="col-span-3 w-full">
                <SelectValue placeholder="Select academic year" />
              </SelectTrigger>
              <SelectContent>
                {getAcademicYearOptions().map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="semester" className="text-right">
              Semester
            </Label>
            <Select
              value={formData.semester}
              onValueChange={(value) => setFormData({ ...formData, semester: value })}
              disabled={!formData.academic_year}
            >
              <SelectTrigger className="col-span-3 w-full">
                <SelectValue placeholder="Select semester" />
              </SelectTrigger>
              <SelectContent>
                {getSemesterOptions(formData.academic_year).map((sem) => (
                  <SelectItem key={sem} value={sem.toString()}>
                    Semester {sem}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* New Course Type dropdown */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="course_category" className="text-right">
              Course Type
            </Label>
            <Select
              value={formData.course_category}
              onValueChange={(value: Enums<"course_category_type">) =>
                setFormData({ ...formData, course_category: value })
              }
            >
              <SelectTrigger className="col-span-3 w-full">
                <SelectValue placeholder="Select course type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IPCC">IPCC</SelectItem>
                <SelectItem value="PCC">PCC</SelectItem>
                <SelectItem value="PEC">PEC</SelectItem>
                <SelectItem value="OEC">OEC</SelectItem>
                <SelectItem value="PROJ">PROJ</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* New Theory, Lab, and Project checkboxes */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Components</Label>
            <div className="col-span-3 flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="has_theory"
                  checked={formData.has_theory}
                  onChange={(e) => setFormData({ ...formData, has_theory: e.target.checked })}
                  className="h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary"
                />
                <Label htmlFor="has_theory">Theory</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="has_lab"
                  checked={formData.has_lab}
                  onChange={(e) => setFormData({ ...formData, has_lab: e.target.checked })}
                  className="h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary"
                />
                <Label htmlFor="has_lab">Lab</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="has_project"
                  checked={formData.has_project}
                  onChange={(e) => setFormData({ ...formData, has_project: e.target.checked })}
                  className="h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary"
                />
                <Label htmlFor="has_project">Project</Label>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveSubject}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading subjects...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Manage Subjects</h1>
          <p className="text-muted-foreground">
            Add, edit, and manage course subjects for {currentUser?.department} department
          </p>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleExportSubjects} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Input
            type="file"
            accept=".csv"
            onChange={handleImportSubjects}
            className="hidden"
            id="import-subjects-file-input"
          />
          <Label htmlFor="import-subjects-file-input" className="cursor-pointer">
            <Button asChild variant="outline">
              <span>
                <Upload className="mr-2 h-4 w-4" />
                Import CSV
              </span>
            </Button>
          </Label>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Subject
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Subject</DialogTitle>
                <DialogDescription>Add a new subject to the system.</DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="code" className="text-right">
                    Code
                  </Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="col-span-3"
                    placeholder="e.g., CS101"
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="col-span-3"
                    placeholder="Subject name"
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="credits" className="text-right">
                    Credits
                  </Label>
                  <Input
                    id="credits"
                    type="number"
                    value={formData.credits}
                    onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
                    className="col-span-3"
                    placeholder="4"
                    min="1"
                    max="10"
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="academic_year" className="text-right">
                    Academic Year
                  </Label>
                  <Select
                    value={formData.academic_year}
                    onValueChange={(value) => {
                      setFormData({ ...formData, academic_year: value, semester: "" })
                    }}
                  >
                    <SelectTrigger className="col-span-3 w-full">
                      <SelectValue placeholder="Select academic year" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAcademicYearOptions().map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="semester" className="text-right">
                    Semester
                  </Label>
                  <Select
                    value={formData.semester}
                    onValueChange={(value) => setFormData({ ...formData, semester: value })}
                    disabled={!formData.academic_year}
                  >
                    <SelectTrigger className="col-span-3 w-full">
                      <SelectValue placeholder="Select semester" />
                    </SelectTrigger>
                    <SelectContent>
                      {getSemesterOptions(formData.academic_year).map((sem) => (
                        <SelectItem key={sem} value={sem.toString()}>
                          Semester {sem}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* New Course Type dropdown */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="course_category" className="text-right">
                    Course Type
                  </Label>
                  <Select
                    value={formData.course_category}
                    onValueChange={(value: Enums<"course_category_type">) =>
                      setFormData({ ...formData, course_category: value })
                    }
                  >
                    <SelectTrigger className="col-span-3 w-full">
                      <SelectValue placeholder="Select course type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IPCC">IPCC</SelectItem>
                      <SelectItem value="PCC">PCC</SelectItem>
                      <SelectItem value="PEC">PEC</SelectItem>
                      <SelectItem value="OEC">OEC</SelectItem>
                      <SelectItem value="PROJ">PROJ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* New Theory, Lab, and Project checkboxes */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Components</Label>
                  <div className="col-span-3 flex items-center gap-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="add_has_theory"
                        checked={formData.has_theory}
                        onChange={(e) => setFormData({ ...formData, has_theory: e.target.checked })}
                        className="h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary"
                      />
                      <Label htmlFor="add_has_theory">Theory</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="add_has_lab"
                        checked={formData.has_lab}
                        onChange={(e) => setFormData({ ...formData, has_lab: e.target.checked })}
                        className="h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary"
                      />
                      <Label htmlFor="add_has_lab">Lab</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="add_has_project"
                        checked={formData.has_project}
                        onChange={(e) => setFormData({ ...formData, has_project: e.target.checked })}
                        className="h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary"
                      />
                      <Label htmlFor="add_has_project">Project</Label>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveSubject}>Save changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name or code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="min-w-[120px]">
              <Label htmlFor="semester-filter">Semester</Label>
              <Select value={filterSemester} onValueChange={setFilterSemester}>
                <SelectTrigger>
                  <SelectValue placeholder="All Semesters" />
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
        </CardContent>
      </Card>

      {/* Subjects List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredSubjects.map((subject) => (
          <Card key={subject.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{subject.code}</CardTitle>
                  <CardDescription>{subject.name}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEditSubject(subject)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDeleteSubject(subject.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Semester:</span>
                  <span className="text-sm">{subject.semester}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Credits:</span>
                  <span className="text-sm">{subject.credits}</span>
                </div>
                {subject.academic_year && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Academic Year:</span>
                    <span className="text-sm">{subject.academic_year}</span>
                  </div>
                )}
                {subject.course_category && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Course Type:</span>
                    <span className="text-sm capitalize">{subject.course_category}</span>
                  </div>
                )}
                {(subject.has_theory || subject.has_lab || subject.has_project) && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Components:</span>
                    <span className="text-sm">
                      {subject.has_theory && "Theory"}
                      {subject.has_theory && (subject.has_lab || subject.has_project) && ", "}
                      {subject.has_lab && "Lab"}
                      {subject.has_lab && subject.has_project && ", "}
                      {subject.has_project && "Project"}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSubjects.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No subjects found matching your criteria.</p>
          </CardContent>
        </Card>
      )}

      {/* Edit Subject Dialog */}
      <SubjectDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        title="Edit Subject"
        description="Update the subject information."
      />
    </div>
  )
}
