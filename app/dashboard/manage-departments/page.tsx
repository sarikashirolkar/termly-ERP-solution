"use client"

import { CardFooter } from "@/components/ui/card"
import {
  Download,
  Plus,
  Edit,
  Trash,
  MoreHorizontal,
  Users,
  BookOpen,
  Building,
  Search,
  Check,
  ChevronsUpDown,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { departmentService, facultyService, userService } from "@/lib/supabase-service" // Import userService
import type { Department, FacultyProfile } from "@/lib/database-schema"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function DepartmentManagementPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [departmentData, setDepartmentData] = useState<Department[]>([])
  const [isAddDepartmentDialogOpen, setIsAddDepartmentDialogOpen] = useState(false)
  const [isEditDepartmentDialogOpen, setIsEditDepartmentDialogOpen] = useState(false)
  const [newDepartment, setNewDepartment] = useState({
    name: "",
    short_name: "",
    head_id: "", // Changed from head to head_id
    established_date: new Date().toISOString().split("T")[0],
  })
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null)
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [isAddingDepartment, setIsAddingDepartment] = useState(false)
  const [isEditingDepartment, setIsEditingDepartment] = useState(false)
  const [isDeletingDepartment, setIsDeletingDepartment] = useState(false)
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>([])

  // Faculty dropdown states
  const [facultyList, setFacultyList] = useState<FacultyProfile[]>([])
  const [editFacultyList, setEditFacultyList] = useState<FacultyProfile[]>([])
  const [facultyPopoverOpen, setFacultyPopoverOpen] = useState(false)
  const [editFacultyPopoverOpen, setEditFacultyPopoverOpen] = useState(false)
  const [loadingFaculty, setLoadingFaculty] = useState(false)
  const [loadingEditFaculty, setLoadingEditFaculty] = useState(false)

  const router = useRouter()

  const [allFacultyMap, setAllFacultyMap] = useState<Map<string, string>>(new Map())

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    fetchDepartments()
  }, [])

  const fetchDepartments = async () => {
    try {
      const { data: departments, error: departmentsError } = await departmentService.getAll()

      if (departmentsError) {
        console.error("Error fetching departments:", departmentsError)
        toast({
          title: "Error",
          description: "Failed to load departments.",
          variant: "destructive",
        })
        return
      }

      // Create a map of faculty IDs to names for display
      const facultyMap = new Map<string, string>()

      // Fetch all faculty to create the mapping
      const { data: allFacultyData, error: allFacultyError } = await facultyService.getAll()
      if (allFacultyError) {
        console.error("Error fetching all faculty:", allFacultyError)
        toast({
          title: "Error",
          description: "Failed to load all faculty for mapping.",
          variant: "destructive",
        })
        return
      }
      if (allFacultyData) {
        allFacultyData.forEach((faculty) => {
          facultyMap.set(faculty.id, faculty.name)
        })
      }

      // Calculate counts for each department
      const departmentsWithCounts = await Promise.all(
        (departments || []).map(async (dept) => {
          // Count students in this department
          const { count: studentCount } = await supabase
            .from("users")
            .select("id", { count: "exact", head: true })
            .eq("department", dept.short_name)
            .eq("role", "student")
            .eq("is_active", true)

          // Count faculty in this department
          const { count: facultyCount } = await supabase
            .from("users")
            .select("id", { count: "exact", head: true })
            .eq("department", dept.short_name)
            .in("role", ["faculty", "hod", "coordinator"])
            .eq("is_active", true)

          // Count courses for this department
          const { count: courseCount } = await supabase
            .from("courses")
            .select("id", { count: "exact", head: true })
            .eq("department_id", dept.id)

          return {
            ...dept,
            total_students: studentCount || 0,
            total_faculty: facultyCount || 0,
            total_courses: courseCount || 0,
          }
        }),
      )

      setAllFacultyMap(facultyMap)
      setDepartmentData(departmentsWithCounts)
      setFilteredDepartments(departmentsWithCounts)
    } catch (error) {
      console.error("Error fetching departments:", error)
      toast({
        title: "Error",
        description: "Failed to load departments.",
        variant: "destructive",
      })
    }
  }

  const fetchFacultyForDepartment = async (departmentShortName: string, isEdit = false) => {
    if (!departmentShortName) {
      if (isEdit) {
        setEditFacultyList([])
      } else {
        setFacultyList([])
      }
      return
    }

    if (isEdit) {
      setLoadingEditFaculty(true)
    } else {
      setLoadingFaculty(true)
    }

    try {
      const { data: facultyData, error: facultyError } = await facultyService.getByDepartment(departmentShortName)
      if (facultyError) {
        console.error("Error fetching faculty by department:", facultyError)
        toast({
          title: "Error",
          description: "Failed to load faculty for this department.",
          variant: "destructive",
        })
        return
      }
      if (isEdit) {
        setEditFacultyList(facultyData || [])
      } else {
        setFacultyList(facultyData || [])
      }
    } catch (error) {
      console.error("Error fetching faculty:", error)
      toast({
        title: "Error",
        description: "Failed to load faculty for this department.",
        variant: "destructive",
      })
    } finally {
      if (isEdit) {
        setLoadingEditFaculty(false)
      } else {
        setLoadingFaculty(false)
      }
    }
  }

  // Fetch faculty when department changes in add dialog
  useEffect(() => {
    if (newDepartment.short_name) {
      fetchFacultyForDepartment(newDepartment.short_name, false)
    }
  }, [newDepartment.short_name])

  // Fetch faculty when department changes in edit dialog
  useEffect(() => {
    if (editingDepartment?.short_name) {
      fetchFacultyForDepartment(editingDepartment.short_name, true)
    }
  }, [editingDepartment?.short_name])

  const getFacultyName = (facultyId: string) => {
    if (!facultyId) return "Not Assigned"
    const faculty = allFacultyMap.get(facultyId)
    if (faculty) return faculty

    // Fallback if not found in allFacultyMap (e.g., during initial loading)
    const foundInFacultyList = facultyList.find((f) => f.id === facultyId)
    if (foundInFacultyList) return foundInFacultyList.name

    const foundInEditFacultyList = editFacultyList.find((f) => f.id === facultyId)
    if (foundInEditFacultyList) return foundInEditFacultyList.name

    return "Loading..." // Or "Not Assigned" if it's truly not found
  }

  const getDisplayFacultyName = (facultyId: string) => {
    if (!facultyId) return "Not Assigned"
    return allFacultyMap.get(facultyId) || "Not Assigned"
  }

  const handleAddDepartment = async () => {
    // Validate form
    if (!newDepartment.name || !newDepartment.short_name) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    // Check for duplicate short name
    if (departmentData.some((dept) => dept.short_name === newDepartment.short_name)) {
      toast({
        title: "Error",
        description: "Department short name already exists.",
        variant: "destructive",
      })
      return
    }

    setIsAddingDepartment(true)
    try {
      await departmentService.create({
        name: newDepartment.name,
        short_name: newDepartment.short_name,
        code: newDepartment.short_name,
        hod_id: newDepartment.head_id || null, // Use hod_id instead of head
        established_date: newDepartment.established_date,
        total_students: 0,
        total_faculty: 0,
        total_courses: 0,
      })

      // If a head is assigned, update their role to 'hod'
      if (newDepartment.head_id) {
        await userService.updateUserRole(newDepartment.head_id, "hod")
      }

      toast({
        title: "Department added",
        description: `${newDepartment.name} has been added successfully.`,
      })
      setIsAddDepartmentDialogOpen(false)
      fetchDepartments()

      // Reset form
      setNewDepartment({
        name: "",
        short_name: "",
        head_id: "",
        established_date: new Date().toISOString().split("T")[0],
      })
      setFacultyList([])
    } catch (error) {
      console.error("Error adding department:", error)
      toast({
        title: "Error",
        description: `Failed to add department: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      })
    } finally {
      setIsAddingDepartment(false)
    }
  }

  const handleEditDepartment = async () => {
    if (!editingDepartment) return

    // Store original HOD ID before updates
    const originalHodId = departmentData.find((dept) => dept.id === editingDepartment.id)?.hod_id

    // Validate form
    if (!editingDepartment.name || !editingDepartment.short_name) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    // Check for duplicate short name, excluding the current editing department
    if (
      departmentData.some(
        (dept) => dept.short_name === editingDepartment.short_name && dept.id !== editingDepartment.id,
      )
    ) {
      toast({
        title: "Error",
        description: "Department short name already exists.",
        variant: "destructive",
      })
      return
    }

    setIsEditingDepartment(true)
    try {
      await departmentService.update(editingDepartment.id, {
        name: editingDepartment.name,
        short_name: editingDepartment.short_name,
        code: editingDepartment.short_name,
        hod_id: editingDepartment.hod_id || null,
        established_date: editingDepartment.established_date,
      })

      // Handle HOD role changes
      const newHodId = editingDepartment.hod_id

      if (originalHodId !== newHodId) {
        // If there was an old HOD and they are no longer the HOD of this department
        if (originalHodId) {
          const isStillHOD = await departmentService.isFacultyHODOfAnyDepartment(originalHodId)
          if (!isStillHOD) {
            await userService.updateUserRole(originalHodId, "faculty")
          }
        }
        // If a new HOD is assigned
        if (newHodId) {
          await userService.updateUserRole(newHodId, "hod")
        }
      }

      toast({
        title: "Department updated",
        description: `${editingDepartment.name} has been updated successfully.`,
      })
      setIsEditDepartmentDialogOpen(false)
      setEditingDepartment(null)
      setEditFacultyList([])
      fetchDepartments()
    } catch (error) {
      console.error("Error updating department:", error)
      toast({
        title: "Error",
        description: `Failed to update department: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      })
    } finally {
      setIsEditingDepartment(false)
    }
  }

  const handleDeleteDepartment = async (id: number) => {
    setIsDeletingDepartment(true)
    try {
      const departmentToDelete = departmentData.find((dept) => dept.id === id)
      const hodId = departmentToDelete?.hod_id

      await departmentService.delete(id)

      // If the deleted department had an HOD, check if they are HOD of any other department
      // If not, revert their role to 'faculty'
      if (hodId) {
        const isStillHOD = await departmentService.isFacultyHODOfAnyDepartment(hodId)
        if (!isStillHOD) {
          await userService.updateUserRole(hodId, "faculty")
        }
      }

      toast({
        title: "Department deleted",
        description: "The department has been deleted successfully.",
      })
      fetchDepartments()
    } catch (error) {
      console.error("Error deleting department:", error)
      toast({
        title: "Error",
        description: `Failed to delete department: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      })
    } finally {
      setIsDeletingDepartment(false)
    }
  }

  const handleExportDepartments = () => {
    // Create CSV content
    const headers = [
      "Name",
      "Short Name",
      "Head",
      "Total Students",
      "Total Faculty",
      "Total Courses",
      "Established Date",
    ]
    const csvContent = [
      headers.join(","),
      ...departmentData.map((dept) =>
        [
          dept.name,
          dept.short_name,
          getFacultyName(dept.hod_id || ""),
          dept.total_students,
          dept.total_faculty,
          dept.total_courses,
          dept.established_date,
        ].join(","),
      ),
    ].join("\n")

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "departments.csv"
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)

    toast({
      title: "Export successful",
      description: "Department data has been exported to CSV.",
    })
  }

  useEffect(() => {
    const filtered = departmentData.filter((dept) => dept.name.toLowerCase().includes(searchTerm.toLowerCase()))
    setFilteredDepartments(filtered)
  }, [searchTerm, departmentData])

  if (!user || user.role !== "admin") {
    return (
      <div className="flex items-center justify-center h-full">
        <p>You don't have permission to access this page.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Department Management</h2>
          <p className="text-muted-foreground">Manage academic departments</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 gap-1 bg-transparent" onClick={handleExportDepartments}>
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
          <Button className="gap-1" onClick={() => setIsAddDepartmentDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            <span>Add Department</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Departments</CardTitle>
            <Building className="h-4 w-4 text-blue-500 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departmentData.length}</div>
            <p className="text-xs text-muted-foreground">Active departments</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 dark:bg-green-900/20 border-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-green-500 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {departmentData.reduce((sum, dept) => sum + (dept.total_students || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">Across all departments</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 dark:bg-purple-900/20 border-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Faculty</CardTitle>
            <Users className="h-4 w-4 text-purple-500 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {departmentData.reduce((sum, dept) => sum + (dept.total_faculty || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">Across all departments</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-50 dark:bg-amber-900/20 border-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-amber-500 dark:text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {departmentData.reduce((sum, dept) => sum + (dept.total_courses || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">Offered by departments</p>
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
              <CardTitle>Department Directory</CardTitle>
              <CardDescription>View and manage all departments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
                <div className="flex flex-1 items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search departments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-8 w-full md:w-[300px]"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredDepartments.length === 0 ? (
                  <div className="col-span-full text-center py-4">
                    No departments found matching your search criteria
                  </div>
                ) : (
                  filteredDepartments.map((department) => (
                    <Card key={department.id} className="overflow-hidden">
                      <CardHeader className="bg-muted/30 pb-2">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <Building className="h-10 w-10 text-primary" />
                            <div>
                              <CardTitle className="text-base">{department.name}</CardTitle>
                              <CardDescription>
                                {department.short_name ?? "N/A"} - Head:{" "}
                                {getDisplayFacultyName(department.hod_id || "")}
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
                                  setEditingDepartment(department)
                                  setIsEditDepartmentDialogOpen(true)
                                }}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Edit Department</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteDepartment(department.id)}
                                disabled={isDeletingDepartment}
                              >
                                <Trash className="mr-2 h-4 w-4" />
                                <span>{isDeletingDepartment ? "Deleting..." : "Delete Department"}</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{department.total_students || 0} Students</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{department.total_faculty || 0} Faculty</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                            <span>{department.total_courses || 0} Courses</span>
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
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                              <line x1="16" x2="16" y1="2" y2="6"></line>
                              <line x1="8" x2="8" y1="2" y2="6"></line>
                              <line x1="3" x2="21" y1="10" y2="10"></line>
                            </svg>
                            <span>
                              Established{" "}
                              {department.established_date
                                ? new Date(department.established_date).toLocaleDateString()
                                : "N/A"}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="bg-muted/30 p-4 flex justify-between">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/dashboard/department-faculty?departmentId=${department.id}`)}
                        >
                          View Faculty
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => router.push(`/dashboard/department-details?departmentId=${department.id}`)}
                        >
                          View Details
                        </Button>
                      </CardFooter>
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
              <CardTitle>Department List</CardTitle>
              <CardDescription>View and manage all departments in a table format</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
                <div className="flex flex-1 items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search departments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-8 w-full md:w-[300px]"
                  />
                </div>
              </div>

              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Short Name</TableHead>
                      <TableHead>Head</TableHead>
                      <TableHead>Students</TableHead>
                      <TableHead>Faculty</TableHead>
                      <TableHead>Courses</TableHead>
                      <TableHead>Established Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDepartments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center">
                          No departments found matching your search criteria
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredDepartments.map((department) => (
                        <TableRow key={department.id}>
                          <TableCell className="font-medium">{department.name}</TableCell>
                          <TableCell>{department.short_name ?? "N/A"}</TableCell>
                          <TableCell>{getDisplayFacultyName(department.hod_id || "")}</TableCell>
                          <TableCell>{department.total_students || 0}</TableCell>
                          <TableCell>{department.total_faculty || 0}</TableCell>
                          <TableCell>{department.total_courses || 0}</TableCell>
                          <TableCell>
                            {department.established_date
                              ? new Date(department.established_date).toLocaleDateString()
                              : "N/A"}
                          </TableCell>
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
                                    setEditingDepartment(department)
                                    setIsEditDepartmentDialogOpen(true)
                                  }}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  <span>Edit Department</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteDepartment(department.id)}
                                  disabled={isDeletingDepartment}
                                >
                                  <Trash className="mr-2 h-4 w-4" />
                                  <span>{isDeletingDepartment ? "Deleting..." : "Delete Department"}</span>
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

      {/* Add Department Dialog */}
      <Dialog open={isAddDepartmentDialogOpen} onOpenChange={setIsAddDepartmentDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Add New Department</DialogTitle>
            <DialogDescription>Enter the details for the new department you want to add.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Department Name</Label>
              <Input
                id="name"
                placeholder="e.g., Computer Science and Engineering"
                value={newDepartment.name}
                onChange={(e) => setNewDepartment({ ...newDepartment, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="short_name">Short Name</Label>
                <Input
                  id="short_name"
                  placeholder="e.g., CSE"
                  value={newDepartment.short_name}
                  onChange={(e) => setNewDepartment({ ...newDepartment, short_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="head">Department Head (Optional)</Label>
                <Popover open={facultyPopoverOpen} onOpenChange={setFacultyPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={facultyPopoverOpen}
                      className="w-full justify-between bg-transparent"
                      disabled={!newDepartment.short_name || loadingFaculty}
                    >
                      {loadingFaculty ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Loading...
                        </>
                      ) : newDepartment.head_id ? (
                        getFacultyName(newDepartment.head_id)
                      ) : (
                        "Select department head..."
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command>
                      <CommandInput placeholder="Search faculty..." />
                      <CommandList>
                        <CommandEmpty>
                          {!newDepartment.short_name
                            ? "Please select a department first"
                            : facultyList.length === 0
                              ? "No faculty found for this department"
                              : "No faculty found."}
                        </CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                            value=""
                            onSelect={() => {
                              setNewDepartment({ ...newDepartment, head_id: "" })
                              setFacultyPopoverOpen(false)
                            }}
                          >
                            <Check
                              className={cn("mr-2 h-4 w-4", newDepartment.head_id === "" ? "opacity-100" : "opacity-0")}
                            />
                            No department head
                          </CommandItem>
                          {facultyList.map((faculty) => (
                            <CommandItem
                              key={faculty.id}
                              value={faculty.name}
                              onSelect={() => {
                                setNewDepartment({ ...newDepartment, head_id: faculty.id })
                                setFacultyPopoverOpen(false)
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  newDepartment.head_id === faculty.id ? "opacity-100" : "opacity-0",
                                )}
                              />
                              {faculty.name} ({faculty.email})
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {!newDepartment.short_name && (
                  <p className="text-xs text-muted-foreground">Enter department short name first to load faculty</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="established_date">Established Date</Label>
              <Input
                id="established_date"
                type="date"
                value={newDepartment.established_date}
                onChange={(e) => setNewDepartment({ ...newDepartment, established_date: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDepartmentDialogOpen(false)} disabled={isAddingDepartment}>
              Cancel
            </Button>
            <Button onClick={handleAddDepartment} disabled={isAddingDepartment}>
              {isAddingDepartment ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Department"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Department Dialog */}
      <Dialog open={isEditDepartmentDialogOpen} onOpenChange={setIsEditDepartmentDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Edit Department</DialogTitle>
            <DialogDescription>Update the details for the department.</DialogDescription>
          </DialogHeader>
          {editingDepartment && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="editName">Department Name</Label>
                <Input
                  id="editName"
                  placeholder="e.g., Computer Science and Engineering"
                  value={editingDepartment.name || ""}
                  onChange={(e) => setEditingDepartment({ ...editingDepartment, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editShortName">Short Name</Label>
                  <Input
                    id="editShortName"
                    placeholder="e.g., CSE"
                    value={editingDepartment.short_name || ""}
                    onChange={(e) => setEditingDepartment({ ...editingDepartment, short_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editHead">Department Head (Optional)</Label>
                  <Popover open={editFacultyPopoverOpen} onOpenChange={setEditFacultyPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={editFacultyPopoverOpen}
                        className="w-full justify-between bg-transparent"
                        disabled={!editingDepartment.short_name || loadingEditFaculty}
                      >
                        {loadingEditFaculty ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Loading...
                          </>
                        ) : editingDepartment.hod_id ? (
                          getFacultyName(editingDepartment.hod_id)
                        ) : (
                          "Select department head..."
                        )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                      <Command>
                        <CommandInput placeholder="Search faculty..." />
                        <CommandList>
                          <CommandEmpty>
                            {!editingDepartment.short_name
                              ? "Please select a department first"
                              : editFacultyList.length === 0
                                ? "No faculty found for this department"
                                : "No faculty found."}
                          </CommandEmpty>
                          <CommandGroup>
                            <CommandItem
                              value=""
                              onSelect={() => {
                                setEditingDepartment({ ...editingDepartment, hod_id: "" })
                                setEditFacultyPopoverOpen(false)
                              }}
                            >
                              <Check
                                className={cn("mr-2 h-4 w-4", !editingDepartment.hod_id ? "opacity-100" : "opacity-0")}
                              />
                              No department head
                            </CommandItem>
                            {editFacultyList.map((faculty) => (
                              <CommandItem
                                key={faculty.id}
                                value={faculty.name}
                                onSelect={() => {
                                  setEditingDepartment({ ...editingDepartment, hod_id: faculty.id })
                                  setEditFacultyPopoverOpen(false)
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    editingDepartment.hod_id === faculty.id ? "opacity-100" : "opacity-0",
                                  )}
                                />
                                {faculty.name} ({faculty.email})
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {!editingDepartment.short_name && (
                    <p className="text-xs text-muted-foreground">Enter department short name first to load faculty</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editEstablishedDate">Established Date</Label>
                <Input
                  id="editEstablishedDate"
                  type="date"
                  value={editingDepartment.established_date || ""}
                  onChange={(e) => setEditingDepartment({ ...editingDepartment, established_date: e.target.value })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDepartmentDialogOpen(false)}
              disabled={isEditingDepartment}
            >
              Cancel
            </Button>
            <Button onClick={handleEditDepartment} disabled={isEditingDepartment}>
              {isEditingDepartment ? (
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
    </div>
  )
}
