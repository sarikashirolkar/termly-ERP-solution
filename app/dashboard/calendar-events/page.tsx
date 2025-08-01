"use client"

import { useState, useEffect } from "react"
import { Calendar, Clock, Download, Search, Upload, FileUp, FileText, X } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

// Sample calendar data
const calendars = [
  {
    id: 1,
    title: "Academic Calendar 2025",
    description: "Official academic calendar for the 2025 academic year",
    department: "all",
    type: "academic",
    dateRange: "January 1st, 2025 - December 31st, 2025",
    fileName: "academic_calendar_2025.pdf",
    uploadDate: "December 15th, 2024",
  },
  {
    id: 2,
    title: "Exam Schedule - Spring 2025",
    description: "Final examination schedule for Spring semester 2025",
    department: "all",
    type: "exams",
    dateRange: "April 15th, 2025 - May 15th, 2025",
    fileName: "exam_schedule_spring_2025.pdf",
    uploadDate: "March 1st, 2025",
  },
  {
    id: 3,
    title: "Department Events - CSE",
    description: "Calendar of events for the Computer Science department",
    department: "Computer Science",
    type: "events",
    dateRange: "January 1st, 2025 - June 30th, 2025",
    fileName: "cse_events_2025.pdf",
    uploadDate: "December 20th, 2024",
  },
  {
    id: 4,
    title: "Technical Symposium Schedule",
    description: "Schedule for the annual technical symposium",
    department: "Information Science",
    type: "events",
    dateRange: "February 15th, 2025 - February 20th, 2025",
    fileName: "tech_symposium_2025.pdf",
    uploadDate: "January 10th, 2025",
  },
  {
    id: 5,
    title: "Workshop Calendar",
    description: "Calendar of workshops and training sessions",
    department: "Electronics",
    type: "academic",
    dateRange: "March 1st, 2025 - May 31st, 2025",
    fileName: "workshop_calendar_2025.pdf",
    uploadDate: "February 1st, 2025",
  },
]

// Department options
const departments = [
  { value: "all", label: "All Departments" },
  { value: "Computer Science", label: "Computer Science" },
  { value: "Information Science", label: "Information Science" },
  { value: "Electronics and Communication Engineering", label: "Electronics and Communication Engineering" },
  { value: "Mechanical", label: "Mechanical" },
  { value: "Civil", label: "Civil" },
]

// Function to expand department short forms
const expandDepartmentShortForm = (shortForm) => {
  const departmentMappings = {
    CSE: "Computer Science",
    CS: "Computer Science",
    ISE: "Information Science",
    IS: "Information Science",
    ECE: "Electronics and Communication Engineering",
    EEE: "Electrical and Electronics Engineering",
    MECH: "Mechanical",
    ME: "Mechanical",
    CV: "Civil",
    CE: "Civil",
  }

  return departmentMappings[shortForm] || shortForm
}

export default function CalendarEventsPage() {
  const [selectedType, setSelectedType] = useState("all")
  const [selectedDepartment, setSelectedDepartment] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [user, setUser] = useState(null)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const { toast } = useToast()
  const [isFileUploaded, setIsFileUploaded] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [calendarData, setCalendarData] = useState({
    title: "",
    description: "",
    type: "academic",
    department: "",
    targetRoles: [],
    startDate: "",
    endDate: "",
  })

  useEffect(() => {
    try {
      // First try to get department from localStorage (set by settings page)
      const storedDepartment = localStorage.getItem("userDepartment")

      // Then try to get user data
      const storedUser = localStorage.getItem("user")
      let userData = null

      if (storedUser) {
        userData = JSON.parse(storedUser)
        setUser(userData)
      }

      // Set department with priority:
      // 1. Stored department from settings
      // 2. Department from user data
      // 3. Default to "all"
      if (storedDepartment) {
        const expandedDepartment = expandDepartmentShortForm(storedDepartment)
        setSelectedDepartment(expandedDepartment)
      } else if (userData?.department) {
        const expandedDepartment = expandDepartmentShortForm(userData.department)
        setSelectedDepartment(expandedDepartment)
      } else {
        setSelectedDepartment("all")
      }
    } catch (error) {
      console.error("Error loading user data:", error)
      setSelectedDepartment("all")
    }
  }, [])

  // Function to handle file change
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      // Check if file is PDF
      if (file.type !== "application/pdf") {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF file only",
          variant: "destructive",
        })
        return
      }

      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "File size should not exceed 10MB",
          variant: "destructive",
        })
        return
      }

      setSelectedFile(file)
      setIsFileUploaded(true)
    } else {
      setSelectedFile(null)
      setIsFileUploaded(false)
    }
  }

  // Function to handle upload
  const handleUpload = () => {
    // Validate form
    if (!calendarData.title || !selectedFile) {
      toast({
        title: "Error",
        description: "Please fill in all required fields and select a file",
        variant: "destructive",
      })
      return
    }

    // Validate target roles
    if (calendarData.targetRoles.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one target role",
        variant: "destructive",
      })
      return
    }

    // Simulate upload
    setIsUploading(true)
    setUploadProgress(0)

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsUploading(false)

          // Add to calendars (in a real app, this would be an API call)
          const newCalendar = {
            id: calendars.length + 1,
            title: calendarData.title,
            description: calendarData.description,
            department: user?.role === "admin" ? calendarData.department : user?.department || "all",
            type: calendarData.type,
            dateRange: `${calendarData.startDate} - ${calendarData.endDate}`,
            fileName: selectedFile.name,
            uploadDate: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
          }

          // In a real app, you would update the state with the new calendar
          // For this demo, we'll just show a success message

          // Reset form
          setCalendarData({
            title: "",
            description: "",
            type: "academic",
            department: user?.role === "admin" ? "" : user?.department || "",
            targetRoles: [],
            startDate: "",
            endDate: "",
          })
          setSelectedFile(null)
          setIsFileUploaded(false)
          setIsUploadDialogOpen(false)

          toast({
            title: "Calendar published",
            description: "Your calendar has been successfully published",
          })

          return 0
        }
        return prev + 10
      })
    }, 300)
  }

  // Function to handle role selection
  const handleRoleSelection = (role) => {
    setCalendarData((prev) => {
      const currentRoles = [...prev.targetRoles]

      if (currentRoles.includes(role)) {
        // Remove role if already selected
        return {
          ...prev,
          targetRoles: currentRoles.filter((r) => r !== role),
        }
      } else {
        // Add role if not selected
        return {
          ...prev,
          targetRoles: [...currentRoles, role],
        }
      }
    })
  }

  // Get available roles based on user role
  const getAvailableRoles = () => {
    switch (user?.role) {
      case "admin":
        return ["student", "faculty", "hod", "coordinator"]
      case "hod":
        return ["student", "faculty", "coordinator"]
      case "coordinator":
        return ["student", "faculty"]
      default:
        return []
    }
  }

  // Filter calendars based on selected type, department, and search query
  const filteredCalendars = calendars.filter((calendar) => {
    const matchesType = selectedType === "all" || calendar.type === selectedType
    const matchesDepartment =
      selectedDepartment === "all" || calendar.department === "all" || calendar.department === selectedDepartment
    const matchesSearch =
      calendar.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      calendar.description.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesType && matchesDepartment && matchesSearch
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Calendar Events</h2>
        <p className="text-muted-foreground">View and manage academic calendars and events</p>
      </div>

      <div className="grid gap-6">
        <Card className="w-full">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>Department Calendars</CardTitle>
                <CardDescription>View and download department calendars</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {user && ["admin", "hod", "coordinator"].includes(user.role) && (
                  <Button onClick={() => setIsUploadDialogOpen(true)} className="gap-1">
                    <Upload className="h-4 w-4" />
                    <span>Upload Calendar</span>
                  </Button>
                )}
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map(
                      (dept) =>
                        dept.value !== "all" && (
                          <SelectItem key={dept.value} value={dept.value}>
                            {dept.label}
                          </SelectItem>
                        ),
                    )}
                  </SelectContent>
                </Select>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search calendars..."
                    className="pl-8 w-[200px] sm:w-[300px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" value={selectedType} onValueChange={setSelectedType}>
              <TabsList>
                <TabsTrigger value="all">All Calendars</TabsTrigger>
                <TabsTrigger value="academic">Academic</TabsTrigger>
                <TabsTrigger value="exams">Exams</TabsTrigger>
                <TabsTrigger value="events">Events</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-6">
                <div className="grid gap-6">
                  {filteredCalendars.length > 0 ? (
                    filteredCalendars.map((calendar) => <CalendarCard key={calendar.id} calendar={calendar} />)
                  ) : (
                    <div className="text-center py-10">
                      <Calendar className="mx-auto h-10 w-10 text-muted-foreground" />
                      <h3 className="mt-4 text-lg font-semibold">No calendars found</h3>
                      <p className="mt-2 text-sm text-muted-foreground">Try changing your filters or search query.</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="academic" className="mt-6">
                <div className="grid gap-6">
                  {filteredCalendars.length > 0 ? (
                    filteredCalendars.map((calendar) => <CalendarCard key={calendar.id} calendar={calendar} />)
                  ) : (
                    <div className="text-center py-10">
                      <Calendar className="mx-auto h-10 w-10 text-muted-foreground" />
                      <h3 className="mt-4 text-lg font-semibold">No academic calendars found</h3>
                      <p className="mt-2 text-sm text-muted-foreground">Try changing your filters or search query.</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="exams" className="mt-6">
                <div className="grid gap-6">
                  {filteredCalendars.length > 0 ? (
                    filteredCalendars.map((calendar) => <CalendarCard key={calendar.id} calendar={calendar} />)
                  ) : (
                    <div className="text-center py-10">
                      <Calendar className="mx-auto h-10 w-10 text-muted-foreground" />
                      <h3 className="mt-4 text-lg font-semibold">No exam calendars found</h3>
                      <p className="mt-2 text-sm text-muted-foreground">Try changing your filters or search query.</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="events" className="mt-6">
                <div className="grid gap-6">
                  {filteredCalendars.length > 0 ? (
                    filteredCalendars.map((calendar) => <CalendarCard key={calendar.id} calendar={calendar} />)
                  ) : (
                    <div className="text-center py-10">
                      <Calendar className="mx-auto h-10 w-10 text-muted-foreground" />
                      <h3 className="mt-4 text-lg font-semibold">No event calendars found</h3>
                      <p className="mt-2 text-sm text-muted-foreground">Try changing your filters or search query.</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Upload Calendar Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Upload New Calendar</DialogTitle>
            <DialogDescription>
              Upload PDF files for academic calendars, exam schedules, or event timetables
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">
                Calendar Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                placeholder="e.g., Academic Calendar 2025"
                value={calendarData.title}
                onChange={(e) => setCalendarData({ ...calendarData, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of this calendar"
                value={calendarData.description}
                onChange={(e) => setCalendarData({ ...calendarData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">
                Calendar Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={calendarData.type}
                onValueChange={(value) => setCalendarData({ ...calendarData, type: value })}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="academic">Academic Calendar</SelectItem>
                  <SelectItem value="exams">Exam Schedule</SelectItem>
                  <SelectItem value="timetable">Class Timetable</SelectItem>
                  <SelectItem value="events">Events Calendar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Department selection (only for admin) */}
            {user?.role === "admin" && (
              <div className="space-y-2">
                <Label htmlFor="department">
                  Department <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={calendarData.department}
                  onValueChange={(value) => setCalendarData({ ...calendarData, department: value })}
                >
                  <SelectTrigger id="department">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.value} value={dept.value}>
                        {dept.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Target Roles */}
            <div className="space-y-2">
              <Label>
                Target Roles <span className="text-red-500">*</span>
              </Label>
              <div className="flex flex-wrap gap-2">
                {getAvailableRoles().map((role) => (
                  <Badge
                    key={role}
                    variant={calendarData.targetRoles.includes(role) ? "default" : "outline"}
                    className="cursor-pointer capitalize"
                    onClick={() => handleRoleSelection(role)}
                  >
                    {role}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>
                Upload PDF File <span className="text-red-500">*</span>
              </Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/50 transition-colors cursor-pointer">
                <input type="file" id="file-upload" className="hidden" accept=".pdf" onChange={handleFileChange} />
                <label htmlFor="file-upload" className="cursor-pointer">
                  {!isFileUploaded ? (
                    <div className="space-y-2">
                      <div className="flex justify-center">
                        <FileUp className="h-10 w-10 text-muted-foreground" />
                      </div>
                      <p className="text-sm font-medium">Drag and drop or click to upload</p>
                      <p className="text-xs text-muted-foreground">PDF files only (max 10MB)</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex justify-center">
                        <FileText className="h-10 w-10 text-blue-500" />
                      </div>
                      <p className="text-sm font-medium">{selectedFile?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {selectedFile && (selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {isFileUploaded && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">{selectedFile?.name}</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedFile(null)
                    setIsFileUploaded(false)
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)} disabled={isUploading}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={!isFileUploaded || isUploading}>
              {isUploading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Calendar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function CalendarCard({ calendar }) {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="p-6">
        <div className="flex flex-col sm:flex-row justify-between">
          <div>
            <h3 className="text-lg font-semibold">{calendar.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{calendar.description}</p>
          </div>
          <Badge
            variant="outline"
            className={
              calendar.department === "all"
                ? "self-start sm:self-center mt-2 sm:mt-0 bg-primary/10"
                : "self-start sm:self-center mt-2 sm:mt-0"
            }
          >
            {calendar.department === "all" ? "All Departments" : calendar.department}
          </Badge>
        </div>

        <div className="flex items-center mt-4 text-sm text-muted-foreground">
          <Calendar className="mr-2 h-4 w-4" />
          <span>{calendar.dateRange}</span>
        </div>

        <div className="flex items-center mt-2 text-sm text-muted-foreground">
          <Clock className="mr-2 h-4 w-4" />
          <span>Uploaded on {calendar.uploadDate}</span>
        </div>

        <div className="flex items-center mt-4 gap-2">
          <Button variant="outline" size="sm" className="gap-1">
            <Calendar className="h-4 w-4" />
            <span>View</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-1">
            <Download className="h-4 w-4" />
            <span>Download</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
