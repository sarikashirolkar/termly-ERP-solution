"use client"
import { useState, useEffect } from "react"
import { Calendar, Clock, MapPin, Search, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

interface Proctee {
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

interface Meeting {
  id: string
  title: string
  description: string
  meeting_date: string
  meeting_time: string
  location: string
  agenda: string
  created_at: string
}

export default function ProctoringPage() {
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [proctees, setProctees] = useState<Proctee[]>([])
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("students")

  // Meeting form state
  const [meetingForm, setMeetingForm] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    agenda: "",
  })

  // Load user data and fetch proctees
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      const userData = JSON.parse(storedUser)
      setUser(userData)

      if (userData.id) {
        fetchProctees(userData.id)
        fetchMeetings(userData.id)
      }
    }
  }, [])

  // Fetch proctees assigned to this faculty
  const fetchProctees = async (proctorId: string) => {
    try {
      const response = await fetch(`/api/proctoring/my-proctees?proctorId=${proctorId}`)
      const result = await response.json()

      if (result.success) {
        setProctees(result.data)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch proctees",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching proctees:", error)
      toast({
        title: "Error",
        description: "Failed to fetch proctees",
        variant: "destructive",
      })
    }
  }

  // Fetch meetings scheduled by this proctor
  const fetchMeetings = async (proctorId: string) => {
    try {
      const response = await fetch(`/api/proctoring/meetings?proctorId=${proctorId}`)
      const result = await response.json()

      if (result.success) {
        setMeetings(result.data)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch meetings",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching meetings:", error)
      toast({
        title: "Error",
        description: "Failed to fetch meetings",
        variant: "destructive",
      })
    }
  }

  // Filter proctees based on search term
  const filteredProctees = proctees.filter(
    (proctee) =>
      proctee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proctee.usn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proctee.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Handle student selection for meeting
  const handleStudentSelection = (studentId: string) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId],
    )
  }

  // Handle select all students
  const handleSelectAllStudents = () => {
    if (selectedStudents.length === filteredProctees.length) {
      setSelectedStudents([])
    } else {
      setSelectedStudents(filteredProctees.map((proctee) => proctee.id))
    }
  }

  // Handle schedule meeting
  const handleScheduleMeeting = async () => {
    if (!meetingForm.title || !meetingForm.date || !meetingForm.time) {
      toast({
        title: "Missing required fields",
        description: "Please fill in title, date, and time.",
        variant: "destructive",
      })
      return
    }

    if (selectedStudents.length === 0) {
      toast({
        title: "No students selected",
        description: "Please select at least one student for the meeting.",
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
      const response = await fetch("/api/proctoring/meetings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          proctorId: user.id,
          title: meetingForm.title,
          description: meetingForm.description,
          date: meetingForm.date,
          time: meetingForm.time,
          location: meetingForm.location,
          agenda: meetingForm.agenda,
          studentIds: selectedStudents,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Meeting scheduled successfully",
          description: result.message,
        })

        // Reset form and selections
        setMeetingForm({
          title: "",
          description: "",
          date: "",
          time: "",
          location: "",
          agenda: "",
        })
        setSelectedStudents([])
        setShowScheduleDialog(false)

        // Refresh meetings
        fetchMeetings(user.id)
      } else {
        toast({
          title: "Failed to schedule meeting",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error scheduling meeting:", error)
      toast({
        title: "Failed to schedule meeting",
        description: "An error occurred while scheduling the meeting.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Format time for display
  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Proctees</h1>
          <p className="text-muted-foreground">Manage and view details of your assigned proctees</p>
        </div>
        <Button onClick={() => setShowScheduleDialog(true)} disabled={proctees.length === 0}>
          <Plus className="mr-2 h-4 w-4" />
          Schedule Meeting
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="students">
            Students
            {proctees.length > 0 && <Badge className="ml-2">{proctees.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="meetings">
            Meetings
            {meetings.length > 0 && <Badge className="ml-2">{meetings.length}</Badge>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Proctee Details</CardTitle>
              <CardDescription>
                View and manage details of your assigned proctees from {user?.department} department
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student ID</TableHead>
                        <TableHead>Student Name</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Branch</TableHead>
                        <TableHead>Semester</TableHead>
                        <TableHead>Attendance</TableHead>
                        <TableHead>Marks</TableHead>
                        <TableHead>CGPA</TableHead>
                        <TableHead>Parent Name</TableHead>
                        <TableHead>Parent Phone</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProctees.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={10} className="text-center h-24 text-muted-foreground">
                            {proctees.length === 0 ? "No proctees assigned" : "No students match your search"}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredProctees.map((proctee) => (
                          <TableRow key={proctee.id}>
                            <TableCell>{proctee.usn}</TableCell>
                            <TableCell>{proctee.name}</TableCell>
                            <TableCell>B.Tech</TableCell>
                            <TableCell>{proctee.department}</TableCell>
                            <TableCell>{proctee.semester}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-green-50 text-green-700">
                                85%
                              </Badge>
                            </TableCell>
                            <TableCell>78</TableCell>
                            <TableCell>{proctee.cgpa || "N/A"}</TableCell>
                            <TableCell>{proctee.parentName || "N/A"}</TableCell>
                            <TableCell>{proctee.parentPhone || "N/A"}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="meetings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Meetings</CardTitle>
              <CardDescription>View your scheduled proctoring meetings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {meetings.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>No meetings scheduled</p>
                    <p className="text-sm">Schedule a meeting with your proctees to get started</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {meetings.map((meeting) => (
                      <Card key={meeting.id} className="border-l-4 border-l-blue-500">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg">{meeting.title}</CardTitle>
                              {meeting.description && (
                                <CardDescription className="mt-1">{meeting.description}</CardDescription>
                              )}
                            </div>
                            <Badge variant="outline">Scheduled</Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>{formatDate(meeting.meeting_date)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>{formatTime(meeting.meeting_time)}</span>
                            </div>
                            {meeting.location && (
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span>{meeting.location}</span>
                              </div>
                            )}
                          </div>
                          {meeting.agenda && (
                            <div className="mt-3 p-3 bg-muted rounded-md">
                              <p className="text-sm font-medium mb-1">Agenda:</p>
                              <p className="text-sm text-muted-foreground">{meeting.agenda}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Schedule Meeting Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Schedule Proctoring Meeting</DialogTitle>
            <DialogDescription>
              Set up a meeting with your selected proctees. Fill in the details below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="meeting-title">Title *</Label>
                <Input
                  id="meeting-title"
                  value={meetingForm.title}
                  onChange={(e) => setMeetingForm({ ...meetingForm, title: e.target.value })}
                  placeholder="Meeting title"
                />
              </div>
              <div>
                <Label htmlFor="meeting-date">Date *</Label>
                <Input
                  id="meeting-date"
                  type="date"
                  value={meetingForm.date}
                  onChange={(e) => setMeetingForm({ ...meetingForm, date: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="meeting-time">Time *</Label>
                <Input
                  id="meeting-time"
                  type="time"
                  value={meetingForm.time}
                  onChange={(e) => setMeetingForm({ ...meetingForm, time: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="meeting-location">Location</Label>
                <Input
                  id="meeting-location"
                  value={meetingForm.location}
                  onChange={(e) => setMeetingForm({ ...meetingForm, location: e.target.value })}
                  placeholder="Room number or online link"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="meeting-description">Description</Label>
              <Input
                id="meeting-description"
                value={meetingForm.description}
                onChange={(e) => setMeetingForm({ ...meetingForm, description: e.target.value })}
                placeholder="Brief description of the meeting"
              />
            </div>
            <div>
              <Label htmlFor="meeting-agenda">Agenda</Label>
              <Textarea
                id="meeting-agenda"
                value={meetingForm.agenda}
                onChange={(e) => setMeetingForm({ ...meetingForm, agenda: e.target.value })}
                placeholder="Describe the purpose of the meeting"
                rows={3}
              />
            </div>
            <div>
              <Label>Students *</Label>
              <div className="mt-2 space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="select-all"
                    checked={selectedStudents.length === filteredProctees.length && filteredProctees.length > 0}
                    onChange={handleSelectAllStudents}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="select-all" className="text-sm font-medium">
                    Select All ({filteredProctees.length} students)
                  </Label>
                </div>
                <div className="max-h-32 overflow-y-auto border rounded-md p-2 space-y-1">
                  {filteredProctees.map((proctee) => (
                    <div key={proctee.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`student-${proctee.id}`}
                        checked={selectedStudents.includes(proctee.id)}
                        onChange={() => handleStudentSelection(proctee.id)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor={`student-${proctee.id}`} className="text-sm">
                        {proctee.name} ({proctee.usn})
                      </Label>
                    </div>
                  ))}
                </div>
                {selectedStudents.length > 0 && (
                  <p className="text-sm text-muted-foreground">{selectedStudents.length} students selected</p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleScheduleMeeting} disabled={loading}>
              {loading ? "Scheduling..." : "Schedule Meeting"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
