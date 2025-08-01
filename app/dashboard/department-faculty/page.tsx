"use client"

import { DialogFooter } from "@/components/ui/dialog"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Search, Filter, Plus, ArrowLeft, User, MoreHorizontal, Trash, Edit, Eye } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { departmentService, facultyService } from "@/lib/supabase-service"
import type { Department, FacultyProfile } from "@/lib/database-schema"

export default function DepartmentFacultyPage() {
  const searchParams = useSearchParams()
  const departmentId = searchParams.get("departmentId")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDesignation, setSelectedDesignation] = useState("all")
  const [faculty, setFaculty] = useState<FacultyProfile[]>([])
  const [department, setDepartment] = useState<Department | null>(null)
  const [isAddFacultyDialogOpen, setIsAddFacultyDialogOpen] = useState(false)
  const [isDeleteConfirmDialogOpen, setIsDeleteConfirmDialogOpen] = useState(false)
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyProfile | null>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }

    if (departmentId) {
      fetchDepartmentAndFaculty()
    }
  }, [departmentId])

  const fetchDepartmentAndFaculty = async () => {
    if (!departmentId) {
      setLoading(false) // Ensure loading is false if no ID
      return
    }

    setLoading(true)
    try {
      // Fetch department details with HOD info joined
      const { data: deptData, error: deptError } = await departmentService.getById(departmentId)
      if (deptError) throw deptError
      if (!deptData) {
        console.error("Department not found for ID:", departmentId)
        setDepartment(null)
        setLoading(false)
        toast({
          title: "Error",
          description: "Department not found or failed to load.",
          variant: "destructive",
        })
        return
      }

      let hodName = "No HOD assigned"
      if (deptData.hod?.user) {
        // Check if hod and user exist from the joined data
        hodName = `${deptData.hod.user.first_name || ""} ${deptData.hod.user.last_name || ""}`.trim()
      }
      // Update department state with resolved HOD name
      setDepartment({ ...deptData, hod_name: hodName })

      // Fetch all faculty and filter by department
      const { data: allFacultyData, error: facultyError } = await facultyService.getAll()
      if (facultyError) {
        console.error("Error fetching all faculty:", facultyError)
        toast({
          title: "Error",
          description: "Failed to load faculty data.",
          variant: "destructive",
        })
        setLoading(false) // Ensure loading is set to false on error
        return
      }
      const allFaculty = allFacultyData || [] // Ensure it's an array
      const deptFaculty = allFaculty.filter((f) => f.department === deptData.short_name)
      setFaculty(deptFaculty)
    } catch (error) {
      console.error("Error fetching department and faculty:", error)
      toast({
        title: "Error",
        description: "Failed to load department faculty.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Filter faculty based on search term and selected designation
  const filteredFaculty = faculty.filter((fac) => {
    const matchesSearch =
      fac.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fac.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (fac.designation && fac.designation.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesDesignation = selectedDesignation === "all" || fac.designation === selectedDesignation

    return matchesSearch && matchesDesignation
  })

  const handleAddFaculty = () => {
    // Add new faculty logic would go here
    setIsAddFacultyDialogOpen(false)
    toast({
      title: "Faculty added",
      description: "New faculty member has been added successfully.",
    })
  }

  const handleDeleteFaculty = async () => {
    if (!selectedFaculty) return

    try {
      await facultyService.delete(selectedFaculty.user_id)
      setFaculty(faculty.filter((fac) => fac.user_id !== selectedFaculty.user_id))
      setIsDeleteConfirmDialogOpen(false)

      toast({
        title: "Faculty removed",
        description: "The faculty member has been removed successfully.",
      })
    } catch (error) {
      console.error("Error deleting faculty:", error)
      toast({
        title: "Error",
        description: "Failed to remove faculty member.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteClick = (fac: FacultyProfile) => {
    setSelectedFaculty(fac)
    setIsDeleteConfirmDialogOpen(true)
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const viewFacultyProfile = (facultyId: string) => {
    router.push(`/dashboard/faculty-profile?id=${facultyId}`)
  }

  if (!user || (user.role !== "admin" && user.role !== "hod")) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>You don't have permission to access this page.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading faculty data...</p>
        </div>
      </div>
    )
  }

  if (!department) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Department not found.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{department.name} Department Faculty</h1>
            <p className="text-muted-foreground">
              {department.hod_name ? `Managed by ${department.hod_name}` : "No HOD assigned"}
            </p>
          </div>
        </div>
        <Button onClick={() => setIsAddFacultyDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Faculty
        </Button>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search faculty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9 w-full md:w-[300px]"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={selectedDesignation} onValueChange={setSelectedDesignation}>
            <SelectTrigger className="h-9 w-[180px]">
              <SelectValue placeholder="Filter by designation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Designations</SelectItem>
              <SelectItem value="Professor">Professor</SelectItem>
              <SelectItem value="Associate Professor">Associate Professor</SelectItem>
              <SelectItem value="Assistant Professor">Assistant Professor</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredFaculty.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <User className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
            <h3 className="mt-4 text-lg font-medium">No faculty found</h3>
            <p className="mt-2 text-sm text-muted-foreground">Try adjusting your search or filter criteria.</p>
          </div>
        ) : (
          filteredFaculty.map((fac) => (
            <Card key={fac.user_id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={fac.profilePicture || ""} alt={fac.name} />
                      <AvatarFallback>{getInitials(fac.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{fac.name}</CardTitle>
                      <CardDescription>{fac.designation || "Faculty"}</CardDescription>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => viewFacultyProfile(fac.user_id)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteClick(fac)}>
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="grid gap-1">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Email: </span>
                    {fac.email}
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Phone: </span>
                    {fac.phone || "N/A"}
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Qualification: </span>
                    {fac.qualification || "N/A"}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">ID: {fac.employeeId || "N/A"}</Badge>
                  <Badge variant="outline">Joined: {fac.joinDate ? new Date(fac.joinDate).getFullYear() : "N/A"}</Badge>
                  {fac.isHOD && <Badge variant="default">HOD</Badge>}
                  {fac.is_coordinator && <Badge variant="secondary">Coordinator</Badge>}
                </div>
              </CardFooter>
            </Card>
          ))
        )}
      </div>

      {/* Add Faculty Dialog */}
      <Dialog open={isAddFacultyDialogOpen} onOpenChange={setIsAddFacultyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Faculty</DialogTitle>
            <DialogDescription>
              Enter the details of the new faculty member to add them to the department.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="firstName" className="text-sm font-medium">
                  First Name
                </label>
                <Input id="firstName" placeholder="Enter first name" />
              </div>
              <div className="space-y-2">
                <label htmlFor="lastName" className="text-sm font-medium">
                  Last Name
                </label>
                <Input id="lastName" placeholder="Enter last name" />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input id="email" type="email" placeholder="Enter email address" />
            </div>
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium">
                Phone
              </label>
              <Input id="phone" placeholder="Enter phone number" />
            </div>
            <div className="space-y-2">
              <label htmlFor="designation" className="text-sm font-medium">
                Designation
              </label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select designation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Professor">Professor</SelectItem>
                  <SelectItem value="Associate Professor">Associate Professor</SelectItem>
                  <SelectItem value="Assistant Professor">Assistant Professor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label htmlFor="qualification" className="text-sm font-medium">
                Qualification
              </label>
              <Input id="qualification" placeholder="Enter qualification" />
            </div>
            <div className="space-y-2">
              <label htmlFor="employeeId" className="text-sm font-medium">
                Employee ID
              </label>
              <Input id="employeeId" placeholder="Enter employee ID" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddFacultyDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddFaculty}>Add Faculty</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteConfirmDialogOpen} onOpenChange={setIsDeleteConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {selectedFaculty?.name} from the faculty list? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteConfirmDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteFaculty}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
