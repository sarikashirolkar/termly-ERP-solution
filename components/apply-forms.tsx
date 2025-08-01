"use client"

import type React from "react"

import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"

// Types
type LeaveType = "CL" | "RH" | "OOD" | "CO" | "SL" | "LWP" | "EL"

export default function ApplyForms() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("leave")
  const [user, setUser] = useState<any>(null)

  // Leave application form state
  const [leaveForm, setLeaveForm] = useState({
    leaveType: "CL" as LeaveType,
    startDate: new Date(),
    endDate: new Date(),
    days: 1,
    halfDay: false,
    reason: "",
    replacementFaculty: [] as string[],
    sendTo: "hod" as "hod" | "principal" | "both",
  })

  // Common letter form state
  const [letterForm, setLetterForm] = useState({
    subject: "",
    message: "",
    recipients: ["proctor"] as ("proctor" | "hod" | "principal")[],
  })

  // Faculty list for replacement selection
  const facultyList = [
    { id: "fac1", name: "Rajesh Kumar", department: "CSE" },
    { id: "fac2", name: "Priya Sharma", department: "CSE" },
    { id: "fac3", name: "Amit Patel", department: "CSE(AIML)" },
    { id: "fac4", name: "Sneha Verma", department: "CSE(DS)" },
    { id: "fac5", name: "Vikram Singh", department: "ISE" },
    { id: "fac6", name: "Anjali Reddy", department: "ECE" },
  ]

  // Get user from localStorage
  useState(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  })

  // Calculate days between dates
  const calculateDays = (start: Date, end: Date, isHalfDay: boolean) => {
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    return isHalfDay ? diffDays - 0.5 : diffDays
  }

  // Handle leave form submission
  const handleLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to submit a leave application.",
        variant: "destructive",
      })
      return
    }

    if (!leaveForm.reason) {
      toast({
        title: "Error",
        description: "Please provide a reason for your leave.",
        variant: "destructive",
      })
      return
    }

    // Create leave application object
    const leaveApplication = {
      id: `leave${Date.now()}`,
      startDate: leaveForm.startDate,
      endDate: leaveForm.endDate,
      days: leaveForm.days,
      reason: leaveForm.reason,
      type: leaveForm.leaveType,
      replacementFaculty: leaveForm.replacementFaculty,
      sendTo: leaveForm.sendTo,
      status: "pending",
      createdAt: new Date(),
      applicantId: user.id || "unknown",
      applicantName: `${user.firstName} ${user.lastName}` || "Unknown User",
      applicantDepartment: user.department || "Unknown Department",
    }

    // Get existing applications or initialize empty array
    const storedApplications = localStorage.getItem("applications")
    let applications = []

    if (storedApplications) {
      try {
        applications = JSON.parse(storedApplications)
      } catch (error) {
        console.error("Error parsing stored applications:", error)
      }
    }

    // Add new application to array
    applications.push(leaveApplication)

    // Save to localStorage
    localStorage.setItem("applications", JSON.stringify(applications))

    // Show success message
    toast({
      title: "Leave Application Submitted",
      description: "Your leave application has been submitted successfully.",
    })

    // Reset form
    setLeaveForm({
      leaveType: "CL",
      startDate: new Date(),
      endDate: new Date(),
      days: 1,
      halfDay: false,
      reason: "",
      replacementFaculty: [],
      sendTo: "hod",
    })
  }

  // Handle common letter form submission
  const handleLetterSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to submit a common letter.",
        variant: "destructive",
      })
      return
    }

    if (!letterForm.subject || !letterForm.message) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    if (letterForm.recipients.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one recipient.",
        variant: "destructive",
      })
      return
    }

    // Create common letter object
    const commonLetter = {
      id: `letter${Date.now()}`,
      subject: letterForm.subject,
      message: letterForm.message,
      recipients: letterForm.recipients,
      status: "pending",
      createdAt: new Date(),
      currentApprover: "proctor", // Always starts with proctor
      approvalFlow: {
        proctor: {
          status: "pending",
        },
        ...(letterForm.recipients.includes("hod") ? { hod: { status: "pending" } } : {}),
        ...(letterForm.recipients.includes("principal") ? { principal: { status: "pending" } } : {}),
      },
    }

    // Add student/faculty specific fields
    if (user.role === "student") {
      Object.assign(commonLetter, {
        studentId: user.id || "unknown",
        studentName: `${user.firstName} ${user.lastName}` || "Unknown Student",
        studentDepartment: user.department || "Unknown Department",
        studentSemester: user.semester || 1,
      })
    } else {
      Object.assign(commonLetter, {
        applicantId: user.id || "unknown",
        applicantName: `${user.firstName} ${user.lastName}` || "Unknown User",
        applicantDepartment: user.department || "Unknown Department",
      })
    }

    // Get existing letters or initialize empty array
    const storedLetters = localStorage.getItem("student-common-letters")
    let letters = []

    if (storedLetters) {
      try {
        letters = JSON.parse(storedLetters)
      } catch (error) {
        console.error("Error parsing stored letters:", error)
      }
    }

    // Add new letter to array
    letters.push(commonLetter)

    // Save to localStorage
    localStorage.setItem("student-common-letters", JSON.stringify(letters))

    // Show success message
    toast({
      title: "Common Letter Submitted",
      description: "Your letter has been submitted successfully and sent to the selected recipients.",
    })

    // Reset form
    setLetterForm({
      subject: "",
      message: "",
      recipients: ["proctor"],
    })
  }

  // Handle leave type change
  const handleLeaveTypeChange = (value: string) => {
    setLeaveForm({
      ...leaveForm,
      leaveType: value as LeaveType,
    })
  }

  // Handle date changes
  const handleStartDateChange = (date: Date | undefined) => {
    if (!date) return

    const newEndDate = leaveForm.endDate < date ? date : leaveForm.endDate
    const days = calculateDays(date, newEndDate, leaveForm.halfDay)

    setLeaveForm({
      ...leaveForm,
      startDate: date,
      endDate: newEndDate,
      days,
    })
  }

  const handleEndDateChange = (date: Date | undefined) => {
    if (!date) return

    const newStartDate = leaveForm.startDate > date ? date : leaveForm.startDate
    const days = calculateDays(newStartDate, date, leaveForm.halfDay)

    setLeaveForm({
      ...leaveForm,
      startDate: newStartDate,
      endDate: date,
      days,
    })
  }

  // Handle half day toggle
  const handleHalfDayChange = (checked: boolean) => {
    const days = calculateDays(leaveForm.startDate, leaveForm.endDate, checked)

    setLeaveForm({
      ...leaveForm,
      halfDay: checked,
      days,
    })
  }

  // Handle replacement faculty selection
  const handleReplacementChange = (facultyId: string, checked: boolean) => {
    if (checked) {
      setLeaveForm({
        ...leaveForm,
        replacementFaculty: [...leaveForm.replacementFaculty, facultyId],
      })
    } else {
      setLeaveForm({
        ...leaveForm,
        replacementFaculty: leaveForm.replacementFaculty.filter((id) => id !== facultyId),
      })
    }
  }

  // Handle recipient selection for common letter
  const handleRecipientChange = (recipient: "proctor" | "hod" | "principal", checked: boolean) => {
    if (checked) {
      setLetterForm({
        ...letterForm,
        recipients: [...letterForm.recipients, recipient],
      })
    } else {
      // Don't allow removing proctor
      if (recipient === "proctor") return

      setLetterForm({
        ...letterForm,
        recipients: letterForm.recipients.filter((r) => r !== recipient),
      })
    }
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="leave">Leave Application</TabsTrigger>
          <TabsTrigger value="letter">Common Letter</TabsTrigger>
        </TabsList>

        <TabsContent value="leave" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Apply for Leave</CardTitle>
              <CardDescription>Submit a leave application for approval.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLeaveSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="leaveType">Leave Type</Label>
                    <Select value={leaveForm.leaveType} onValueChange={handleLeaveTypeChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select leave type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CL">Casual Leave (CL)</SelectItem>
                        <SelectItem value="RH">Restricted Holiday (RH)</SelectItem>
                        <SelectItem value="OOD">On Official Duty (OOD)</SelectItem>
                        <SelectItem value="CO">Compensatory Off (CO)</SelectItem>
                        <SelectItem value="SL">Sick Leave (SL)</SelectItem>
                        <SelectItem value="LWP">Leave Without Pay (LWP)</SelectItem>
                        <SelectItem value="EL">Earned Leave (EL)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {format(leaveForm.startDate, "PPP")}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={leaveForm.startDate}
                            onSelect={handleStartDateChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {format(leaveForm.endDate, "PPP")}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={leaveForm.endDate}
                            onSelect={handleEndDateChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox id="halfDay" checked={leaveForm.halfDay} onCheckedChange={handleHalfDayChange} />
                    <Label htmlFor="halfDay">Half-day leave</Label>
                  </div>

                  <div>
                    <div className="flex justify-between">
                      <Label>Number of Days</Label>
                      <span className="text-sm text-muted-foreground">{leaveForm.days} day(s)</span>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="reason">Reason for Leave</Label>
                    <Textarea
                      id="reason"
                      placeholder="Please provide a detailed reason for your leave request"
                      value={leaveForm.reason}
                      onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                      className="min-h-[100px]"
                      required
                    />
                  </div>

                  <div>
                    <Label>Replacement Faculty</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                      {facultyList.map((faculty) => (
                        <div key={faculty.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`faculty-${faculty.id}`}
                            checked={leaveForm.replacementFaculty.includes(faculty.id)}
                            onCheckedChange={(checked) => handleReplacementChange(faculty.id, !!checked)}
                          />
                          <Label htmlFor={`faculty-${faculty.id}`} className="text-sm">
                            {faculty.name} ({faculty.department})
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Send Application To</Label>
                    <Select
                      value={leaveForm.sendTo}
                      onValueChange={(value) =>
                        setLeaveForm({ ...leaveForm, sendTo: value as "hod" | "principal" | "both" })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select recipient" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hod">HOD Only</SelectItem>
                        <SelectItem value="both">HOD and Principal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button type="submit" className="w-full">
                  Submit Leave Application
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="letter" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Common Letter</CardTitle>
              <CardDescription>Submit a common letter for approval.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLetterSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="subject">Subject (Regarding)</Label>
                    <Input
                      id="subject"
                      placeholder="Enter the subject of your letter"
                      value={letterForm.subject}
                      onChange={(e) => setLetterForm({ ...letterForm, subject: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">Brief Explanation/Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Please provide a detailed explanation"
                      value={letterForm.message}
                      onChange={(e) => setLetterForm({ ...letterForm, message: e.target.value })}
                      className="min-h-[150px]"
                      required
                    />
                  </div>

                  <div>
                    <Label>Send Letter To</Label>
                    <div className="space-y-2 mt-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="recipient-proctor"
                          checked={letterForm.recipients.includes("proctor")}
                          onCheckedChange={(checked) => handleRecipientChange("proctor", !!checked)}
                          disabled
                        />
                        <Label htmlFor="recipient-proctor">Proctor (Required)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="recipient-hod"
                          checked={letterForm.recipients.includes("hod")}
                          onCheckedChange={(checked) => handleRecipientChange("hod", !!checked)}
                        />
                        <Label htmlFor="recipient-hod">HOD</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="recipient-principal"
                          checked={letterForm.recipients.includes("principal")}
                          onCheckedChange={(checked) => handleRecipientChange("principal", !!checked)}
                        />
                        <Label htmlFor="recipient-principal">Principal</Label>
                      </div>
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full">
                  Submit Common Letter
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
