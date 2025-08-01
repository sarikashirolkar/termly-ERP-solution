"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Loader2, UserCog, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { departmentService, facultyService } from "@/lib/supabase-service"
import type { Department, FacultyProfile } from "@/lib/database-schema"

interface AssignCoordinatorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCoordinatorAssigned: () => void
  preSelectedDepartment?: string | null
}

export function AssignCoordinatorDialog({
  open,
  onOpenChange,
  onCoordinatorAssigned,
  preSelectedDepartment,
}: AssignCoordinatorDialogProps) {
  const { toast } = useToast()
  const [departments, setDepartments] = React.useState<Department[]>([])
  const [facultyList, setFacultyList] = React.useState<FacultyProfile[]>([])
  const [selectedDepartment, setSelectedDepartment] = React.useState<string>("")
  const [selectedCoordinators, setSelectedCoordinators] = React.useState<string[]>([])
  const [currentCoordinators, setCurrentCoordinators] = React.useState<FacultyProfile[]>([])

  const [departmentPopoverOpen, setDepartmentPopoverOpen] = React.useState(false)
  const [facultyPopoverOpen, setFacultyPopoverOpen] = React.useState(false)
  const [loadingDepartments, setLoadingDepartments] = React.useState(false)
  const [loadingFaculty, setLoadingFaculty] = React.useState(false)
  const [isAssigning, setIsAssigning] = React.useState(false)

  // Fetch departments on mount
  React.useEffect(() => {
    fetchDepartments()
  }, [])

  // Set pre-selected department
  React.useEffect(() => {
    if (preSelectedDepartment && departments.length > 0) {
      setSelectedDepartment(preSelectedDepartment)
    }
  }, [preSelectedDepartment, departments])

  // Fetch faculty when department changes
  React.useEffect(() => {
    if (selectedDepartment) {
      fetchFacultyForDepartment(selectedDepartment)
    } else {
      setFacultyList([])
      setCurrentCoordinators([])
      setSelectedCoordinators([])
    }
  }, [selectedDepartment])

  const fetchDepartments = async () => {
    setLoadingDepartments(true)
    try {
      const { data, error } = await departmentService.getAllDepartments()
      if (error) throw error
      setDepartments(data || [])
    } catch (error) {
      console.error("Error fetching departments:", error)
      toast({
        title: "Error",
        description: "Failed to load departments.",
        variant: "destructive",
      })
    } finally {
      setLoadingDepartments(false)
    }
  }

  const fetchFacultyForDepartment = async (departmentShortName: string) => {
    setLoadingFaculty(true)
    try {
      const { data, error } = await facultyService.getByDepartment(departmentShortName)
      if (error) throw error

      const faculty = data || []
      setFacultyList(faculty)

      // Set current coordinators
      const coordinators = faculty.filter((f) => f.is_coordinator)
      setCurrentCoordinators(coordinators)
      setSelectedCoordinators(coordinators.map((c) => c.id))
    } catch (error) {
      console.error("Error fetching faculty:", error)
      toast({
        title: "Error",
        description: "Failed to load faculty for this department.",
        variant: "destructive",
      })
    } finally {
      setLoadingFaculty(false)
    }
  }

  const handleCoordinatorToggle = (facultyId: string) => {
    setSelectedCoordinators((prev) => {
      if (prev.includes(facultyId)) {
        return prev.filter((id) => id !== facultyId)
      } else {
        return [...prev, facultyId]
      }
    })
  }

  const handleAssignCoordinators = async () => {
    if (!selectedDepartment) {
      toast({
        title: "Error",
        description: "Please select a department.",
        variant: "destructive",
      })
      return
    }

    setIsAssigning(true)
    try {
      // Get all faculty for the department
      const allFaculty = facultyList

      // Update coordinator status for all faculty in the department
      const updatePromises = allFaculty.map(async (faculty) => {
        const shouldBeCoordinator = selectedCoordinators.includes(faculty.id)
        if (faculty.is_coordinator !== shouldBeCoordinator) {
          return facultyService.updateCoordinatorStatus(faculty.id, shouldBeCoordinator)
        }
        return Promise.resolve({ data: null, error: null })
      })

      const results = await Promise.all(updatePromises)

      // Check for errors
      const errors = results.filter((result) => result.error)
      if (errors.length > 0) {
        throw new Error(`Failed to update ${errors.length} coordinator assignments`)
      }

      toast({
        title: "Success",
        description: `Coordinators updated successfully for ${getDepartmentName(selectedDepartment)}.`,
      })

      onCoordinatorAssigned()
      onOpenChange(false)

      // Reset form
      setSelectedDepartment("")
      setSelectedCoordinators([])
      setCurrentCoordinators([])
      setFacultyList([])
    } catch (error) {
      console.error("Error assigning coordinators:", error)
      toast({
        title: "Error",
        description: `Failed to assign coordinators: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      })
    } finally {
      setIsAssigning(false)
    }
  }

  const getDepartmentName = (shortName: string) => {
    const dept = departments.find((d) => d.short_name === shortName)
    return dept ? dept.name : shortName
  }

  const getSelectedFacultyNames = () => {
    return facultyList.filter((f) => selectedCoordinators.includes(f.id)).map((f) => f.name)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5" />
            Assign Coordinators
          </DialogTitle>
          <DialogDescription>
            Select a department and assign coordinators. You can assign multiple coordinators to a department.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Department Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Department</label>
            <Popover open={departmentPopoverOpen} onOpenChange={setDepartmentPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={departmentPopoverOpen}
                  className="w-full justify-between bg-transparent"
                  disabled={loadingDepartments}
                >
                  {loadingDepartments ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading departments...
                    </>
                  ) : selectedDepartment ? (
                    getDepartmentName(selectedDepartment)
                  ) : (
                    "Select department..."
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                  <CommandInput placeholder="Search departments..." />
                  <CommandList>
                    <CommandEmpty>No departments found.</CommandEmpty>
                    <CommandGroup>
                      {departments.map((dept) => (
                        <CommandItem
                          key={dept.id}
                          value={dept.name}
                          onSelect={() => {
                            setSelectedDepartment(dept.short_name || "")
                            setDepartmentPopoverOpen(false)
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedDepartment === dept.short_name ? "opacity-100" : "opacity-0",
                            )}
                          />
                          {dept.name} ({dept.short_name})
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Faculty Selection */}
          {selectedDepartment && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Coordinators</label>
              {loadingFaculty ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Loading faculty...</span>
                </div>
              ) : facultyList.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No faculty found for this department.</div>
              ) : (
                <div className="space-y-2">
                  <Popover open={facultyPopoverOpen} onOpenChange={setFacultyPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={facultyPopoverOpen}
                        className="w-full justify-between bg-transparent"
                      >
                        {selectedCoordinators.length === 0
                          ? "Select coordinators..."
                          : `${selectedCoordinators.length} coordinator(s) selected`}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                      <Command>
                        <CommandInput placeholder="Search faculty..." />
                        <CommandList>
                          <CommandEmpty>No faculty found.</CommandEmpty>
                          <CommandGroup>
                            {facultyList.map((faculty) => (
                              <CommandItem
                                key={faculty.id}
                                value={faculty.name}
                                onSelect={() => handleCoordinatorToggle(faculty.id)}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedCoordinators.includes(faculty.id) ? "opacity-100" : "opacity-0",
                                  )}
                                />
                                <div className="flex-1">
                                  <div className="font-medium">{faculty.name}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {faculty.designation} • {faculty.email}
                                  </div>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>

                  {/* Selected Coordinators */}
                  {selectedCoordinators.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Selected Coordinators:</label>
                      <div className="flex flex-wrap gap-2">
                        {getSelectedFacultyNames().map((name, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {name}
                            <X
                              className="h-3 w-3 cursor-pointer"
                              onClick={() => {
                                const faculty = facultyList.find((f) => f.name === name)
                                if (faculty) handleCoordinatorToggle(faculty.id)
                              }}
                            />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Current Coordinators Info */}
                  {currentCoordinators.length > 0 && (
                    <div className="mt-4 p-3 bg-muted/50 rounded-md">
                      <label className="text-sm font-medium">Current Coordinators:</label>
                      <div className="mt-1 text-sm text-muted-foreground">
                        {currentCoordinators.map((c) => c.name).join(", ")}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isAssigning}>
            Cancel
          </Button>
          <Button onClick={handleAssignCoordinators} disabled={isAssigning || !selectedDepartment}>
            {isAssigning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Coordinators"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
