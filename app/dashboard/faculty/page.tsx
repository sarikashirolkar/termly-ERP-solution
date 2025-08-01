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
  PlusCircle,
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
import { apiService } from "@/lib/supabase-service" // Use apiService
import { ManualAddService } from "@/lib/manual-add-service"
import type { FacultyProfile, Department } from "@/lib/database-schema" // Import FacultyProfile, Department, UserType
import { getActiveRole } from "@/lib/role-switcher" // Import getActiveRole
import ManageLeavesDialog from "@/components/dashboard/manage-leaves-dialog" // Import the new dialog

export default function FacultyManagementPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("all")
  const [facultyData, setFacultyData] = useState<FacultyProfile[]>([]) // Use FacultyProfile type
  const [isAddFacultyDialogOpen, setIsAddFacultyDialogOpen] = useState(false)
  const [isEditFacultyDialogOpen, setIsEditFacultyDialogOpen] = useState(false) // New state for edit dialog
  const [editingFaculty, setEditingFaculty] = useState<FacultyProfile | null>(null) // New state for faculty being edited
  const [newFaculty, setNewFaculty] = useState({
    name: "",
    employee_id: "",
    email: "",
    phone: "",
    department: "",
    designation: "",
    qualification: "", // Added qualification
    password: "",
  })
  const [departments, setDepartments] = useState<Department[]>([]) // Use Department type
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [activeRole, setActiveRole] = useState<string | null>(null) // State for active role
  const [isAddingFaculty, setIsAddingFaculty] = useState(false)
  const [isEditingFaculty, setIsEditingFaculty] = useState(false) // Corrected state variable
  const [isDeletingFaculty, setIsDeletingFaculty] = useState(false) // New state for deleting loading
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [isManageLeavesDialogOpen, setIsManageLeavesDialogOpen] = useState(false) // Declare setManageLeavesDialogOpen

  // Import dialog states
  const [importFile, setImportFile] = useState<File | null>(null)
  const [isImporting, setIsImporting] = useState(false)

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser)
      setUser(parsedUser)
      setActiveRole(getActiveRole(parsedUser)) // Set active role
    }
    // Fetch departments and then faculty to ensure department data is available for mapping
    const fetchData = async () => {
      await fetchDepartments()
      await fetchFaculty()
    }
    fetchData()

    // Listen for role changes
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

  const fetchFaculty = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await apiService.faculty.getAll() // This already returns FacultyProfile[]
      if (error) throw error
      setFacultyData(data || []) // Directly set the data, no need for a second map
    } catch (err) {
      console.error("Failed to fetch faculty:", err)
      setError("Failed to load faculty data.")
      toast({
        title: "Error",
        description: "Failed to load faculty data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchDepartments = async () => {
    try {
      const { data, error } = await apiService.departments.getAllDepartments() // Use apiService.departments.getAllDepartments
      if (error) throw error
      setDepartments(data || [])
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
    return dept ? dept.name : shortName // Fallback to shortName if not found
  }

  const filteredFaculty = useMemo(() => {
    let filtered = facultyData

    if (searchTerm) {
      filtered = filtered.filter(
        (faculty) =>
          faculty.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          faculty.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          faculty.email.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (selectedDepartment !== "all") {
      filtered = filtered.filter((faculty) => faculty.department === selectedDepartment)
    }

    return filtered
  }, [facultyData, searchTerm, selectedDepartment])

  const handleAddFaculty = async () => {
    // Basic validation
    if (
      !newFaculty.name ||
      !newFaculty.employee_id ||
      !newFaculty.email ||
      !newFaculty.department ||
      !newFaculty.designation
    ) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setIsAddingFaculty(true)

    try {
      const result = await ManualAddService.addFaculty({
        name: newFaculty.name,
        employee_id: newFaculty.employee_id,
        email: newFaculty.email,
        phone: newFaculty.phone,
        department: newFaculty.department, // This is already short_name
        designation: newFaculty.designation,
        qualification: newFaculty.qualification || undefined, // Pass qualification
        password: newFaculty.password || undefined,
      })

      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        })
        setIsAddFacultyDialogOpen(false)
        // Reset form
        setNewFaculty({
          name: "",
          employee_id: "",
          email: "",
          phone: "",
          department: "",
          designation: "",
          qualification: "", // Reset qualification
          password: "",
        })
        fetchFaculty() // Refresh data
      } else {
        toast({
          title: "Error",
          description: result.error || result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error adding faculty:", error)
      toast({
        title: "Error",
        description: "Failed to add faculty.",
        variant: "destructive",
      })
    } finally {
      setIsAddingFaculty(false)
    }
  }

  const handleEditFaculty = async () => {
    if (!editingFaculty) return

    setIsEditingFaculty(true)
    try {
      const [firstName, ...lastNameParts] = editingFaculty.name.split(" ")
      const lastName = lastNameParts.join(" ")

      const updates: Partial<
        FacultyProfile & {
          user: {
            first_name: string
            last_name: string
            email: string
            phone: string
            department: string
            role: string
          }
        }
      > = {
        employeeId: editingFaculty.employeeId,
        designation: editingFaculty.designation,
        qualification: editingFaculty.qualification || null, // Ensure null if empty string
        user: {
          first_name: firstName,
          last_name: lastName,
          email: editingFaculty.email,
          phone: editingFaculty.phone,
          department: editingFaculty.department, // This is already short_name
          role: editingFaculty.role,
        },
      }

      const { error } = await apiService.faculty.update(editingFaculty.id, updates) // Use apiService.faculty
      if (error) throw error
      toast({
        title: "Success",
        description: "Faculty updated successfully.",
      })
      setIsEditFacultyDialogOpen(false)
      fetchFaculty() // Refresh data
    } catch (error) {
      console.error("Error updating faculty:", error)
      toast({
        title: "Error",
        description: `Failed to update faculty: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      })
    } finally {
      setIsEditingFaculty(false)
    }
  }

  const handleDeleteFaculty = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this faculty member?")) {
      return
    }
    setIsDeletingFaculty(true)
    try {
      const { error } = await apiService.faculty.delete(id) // Use apiService.faculty
      if (error) throw error
      toast({
        title: "Success",
        description: "Faculty member deleted successfully.",
      })
      fetchFaculty() // Refresh data
    } catch (err) {
      console.error("Failed to delete faculty:", err)
      toast({
        title: "Error",
        description: "Failed to delete faculty member. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeletingFaculty(false)
    }
  }

  const handleExportFaculty = () => {
    // Create CSV content
    const headers = ["Name", "Employee ID", "Email", "Phone", "Department", "Designation", "Qualification"]
    const csvContent = [
      headers.join(","),
      ...facultyData.map((faculty) =>
        [
          faculty.name,
          faculty.employeeId,
          faculty.email,
          faculty.phone,
          getDepartmentName(faculty.department || ""), // Export long name, handle null
          faculty.designation,
          faculty.qualification || "",
        ].join(","),
      ),
    ].join("\n")

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "faculty.csv"
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)

    toast({
      title: "Export successful",
      description: "Faculty data has been exported to CSV.",
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
      "employee_id",
      "phone",
      "department",
      "designation",
      "qualification", // Added qualification
      "join_date",
      "is_hod",
      "is_coordinator",
    ]
    const sampleData = [
      "Jane Doe",
      "jane.doe@example.com",
      "password123",
      "EMP001",
      "9876543210",
      "CSE",
      "Professor",
      "Ph.D. Computer Science", // Sample qualification
      "2020-09-01",
      "FALSE",
      "FALSE",
    ]

    const csvContent = [headers.join(","), sampleData.join("\n")].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "faculty_import_template.csv"
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)

    toast({
      title: "Template downloaded",
      description: "Faculty import template has been downloaded.",
    })
  }

  const handleImportFaculty = async () => {
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
      formData.append("importType", "faculty")

      const response = await fetch("/api/users/import", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        setIsImportDialogOpen(false)
        setImportFile(null)
        fetchFaculty() // Refresh data from DB after successful import

        toast({
          title: "Import successful",
          description: `${result.result.successfulImports} faculty members have been imported successfully.`,
        })
      } else {
        toast({
          title: "Import failed",
          description: result.message || "Failed to import faculty.",
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

  const handleImportSuccess = () => {
    fetchFaculty()
    setIsImportDialogOpen(false)
  }

  const handleExport = () => {
    // Placeholder for export logic
    toast({
      title: "Export Initiated",
      description: "Faculty data export is not yet implemented.",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Faculty Management</h2>
          <p className="text-muted-foreground">Manage faculty profiles and data</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 gap-1 bg-transparent" onClick={handleExportFaculty}>
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1 bg-transparent"
            onClick={() => setIsManageLeavesDialogOpen(true)}
          >
            <PlusCircle className="h-4 w-4" />
            <span>Manage Leaves</span>
          </Button>
          {user?.role === "admin" && (
            <Button className="gap-1" onClick={() => setIsImportDialogOpen(true)}>
              <Upload className="h-4 w-4" />
              <span>Import Faculty</span>
            </Button>
          )}
          <Button className="gap-1" onClick={() => setIsAddFacultyDialogOpen(true)}>
            <UserPlus className="h-4 w-4" />
            <span>Add Faculty</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Faculty</CardTitle>
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
            <div className="text-2xl font-bold">{facultyData.length}</div>
            <p className="text-xs text-muted-foreground">Registered faculty members</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 dark:bg-green-900/20 border-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Faculty</CardTitle>
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
            <div className="text-2xl font-bold">
              {facultyData.filter((faculty) => faculty.status === "Active").length}
            </div>
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
            <CardTitle className="text-sm font-medium">Avg. Rating</CardTitle>
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
            <div className="text-2xl font-bold">4.5</div>
            <p className="text-xs text-muted-foreground">Overall feedback</p>
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
              <CardTitle>Faculty Directory</CardTitle>
              <CardDescription>View and manage all faculty members</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
                <div className="flex flex-1 items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search faculty..."
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
                      {departments.map((dept) => (
                        <SelectItem key={dept.short_name} value={dept.short_name}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredFaculty.length === 0 ? (
                  <div className="col-span-full text-center py-4">No faculty found matching your search criteria</div>
                ) : (
                  filteredFaculty.map((faculty) => (
                    <Card key={faculty.id} className="overflow-hidden">
                      <CardHeader className="bg-muted/30 pb-2">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <img
                              src={faculty.profilePicture || "/placeholder.svg?height=40&width=40"}
                              alt="Profile"
                              className="rounded-full w-10 h-10 object-cover"
                            />
                            <div>
                              <CardTitle className="text-base">{faculty.name}</CardTitle>
                              <CardDescription>
                                {faculty.designation} - {getDepartmentName(faculty.department)}
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
                                  setEditingFaculty(faculty)
                                  setIsEditFacultyDialogOpen(true)
                                }}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Edit Faculty</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteFaculty(faculty.id)}
                                disabled={isDeletingFaculty}
                              >
                                <Trash className="mr-2 h-4 w-4" />
                                <span>{isDeletingFaculty ? "Deleting..." : "Delete Faculty"}</span>
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
                            <span>{faculty.email}</span>
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
                            <span>{faculty.phone}</span>
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
                            <span>Employee ID: {faculty.employeeId}</span>
                          </div>
                          {faculty.qualification && (
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
                                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path>
                              </svg>
                              <span>Qualification: {faculty.qualification}</span>
                            </div>
                          )}
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
              <CardTitle>Faculty List</CardTitle>
              <CardDescription>View and manage all faculty members in a table format</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
                <div className="flex flex-1 items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search faculty..."
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
                      {departments.map((dept) => (
                        <SelectItem key={dept.short_name} value={dept.short_name}>
                          {dept.name}
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
                      <TableHead>Employee ID</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Designation</TableHead>
                      <TableHead>Qualification</TableHead> {/* Added Qualification header */}
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFaculty.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center">
                          No faculty found matching your search criteria
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredFaculty.map((faculty) => (
                        <TableRow key={faculty.id}>
                          <TableCell className="font-medium">{faculty.name}</TableCell>
                          <TableCell>{faculty.employeeId}</TableCell>
                          <TableCell>{faculty.email}</TableCell>
                          <TableCell>{getDepartmentName(faculty.department)}</TableCell>
                          <TableCell>{faculty.designation}</TableCell>
                          <TableCell>{faculty.qualification || "N/A"}</TableCell> {/* Display qualification */}
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
                                    setEditingFaculty(faculty)
                                    setIsEditFacultyDialogOpen(true)
                                  }}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  <span>Edit Faculty</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteFaculty(faculty.id)}
                                  disabled={isDeletingFaculty}
                                >
                                  <Trash className="mr-2 h-4 w-4" />
                                  <span>{isDeletingFaculty ? "Deleting..." : "Delete Faculty"}</span>
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

      {/* Add Faculty Dialog */}
      <Dialog open={isAddFacultyDialogOpen} onOpenChange={setIsAddFacultyDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Add New Faculty</DialogTitle>
            <DialogDescription>Enter the details for the new faculty member you want to add.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="Jane Doe"
                  value={newFaculty.name}
                  onChange={(e) => setNewFaculty({ ...newFaculty, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employee_id">Employee ID *</Label>
                <Input
                  id="employee_id"
                  placeholder="EMP001"
                  value={newFaculty.employee_id}
                  onChange={(e) => setNewFaculty({ ...newFaculty, employee_id: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="jane.doe@example.com"
                  value={newFaculty.email}
                  onChange={(e) => setNewFaculty({ ...newFaculty, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="9876543210"
                  value={newFaculty.phone}
                  onChange={(e) => setNewFaculty({ ...newFaculty, phone: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">Department *</Label>
                <Select
                  value={newFaculty.department}
                  onValueChange={(value) => setNewFaculty({ ...newFaculty, department: value })}
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
                <Label htmlFor="designation">Designation *</Label>
                <Input
                  id="designation"
                  placeholder="Professor"
                  value={newFaculty.designation}
                  onChange={(e) => setNewFaculty({ ...newFaculty, designation: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="qualification">Qualification</Label> {/* Added qualification input */}
              <Input
                id="qualification"
                placeholder="e.g., Ph.D. in Computer Science"
                value={newFaculty.qualification}
                onChange={(e) => setNewFaculty({ ...newFaculty, qualification: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password (optional)</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Leave empty for default password"
                  value={newFaculty.password}
                  onChange={(e) => setNewFaculty({ ...newFaculty, password: e.target.value })}
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
              <p className="text-xs text-muted-foreground">If left empty, default password "faculty123" will be used</p>
            </div>
            <div className="text-sm text-muted-foreground">* Required fields</div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddFacultyDialogOpen(false)} disabled={isAddingFaculty}>
              Cancel
            </Button>
            <Button onClick={handleAddFaculty} disabled={isAddingFaculty}>
              {isAddingFaculty ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Faculty"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Faculty Dialog */}
      <Dialog open={isEditFacultyDialogOpen} onOpenChange={setIsEditFacultyDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Edit Faculty</DialogTitle>
            <DialogDescription>Update the details for the faculty member.</DialogDescription>
          </DialogHeader>
          {editingFaculty && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editName">Full Name *</Label>
                  <Input
                    id="editName"
                    placeholder="Jane Doe"
                    value={editingFaculty.name}
                    onChange={(e) => setEditingFaculty({ ...editingFaculty, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editEmployeeId">Employee ID *</Label>
                  <Input
                    id="editEmployeeId"
                    placeholder="EMP001"
                    value={editingFaculty.employeeId}
                    onChange={(e) => setEditingFaculty({ ...editingFaculty, employeeId: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editEmail">Email *</Label>
                  <Input
                    id="editEmail"
                    type="email"
                    placeholder="jane.doe@example.com"
                    value={editingFaculty.email}
                    onChange={(e) => setEditingFaculty({ ...editingFaculty, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editPhone">Phone</Label>
                  <Input
                    id="editPhone"
                    type="tel"
                    placeholder="9876543210"
                    value={editingFaculty.phone}
                    onChange={(e) => setEditingFaculty({ ...editingFaculty, phone: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editDepartment">Department *</Label>
                  <Select
                    value={editingFaculty.department}
                    onValueChange={(value) => setEditingFaculty({ ...editingFaculty, department: value })}
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
                  <Label htmlFor="editDesignation">Designation *</Label>
                  <Input
                    id="editDesignation"
                    placeholder="Professor"
                    value={editingFaculty.designation}
                    onChange={(e) => setEditingFaculty({ ...editingFaculty, designation: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editQualification">Qualification</Label>
                <Input
                  id="editQualification"
                  placeholder="e.g., Ph.D. in Computer Science"
                  value={editingFaculty.qualification || ""}
                  onChange={(e) => setEditingFaculty({ ...editingFaculty, qualification: e.target.value })}
                />
              </div>
              <div className="text-sm text-muted-foreground">* Required fields</div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditFacultyDialogOpen(false)} disabled={isEditingFaculty}>
              Cancel
            </Button>
            <Button onClick={handleEditFaculty} disabled={isEditingFaculty}>
              {isEditingFaculty ? (
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

      {/* Import Faculty Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Import Faculty</DialogTitle>
            <DialogDescription>
              Upload a CSV file containing faculty data. The file should include columns for name, email, password,
              employee ID, phone, department, designation, qualification, join date, is HOD, and is coordinator.
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
                  <Check className="h-3 w-3 text-green-500" /> Employee ID
                </div>
                <div className="flex items-center gap-1">
                  <Check className="h-3 w-3 text-green-500" /> Department
                </div>
                <div className="flex items-center gap-1">
                  <Check className="h-3 w-3 text-green-500" /> Designation
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleImportFaculty} disabled={isImporting}>
              {isImporting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Importing...
                </>
              ) : (
                "Import Faculty"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Leaves Dialog */}
      <ManageLeavesDialog open={isManageLeavesDialogOpen} onOpenChange={setIsManageLeavesDialogOpen} />
    </div>
  )
}
