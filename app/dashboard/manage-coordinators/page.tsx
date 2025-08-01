"use client"

import * as React from "react"
import { Loader2, UserCog, Users, Building, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { departmentService, facultyService } from "@/lib/supabase-service"
import { AssignCoordinatorDialog } from "@/components/assign-coordinator-dialog"
import type { Department, FacultyProfile } from "@/lib/database-schema"

interface DepartmentWithCoordinators extends Department {
  coordinators: FacultyProfile[]
}

interface CoordinatorStats {
  totalCoordinators: number
  totalDepartments: number
  departmentsWithCoordinators: number
  averageCoordinatorsPerDept: number
}

export default function ManageCoordinatorsPage() {
  const { toast } = useToast()
  const [departments, setDepartments] = React.useState<DepartmentWithCoordinators[]>([])
  const [stats, setStats] = React.useState<CoordinatorStats | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [assignCoordinatorDialogOpen, setAssignCoordinatorDialogOpen] = React.useState(false)
  const [selectedDepartmentShortName, setSelectedDepartmentShortName] = React.useState<string | null>(null)
  const [user, setUser] = React.useState<any>(null)

  React.useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  const fetchDepartmentsAndCoordinators = React.useCallback(async () => {
    setLoading(true)
    try {
      // Fetch departments with HOD information
      const { data: allDepartmentsData, error: deptError } = await departmentService.getAllDepartments()
      const { data: allFacultyData, error: facultyError } = await facultyService.getAll()

      if (deptError) {
        console.error("Error fetching departments:", deptError)
        toast({
          title: "Error",
          description: "Failed to load departments.",
          variant: "destructive",
        })
        return
      }

      if (facultyError) {
        console.error("Error fetching faculty:", facultyError)
        toast({
          title: "Error",
          description: "Failed to load faculty data.",
          variant: "destructive",
        })
        return
      }

      const allDepartments = allDepartmentsData || []
      const allFaculty = allFacultyData || []

      // Filter faculty to find coordinators (those with is_coordinator = true)
      const coordinators = allFaculty.filter((faculty) => faculty.is_coordinator === true)

      // Group coordinators by department
      const coordinatorsMap = new Map<string, FacultyProfile[]>()
      coordinators.forEach((coordinator) => {
        if (coordinator.department) {
          const departmentShortName = coordinator.department
          if (!coordinatorsMap.has(departmentShortName)) {
            coordinatorsMap.set(departmentShortName, [])
          }
          coordinatorsMap.get(departmentShortName)?.push(coordinator)
        }
      })

      const departmentsWithCoordinators: DepartmentWithCoordinators[] = allDepartments.map((dept) => ({
        ...dept,
        coordinators: coordinatorsMap.get(dept.short_name || "") || [],
      }))

      setDepartments(departmentsWithCoordinators)

      // Calculate stats
      const totalCoordinators = coordinators.length
      const totalDepartments = allDepartments.length
      const departmentsWithCoordinatorsCount = departmentsWithCoordinators.filter(
        (d) => d.coordinators.length > 0,
      ).length
      const averageCoordinatorsPerDept = totalDepartments > 0 ? totalCoordinators / totalDepartments : 0

      setStats({
        totalCoordinators,
        totalDepartments,
        departmentsWithCoordinators: departmentsWithCoordinatorsCount,
        averageCoordinatorsPerDept: Math.round(averageCoordinatorsPerDept * 10) / 10,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load departments and coordinators.",
        variant: "destructive",
      })
      console.error("Error fetching departments and coordinators:", error)
    } finally {
      setLoading(false)
    }
  }, [toast])

  React.useEffect(() => {
    if (user) {
      fetchDepartmentsAndCoordinators()
    }
  }, [fetchDepartmentsAndCoordinators, user])

  const handleAssignCoordinator = (departmentShortName: string) => {
    setSelectedDepartmentShortName(departmentShortName)
    setAssignCoordinatorDialogOpen(true)
  }

  // Filter departments based on search term
  const filteredDepartments = departments.filter(
    (dept) =>
      dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.short_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.coordinators.some((coord) => coord.name.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  if (!user || (user.role !== "admin" && user.role !== "hod")) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>You don't have permission to access this page.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto pt-2 pb-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Coordinator Management</h1>
          <p className="text-muted-foreground mt-1">Manage department coordinators across the institution</p>
        </div>
      </div>
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading coordinator data...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          {stats && (
            <div className="grid gap-3 grid-cols-2 lg:grid-cols-4 md:gap-4">
              <Card className="bg-blue-50 dark:bg-blue-900/20 border-none shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Coordinators</CardTitle>
                  <UserCog className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl md:text-2xl font-bold">{stats.totalCoordinators}</div>
                  <p className="text-xs text-muted-foreground">Active coordinators</p>
                </CardContent>
              </Card>

              <Card className="bg-green-50 dark:bg-green-900/20 border-none shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Departments</CardTitle>
                  <Building className="h-4 w-4 text-green-500 dark:text-green-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl md:text-2xl font-bold">{stats.totalDepartments}</div>
                  <p className="text-xs text-muted-foreground">Total departments</p>
                </CardContent>
              </Card>

              <Card className="bg-orange-50 dark:bg-orange-900/20 border-none shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Coverage</CardTitle>
                  <Award className="h-4 w-4 text-orange-500 dark:text-orange-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl md:text-2xl font-bold">{stats.departmentsWithCoordinators}</div>
                  <p className="text-xs text-muted-foreground">Departments with coordinators</p>
                </CardContent>
              </Card>

              <Card className="bg-purple-50 dark:bg-purple-900/20 border-none shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average</CardTitle>
                  <Users className="h-4 w-4 text-purple-500 dark:text-purple-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl md:text-2xl font-bold">{stats.averageCoordinatorsPerDept}</div>
                  <p className="text-xs text-muted-foreground">Coordinators per department</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Department Directory */}
          <Card className="border border-gray-200">
            <CardHeader>
              <CardTitle>Department Directory</CardTitle>
              <CardDescription>View and manage coordinators for each department</CardDescription>
              <div className="flex items-center space-x-2 mt-4">
                <Input
                  placeholder="Search departments or coordinators..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredDepartments.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <UserCog className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-4 text-lg font-semibold">No departments found</h3>
                    <p className="text-muted-foreground mt-2">
                      {searchTerm
                        ? "Try adjusting your search criteria"
                        : "Add departments to start assigning coordinators"}
                    </p>
                  </div>
                ) : (
                  filteredDepartments.map((dept) => (
                    <Card key={dept.id} className="overflow-hidden border border-gray-100">
                      <CardHeader className="bg-muted/50">
                        <CardTitle className="flex items-center gap-2">
                          <Building className="h-5 w-5" />
                          {dept.name}
                        </CardTitle>
                        <CardDescription>
                          {dept.short_name} - HOD:{" "}
                          {dept.hod_name ? <span className="font-medium">{dept.hod_name}</span> : "Not assigned"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Users className="h-4 w-4" />
                            <span>
                              {dept.coordinators.length} Coordinator{dept.coordinators.length !== 1 ? "s" : ""}
                            </span>
                          </div>

                          {dept.coordinators.length === 0 ? (
                            <div className="py-3 px-4 rounded-md bg-muted/50 text-center">
                              <p className="text-muted-foreground">No Coordinator Assigned</p>
                            </div>
                          ) : (
                            <ul className="space-y-2">
                              {dept.coordinators.map((coordinator) => (
                                <li
                                  key={coordinator.user_id}
                                  className="flex items-center gap-3 p-2 rounded-md bg-muted/30"
                                >
                                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                                    <UserCog className="h-3 w-3 text-primary" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm truncate">{coordinator.name}</p>
                                    <p className="text-xs text-muted-foreground truncate">{coordinator.email}</p>
                                  </div>
                                  <Badge variant="outline" className="text-xs">
                                    Coordinator
                                  </Badge>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="bg-muted/30 flex justify-end">
                        <Button
                          className="bg-[#141823] hover:bg-[#0e111a] text-white"
                          size="sm"
                          onClick={() => handleAssignCoordinator(dept.short_name || "")}
                        >
                          {dept.coordinators.length > 0 ? "Manage" : "Assign"}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
      <AssignCoordinatorDialog
        open={assignCoordinatorDialogOpen}
        onOpenChange={setAssignCoordinatorDialogOpen}
        onCoordinatorAssigned={fetchDepartmentsAndCoordinators}
        preSelectedDepartment={selectedDepartmentShortName}
      />
    </div>
  )
}
