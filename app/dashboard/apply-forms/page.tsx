"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useToast } from "@/hooks/use-toast"
import { CalendarIcon, Plus, X } from "lucide-react"
import { format, addDays, differenceInDays, isWeekend } from "date-fns"
import { getActiveRole } from "@/lib/role-switcher"
import { apiService } from "@/lib/supabase-service"
import type { LeaveBalance, LeaveType } from "@/lib/database-schema"

// Types
type Faculty = { id: string; name: string; department: string }
type LeaveApplication = {
  id: string
  startDate: Date
  endDate: Date
  days: number
  reason: string
  type: LeaveType
  replacementFaculty: string[]
  sendTo: "hod" | "principal" | "both"
  status: "pending" | "approved" | "rejected"
  comments?: string
  createdAt: Date
}
type CommonLetterApplication = {
  id: string
  subject: string
  message: string
  sendTo: "hod" | "principal" | "both"
  status: "pending" | "approved" | "rejected"
  comments?: string
  createdAt: Date
}

export default function ApplyFormsPage() {
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [activeRole, setActiveRole] = useState<string | null>(null)
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance>({
    CL: 10,
    RH: 5,
    OOD: 15,
    CO: 5,
    SL: 10,
    LWP: 10,
    EL: 30,
  })
  const [startDate, setStartDate] = useState<Date | undefined>(new Date())
  const [endDate, setEndDate] = useState<Date | undefined>(new Date())
  const [leaveType, setLeaveType] = useState<LeaveType>("CL")
  const [reason, setReason] = useState("")
  const [isHalfDay, setIsHalfDay] = useState(false)
  const [sendTo, setSendTo] = useState<"hod" | "principal" | "both">("hod")
  const [selectedFaculty, setSelectedFaculty] = useState<string[]>([])
  const [openFacultySelect, setOpenFacultySelect] = useState(false)
  const [letterSubject, setLetterSubject] = useState("")
  const [letterMessage, setLetterMessage] = useState("")
  const [letterSendTo, setLetterSendTo] = useState<"hod" | "principal" | "both">("hod")
  const [applications, setApplications] = useState<(LeaveApplication | CommonLetterApplication)[]>([])
  const [isLoaded, setIsLoaded] = useState(false) // New state for loading

  // Mock faculty data
  const facultyList: Faculty[] = [
    { id: "fac1", name: "Dr. Rajesh Kumar", department: "Computer Science" },
    { id: "fac2", name: "Prof. Priya Sharma", department: "Computer Science" },
    { id: "fac3", name: "Dr. Amit Patel", department: "Computer Science" },
    { id: "fac4", name: "Prof. Sneha Verma", department: "Computer Science" },
    { id: "fac5", name: "Dr. Vikram Singh", department: "Computer Science" },
    { id: "fac6", name: "Prof. Ananya Gupta", department: "Information Science" },
    { id: "fac7", name: "Dr. Rahul Mehta", department: "Electronics" },
    { id: "fac8", name: "Prof. Neha Reddy", department: "Mechanical" },
  ]

  // Load user data and active role
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser)
      setUser(parsedUser)
      setActiveRole(getActiveRole(parsedUser))
    }
    setIsLoaded(true) // Set to true once user data is processed

    // Load applications from localStorage
    const storedApplications = localStorage.getItem("applications")
    if (storedApplications) {
      setApplications(JSON.parse(storedApplications))
    }

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

  // Fetch leave allocations from database
  useEffect(() => {
    const fetchLeaveAllocations = async () => {
      try {
        const allocations = await apiService.leaveAllocations.getLeaveBalances()
        setLeaveBalance(allocations)
      } catch (error) {
        console.error("Error fetching leave allocations:", error)
        // Keep default values if fetch fails
        toast({
          title: "Warning",
          description: "Could not load current leave allocations. Using default values.",
          variant: "destructive",
        })
      }
    }

    fetchLeaveAllocations()
  }, [])

  // Calculate number of days between start and end date
  const calculateDays = () => {
    if (!startDate || !endDate) return 0

    // Calculate the difference in days
    const days = differenceInDays(endDate, startDate) + 1

    // Adjust for half day if selected
    return isHalfDay ? days - 0.5 : days
  }

  // Calculate working days (excluding weekends)
  const calculateWorkingDays = () => {
    if (!startDate || !endDate) return 0

    let workingDays = 0
    let currentDate = new Date(startDate)

    while (currentDate <= endDate) {
      if (!isWeekend(currentDate)) {
        workingDays++
      }
      currentDate = addDays(currentDate, 1)
    }

    // Adjust for half day if selected
    return isHalfDay ? workingDays - 0.5 : workingDays
  }

  // Check if leave balance is sufficient
  const isLeaveBalanceSufficient = () => {
    const requiredDays = calculateWorkingDays()
    return leaveBalance[leaveType] >= requiredDays
  }

  // Handle leave application submission
  const handleLeaveSubmit = () => {
    if (!startDate || !endDate) {
      toast({
        title: "Error",
        description: "Please select start and end dates.",
        variant: "destructive",
      })
      return
    }

    if (reason.trim() === "") {
      toast({
        title: "Error",
        description: "Please provide a reason for your leave.",
        variant: "destructive",
      })
      return
    }

    if (selectedFaculty.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one replacement faculty.",
        variant: "destructive",
      })
      return
    }

    if (!isLeaveBalanceSufficient()) {
      toast({
        title: "Error",
        description: `Insufficient ${leaveType} balance. You have ${leaveBalance[leaveType]} days available.`,
        variant: "destructive",
      })
      return
    }

    // Create new leave application
    const newApplication: LeaveApplication = {
      id: `leave-${Date.now()}`,
      startDate: startDate,
      endDate: endDate,
      days: calculateWorkingDays(),
      reason,
      type: leaveType,
      replacementFaculty: selectedFaculty,
      sendTo,
      status: "pending",
      createdAt: new Date(),
    }

    // Update applications list
    const updatedApplications = [...applications, newApplication]
    setApplications(updatedApplications)
    localStorage.setItem("applications", JSON.stringify(updatedApplications))

    // Update leave balance
    const updatedLeaveBalance = { ...leaveBalance }
    updatedLeaveBalance[leaveType] -= calculateWorkingDays()
    setLeaveBalance(updatedLeaveBalance)
    localStorage.setItem("leave-balance", JSON.stringify(updatedLeaveBalance))

    // Reset form
    setStartDate(new Date())
    setEndDate(new Date())
    setLeaveType("CL")
    setReason("")
    setIsHalfDay(false)
    setSendTo("hod")
    setSelectedFaculty([])

    toast({
      title: "Success",
      description: "Leave application submitted successfully.",
    })
  }

  // Handle common letter submission
  const handleLetterSubmit = () => {
    if (letterSubject.trim() === "") {
      toast({
        title: "Error",
        description: "Please provide a subject for your letter.",
        variant: "destructive",
      })
      return
    }

    if (letterMessage.trim() === "") {
      toast({
        title: "Error",
        description: "Please provide a message for your letter.",
        variant: "destructive",
      })
      return
    }

    // Create new common letter application
    const newApplication: CommonLetterApplication = {
      id: `letter-${Date.now()}`,
      subject: letterSubject,
      message: letterMessage,
      sendTo: letterSendTo,
      status: "pending",
      createdAt: new Date(),
    }

    // Update applications list
    const updatedApplications = [...applications, newApplication]
    setApplications(updatedApplications)
    localStorage.setItem("applications", JSON.stringify(updatedApplications))

    // Reset form
    setLetterSubject("")
    setLetterMessage("")
    setLetterSendTo("hod")

    toast({
      title: "Success",
      description: "Common letter submitted successfully.",
    })
  }

  // Toggle faculty selection
  const toggleFacultySelection = (facultyId: string) => {
    if (selectedFaculty.includes(facultyId)) {
      setSelectedFaculty(selectedFaculty.filter((id) => id !== facultyId))
    } else {
      setSelectedFaculty([...selectedFaculty, facultyId])
    }
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
        <span className="ml-2">Loading permissions...</span>
      </div>
    )
  }

  // Check if user has permission - allow faculty role or users in faculty view
  const hasPermission =
    user &&
    (user.role === "faculty" ||
      activeRole === "faculty" ||
      user.role === "hod" ||
      user.role === "coordinator" ||
      user.role === "admin" ||
      user.role === "principal")

  if (!hasPermission) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Apply Forms</h1>
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Apply Forms</h1>
        <p className="text-muted-foreground">Submit leave applications and common letters.</p>
      </div>

      <Tabs defaultValue="leave" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="leave">Leave Application</TabsTrigger>
          <TabsTrigger value="letter">Common Letter</TabsTrigger>
        </TabsList>

        {/* Leave Application Tab */}
        <TabsContent value="leave">
          <Card>
            <CardHeader>
              <CardTitle>Apply for Leave</CardTitle>
              <CardDescription>Submit a leave application for approval.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Leave Balance Display */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                  <div className="text-sm font-medium text-muted-foreground">Casual Leave (CL)</div>
                  <div className="text-2xl font-bold">{leaveBalance.CL}</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                  <div className="text-sm font-medium text-muted-foreground">Earned Leave (EL)</div>
                  <div className="text-2xl font-bold">{leaveBalance.EL}</div>
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
                  <div className="text-sm font-medium text-muted-foreground">Leave Without Pay (LWP)</div>
                  <div className="text-2xl font-bold">{leaveBalance.LWP}</div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                  <div className="text-sm font-medium text-muted-foreground">Other Leaves</div>
                  <div className="text-2xl font-bold">
                    {leaveBalance.RH + leaveBalance.OOD + leaveBalance.CO + leaveBalance.SL}
                  </div>
                </div>
              </div>

              {/* Leave Type */}
              <div className="space-y-2">
                <Label htmlFor="leaveType">Leave Type</Label>
                <Select value={leaveType} onValueChange={(value) => setLeaveType(value as LeaveType)}>
                  <SelectTrigger id="leaveType">
                    <SelectValue placeholder="Select leave type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CL" disabled={leaveBalance.CL <= 0}>
                      Casual Leave (CL) - {leaveBalance.CL} days left
                    </SelectItem>
                    <SelectItem value="RH" disabled={leaveBalance.RH <= 0}>
                      Restricted Holiday (RH) - {leaveBalance.RH} days left
                    </SelectItem>
                    <SelectItem value="OOD" disabled={leaveBalance.OOD <= 0}>
                      On Official Duty (OOD) - {leaveBalance.OOD} days left
                    </SelectItem>
                    <SelectItem value="CO" disabled={leaveBalance.CO <= 0}>
                      Compensatory Off (CO) - {leaveBalance.CO} days left
                    </SelectItem>
                    <SelectItem value="SL" disabled={leaveBalance.SL <= 0}>
                      Sick Leave (SL) - {leaveBalance.SL} days left
                    </SelectItem>
                    <SelectItem value="LWP" disabled={leaveBalance.LWP <= 0}>
                      Leave Without Pay (LWP) - {leaveBalance.LWP} days left
                    </SelectItem>
                    <SelectItem value="EL" disabled={leaveBalance.EL <= 0}>
                      Earned Leave (EL) - {leaveBalance.EL} days left
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="startDate"
                        variant="outline"
                        className="w-full justify-start text-left font-normal bg-transparent"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="endDate"
                        variant="outline"
                        className="w-full justify-start text-left font-normal bg-transparent"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Number of Days */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Number of Days</Label>
                  <div className="flex items-center gap-2">
                    <div className="bg-muted p-2 rounded-md text-center w-full">
                      <span className="font-medium">{calculateDays()} day(s)</span>
                      <span className="text-xs block text-muted-foreground">
                        {calculateWorkingDays()} working day(s)
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="halfDay"
                    checked={isHalfDay}
                    onCheckedChange={(checked) => setIsHalfDay(checked === true)}
                  />
                  <Label htmlFor="halfDay" className="cursor-pointer">
                    Half-day leave
                  </Label>
                </div>
              </div>

              {/* Reason for Leave */}
              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Leave</Label>
                <Textarea
                  id="reason"
                  placeholder="Please provide a detailed reason for your leave request"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Replacement Faculty */}
              <div className="space-y-2">
                <Label>Replacement Faculty</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedFaculty.map((facId) => {
                    const faculty = facultyList.find((f) => f.id === facId)
                    return (
                      <div key={facId} className="flex items-center bg-muted px-3 py-1 rounded-full text-sm">
                        {faculty?.name}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 ml-1 text-muted-foreground hover:text-foreground"
                          onClick={() => toggleFacultySelection(facId)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    )
                  })}
                </div>
                <Popover open={openFacultySelect} onOpenChange={setOpenFacultySelect}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-between bg-transparent">
                      <span>Select Replacement Faculty</span>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <div className="max-h-[200px] overflow-y-auto p-2">
                      {facultyList
                        .filter((faculty) => faculty.id !== user?.id) // Filter out current user
                        .map((faculty) => (
                          <div
                            key={faculty.id}
                            className="flex items-center space-x-2 p-2 hover:bg-muted rounded-md cursor-pointer"
                            onClick={() => toggleFacultySelection(faculty.id)}
                          >
                            <Checkbox
                              checked={selectedFaculty.includes(faculty.id)}
                              onCheckedChange={() => {}}
                              id={`faculty-${faculty.id}`}
                            />
                            <Label htmlFor={`faculty-${faculty.id}`} className="flex-1 cursor-pointer">
                              <div>{faculty.name}</div>
                              <div className="text-xs text-muted-foreground">{faculty.department}</div>
                            </Label>
                          </div>
                        ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Send To */}
              <div className="space-y-2">
                <Label htmlFor="sendTo">Send Application To</Label>
                <Select value={sendTo} onValueChange={(value) => setSendTo(value as "hod" | "principal" | "both")}>
                  <SelectTrigger id="sendTo">
                    <SelectValue placeholder="Select recipient" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hod">HOD</SelectItem>
                    <SelectItem value="principal">Principal</SelectItem>
                    <SelectItem value="both">Both HOD & Principal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Submit Button */}
              <Button className="w-full" onClick={handleLeaveSubmit} disabled={!isLeaveBalanceSufficient()}>
                Submit Leave Application
              </Button>
              {!isLeaveBalanceSufficient() && (
                <p className="text-sm text-destructive">
                  Insufficient leave balance. You need {calculateWorkingDays()} days but only have{" "}
                  {leaveBalance[leaveType]} {leaveType} days available.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Common Letter Tab */}
        <TabsContent value="letter">
          <Card>
            <CardHeader>
              <CardTitle>Common Letter</CardTitle>
              <CardDescription>Submit a common letter for approval.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Subject */}
              <div className="space-y-2">
                <Label htmlFor="subject">Subject (Regarding)</Label>
                <Input
                  id="subject"
                  placeholder="Enter the subject of your letter"
                  value={letterSubject}
                  onChange={(e) => setLetterSubject(e.target.value)}
                />
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Label htmlFor="message">Brief Explanation/Message</Label>
                <Textarea
                  id="message"
                  placeholder="Please provide a detailed explanation"
                  value={letterMessage}
                  onChange={(e) => setLetterMessage(e.target.value)}
                  rows={6}
                />
              </div>

              {/* Send To */}
              <div className="space-y-2">
                <Label htmlFor="letterSendTo">Send Letter To</Label>
                <Select
                  value={letterSendTo}
                  onValueChange={(value) => setLetterSendTo(value as "hod" | "principal" | "both")}
                >
                  <SelectTrigger id="letterSendTo">
                    <SelectValue placeholder="Select recipient" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hod">HOD</SelectItem>
                    <SelectItem value="principal">Principal</SelectItem>
                    <SelectItem value="both">Both HOD & Principal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Submit Button */}
              <Button className="w-full" onClick={handleLetterSubmit}>
                Submit Common Letter
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
